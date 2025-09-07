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
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_1 = require("@qa-app/database");
const database_service_1 = require("../../database/database.service");
const performance_optimizer_service_1 = require("../../common/performance/performance-optimizer.service");
const mapping_interface_1 = require("../interfaces/mapping.interface");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    constructor(configService, database, performanceOptimizer) {
        this.configService = configService;
        this.database = database;
        this.performanceOptimizer = performanceOptimizer;
        this.logger = new common_1.Logger(TransactionsService_1.name);
    }
    async findAll(query = {}) {
        const cacheKey = `transactions:${JSON.stringify(query)}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const limit = query.limit || 50;
            const offset = query.offset || 0;
            const where = {};
            if (query.userId) {
                where.userId = query.userId;
            }
            if (query.startDate || query.endDate) {
                where.createdAt = {};
                if (query.startDate) {
                    where.createdAt.gte = query.startDate;
                }
                if (query.endDate) {
                    where.createdAt.lte = query.endDate;
                }
            }
            return this.executeTransactionQuery(where, query, limit, offset);
        }, {
            ttl: 2 * 60 * 1000,
            tags: ['transactions', `user_${query.userId}`]
        });
    }
    async executeTransactionQuery(where, query, limit, offset) {
        try {
            const statusFilter = {};
            if (query.status) {
                statusFilter.status = query.status;
            }
            let payouts = [];
            let withdrawals = [];
            let totalCount = 0;
            if (query.type === 'PAYOUT' || !query.type) {
                const payoutWhere = {
                    ...where,
                    ...(query.status && query.status !== 'PENDING' ? { claimedAt: query.status === 'COMPLETED' ? { not: null } : null } : {}),
                };
                const [payoutData, payoutCount] = await Promise.all([
                    this.database.payout.findMany({
                        where: payoutWhere,
                        include: {
                            user: { select: { id: true, email: true } },
                            position: { select: { id: true } },
                        },
                        orderBy: { createdAt: 'desc' },
                        take: query.type === 'PAYOUT' ? limit : undefined,
                        skip: query.type === 'PAYOUT' ? offset : undefined,
                    }),
                    this.database.payout.count({ where: payoutWhere }),
                ]);
                payouts = payoutData;
                totalCount += payoutCount;
            }
            if (query.type === 'WITHDRAWAL' || !query.type) {
                const withdrawalWhere = {
                    ...where,
                };
                if (query.status) {
                    const withdrawalStatus = query.status === 'COMPLETED'
                        ? database_1.WithdrawalStatus.COMPLETED
                        : query.status === 'PENDING'
                            ? database_1.WithdrawalStatus.PENDING
                            : query.status === 'PROCESSING'
                                ? database_1.WithdrawalStatus.PROCESSING
                                : query.status === 'FAILED' ? database_1.WithdrawalStatus.FAILED : null;
                    if (withdrawalStatus) {
                        withdrawalWhere.status = withdrawalStatus;
                    }
                }
                const [withdrawalData, withdrawalCount] = await Promise.all([
                    this.database.withdrawal.findMany({
                        where: withdrawalWhere,
                        include: {
                            user: { select: { id: true, email: true } },
                        },
                        orderBy: { createdAt: 'desc' },
                        take: query.type === 'WITHDRAWAL' ? limit : undefined,
                        skip: query.type === 'WITHDRAWAL' ? offset : undefined,
                    }),
                    this.database.withdrawal.count({ where: withdrawalWhere }),
                ]);
                withdrawals = withdrawalData;
                totalCount += withdrawalCount;
            }
            const payoutTransactions = Array.isArray(payouts)
                ? payouts.map(payout => ({
                    id: payout.id,
                    type: 'PAYOUT',
                    userId: payout.userId,
                    userEmail: payout.user.email || 'N/A',
                    amount: Number(payout.amount),
                    currency: 'USDT',
                    method: 'SYSTEM',
                    status: payout.claimedAt ? 'COMPLETED' : 'PENDING',
                    metadata: {
                        positionId: payout.positionId,
                        periodStart: payout.periodStart,
                        periodEnd: payout.periodEnd,
                        claimTxHash: payout.claimTxHash,
                        originalType: 'PAYOUT',
                    },
                    createdAt: payout.createdAt,
                    updatedAt: payout.updatedAt,
                    completedAt: payout.claimedAt,
                    failureReason: undefined,
                }))
                : [];
            const withdrawalTransactions = Array.isArray(withdrawals)
                ? withdrawals.map(withdrawal => ({
                    id: withdrawal.id,
                    type: 'WITHDRAWAL',
                    userId: withdrawal.userId,
                    userEmail: withdrawal.user.email || 'N/A',
                    amount: Number(withdrawal.amount),
                    currency: 'USDT',
                    method: this.getWithdrawalMethod(withdrawal.chainId),
                    status: this.mapWithdrawalStatus(withdrawal.status),
                    metadata: {
                        walletAddress: withdrawal.walletAddress,
                        chainId: withdrawal.chainId,
                        platformFee: withdrawal.platformFee,
                        actualAmount: withdrawal.actualAmount,
                        txHash: withdrawal.txHash,
                        riskScore: withdrawal.riskScore,
                        originalType: 'WITHDRAWAL',
                    },
                    createdAt: withdrawal.createdAt,
                    updatedAt: withdrawal.updatedAt,
                    completedAt: mapping_interface_1.FinanceMappingUtils.nullToUndefined(withdrawal.completedAt),
                    failureReason: mapping_interface_1.FinanceMappingUtils.nullToUndefined(withdrawal.rejectionReason),
                }))
                : [];
            const allTransactions = [...payoutTransactions, ...withdrawalTransactions];
            allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            let paginatedData = allTransactions;
            const total = totalCount;
            if (query.type === 'ALL' || !query.type) {
                paginatedData = allTransactions.slice(offset, offset + limit);
            }
            return {
                data: paginatedData,
                total,
                page: Math.floor(offset / limit) + 1,
                pageSize: limit,
            };
        }
        catch (error) {
            this.logger.error('Failed to get transactions', error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const payout = await this.database.payout.findUnique({
                where: { id },
                include: {
                    user: { select: { id: true, email: true } },
                    position: { select: { id: true } },
                },
            });
            if (payout) {
                return {
                    id: payout.id,
                    type: 'PAYOUT',
                    userId: payout.userId,
                    userEmail: payout.user.email || 'N/A',
                    amount: Number(payout.amount),
                    currency: 'USDT',
                    method: 'SYSTEM',
                    status: payout.claimedAt ? 'COMPLETED' : 'PENDING',
                    metadata: {
                        positionId: payout.positionId,
                        periodStart: payout.periodStart,
                        periodEnd: payout.periodEnd,
                        claimTxHash: payout.claimTxHash,
                        originalType: 'PAYOUT',
                    },
                    createdAt: payout.createdAt,
                    updatedAt: payout.updatedAt,
                    completedAt: mapping_interface_1.FinanceMappingUtils.nullToUndefined(payout.claimedAt),
                    failureReason: undefined,
                };
            }
            const withdrawal = await this.database.withdrawal.findUnique({
                where: { id },
                include: {
                    user: { select: { id: true, email: true } },
                },
            });
            if (withdrawal) {
                return {
                    id: withdrawal.id,
                    type: 'WITHDRAWAL',
                    userId: withdrawal.userId,
                    userEmail: withdrawal.user.email || 'N/A',
                    amount: Number(withdrawal.amount),
                    currency: 'USDT',
                    method: this.getWithdrawalMethod(withdrawal.chainId),
                    status: this.mapWithdrawalStatus(withdrawal.status),
                    metadata: {
                        walletAddress: withdrawal.walletAddress,
                        chainId: withdrawal.chainId,
                        platformFee: withdrawal.platformFee,
                        actualAmount: withdrawal.actualAmount,
                        txHash: withdrawal.txHash,
                        riskScore: withdrawal.riskScore,
                        originalType: 'WITHDRAWAL',
                    },
                    createdAt: withdrawal.createdAt,
                    updatedAt: withdrawal.updatedAt,
                    completedAt: mapping_interface_1.FinanceMappingUtils.nullToUndefined(withdrawal.completedAt),
                    failureReason: mapping_interface_1.FinanceMappingUtils.nullToUndefined(withdrawal.rejectionReason),
                };
            }
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to get transaction', error);
            throw error;
        }
    }
    async updateStatus(id, status, metadata) {
        try {
            const payout = await this.database.payout.findUnique({ where: { id } });
            if (payout) {
                const updatedPayout = await this.database.payout.update({
                    where: { id },
                    data: {
                        ...(status === 'COMPLETED' && { claimedAt: new Date() }),
                        updatedAt: new Date(),
                    },
                    include: {
                        user: { select: { id: true, email: true } },
                        position: { select: { id: true } },
                    },
                });
                this.logger.log(`Payout transaction ${id} status updated to ${status}`);
                return {
                    id: updatedPayout.id,
                    type: 'PAYOUT',
                    userId: updatedPayout.userId,
                    userEmail: updatedPayout.user.email || 'N/A',
                    amount: Number(updatedPayout.amount),
                    currency: 'USDT',
                    method: 'SYSTEM',
                    status: updatedPayout.claimedAt ? 'COMPLETED' : 'PENDING',
                    metadata: {
                        ...metadata,
                        positionId: updatedPayout.positionId,
                        periodStart: updatedPayout.periodStart,
                        periodEnd: updatedPayout.periodEnd,
                        claimTxHash: updatedPayout.claimTxHash,
                        originalType: 'PAYOUT',
                    },
                    createdAt: updatedPayout.createdAt,
                    updatedAt: updatedPayout.updatedAt,
                    completedAt: mapping_interface_1.FinanceMappingUtils.nullToUndefined(updatedPayout.claimedAt),
                    failureReason: undefined,
                };
            }
            const withdrawal = await this.database.withdrawal.findUnique({ where: { id } });
            if (withdrawal) {
                const mappedStatus = this.mapStatusToWithdrawal(status);
                const updatedWithdrawal = await this.database.withdrawal.update({
                    where: { id },
                    data: {
                        status: mappedStatus,
                        ...(status === 'COMPLETED' && { completedAt: new Date() }),
                        ...(status === 'FAILED' && metadata?.failureReason && { rejectionReason: metadata.failureReason }),
                        updatedAt: new Date(),
                    },
                    include: {
                        user: { select: { id: true, email: true } },
                    },
                });
                this.logger.log(`Withdrawal transaction ${id} status updated to ${status}`);
                return {
                    id: updatedWithdrawal.id,
                    type: 'WITHDRAWAL',
                    userId: updatedWithdrawal.userId,
                    userEmail: updatedWithdrawal.user.email || 'N/A',
                    amount: Number(updatedWithdrawal.amount),
                    currency: 'USDT',
                    method: this.getWithdrawalMethod(updatedWithdrawal.chainId),
                    status: this.mapWithdrawalStatus(updatedWithdrawal.status),
                    metadata: {
                        ...(typeof updatedWithdrawal.metadata === 'object' && updatedWithdrawal.metadata !== null ? updatedWithdrawal.metadata : {}),
                        ...metadata,
                        walletAddress: updatedWithdrawal.walletAddress,
                        originalType: 'WITHDRAWAL',
                    },
                    createdAt: updatedWithdrawal.createdAt,
                    updatedAt: updatedWithdrawal.updatedAt,
                    completedAt: mapping_interface_1.FinanceMappingUtils.nullToUndefined(updatedWithdrawal.completedAt),
                    failureReason: mapping_interface_1.FinanceMappingUtils.nullToUndefined(updatedWithdrawal.rejectionReason),
                };
            }
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        catch (error) {
            this.logger.error('Failed to update transaction status', error);
            throw error;
        }
    }
    async bulkUpdateStatus(ids, status, metadata) {
        try {
            const updatePromises = ids.map(async (id) => this.updateStatus(id, status, metadata));
            const results = await Promise.allSettled(updatePromises);
            const successful = [];
            const failed = [];
            for (const [index, result] of results.entries()) {
                if (result.status === 'fulfilled') {
                    successful.push(result.value);
                }
                else {
                    failed.push(ids[index]);
                    this.logger.error(`Failed to update transaction ${ids[index]}:`, result.reason);
                }
            }
            if (failed.length > 0) {
                this.logger.warn(`Bulk update partially failed for IDs: ${failed.join(', ')}`);
            }
            return successful;
        }
        catch (error) {
            this.logger.error('Failed to bulk update transactions', error);
            throw error;
        }
    }
    async processTransaction(id, action, reason) {
        try {
            let newStatus;
            switch (action) {
                case 'APPROVE': {
                    newStatus = 'PROCESSING';
                    break;
                }
                case 'REJECT': {
                    newStatus = 'FAILED';
                    break;
                }
                case 'PROCESS': {
                    newStatus = 'COMPLETED';
                    break;
                }
                default: {
                    throw new common_1.BadRequestException(`Invalid action: ${action}`);
                }
            }
            return this.updateStatus(id, newStatus, { action, reason, processedAt: new Date() });
        }
        catch (error) {
            this.logger.error('Failed to process transaction', error);
            throw error;
        }
    }
    async getStatistics(query = {}) {
        try {
            const { data: transactions } = await this.findAll({ ...query, limit: 10_000 });
            const stats = {
                totalCount: transactions.length,
                totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                byStatus: {},
                byType: {},
                avgAmount: 0,
                recentTrend: [],
            };
            for (const tx of transactions) {
                stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1;
                stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
            }
            stats.avgAmount = stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0;
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get transaction statistics', error);
            throw error;
        }
    }
    async exportTransactions(query = {}, format = 'csv') {
        try {
            const { data: transactions } = await this.findAll({ ...query, limit: 10_000 });
            switch (format) {
                case 'csv': {
                    return this.generateCSV(transactions);
                }
                case 'json': {
                    return JSON.stringify(transactions, null, 2);
                }
                case 'excel': {
                    return Buffer.from('Excel placeholder');
                }
                default: {
                    throw new common_1.BadRequestException(`Unsupported format: ${format}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to export transactions', error);
            throw error;
        }
    }
    async getOverview(timeRange = '24h') {
        const endDate = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case '24h': {
                startDate.setDate(endDate.getDate() - 1);
                break;
            }
            case '7d': {
                startDate.setDate(endDate.getDate() - 7);
                break;
            }
            case '30d': {
                startDate.setDate(endDate.getDate() - 30);
                break;
            }
        }
        const stats = await this.getStatistics({ startDate, endDate });
        return {
            overall: stats,
            timeRange,
            lastUpdated: new Date(),
        };
    }
    mapWithdrawalStatus(status) {
        switch (status) {
            case 'COMPLETED': {
                return 'COMPLETED';
            }
            case 'PENDING':
            case 'REVIEWING':
            case 'APPROVED': {
                return 'PENDING';
            }
            case 'PROCESSING': {
                return 'PROCESSING';
            }
            case 'FAILED':
            case 'REJECTED':
            case 'CANCELED': {
                return 'FAILED';
            }
            default: {
                return 'PENDING';
            }
        }
    }
    mapStatusToWithdrawal(status) {
        switch (status) {
            case 'COMPLETED': {
                return database_1.WithdrawalStatus.COMPLETED;
            }
            case 'PENDING': {
                return database_1.WithdrawalStatus.PENDING;
            }
            case 'PROCESSING': {
                return database_1.WithdrawalStatus.PROCESSING;
            }
            case 'FAILED': {
                return database_1.WithdrawalStatus.FAILED;
            }
            default: {
                return database_1.WithdrawalStatus.PENDING;
            }
        }
    }
    getWithdrawalMethod(chainId) {
        switch (chainId) {
            case 1: {
                return 'ETHEREUM';
            }
            case 56: {
                return 'BSC';
            }
            case 137: {
                return 'POLYGON';
            }
            case 42_161: {
                return 'ARBITRUM';
            }
            default: {
                return 'CRYPTO';
            }
        }
    }
    generateCSV(transactions) {
        const headers = ['ID', '类型', '用户邮箱', '金额', '币种', '方式', '状态', '创建时间', '完成时间'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(tx => [
                tx.id,
                tx.type,
                tx.userEmail,
                tx.amount,
                tx.currency,
                tx.method,
                tx.status,
                tx.createdAt.toISOString(),
                tx.completedAt?.toISOString() || '',
            ].join(',')),
        ].join('\n');
        return csvContent;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService,
        performance_optimizer_service_1.PerformanceOptimizerService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map