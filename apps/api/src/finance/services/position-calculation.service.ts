import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { MultiLayerCacheService } from '../../cache/multi-layer-cache.service';
import { Decimal } from '@qa-app/database';

interface PayoutCalculation {
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  dailyRate: number;
  annualizedReturn: number;
}

interface PositionMetrics {
  totalPrincipal: number;
  totalEarnings: number;
  dailyEarnings: number;
  roi: number;
  daysActive: number;
  nextPayoutAmount: number;
  projectedTotalReturn: number;
}

@Injectable()
export class PositionCalculationService {
  private readonly logger = new Logger(PositionCalculationService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly cache: MultiLayerCacheService
  ) {}

  /**
   * 计算位置收益分配
   */
  async calculatePayout(positionId: string, periodStart: Date, periodEnd: Date): Promise<PayoutCalculation> {
    this.logger.debug(`🧮 Calculating payout for position ${positionId}`);

    // 获取持仓信息
    const position = await this.database.position.findUnique({
      where: { id: positionId },
      include: {
        product: true,
        user: {
          select: { id: true, email: true }
        }
      }
    });

    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }

    // 计算持仓期间
    const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // 计算收益率
    const annualRateBps = position.product.aprBps;
    const annualRate = annualRateBps / 10000; // 转换为小数
    const dailyRate = annualRate / 365;
    
    // 计算收益金额
    const principal = position.principal.toNumber();
    const periodRate = dailyRate * periodDays;
    const amount = principal * periodRate;

    // 考虑复利计算（如果启用）
    const compoundingEnabled = await this.isCompoundingEnabled(position.productId);
    let finalAmount = amount;
    
    if (compoundingEnabled) {
      // 复利计算：A = P(1 + r/n)^(nt)
      // 这里 n = 365 (每日复利), t = periodDays/365
      finalAmount = principal * (Math.pow(1 + dailyRate, periodDays) - 1);
    }

    this.logger.log(`💰 Payout calculated: ${finalAmount} USDT for position ${positionId} (${periodDays} days)`);

    return {
      amount: finalAmount,
      periodStart,
      periodEnd,
      dailyRate,
      annualizedReturn: annualRate * 100
    };
  }

  /**
   * 计算位置综合指标
   */
  async calculatePositionMetrics(positionId: string): Promise<PositionMetrics> {
    const cacheKey = `position:metrics:${positionId}`;
    
    const cachedResult = await this.cache.get<PositionMetrics>(cacheKey);
    if (cachedResult) return cachedResult;
    
    const result = await (async () => {
      const position = await this.database.position.findUnique({
        where: { id: positionId },
        include: {
          product: true,
          payouts: {
            where: { claimedAt: { not: null } },
            orderBy: { periodStart: 'desc' }
          }
        }
      });

      if (!position) {
        throw new Error(`Position ${positionId} not found`);
      }

      const totalPrincipal = position.principal.toNumber();
      const totalEarnings = position.payouts.reduce((sum, payout) => 
        sum + payout.amount.toNumber(), 0
      );

      // 计算活跃天数
      const now = new Date();
      const startTime = position.startDate.getTime();
      const daysActive = Math.floor((now.getTime() - startTime) / (1000 * 60 * 60 * 24));

      // 计算ROI
      const roi = totalPrincipal > 0 ? (totalEarnings / totalPrincipal) * 100 : 0;

      // 计算日均收益
      const dailyEarnings = daysActive > 0 ? totalEarnings / daysActive : 0;

      // 计算下次分红金额
      const nextPayoutAmount = await this.calculateNextPayoutAmount(position);

      // 预计总收益
      const remainingDays = Math.ceil((position.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const projectedTotalReturn = totalEarnings + (dailyEarnings * Math.max(0, remainingDays));

      return {
        totalPrincipal,
        totalEarnings,
        dailyEarnings,
        roi,
        daysActive,
        nextPayoutAmount,
        projectedTotalReturn
      };
    })();
    
    await this.cache.set(cacheKey, result, 300000); // 缓存5分钟
    return result;
  }

  /**
   * 批量计算多个位置的收益
   */
  async calculateBatchPayouts(positionIds: string[], periodStart: Date, periodEnd: Date): Promise<Map<string, PayoutCalculation>> {
    this.logger.log(`📊 Calculating batch payouts for ${positionIds.length} positions`);

    const results = new Map<string, PayoutCalculation>();
    const batchSize = 10; // 分批处理，避免数据库过载

    for (let i = 0; i < positionIds.length; i += batchSize) {
      const batch = positionIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(id => this.calculatePayout(id, periodStart, periodEnd))
      );

      batchResults.forEach((result, index) => {
        const positionId = batch[index];
        if (result.status === 'fulfilled') {
          results.set(positionId, result.value);
        } else {
          this.logger.error(`Failed to calculate payout for position ${positionId}:`, result.reason);
        }
      });
    }

    this.logger.log(`✅ Batch payout calculation completed: ${results.size}/${positionIds.length} successful`);
    return results;
  }

  /**
   * 计算用户总投资组合价值
   */
  async calculatePortfolioValue(userId: string): Promise<{
    totalPrincipal: number;
    totalCurrentValue: number;
    totalEarnings: number;
    activePositions: number;
    portfolioROI: number;
  }> {
    const cacheKey = `portfolio:${userId}`;
    
    const cachedResult = await this.cache.get<{
      totalPrincipal: number;
      totalCurrentValue: number;
      totalEarnings: number;
      activePositions: number;
      portfolioROI: number;
    }>(cacheKey);
    if (cachedResult) return cachedResult;
    
    const result = await (async () => {
      const [positions, payouts] = await Promise.all([
        this.database.position.findMany({
          where: { 
            userId,
            status: { in: ['ACTIVE', 'REDEEMING'] }
          },
          include: { product: true }
        }),
        this.database.payout.aggregate({
          where: {
            userId,
            claimedAt: { not: null }
          },
          _sum: { amount: true }
        })
      ]);

      const totalPrincipal = positions.reduce((sum, pos) => 
        sum + pos.principal.toNumber(), 0
      );

      const totalEarnings = payouts._sum.amount?.toNumber() || 0;
      const totalCurrentValue = totalPrincipal + totalEarnings;
      const portfolioROI = totalPrincipal > 0 ? (totalEarnings / totalPrincipal) * 100 : 0;

      return {
        totalPrincipal,
        totalCurrentValue,
        totalEarnings,
        activePositions: positions.length,
        portfolioROI
      };
    })();
    
    await this.cache.set(cacheKey, result, 600000); // 缓存10分钟
    return result;
  }

  /**
   * 预测收益计算
   */
  async predictFutureEarnings(positionId: string, days: number): Promise<{
    dailyEarnings: number;
    projectedEarnings: number;
    projectedTotal: number;
    confidenceLevel: number;
  }> {
    const position = await this.database.position.findUnique({
      where: { id: positionId },
      include: {
        product: true,
        payouts: {
          where: { claimedAt: { not: null } },
          orderBy: { periodStart: 'desc' },
          take: 30 // 最近30天的收益数据
        }
      }
    });

    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }

    // 基于产品APR计算理论收益
    const annualRate = position.product.aprBps / 10000;
    const dailyRate = annualRate / 365;
    const theoreticalDailyEarnings = position.principal.toNumber() * dailyRate;

    // 基于历史数据计算实际平均收益
    const actualDailyEarnings = position.payouts.length > 0 
      ? position.payouts.reduce((sum, p) => sum + p.amount.toNumber(), 0) / position.payouts.length
      : theoreticalDailyEarnings;

    // 使用加权平均 (70% 理论 + 30% 实际)
    const projectedDailyEarnings = (theoreticalDailyEarnings * 0.7) + (actualDailyEarnings * 0.3);

    // 计算置信度
    const dataPoints = position.payouts.length;
    const confidenceLevel = Math.min(95, 50 + (dataPoints * 1.5)); // 更多数据点 = 更高置信度

    return {
      dailyEarnings: projectedDailyEarnings,
      projectedEarnings: projectedDailyEarnings * days,
      projectedTotal: position.principal.toNumber() + (projectedDailyEarnings * days),
      confidenceLevel
    };
  }

  // 私有辅助方法
  private async calculateNextPayoutAmount(position: any): Promise<number> {
    if (!position.nextPayoutAt || position.status !== 'ACTIVE') {
      return 0;
    }

    const periodStart = position.nextPayoutAt;
    const periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000); // 下一天

    const payout = await this.calculatePayout(position.id, periodStart, periodEnd);
    return payout.amount;
  }

  private async isCompoundingEnabled(productId: string): Promise<boolean> {
    const config = await this.database.systemConfig.findUnique({
      where: { key: `product:${productId}:compounding` }
    });

    return (config?.value as any)?.enabled || false;
  }
}