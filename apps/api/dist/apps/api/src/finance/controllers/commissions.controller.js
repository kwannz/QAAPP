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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const commissions_service_1 = require("../services/commissions.service");
let CommissionsController = class CommissionsController {
    constructor(commissionsService) {
        this.commissionsService = commissionsService;
    }
    async getUserCommissionHistory(userId, pagination) {
        return this.commissionsService.getUserCommissionHistory(userId, pagination);
    }
    async getUserCommissionSummary(userId) {
        return this.commissionsService.getUserCommissionSummary(userId);
    }
    async getAdminCommissionList(filters) {
        return this.commissionsService.getAdminCommissionList(filters);
    }
    async getCommissionStats(period) {
        return this.commissionsService.getCommissionStats(period);
    }
    async calculateCommissions(calculationData) {
        return this.commissionsService.calculateCommissions(calculationData);
    }
    async processCommissionPayments(paymentData) {
        return this.commissionsService.processCommissionPayments(paymentData);
    }
    async getCommissionBreakdown(period, groupBy) {
        return this.commissionsService.getCommissionBreakdown(period, groupBy);
    }
    async updateCommissionStructure(structureData) {
        return this.commissionsService.updateCommissionStructure(structureData);
    }
    async getCommissionRules() {
        return this.commissionsService.getCommissionRules();
    }
    async updateCommissionRules(rulesData) {
        return this.commissionsService.updateCommissionRules(rulesData);
    }
    async generateCommissionReport(reportData) {
        return this.commissionsService.generateCommissionReport(reportData);
    }
    async exportCommissions(exportData) {
        return this.commissionsService.exportCommissions(exportData);
    }
    async validateCommissions(validationData) {
        return this.commissionsService.validateCommissions(validationData);
    }
    async retryFailedPayments(retryData) {
        return this.commissionsService.retryFailedPayments(retryData);
    }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, common_1.Get)('user/:userId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user commission history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User commission history retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getUserCommissionHistory", null);
__decorate([
    (0, common_1.Get)('user/:userId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user commission summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User commission summary retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getUserCommissionSummary", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin commission list with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin commission list retrieved' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getAdminCommissionList", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commission statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission statistics retrieved' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getCommissionStats", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate commissions for period' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission calculation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "calculateCommissions", null);
__decorate([
    (0, common_1.Post)('process-payments'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Process commission payments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission payments processed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "processCommissionPayments", null);
__decorate([
    (0, common_1.Get)('breakdown'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commission breakdown' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission breakdown retrieved' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('groupBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getCommissionBreakdown", null);
__decorate([
    (0, common_1.Put)('structure'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update commission structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission structure updated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "updateCommissionStructure", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commission rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission rules retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getCommissionRules", null);
__decorate([
    (0, common_1.Put)('rules'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update commission rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission rules updated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "updateCommissionRules", null);
__decorate([
    (0, common_1.Post)('reports/generate'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate commission report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission report generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "generateCommissionReport", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Export commission data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission data exported' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "exportCommissions", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate commission calculations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commission validation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "validateCommissions", null);
__decorate([
    (0, common_1.Post)('retry-failed-payments'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry failed commission payments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Failed payments retry completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "retryFailedPayments", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, swagger_1.ApiTags)('Finance - Commissions'),
    (0, common_1.Controller)('finance/commissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [commissions_service_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map