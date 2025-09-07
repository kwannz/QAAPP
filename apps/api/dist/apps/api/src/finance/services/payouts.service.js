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
var PayoutsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const error_utils_1 = require("../../common/utils/error.utils");
const mapping_interface_1 = require("../interfaces/mapping.interface");
let PayoutsService = PayoutsService_1 = class PayoutsService {
    constructor(database) {
        this.database = database;
        this.logger = new common_1.Logger(PayoutsService_1.name);
    }
    calculateDailyPayout(principal, aprBps) {
        const annualRate = aprBps / 10000;
        const dailyRate = annualRate / 365;
        return principal * dailyRate;
    }
    async generateDailyPayouts() {
        try {
            const positions = await this.getActivePositions();
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
            this.logger.log(`Processing daily payouts for ${positions.length} active positions`);
            for (const position of positions) {
                const existingPayout = await this.findPayoutByPositionAndDate(position.id, todayStart);
                if (existingPayout) {
                    this.logger.debug(`Payout already exists for position ${position.id} on ${todayStart.toISOString()}`);
                    continue;
                }
                const product = await this.database.product.findUnique({ where: { id: position.productId } });
                if (!product) {
                    this.logger.warn(`Product not found for position ${position.id}`);
                    continue;
                }
                const dailyAmount = this.calculateDailyPayout(position.principal, product.aprBps);
                const payout = {
                    id: `payout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    userId: position.userId,
                    positionId: position.id,
                    amount: dailyAmount,
                    periodStart: todayStart,
                    periodEnd: todayEnd,
                    status: 'PENDING',
                    isClaimable: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                await this.createPayout(payout);
                this.logger.log(`Created daily payout ${payout.id}: $${dailyAmount.toFixed(6)} for position ${position.id}`);
            }
            this.logger.log('Daily payout generation completed');
        }
        catch (error) {
            this.logger.error('Failed to generate daily payouts:', error);
            throw error;
        }
    }
    async getActivePositions() {
        const positions = await this.database.position.findMany({
            where: {
                status: 'ACTIVE',
                endDate: {
                    gte: new Date()
                }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        aprBps: true,
                        name: true,
                        symbol: true,
                        lockDays: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
        return positions.map(pos => mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
            id: pos.id,
            userId: pos.userId,
            productId: pos.productId,
            orderId: pos.orderId,
            principal: Number(pos.principal),
            startDate: pos.startDate,
            endDate: pos.endDate,
            nextPayoutAt: pos.nextPayoutAt,
            nftTokenId: pos.nftTokenId,
            nftTokenUri: pos.nftTokenUri,
            status: pos.status,
            metadata: pos.metadata,
            createdAt: pos.createdAt,
            updatedAt: pos.updatedAt
        }));
    }
    async findPayoutByPositionAndDate(positionId, date) {
        const payout = await this.database.payout.findFirst({
            where: {
                positionId,
                periodStart: {
                    gte: date,
                    lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            include: {
                user: {
                    select: { id: true, email: true }
                }
            }
        });
        if (!payout)
            return null;
        return mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
            id: payout.id,
            userId: payout.userId,
            positionId: payout.positionId,
            amount: Number(payout.amount),
            periodStart: payout.periodStart,
            periodEnd: payout.periodEnd,
            status: payout.claimedAt ? 'CLAIMED' : 'PENDING',
            isClaimable: payout.isClaimable,
            claimedAt: payout.claimedAt,
            txHash: payout.claimTxHash,
            createdAt: payout.createdAt,
            updatedAt: payout.updatedAt
        });
    }
    async createPayout(payout) {
        const createdPayout = await this.database.payout.create({
            data: {
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: payout.amount,
                periodStart: payout.periodStart,
                periodEnd: payout.periodEnd,
                isClaimable: payout.isClaimable
            },
            include: {
                user: {
                    select: { id: true, email: true }
                }
            }
        });
        return mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
            id: createdPayout.id,
            userId: createdPayout.userId,
            positionId: createdPayout.positionId,
            amount: Number(createdPayout.amount),
            periodStart: createdPayout.periodStart,
            periodEnd: createdPayout.periodEnd,
            status: createdPayout.claimedAt ? 'CLAIMED' : 'PENDING',
            isClaimable: createdPayout.isClaimable,
            claimedAt: createdPayout.claimedAt,
            txHash: createdPayout.claimTxHash,
            createdAt: createdPayout.createdAt,
            updatedAt: createdPayout.updatedAt
        });
    }
    async getClaimablePayouts(userId) {
        try {
            const payouts = await this.database.payout.findMany({
                where: {
                    userId,
                    isClaimable: true,
                    claimedAt: null
                },
                include: {
                    user: {
                        select: { id: true, email: true }
                    },
                    position: {
                        select: { id: true, principal: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const mockPayouts = payouts.map(payout => mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: Number(payout.amount),
                periodStart: payout.periodStart,
                periodEnd: payout.periodEnd,
                status: 'PENDING',
                isClaimable: payout.isClaimable,
                claimedAt: payout.claimedAt,
                txHash: payout.claimTxHash,
                createdAt: payout.createdAt,
                updatedAt: payout.updatedAt
            }));
            const totalAmount = mockPayouts.reduce((sum, payout) => sum + payout.amount, 0);
            this.logger.log(`Found ${mockPayouts.length} claimable payouts for user ${userId}, total: $${totalAmount.toFixed(2)}`);
            return {
                payouts: mockPayouts,
                totalAmount,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get claimable payouts for user ${userId}:`, error);
            throw error;
        }
    }
    async claimPayouts(userId, payoutIds) {
        try {
            if (!payoutIds || payoutIds.length === 0) {
                throw new common_1.BadRequestException('No payout IDs provided');
            }
            this.logger.log(`Processing payout claim for user ${userId}, payouts: ${payoutIds.join(', ')}`);
            const { payouts } = await this.getClaimablePayouts(userId);
            const payoutsToClaimMap = new Map(payouts.map(p => [p.id, p]));
            const validPayouts = payoutIds
                .map(id => payoutsToClaimMap.get(id))
                .filter((payout) => payout !== undefined && payout.isClaimable);
            if (validPayouts.length === 0) {
                throw new common_1.BadRequestException('No valid claimable payouts found');
            }
            const claimedAmount = validPayouts.reduce((sum, payout) => sum + payout.amount, 0);
            const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            const claimTime = new Date();
            await this.database.payout.updateMany({
                where: {
                    id: { in: payoutIds },
                    userId,
                    isClaimable: true
                },
                data: {
                    claimedAt: claimTime,
                    claimTxHash: mockTxHash,
                    isClaimable: false,
                    updatedAt: claimTime
                }
            });
            const claimedPayouts = validPayouts.map(payout => ({
                ...payout,
                claimedAt: claimTime,
                claimTxHash: mockTxHash,
                isClaimable: false,
                updatedAt: claimTime,
            }));
            this.logger.log(`Successfully claimed ${claimedPayouts.length} payouts, total: $${claimedAmount.toFixed(6)}, tx: ${mockTxHash}`);
            return {
                claimedAmount,
                txHash: mockTxHash,
                claimedPayouts,
            };
        }
        catch (error) {
            this.logger.error(`Failed to claim payouts for user ${userId}:`, error);
            throw error;
        }
    }
    async getPayoutHistory(userId, queryDto = {}) {
        try {
            const { page = 1, limit = 20 } = queryDto;
            const skip = (page - 1) * limit;
            const [payouts, total] = await Promise.all([
                this.database.payout.findMany({
                    where: { userId },
                    include: {
                        user: {
                            select: { id: true, email: true }
                        },
                        position: {
                            select: { id: true, principal: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                this.database.payout.count({ where: { userId } })
            ]);
            const allPayouts = payouts.map(payout => mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: Number(payout.amount),
                periodStart: payout.periodStart,
                periodEnd: payout.periodEnd,
                status: payout.claimedAt ? 'CLAIMED' : 'PENDING',
                isClaimable: payout.isClaimable,
                claimedAt: payout.claimedAt,
                txHash: payout.claimTxHash,
                createdAt: payout.createdAt,
                updatedAt: payout.updatedAt
            }));
            const [claimedStats, pendingStats] = await Promise.all([
                this.database.payout.aggregate({
                    where: {
                        userId,
                        claimedAt: { not: null }
                    },
                    _sum: { amount: true },
                    _count: true
                }),
                this.database.payout.aggregate({
                    where: {
                        userId,
                        isClaimable: true,
                        claimedAt: null
                    },
                    _sum: { amount: true },
                    _count: true
                })
            ]);
            const totalClaimed = Number(claimedStats._sum.amount || 0);
            const totalPending = Number(pendingStats._sum.amount || 0);
            this.logger.log(`Payout history for user ${userId}: ${total} records, claimed: $${totalClaimed.toFixed(2)}, pending: $${totalPending.toFixed(2)}`);
            return {
                payouts: allPayouts,
                total,
                totalClaimed,
                totalPending,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get payout history for user ${userId}:`, error);
            throw error;
        }
    }
    async getSystemPayoutStats() {
        try {
            const [distributedStats, pendingStats, activePositionCount, totalUserCount] = await Promise.all([
                this.database.payout.aggregate({
                    where: {
                        claimedAt: { not: null }
                    },
                    _sum: { amount: true }
                }),
                this.database.payout.aggregate({
                    where: {
                        isClaimable: true,
                        claimedAt: null
                    },
                    _sum: { amount: true }
                }),
                this.database.position.count({
                    where: {
                        status: 'ACTIVE'
                    }
                }),
                this.database.payout.findMany({
                    select: { userId: true },
                    distinct: ['userId']
                }).then(users => users.length)
            ]);
            const stats = {
                totalDistributed: Number(distributedStats._sum.amount || 0),
                totalPending: Number(pendingStats._sum.amount || 0),
                activePositions: activePositionCount,
                totalUsers: totalUserCount,
            };
            this.logger.log(`System payout stats: distributed: $${stats.totalDistributed}, pending: $${stats.totalPending}`);
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get system payout stats:', error);
            throw error;
        }
    }
    async generateClaimablePayouts(positionId, userId) {
        try {
            const payouts = await this.database.payout.findMany({
                where: {
                    positionId,
                    userId,
                    isClaimable: true,
                    claimedAt: null
                },
                include: {
                    user: {
                        select: { id: true, email: true }
                    },
                    position: {
                        select: { id: true, principal: true }
                    }
                },
                orderBy: {
                    periodStart: 'desc'
                }
            });
            return payouts.map(payout => mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: Number(payout.amount),
                periodStart: payout.periodStart,
                periodEnd: payout.periodEnd,
                status: 'PENDING',
                isClaimable: payout.isClaimable,
                claimedAt: payout.claimedAt,
                txHash: payout.claimTxHash,
                createdAt: payout.createdAt,
                updatedAt: payout.updatedAt
            }));
        }
        catch (error) {
            this.logger.error(`Failed to generate claimable payouts for position ${positionId}:`, error);
            throw error;
        }
    }
    async getPositionPayouts(positionId) {
        try {
            const payouts = await this.database.payout.findMany({
                where: {
                    positionId
                },
                include: {
                    user: {
                        select: { id: true, email: true }
                    },
                    position: {
                        select: { id: true, userId: true, principal: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return payouts.map(payout => mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: Number(payout.amount),
                periodStart: payout.periodStart,
                periodEnd: payout.periodEnd,
                status: payout.claimedAt ? 'CLAIMED' : 'PENDING',
                isClaimable: payout.isClaimable,
                claimedAt: payout.claimedAt,
                txHash: payout.claimTxHash,
                createdAt: payout.createdAt,
                updatedAt: payout.updatedAt
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get payouts for position ${positionId}:`, error);
            throw error;
        }
    }
    async findPayoutById(payoutId) {
        try {
            const payout = await this.database.payout.findUnique({
                where: { id: payoutId },
                include: {
                    user: {
                        select: { id: true, email: true }
                    },
                    position: {
                        select: { id: true, userId: true, principal: true }
                    }
                }
            });
            if (!payout) {
                return null;
            }
            return mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: Number(payout.amount),
                periodStart: payout.periodStart,
                periodEnd: payout.periodEnd,
                status: payout.claimedAt ? 'CLAIMED' : 'PENDING',
                isClaimable: payout.isClaimable,
                claimedAt: payout.claimedAt,
                txHash: payout.claimTxHash,
                createdAt: payout.createdAt,
                updatedAt: payout.updatedAt
            });
        }
        catch (error) {
            this.logger.error(`Failed to find payout ${payoutId}:`, error);
            throw error;
        }
    }
    async claimMultiplePayouts(payoutIds, userId) {
        try {
            this.logger.log(`Processing claim for ${payoutIds.length} payouts by user ${userId}`);
            const payoutsToUpdate = await this.database.payout.findMany({
                where: {
                    id: { in: payoutIds },
                    userId,
                    isClaimable: true,
                    claimedAt: null
                }
            });
            const totalAmount = payoutsToUpdate.reduce((sum, payout) => sum + Number(payout.amount), 0);
            if (totalAmount === 0) {
                return {
                    success: false,
                    totalAmount: 0,
                    txHash: '',
                    message: '没有有效的可领取收益',
                };
            }
            const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            const claimTime = new Date();
            await this.database.payout.updateMany({
                where: {
                    id: { in: payoutIds },
                    userId,
                    isClaimable: true
                },
                data: {
                    claimedAt: claimTime,
                    claimTxHash: mockTxHash,
                    isClaimable: false,
                    updatedAt: claimTime
                }
            });
            this.logger.log(`Successfully claimed ${payoutsToUpdate.length} payouts, total: $${totalAmount.toFixed(6)}, tx: ${mockTxHash}`);
            return {
                success: true,
                totalAmount,
                txHash: mockTxHash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to claim multiple payouts:`, error);
            return {
                success: false,
                totalAmount: 0,
                txHash: '',
                message: `领取失败: ${(0, error_utils_1.getErrorMessage)(error)}`,
            };
        }
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = PayoutsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map