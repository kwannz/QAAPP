import { Module } from '@nestjs/common';
import { MockDatabaseService } from '../database/mock-database.service';
import { MockProductsService } from '../products/mock-products.service';
import { MockOrdersService } from '../orders/mock-orders.service';
import { PayoutsService } from '../payouts/payouts.service';
import { PositionsService } from '../positions/positions.service';
import { ProductsController } from '../products/products.controller';
import { OrdersController } from '../orders/orders.controller';
import { PositionsController } from '../positions/positions.controller';

@Module({
  controllers: [
    ProductsController, 
    OrdersController, 
    PositionsController,
  ],
  providers: [
    MockDatabaseService,
    MockProductsService,
    MockOrdersService,
    PayoutsService,
    PositionsService,
    {
      provide: 'ProductsService',
      useExisting: MockProductsService,
    },
    {
      provide: 'OrdersService', 
      useExisting: MockOrdersService,
    },
  ],
  exports: [MockDatabaseService, PayoutsService, PositionsService],
})
export class MockModule {}