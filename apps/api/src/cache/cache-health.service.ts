import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MultiLayerCacheService } from './multi-layer-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { CacheLayer, CacheStats } from '../types/cache.types';

interface CacheHealthReport {
  timestamp: number;
  overall: 'healthy' | 'degraded' | 'critical';
  layers: {
    [key in CacheLayer]: {
      status: 'online' | 'offline' | 'degraded';
      stats: CacheStats;
      issues?: string[];
    };
  };
  recommendations: string[];
  alerts: Array<{
    level: 'warning' | 'error' | 'critical';
    message: string;
    metric: string;
    threshold: number;
    current: number;
  }>;
}

@Injectable()
export class CacheHealthService {
  private readonly logger = new Logger(CacheHealthService.name);
  private readonly healthThresholds = {
    hitRateMinimum: 0.7, // 70% 最低命中率
    memoryUsageMaximum: 0.85, // 85% 最大内存使用
    responseTimeMaximum: 100, // 100ms 最大响应时间
    errorRateMaximum: 0.01 // 1% 最大错误率
  };

  private healthHistory: CacheHealthReport[] = [];
  private readonly maxHistorySize = 100;

  constructor(
    private cacheService: MultiLayerCacheService,
    private invalidationService: CacheInvalidationService
  ) {}

  /**
   * 每分钟执行健康检查
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async performHealthCheck(): Promise<void> {
    try {
      const healthReport = await this.generateHealthReport();
      this.healthHistory.unshift(healthReport);
      
      // 保持历史记录限制
      if (this.healthHistory.length > this.maxHistorySize) {
        this.healthHistory = this.healthHistory.slice(0, this.maxHistorySize);
      }

      // 处理告警
      await this.processAlerts(healthReport);

      if (healthReport.overall !== 'healthy') {
        this.logger.warn(`Cache health status: ${healthReport.overall}`, {
          alerts: healthReport.alerts,
          recommendations: healthReport.recommendations
        });
      }

    } catch (error) {
      this.logger.error('Health check failed:', error);
    }
  }

  /**
   * 生成健康报告
   */
  async generateHealthReport(): Promise<CacheHealthReport> {
    const timestamp = Date.now();
    const cacheStats = await this.cacheService.getStats();
    const layerHealth = await this.cacheService.healthCheck();
    const invalidationStats = await this.invalidationService.getInvalidationStats();

    const layers = {} as CacheHealthReport['layers'];
    const alerts: CacheHealthReport['alerts'] = [];
    const recommendations: string[] = [];

    // 分析各层健康状况
    for (const [layer, stats] of cacheStats.entries()) {
      // Map enum values to health check keys
      const healthKey = layer === CacheLayer.L1_MEMORY ? 'l1' : 
                       layer === CacheLayer.L2_REDIS ? 'l2' : 
                       layer === CacheLayer.L3_CDN ? 'l3' : 'l1';
      const isOnline = layerHealth[healthKey as keyof typeof layerHealth];
      const issues: string[] = [];

      // 检查命中率
      if (stats.hitRate < this.healthThresholds.hitRateMinimum) {
        issues.push(`Low hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
        alerts.push({
          level: 'warning',
          message: `${layer} hit rate below threshold`,
          metric: 'hitRate',
          threshold: this.healthThresholds.hitRateMinimum,
          current: stats.hitRate
        });
      }

      // 检查内存使用
      const memoryUsageRatio = stats.memoryUsage / (128 * 1024 * 1024); // 假设最大128MB
      if (memoryUsageRatio > this.healthThresholds.memoryUsageMaximum) {
        issues.push(`High memory usage: ${(memoryUsageRatio * 100).toFixed(1)}%`);
        alerts.push({
          level: 'error',
          message: `${layer} memory usage critical`,
          metric: 'memoryUsage',
          threshold: this.healthThresholds.memoryUsageMaximum,
          current: memoryUsageRatio
        });
      }

      // 检查响应时间
      const avgResponseTime = 1000 / stats.operationsPerSecond;
      if (avgResponseTime > this.healthThresholds.responseTimeMaximum) {
        issues.push(`Slow response time: ${avgResponseTime.toFixed(2)}ms`);
        alerts.push({
          level: 'warning',
          message: `${layer} response time high`,
          metric: 'responseTime',
          threshold: this.healthThresholds.responseTimeMaximum,
          current: avgResponseTime
        });
      }

      layers[layer as keyof CacheHealthReport['layers']] = {
        status: !isOnline ? 'offline' : issues.length > 0 ? 'degraded' : 'online',
        stats,
        issues: issues.length > 0 ? issues : undefined
      };
    }

    // 生成推荐
    recommendations.push(...this.generateRecommendations(cacheStats, invalidationStats));

    // 确定整体健康状况
    const criticalAlerts = alerts.filter(a => a.level === 'critical').length;
    const errorAlerts = alerts.filter(a => a.level === 'error').length;
    const warningAlerts = alerts.filter(a => a.level === 'warning').length;

    let overall: CacheHealthReport['overall'];
    if (criticalAlerts > 0) {
      overall = 'critical';
    } else if (errorAlerts > 0 || warningAlerts > 2) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      timestamp,
      overall,
      layers,
      recommendations,
      alerts
    };
  }

  /**
   * 生成优化推荐
   */
  private generateRecommendations(
    cacheStats: Map<CacheLayer, CacheStats>,
    invalidationStats: any
  ): string[] {
    const recommendations: string[] = [];

    const l1Stats = cacheStats.get(CacheLayer.L1_MEMORY);
    const l2Stats = cacheStats.get(CacheLayer.L2_REDIS);

    // L1 缓存推荐
    if (l1Stats) {
      if (l1Stats.hitRate < 0.8) {
        recommendations.push('考虑增加L1缓存大小或调整TTL策略');
      }
      if (l1Stats.evictionCount > 100) {
        recommendations.push('L1缓存频繁淘汰，建议增加内存分配');
      }
    }

    // L2 缓存推荐
    if (l2Stats) {
      if (l2Stats.hitRate < 0.6) {
        recommendations.push('L2缓存命中率低，检查缓存键设计和失效策略');
      }
      if (l2Stats.operationsPerSecond < 1000) {
        recommendations.push('L2缓存性能不佳，考虑Redis集群或优化网络');
      }
    }

    // 失效策略推荐
    if (invalidationStats.delayedInvalidations > 50) {
      recommendations.push('延迟失效任务过多，考虑调整失效延迟时间');
    }

    return recommendations;
  }

  /**
   * 处理告警
   */
  private async processAlerts(healthReport: CacheHealthReport): Promise<void> {
    const criticalAlerts = healthReport.alerts.filter(a => a.level === 'critical');
    const errorAlerts = healthReport.alerts.filter(a => a.level === 'error');

    // 处理关键告警
    for (const alert of criticalAlerts) {
      await this.handleCriticalAlert(alert);
    }

    // 处理错误告警
    for (const alert of errorAlerts) {
      await this.handleErrorAlert(alert);
    }
  }

  private async handleCriticalAlert(alert: CacheHealthReport['alerts'][0]): Promise<void> {
    this.logger.error(`CRITICAL CACHE ALERT: ${alert.message}`, {
      metric: alert.metric,
      current: alert.current,
      threshold: alert.threshold
    });

    // 自动恢复措施
    switch (alert.metric) {
      case 'memoryUsage':
        await this.performEmergencyCacheCleanup();
        break;
      case 'hitRate':
        await this.triggerCacheWarmup();
        break;
    }
  }

  private async handleErrorAlert(alert: CacheHealthReport['alerts'][0]): Promise<void> {
    this.logger.error(`CACHE ERROR: ${alert.message}`, {
      metric: alert.metric,
      current: alert.current,
      threshold: alert.threshold
    });
  }

  /**
   * 紧急缓存清理
   */
  private async performEmergencyCacheCleanup(): Promise<void> {
    this.logger.warn('Performing emergency cache cleanup');
    
    try {
      // 清理过期但未被LRU淘汰的缓存
      await this.cacheService.delete('*:expired:*');
      
      // 清理低频访问的缓存
      await this.cacheService.delete('*:cold:*');
      
      this.logger.log('Emergency cache cleanup completed');
    } catch (error) {
      this.logger.error('Emergency cache cleanup failed:', error);
    }
  }

  /**
   * 触发缓存预热
   */
  private async triggerCacheWarmup(): Promise<void> {
    this.logger.log('Triggering cache warmup due to low hit rate');
    
    try {
      // 预热热点数据（实际实现需要根据业务逻辑）
      const hotKeys = [
        { key: 'market:symbols', loader: () => Promise.resolve({ symbols: ['BTCUSDT', 'ETHUSDT'] }) },
        { key: 'user:active:list', loader: () => Promise.resolve({ activeUsers: [] }) }
      ];
      
      await this.cacheService.warmup(hotKeys);
      this.logger.log('Cache warmup completed');
    } catch (error) {
      this.logger.error('Cache warmup failed:', error);
    }
  }

  /**
   * 获取健康历史
   */
  getHealthHistory(limit?: number): CacheHealthReport[] {
    return limit ? this.healthHistory.slice(0, limit) : this.healthHistory;
  }

  /**
   * 获取当前健康状况
   */
  getCurrentHealth(): CacheHealthReport | null {
    return this.healthHistory[0] || null;
  }

  /**
   * 手动健康检查
   */
  async manualHealthCheck(): Promise<CacheHealthReport> {
    const report = await this.generateHealthReport();
    this.logger.log('Manual health check completed', {
      overall: report.overall,
      alertsCount: report.alerts.length
    });
    return report;
  }
}