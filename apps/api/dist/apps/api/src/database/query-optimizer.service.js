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
var QueryOptimizerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOptimizerService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("./database.service");
let QueryOptimizerService = QueryOptimizerService_1 = class QueryOptimizerService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(QueryOptimizerService_1.name);
    }
    async findUserWithDetails(userId) {
        const startTime = Date.now();
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
                include: {
                    wallets: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    positions: {
                        where: {
                            status: { in: ['ACTIVE', 'REDEEMING'] }
                        },
                        include: {
                            product: {
                                select: { name: true, symbol: true, aprBps: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    },
                    payouts: {
                        where: { isClaimable: true },
                        orderBy: { periodStart: 'desc' },
                        take: 5
                    },
                    _count: {
                        select: {
                            orders: true,
                            positions: true,
                            referrals: true
                        }
                    }
                }
            });
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return user;
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error(`User query failed for ${userId}:`, error);
            throw error;
        }
    }
    async findUserOrders(userId, limit = 20, offset = 0) {
        const startTime = Date.now();
        try {
            const orders = await this.db.order.findMany({
                where: { userId },
                include: {
                    product: {
                        select: { name: true, symbol: true, aprBps: true, lockDays: true }
                    },
                    positions: {
                        select: {
                            id: true,
                            status: true,
                            principal: true,
                            startDate: true,
                            endDate: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            });
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return orders;
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error(`Orders query failed for user ${userId}:`, error);
            throw error;
        }
    }
    async findClaimablePayouts(userId) {
        const startTime = Date.now();
        try {
            const payouts = await this.db.payout.findMany({
                where: {
                    userId,
                    isClaimable: true,
                    claimedAt: null
                },
                include: {
                    position: {
                        include: {
                            product: {
                                select: { name: true, symbol: true }
                            }
                        }
                    }
                },
                orderBy: { periodStart: 'desc' }
            });
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return payouts;
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error(`Payouts query failed for user ${userId}:`, error);
            throw error;
        }
    }
    async getDashboardStats() {
        const startTime = Date.now();
        try {
            const [totalUsers, activePositions, totalVolume, pendingWithdrawals] = await Promise.all([
                this.db.user.count({
                    where: { isActive: true }
                }),
                this.db.position.count({
                    where: { status: 'ACTIVE' }
                }),
                this.db.order.aggregate({
                    where: { status: 'SUCCESS' },
                    _sum: { usdtAmount: true }
                }),
                this.db.withdrawal.count({
                    where: {
                        status: { in: ['PENDING', 'REVIEWING'] }
                    }
                })
            ]);
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return {
                totalUsers,
                activePositions,
                totalVolume: totalVolume._sum.usdtAmount || 0,
                pendingWithdrawals,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error('Dashboard stats query failed:', error);
            throw error;
        }
    }
    async findUsersWithPositions(userIds) {
        const startTime = Date.now();
        try {
            const users = await this.db.user.findMany({
                where: {
                    id: { in: userIds },
                    isActive: true
                },
                include: {
                    positions: {
                        where: { status: 'ACTIVE' },
                        include: {
                            product: true,
                            payouts: {
                                where: { isClaimable: true },
                                take: 3
                            }
                        }
                    },
                    _count: {
                        select: {
                            orders: { where: { status: 'SUCCESS' } },
                            positions: true
                        }
                    }
                }
            });
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return users;
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error(`Batch user query failed for ${userIds.length} users:`, error);
            throw error;
        }
    }
    async findOrdersPaginated(filters, page = 1, limit = 20) {
        const startTime = Date.now();
        const offset = (page - 1) * limit;
        try {
            const where = {};
            if (filters.userId)
                where.userId = filters.userId;
            if (filters.status)
                where.status = filters.status;
            if (filters.productId)
                where.productId = filters.productId;
            if (filters.startDate || filters.endDate) {
                where.createdAt = {};
                if (filters.startDate)
                    where.createdAt.gte = filters.startDate;
                if (filters.endDate)
                    where.createdAt.lte = filters.endDate;
            }
            const [orders, total] = await Promise.all([
                this.db.order.findMany({
                    where,
                    include: {
                        product: {
                            select: { name: true, symbol: true }
                        },
                        user: {
                            select: { id: true, email: true, referralCode: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset
                }),
                this.db.order.count({ where })
            ]);
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return {
                data: orders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                queryTime
            };
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error('Paginated orders query failed:', error);
            throw error;
        }
    }
    async getFinancialSummary(userId) {
        const startTime = Date.now();
        try {
            const [totalInvestment, activePositions, totalEarnings, pendingPayouts] = await Promise.all([
                this.db.order.aggregate({
                    where: {
                        userId,
                        status: 'SUCCESS'
                    },
                    _sum: { usdtAmount: true }
                }),
                this.db.position.aggregate({
                    where: {
                        userId,
                        status: 'ACTIVE'
                    },
                    _sum: { principal: true },
                    _count: true
                }),
                this.db.payout.aggregate({
                    where: {
                        userId,
                        claimedAt: { not: null }
                    },
                    _sum: { amount: true }
                }),
                this.db.payout.aggregate({
                    where: {
                        userId,
                        isClaimable: true,
                        claimedAt: null
                    },
                    _sum: { amount: true },
                    _count: true
                })
            ]);
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            return {
                totalInvestment: totalInvestment._sum.usdtAmount || 0,
                activeInvestment: activePositions._sum.principal || 0,
                activePositionCount: activePositions._count,
                totalEarnings: totalEarnings._sum.amount || 0,
                pendingEarnings: pendingPayouts._sum.amount || 0,
                pendingPayoutCount: pendingPayouts._count,
                queryTime
            };
        }
        catch (error) {
            const queryTime = Date.now() - startTime;
            this.logger.debug(`Query time: ${queryTime}ms`);
            this.logger.error(`Financial summary query failed for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.QueryOptimizerService = QueryOptimizerService;
exports.QueryOptimizerService = QueryOptimizerService = QueryOptimizerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], QueryOptimizerService);
//# sourceMappingURL=query-optimizer.service.js.map