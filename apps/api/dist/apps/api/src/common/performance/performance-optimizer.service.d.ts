import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface PerformanceConfig {
    enableQueryOptimization: boolean;
    enableResponseCompression: boolean;
    enableRequestBatching: boolean;
    cacheOptimization: {
        enableRedisCluster: boolean;
        defaultTTL: number;
        maxMemoryUsage: number;
    };
    monitoring: {
        enableAPMTracing: boolean;
        slowQueryThreshold: number;
        responseTimeThreshold: number;
    };
}
export interface OptimizationMetrics {
    queryOptimizations: number;
    cacheHitRate: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    recommendations: string[];
}
export declare class PerformanceOptimizerService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private config;
    private metrics;
    private queryCache;
    private responseCache;
    private readonly maxCacheSize;
    private readonly cacheCleanupInterval;
    private cleanupIntervalId;
    private monitoringIntervalId;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    optimizeQuery<T>(queryKey: string, queryFn: () => Promise<T>, options?: {
        ttl?: number;
        tags?: string[];
        skipCache?: boolean;
    }): Promise<T>;
    optimizeResponse(cacheKey: string, responseFn: () => Promise<any>, ttl?: number): Promise<any>;
    private batchRequests;
    batchOptimize<T>(batchKey: string, batchFn: (requests: any[]) => Promise<T[]>, request: any, batchWindow?: number): Promise<T>;
    optimizeMemoryUsage(): Promise<void>;
    initializeCacheWarmup(): Promise<void>;
    private warmupUserCache;
    private warmupTransactionCache;
    private warmupMetricsCache;
    private startPerformanceMonitoring;
    private collectPerformanceMetrics;
    private generateOptimizationRecommendations;
    private calculateCacheHitRate;
    private cleanupCaches;
    optimizeDbQuery<T>(queryName: string, query: () => Promise<T>, optimizations?: {
        useIndex?: string[];
        selectFields?: string[];
        joinOptimization?: boolean;
        pagination?: {
            limit: number;
            offset: number;
        };
    }): Promise<T>;
    compressResponse(data: any, threshold?: number): any;
    preloadCriticalData(): Promise<void>;
    private preloadDashboardData;
    private preloadUserPermissions;
    private preloadSystemConfig;
    private preloadTransactionSummary;
    getPerformanceMetrics(): Promise<OptimizationMetrics>;
    generatePerformanceReport(): Promise<{
        summary: any;
        recommendations: string[];
        metrics: OptimizationMetrics;
        cacheStats: any;
    }>;
    private determineHealthStatus;
    private estimateCacheMemoryUsage;
    clearAllCaches(): Promise<void>;
    resetMetrics(): Promise<void>;
}
export declare function OptimizeQuery(cacheKey?: string, ttl?: number): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CompressResponse(threshold?: number): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default PerformanceOptimizerService;
