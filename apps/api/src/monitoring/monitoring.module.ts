import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  providers: [
    MonitoringService,
  ],
  controllers: [
    MonitoringController,
  ],
  exports: [
    MonitoringService,
  ],
})
export class MonitoringModule {}