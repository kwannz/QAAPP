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
var WithdrawalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const database_1 = require("@qa-app/database");
const risk_engine_service_1 = require("../../risk/risk-engine.service");
const performance_optimizer_service_1 = require("../../common/performance/performance-optimizer.service");
let WithdrawalsService = WithdrawalsService_1 = class WithdrawalsService {
    constructor(prisma, riskEngine, performanceOptimizer) {
        this.prisma = prisma;
        this.riskEngine = riskEngine;
        this.performanceOptimizer = performanceOptimizer;
        this.logger = new common_1.Logger(WithdrawalsService_1.name);
    }
    async createWithdrawal(createDto, actorId) {
        await this.validateUserBalance(createDto.userId, createDto.amount, createDto.withdrawalType);
        const platformFee = await this.calculateWithdrawalFee(createDto.amount, createDto.withdrawalType);
        const actualAmount = createDto.amount - platformFee;
        if (actualAmount <= 0) {
            throw new common_1.BadRequestException('提现金额过小，无法覆盖手续费');
        }
        const riskInput = {
            userId: createDto.userId,
            amount: createDto.amount,
            withdrawalType: createDto.withdrawalType,
            walletAddress: createDto.walletAddress,
            chainId: createDto.chainId,
            metadata: {
                ipAddress: '0.0.0.0',
                userAgent: 'API',
                deviceFingerprint: undefined,
            },
        };
        const riskAssessment = await this.riskEngine.performComprehensiveRiskAssessment(riskInput);
        const withdrawal = await this.prisma.withdrawal.create({
            data: {
                userId: createDto.userId,
                amount: new database_1.Prisma.Decimal(createDto.amount),
                withdrawalType: createDto.withdrawalType,
                walletAddress: createDto.walletAddress,
                chainId: createDto.chainId,
                platformFee: new database_1.Prisma.Decimal(platformFee),
                actualAmount: new database_1.Prisma.Decimal(actualAmount),
                riskScore: riskAssessment.riskScore,
                riskLevel: riskAssessment.riskLevel,
                riskFactors: riskAssessment.riskFactors.map(f => ({
                    category: f.category,
                    name: f.name,
                    description: f.description,
                    score: f.score,
                })),
                autoApproved: riskAssessment.autoApproved,
                kycVerified: await this.isKycVerified(createDto.userId),
                metadata: {
                    ipAddress: '0.0.0.0',
                    userAgent: 'API',
                    deviceFingerprint: null,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        referralCode: true,
                        kycStatus: true,
                    },
                },
            },
        });
        this.logger.debug('Audit log created:', {
            actorId,
            action: 'WITHDRAWAL_CREATED',
            resourceType: 'WITHDRAWAL',
            resourceId: withdrawal.id,
            metadata: {
                amount: createDto.amount,
                withdrawalType: createDto.withdrawalType,
                riskLevel: riskAssessment.riskLevel,
                autoApproved: riskAssessment.autoApproved,
            },
        });
        return withdrawal;
    }
    async getWithdrawals(query) {
        const { status, riskLevel, userId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = {};
        if (status)
            where.status = status;
        if (riskLevel)
            where.riskLevel = riskLevel;
        if (userId)
            where.userId = userId;
        const [withdrawals, total] = await Promise.all([
            this.prisma.withdrawal.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            referralCode: true,
                            kycStatus: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.withdrawal.count({ where }),
        ]);
        return {
            withdrawals,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getWithdrawalById(id) {
        const withdrawal = await this.prisma.withdrawal.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        referralCode: true,
                        kycStatus: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!withdrawal) {
            throw new common_1.NotFoundException('提现记录不存在');
        }
        return withdrawal;
    }
    async updateWithdrawal(id, updateDto, actorId) {
        const withdrawal = await this.getWithdrawalById(id);
        this.validateStatusTransition(withdrawal.status, updateDto.status);
        const updateData = {};
        if (updateDto.status) {
            updateData.status = updateDto.status;
            if (updateDto.status === database_1.WithdrawalStatus.APPROVED) {
                updateData.reviewedAt = new Date();
                updateData.reviewerId = actorId;
                updateData.autoApproved = false;
            }
            else if (updateDto.status === database_1.WithdrawalStatus.REJECTED) {
                updateData.reviewedAt = new Date();
                updateData.reviewerId = actorId;
                updateData.rejectionReason = updateDto.rejectionReason;
            }
            else if (updateDto.status === database_1.WithdrawalStatus.COMPLETED) {
                updateData.completedAt = new Date();
                updateData.processedAt = new Date();
                updateData.processedBy = actorId;
            }
        }
        if (updateDto.reviewNotes) {
            updateData.reviewNotes = updateDto.reviewNotes;
        }
        const updatedWithdrawal = await this.prisma.withdrawal.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        referralCode: true,
                        kycStatus: true,
                    },
                },
            },
        });
        this.logger.debug('Audit log created:', {
            actorId,
            action: 'WITHDRAWAL_UPDATED',
            resourceType: 'WITHDRAWAL',
            resourceId: id,
            metadata: {
                oldStatus: withdrawal.status,
                newStatus: updateDto.status,
                reviewNotes: updateDto.reviewNotes,
                rejectionReason: updateDto.rejectionReason,
            },
        });
        return updatedWithdrawal;
    }
    async batchUpdateWithdrawals(ids, updateDto, actorId) {
        const results = { updated: 0, failed: [] };
        for (const id of ids) {
            try {
                await this.updateWithdrawal(id, updateDto, actorId);
                results.updated++;
            }
            catch (error) {
                results.failed.push(id);
            }
        }
        this.logger.debug('Audit log created:', {
            actorId,
            action: 'WITHDRAWAL_BATCH_UPDATE',
            resourceType: 'WITHDRAWAL',
            resourceId: `batch-${ids.length}`,
            metadata: {
                totalItems: ids.length,
                updated: results.updated,
                failed: results.failed.length,
                updateData: updateDto,
            },
        });
        return results;
    }
    async getWithdrawalStats() {
        return this.performanceOptimizer.optimizeQuery('withdrawal_stats_aggregated', async () => {
            const recent24hDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const [statusStats, riskLevelStats, recentActivity] = await Promise.all([
                this.prisma.withdrawal.groupBy({
                    by: ['status'],
                    _count: true,
                    _sum: { amount: true },
                }),
                this.prisma.withdrawal.groupBy({
                    by: ['riskLevel'],
                    _count: true,
                    where: { status: { in: [database_1.WithdrawalStatus.PENDING, database_1.WithdrawalStatus.REVIEWING] } },
                }),
                this.prisma.withdrawal.count({
                    where: { createdAt: { gte: recent24hDate } },
                }),
            ]);
            const statusCounts = statusStats.reduce((acc, stat) => {
                acc[stat.status.toLowerCase()] = stat._count;
                return acc;
            }, {});
            const completedAmount = statusStats
                .filter(stat => stat.status === database_1.WithdrawalStatus.COMPLETED)
                .reduce((sum, stat) => sum + Number(stat._sum.amount || 0), 0);
            const totalWithdrawals = statusStats.reduce((sum, stat) => sum + stat._count, 0);
            return {
                total: totalWithdrawals,
                byStatus: {
                    pending: statusCounts.pending || 0,
                    completed: statusCounts.completed || 0,
                    rejected: statusCounts.rejected || 0,
                },
                totalCompletedAmount: completedAmount,
                riskLevelDistribution: riskLevelStats.reduce((acc, stat) => {
                    acc[stat.riskLevel.toLowerCase()] = stat._count;
                    return acc;
                }, {}),
                recent24h: recentActivity,
            };
        }, {
            ttl: 5 * 60 * 1000,
            tags: ['withdrawal-stats']
        });
    }
    async validateUserBalance(userId, amount, type) {
        let availableBalance = 0;
        switch (type) {
            case database_1.WithdrawalType.EARNINGS:
                const claimablePayouts = await this.prisma.payout.aggregate({
                    _sum: { amount: true },
                    where: {
                        userId,
                        isClaimable: true,
                        claimedAt: null,
                    },
                });
                availableBalance = Number(claimablePayouts._sum.amount || 0);
                break;
            case database_1.WithdrawalType.COMMISSION:
                const availableCommissions = await this.prisma.commission.aggregate({
                    _sum: { amount: true },
                    where: {
                        userId,
                        status: 'READY',
                    },
                });
                availableBalance = Number(availableCommissions._sum.amount || 0);
                break;
            case database_1.WithdrawalType.PRINCIPAL:
                const redeemablePositions = await this.prisma.position.aggregate({
                    _sum: { principal: true },
                    where: {
                        userId,
                        status: 'ACTIVE',
                        endDate: {
                            lte: new Date(),
                        },
                    },
                });
                availableBalance = Number(redeemablePositions._sum.principal || 0);
                break;
        }
        if (amount > availableBalance) {
            throw new common_1.BadRequestException(`余额不足。可用余额: ${availableBalance}, 请求提现: ${amount}`);
        }
    }
    async calculateWithdrawalFee(amount, type) {
        const feeConfig = await this.prisma.systemConfig.findUnique({
            where: { key: 'withdrawal_fees' },
        });
        const defaultFees = {
            [database_1.WithdrawalType.EARNINGS]: 0.005,
            [database_1.WithdrawalType.COMMISSION]: 0.003,
            [database_1.WithdrawalType.PRINCIPAL]: 0.001,
        };
        const feeRate = feeConfig?.value?.[type] || defaultFees[type];
        const calculatedFee = amount * feeRate;
        const minFee = 1;
        const maxFee = 100;
        return Math.max(minFee, Math.min(maxFee, calculatedFee));
    }
    async isKycVerified(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { kycStatus: true },
        });
        return user?.kycStatus === 'APPROVED';
    }
    validateStatusTransition(currentStatus, newStatus) {
        if (!newStatus)
            return;
        const validTransitions = {
            [database_1.WithdrawalStatus.PENDING]: [
                database_1.WithdrawalStatus.REVIEWING,
                database_1.WithdrawalStatus.APPROVED,
                database_1.WithdrawalStatus.REJECTED,
                database_1.WithdrawalStatus.CANCELED,
            ],
            [database_1.WithdrawalStatus.REVIEWING]: [
                database_1.WithdrawalStatus.APPROVED,
                database_1.WithdrawalStatus.REJECTED,
                database_1.WithdrawalStatus.CANCELED,
            ],
            [database_1.WithdrawalStatus.APPROVED]: [
                database_1.WithdrawalStatus.PROCESSING,
                database_1.WithdrawalStatus.CANCELED,
            ],
            [database_1.WithdrawalStatus.PROCESSING]: [
                database_1.WithdrawalStatus.COMPLETED,
                database_1.WithdrawalStatus.FAILED,
            ],
            [database_1.WithdrawalStatus.REJECTED]: [],
            [database_1.WithdrawalStatus.COMPLETED]: [],
            [database_1.WithdrawalStatus.FAILED]: [database_1.WithdrawalStatus.PENDING],
            [database_1.WithdrawalStatus.CANCELED]: [],
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`无效的状态转换：${currentStatus} -> ${newStatus}`);
        }
    }
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = WithdrawalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        risk_engine_service_1.RiskEngineService,
        performance_optimizer_service_1.PerformanceOptimizerService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map