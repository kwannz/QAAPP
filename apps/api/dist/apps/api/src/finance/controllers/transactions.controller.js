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
exports.LegacyTransactionsController = exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const transactions_service_1 = require("../services/transactions.service");
const dto_1 = require("../dto");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async getTransactions(query) {
        const transactionQuery = {
            userId: query.userId,
            type: query.type,
            status: query.status,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            limit: query.limit,
            offset: query.offset
        };
        return this.transactionsService.findAll(transactionQuery);
    }
    async getTransaction(id) {
        return this.transactionsService.findOne(id);
    }
    async updateTransactionStatus(id, updateDto) {
        return this.transactionsService.updateStatus(id, updateDto.status, updateDto.metadata);
    }
    async processTransaction(id, processDto) {
        return this.transactionsService.processTransaction(id, processDto.action, processDto.reason);
    }
    async bulkUpdateStatus(body) {
        if (!body.ids || body.ids.length === 0) {
            throw new common_1.BadRequestException('IDs array is required');
        }
        return this.transactionsService.bulkUpdateStatus(body.ids, body.status, body.metadata);
    }
    async getStatistics(query) {
        const transactionQuery = {
            userId: query.userId,
            type: query.type,
            status: query.status,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined
        };
        return this.transactionsService.getStatistics(transactionQuery);
    }
    async getOverview(timeRange) {
        return this.transactionsService.getOverview(timeRange);
    }
    async exportTransactions(exportDto, res) {
        const transactionQuery = {
            userId: exportDto.userId,
            type: exportDto.type,
            status: exportDto.status,
            startDate: exportDto.startDate ? new Date(exportDto.startDate) : undefined,
            endDate: exportDto.endDate ? new Date(exportDto.endDate) : undefined
        };
        const data = await this.transactionsService.exportTransactions(transactionQuery, exportDto.format);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `transactions_${timestamp}.${exportDto.format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (exportDto.format === 'json') {
            res.setHeader('Content-Type', 'application/json');
        }
        else if (exportDto.format === 'csv') {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.write('\ufeff');
        }
        else if (exportDto.format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        res.send(data);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorator_1.Auth)('ADMIN', 'AGENT'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetTransactionsDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, auth_decorator_1.Auth)('ADMIN', 'AGENT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTransactionStatusDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "updateTransactionStatus", null);
__decorate([
    (0, common_1.Post)(':id/process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ProcessTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "processTransaction", null);
__decorate([
    (0, common_1.Patch)('bulk/status'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "bulkUpdateStatus", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, auth_decorator_1.Auth)('ADMIN', 'AGENT'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetTransactionsDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('overview/:timeRange'),
    (0, auth_decorator_1.Auth)('ADMIN', 'AGENT'),
    __param(0, (0, common_1.Param)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ExportTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportTransactions", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('finance/transactions'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
let LegacyTransactionsController = class LegacyTransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async getLegacyPayouts(query, headers, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=PAYOUT instead. This endpoint will be removed in v2.0');
        res.setHeader('X-Migration-Guide', 'https://docs.qa-app.com/api/migration/payouts');
        console.warn('Deprecated API called: /payouts', {
            userAgent: headers['user-agent'],
            ip: headers['x-forwarded-for'] || 'unknown',
            timestamp: new Date().toISOString()
        });
        const transactionQuery = {
            ...query,
            type: 'PAYOUT',
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined
        };
        const result = await this.transactionsService.findAll(transactionQuery);
        return {
            data: result.data.filter(tx => tx.type === 'PAYOUT').map(tx => ({
                id: tx.id,
                userId: tx.userId,
                userEmail: tx.userEmail,
                amount: tx.amount,
                currency: tx.currency,
                status: tx.status,
                commissionId: tx.metadata?.commissionId,
                createdAt: tx.createdAt,
                updatedAt: tx.updatedAt,
                completedAt: tx.completedAt
            })),
            total: result.total,
            page: result.page,
            pageSize: result.pageSize
        };
    }
    async getLegacyWithdrawals(query, headers, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=WITHDRAWAL instead. This endpoint will be removed in v2.0');
        res.setHeader('X-Migration-Guide', 'https://docs.qa-app.com/api/migration/withdrawals');
        console.warn('Deprecated API called: /withdrawals', {
            userAgent: headers['user-agent'],
            ip: headers['x-forwarded-for'] || 'unknown',
            timestamp: new Date().toISOString()
        });
        const transactionQuery = {
            ...query,
            type: 'WITHDRAWAL',
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined
        };
        const result = await this.transactionsService.findAll(transactionQuery);
        return {
            data: result.data.filter(tx => tx.type === 'WITHDRAWAL').map(tx => ({
                id: tx.id,
                userId: tx.userId,
                userEmail: tx.userEmail,
                amount: tx.amount,
                currency: tx.currency,
                method: tx.method,
                status: tx.status,
                bankAccount: tx.metadata?.bankAccount,
                alipayAccount: tx.metadata?.alipayAccount,
                walletAddress: tx.metadata?.walletAddress,
                createdAt: tx.createdAt,
                updatedAt: tx.updatedAt,
                completedAt: tx.completedAt,
                rejectReason: tx.failureReason
            })),
            total: result.total,
            page: result.page,
            pageSize: result.pageSize
        };
    }
};
exports.LegacyTransactionsController = LegacyTransactionsController;
__decorate([
    (0, common_1.Get)('payouts'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetTransactionsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LegacyTransactionsController.prototype, "getLegacyPayouts", null);
__decorate([
    (0, common_1.Get)('withdrawals'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetTransactionsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LegacyTransactionsController.prototype, "getLegacyWithdrawals", null);
exports.LegacyTransactionsController = LegacyTransactionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], LegacyTransactionsController);
//# sourceMappingURL=transactions.controller.js.map