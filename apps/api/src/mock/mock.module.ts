import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MockDatabaseService } from '../database/mock-database.service';
import { MockProductsService } from '../products/mock-products.service';
import { MockOrdersService } from '../orders/mock-orders.service';
import { PayoutsService } from '../payouts/payouts.service';
import { PositionsService } from '../positions/positions.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';

/**
 * Mock模块 - 仅用于测试环境
 * 生产环境不应该加载此模块
 */
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    // Mock服务实例
    MockDatabaseService,
    MockProductsService,
    MockOrdersService,
    PayoutsService,
    PositionsService,
    
    // 根据配置决定是否使用Mock服务
    {
      provide: ProductsService,
      useFactory: (configService: ConfigService, mockService: MockProductsService) => {
        const useMock = configService.get<string>('USE_MOCK_SERVICES') === 'true';
        const nodeEnv = configService.get<string>('NODE_ENV');
        
        if (useMock || nodeEnv === 'test') {
          return mockService;
        }
        // 在非测试环境，不应该从Mock模块提供真实服务
        throw new Error('Real ProductsService should not be provided by MockModule');
      },
      inject: [ConfigService, MockProductsService],
    },
    {
      provide: OrdersService,
      useFactory: (configService: ConfigService, mockService: MockOrdersService) => {
        const useMock = configService.get<string>('USE_MOCK_SERVICES') === 'true';
        const nodeEnv = configService.get<string>('NODE_ENV');
        
        if (useMock || nodeEnv === 'test') {
          return mockService;
        }
        // 在非测试环境，不应该从Mock模块提供真实服务
        throw new Error('Real OrdersService should not be provided by MockModule');
      },
      inject: [ConfigService, MockOrdersService],
    },
  ],
  exports: [MockDatabaseService, MockProductsService, MockOrdersService],
})
export class MockModule {}