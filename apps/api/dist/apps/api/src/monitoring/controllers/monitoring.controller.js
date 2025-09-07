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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("../../common/metrics/metrics.service");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const monitoring_service_1 = require("../services/monitoring.service");
const dto_1 = require("../dto");
let MonitoringController = class MonitoringController {
    constructor(monitoringService, metricsService) {
        this.monitoringService = monitoringService;
        this.metricsService = metricsService;
    }
    async getMetrics(query) {
        const monitoringQuery = {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            level: query.level,
            module: query.module,
            userId: query.userId,
            limit: query.limit,
            offset: query.offset
        };
        return this.monitoringService.getMetrics(monitoringQuery);
    }
    async getDashboard(timeRange = '24h') {
        return this.monitoringService.getDashboardData(timeRange);
    }
    async getDeprecationStats() {
        return {
            timestamp: new Date(),
            items: this.metricsService.getDeprecationStats(),
        };
    }
    async getLogs(query, headers, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0');
        this.monitoringService['logger'].warn('Deprecated API called', {
            endpoint: '/monitoring/logs',
            userAgent: headers['user-agent'],
            ip: headers['x-forwarded-for'] || 'unknown'
        });
        const monitoringQuery = {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            level: query.level,
            module: query.module,
            limit: query.limit,
            offset: query.offset
        };
        return this.monitoringService.getLogs(monitoringQuery);
    }
    async getAuditLogs(query, headers, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0');
        this.monitoringService['logger'].warn('Deprecated API called', {
            endpoint: '/monitoring/audit',
            userAgent: headers['user-agent']
        });
        const monitoringQuery = {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            userId: query.userId,
            limit: query.limit,
            offset: query.offset
        };
        return this.monitoringService.getAuditLogs(monitoringQuery);
    }
    async getAlerts(query, headers, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0');
        this.monitoringService['logger'].warn('Deprecated API called', {
            endpoint: '/monitoring/alerts',
            userAgent: headers['user-agent']
        });
        const monitoringQuery = {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            limit: query.limit,
            offset: query.offset
        };
        return this.monitoringService.getAlerts(monitoringQuery);
    }
    async getPerformanceData(query, headers, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0');
        this.monitoringService['logger'].warn('Deprecated API called', {
            endpoint: '/monitoring/performance',
            userAgent: headers['user-agent']
        });
        const monitoringQuery = {
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            limit: query.limit,
            offset: query.offset
        };
        return this.monitoringService.getPerformanceData(monitoringQuery);
    }
    async createAlert(createAlertDto) {
        return this.monitoringService.createAlert(createAlertDto);
    }
    async resolveAlert(id, resolveAlertDto) {
        return this.monitoringService.resolveAlert(id, resolveAlertDto.resolution);
    }
    async exportData(exportDto, res) {
        const monitoringQuery = {
            startDate: exportDto.startDate ? new Date(exportDto.startDate) : undefined,
            endDate: exportDto.endDate ? new Date(exportDto.endDate) : undefined,
            level: exportDto.level,
            module: exportDto.module
        };
        const data = await this.monitoringService.exportData(monitoringQuery, exportDto.format);
        const filename = `monitoring_${new Date().toISOString().split('T')[0]}.${exportDto.format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (exportDto.format === 'json') {
            res.setHeader('Content-Type', 'application/json');
        }
        else if (exportDto.format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
        }
        else if (exportDto.format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        res.send(data);
    }
    async healthCheck() {
        const systemStatus = await this.monitoringService['getSystemStatus']();
        return {
            status: systemStatus.status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            issues: systemStatus.issues
        };
    }
    async getRealtimeMetrics(res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        const interval = setInterval(async () => {
            try {
                const metrics = await this.monitoringService.getMetrics();
                res.write(`data: ${JSON.stringify(metrics)}\n\n`);
            }
            catch (error) {
                console.error('Failed to send realtime metrics:', error);
                res.write('data: {"error": "Failed to get metrics"}\n\n');
            }
        }, 5000);
        res.on('close', () => {
            clearInterval(interval);
        });
        res.on('error', () => {
            clearInterval(interval);
        });
    }
    async getPerformanceOptimizationReport() {
        return this.monitoringService.getPerformanceOptimizationReport();
    }
    async getQueryOptimizationStats(query) {
        return this.monitoringService.getQueryOptimizationStats({
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            limit: query.limit,
            offset: query.offset
        });
    }
    async getCachePerformanceStats() {
        return this.monitoringService.getCachePerformanceStats();
    }
    async clearPerformanceCache() {
        return this.monitoringService.clearPerformanceCache();
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMetricsDto]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('deprecations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDeprecationStats", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMetricsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('audit'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMetricsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMetricsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMetricsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPerformanceData", null);
__decorate([
    (0, common_1.Post)('alerts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAlertDto]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Patch)('alerts/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ResolveAlertDto]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ExportDataDto, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "exportData", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('realtime'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getRealtimeMetrics", null);
__decorate([
    (0, common_1.Get)('performance-optimization'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPerformanceOptimizationReport", null);
__decorate([
    (0, common_1.Get)('query-optimization'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetMetricsDto]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getQueryOptimizationStats", null);
__decorate([
    (0, common_1.Get)('cache-performance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCachePerformanceStats", null);
__decorate([
    (0, common_1.Post)('performance/clear-cache'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "clearPerformanceCache", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)('monitoring'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService,
        metrics_service_1.MetricsService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map