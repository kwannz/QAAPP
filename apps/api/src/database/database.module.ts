import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MockDatabaseService } from './mock-database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MockDatabaseService,
    // 提供别名，让DatabaseService使用MockDatabaseService实例
    {
      provide: DatabaseService,
      useExisting: MockDatabaseService,
    },
  ],
  exports: [MockDatabaseService, DatabaseService],
})
export class DatabaseModule {}