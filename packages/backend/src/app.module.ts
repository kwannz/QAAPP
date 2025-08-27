import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { AuthGuard } from './auth/guards/auth.guard';

@Module({
  imports: [
    // 配置模块 - 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // 核心业务模块
    AuthModule,
    UsersModule,
    AuditModule,
    
    // TODO: 添加其他业务模块
    // ProductsModule,
    // OrdersModule,
    // PositionsModule,
    // PayoutsModule,
    // CommissionsModule,
    // WalletsModule,
  ],
  providers: [
    // 全局认证守卫
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}