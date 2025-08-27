import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RiskEngineService],
  exports: [RiskEngineService],
})
export class RiskModule {}