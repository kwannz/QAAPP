import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { QueryOptimizerService } from './query-optimizer.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, QueryOptimizerService],
  exports: [DatabaseService, QueryOptimizerService],
})
export class DatabaseModule {}