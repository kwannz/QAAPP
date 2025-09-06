import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PositionStatus } from '@qa-app/database';

export interface MockPosition {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  principal: number;
  startDate: Date;
  endDate: Date;
  nextPayoutAt?: Date;
  nftTokenId?: number;
  nftTokenUri?: string;
  status: 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED';
  totalPaid: number;
  lastPayoutAt?: Date;
  maturityAmount?: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(private database: DatabaseService) {}

  /**
   * 创建新持仓
   * @param orderData 订单数据
   * @param productData 产品数据
   */
  async createPosition(orderData: any, productData: any): Promise<MockPosition> {
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
      
      return {
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
        status: position.status as 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED',
        totalPaid: 0, // 计算总支付金额
        lastPayoutAt: undefined,
        maturityAmount: this.calculateMaturityAmount(Number(position.principal), position.product.aprBps, position.product.lockDays),
        metadata: position.metadata,
        createdAt: position.createdAt,
        updatedAt: position.updatedAt
      };
    } catch (error) {
      this.logger.error('Failed to create position:', error);
      throw error;
    }
  }

  /**
   * 获取用户持仓列表
   */
  async getUserPositions(userId: string, queryDto: any = {}): Promise<{
    positions: MockPosition[];
    total: number;
    summary: {
      totalActive: number;
      totalPrincipal: number;
      totalPaid: number;
      estimatedTotal: number;
    };
  }> {
    try {
      const { page = 1, limit = 20, status } = queryDto;
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      // 并行查询数据和统计
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
        // 获取用户的所有收益统计
        this.database.payout.aggregate({
          where: {
            userId,
            claimedAt: { not: null }
          },
          _sum: { amount: true }
        })
      ]);

      // 转换为 MockPosition 格式
      const mockPositions: MockPosition[] = positions.map(pos => {
        const totalPaid = pos.payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
        return {
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
          status: pos.status as 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED',
          totalPaid,
          lastPayoutAt: pos.payouts.length > 0 ? pos.createdAt : undefined, // 简化处理
          maturityAmount: this.calculateMaturityAmount(Number(pos.principal), pos.product.aprBps, pos.product.lockDays),
          metadata: pos.metadata,
          createdAt: pos.createdAt,
          updatedAt: pos.updatedAt
        };
      });

      // 计算汇总信息
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
    } catch (error) {
      this.logger.error(`Failed to get positions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 获取单个持仓详情
   */
  async getPosition(positionId: string, userId?: string): Promise<MockPosition> {
    const where: any = { id: positionId };
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
      throw new NotFoundException('Position not found');
    }

    const totalPaid = await this.database.payout.aggregate({
      where: {
        positionId: position.id,
        claimedAt: { not: null }
      },
      _sum: { amount: true }
    });

    return {
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
      status: position.status as 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED',
      totalPaid: Number(totalPaid._sum.amount || 0),
      lastPayoutAt: position.payouts[0]?.claimedAt,
      maturityAmount: this.calculateMaturityAmount(Number(position.principal), position.product.aprBps, position.product.lockDays),
      metadata: position.metadata,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt
    };
  }

  /**
   * 获取所有活跃持仓（用于收益计算）
   */
  async getActivePositions(): Promise<MockPosition[]> {
    // 获取所有活跃持仓
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

    const activePositions: MockPosition[] = [];
    const now = new Date();

    for (const pos of positions) {
      // 检查是否已到期
      if (now > pos.endDate) {
        // 自动更新状态为可赎回
        await this.updatePositionStatus(pos.id, 'REDEEMING');
        continue;
      }

      // 计算已支付收益
      const totalPaid = await this.database.payout.aggregate({
        where: {
          positionId: pos.id,
          claimedAt: { not: null }
        },
        _sum: { amount: true }
      });

      activePositions.push({
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
        status: pos.status as 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED',
        totalPaid: Number(totalPaid._sum.amount || 0),
        lastPayoutAt: undefined, // 简化处理
        maturityAmount: this.calculateMaturityAmount(Number(pos.principal), pos.product.aprBps, pos.product.lockDays),
        metadata: pos.metadata,
        createdAt: pos.createdAt,
        updatedAt: pos.updatedAt
      });
    }

    return activePositions;
  }

  /**
   * 更新持仓状态
   */
  async updatePositionStatus(positionId: string, status: MockPosition['status']): Promise<MockPosition> {
    const updatedPosition = await this.database.position.update({
      where: { id: positionId },
      data: {
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        user: { select: { id: true, email: true } },
        product: { select: { id: true, name: true, symbol: true, aprBps: true, lockDays: true } },
        order: { select: { id: true, usdtAmount: true, status: true } }
      }
    });

    if (!updatedPosition) {
      throw new NotFoundException('Position not found');
    }

    // 计算已支付收益
    const totalPaid = await this.database.payout.aggregate({
      where: {
        positionId: updatedPosition.id,
        claimedAt: { not: null }
      },
      _sum: { amount: true }
    });

    this.logger.log(`Updated position ${positionId} status to ${status}`);
    
    return {
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
      status: updatedPosition.status as 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED',
      totalPaid: Number(totalPaid._sum.amount || 0),
      lastPayoutAt: undefined,
      maturityAmount: this.calculateMaturityAmount(Number(updatedPosition.principal), updatedPosition.product.aprBps, updatedPosition.product.lockDays),
      metadata: updatedPosition.metadata,
      createdAt: updatedPosition.createdAt,
      updatedAt: updatedPosition.updatedAt
    };
  }

  /**
   * 记录收益支付
   */
  async recordPayoutPayment(positionId: string, payoutAmount: number): Promise<MockPosition> {
    // 更新持仓的下次支付时间
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
      throw new NotFoundException('Position not found');
    }

    // 重新计算总支付金额
    const totalPaid = await this.database.payout.aggregate({
      where: {
        positionId: updatedPosition.id,
        claimedAt: { not: null }
      },
      _sum: { amount: true }
    });

    this.logger.log(`Recorded payout payment for position ${positionId}: $${payoutAmount.toFixed(6)}`);
    
    return {
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
      status: updatedPosition.status as 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED',
      totalPaid: Number(totalPaid._sum.amount || 0),
      lastPayoutAt: new Date(),
      maturityAmount: this.calculateMaturityAmount(Number(updatedPosition.principal), updatedPosition.product.aprBps, updatedPosition.product.lockDays),
      metadata: updatedPosition.metadata,
      createdAt: updatedPosition.createdAt,
      updatedAt: updatedPosition.updatedAt
    };
  }

  /**
   * 赎回持仓
   */
  async redeemPosition(positionId: string, userId: string): Promise<{
    position: MockPosition;
    redeemAmount: number;
    txHash?: string;
  }> {
    try {
      const position = await this.getPosition(positionId, userId);
      
      // 检查赎回条件
      if (position.status !== 'REDEEMING') {
        // 检查是否已到期
        const now = new Date();
        if (now < position.endDate) {
          throw new BadRequestException('Position has not matured yet');
        }
        
        // 自动更新为可赎回状态
        await this.updatePositionStatus(positionId, 'REDEEMING');
      }

      // 计算赎回金额
      const remainingDays = Math.max(0, Math.ceil((position.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      const product = await this.database.product.findUnique({ where: { id: position.productId } });
      
      let redeemAmount = position.principal;
      if (product && remainingDays === 0) {
        // 到期赎回，返回到期金额
        redeemAmount = position.maturityAmount || position.principal;
      } else {
        // 提前赎回，只返回本金（可根据业务规则调整）
        redeemAmount = position.principal;
      }

      // 模拟区块链交易
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const redeemTime = new Date();

      // 更新持仓状态和元数据
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

      // 计算已支付收益
      const totalPaid = await this.database.payout.aggregate({
        where: {
          positionId: closedPosition.id,
          claimedAt: { not: null }
        },
        _sum: { amount: true }
      });

      const finalPosition: MockPosition = {
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
      };

      this.logger.log(`Position ${positionId} redeemed: $${redeemAmount.toFixed(6)}, tx: ${mockTxHash}`);

      return {
        position: finalPosition,
        redeemAmount,
        txHash: mockTxHash,
      };
    } catch (error) {
      this.logger.error(`Failed to redeem position ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * 获取系统持仓统计
   */
  async getSystemPositionStats(): Promise<{
    totalPositions: number;
    activePositions: number;
    totalValueLocked: number;
    totalValuePaid: number;
    positionsByStatus: Record<string, number>;
  }> {
    try {
      const [totalCount, activeCount, tvlStats, paidStats, statusStats] = await Promise.all([
        // 总持仓数
        this.database.position.count(),
        // 活跃持仓数
        this.database.position.count({ where: { status: 'ACTIVE' } }),
        // 总锁定价值 (TVL)
        this.database.position.aggregate({
          where: { status: 'ACTIVE' },
          _sum: { principal: true }
        }),
        // 已支付收益总金额
        this.database.payout.aggregate({
          where: { claimedAt: { not: null } },
          _sum: { amount: true }
        }),
        // 按状态分组统计
        this.database.position.groupBy({
          by: ['status'],
          _count: true
        })
      ]);

      const positionsByStatus: Record<string, number> = {};
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
    } catch (error) {
      this.logger.error('Failed to get system position stats:', error);
      throw error;
    }
  }

  /**
   * 计算下次收益发放时间
   */
  private getNextPayoutDate(fromDate: Date): Date {
    const nextPayout = new Date(fromDate);
    nextPayout.setDate(nextPayout.getDate() + 1);
    nextPayout.setHours(0, 0, 0, 0); // 每天0点发放
    return nextPayout;
  }

  /**
   * 计算到期金额
   */
  private calculateMaturityAmount(principal: number, aprBps: number, lockDays: number): number {
    const annualRate = aprBps / 10000;
    return principal * (1 + (annualRate * lockDays / 365));
  }

  /**
   * 初始化测试数据 (保留但不再使用内存存储)
   */
  async initializeTestData(): Promise<void> {
    this.logger.log('Test data initialization is now handled by database seeders');
    // 数据初始化现在由数据库种子文件处理
  }
}