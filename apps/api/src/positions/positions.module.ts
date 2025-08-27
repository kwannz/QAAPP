import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { MockDatabaseService } from '../database/mock-database.service';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService, MockDatabaseService],
  exports: [PositionsService],
})
export class PositionsModule {}