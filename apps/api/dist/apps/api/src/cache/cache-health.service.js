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
var CacheHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheHealthService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const multi_layer_cache_service_1 = require("./multi-layer-cache.service");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
const cache_types_1 = require("../types/cache.types");
let CacheHealthService = CacheHealthService_1 = class CacheHealthService {
    constructor(cacheService, invalidationService) {
        this.cacheService = cacheService;
        this.invalidationService = invalidationService;
        this.logger = new common_1.Logger(CacheHealthService_1.name);
        this.healthThresholds = {
            hitRateMinimum: 0.7,
            memoryUsageMaximum: 0.85,
            responseTimeMaximum: 100,
            errorRateMaximum: 0.01
        };
        this.healthHistory = [];
        this.maxHistorySize = 100;
    }
    async performHealthCheck() {
        try {
            const healthReport = await this.generateHealthReport();
            this.healthHistory.unshift(healthReport);
            if (this.healthHistory.length > this.maxHistorySize) {
                this.healthHistory = this.healthHistory.slice(0, this.maxHistorySize);
            }
            await this.processAlerts(healthReport);
            if (healthReport.overall !== 'healthy') {
                this.logger.warn(`Cache health status: ${healthReport.overall}`, {
                    alerts: healthReport.alerts,
                    recommendations: healthReport.recommendations
                });
            }
        }
        catch (error) {
            this.logger.error('Health check failed:', error);
        }
    }
    async generateHealthReport() {
        const timestamp = Date.now();
        const cacheStats = await this.cacheService.getStats();
        const layerHealth = await this.cacheService.healthCheck();
        const invalidationStats = await this.invalidationService.getInvalidationStats();
        const layers = {};
        const alerts = [];
        const recommendations = [];
        for (const [layer, stats] of cacheStats.entries()) {
            const healthKey = layer === cache_types_1.CacheLayer.L1_MEMORY ? 'l1' :
                layer === cache_types_1.CacheLayer.L2_REDIS ? 'l2' :
                    layer === cache_types_1.CacheLayer.L3_CDN ? 'l3' : 'l1';
            const isOnline = layerHealth[healthKey];
            const issues = [];
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
            const memoryUsageRatio = stats.memoryUsage / (128 * 1024 * 1024);
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
            layers[layer] = {
                status: !isOnline ? 'offline' : issues.length > 0 ? 'degraded' : 'online',
                stats,
                issues: issues.length > 0 ? issues : undefined
            };
        }
        recommendations.push(...this.generateRecommendations(cacheStats, invalidationStats));
        const criticalAlerts = alerts.filter(a => a.level === 'critical').length;
        const errorAlerts = alerts.filter(a => a.level === 'error').length;
        const warningAlerts = alerts.filter(a => a.level === 'warning').length;
        let overall;
        if (criticalAlerts > 0) {
            overall = 'critical';
        }
        else if (errorAlerts > 0 || warningAlerts > 2) {
            overall = 'degraded';
        }
        else {
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
    generateRecommendations(cacheStats, invalidationStats) {
        const recommendations = [];
        const l1Stats = cacheStats.get(cache_types_1.CacheLayer.L1_MEMORY);
        const l2Stats = cacheStats.get(cache_types_1.CacheLayer.L2_REDIS);
        if (l1Stats) {
            if (l1Stats.hitRate < 0.8) {
                recommendations.push('考虑增加L1缓存大小或调整TTL策略');
            }
            if (l1Stats.evictionCount > 100) {
                recommendations.push('L1缓存频繁淘汰，建议增加内存分配');
            }
        }
        if (l2Stats) {
            if (l2Stats.hitRate < 0.6) {
                recommendations.push('L2缓存命中率低，检查缓存键设计和失效策略');
            }
            if (l2Stats.operationsPerSecond < 1000) {
                recommendations.push('L2缓存性能不佳，考虑Redis集群或优化网络');
            }
        }
        if (invalidationStats.delayedInvalidations > 50) {
            recommendations.push('延迟失效任务过多，考虑调整失效延迟时间');
        }
        return recommendations;
    }
    async processAlerts(healthReport) {
        const criticalAlerts = healthReport.alerts.filter(a => a.level === 'critical');
        const errorAlerts = healthReport.alerts.filter(a => a.level === 'error');
        for (const alert of criticalAlerts) {
            await this.handleCriticalAlert(alert);
        }
        for (const alert of errorAlerts) {
            await this.handleErrorAlert(alert);
        }
    }
    async handleCriticalAlert(alert) {
        this.logger.error(`CRITICAL CACHE ALERT: ${alert.message}`, {
            metric: alert.metric,
            current: alert.current,
            threshold: alert.threshold
        });
        switch (alert.metric) {
            case 'memoryUsage':
                await this.performEmergencyCacheCleanup();
                break;
            case 'hitRate':
                await this.triggerCacheWarmup();
                break;
        }
    }
    async handleErrorAlert(alert) {
        this.logger.error(`CACHE ERROR: ${alert.message}`, {
            metric: alert.metric,
            current: alert.current,
            threshold: alert.threshold
        });
    }
    async performEmergencyCacheCleanup() {
        this.logger.warn('Performing emergency cache cleanup');
        try {
            await this.cacheService.delete('*:expired:*');
            await this.cacheService.delete('*:cold:*');
            this.logger.log('Emergency cache cleanup completed');
        }
        catch (error) {
            this.logger.error('Emergency cache cleanup failed:', error);
        }
    }
    async triggerCacheWarmup() {
        this.logger.log('Triggering cache warmup due to low hit rate');
        try {
            const hotKeys = [
                { key: 'market:symbols', loader: () => Promise.resolve({ symbols: ['BTCUSDT', 'ETHUSDT'] }) },
                { key: 'user:active:list', loader: () => Promise.resolve({ activeUsers: [] }) }
            ];
            await this.cacheService.warmup(hotKeys);
            this.logger.log('Cache warmup completed');
        }
        catch (error) {
            this.logger.error('Cache warmup failed:', error);
        }
    }
    getHealthHistory(limit) {
        return limit ? this.healthHistory.slice(0, limit) : this.healthHistory;
    }
    getCurrentHealth() {
        return this.healthHistory[0] || null;
    }
    async manualHealthCheck() {
        const report = await this.generateHealthReport();
        this.logger.log('Manual health check completed', {
            overall: report.overall,
            alertsCount: report.alerts.length
        });
        return report;
    }
};
exports.CacheHealthService = CacheHealthService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CacheHealthService.prototype, "performHealthCheck", null);
exports.CacheHealthService = CacheHealthService = CacheHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [multi_layer_cache_service_1.MultiLayerCacheService,
        cache_invalidation_service_1.CacheInvalidationService])
], CacheHealthService);
//# sourceMappingURL=cache-health.service.js.map