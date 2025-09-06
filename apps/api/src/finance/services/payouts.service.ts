import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { getErrorMessage, getErrorStack } from '../../common/utils/error.utils';
import { FinanceMappingUtils, MockPosition, MockPayout } from '../interfaces/mapping.interface';


@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(private database: DatabaseService) {}

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
        const product = await this.database.product.findUnique({ where: { id: position.productId } });
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
    } catch (error: unknown) {
      this.logger.error('Failed to generate daily payouts:', error);
      throw error;
    }
  }

  /**
   * 获取所有活跃持仓
   */
  private async getActivePositions(): Promise<MockPosition[]> {
    const positions = await this.database.position.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // 确保持仓还没到期
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

    return positions.map(pos => FinanceMappingUtils.mapDatabasePositionToMock({
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
      metadata: pos.metadata,
      createdAt: pos.createdAt,
      updatedAt: pos.updatedAt
    }));
  }

  /**
   * 根据持仓和日期查找收益记录
   */
  private async findPayoutByPositionAndDate(positionId: string, date: Date): Promise<MockPayout | null> {
    const payout = await this.database.payout.findFirst({
      where: {
        positionId,
        periodStart: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) // 同一天
        }
      },
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });

    if (!payout) return null;

    return FinanceMappingUtils.mapDatabasePayoutToMock({
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

  /**
   * 创建收益记录
   */
  private async createPayout(payout: MockPayout): Promise<MockPayout> {
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

    return FinanceMappingUtils.mapDatabasePayoutToMock({
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

  /**
   * 获取用户的可领取收益
   */
  async getClaimablePayouts(userId: string): Promise<{
    payouts: MockPayout[];
    totalAmount: number;
  }> {
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

      const mockPayouts: MockPayout[] = payouts.map(payout => FinanceMappingUtils.mapDatabasePayoutToMock({
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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

      const allPayouts: MockPayout[] = payouts.map(payout => FinanceMappingUtils.mapDatabasePayoutToMock({
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

      // 获取统计数据
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
    } catch (error: unknown) {
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
      const [distributedStats, pendingStats, activePositionCount, totalUserCount] = await Promise.all([
        // 已分发收益
        this.database.payout.aggregate({
          where: {
            claimedAt: { not: null }
          },
          _sum: { amount: true }
        }),
        // 待领取收益
        this.database.payout.aggregate({
          where: {
            isClaimable: true,
            claimedAt: null
          },
          _sum: { amount: true }
        }),
        // 活跃持仓数
        this.database.position.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        // 用户总数（有收益记录的用户）
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
    } catch (error: unknown) {
      this.logger.error('Failed to get system payout stats:', error);
      throw error;
    }
  }

  /**
   * 为指定持仓生成可领取收益列表 (Controller需要的方法)
   */
  async generateClaimablePayouts(positionId: string, userId: string): Promise<MockPayout[]> {
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

      return payouts.map(payout => FinanceMappingUtils.mapDatabasePayoutToMock({
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
    } catch (error: unknown) {
      this.logger.error(`Failed to generate claimable payouts for position ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * 获取指定持仓的所有收益记录 (Controller需要的方法)
   */
  async getPositionPayouts(positionId: string): Promise<MockPayout[]> {
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

      return payouts.map(payout => FinanceMappingUtils.mapDatabasePayoutToMock({
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
    } catch (error: unknown) {
      this.logger.error(`Failed to get payouts for position ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * 根据ID查找收益记录 (Controller需要的方法)
   */
  async findPayoutById(payoutId: string): Promise<MockPayout | null> {
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

      return FinanceMappingUtils.mapDatabasePayoutToMock({
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
    } catch (error: unknown) {
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

      // 验证收益记录并计算总金额
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

      // 生成模拟交易哈希
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const claimTime = new Date();
      
      // 更新数据库中的收益记录
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
    } catch (error: unknown) {
      this.logger.error(`Failed to claim multiple payouts:`, error);
      return {
        success: false,
        totalAmount: 0,
        txHash: '',
        message: `领取失败: ${getErrorMessage(error)}`,
      };
    }
  }
}