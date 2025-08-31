import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MockDatabaseService } from './mock-database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // 根据环境变量决定使用哪个服务
    {
      provide: DatabaseService,
      useFactory: (configService: ConfigService) => {
        const useMock = configService.get<string>('USE_MOCK_DATABASE') === 'true';
        const nodeEnv = configService.get<string>('NODE_ENV');
        
        // 只在测试环境或明确指定时使用Mock
        if (useMock || nodeEnv === 'test') {
          console.log('⚠️  Using Mock Database Service');
          return new MockDatabaseService();
        }
        
        console.log('✅ Using Real Database Service');
        return new DatabaseService(configService);
      },
      inject: [ConfigService],
    },
    MockDatabaseService, // 仍然提供MockDatabaseService供测试使用
  ],
  exports: [DatabaseService, MockDatabaseService],
})
export class DatabaseModule {}