import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { MultiLayerCacheService } from './multi-layer-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
export declare class CacheInterceptor implements NestInterceptor {
    private reflector;
    private cacheService;
    private invalidationService;
    private readonly logger;
    constructor(reflector: Reflector, cacheService: MultiLayerCacheService, invalidationService: CacheInvalidationService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private handleCache;
    private handleInvalidation;
    private executeInvalidation;
    private generateCacheKey;
    private interpolateKey;
    private extractArguments;
}
