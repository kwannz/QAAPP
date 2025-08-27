import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PayoutsService } from './payouts.service';
import { YieldDistributionService } from './yield-distribution.service';
import { PayoutsController } from './payouts.controller';
import { YieldDistributionController } from './yield-distribution.controller';
import { DatabaseModule } from '../database/database.module';
import { MockModule } from '../mock/mock.module';
import { PositionsModule } from '../positions/positions.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // DatabaseModule, // 暂时禁用数据库模块
    MockModule,
    PositionsModule,
    BlockchainModule, // 启用区块链模块
  ],
  providers: [
    PayoutsService,
    YieldDistributionService,
  ],
  controllers: [
    PayoutsController,
    YieldDistributionController,
  ],
  exports: [
    PayoutsService,
    YieldDistributionService,
  ],
})
export class PayoutsModule {}