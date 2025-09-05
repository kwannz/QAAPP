import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { RiskController } from './risk.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskController],
  providers: [RiskEngineService],
  exports: [RiskEngineService],
})
export class RiskModule {}