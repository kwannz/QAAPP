import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MockDatabaseService } from './mock-database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, MockDatabaseService],
  exports: [DatabaseService, MockDatabaseService],
})
export class DatabaseModule {}