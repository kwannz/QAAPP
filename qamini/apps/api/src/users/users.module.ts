import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { PerformanceOptimizerService } from '../common/performance/performance-optimizer.service';
import { OptimizedQueriesService } from '../common/database/optimized-queries.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PerformanceOptimizerService, OptimizedQueriesService],
  exports: [UsersService],
})
export class UsersModule {}