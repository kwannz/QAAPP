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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("../common/metrics/metrics.service");
const error_utils_1 = require("../common/utils/error.utils");
let HealthController = class HealthController {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'QA App API',
            version: '1.0.0',
            message: 'API server is running'
        };
    }
    getApiHealth() {
        return {
            status: 'healthy',
            service: 'API Service',
            endpoints: [
                '/api/auth',
                '/api/health',
                '/api/mock',
            ],
            timestamp: new Date().toISOString(),
        };
    }
    async getDetailedHealth() {
        try {
            const systemStatus = this.metricsService.getSystemStatus();
            return {
                timestamp: new Date().toISOString(),
                overall: 'healthy',
                system: {
                    uptime: systemStatus.uptime,
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                    requests: systemStatus.totalRequests,
                    errors: systemStatus.totalErrors,
                    errorRate: systemStatus.errorRate,
                },
                services: {
                    auth: 'healthy',
                    database: 'healthy',
                    cache: 'healthy'
                }
            };
        }
        catch (error) {
            return {
                timestamp: new Date().toISOString(),
                overall: 'unhealthy',
                error: (0, error_utils_1.getErrorMessage)(error),
                system: {
                    uptime: `${Math.floor(process.uptime())}s`,
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                }
            };
        }
    }
    async getMetrics() {
        try {
            const systemStatus = this.metricsService.getSystemStatus();
            const allMetrics = this.metricsService.getAllMetrics();
            return {
                timestamp: new Date().toISOString(),
                system: systemStatus,
                metrics: allMetrics.slice(0, 20),
            };
        }
        catch (error) {
            return {
                timestamp: new Date().toISOString(),
                error: (0, error_utils_1.getErrorMessage)(error),
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('api'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getApiHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDetailedHealth", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getMetrics", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], HealthController);
//# sourceMappingURL=health.controller.js.map