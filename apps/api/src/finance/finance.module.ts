import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

// 核心金融服务
import { TransactionsService } from './services/transactions.service'
import { CommissionsService } from './services/commissions.service'
import { WithdrawalsService } from './services/withdrawals.service'

// 整合的业务服务
import { OrdersService } from './services/orders.service'
import { PositionsService } from './services/positions.service'
import { ProductsService } from './services/products.service'
import { PayoutsService } from './services/payouts.service'
import { YieldDistributionService } from './services/yield-distribution.service'
import { OrderProcessingService } from './services/order-processing.service'
import { OrderValidationService } from './services/order-validation.service'
import { PositionCalculationService } from './services/position-calculation.service'

// 控制器
import { TransactionsController, LegacyTransactionsController } from './controllers/transactions.controller'
import { CommissionsController } from './controllers/commissions.controller'
import { WithdrawalsController } from './controllers/withdrawals.controller'
import { OrdersController } from './controllers/orders.controller'
import { PositionsController } from './controllers/positions.controller'
import { ProductsController } from './controllers/products.controller'
import { PayoutsController } from './controllers/payouts.controller'
import { YieldDistributionController } from './controllers/yield-distribution.controller'

// 外部依赖
import { PrismaService } from '../prisma/prisma.service'
import { RiskEngineService } from '../risk/risk-engine.service'
import { DatabaseModule } from '../database/database.module'
import { BlockchainModule } from '../blockchain/blockchain.module'

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    BlockchainModule
  ],
  providers: [
    // Core Finance Services
    TransactionsService,
    CommissionsService,
    WithdrawalsService,
    // Consolidated Business Services
    OrdersService,
    PositionsService,
    ProductsService,
    PayoutsService,
    YieldDistributionService,
    OrderProcessingService,
    OrderValidationService,
    PositionCalculationService,
    // Dependencies
    PrismaService,
    RiskEngineService
  ],
  controllers: [
    // Legacy support controllers
    TransactionsController,
    LegacyTransactionsController,
    // Consolidated finance controllers
    CommissionsController,
    WithdrawalsController,
    // Integrated business controllers
    OrdersController,
    PositionsController,
    ProductsController,
    PayoutsController,
    YieldDistributionController
  ],
  exports: [
    TransactionsService,
    CommissionsService,
    WithdrawalsService,
    OrdersService,
    PositionsService,
    ProductsService,
    PayoutsService,
    YieldDistributionService,
    OrderProcessingService,
    OrderValidationService,
    PositionCalculationService
  ]
})
export class FinanceModule {}