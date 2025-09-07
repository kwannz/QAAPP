import { OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MultiLayerCacheService } from './multi-layer-cache.service';
export interface CacheInvalidationEvent {
    entity: string;
    id?: string | number;
    action: 'create' | 'update' | 'delete';
    timestamp: number;
    userId?: number;
    metadata?: Record<string, any>;
}
export declare class CacheInvalidationService implements OnModuleDestroy {
    private cacheService;
    private eventEmitter;
    private readonly logger;
    private readonly invalidationRules;
    private readonly delayedInvalidations;
    constructor(cacheService: MultiLayerCacheService, eventEmitter: EventEmitter2);
    onModuleDestroy(): void;
    private setupInvalidationRules;
    handleUserEvent(event: CacheInvalidationEvent): Promise<void>;
    handlePositionEvent(event: CacheInvalidationEvent): Promise<void>;
    handleOrderEvent(event: CacheInvalidationEvent): Promise<void>;
    handleAuditEvent(event: CacheInvalidationEvent): Promise<void>;
    handleMarketEvent(event: CacheInvalidationEvent): Promise<void>;
    private invalidateEntity;
    private handleDelayedInvalidation;
    private executeInvalidation;
    private handleDependencyInvalidation;
    private invalidateUserRelated;
    manualInvalidate(entity: string, id?: string | number, reason?: string): Promise<void>;
    batchInvalidate(entities: Array<{
        entity: string;
        id?: string | number;
    }>): Promise<void>;
    globalClear(confirmation: string): Promise<void>;
    getInvalidationStats(): Promise<{
        rules: number;
        delayedInvalidations: number;
        recentInvalidations: Array<{
            pattern: string;
            timestamp: number;
            success: boolean;
        }>;
    }>;
}
