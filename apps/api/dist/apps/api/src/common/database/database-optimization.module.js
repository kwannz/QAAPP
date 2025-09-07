"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseOptimizationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("../../database/database.module");
const optimized_queries_service_1 = require("./optimized-queries.service");
const database_optimization_controller_1 = require("./database-optimization.controller");
const performance_optimizer_service_1 = require("../performance/performance-optimizer.service");
let DatabaseOptimizationModule = class DatabaseOptimizationModule {
};
exports.DatabaseOptimizationModule = DatabaseOptimizationModule;
exports.DatabaseOptimizationModule = DatabaseOptimizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
        ],
        controllers: [database_optimization_controller_1.DatabaseOptimizationController],
        providers: [
            optimized_queries_service_1.OptimizedQueriesService,
            performance_optimizer_service_1.PerformanceOptimizerService,
        ],
        exports: [
            optimized_queries_service_1.OptimizedQueriesService,
            performance_optimizer_service_1.PerformanceOptimizerService,
        ],
    })
], DatabaseOptimizationModule);
//# sourceMappingURL=database-optimization.module.js.map