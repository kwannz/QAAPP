import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
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
  
  // 内存存储持仓数据
  private positions: Map<string, MockPosition> = new Map();

  constructor(private database: DatabaseService) {}

  /**
   * 创建新持仓
   * @param orderData 订单数据
   * @param productData 产品数据
   */
  async createPosition(orderData: any, productData: any): Promise<MockPosition> {
    try {
      const positionId = `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + productData.lockDays * 24 * 60 * 60 * 1000);
      
      // 计算到期本息合计
      const annualRate = productData.aprBps / 10000;
      const totalReturn = orderData.usdtAmount * (1 + (annualRate * productData.lockDays / 365));
      
      const position: MockPosition = {
        id: positionId,
        userId: orderData.userId,
        productId: orderData.productId,
        orderId: orderData.id,
        principal: orderData.usdtAmount,
        startDate,
        endDate,
        nextPayoutAt: this.getNextPayoutDate(startDate),
        nftTokenId: productData.nftTokenId,
        status: 'ACTIVE',
        totalPaid: 0,
        maturityAmount: totalReturn,
        metadata: {
          productSymbol: productData.symbol,
          productName: productData.name,
          aprBps: productData.aprBps,
          lockDays: productData.lockDays,
          paymentType: orderData.metadata?.paymentType || 'USDT',
          txHash: orderData.txHash,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.positions.set(positionId, position);
      this.logger.log(`Created position ${positionId} for user ${orderData.userId}, amount: $${orderData.usdtAmount}`);
      
      return position;
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
      const userPositions = Array.from(this.positions.values())
        .filter(position => position.userId === userId);

      // 状态过滤
      let filteredPositions = userPositions;
      if (queryDto.status) {
        filteredPositions = userPositions.filter(p => p.status === queryDto.status);
      }

      // 排序
      filteredPositions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // 分页
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 20;
      const start = (page - 1) * limit;
      const paginatedPositions = filteredPositions.slice(start, start + limit);

      // 计算汇总信息
      const activePositions = userPositions.filter(p => p.status === 'ACTIVE');
      const summary = {
        totalActive: activePositions.length,
        totalPrincipal: activePositions.reduce((sum, p) => sum + p.principal, 0),
        totalPaid: userPositions.reduce((sum, p) => sum + p.totalPaid, 0),
        estimatedTotal: activePositions.reduce((sum, p) => sum + (p.maturityAmount || p.principal), 0),
      };

      this.logger.log(`Retrieved ${paginatedPositions.length} positions for user ${userId}`);

      return {
        positions: paginatedPositions,
        total: filteredPositions.length,
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
    const position = this.positions.get(positionId);
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    // 检查用户权限
    if (userId && position.userId !== userId) {
      throw new NotFoundException('Position not found');
    }

    return position;
  }

  /**
   * 获取所有活跃持仓（用于收益计算）
   */
  async getActivePositions(): Promise<MockPosition[]> {
    const activePositions = Array.from(this.positions.values())
      .filter(position => {
        if (position.status !== 'ACTIVE') return false;
        
        // 检查是否已到期
        const now = new Date();
        if (now > position.endDate) {
          // 自动更新状态为可赎回
          this.updatePositionStatus(position.id, 'REDEEMING');
          return false;
        }
        
        return true;
      });

    return activePositions;
  }

  /**
   * 更新持仓状态
   */
  async updatePositionStatus(positionId: string, status: MockPosition['status']): Promise<MockPosition> {
    const position = this.positions.get(positionId);
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    const updatedPosition = {
      ...position,
      status,
      updatedAt: new Date(),
    };

    this.positions.set(positionId, updatedPosition);
    this.logger.log(`Updated position ${positionId} status to ${status}`);
    
    return updatedPosition;
  }

  /**
   * 记录收益支付
   */
  async recordPayoutPayment(positionId: string, payoutAmount: number): Promise<MockPosition> {
    const position = this.positions.get(positionId);
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    const updatedPosition = {
      ...position,
      totalPaid: position.totalPaid + payoutAmount,
      lastPayoutAt: new Date(),
      nextPayoutAt: this.getNextPayoutDate(new Date()),
      updatedAt: new Date(),
    };

    this.positions.set(positionId, updatedPosition);
    this.logger.log(`Recorded payout payment for position ${positionId}: $${payoutAmount.toFixed(6)}`);
    
    return updatedPosition;
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

      // 计算赎回金额（本金 + 剩余收益）
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

      // 更新持仓状态
      const closedPosition = await this.updatePositionStatus(positionId, 'CLOSED');
      closedPosition.metadata = {
        ...closedPosition.metadata,
        redeemAt: new Date().toISOString(),
        redeemTxHash: mockTxHash,
        redeemAmount,
        finalStatus: 'REDEEMED',
      };
      this.positions.set(positionId, closedPosition);

      this.logger.log(`Position ${positionId} redeemed: $${redeemAmount.toFixed(6)}, tx: ${mockTxHash}`);

      return {
        position: closedPosition,
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
      const allPositions = Array.from(this.positions.values());
      
      const stats = {
        totalPositions: allPositions.length,
        activePositions: allPositions.filter(p => p.status === 'ACTIVE').length,
        totalValueLocked: allPositions
          .filter(p => p.status === 'ACTIVE')
          .reduce((sum, p) => sum + p.principal, 0),
        totalValuePaid: allPositions.reduce((sum, p) => sum + p.totalPaid, 0),
        positionsByStatus: allPositions.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
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
   * 初始化测试数据
   */
  async initializeTestData(): Promise<void> {
    // 创建一些测试持仓数据
    const testPositions: MockPosition[] = [
      {
        id: 'pos-test-001',
        userId: 'user-test-001',
        productId: 'prod-silver-001',
        orderId: 'order-test-001',
        principal: 1000,
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-27'),
        nextPayoutAt: this.getNextPayoutDate(new Date()),
        nftTokenId: 1,
        status: 'ACTIVE',
        totalPaid: 15.48, // 已支付7天收益
        lastPayoutAt: new Date(),
        maturityAmount: 1015.48,
        metadata: {
          productSymbol: 'SILVER',
          productName: '银卡产品',
          aprBps: 800,
          lockDays: 7,
          paymentType: 'USDT',
          txHash: '0xtest123...',
        },
        createdAt: new Date('2025-08-20'),
        updatedAt: new Date(),
      },
    ];

    testPositions.forEach(position => {
      this.positions.set(position.id, position);
    });

    this.logger.log(`Initialized ${testPositions.length} test positions`);
  }
}