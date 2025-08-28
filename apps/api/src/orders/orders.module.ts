import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MockOrdersService } from './mock-orders.service';
import { DatabaseModule } from '../database/database.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ProductsModule } from '../products/products.module';
import { PositionsModule } from '../positions/positions.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BlockchainModule, 
    ProductsModule,
    PositionsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, MockOrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}