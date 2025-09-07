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
export declare class CacheHealthService {
    private cacheService;
    private invalidationService;
    private readonly logger;
    private readonly healthThresholds;
    private healthHistory;
    private readonly maxHistorySize;
    constructor(cacheService: MultiLayerCacheService, invalidationService: CacheInvalidationService);
    performHealthCheck(): Promise<void>;
    generateHealthReport(): Promise<CacheHealthReport>;
    private generateRecommendations;
    private processAlerts;
    private handleCriticalAlert;
    private handleErrorAlert;
    private performEmergencyCacheCleanup;
    private triggerCacheWarmup;
    getHealthHistory(limit?: number): CacheHealthReport[];
    getCurrentHealth(): CacheHealthReport | null;
    manualHealthCheck(): Promise<CacheHealthReport>;
}
export {};
