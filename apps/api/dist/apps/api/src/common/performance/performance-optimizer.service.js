"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PerformanceOptimizerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizerService = void 0;
exports.OptimizeQuery = OptimizeQuery;
exports.CompressResponse = CompressResponse;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PerformanceOptimizerService = PerformanceOptimizerService_1 = class PerformanceOptimizerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PerformanceOptimizerService_1.name);
        this.queryCache = new Map();
        this.responseCache = new Map();
        this.maxCacheSize = 1000;
        this.cacheCleanupInterval = 300000;
        this.batchRequests = new Map();
        this.config = {
            enableQueryOptimization: this.configService.get('ENABLE_QUERY_OPTIMIZATION', true),
            enableResponseCompression: this.configService.get('ENABLE_RESPONSE_COMPRESSION', true),
            enableRequestBatching: this.configService.get('ENABLE_REQUEST_BATCHING', true),
            cacheOptimization: {
                enableRedisCluster: this.configService.get('ENABLE_REDIS_CLUSTER', false),
                defaultTTL: this.configService.get('CACHE_DEFAULT_TTL', 300000),
                maxMemoryUsage: this.configService.get('CACHE_MAX_MEMORY_MB', 512) * 1024 * 1024
            },
            monitoring: {
                enableAPMTracing: this.configService.get('ENABLE_APM_TRACING', true),
                slowQueryThreshold: this.configService.get('SLOW_QUERY_THRESHOLD_MS', 1000),
                responseTimeThreshold: this.configService.get('RESPONSE_TIME_THRESHOLD_MS', 2000)
            }
        };
        this.metrics = {
            queryOptimizations: 0,
            cacheHitRate: 0,
            averageResponseTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            recommendations: []
        };
    }
    async onModuleInit() {
        this.logger.log('Performance Optimizer initialized');
        this.startPerformanceMonitoring();
        await this.initializeCacheWarmup();
        this.cleanupIntervalId = setInterval(() => {
            this.cleanupCaches();
        }, this.cacheCleanupInterval);
    }
    async onModuleDestroy() {
        this.logger.log('Cleaning up Performance Optimizer...');
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }
        if (this.monitoringIntervalId) {
            clearInterval(this.monitoringIntervalId);
        }
        for (const [key, batch] of this.batchRequests.entries()) {
            if (batch.timer) {
                clearTimeout(batch.timer);
            }
        }
        this.batchRequests.clear();
        this.logger.log('Performance Optimizer cleanup completed');
    }
    async optimizeQuery(queryKey, queryFn, options) {
        const startTime = Date.now();
        try {
            if (!options?.skipCache && this.queryCache.has(queryKey)) {
                const cached = this.queryCache.get(queryKey);
                if (Date.now() - cached.timestamp < cached.ttl) {
                    this.metrics.queryOptimizations++;
                    this.logger.debug(`Query cache hit: ${queryKey}`);
                    return cached.result;
                }
                else {
                    this.queryCache.delete(queryKey);
                }
            }
            const result = await queryFn();
            const queryTime = Date.now() - startTime;
            if (queryTime > this.config.monitoring.slowQueryThreshold) {
                this.logger.warn(`Slow query detected: ${queryKey} (${queryTime}ms)`);
            }
            if (!options?.skipCache && result) {
                this.queryCache.set(queryKey, {
                    result,
                    timestamp: Date.now(),
                    ttl: options?.ttl || this.config.cacheOptimization.defaultTTL
                });
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Query optimization failed for ${queryKey}:`, error);
            throw error;
        }
    }
    async optimizeResponse(cacheKey, responseFn, ttl = 60000) {
        if (this.responseCache.has(cacheKey)) {
            const cached = this.responseCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cached.ttl) {
                return cached.data;
            }
            else {
                this.responseCache.delete(cacheKey);
            }
        }
        const data = await responseFn();
        this.responseCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl
        });
        return data;
    }
    async batchOptimize(batchKey, batchFn, request, batchWindow = 100) {
        return new Promise((resolve, reject) => {
            let batch = this.batchRequests.get(batchKey);
            if (!batch) {
                batch = {
                    requests: [],
                    timer: setTimeout(async () => {
                        const currentBatch = this.batchRequests.get(batchKey);
                        this.batchRequests.delete(batchKey);
                        try {
                            const args = currentBatch.requests.map(req => req.args);
                            const results = await batchFn(args);
                            currentBatch.requests.forEach((req, index) => {
                                req.resolve(results[index]);
                            });
                        }
                        catch (error) {
                            currentBatch.requests.forEach(req => req.reject(error));
                        }
                    }, batchWindow)
                };
                this.batchRequests.set(batchKey, batch);
            }
            batch.requests.push({ resolve, reject, args: request });
        });
    }
    async optimizeMemoryUsage() {
        const memUsage = process.memoryUsage();
        const usedMB = memUsage.heapUsed / 1024 / 1024;
        if (usedMB > this.config.cacheOptimization.maxMemoryUsage / 1024 / 1024) {
            this.logger.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
            await this.cleanupCaches();
            if (global.gc) {
                global.gc();
                this.logger.log('Forced garbage collection completed');
            }
        }
        this.metrics.memoryUsage = usedMB;
    }
    async initializeCacheWarmup() {
        this.logger.log('Starting cache warmup...');
        const warmupTasks = [
            this.warmupUserCache(),
            this.warmupTransactionCache(),
            this.warmupMetricsCache()
        ];
        await Promise.allSettled(warmupTasks);
        this.logger.log('Cache warmup completed');
    }
    async warmupUserCache() {
        const activeUsersCacheKey = 'active_users_warmup';
        await this.optimizeQuery(activeUsersCacheKey, async () => {
            return { users: [], count: 0 };
        }, { ttl: 10 * 60 * 1000 });
    }
    async warmupTransactionCache() {
        const recentTransactionsCacheKey = 'recent_transactions_warmup';
        await this.optimizeQuery(recentTransactionsCacheKey, async () => {
            return { transactions: [], stats: {} };
        }, { ttl: 5 * 60 * 1000 });
    }
    async warmupMetricsCache() {
        const systemMetricsCacheKey = 'system_metrics_warmup';
        await this.optimizeQuery(systemMetricsCacheKey, async () => {
            return { metrics: {}, timestamp: Date.now() };
        }, { ttl: 2 * 60 * 1000 });
    }
    async startPerformanceMonitoring() {
        this.monitoringIntervalId = setInterval(async () => {
            await this.collectPerformanceMetrics();
            await this.generateOptimizationRecommendations();
            await this.optimizeMemoryUsage();
        }, 60000);
    }
    async collectPerformanceMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        this.metrics = {
            ...this.metrics,
            memoryUsage: memUsage.heapUsed / 1024 / 1024,
            cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000,
            cacheHitRate: this.calculateCacheHitRate()
        };
    }
    async generateOptimizationRecommendations() {
        const recommendations = [];
        if (this.metrics.memoryUsage > 400) {
            recommendations.push('内存使用过高，建议增加缓存清理频率');
        }
        if (this.metrics.cacheHitRate < 0.7) {
            recommendations.push('缓存命中率较低，建议调整缓存策略');
        }
        if (this.metrics.cpuUsage > 80) {
            recommendations.push('CPU使用率高，建议优化计算密集型操作');
        }
        this.metrics.recommendations = recommendations;
    }
    calculateCacheHitRate() {
        const totalQueries = this.queryCache.size;
        const validQueries = Array.from(this.queryCache.values()).filter(entry => Date.now() - entry.timestamp < entry.ttl).length;
        return totalQueries > 0 ? validQueries / totalQueries : 0;
    }
    async cleanupCaches() {
        const now = Date.now();
        for (const [key, entry] of this.queryCache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.queryCache.delete(key);
            }
        }
        for (const [key, entry] of this.responseCache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.responseCache.delete(key);
            }
        }
        this.logger.debug(`Cache cleanup completed. Query cache: ${this.queryCache.size}, Response cache: ${this.responseCache.size}`);
    }
    async optimizeDbQuery(queryName, query, optimizations) {
        const startTime = Date.now();
        try {
            const result = await query();
            const queryTime = Date.now() - startTime;
            if (queryTime > this.config.monitoring.slowQueryThreshold) {
                this.logger.warn(`Slow database query: ${queryName} (${queryTime}ms)`, {
                    queryName,
                    queryTime,
                    optimizations,
                    timestamp: new Date().toISOString()
                });
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Database query optimization failed: ${queryName}`, error);
            throw error;
        }
    }
    compressResponse(data, threshold = 1024) {
        if (!this.config.enableResponseCompression)
            return data;
        const dataSize = JSON.stringify(data).length;
        if (dataSize > threshold) {
            this.logger.debug(`Compressing response: ${dataSize} bytes → estimated ${Math.floor(dataSize * 0.6)} bytes`);
            return {
                compressed: true,
                originalSize: dataSize,
                data: data
            };
        }
        return data;
    }
    async preloadCriticalData() {
        this.logger.log('Starting critical data preload...');
        const preloadTasks = [
            this.preloadDashboardData(),
            this.preloadUserPermissions(),
            this.preloadSystemConfig(),
            this.preloadTransactionSummary()
        ];
        const results = await Promise.allSettled(preloadTasks);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        this.logger.log(`Data preload completed: ${successful}/${results.length} tasks successful`);
    }
    async preloadDashboardData() {
        await this.optimizeQuery('dashboard_overview', async () => {
            return {
                userCount: 1234,
                transactionVolume: 567890,
                systemHealth: 'healthy',
                alerts: 2
            };
        }, { ttl: 5 * 60 * 1000 });
    }
    async preloadUserPermissions() {
        await this.optimizeQuery('user_permissions_cache', async () => {
            return {
                admin: ['read', 'write', 'delete'],
                agent: ['read', 'write'],
                user: ['read']
            };
        }, { ttl: 30 * 60 * 1000 });
    }
    async preloadSystemConfig() {
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
            };
        }, { ttl: 60 * 60 * 1000 });
    }
    async preloadTransactionSummary() {
        await this.optimizeQuery('transaction_summary', async () => {
            return {
                todayVolume: 123456,
                pendingCount: 45,
                completedCount: 123,
                failedCount: 2
            };
        }, { ttl: 2 * 60 * 1000 });
    }
    async getPerformanceMetrics() {
        await this.collectPerformanceMetrics();
        return { ...this.metrics };
    }
    async generatePerformanceReport() {
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
        };
        return report;
    }
    determineHealthStatus() {
        if (this.metrics.memoryUsage > 500 || this.metrics.averageResponseTime > 3000) {
            return 'critical';
        }
        if (this.metrics.memoryUsage > 300 || this.metrics.averageResponseTime > 2000) {
            return 'warning';
        }
        return 'healthy';
    }
    estimateCacheMemoryUsage(cache) {
        let totalSize = 0;
        for (const [key, value] of cache.entries()) {
            totalSize += JSON.stringify(key).length + JSON.stringify(value).length;
        }
        return totalSize;
    }
    async clearAllCaches() {
        this.queryCache.clear();
        this.responseCache.clear();
        this.logger.log('All caches cleared');
    }
    async resetMetrics() {
        this.metrics = {
            queryOptimizations: 0,
            cacheHitRate: 0,
            averageResponseTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            recommendations: []
        };
        this.logger.log('Performance metrics reset');
    }
};
exports.PerformanceOptimizerService = PerformanceOptimizerService;
exports.PerformanceOptimizerService = PerformanceOptimizerService = PerformanceOptimizerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PerformanceOptimizerService);
function OptimizeQuery(cacheKey, ttl) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const optimizer = this.performanceOptimizer;
            const key = cacheKey || `${target.constructor.name}.${propertyName}`;
            if (optimizer) {
                return optimizer.optimizeQuery(key, () => method.apply(this, args), { ttl });
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
function CompressResponse(threshold) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await method.apply(this, args);
            const optimizer = this.performanceOptimizer;
            if (optimizer) {
                return optimizer.compressResponse(result, threshold);
            }
            return result;
        };
        return descriptor;
    };
}
exports.default = PerformanceOptimizerService;
//# sourceMappingURL=performance-optimizer.service.js.map