"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const transactions_service_1 = require("./services/transactions.service");
const commissions_service_1 = require("./services/commissions.service");
const withdrawals_service_1 = require("./services/withdrawals.service");
const orders_service_1 = require("./services/orders.service");
const positions_service_1 = require("./services/positions.service");
const products_service_1 = require("./services/products.service");
const payouts_service_1 = require("./services/payouts.service");
const yield_distribution_service_1 = require("./services/yield-distribution.service");
const order_processing_service_1 = require("./services/order-processing.service");
const order_validation_service_1 = require("./services/order-validation.service");
const position_calculation_service_1 = require("./services/position-calculation.service");
const transactions_controller_1 = require("./controllers/transactions.controller");
const commissions_controller_1 = require("./controllers/commissions.controller");
const withdrawals_controller_1 = require("./controllers/withdrawals.controller");
const orders_controller_1 = require("./controllers/orders.controller");
const positions_controller_1 = require("./controllers/positions.controller");
const products_controller_1 = require("./controllers/products.controller");
const payouts_controller_1 = require("./controllers/payouts.controller");
const yield_distribution_controller_1 = require("./controllers/yield-distribution.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const risk_engine_service_1 = require("../risk/risk-engine.service");
const database_module_1 = require("../database/database.module");
const database_optimization_module_1 = require("../common/database/database-optimization.module");
const blockchain_module_1 = require("../blockchain/blockchain.module");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            schedule_1.ScheduleModule.forRoot(),
            database_module_1.DatabaseModule,
            database_optimization_module_1.DatabaseOptimizationModule,
            blockchain_module_1.BlockchainModule
        ],
        providers: [
            transactions_service_1.TransactionsService,
            commissions_service_1.CommissionsService,
            withdrawals_service_1.WithdrawalsService,
            orders_service_1.OrdersService,
            positions_service_1.PositionsService,
            products_service_1.ProductsService,
            payouts_service_1.PayoutsService,
            yield_distribution_service_1.YieldDistributionService,
            order_processing_service_1.OrderProcessingService,
            order_validation_service_1.OrderValidationService,
            position_calculation_service_1.PositionCalculationService,
            prisma_service_1.PrismaService,
            risk_engine_service_1.RiskEngineService
        ],
        controllers: [
            transactions_controller_1.TransactionsController,
            transactions_controller_1.LegacyTransactionsController,
            commissions_controller_1.CommissionsController,
            withdrawals_controller_1.WithdrawalsController,
            orders_controller_1.OrdersController,
            positions_controller_1.PositionsController,
            products_controller_1.ProductsController,
            payouts_controller_1.PayoutsController,
            yield_distribution_controller_1.YieldDistributionController
        ],
        exports: [
            transactions_service_1.TransactionsService,
            commissions_service_1.CommissionsService,
            withdrawals_service_1.WithdrawalsService,
            orders_service_1.OrdersService,
            positions_service_1.PositionsService,
            products_service_1.ProductsService,
            payouts_service_1.PayoutsService,
            yield_distribution_service_1.YieldDistributionService,
            order_processing_service_1.OrderProcessingService,
            order_validation_service_1.OrderValidationService,
            position_calculation_service_1.PositionCalculationService
        ]
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map