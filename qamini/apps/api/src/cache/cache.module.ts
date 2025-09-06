import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MultiLayerCacheService } from './multi-layer-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { CacheInterceptor } from './cache.interceptor';
import { CacheHealthService } from './cache-health.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true
    })
  ],
  providers: [
    MultiLayerCacheService,
    CacheInvalidationService,
    CacheHealthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    }
  ],
  exports: [
    MultiLayerCacheService,
    CacheInvalidationService,
    CacheHealthService
  ]
})
export class CacheModule {}