import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheLayer, CacheStats } from '../types/cache.types';
export declare class MultiLayerCacheService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private l1Cache;
    private l2Cache;
    private config;
    private stats;
    private statsCollectionIntervalId;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private loadCacheConfig;
    private initializeL1Cache;
    private initializeL2Cache;
    private initializeStats;
    get<T>(key: string, loader?: () => Promise<T>): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    private setL1;
    private setL2;
    private setL3;
    delete(keyOrPattern: string): Promise<boolean>;
    private deleteL1;
    private deleteL2;
    private deleteBatchL1;
    private deleteBatchL2;
    private getKeysByPattern;
    private matchPattern;
    warmup(keys: Array<{
        key: string;
        loader: () => Promise<any>;
    }>): Promise<void>;
    getStats(): Promise<Map<CacheLayer, CacheStats>>;
    private updateStats;
    private serialize;
    private deserialize;
    private generateVersion;
    private parseRedisMemoryUsage;
    private startStatsCollection;
    buildKey(namespace: string, entity: string, id: string | number, version?: string): string;
    healthCheck(): Promise<{
        l1: boolean;
        l2: boolean;
        l3: boolean;
    }>;
}
