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
var OptimizedQueriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedQueriesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const performance_optimizer_service_1 = require("../performance/performance-optimizer.service");
let OptimizedQueriesService = OptimizedQueriesService_1 = class OptimizedQueriesService {
    constructor(database, performanceOptimizer) {
        this.database = database;
        this.performanceOptimizer = performanceOptimizer;
        this.logger = new common_1.Logger(OptimizedQueriesService_1.name);
    }
    async findUsers(query) {
        const cacheKey = `optimized_users:${JSON.stringify(query)}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const { page = 1, limit = 20, includeWallets = false, includeStats = false } = query;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.email) {
                where.email = { equals: query.email.toLowerCase() };
            }
            if (query.role) {
                where.role = query.role;
            }
            if (query.kycStatus) {
                where.kycStatus = query.kycStatus;
            }
            if (query.isActive !== undefined) {
                where.isActive = query.isActive;
            }
            const baseSelect = {
                id: true,
                email: true,
                role: true,
                referralCode: true,
                kycStatus: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            };
            const include = {};
            if (includeWallets) {
                include.wallets = {
                    where: { isPrimary: true },
                    select: {
                        id: true,
                        address: true,
                        chainId: true,
                        label: true,
                    },
                    take: 1
                };
            }
            if (includeStats) {
                include._count = {
                    select: {
                        referrals: true,
                        orders: true,
                        positions: true
                    }
                };
            }
            const [users, total] = await Promise.all([
                this.database.user.findMany({
                    where,
                    skip,
                    take: limit,
                    select: { ...baseSelect, ...include },
                    orderBy: [
                        { createdAt: 'desc' },
                        { id: 'asc' }
                    ],
                }),
                this.database.user.count({ where }),
            ]);
            return {
                users,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }, { ttl: 300000 });
    }
    async findTransactions(query) {
        const cacheKey = `optimized_transactions:${JSON.stringify(query)}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const { userId, type, status, startDate, endDate, limit = 50, offset = 0 } = query;
            const transactions = [];
            const dateFilter = {};
            if (startDate || endDate) {
                if (startDate)
                    dateFilter.gte = startDate;
                if (endDate)
                    dateFilter.lte = endDate;
            }
            const batchQueries = [];
            if (!type || type === 'ORDER') {
                batchQueries.push(this.database.order.findMany({
                    where: {
                        ...(userId && { userId }),
                        ...(status && { status: status }),
                        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
                    },
                    select: {
                        id: true,
                        usdtAmount: true,
                        status: true,
                        createdAt: true,
                        confirmedAt: true,
                        user: {
                            select: { email: true }
                        },
                        product: {
                            select: { name: true, symbol: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                }).then(orders => orders.map(order => ({
                    id: order.id,
                    type: 'ORDER',
                    amount: order.usdtAmount,
                    status: order.status,
                    userEmail: order.user.email,
                    productInfo: order.product,
                    createdAt: order.createdAt,
                    completedAt: order.confirmedAt,
                }))));
            }
            if (!type || type === 'COMMISSION') {
                batchQueries.push(this.database.commission.findMany({
                    where: {
                        ...(userId && { userId }),
                        ...(status && { status: status }),
                        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
                    },
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        commissionType: true,
                        createdAt: true,
                        settledAt: true,
                        user: {
                            select: { email: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                }).then(commissions => commissions.map(comm => ({
                    id: comm.id,
                    type: 'COMMISSION',
                    amount: comm.amount,
                    status: comm.status,
                    userEmail: comm.user.email,
                    commissionType: comm.commissionType,
                    createdAt: comm.createdAt,
                    completedAt: comm.settledAt,
                }))));
            }
            if (!type || type === 'WITHDRAWAL') {
                batchQueries.push(this.database.withdrawal.findMany({
                    where: {
                        ...(userId && { userId }),
                        ...(status && { status: status }),
                        ...(Object.keys(dateFilter).length > 0 && { requestedAt: dateFilter }),
                    },
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        withdrawalType: true,
                        requestedAt: true,
                        completedAt: true,
                        user: {
                            select: { email: true }
                        }
                    },
                    orderBy: { requestedAt: 'desc' },
                    take: limit,
                    skip: offset,
                }).then(withdrawals => withdrawals.map(w => ({
                    id: w.id,
                    type: 'WITHDRAWAL',
                    amount: w.amount,
                    status: w.status,
                    userEmail: w.user.email,
                    withdrawalType: w.withdrawalType,
                    createdAt: w.requestedAt,
                    completedAt: w.completedAt,
                }))));
            }
            if (!type || type === 'PAYOUT') {
                batchQueries.push(this.database.payout.findMany({
                    where: {
                        ...(userId && { userId }),
                        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
                    },
                    select: {
                        id: true,
                        amount: true,
                        isClaimable: true,
                        claimedAt: true,
                        createdAt: true,
                        user: {
                            select: { email: true }
                        },
                        position: {
                            select: {
                                product: {
                                    select: { name: true, symbol: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                }).then(payouts => payouts.map(p => ({
                    id: p.id,
                    type: 'PAYOUT',
                    amount: p.amount,
                    status: p.isClaimable ? (p.claimedAt ? 'CLAIMED' : 'CLAIMABLE') : 'PENDING',
                    userEmail: p.user.email,
                    productInfo: p.position.product,
                    createdAt: p.createdAt,
                    completedAt: p.claimedAt,
                }))));
            }
            const results = await Promise.all(batchQueries);
            const allTransactions = results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return {
                data: allTransactions.slice(0, limit),
                total: allTransactions.length,
                offset,
                limit
            };
        }, { ttl: 240000 });
    }
    async getUserStatistics(timeRange) {
        const cacheKey = `user_stats:${timeRange?.startDate?.toISOString() || 'all'}:${timeRange?.endDate?.toISOString() || 'all'}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const dateFilter = {};
            if (timeRange?.startDate || timeRange?.endDate) {
                if (timeRange.startDate)
                    dateFilter.gte = timeRange.startDate;
                if (timeRange.endDate)
                    dateFilter.lte = timeRange.endDate;
            }
            const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
            const [totalUsers, activeUsers, usersByRole, usersByKyc, recentRegistrations,] = await Promise.all([
                whereClause ? this.database.user.count({ where: whereClause }) : this.database.user.count(),
                this.database.user.count({
                    where: { isActive: true, ...whereClause }
                }),
                this.database.user.groupBy({
                    by: ['role'],
                    _count: { role: true },
                    ...(whereClause && { where: whereClause }),
                }),
                this.database.user.groupBy({
                    by: ['kycStatus'],
                    _count: { kycStatus: true },
                    ...(whereClause && { where: whereClause }),
                }),
                this.database.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
            ]);
            return {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count.role;
                    return acc;
                }, {}),
                usersByKyc: usersByKyc.reduce((acc, item) => {
                    acc[item.kycStatus] = item._count.kycStatus;
                    return acc;
                }, {}),
                recentRegistrations,
                lastUpdated: new Date(),
            };
        }, { ttl: 900000 });
    }
    async getOptimizedAuditLogs(filters = {}, pagination = {}) {
        const cacheKey = `optimized_audit:${JSON.stringify({ ...filters, ...pagination })}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const { page = 1, limit = 100 } = pagination;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.actorId) {
                where.actorId = filters.actorId;
            }
            if (filters.actions && filters.actions.length > 0) {
                where.action = { in: filters.actions };
            }
            if (filters.resourceTypes && filters.resourceTypes.length > 0) {
                where.resourceType = { in: filters.resourceTypes };
            }
            if (filters.startDate || filters.endDate) {
                where.createdAt = {};
                if (filters.startDate)
                    where.createdAt.gte = filters.startDate;
                if (filters.endDate)
                    where.createdAt.lte = filters.endDate;
            }
            const [logs, total] = await Promise.all([
                this.database.auditLog.findMany({
                    where,
                    select: {
                        id: true,
                        action: true,
                        resourceType: true,
                        resourceId: true,
                        createdAt: true,
                        metadata: true,
                        actor: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: [
                        { createdAt: 'desc' },
                        { id: 'desc' }
                    ],
                    skip,
                    take: limit,
                }),
                this.database.auditLog.count({ where }),
            ]);
            return {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: skip + limit < total,
                    hasPrev: page > 1,
                },
            };
        }, { ttl: 300000 });
    }
    async getDashboardStats(timeRange = '24h') {
        const cacheKey = `dashboard_stats:${timeRange}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const now = new Date();
            const startDate = new Date();
            switch (timeRange) {
                case '1h':
                    startDate.setHours(now.getHours() - 1);
                    break;
                case '24h':
                    startDate.setDate(now.getDate() - 1);
                    break;
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
            }
            const results = await Promise.all([
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_users,
              COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
              COUNT(CASE WHEN kyc_status = 'APPROVED' THEN 1 END) as kyc_approved,
              COUNT(CASE WHEN created_at >= ${startDate} THEN 1 END) as new_users
            FROM users
          `,
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_orders,
              COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_orders,
              COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN usdt_amount ELSE 0 END), 0) as total_volume,
              COUNT(CASE WHEN created_at >= ${startDate} THEN 1 END) as recent_orders
            FROM orders
            WHERE created_at >= ${startDate}
          `,
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_withdrawals,
              COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_withdrawals,
              COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_withdrawn,
              COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_withdrawals
            FROM withdrawals
            WHERE requested_at >= ${startDate}
          `,
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_actions,
              COUNT(DISTINCT actor_id) as active_actors,
              COUNT(CASE WHEN action LIKE '%LOGIN%' THEN 1 END) as login_events,
              COUNT(CASE WHEN action LIKE '%ERROR%' THEN 1 END) as error_events
            FROM audit_logs
            WHERE created_at >= ${startDate}
          `
            ]);
            return {
                timeRange,
                period: { startDate, endDate: now },
                users: results[0][0],
                orders: results[1][0],
                withdrawals: results[2][0],
                audit: results[3][0],
                lastUpdated: now,
            };
        }, { ttl: 600000 });
    }
    async getUserDashboardData(userId) {
        const cacheKey = `user_dashboard:${userId}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const [user, positions, recentOrders, pendingWithdrawals] = await Promise.all([
                this.database.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        kycStatus: true,
                        referralCode: true,
                        createdAt: true,
                        wallets: {
                            where: { isPrimary: true },
                            select: { address: true, chainId: true },
                            take: 1
                        }
                    }
                }),
                this.database.position.findMany({
                    where: { userId, status: 'ACTIVE' },
                    select: {
                        id: true,
                        principal: true,
                        product: {
                            select: { name: true, symbol: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }),
                this.database.order.findMany({
                    where: { userId },
                    select: {
                        id: true,
                        usdtAmount: true,
                        status: true,
                        createdAt: true,
                        product: {
                            select: { name: true, symbol: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }),
                this.database.withdrawal.findMany({
                    where: { userId, status: 'PENDING' },
                    select: {
                        id: true,
                        amount: true,
                        requestedAt: true,
                        status: true
                    },
                    orderBy: { requestedAt: 'desc' }
                })
            ]);
            const totalBalance = positions.reduce((sum, pos) => sum + Number(pos.principal || 0), 0);
            const totalEarnings = positions.reduce((sum, pos) => {
                const invested = Number(pos.principal);
                const current = Number(pos.principal || 0);
                return sum + (current - invested);
            }, 0);
            return {
                user,
                positions,
                recentOrders,
                pendingWithdrawals,
                totalBalance,
                totalEarnings,
                lastUpdated: new Date()
            };
        }, { ttl: 120000 });
    }
    async getAdminAnalytics(startDate, endDate) {
        const timeKey = startDate && endDate ? `${startDate.toISOString()}-${endDate.toISOString()}` : 'all';
        const cacheKey = `admin_analytics:${timeKey}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const dateFilter = {};
            if (startDate || endDate) {
                if (startDate)
                    dateFilter.gte = startDate;
                if (endDate)
                    dateFilter.lte = endDate;
            }
            const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
            const results = await Promise.all([
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_users,
              COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
              COUNT(CASE WHEN kyc_status = 'APPROVED' THEN 1 END) as kyc_approved,
              COUNT(CASE WHEN role = 'AGENT' THEN 1 END) as agents
            FROM users
            ${Object.keys(dateFilter).length > 0 ? `WHERE created_at >= ${dateFilter.gte} ${dateFilter.lte ? `AND created_at <= ${dateFilter.lte}` : ''}` : ''}
          `,
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_orders,
              COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_orders,
              COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders,
              COALESCE(AVG(usdt_amount), 0) as avg_order_size
            FROM orders
            ${Object.keys(dateFilter).length > 0 ? `WHERE created_at >= ${dateFilter.gte} ${dateFilter.lte ? `AND created_at <= ${dateFilter.lte}` : ''}` : ''}
          `,
                this.database.$queryRaw `
            SELECT 
              COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN usdt_amount ELSE 0 END), 0) as total_revenue,
              COALESCE(SUM(CASE WHEN status = 'PENDING' THEN usdt_amount ELSE 0 END), 0) as pending_revenue
            FROM orders
            ${Object.keys(dateFilter).length > 0 ? `WHERE created_at >= ${dateFilter.gte} ${dateFilter.lte ? `AND created_at <= ${dateFilter.lte}` : ''}` : ''}
          `,
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as total_withdrawals,
              COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_withdrawals,
              COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_withdrawn
            FROM withdrawals
            ${Object.keys(dateFilter).length > 0 ? `WHERE requested_at >= ${dateFilter.gte} ${dateFilter.lte ? `AND requested_at <= ${dateFilter.lte}` : ''}` : ''}
          `,
                this.database.$queryRaw `
            SELECT 
              COUNT(*) as active_connections,
              COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle_connections
            FROM pg_stat_activity 
            WHERE datname = current_database()
          `
            ]);
            return {
                totalUsers: Number(results[0][0].total_users),
                activeUsers: Number(results[0][0].active_users),
                totalOrders: Number(results[1][0].total_orders),
                totalRevenue: Number(results[2][0].total_revenue),
                pendingRevenue: Number(results[2][0].pending_revenue),
                withdrawalStats: results[3][0],
                systemHealth: results[4][0],
                period: { startDate, endDate },
                lastUpdated: new Date()
            };
        }, { ttl: 300000 });
    }
    async getUserPositions(userId, page = 1, limit = 20) {
        const cacheKey = `user_positions:${userId}:${page}:${limit}`;
        return this.performanceOptimizer.optimizeQuery(cacheKey, async () => {
            const skip = (page - 1) * limit;
            const [positions, total] = await Promise.all([
                this.database.position.findMany({
                    where: { userId },
                    select: {
                        id: true,
                        principal: true,
                        status: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                symbol: true,
                                minAmount: true
                            }
                        },
                        payouts: {
                            select: {
                                id: true,
                                amount: true,
                                isClaimable: true,
                                claimedAt: true
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 3
                        }
                    },
                    orderBy: [
                        { status: 'asc' },
                        { createdAt: 'desc' }
                    ],
                    skip,
                    take: limit
                }),
                this.database.position.count({
                    where: { userId }
                })
            ]);
            return {
                positions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: skip + limit < total,
                    hasPrev: page > 1
                }
            };
        }, { ttl: 180000 });
    }
    async performMaintenance() {
        const startTime = Date.now();
        const operations = [];
        const maintenanceTasks = [
            { name: 'ANALYZE Tables', query: 'ANALYZE;' },
            { name: 'REINDEX Database', query: 'REINDEX DATABASE qa_database;' }
        ];
        for (const task of maintenanceTasks) {
            const taskStart = Date.now();
            try {
                await this.database.$executeRawUnsafe(task.query);
                operations.push({
                    name: task.name,
                    success: true,
                    duration: Date.now() - taskStart
                });
            }
            catch (error) {
                operations.push({
                    name: task.name,
                    success: false,
                    duration: Date.now() - taskStart
                });
                this.logger.error(`Maintenance task failed: ${task.name}`, error);
            }
        }
        const totalDuration = Date.now() - startTime;
        const successCount = operations.filter(op => op.success).length;
        return {
            status: successCount === operations.length ? 'success' : 'partial',
            operations,
            summary: `Completed ${successCount}/${operations.length} maintenance tasks in ${totalDuration}ms`
        };
    }
};
exports.OptimizedQueriesService = OptimizedQueriesService;
exports.OptimizedQueriesService = OptimizedQueriesService = OptimizedQueriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        performance_optimizer_service_1.PerformanceOptimizerService])
], OptimizedQueriesService);
//# sourceMappingURL=optimized-queries.service.js.map