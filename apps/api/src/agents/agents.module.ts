import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

@Module({
  controllers: [AgentsController],
  providers: [
    AgentsService,
    {
      provide: 'AgentsService',
      useClass: AgentsService,
    },
  ],
  exports: ['AgentsService'],
})
export class AgentsModule {}