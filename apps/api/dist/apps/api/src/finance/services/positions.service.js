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
var PositionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const mapping_interface_1 = require("../interfaces/mapping.interface");
let PositionsService = PositionsService_1 = class PositionsService {
    constructor(database) {
        this.database = database;
        this.logger = new common_1.Logger(PositionsService_1.name);
    }
    async createPosition(orderData, productData) {
        try {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + productData.lockDays * 24 * 60 * 60 * 1000);
            const position = await this.database.position.create({
                data: {
                    userId: orderData.userId,
                    productId: orderData.productId,
                    orderId: orderData.id,
                    principal: orderData.usdtAmount,
                    startDate,
                    endDate,
                    nextPayoutAt: this.getNextPayoutDate(startDate),
                    nftTokenId: productData.nftTokenId,
                    nftTokenUri: productData.nftTokenUri,
                    status: 'ACTIVE',
                    metadata: {
                        productSymbol: productData.symbol,
                        productName: productData.name,
                        aprBps: productData.aprBps,
                        lockDays: productData.lockDays,
                        paymentType: orderData.metadata?.paymentType || 'USDT',
                        txHash: orderData.txHash,
                    }
                },
                include: {
                    user: { select: { id: true, email: true } },
                    product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                    order: { select: { id: true, usdtAmount: true, status: true } }
                }
            });
            this.logger.log(`Created position ${position.id} for user ${orderData.userId}, amount: $${orderData.usdtAmount}`);
            return mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
                id: position.id,
                userId: position.userId,
                productId: position.productId,
                orderId: position.orderId,
                principal: Number(position.principal),
                startDate: position.startDate,
                endDate: position.endDate,
                nextPayoutAt: position.nextPayoutAt,
                nftTokenId: position.nftTokenId,
                nftTokenUri: position.nftTokenUri,
                status: position.status,
                totalPaid: 0,
                lastPayoutAt: undefined,
                maturityAmount: this.calculateMaturityAmount(Number(position.principal), position.product.aprBps, position.product.lockDays),
                metadata: position.metadata,
                createdAt: position.createdAt,
                updatedAt: position.updatedAt
            });
        }
        catch (error) {
            this.logger.error('Failed to create position:', error);
            throw error;
        }
    }
    async getUserPositions(userId, queryDto = {}) {
        try {
            const { page = 1, limit = 20, status } = queryDto;
            const skip = (page - 1) * limit;
            const where = { userId };
            if (status) {
                where.status = status;
            }
            const [positions, total, payoutStats] = await Promise.all([
                this.database.position.findMany({
                    where,
                    include: {
                        user: { select: { id: true, email: true } },
                        product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                        order: { select: { id: true, usdtAmount: true, status: true } },
                        payouts: {
                            where: { claimedAt: { not: null } },
                            select: { amount: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                this.database.position.count({ where }),
                this.database.payout.aggregate({
                    where: {
                        userId,
                        claimedAt: { not: null }
                    },
                    _sum: { amount: true }
                })
            ]);
            const mockPositions = positions.map(pos => {
                const totalPaid = pos.payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
                return mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
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
                    totalPaid,
                    lastPayoutAt: pos.payouts.length > 0 ? pos.createdAt : undefined,
                    maturityAmount: this.calculateMaturityAmount(Number(pos.principal), pos.product.aprBps, pos.product.lockDays),
                    metadata: pos.metadata,
                    createdAt: pos.createdAt,
                    updatedAt: pos.updatedAt
                });
            });
            const activePositions = mockPositions.filter(p => p.status === 'ACTIVE');
            const summary = {
                totalActive: activePositions.length,
                totalPrincipal: activePositions.reduce((sum, p) => sum + p.principal, 0),
                totalPaid: Number(payoutStats._sum.amount || 0),
                estimatedTotal: activePositions.reduce((sum, p) => sum + (p.maturityAmount || p.principal), 0),
            };
            this.logger.log(`Retrieved ${mockPositions.length} positions for user ${userId}`);
            return {
                positions: mockPositions,
                total,
                summary,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get positions for user ${userId}:`, error);
            throw error;
        }
    }
    async getPosition(positionId, userId) {
        const where = { id: positionId };
        if (userId) {
            where.userId = userId;
        }
        const position = await this.database.position.findUnique({
            where,
            include: {
                user: { select: { id: true, email: true } },
                product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                order: { select: { id: true, usdtAmount: true, status: true } },
                payouts: {
                    where: { claimedAt: { not: null } },
                    select: { amount: true, claimedAt: true },
                    orderBy: { claimedAt: 'desc' },
                    take: 1
                }
            }
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        const totalPaid = await this.database.payout.aggregate({
            where: {
                positionId: position.id,
                claimedAt: { not: null }
            },
            _sum: { amount: true }
        });
        return mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
            id: position.id,
            userId: position.userId,
            productId: position.productId,
            orderId: position.orderId,
            principal: Number(position.principal),
            startDate: position.startDate,
            endDate: position.endDate,
            nextPayoutAt: position.nextPayoutAt,
            nftTokenId: position.nftTokenId,
            nftTokenUri: position.nftTokenUri,
            status: position.status,
            totalPaid: Number(totalPaid._sum.amount || 0),
            lastPayoutAt: position.payouts[0]?.claimedAt,
            maturityAmount: this.calculateMaturityAmount(Number(position.principal), position.product.aprBps, position.product.lockDays),
            metadata: position.metadata,
            createdAt: position.createdAt,
            updatedAt: position.updatedAt
        });
    }
    async getActivePositions() {
        const positions = await this.database.position.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                user: { select: { id: true, email: true } },
                product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                order: { select: { id: true, usdtAmount: true, status: true } }
            }
        });
        const activePositions = [];
        const now = new Date();
        for (const pos of positions) {
            if (now > pos.endDate) {
                await this.updatePositionStatus(pos.id, 'REDEEMING');
                continue;
            }
            const totalPaid = await this.database.payout.aggregate({
                where: {
                    positionId: pos.id,
                    claimedAt: { not: null }
                },
                _sum: { amount: true }
            });
            activePositions.push(mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
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
                totalPaid: Number(totalPaid._sum.amount || 0),
                lastPayoutAt: undefined,
                maturityAmount: this.calculateMaturityAmount(Number(pos.principal), pos.product.aprBps, pos.product.lockDays),
                metadata: pos.metadata,
                createdAt: pos.createdAt,
                updatedAt: pos.updatedAt
            }));
        }
        return activePositions;
    }
    async updatePositionStatus(positionId, status) {
        const updatedPosition = await this.database.position.update({
            where: { id: positionId },
            data: {
                status: status,
                updatedAt: new Date()
            },
            include: {
                user: { select: { id: true, email: true } },
                product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                order: { select: { id: true, usdtAmount: true, status: true } }
            }
        });
        if (!updatedPosition) {
            throw new common_1.NotFoundException('Position not found');
        }
        const totalPaid = await this.database.payout.aggregate({
            where: {
                positionId: updatedPosition.id,
                claimedAt: { not: null }
            },
            _sum: { amount: true }
        });
        this.logger.log(`Updated position ${positionId} status to ${status}`);
        return mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
            id: updatedPosition.id,
            userId: updatedPosition.userId,
            productId: updatedPosition.productId,
            orderId: updatedPosition.orderId,
            principal: Number(updatedPosition.principal),
            startDate: updatedPosition.startDate,
            endDate: updatedPosition.endDate,
            nextPayoutAt: updatedPosition.nextPayoutAt,
            nftTokenId: updatedPosition.nftTokenId,
            nftTokenUri: updatedPosition.nftTokenUri,
            status: updatedPosition.status,
            totalPaid: Number(totalPaid._sum.amount || 0),
            lastPayoutAt: undefined,
            maturityAmount: this.calculateMaturityAmount(Number(updatedPosition.principal), updatedPosition.product.aprBps, updatedPosition.product.lockDays),
            metadata: updatedPosition.metadata,
            createdAt: updatedPosition.createdAt,
            updatedAt: updatedPosition.updatedAt
        });
    }
    async recordPayoutPayment(positionId, payoutAmount) {
        const updatedPosition = await this.database.position.update({
            where: { id: positionId },
            data: {
                nextPayoutAt: this.getNextPayoutDate(new Date()),
                updatedAt: new Date()
            },
            include: {
                user: { select: { id: true, email: true } },
                product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                order: { select: { id: true, usdtAmount: true, status: true } }
            }
        });
        if (!updatedPosition) {
            throw new common_1.NotFoundException('Position not found');
        }
        const totalPaid = await this.database.payout.aggregate({
            where: {
                positionId: updatedPosition.id,
                claimedAt: { not: null }
            },
            _sum: { amount: true }
        });
        this.logger.log(`Recorded payout payment for position ${positionId}: $${payoutAmount.toFixed(6)}`);
        return mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
            id: updatedPosition.id,
            userId: updatedPosition.userId,
            productId: updatedPosition.productId,
            orderId: updatedPosition.orderId,
            principal: Number(updatedPosition.principal),
            startDate: updatedPosition.startDate,
            endDate: updatedPosition.endDate,
            nextPayoutAt: updatedPosition.nextPayoutAt,
            nftTokenId: updatedPosition.nftTokenId,
            nftTokenUri: updatedPosition.nftTokenUri,
            status: updatedPosition.status,
            totalPaid: Number(totalPaid._sum.amount || 0),
            lastPayoutAt: new Date(),
            maturityAmount: this.calculateMaturityAmount(Number(updatedPosition.principal), updatedPosition.product.aprBps, updatedPosition.product.lockDays),
            metadata: updatedPosition.metadata,
            createdAt: updatedPosition.createdAt,
            updatedAt: updatedPosition.updatedAt
        });
    }
    async redeemPosition(positionId, userId) {
        try {
            const position = await this.getPosition(positionId, userId);
            if (position.status !== 'REDEEMING') {
                const now = new Date();
                if (now < position.endDate) {
                    throw new common_1.BadRequestException('Position has not matured yet');
                }
                await this.updatePositionStatus(positionId, 'REDEEMING');
            }
            const remainingDays = Math.max(0, Math.ceil((position.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
            const product = await this.database.product.findUnique({ where: { id: position.productId } });
            let redeemAmount = position.principal;
            if (product && remainingDays === 0) {
                redeemAmount = position.maturityAmount || position.principal;
            }
            else {
                redeemAmount = position.principal;
            }
            const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            const redeemTime = new Date();
            const closedPosition = await this.database.position.update({
                where: { id: positionId },
                data: {
                    status: 'CLOSED',
                    metadata: {
                        ...position.metadata,
                        redeemAt: redeemTime.toISOString(),
                        redeemTxHash: mockTxHash,
                        redeemAmount,
                        finalStatus: 'REDEEMED'
                    },
                    updatedAt: new Date()
                },
                include: {
                    user: { select: { id: true, email: true } },
                    product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
                    order: { select: { id: true, usdtAmount: true, status: true } }
                }
            });
            const totalPaid = await this.database.payout.aggregate({
                where: {
                    positionId: closedPosition.id,
                    claimedAt: { not: null }
                },
                _sum: { amount: true }
            });
            const finalPosition = mapping_interface_1.FinanceMappingUtils.mapDatabasePositionToMock({
                id: closedPosition.id,
                userId: closedPosition.userId,
                productId: closedPosition.productId,
                orderId: closedPosition.orderId,
                principal: Number(closedPosition.principal),
                startDate: closedPosition.startDate,
                endDate: closedPosition.endDate,
                nextPayoutAt: closedPosition.nextPayoutAt,
                nftTokenId: closedPosition.nftTokenId,
                nftTokenUri: closedPosition.nftTokenUri,
                status: 'CLOSED',
                totalPaid: Number(totalPaid._sum.amount || 0),
                lastPayoutAt: undefined,
                maturityAmount: this.calculateMaturityAmount(Number(closedPosition.principal), closedPosition.product.aprBps, closedPosition.product.lockDays),
                metadata: closedPosition.metadata,
                createdAt: closedPosition.createdAt,
                updatedAt: closedPosition.updatedAt
            });
            this.logger.log(`Position ${positionId} redeemed: $${redeemAmount.toFixed(6)}, tx: ${mockTxHash}`);
            return {
                position: finalPosition,
                redeemAmount,
                txHash: mockTxHash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to redeem position ${positionId}:`, error);
            throw error;
        }
    }
    async getSystemPositionStats() {
        try {
            const [totalCount, activeCount, tvlStats, paidStats, statusStats] = await Promise.all([
                this.database.position.count(),
                this.database.position.count({ where: { status: 'ACTIVE' } }),
                this.database.position.aggregate({
                    where: { status: 'ACTIVE' },
                    _sum: { principal: true }
                }),
                this.database.payout.aggregate({
                    where: { claimedAt: { not: null } },
                    _sum: { amount: true }
                }),
                this.database.position.groupBy({
                    by: ['status'],
                    _count: true
                })
            ]);
            const positionsByStatus = {};
            statusStats.forEach(stat => {
                positionsByStatus[stat.status] = stat._count;
            });
            const stats = {
                totalPositions: totalCount,
                activePositions: activeCount,
                totalValueLocked: Number(tvlStats._sum.principal || 0),
                totalValuePaid: Number(paidStats._sum.amount || 0),
                positionsByStatus,
            };
            this.logger.log(`System position stats: ${stats.totalPositions} total, ${stats.activePositions} active, $${stats.totalValueLocked} TVL`);
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get system position stats:', error);
            throw error;
        }
    }
    getNextPayoutDate(fromDate) {
        const nextPayout = new Date(fromDate);
        nextPayout.setDate(nextPayout.getDate() + 1);
        nextPayout.setHours(0, 0, 0, 0);
        return nextPayout;
    }
    calculateMaturityAmount(principal, aprBps, lockDays) {
        const annualRate = aprBps / 10000;
        return principal * (1 + (annualRate * lockDays / 365));
    }
    async initializeTestData() {
        this.logger.log('Test data initialization is now handled by database seeders');
    }
};
exports.PositionsService = PositionsService;
exports.PositionsService = PositionsService = PositionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PositionsService);
//# sourceMappingURL=positions.service.js.map