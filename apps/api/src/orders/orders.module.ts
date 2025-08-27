import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../database/database.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BlockchainModule, 
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}