import { DatabaseService } from '../database/database.service';
import { RedisService } from '../cache/redis.service';
import { MultiLayerCacheService } from '../cache/multi-layer-cache.service';
interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'critical';
    timestamp: string;
    uptime: number;
    version: string;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
        cache: ServiceHealth;
        performance: ServiceHealth;
    };
    metrics: {
        responseTime: number;
        memoryUsage: number;
        cacheHitRate: number;
        dbQueryAvgTime: number;
    };
    recommendations: string[];
}
interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'critical';
    responseTime: number;
    details: Record<string, any>;
    lastChecked: string;
}
export declare class ComprehensiveHealthService {
    private readonly database;
    private readonly redis;
    private readonly cache;
    private readonly logger;
    constructor(database: DatabaseService, redis: RedisService, cache: MultiLayerCacheService);
    performHealthCheck(): Promise<HealthCheckResult>;
    private checkDatabaseHealth;
    private checkRedisHealth;
    private checkCacheHealth;
    private checkPerformanceHealth;
    private determineOverallStatus;
    private createErrorHealth;
    private generateRecommendations;
}
export {};
