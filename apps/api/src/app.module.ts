import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { HealthModule } from './health/health.module';
import { MockModule } from './mock/mock.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PositionsModule } from './positions/positions.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AgentsModule } from './agents/agents.module';
import { CommissionsModule } from './commissions/commissions.module';
import { ConfigModule as SystemConfigModule } from './config/config.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // 健康检查模块 (不依赖数据库)
    HealthModule,

    // Mock模块 (用于测试核心业务逻辑)
    MockModule,

    // 数据库和审计模块
    PrismaModule,
    AuditModule,

    // 认证和用户模块
    AuthModule,
    // UsersModule, // 依赖数据库模块，暂时禁用

    // 持仓管理模块
    PositionsModule,

    // 收益分发自动化模块
    PayoutsModule,

    // 提现管理模块
    WithdrawalsModule,

    // 系统监控和告警模块
    MonitoringModule,

    // 代理商和佣金管理模块
    AgentsModule,
    CommissionsModule,

    // 系统配置管理模块
    SystemConfigModule,

    // 通知消息系统模块
    NotificationsModule,

    // 财务报表生成模块
    ReportsModule,

    // 性能监控模块
    PerformanceModule,

    // 核心业务模块
    // ProductsModule,
    // OrdersModule,
    BlockchainModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log('🏗️  API App Module initialized');
    console.log(`🌍 Environment: ${this.configService.get('NODE_ENV')}`);
  }
}