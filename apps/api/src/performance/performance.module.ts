import { Module, Global } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceInterceptor } from './performance.interceptor';

@Global()
@Module({
  controllers: [PerformanceController],
  providers: [
    PerformanceService,
    PerformanceInterceptor,
    {
      provide: 'PerformanceService',
      useClass: PerformanceService,
    },
  ],
  exports: [PerformanceService, PerformanceInterceptor],
})
export class PerformanceModule {}