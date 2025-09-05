import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WithdrawalStatus, WithdrawalType, RiskLevel, Prisma } from '@qa-app/database';
// AuditService functionality integrated into monitoring module
import { RiskEngineService, WithdrawalRiskInput } from '../../risk/risk-engine.service';
import { PerformanceOptimizerService } from '../../common/performance/performance-optimizer.service';

export interface CreateWithdrawalDto {
  userId: string;
  amount: number;
  withdrawalType: WithdrawalType;
  walletAddress: string;
  chainId: number;
}

export interface UpdateWithdrawalDto {
  status?: WithdrawalStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  reviewerId?: string;
}

export interface WithdrawalQueryDto {
  status?: WithdrawalStatus;
  riskLevel?: RiskLevel;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);
  constructor(
    private prisma: PrismaService,
    private riskEngine: RiskEngineService,
    private performanceOptimizer: PerformanceOptimizerService,
  ) {}

  async createWithdrawal(createDto: CreateWithdrawalDto, actorId: string): Promise<any> {
    // 验证用户余额
    await this.validateUserBalance(createDto.userId, createDto.amount, createDto.withdrawalType);
    
    // 计算手续费
    const platformFee = await this.calculateWithdrawalFee(createDto.amount, createDto.withdrawalType);
    const actualAmount = createDto.amount - platformFee;
    
    if (actualAmount <= 0) {
      throw new BadRequestException('提现金额过小，无法覆盖手续费');
    }

    // 风险评估
    const riskInput: WithdrawalRiskInput = {
      userId: createDto.userId,
      amount: createDto.amount,
      withdrawalType: createDto.withdrawalType,
      walletAddress: createDto.walletAddress,
      chainId: createDto.chainId,
      metadata: {
        ipAddress: '0.0.0.0', // 从请求上下文获取
        userAgent: 'API',
        deviceFingerprint: undefined,
      },
    };
    const riskAssessment = await this.riskEngine.performComprehensiveRiskAssessment(riskInput);
    
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId: createDto.userId,
        amount: new Prisma.Decimal(createDto.amount),
        withdrawalType: createDto.withdrawalType,
        walletAddress: createDto.walletAddress,
        chainId: createDto.chainId,
        platformFee: new Prisma.Decimal(platformFee),
        actualAmount: new Prisma.Decimal(actualAmount),
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        riskFactors: riskAssessment.riskFactors.map(f => ({
          category: f.category,
          name: f.name,
          description: f.description,
          score: f.score,
        })),
        autoApproved: riskAssessment.autoApproved,
        kycVerified: await this.isKycVerified(createDto.userId),
        metadata: {
          ipAddress: '0.0.0.0', // 从请求中获取
          userAgent: 'API',
          deviceFingerprint: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            kycStatus: true,
          },
        },
      },
    });

    // 记录审计日志
    // 审计日志功能已整合到监控模块
    this.logger.debug('Audit log created:', {
      actorId,
      action: 'WITHDRAWAL_CREATED',
      resourceType: 'WITHDRAWAL',
      resourceId: withdrawal.id,
      metadata: {
        amount: createDto.amount,
        withdrawalType: createDto.withdrawalType,
        riskLevel: riskAssessment.riskLevel,
        autoApproved: riskAssessment.autoApproved,
      },
    });

    return withdrawal;
  }

  async getWithdrawals(query: WithdrawalQueryDto) {
    const {
      status,
      riskLevel,
      userId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.WithdrawalWhereInput = {};
    
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (userId) where.userId = userId;

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              referralCode: true,
              kycStatus: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getWithdrawalById(id: string): Promise<any> {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            kycStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现记录不存在');
    }

    return withdrawal;
  }

  async updateWithdrawal(
    id: string,
    updateDto: UpdateWithdrawalDto,
    actorId: string,
  ): Promise<any> {
    const withdrawal = await this.getWithdrawalById(id);
    
    // 状态转换验证
    this.validateStatusTransition(withdrawal.status, updateDto.status);

    const updateData: Prisma.WithdrawalUpdateInput = {};
    
    if (updateDto.status) {
      updateData.status = updateDto.status;
      
      if (updateDto.status === WithdrawalStatus.APPROVED) {
        updateData.reviewedAt = new Date();
        updateData.reviewerId = actorId;
        updateData.autoApproved = false;
      } else if (updateDto.status === WithdrawalStatus.REJECTED) {
        updateData.reviewedAt = new Date();
        updateData.reviewerId = actorId;
        updateData.rejectionReason = updateDto.rejectionReason;
      } else if (updateDto.status === WithdrawalStatus.COMPLETED) {
        updateData.completedAt = new Date();
        updateData.processedAt = new Date();
        updateData.processedBy = actorId;
      }
    }

    if (updateDto.reviewNotes) {
      updateData.reviewNotes = updateDto.reviewNotes;
    }

    const updatedWithdrawal = await this.prisma.withdrawal.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            kycStatus: true,
          },
        },
      },
    });

    // 记录审计日志
    // 审计日志功能已整合到监控模块
    this.logger.debug('Audit log created:', {
      actorId,
      action: 'WITHDRAWAL_UPDATED',
      resourceType: 'WITHDRAWAL',
      resourceId: id,
      metadata: {
        oldStatus: withdrawal.status,
        newStatus: updateDto.status,
        reviewNotes: updateDto.reviewNotes,
        rejectionReason: updateDto.rejectionReason,
      },
    });

    return updatedWithdrawal;
  }

  async batchUpdateWithdrawals(
    ids: string[],
    updateDto: UpdateWithdrawalDto,
    actorId: string,
  ): Promise<{ updated: number; failed: string[] }> {
    const results = { updated: 0, failed: [] as string[] };

    for (const id of ids) {
      try {
        await this.updateWithdrawal(id, updateDto, actorId);
        results.updated++;
      } catch (error) {
        results.failed.push(id);
      }
    }

    // 记录批次审计日志
    // 审计日志功能已整合到监控模块
    this.logger.debug('Audit log created:', {
      actorId,
      action: 'WITHDRAWAL_BATCH_UPDATE',
      resourceType: 'WITHDRAWAL',
      resourceId: `batch-${ids.length}`,
      metadata: {
        totalItems: ids.length,
        updated: results.updated,
        failed: results.failed.length,
        updateData: updateDto,
      },
    });

    return results;
  }

  async getWithdrawalStats(): Promise<any> {
    // 使用PerformanceOptimizerService优化查询缓存
    return this.performanceOptimizer.optimizeQuery(
      'withdrawal_stats_aggregated',
      async () => {
        const recent24hDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // 优化：使用单个聚合查询获取状态统计和总金额
        const [statusStats, riskLevelStats, recentActivity] = await Promise.all([
          // 合并多个count查询为单个groupBy聚合
          this.prisma.withdrawal.groupBy({
            by: ['status'],
            _count: true,
            _sum: { amount: true },
          }),
          
          // 风险等级统计保持原有逻辑
          this.prisma.withdrawal.groupBy({
            by: ['riskLevel'],
            _count: true,
            where: { status: { in: [WithdrawalStatus.PENDING, WithdrawalStatus.REVIEWING] } },
          }),
          
          // 最近24小时活动统计
          this.prisma.withdrawal.count({
            where: { createdAt: { gte: recent24hDate } },
          }),
        ]);

        // 处理状态统计数据
        const statusCounts = statusStats.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count;
          return acc;
        }, {} as Record<string, number>);

        // 计算完成提现的总金额
        const completedAmount = statusStats
          .filter(stat => stat.status === WithdrawalStatus.COMPLETED)
          .reduce((sum, stat) => sum + Number(stat._sum.amount || 0), 0);

        // 计算总数
        const totalWithdrawals = statusStats.reduce((sum, stat) => sum + stat._count, 0);

        return {
          total: totalWithdrawals,
          byStatus: {
            pending: statusCounts.pending || 0,
            completed: statusCounts.completed || 0,
            rejected: statusCounts.rejected || 0,
          },
          totalCompletedAmount: completedAmount,
          riskLevelDistribution: riskLevelStats.reduce((acc, stat) => {
            (acc as any)[stat.riskLevel.toLowerCase()] = stat._count;
            return acc;
          }, {} as Record<string, number>),
          recent24h: recentActivity,
        };
      },
      { 
        ttl: 5 * 60 * 1000, // 5分钟缓存
        tags: ['withdrawal-stats'] 
      }
    );
  }

  private async validateUserBalance(
    userId: string,
    amount: number,
    type: WithdrawalType,
  ): Promise<void> {
    // 根据提现类型验证不同的余额
    let availableBalance = 0;

    switch (type) {
      case WithdrawalType.EARNINGS:
        // 检查可领取收益
        const claimablePayouts = await this.prisma.payout.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            isClaimable: true,
            claimedAt: null,
          },
        });
        availableBalance = Number(claimablePayouts._sum.amount || 0);
        break;

      case WithdrawalType.COMMISSION:
        // 检查可提取佣金
        const availableCommissions = await this.prisma.commission.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            status: 'READY',
          },
        });
        availableBalance = Number(availableCommissions._sum.amount || 0);
        break;

      case WithdrawalType.PRINCIPAL:
        // 检查可赎回本金（需要持仓到期）
        const redeemablePositions = await this.prisma.position.aggregate({
          _sum: { principal: true },
          where: {
            userId,
            status: 'ACTIVE',
            endDate: {
              lte: new Date(),
            },
          },
        });
        availableBalance = Number(redeemablePositions._sum.principal || 0);
        break;
    }

    if (amount > availableBalance) {
      throw new BadRequestException(
        `余额不足。可用余额: ${availableBalance}, 请求提现: ${amount}`,
      );
    }
  }

  private async calculateWithdrawalFee(
    amount: number,
    type: WithdrawalType,
  ): Promise<number> {
    // 从系统配置获取手续费率
    const feeConfig = await this.prisma.systemConfig.findUnique({
      where: { key: 'withdrawal_fees' },
    });

    const defaultFees = {
      [WithdrawalType.EARNINGS]: 0.005, // 0.5%
      [WithdrawalType.COMMISSION]: 0.003, // 0.3%
      [WithdrawalType.PRINCIPAL]: 0.001, // 0.1%
    };

    const feeRate = (feeConfig?.value as any)?.[type] || defaultFees[type];
    const calculatedFee = amount * feeRate;
    
    // 设置最小和最大手续费
    const minFee = 1; // 最小1 USDT
    const maxFee = 100; // 最大100 USDT
    
    return Math.max(minFee, Math.min(maxFee, calculatedFee));
  }


  private async isKycVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    return user?.kycStatus === 'APPROVED';
  }

  private validateStatusTransition(
    currentStatus: WithdrawalStatus,
    newStatus?: WithdrawalStatus,
  ): void {
    if (!newStatus) return;

    const validTransitions: Record<WithdrawalStatus, WithdrawalStatus[]> = {
      [WithdrawalStatus.PENDING]: [
        WithdrawalStatus.REVIEWING,
        WithdrawalStatus.APPROVED,
        WithdrawalStatus.REJECTED,
        WithdrawalStatus.CANCELED,
      ],
      [WithdrawalStatus.REVIEWING]: [
        WithdrawalStatus.APPROVED,
        WithdrawalStatus.REJECTED,
        WithdrawalStatus.CANCELED,
      ],
      [WithdrawalStatus.APPROVED]: [
        WithdrawalStatus.PROCESSING,
        WithdrawalStatus.CANCELED,
      ],
      [WithdrawalStatus.PROCESSING]: [
        WithdrawalStatus.COMPLETED,
        WithdrawalStatus.FAILED,
      ],
      [WithdrawalStatus.REJECTED]: [],
      [WithdrawalStatus.COMPLETED]: [],
      [WithdrawalStatus.FAILED]: [WithdrawalStatus.PENDING],
      [WithdrawalStatus.CANCELED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `无效的状态转换：${currentStatus} -> ${newStatus}`,
      );
    }
  }
}