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
var WithdrawalsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const withdrawals_service_1 = require("../services/withdrawals.service");
const deprecated_decorator_1 = require("../../common/decorators/deprecated.decorator");
let WithdrawalsController = WithdrawalsController_1 = class WithdrawalsController {
    constructor(withdrawalsService) {
        this.withdrawalsService = withdrawalsService;
        this.logger = new common_1.Logger(WithdrawalsController_1.name);
    }
    async createWithdrawal(createDto, req) {
        return this.withdrawalsService.createWithdrawal(createDto, req.user.sub);
    }
    async getWithdrawals(query, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=WITHDRAWAL instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: GET /finance/withdrawals');
        return this.withdrawalsService.getWithdrawals(query);
    }
    async getWithdrawalStats(res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/stats instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: GET /finance/withdrawals/stats');
        return this.withdrawalsService.getWithdrawalStats();
    }
    async getWithdrawalById(id, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/:id instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: GET /finance/withdrawals/:id');
        return this.withdrawalsService.getWithdrawalById(id);
    }
    async updateWithdrawal(id, updateDto, req, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/:id/process or status endpoints instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: PUT /finance/withdrawals/:id');
        return this.withdrawalsService.updateWithdrawal(id, updateDto, req.user.sub);
    }
    async batchUpdateWithdrawals(batchData, req, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/bulk/status instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: PUT /finance/withdrawals/batch');
        return this.withdrawalsService.batchUpdateWithdrawals(batchData.ids, batchData.updateDto, req.user.sub);
    }
};
exports.WithdrawalsController = WithdrawalsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new withdrawal request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Withdrawal request created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "createWithdrawal", null);
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get withdrawals with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Withdrawals retrieved' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "getWithdrawals", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get withdrawal statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Withdrawal statistics retrieved' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "getWithdrawalStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get withdrawal by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Withdrawal retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "getWithdrawalById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update withdrawal status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Withdrawal updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "updateWithdrawal", null);
__decorate([
    (0, common_1.Put)('batch'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch update withdrawals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Withdrawals batch updated' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "batchUpdateWithdrawals", null);
exports.WithdrawalsController = WithdrawalsController = WithdrawalsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Finance - Withdrawals'),
    (0, common_1.Controller)('finance/withdrawals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, deprecated_decorator_1.Deprecated)({
        since: 'v2.1.0',
        until: 'v3.0.0',
        replacement: '/api/finance/transactions',
        reason: 'Withdrawals integrated into unified transactions API'
    }),
    __metadata("design:paramtypes", [withdrawals_service_1.WithdrawalsService])
], WithdrawalsController);
//# sourceMappingURL=withdrawals.controller.js.map