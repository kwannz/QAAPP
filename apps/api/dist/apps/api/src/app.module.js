"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const health_module_1 = require("./health/health.module");
const logger_module_1 = require("./common/logger/logger.module");
const metrics_module_1 = require("./common/metrics/metrics.module");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./users/users.module");
const blockchain_module_1 = require("./blockchain/blockchain.module");
const monitoring_interceptor_1 = require("./common/interceptors/monitoring.interceptor");
const cache_module_1 = require("./cache/cache.module");
const redis_module_1 = require("./cache/redis.module");
const websocket_module_1 = require("./websocket/websocket.module");
const monitoring_module_1 = require("./monitoring/monitoring.module");
const finance_module_1 = require("./finance/finance.module");
const database_optimization_module_1 = require("./common/database/database-optimization.module");
let AppModule = AppModule_1 = class AppModule {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AppModule_1.name);
        this.logger.log('🏗️  API App Module initialized');
        this.logger.log('🌍 Environment configured', { environment: this.configService.get('NODE_ENV') });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = AppModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                useFactory: (configService) => ([{
                        name: 'default',
                        ttl: 60 * 1000,
                        limit: 100,
                    }, {
                        name: 'auth',
                        ttl: 60 * 1000,
                        limit: 10,
                    }, {
                        name: 'sensitive',
                        ttl: 60 * 1000,
                        limit: 5,
                    }]),
                inject: [config_1.ConfigService],
            }),
            logger_module_1.LoggerModule,
            metrics_module_1.MetricsModule,
            redis_module_1.RedisModule,
            cache_module_1.CacheModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            users_module_1.UsersModule,
            websocket_module_1.WebSocketModule,
            blockchain_module_1.BlockchainModule,
            monitoring_module_1.MonitoringModule,
            finance_module_1.FinanceModule,
            database_optimization_module_1.DatabaseOptimizationModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: monitoring_interceptor_1.MonitoringInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppModule);
//# sourceMappingURL=app.module.js.map