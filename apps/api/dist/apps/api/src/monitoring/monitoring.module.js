"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const monitoring_service_1 = require("./services/monitoring.service");
const reports_service_1 = require("./services/reports.service");
const notifications_service_1 = require("./services/notifications.service");
const monitoring_controller_1 = require("./controllers/monitoring.controller");
const reports_controller_1 = require("./controllers/reports.controller");
const notifications_controller_1 = require("./controllers/notifications.controller");
const performance_optimizer_service_1 = require("../common/performance/performance-optimizer.service");
const optimized_queries_service_1 = require("../common/database/optimized-queries.service");
const database_module_1 = require("../database/database.module");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            database_module_1.DatabaseModule
        ],
        providers: [
            monitoring_service_1.MonitoringService,
            reports_service_1.ReportsService,
            notifications_service_1.NotificationsService,
            performance_optimizer_service_1.PerformanceOptimizerService,
            optimized_queries_service_1.OptimizedQueriesService
        ],
        controllers: [
            monitoring_controller_1.MonitoringController,
            reports_controller_1.ReportsController,
            notifications_controller_1.NotificationsController
        ],
        exports: [
            monitoring_service_1.MonitoringService,
            reports_service_1.ReportsService,
            notifications_service_1.NotificationsService
        ]
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map