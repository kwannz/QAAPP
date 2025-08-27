import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: 'NotificationsService',
      useClass: NotificationsService,
    },
  ],
  exports: ['NotificationsService'],
})
export class NotificationsModule {}