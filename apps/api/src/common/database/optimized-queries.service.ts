import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PerformanceOptimizerService } from '../performance/performance-optimizer.service';
import { UserRole, KycStatus, OrderStatus, CommissionStatus, WithdrawalStatus } from '@qa-app/database';

export interface OptimizedUserQuery {
  id?: string;
  email?: string;
  role?: UserRole;
  kycStatus?: KycStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
  includeWallets?: boolean;
  includeStats?: boolean;
}

export interface OptimizedTransactionQuery {
  userId?: string;
  type?: 'ORDER' | 'COMMISSION' | 'WITHDRAWAL' | 'PAYOUT';
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class OptimizedQueriesService {
  private readonly logger = new Logger(OptimizedQueriesService.name);

  constructor(
    private database: DatabaseService,
    private performanceOptimizer: PerformanceOptimizerService
  ) {}

  /**
   * 优化的用户查询 - 使用复合索引和智能缓存
   */
  async findUsers(query: OptimizedUserQuery) {
    const cacheKey = `optimized_users:${JSON.stringify(query)}`;
    
    return this.performanceOptimizer.optimizeQuery(
      cacheKey,
      async () => {
        const { page = 1, limit = 20, includeWallets = false, includeStats = false } = query;
        const skip = (page - 1) * limit;

        // 构建优化的查询条件，利用数据库索引
        const where: any = {};
        
        if (query.email) {
          // 利用 email 索引
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

        // 基础查询，利用复合索引 (role, kycStatus, isActive)
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

        // 条件性包含关系数据
        const include: any = {};
        if (includeWallets) {
          include.wallets = {
            where: { isPrimary: true }, // 只加载主钱包
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
              { id: 'asc' } // 稳定排序
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
      },
      { ttl: 300000 } // 5分钟缓存
    );
  }

  /**
   * 优化的交易聚合查询 - 跨表统一视图
   */
  async findTransactions(query: OptimizedTransactionQuery) {
    const cacheKey = `optimized_transactions:${JSON.stringify(query)}`;
    
    return this.performanceOptimizer.optimizeQuery(
      cacheKey,
      async () => {
        const { userId, type, status, startDate, endDate, limit = 50, offset = 0 } = query;
        const transactions: any[] = [];

        // 构建时间范围过滤器
        const dateFilter: any = {};
        if (startDate || endDate) {
          if (startDate) dateFilter.gte = startDate;
          if (endDate) dateFilter.lte = endDate;
        }

        // 批量查询不同类型的交易
        const batchQueries = [];

        if (!type || type === 'ORDER') {
          batchQueries.push(
            this.database.order.findMany({
              where: {
                ...(userId && { userId }),
                ...(status && { status: status as OrderStatus }),
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
            }).then(orders => 
              orders.map(order => ({
                id: order.id,
                type: 'ORDER',
                amount: order.usdtAmount,
                status: order.status,
                userEmail: order.user.email,
                productInfo: order.product,
                createdAt: order.createdAt,
                completedAt: order.confirmedAt,
              }))
            )
          );
        }

        if (!type || type === 'COMMISSION') {
          batchQueries.push(
            this.database.commission.findMany({
              where: {
                ...(userId && { userId }),
                ...(status && { status: status as CommissionStatus }),
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
            }).then(commissions => 
              commissions.map(comm => ({
                id: comm.id,
                type: 'COMMISSION',
                amount: comm.amount,
                status: comm.status,
                userEmail: comm.user.email,
                commissionType: comm.commissionType,
                createdAt: comm.createdAt,
                completedAt: comm.settledAt,
              }))
            )
          );
        }

        if (!type || type === 'WITHDRAWAL') {
          batchQueries.push(
            this.database.withdrawal.findMany({
              where: {
                ...(userId && { userId }),
                ...(status && { status: status as WithdrawalStatus }),
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
            }).then(withdrawals => 
              withdrawals.map(w => ({
                id: w.id,
                type: 'WITHDRAWAL',
                amount: w.amount,
                status: w.status,
                userEmail: w.user.email,
                withdrawalType: w.withdrawalType,
                createdAt: w.requestedAt,
                completedAt: w.completedAt,
              }))
            )
          );
        }

        if (!type || type === 'PAYOUT') {
          batchQueries.push(
            this.database.payout.findMany({
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
            }).then(payouts => 
              payouts.map(p => ({
                id: p.id,
                type: 'PAYOUT',
                amount: p.amount,
                status: p.isClaimable ? (p.claimedAt ? 'CLAIMED' : 'CLAIMABLE') : 'PENDING',
                userEmail: p.user.email,
                productInfo: p.position.product,
                createdAt: p.createdAt,
                completedAt: p.claimedAt,
              }))
            )
          );
        }

        // 并行执行所有查询
        const results = await Promise.all(batchQueries);
        
        // 合并和排序结果
        const allTransactions = results.flat().sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          data: allTransactions.slice(0, limit),
          total: allTransactions.length,
          offset,
          limit
        };
      },
      { ttl: 240000 } // 4分钟缓存
    );
  }

  /**
   * 优化的用户统计查询 - 使用聚合函数减少数据传输
   */
  async getUserStatistics(timeRange?: { startDate?: Date; endDate?: Date }) {
    const cacheKey = `user_stats:${timeRange?.startDate?.toISOString() || 'all'}:${timeRange?.endDate?.toISOString() || 'all'}`;
    
    return this.performanceOptimizer.optimizeQuery(
      cacheKey,
      async () => {
        const dateFilter: any = {};
        if (timeRange?.startDate || timeRange?.endDate) {
          if (timeRange.startDate) dateFilter.gte = timeRange.startDate;
          if (timeRange.endDate) dateFilter.lte = timeRange.endDate;
        }

        const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

        // 使用高效的聚合查询
        const [
          totalUsers,
          activeUsers,
          usersByRole,
          usersByKyc,
          recentRegistrations,
        ] = await Promise.all([
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
          // 最近7天注册统计
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
          }, {} as Record<string, number>),
          usersByKyc: usersByKyc.reduce((acc, item) => {
            acc[item.kycStatus] = item._count.kycStatus;
            return acc;
          }, {} as Record<string, number>),
          recentRegistrations,
          lastUpdated: new Date(),
        };
      },
      { ttl: 900000 } // 15分钟缓存，用户统计变化不频繁
    );
  }

  /**
   * 优化的审计日志查询 - 支持高效分页和筛选
   */
  async getOptimizedAuditLogs(
    filters: {
      actorId?: string;
      actions?: string[];
      resourceTypes?: string[];
      startDate?: Date;
      endDate?: Date;
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ) {
    const cacheKey = `optimized_audit:${JSON.stringify({ ...filters, ...pagination })}`;
    
    return this.performanceOptimizer.optimizeQuery(
      cacheKey,
      async () => {
        const { page = 1, limit = 100 } = pagination;
        const skip = (page - 1) * limit;

        // 构建优化的查询条件
        const where: any = {};

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
          if (filters.startDate) where.createdAt.gte = filters.startDate;
          if (filters.endDate) where.createdAt.lte = filters.endDate;
        }

        // 并行执行查询和计数
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
              { id: 'desc' } // 使用ID作为辅助排序
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
      },
      { ttl: 300000 } // 5分钟缓存
    );
  }

  /**
   * 优化的仪表板数据查询 - 单次查询获取多种统计
   */
  async getDashboardStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
    const cacheKey = `dashboard_stats:${timeRange}`;
    
    return this.performanceOptimizer.optimizeQuery(
      cacheKey,
      async () => {
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

        // 使用原生SQL查询提高性能
        const [
          userStats,
          orderStats,
          withdrawalStats,
          auditStats
        ] = await Promise.all([
          // 用户统计
          this.database.$queryRaw`
            SELECT 
              COUNT(*) as total_users,
              COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
              COUNT(CASE WHEN kyc_status = 'APPROVED' THEN 1 END) as kyc_approved,
              COUNT(CASE WHEN created_at >= ${startDate} THEN 1 END) as new_users
            FROM users
          `,
          
          // 订单统计
          this.database.$queryRaw`
            SELECT 
              COUNT(*) as total_orders,
              COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_orders,
              COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN usdt_amount ELSE 0 END), 0) as total_volume,
              COUNT(CASE WHEN created_at >= ${startDate} THEN 1 END) as recent_orders
            FROM orders
            WHERE created_at >= ${startDate}
          `,

          // 提现统计
          this.database.$queryRaw`
            SELECT 
              COUNT(*) as total_withdrawals,
              COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_withdrawals,
              COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_withdrawn,
              COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_withdrawals
            FROM withdrawals
            WHERE requested_at >= ${startDate}
          `,

          // 审计统计
          this.database.$queryRaw`
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
          users: userStats[0],
          orders: orderStats[0],
          withdrawals: withdrawalStats[0],
          audit: auditStats[0],
          lastUpdated: now,
        };
      },
      { ttl: 600000 } // 10分钟缓存，仪表板数据允许稍微延迟
    );
  }

  /**
   * 清理过期缓存和优化数据库连接
   */
  async performMaintenance() {
    try {
      // 清理所有缓存 (clearExpiredCache method doesn't exist)
      await this.performanceOptimizer.clearAllCaches();

      // 数据库连接池状态检查
      const connectionInfo = await this.database.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(case when state = 'active' then 1 end) as active_connections,
          count(case when state = 'idle' then 1 end) as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;

      this.logger.log(`Database maintenance completed. Connections: ${JSON.stringify(connectionInfo)}`);
      
      return {
        cacheCleared: true,
        connectionStatus: connectionInfo,
        maintenanceAt: new Date()
      };
    } catch (error) {
      this.logger.error('Database maintenance failed', error);
      throw error;
    }
  }
}