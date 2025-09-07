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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("../services/reports.service");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async generateFinancialOverview(reportData) {
        return this.reportsService.generateFinancialOverview(reportData);
    }
    async generateCommissionReport(reportData) {
        return this.reportsService.generateCommissionReport(reportData);
    }
    async generateRevenueReport(reportData) {
        return this.reportsService.generateRevenueReport(reportData);
    }
    async generateInvestmentAnalysis(reportData) {
        return this.reportsService.generateInvestmentAnalysis(reportData);
    }
    async generateAgentPerformanceReport(reportData) {
        return this.reportsService.generateAgentPerformanceReport(reportData);
    }
    async generateCashFlowReport(reportData) {
        return this.reportsService.generateCashFlowReport(reportData);
    }
    async generateComplianceReport(reportData) {
        return this.reportsService.generateComplianceReport(reportData);
    }
    async getReportTemplates(category) {
        return this.reportsService.getReportTemplates(category);
    }
    async createReportTemplate(templateData) {
        return this.reportsService.createReportTemplate(templateData);
    }
    async getReportHistory(type, status, page = 1, limit = 20) {
        return this.reportsService.getReportHistory({
            type,
            status,
            page,
            limit
        });
    }
    async getReport(reportId) {
        return this.reportsService.getReport(reportId);
    }
    async downloadReport(reportId, res) {
        const result = await this.reportsService.downloadReport(reportId);
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
    }
    async scheduleReport(scheduleData) {
        return this.reportsService.scheduleReport(scheduleData);
    }
    async getScheduledReports(status, page = 1, limit = 20) {
        return this.reportsService.getScheduledReports({
            status,
            page,
            limit
        });
    }
    async cancelScheduledReport(scheduleId) {
        return this.reportsService.cancelScheduledReport(scheduleId);
    }
    async getReportStats(period) {
        return this.reportsService.getReportStats(period);
    }
    async getDashboardKPIs(period = '30d', comparison = 'previous_period') {
        return this.reportsService.getDashboardKPIs(period, comparison);
    }
    async exportReportData(exportData) {
        return this.reportsService.exportReportData(exportData);
    }
    async previewReport(previewData) {
        return this.reportsService.previewReport(previewData);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate financial overview report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Financial overview report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('financial/overview'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateFinancialOverview", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate commission report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('commissions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateCommissionReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate revenue report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('revenue'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateRevenueReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate investment analysis report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment analysis report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('investments/analysis'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateInvestmentAnalysis", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate agent performance report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Agent performance report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('agents/performance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateAgentPerformanceReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate cash flow report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cash flow report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('cashflow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateCashFlowReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate regulatory compliance report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Regulatory compliance report generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('compliance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateComplianceReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get report templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report templates retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportTemplates", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create custom report template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Report template created successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "createReportTemplate", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get report history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report history retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportHistory", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get report by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)(':reportId'),
    __param(0, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Download report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report downloaded successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)(':reportId/download'),
    __param(0, (0, common_1.Param)('reportId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Schedule report generation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Report scheduled successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "scheduleReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get scheduled reports' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scheduled reports retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('scheduled/list'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getScheduledReports", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cancel scheduled report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scheduled report cancelled successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('scheduled/:scheduleId/cancel'),
    __param(0, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "cancelScheduledReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get report statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report statistics retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('stats/overview'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate dashboard KPIs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard KPIs generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('dashboard/kpis'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('comparison')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDashboardKPIs", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Export report data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report data exported successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportReportData", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get report preview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report preview generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "previewReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map