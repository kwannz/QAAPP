import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './common/logger/logger.module';
import { MetricsModule } from './common/metrics/metrics.module';
// import { SecurityModule } from './common/security/security.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

import { BlockchainModule } from './blockchain/blockchain.module';
import { MonitoringInterceptor } from './common/interceptors/monitoring.interceptor';
// import { PrismaModule } from './prisma/prisma.module'; // Disabled - using mock services
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './cache/redis.module';
import { WebSocketModule } from './websocket/websocket.module';

// 新的整合模块
import { MonitoringModule } from './monitoring/monitoring.module';
import { FinanceModule } from './finance/finance.module';
import { DatabaseOptimizationModule } from './common/database/database-optimization.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // 速率限制模块
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ([{
        name: 'default',
        ttl: 60 * 1000, // 1分钟
        limit: 100, // 默认100次请求/分钟
      }, {
        name: 'auth',
        ttl: 60 * 1000, // 1分钟  
        limit: 10, // 认证端点10次请求/分钟
      }, {
        name: 'sensitive',
        ttl: 60 * 1000, // 1分钟
        limit: 5, // 敏感操作5次请求/分钟
      }]),
      inject: [ConfigService],
    }),

    // 全局日志模块
    LoggerModule,

    // 全局度量指标模块
    MetricsModule,

    // 全局安全模块 - 暂时禁用修复编译错误
    // SecurityModule,

    // 数据库模块 (全局) - 临时禁用使用Mock服务
    // PrismaModule,

    // 缓存模块 (全局缓存服务)
    RedisModule,
    CacheModule,

    // 健康检查模块 (不依赖数据库)
    HealthModule,


    // 认证和用户模块 (核心功能)
    AuthModule,

    // 数据库服务模块
    DatabaseModule,

    // 核心业务模块
    UsersModule,

    // WebSocket 实时通信模块
    WebSocketModule,

    // 高级功能模块
    BlockchainModule,

    // 整合模块 (Sprint 2)
    MonitoringModule, // 整合 logs + audit + alerts + performance
    FinanceModule,    // 整合 orders + positions + products + payouts + withdrawals + commissions + transactions
    DatabaseOptimizationModule, // 数据库查询优化
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  
  constructor(private configService: ConfigService) {
    this.logger.log('🏗️  API App Module initialized');
    this.logger.log('🌍 Environment configured', { environment: this.configService.get('NODE_ENV') });
  }
}