import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { MockDatabaseService } from '../database/mock-database.service';

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
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPayout {
  id: string;
  userId: string;
  positionId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: 'PENDING' | 'CLAIMED' | 'FAILED';
  isClaimable: boolean;
  claimedAt?: Date;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(private mockDatabase: MockDatabaseService) {}

  /**
   * 计算每日收益
   * @param principal 本金金额
   * @param aprBps 年化收益率(基点)
   * @returns 每日收益金额
   */
  private calculateDailyPayout(principal: number, aprBps: number): number {
    const annualRate = aprBps / 10000; // 转换基点到小数
    const dailyRate = annualRate / 365;
    return principal * dailyRate;
  }

  /**
   * 为活跃持仓生成每日收益记录
   */
  async generateDailyPayouts(): Promise<void> {
    try {
      const positions = await this.getActivePositions();
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

      this.logger.log(`Processing daily payouts for ${positions.length} active positions`);

      for (const position of positions) {
        // 检查今天是否已经生成了收益记录
        const existingPayout = await this.findPayoutByPositionAndDate(position.id, todayStart);
        if (existingPayout) {
          this.logger.debug(`Payout already exists for position ${position.id} on ${todayStart.toISOString()}`);
          continue;
        }

        // 获取产品信息计算收益
        const product = await this.mockDatabase.findProduct(position.productId);
        if (!product) {
          this.logger.warn(`Product not found for position ${position.id}`);
          continue;
        }

        // 计算每日收益
        const dailyAmount = this.calculateDailyPayout(position.principal, product.aprBps);

        // 创建收益记录
        const payout: MockPayout = {
          id: `payout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: position.userId,
          positionId: position.id,
          amount: dailyAmount,
          periodStart: todayStart,
          periodEnd: todayEnd,
          status: 'PENDING',
          isClaimable: true, // 每日收益立即可领取
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.createPayout(payout);
        this.logger.log(`Created daily payout ${payout.id}: $${dailyAmount.toFixed(6)} for position ${position.id}`);
      }

      this.logger.log('Daily payout generation completed');
    } catch (error) {
      this.logger.error('Failed to generate daily payouts:', error);
      throw error;
    }
  }

  /**
   * 获取所有活跃持仓
   */
  private async getActivePositions(): Promise<MockPosition[]> {
    // 这里模拟从数据库获取活跃持仓
    // 实际应该从Position表查询status='ACTIVE'的记录
    const activePositions: MockPosition[] = [
      {
        id: 'pos-001',
        userId: 'user-test-001',
        productId: 'prod-silver-001',
        orderId: 'order-001',
        principal: 1000,
        startDate: new Date('2024-08-20'),
        endDate: new Date('2024-09-20'),
        status: 'ACTIVE',
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-08-20'),
      },
      // 可以添加更多测试数据
    ];

    return activePositions;
  }

  /**
   * 根据持仓和日期查找收益记录
   */
  private async findPayoutByPositionAndDate(positionId: string, date: Date): Promise<MockPayout | null> {
    // 模拟数据库查询
    // 实际应该查询Payout表中positionId和periodStart匹配的记录
    return null; // 暂时返回null，表示没有找到现有记录
  }

  /**
   * 创建收益记录
   */
  private async createPayout(payout: MockPayout): Promise<MockPayout> {
    // 这里应该保存到数据库
    // 暂时只记录日志
    return payout;
  }

  /**
   * 获取用户的可领取收益
   */
  async getClaimablePayouts(userId: string): Promise<{
    payouts: MockPayout[];
    totalAmount: number;
  }> {
    try {
      // 模拟获取用户的可领取收益
      const mockPayouts: MockPayout[] = [
        {
          id: 'payout-001',
          userId: userId,
          positionId: 'pos-001',
          amount: 2.74,
          periodStart: new Date('2024-08-24'),
          periodEnd: new Date('2024-08-25'),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date('2024-08-25'),
          updatedAt: new Date('2024-08-25'),
        },
        {
          id: 'payout-002',
          userId: userId,
          positionId: 'pos-001',
          amount: 2.74,
          periodStart: new Date('2024-08-23'),
          periodEnd: new Date('2024-08-24'),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date('2024-08-24'),
          updatedAt: new Date('2024-08-24'),
        },
      ];

      const totalAmount = mockPayouts.reduce((sum, payout) => sum + payout.amount, 0);

      this.logger.log(`Found ${mockPayouts.length} claimable payouts for user ${userId}, total: $${totalAmount.toFixed(2)}`);

      return {
        payouts: mockPayouts,
        totalAmount,
      };
    } catch (error) {
      this.logger.error(`Failed to get claimable payouts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 领取收益
   */
  async claimPayouts(userId: string, payoutIds: string[]): Promise<{
    claimedAmount: number;
    txHash?: string;
    claimedPayouts: MockPayout[];
  }> {
    try {
      if (!payoutIds || payoutIds.length === 0) {
        throw new BadRequestException('No payout IDs provided');
      }

      this.logger.log(`Processing payout claim for user ${userId}, payouts: ${payoutIds.join(', ')}`);

      // 验证收益记录
      const { payouts } = await this.getClaimablePayouts(userId);
      const payoutsToClaimMap = new Map(payouts.map(p => [p.id, p]));

      const validPayouts = payoutIds
        .map(id => payoutsToClaimMap.get(id))
        .filter((payout): payout is MockPayout => payout !== undefined && payout.isClaimable);

      if (validPayouts.length === 0) {
        throw new BadRequestException('No valid claimable payouts found');
      }

      const claimedAmount = validPayouts.reduce((sum, payout) => sum + payout.amount, 0);

      // 模拟区块链交易
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const claimTime = new Date();

      // 更新收益记录状态
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
    } catch (error) {
      this.logger.error(`Failed to claim payouts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 获取用户的收益历史
   */
  async getPayoutHistory(userId: string, queryDto: any = {}): Promise<{
    payouts: MockPayout[];
    total: number;
    totalClaimed: number;
    totalPending: number;
  }> {
    try {
      // 模拟收益历史数据
      const allPayouts: MockPayout[] = [
        {
          id: 'payout-001',
          userId: userId,
          positionId: 'pos-001',
          amount: 2.74,
          periodStart: new Date('2024-08-24'),
          periodEnd: new Date('2024-08-25'),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date('2024-08-25'),
          updatedAt: new Date('2024-08-25'),
        },
        {
          id: 'payout-003',
          userId: userId,
          positionId: 'pos-001',
          amount: 2.74,
          periodStart: new Date('2024-08-22'),
          periodEnd: new Date('2024-08-23'),
          status: 'CLAIMED',
          isClaimable: false,
          claimedAt: new Date('2024-08-23T10:30:00Z'),
          txHash: '0xabcd1234...',
          createdAt: new Date('2024-08-23'),
          updatedAt: new Date('2024-08-23T10:30:00Z'),
        },
      ];

      const totalClaimed = allPayouts
        .filter(p => !p.isClaimable && p.claimedAt)
        .reduce((sum, p) => sum + p.amount, 0);

      const totalPending = allPayouts
        .filter(p => p.isClaimable)
        .reduce((sum, p) => sum + p.amount, 0);

      this.logger.log(`Payout history for user ${userId}: ${allPayouts.length} records, claimed: $${totalClaimed.toFixed(2)}, pending: $${totalPending.toFixed(2)}`);

      return {
        payouts: allPayouts,
        total: allPayouts.length,
        totalClaimed,
        totalPending,
      };
    } catch (error) {
      this.logger.error(`Failed to get payout history for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 获取系统收益统计
   */
  async getSystemPayoutStats(): Promise<{
    totalDistributed: number;
    totalPending: number;
    activePositions: number;
    totalUsers: number;
  }> {
    try {
      // 模拟系统统计数据
      const stats = {
        totalDistributed: 15420.50,
        totalPending: 842.30,
        activePositions: 156,
        totalUsers: 89,
      };

      this.logger.log(`System payout stats: distributed: $${stats.totalDistributed}, pending: $${stats.totalPending}`);
      return stats;
    } catch (error) {
      this.logger.error('Failed to get system payout stats:', error);
      throw error;
    }
  }

  /**
   * 为指定持仓生成可领取收益列表 (Controller需要的方法)
   */
  async generateClaimablePayouts(positionId: string, userId: string): Promise<MockPayout[]> {
    try {
      // 模拟生成可领取收益
      const now = new Date();
      const claimablePayouts: MockPayout[] = [
        {
          id: `payout-${positionId}-${now.getTime()}-1`,
          userId: userId,
          positionId: positionId,
          amount: 2.74,
          periodStart: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: `payout-${positionId}-${now.getTime()}-2`,
          userId: userId,
          positionId: positionId,
          amount: 2.74,
          periodStart: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return claimablePayouts;
    } catch (error) {
      this.logger.error(`Failed to generate claimable payouts for position ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * 获取指定持仓的所有收益记录 (Controller需要的方法)
   */
  async getPositionPayouts(positionId: string): Promise<MockPayout[]> {
    try {
      // 模拟持仓收益历史
      const now = new Date();
      const payouts: MockPayout[] = [
        // 已领取的收益
        {
          id: `payout-${positionId}-claimed-1`,
          userId: 'user-test-001',
          positionId: positionId,
          amount: 2.74,
          periodStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          status: 'CLAIMED',
          isClaimable: false,
          claimedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: `payout-${positionId}-claimed-2`,
          userId: 'user-test-001',
          positionId: positionId,
          amount: 2.74,
          periodStart: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          status: 'CLAIMED',
          isClaimable: false,
          claimedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        // 待领取的收益
        {
          id: `payout-${positionId}-pending-1`,
          userId: 'user-test-001',
          positionId: positionId,
          amount: 2.74,
          periodStart: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: `payout-${positionId}-pending-2`,
          userId: 'user-test-001',
          positionId: positionId,
          amount: 2.74,
          periodStart: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(),
          status: 'PENDING',
          isClaimable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return payouts;
    } catch (error) {
      this.logger.error(`Failed to get payouts for position ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * 根据ID查找收益记录 (Controller需要的方法)
   */
  async findPayoutById(payoutId: string): Promise<MockPayout | null> {
    try {
      // 模拟数据库查询
      if (payoutId.includes('not-found')) {
        return null;
      }

      const mockPayout: MockPayout = {
        id: payoutId,
        userId: 'user-test-001',
        positionId: 'pos-test-001',
        amount: 2.74,
        periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        status: 'PENDING',
        isClaimable: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };

      return mockPayout;
    } catch (error) {
      this.logger.error(`Failed to find payout ${payoutId}:`, error);
      throw error;
    }
  }

  /**
   * 领取多个收益记录 (Controller需要的方法)
   */
  async claimMultiplePayouts(payoutIds: string[], userId: string): Promise<{
    success: boolean;
    totalAmount: number;
    txHash: string;
    message?: string;
  }> {
    try {
      this.logger.log(`Processing claim for ${payoutIds.length} payouts by user ${userId}`);

      // 模拟验证和计算
      let totalAmount = 0;
      for (const payoutId of payoutIds) {
        const payout = await this.findPayoutById(payoutId);
        if (payout && payout.status === 'PENDING') {
          totalAmount += payout.amount;
        }
      }

      if (totalAmount === 0) {
        return {
          success: false,
          totalAmount: 0,
          txHash: '',
          message: '没有有效的可领取收益',
        };
      }

      // 模拟区块链交易
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // 模拟90%的成功率
      const simulatedSuccess = Math.random() > 0.1;
      
      if (simulatedSuccess) {
        this.logger.log(`Successfully claimed ${payoutIds.length} payouts, total: $${totalAmount.toFixed(6)}, tx: ${mockTxHash}`);
        
        return {
          success: true,
          totalAmount,
          txHash: mockTxHash,
        };
      } else {
        this.logger.error('Simulated blockchain transaction failure');
        return {
          success: false,
          totalAmount: 0,
          txHash: '',
          message: '区块链交易失败，请重试',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to claim multiple payouts:`, error);
      return {
        success: false,
        totalAmount: 0,
        txHash: '',
        message: `领取失败: ${error.message}`,
      };
    }
  }
}