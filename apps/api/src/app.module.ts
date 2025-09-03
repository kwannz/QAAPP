import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './common/logger/logger.module';
import { MetricsModule } from './common/metrics/metrics.module';
// import { SecurityModule } from './common/security/security.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PositionsModule } from './positions/positions.module';
import { PayoutsModule } from './payouts/payouts.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { CommissionsModule } from './commissions/commissions.module';
import { RiskModule } from './risk/risk.module';
// import { MonitoringModule } from './monitoring/monitoring.module'; // Removed
import { AgentsModule } from './agents/agents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { PerformanceModule } from './performance/performance.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { LogsModule } from './logs/logs.module';
import { AlertsModule } from './alerts/alerts.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MonitoringInterceptor } from './common/interceptors/monitoring.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './cache/redis.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
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
    ProductsModule,
    OrdersModule,
    PositionsModule,

    // WebSocket 实时通信模块
    WebSocketModule,

    // 金融模块
    PayoutsModule,
    // WithdrawalsModule,
    // CommissionsModule,

    // 风险管理与监控 - 暂时禁用
    // RiskModule,
    // MonitoringModule,
    // AgentsModule,

    // 通知与报告 - 暂时禁用
    // NotificationsModule,
    // ReportsModule,
    PerformanceModule,

    // 管理与审计模块 - 暂时禁用
    // AdminModule,
    // AuditModule,

    // 高级功能模块
    BlockchainModule,
    // LogsModule,
    // AlertsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log('🏗️  API App Module initialized');
    console.log(`🌍 Environment: ${this.configService.get('NODE_ENV')}`);
  }
}