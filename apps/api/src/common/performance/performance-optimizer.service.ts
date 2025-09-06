import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface PerformanceConfig {
  enableQueryOptimization: boolean
  enableResponseCompression: boolean
  enableRequestBatching: boolean
  cacheOptimization: {
    enableRedisCluster: boolean
    defaultTTL: number
    maxMemoryUsage: number
  }
  monitoring: {
    enableAPMTracing: boolean
    slowQueryThreshold: number
    responseTimeThreshold: number
  }
}

export interface OptimizationMetrics {
  queryOptimizations: number
  cacheHitRate: number
  averageResponseTime: number
  memoryUsage: number
  cpuUsage: number
  recommendations: string[]
}

@Injectable()
export class PerformanceOptimizerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PerformanceOptimizerService.name)
  private config: PerformanceConfig
  private metrics: OptimizationMetrics
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>()
  private responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly maxCacheSize = 1000
  private readonly cacheCleanupInterval = 300000 // 5 minutes
  
  private cleanupIntervalId!: NodeJS.Timeout
  private monitoringIntervalId!: NodeJS.Timeout

  constructor(private configService: ConfigService) {
    this.config = {
      enableQueryOptimization: this.configService.get('ENABLE_QUERY_OPTIMIZATION', true),
      enableResponseCompression: this.configService.get('ENABLE_RESPONSE_COMPRESSION', true),
      enableRequestBatching: this.configService.get('ENABLE_REQUEST_BATCHING', true),
      cacheOptimization: {
        enableRedisCluster: this.configService.get('ENABLE_REDIS_CLUSTER', false),
        defaultTTL: this.configService.get('CACHE_DEFAULT_TTL', 300000), // 5分钟
        maxMemoryUsage: this.configService.get('CACHE_MAX_MEMORY_MB', 512) * 1024 * 1024
      },
      monitoring: {
        enableAPMTracing: this.configService.get('ENABLE_APM_TRACING', true),
        slowQueryThreshold: this.configService.get('SLOW_QUERY_THRESHOLD_MS', 1000),
        responseTimeThreshold: this.configService.get('RESPONSE_TIME_THRESHOLD_MS', 2000)
      }
    }

    this.metrics = {
      queryOptimizations: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      recommendations: []
    }
  }

  async onModuleInit() {
    this.logger.log('Performance Optimizer initialized')
    this.startPerformanceMonitoring()
    await this.initializeCacheWarmup()
    
    // Start cache cleanup interval
    this.cleanupIntervalId = setInterval(() => {
      this.cleanupCaches()
    }, this.cacheCleanupInterval)
  }

  async onModuleDestroy() {
    this.logger.log('Cleaning up Performance Optimizer...')
    
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId)
    }
    
    if (this.monitoringIntervalId) {
      clearInterval(this.monitoringIntervalId)
    }
    
    // Clean up any batch request timers
    for (const [key, batch] of this.batchRequests.entries()) {
      if (batch.timer) {
        clearTimeout(batch.timer)
      }
    }
    this.batchRequests.clear()
    
    this.logger.log('Performance Optimizer cleanup completed')
  }

  /**
   * 查询优化器
   */
  async optimizeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options?: {
      ttl?: number
      tags?: string[]
      skipCache?: boolean
    }
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      // 检查查询缓存
      if (!options?.skipCache && this.queryCache.has(queryKey)) {
        const cached = this.queryCache.get(queryKey)!
        if (Date.now() - cached.timestamp < cached.ttl) {
          this.metrics.queryOptimizations++
          this.logger.debug(`Query cache hit: ${queryKey}`)
          return cached.result
        } else {
          this.queryCache.delete(queryKey)
        }
      }

      // 执行查询
      const result = await queryFn()
      const queryTime = Date.now() - startTime

      // 记录慢查询
      if (queryTime > this.config.monitoring.slowQueryThreshold) {
        this.logger.warn(`Slow query detected: ${queryKey} (${queryTime}ms)`)
      }

      // 缓存结果
      if (!options?.skipCache && result) {
        this.queryCache.set(queryKey, {
          result,
          timestamp: Date.now(),
          ttl: options?.ttl || this.config.cacheOptimization.defaultTTL
        })
      }

      return result
    } catch (error) {
      this.logger.error(`Query optimization failed for ${queryKey}:`, error)
      throw error
    }
  }

  /**
   * 响应缓存中间件
   */
  async optimizeResponse(
    cacheKey: string,
    responseFn: () => Promise<any>,
    ttl: number = 60000
  ): Promise<any> {
    // 检查响应缓存
    if (this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      } else {
        this.responseCache.delete(cacheKey)
      }
    }

    // 生成响应
    const data = await responseFn()
    
    // 缓存响应
    this.responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })

    return data
  }

  /**
   * 批量请求优化器
   */
  private batchRequests = new Map<string, {
    requests: Array<{ resolve: Function; reject: Function; args: any[] }>
    timer: NodeJS.Timeout
  }>()

  async batchOptimize<T>(
    batchKey: string,
    batchFn: (requests: any[]) => Promise<T[]>,
    request: any,
    batchWindow: number = 100
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 获取或创建批次
      let batch = this.batchRequests.get(batchKey)
      
      if (!batch) {
        batch = {
          requests: [],
          timer: setTimeout(async () => {
            const currentBatch = this.batchRequests.get(batchKey)!
            this.batchRequests.delete(batchKey)

            try {
              const args = currentBatch.requests.map(req => req.args)
              const results = await batchFn(args)
              
              currentBatch.requests.forEach((req, index) => {
                req.resolve(results[index])
              })
            } catch (error) {
              currentBatch.requests.forEach(req => req.reject(error))
            }
          }, batchWindow)
        }
        this.batchRequests.set(batchKey, batch)
      }

      // 添加请求到批次
      batch.requests.push({ resolve, reject, args: request })
    })
  }

  /**
   * 内存使用优化
   */
  async optimizeMemoryUsage(): Promise<void> {
    const memUsage = process.memoryUsage()
    const usedMB = memUsage.heapUsed / 1024 / 1024

    if (usedMB > this.config.cacheOptimization.maxMemoryUsage / 1024 / 1024) {
      this.logger.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`)
      
      // 清理缓存
      await this.cleanupCaches()
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc()
        this.logger.log('Forced garbage collection completed')
      }
    }

    this.metrics.memoryUsage = usedMB
  }

  /**
   * 缓存预热系统
   */
  async initializeCacheWarmup(): Promise<void> {
    this.logger.log('Starting cache warmup...')
    
    const warmupTasks = [
      this.warmupUserCache(),
      this.warmupTransactionCache(),
      this.warmupMetricsCache()
    ]

    await Promise.allSettled(warmupTasks)
    this.logger.log('Cache warmup completed')
  }

  private async warmupUserCache(): Promise<void> {
    // 预热活跃用户数据
    const activeUsersCacheKey = 'active_users_warmup'
    await this.optimizeQuery(activeUsersCacheKey, async () => {
      return { users: [], count: 0 } // Mock data for warmup
    }, { ttl: 10 * 60 * 1000 }) // 10分钟TTL
  }

  private async warmupTransactionCache(): Promise<void> {
    // 预热最近交易数据
    const recentTransactionsCacheKey = 'recent_transactions_warmup'
    await this.optimizeQuery(recentTransactionsCacheKey, async () => {
      return { transactions: [], stats: {} } // Mock data for warmup
    }, { ttl: 5 * 60 * 1000 }) // 5分钟TTL
  }

  private async warmupMetricsCache(): Promise<void> {
    // 预热系统指标数据
    const systemMetricsCacheKey = 'system_metrics_warmup'
    await this.optimizeQuery(systemMetricsCacheKey, async () => {
      return { metrics: {}, timestamp: Date.now() } // Mock data for warmup
    }, { ttl: 2 * 60 * 1000 }) // 2分钟TTL
  }

  /**
   * 性能监控和建议生成
   */
  private async startPerformanceMonitoring(): Promise<void> {
    this.monitoringIntervalId = setInterval(async () => {
      await this.collectPerformanceMetrics()
      await this.generateOptimizationRecommendations()
      await this.optimizeMemoryUsage()
    }, 60000) // 每分钟检查一次
  }

  private async collectPerformanceMetrics(): Promise<void> {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    this.metrics = {
      ...this.metrics,
      memoryUsage: memUsage.heapUsed / 1024 / 1024,
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000,
      cacheHitRate: this.calculateCacheHitRate()
    }
  }

  private async generateOptimizationRecommendations(): Promise<void> {
    const recommendations: string[] = []

    // 内存使用建议
    if (this.metrics.memoryUsage > 400) {
      recommendations.push('内存使用过高，建议增加缓存清理频率')
    }

    // 缓存命中率建议  
    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('缓存命中率较低，建议调整缓存策略')
    }

    // CPU使用建议
    if (this.metrics.cpuUsage > 80) {
      recommendations.push('CPU使用率高，建议优化计算密集型操作')
    }

    this.metrics.recommendations = recommendations
  }

  private calculateCacheHitRate(): number {
    const totalQueries = this.queryCache.size
    const validQueries = Array.from(this.queryCache.values()).filter(
      entry => Date.now() - entry.timestamp < entry.ttl
    ).length
    
    return totalQueries > 0 ? validQueries / totalQueries : 0
  }

  /**
   * 清理缓存
   */
  private async cleanupCaches(): Promise<void> {
    const now = Date.now()
    
    // 清理过期的查询缓存
    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.queryCache.delete(key)
      }
    }

    // 清理过期的响应缓存
    for (const [key, entry] of this.responseCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.responseCache.delete(key)
      }
    }

    this.logger.debug(`Cache cleanup completed. Query cache: ${this.queryCache.size}, Response cache: ${this.responseCache.size}`)
  }

  /**
   * 数据库查询优化
   */
  async optimizeDbQuery<T>(
    queryName: string,
    query: () => Promise<T>,
    optimizations?: {
      useIndex?: string[]
      selectFields?: string[]
      joinOptimization?: boolean
      pagination?: { limit: number; offset: number }
    }
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await query()
      const queryTime = Date.now() - startTime

      // 记录查询性能
      if (queryTime > this.config.monitoring.slowQueryThreshold) {
        this.logger.warn(`Slow database query: ${queryName} (${queryTime}ms)`, {
          queryName,
          queryTime,
          optimizations,
          timestamp: new Date().toISOString()
        })
      }

      return result
    } catch (error) {
      this.logger.error(`Database query optimization failed: ${queryName}`, error)
      throw error
    }
  }

  /**
   * API响应压缩
   */
  compressResponse(data: any, threshold: number = 1024): any {
    if (!this.config.enableResponseCompression) return data

    const dataSize = JSON.stringify(data).length
    
    if (dataSize > threshold) {
      // 在实际项目中，这里会使用gzip或其他压缩算法
      this.logger.debug(`Compressing response: ${dataSize} bytes → estimated ${Math.floor(dataSize * 0.6)} bytes`)
      
      return {
        compressed: true,
        originalSize: dataSize,
        data: data // 实际实现中这里会是压缩后的数据
      }
    }

    return data
  }

  /**
   * 请求预热
   */
  async preloadCriticalData(): Promise<void> {
    this.logger.log('Starting critical data preload...')
    
    const preloadTasks = [
      this.preloadDashboardData(),
      this.preloadUserPermissions(),
      this.preloadSystemConfig(),
      this.preloadTransactionSummary()
    ]

    const results = await Promise.allSettled(preloadTasks)
    const successful = results.filter(r => r.status === 'fulfilled').length
    
    this.logger.log(`Data preload completed: ${successful}/${results.length} tasks successful`)
  }

  private async preloadDashboardData(): Promise<void> {
    await this.optimizeQuery('dashboard_overview', async () => {
      return {
        userCount: 1234,
        transactionVolume: 567890,
        systemHealth: 'healthy',
        alerts: 2
      }
    }, { ttl: 5 * 60 * 1000 })
  }

  private async preloadUserPermissions(): Promise<void> {
    await this.optimizeQuery('user_permissions_cache', async () => {
      return {
        admin: ['read', 'write', 'delete'],
        agent: ['read', 'write'],
        user: ['read']
      }
    }, { ttl: 30 * 60 * 1000 })
  }

  private async preloadSystemConfig(): Promise<void> {
    await this.optimizeQuery('system_config', async () => {
      return {
        features: {
          realTimeNotifications: true,
          advancedFilters: true,
          bulkOperations: true
        },
        limits: {
          maxTransactionAmount: 100000,
          dailyWithdrawalLimit: 50000
        }
      }
    }, { ttl: 60 * 60 * 1000 }) // 1小时TTL
  }

  private async preloadTransactionSummary(): Promise<void> {
    await this.optimizeQuery('transaction_summary', async () => {
      return {
        todayVolume: 123456,
        pendingCount: 45,
        completedCount: 123,
        failedCount: 2
      }
    }, { ttl: 2 * 60 * 1000 }) // 2分钟TTL
  }

  /**
   * 性能指标获取
   */
  async getPerformanceMetrics(): Promise<OptimizationMetrics> {
    await this.collectPerformanceMetrics()
    return { ...this.metrics }
  }

  /**
   * 性能优化报告
   */
  async generatePerformanceReport(): Promise<{
    summary: any
    recommendations: string[]
    metrics: OptimizationMetrics
    cacheStats: any
  }> {
    const report = {
      summary: {
        totalOptimizations: this.metrics.queryOptimizations,
        cacheEfficiency: `${(this.metrics.cacheHitRate * 100).toFixed(1)}%`,
        averageResponseTime: `${this.metrics.averageResponseTime.toFixed(0)}ms`,
        memoryUsage: `${this.metrics.memoryUsage.toFixed(1)}MB`,
        healthStatus: this.determineHealthStatus()
      },
      recommendations: this.metrics.recommendations,
      metrics: this.metrics,
      cacheStats: {
        queryCache: {
          size: this.queryCache.size,
          memoryUsage: this.estimateCacheMemoryUsage(this.queryCache)
        },
        responseCache: {
          size: this.responseCache.size,
          memoryUsage: this.estimateCacheMemoryUsage(this.responseCache)
        }
      }
    }

    return report
  }

  private determineHealthStatus(): string {
    if (this.metrics.memoryUsage > 500 || this.metrics.averageResponseTime > 3000) {
      return 'critical'
    }
    if (this.metrics.memoryUsage > 300 || this.metrics.averageResponseTime > 2000) {
      return 'warning'
    }
    return 'healthy'
  }

  private estimateCacheMemoryUsage(cache: Map<string, any>): number {
    let totalSize = 0
    for (const [key, value] of cache.entries()) {
      totalSize += JSON.stringify(key).length + JSON.stringify(value).length
    }
    return totalSize
  }


  /**
   * 清理和重置
   */
  async clearAllCaches(): Promise<void> {
    this.queryCache.clear()
    this.responseCache.clear()
    this.logger.log('All caches cleared')
  }

  async resetMetrics(): Promise<void> {
    this.metrics = {
      queryOptimizations: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      recommendations: []
    }
    this.logger.log('Performance metrics reset')
  }
}

/**
 * 性能优化装饰器
 */
export function OptimizeQuery(cacheKey?: string, ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const optimizer = (this as any).performanceOptimizer as PerformanceOptimizerService
      const key = cacheKey || `${target.constructor.name}.${propertyName}`
      
      if (optimizer) {
        return optimizer.optimizeQuery(key, () => method.apply(this, args), { ttl })
      }
      
      return method.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 响应压缩装饰器
 */
export function CompressResponse(threshold?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      const optimizer = (this as any).performanceOptimizer as PerformanceOptimizerService
      
      if (optimizer) {
        return optimizer.compressResponse(result, threshold)
      }
      
      return result
    }

    return descriptor
  }
}

export default PerformanceOptimizerService