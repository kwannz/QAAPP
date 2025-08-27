import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ContractService } from './contract.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    BlockchainService,
    ContractService,
  ],
  exports: [
    BlockchainService,
    ContractService,
  ],
})
export class BlockchainModule {}