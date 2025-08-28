import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MockProductsService } from './mock-products.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, MockProductsService],
  exports: [ProductsService, MockProductsService],
})
export class ProductsModule {}