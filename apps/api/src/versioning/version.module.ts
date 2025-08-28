import { Module, Global, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Core Services
import { ApiVersionService } from './version.service';
import { ApiVersionMiddleware, VersionedResponseInterceptor } from './version.middleware';
import { VersionGuard } from './version.guard';
import { VersionInterceptor } from './version.interceptor';

// Controllers
import { VersionController } from './version.controller';
import { VersionAdminController } from './version-admin.controller';

// Migration Services
import { ApiMigrationService } from './migration.service';
import { VersionCompatibilityService } from './compatibility.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 30
    })
  ],
  providers: [
    // Core Services
    ApiVersionService,
    ApiMigrationService,
    VersionCompatibilityService,
    
    // Guards and Interceptors
    {
      provide: APP_GUARD,
      useClass: VersionGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: VersionInterceptor
    },
    VersionedResponseInterceptor
  ],
  controllers: [
    VersionController,
    VersionAdminController
  ],
  exports: [
    ApiVersionService,
    ApiMigrationService,
    VersionCompatibilityService,
    VersionedResponseInterceptor
  ]
})
export class VersionModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用版本中间件到所有API路由
    consumer
      .apply(ApiVersionMiddleware)
      .forRoutes(
        { path: 'api/v*', method: RequestMethod.ALL },
        { path: 'v*/api', method: RequestMethod.ALL }
      );
  }
}