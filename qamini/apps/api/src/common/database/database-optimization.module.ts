import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { OptimizedQueriesService } from './optimized-queries.service';
import { DatabaseOptimizationController } from './database-optimization.controller';
import { PerformanceOptimizerService } from '../performance/performance-optimizer.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [DatabaseOptimizationController],
  providers: [
    OptimizedQueriesService,
    PerformanceOptimizerService,
  ],
  exports: [
    OptimizedQueriesService,
    PerformanceOptimizerService,
  ],
})
export class DatabaseOptimizationModule {}