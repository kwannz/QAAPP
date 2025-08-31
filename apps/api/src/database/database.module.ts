import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MockDatabaseService } from './mock-database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // 根据环境变量决定使用哪个服务（懒加载，避免在Mock模式下加载真实数据库依赖）
    {
      provide: 'DatabaseService',
      useFactory: async (configService: ConfigService) => {
        const useMock = configService.get<string>('USE_MOCK_DATABASE') === 'true';
        const nodeEnv = configService.get<string>('NODE_ENV');

        if (useMock || nodeEnv === 'test') {
          console.log('⚠️  Using Mock Database Service');
          return new MockDatabaseService();
        }

        console.log('✅ Using Real Database Service');
        const { DatabaseService } = await import('./database.service');
        return new DatabaseService(configService);
      },
      inject: [ConfigService],
    },
    MockDatabaseService, // 仍然提供MockDatabaseService供测试使用
  ],
  exports: ['DatabaseService', MockDatabaseService],
})
export class DatabaseModule {}