import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';
// PerformanceService integrated into monitoring module

@Injectable()
export class QueryOptimizerService {
  private readonly logger = new Logger(QueryOptimizerService.name);

  constructor(
    private readonly db: DatabaseService,
    // Performance monitoring integrated into monitoring module
  ) {}

  // 用户相关查询优化
  async findUserWithDetails(userId: string): Promise<any> {
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
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      
      return user;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error(`User query failed for ${userId}:`, error);
      throw error;
    }
  }

  // 订单相关查询优化
  async findUserOrders(userId: string, limit = 20, offset = 0): Promise<any> {
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
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      
      return orders;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error(`Orders query failed for user ${userId}:`, error);
      throw error;
    }
  }

  // 收益分配查询优化
  async findClaimablePayouts(userId: string): Promise<any> {
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
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      
      return payouts;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error(`Payouts query failed for user ${userId}:`, error);
      throw error;
    }
  }

  // 管理员仪表板查询优化
  async getDashboardStats() {
    const startTime = Date.now();
    
    try {
      const [
        totalUsers,
        activePositions,
        totalVolume,
        pendingWithdrawals
      ] = await Promise.all([
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
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      
      return {
        totalUsers,
        activePositions,
        totalVolume: totalVolume._sum.usdtAmount || 0,
        pendingWithdrawals,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error('Dashboard stats query failed:', error);
      throw error;
    }
  }

  // 批量查询优化 - 避免 N+1 问题
  async findUsersWithPositions(userIds: string[]): Promise<any> {
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
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      
      return users;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error(`Batch user query failed for ${userIds.length} users:`, error);
      throw error;
    }
  }

  // 分页查询优化
  async findOrdersPaginated(filters: {
    userId?: string;
    status?: string;
    productId?: string;
    startDate?: Date;
    endDate?: Date;
  }, page = 1, limit = 20): Promise<any> {
    const startTime = Date.now();
    const offset = (page - 1) * limit;
    
    try {
      const where: any = {};
      
      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
      if (filters.productId) where.productId = filters.productId;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
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
      // Performance tracking integrated into monitoring module
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
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error('Paginated orders query failed:', error);
      throw error;
    }
  }

  // 聚合查询优化
  async getFinancialSummary(userId: string) {
    const startTime = Date.now();
    
    try {
      const [
        totalInvestment,
        activePositions,
        totalEarnings,
        pendingPayouts
      ] = await Promise.all([
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
      // Performance tracking integrated into monitoring module
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
    } catch (error) {
      const queryTime = Date.now() - startTime;
      // Performance tracking integrated into monitoring module
      this.logger.debug(`Query time: ${queryTime}ms`);
      this.logger.error(`Financial summary query failed for user ${userId}:`, error);
      throw error;
    }
  }
}