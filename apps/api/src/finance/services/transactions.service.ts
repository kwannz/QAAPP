import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '../../database/database.service'

export interface TransactionQuery {
  userId?: string
  type?: 'PAYOUT' | 'WITHDRAWAL' | 'ALL'
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface UnifiedTransaction {
  id: string
  type: 'PAYOUT' | 'WITHDRAWAL'
  userId: string
  userEmail: string
  amount: number
  currency: string
  method: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  metadata?: any
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  failureReason?: string
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name)

  constructor(
    private configService: ConfigService,
    private database: DatabaseService
  ) {}

  /**
   * 获取统一的交易记录
   * Phase 1: 基础实现，提供接口标准
   */
  async findAll(query: TransactionQuery = {}): Promise<{
    data: UnifiedTransaction[]
    total: number
    page: number
    pageSize: number
  }> {
    try {
      const limit = query.limit || 50
      const offset = query.offset || 0
      
      // 构建查询条件
      const where: any = {}
      
      if (query.userId) {
        where.userId = query.userId
      }
      
      if (query.startDate || query.endDate) {
        where.createdAt = {}
        if (query.startDate) {
          where.createdAt.gte = query.startDate
        }
        if (query.endDate) {
          where.createdAt.lte = query.endDate
        }
      }

      // 构建状态筛选
      const statusFilter: any = {}
      if (query.status) {
        statusFilter.status = query.status
      }

      // 查询 payouts（收益记录作为 PAYOUT 交易）
      const payoutsQuery = query.type === 'WITHDRAWAL' ? [] : this.database.payout.findMany({
        where: {
          ...where,
          ...(query.status && query.status !== 'PENDING' ? { claimedAt: query.status === 'COMPLETED' ? { not: null } : null } : {})
        },
        include: {
          user: {
            select: { id: true, email: true }
          },
          position: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: query.type === 'PAYOUT' ? limit : undefined,
        skip: query.type === 'PAYOUT' ? offset : undefined
      })

      // 查询 withdrawals（提现记录作为 WITHDRAWAL 交易）
      const withdrawalsQuery = query.type === 'PAYOUT' ? [] : this.database.withdrawal.findMany({
        where: {
          ...where,
          ...(query.status && {
            status: query.status === 'COMPLETED' ? 'COMPLETED' : 
                   query.status === 'PENDING' ? 'PENDING' : 
                   query.status === 'PROCESSING' ? 'PROCESSING' : 
                   query.status === 'FAILED' ? 'FAILED' : undefined
          })
        },
        include: {
          user: {
            select: { id: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: query.type === 'WITHDRAWAL' ? limit : undefined,
        skip: query.type === 'WITHDRAWAL' ? offset : undefined
      })

      // 计算总数
      const payoutCountQuery = query.type === 'WITHDRAWAL' ? 0 : this.database.payout.count({
        where: {
          ...where,
          ...(query.status && query.status !== 'PENDING' ? { claimedAt: query.status === 'COMPLETED' ? { not: null } : null } : {})
        }
      })

      const withdrawalCountQuery = query.type === 'PAYOUT' ? 0 : this.database.withdrawal.count({
        where: {
          ...where,
          ...(query.status && {
            status: query.status === 'COMPLETED' ? 'COMPLETED' : 
                   query.status === 'PENDING' ? 'PENDING' : 
                   query.status === 'PROCESSING' ? 'PROCESSING' : 
                   query.status === 'FAILED' ? 'FAILED' : undefined
          })
        }
      })

      // 并行执行查询
      const [payouts, withdrawals, payoutCount, withdrawalCount] = await Promise.all([
        payoutsQuery,
        withdrawalsQuery,
        payoutCountQuery,
        withdrawalCountQuery
      ])

      // 转换 payouts 为统一格式
      const payoutTransactions: UnifiedTransaction[] = Array.isArray(payouts) ? payouts.map(payout => ({
        id: payout.id,
        type: 'PAYOUT' as const,
        userId: payout.userId,
        userEmail: payout.user.email || 'N/A',
        amount: Number(payout.amount),
        currency: 'USDT',
        method: 'SYSTEM',
        status: payout.claimedAt ? 'COMPLETED' as const : 'PENDING' as const,
        metadata: {
          positionId: payout.positionId,
          periodStart: payout.periodStart,
          periodEnd: payout.periodEnd,
          claimTxHash: payout.claimTxHash,
          originalType: 'PAYOUT'
        },
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
        completedAt: payout.claimedAt,
        failureReason: undefined
      })) : []

      // 转换 withdrawals 为统一格式
      const withdrawalTransactions: UnifiedTransaction[] = Array.isArray(withdrawals) ? withdrawals.map(withdrawal => ({
        id: withdrawal.id,
        type: 'WITHDRAWAL' as const,
        userId: withdrawal.userId,
        userEmail: withdrawal.user.email || 'N/A',
        amount: Number(withdrawal.amount),
        currency: 'USDT',
        method: this.getWithdrawalMethod(withdrawal.chainId),
        status: this.mapWithdrawalStatus(withdrawal.status),
        metadata: {
          walletAddress: withdrawal.walletAddress,
          chainId: withdrawal.chainId,
          platformFee: withdrawal.platformFee,
          actualAmount: withdrawal.actualAmount,
          txHash: withdrawal.txHash,
          riskScore: withdrawal.riskScore,
          originalType: 'WITHDRAWAL'
        },
        createdAt: withdrawal.createdAt,
        updatedAt: withdrawal.updatedAt,
        completedAt: withdrawal.completedAt,
        failureReason: withdrawal.rejectionReason
      })) : []

      // 合并和排序数据
      let allTransactions = [...payoutTransactions, ...withdrawalTransactions]
      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // 应用分页（如果是查询所有类型）
      let paginatedData = allTransactions
      let total = (typeof payoutCount === 'number' ? payoutCount : 0) + (typeof withdrawalCount === 'number' ? withdrawalCount : 0)
      
      if (query.type === 'ALL' || !query.type) {
        paginatedData = allTransactions.slice(offset, offset + limit)
      }

      return {
        data: paginatedData,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      }
    } catch (error) {
      this.logger.error('Failed to get transactions', error)
      throw error
    }
  }

  /**
   * 获取单个交易记录
   */
  async findOne(id: string): Promise<UnifiedTransaction> {
    try {
      // 尝试查找 payout 记录
      const payout = await this.database.payout.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true } },
          position: { select: { id: true } }
        }
      })
      
      if (payout) {
        return {
          id: payout.id,
          type: 'PAYOUT',
          userId: payout.userId,
          userEmail: payout.user.email || 'N/A',
          amount: Number(payout.amount),
          currency: 'USDT',
          method: 'SYSTEM',
          status: payout.claimedAt ? 'COMPLETED' : 'PENDING',
          metadata: {
            positionId: payout.positionId,
            periodStart: payout.periodStart,
            periodEnd: payout.periodEnd,
            claimTxHash: payout.claimTxHash,
            originalType: 'PAYOUT'
          },
          createdAt: payout.createdAt,
          updatedAt: payout.updatedAt,
          completedAt: payout.claimedAt,
          failureReason: undefined
        }
      }
      
      // 尝试查找 withdrawal 记录
      const withdrawal = await this.database.withdrawal.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true } }
        }
      })
      
      if (withdrawal) {
        return {
          id: withdrawal.id,
          type: 'WITHDRAWAL',
          userId: withdrawal.userId,
          userEmail: withdrawal.user.email || 'N/A',
          amount: Number(withdrawal.amount),
          currency: 'USDT',
          method: this.getWithdrawalMethod(withdrawal.chainId),
          status: this.mapWithdrawalStatus(withdrawal.status),
          metadata: {
            walletAddress: withdrawal.walletAddress,
            chainId: withdrawal.chainId,
            platformFee: withdrawal.platformFee,
            actualAmount: withdrawal.actualAmount,
            txHash: withdrawal.txHash,
            riskScore: withdrawal.riskScore,
            originalType: 'WITHDRAWAL'
          },
          createdAt: withdrawal.createdAt,
          updatedAt: withdrawal.updatedAt,
          completedAt: withdrawal.completedAt,
          failureReason: withdrawal.rejectionReason
        }
      }
      
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.logger.error('Failed to get transaction', error)
      throw error
    }
  }

  /**
   * 更新交易状态
   */
  async updateStatus(id: string, status: string, metadata?: any): Promise<UnifiedTransaction> {
    try {
      // 尝试更新 payout 记录
      const payout = await this.database.payout.findUnique({ where: { id } })
      if (payout) {
        const updatedPayout = await this.database.payout.update({
          where: { id },
          data: {
            ...(status === 'COMPLETED' && { claimedAt: new Date() }),
            updatedAt: new Date()
          },
          include: {
            user: { select: { id: true, email: true } },
            position: { select: { id: true } }
          }
        })
        
        this.logger.log(`Payout transaction ${id} status updated to ${status}`)
        
        return {
          id: updatedPayout.id,
          type: 'PAYOUT',
          userId: updatedPayout.userId,
          userEmail: updatedPayout.user.email || 'N/A',
          amount: Number(updatedPayout.amount),
          currency: 'USDT',
          method: 'SYSTEM',
          status: updatedPayout.claimedAt ? 'COMPLETED' : 'PENDING',
          metadata: {
            ...updatedPayout.metadata,
            ...metadata,
            positionId: updatedPayout.positionId,
            originalType: 'PAYOUT'
          },
          createdAt: updatedPayout.createdAt,
          updatedAt: updatedPayout.updatedAt,
          completedAt: updatedPayout.claimedAt,
          failureReason: undefined
        }
      }
      
      // 尝试更新 withdrawal 记录
      const withdrawal = await this.database.withdrawal.findUnique({ where: { id } })
      if (withdrawal) {
        const mappedStatus = this.mapStatusToWithdrawal(status)
        const updatedWithdrawal = await this.database.withdrawal.update({
          where: { id },
          data: {
            status: mappedStatus,
            ...(status === 'COMPLETED' && { completedAt: new Date() }),
            ...(status === 'FAILED' && metadata?.failureReason && { rejectionReason: metadata.failureReason }),
            updatedAt: new Date()
          },
          include: {
            user: { select: { id: true, email: true } }
          }
        })
        
        this.logger.log(`Withdrawal transaction ${id} status updated to ${status}`)
        
        return {
          id: updatedWithdrawal.id,
          type: 'WITHDRAWAL',
          userId: updatedWithdrawal.userId,
          userEmail: updatedWithdrawal.user.email || 'N/A',
          amount: Number(updatedWithdrawal.amount),
          currency: 'USDT',
          method: this.getWithdrawalMethod(updatedWithdrawal.chainId),
          status: this.mapWithdrawalStatus(updatedWithdrawal.status),
          metadata: {
            ...updatedWithdrawal.metadata,
            ...metadata,
            walletAddress: updatedWithdrawal.walletAddress,
            originalType: 'WITHDRAWAL'
          },
          createdAt: updatedWithdrawal.createdAt,
          updatedAt: updatedWithdrawal.updatedAt,
          completedAt: updatedWithdrawal.completedAt,
          failureReason: updatedWithdrawal.rejectionReason
        }
      }
      
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    } catch (error) {
      this.logger.error('Failed to update transaction status', error)
      throw error
    }
  }

  /**
   * 批量更新交易状态
   */
  async bulkUpdateStatus(
    ids: string[], 
    status: string, 
    metadata?: any
  ): Promise<UnifiedTransaction[]> {
    try {
      const updatePromises = ids.map(id => this.updateStatus(id, status, metadata))
      const results = await Promise.allSettled(updatePromises)
      
      const successful: UnifiedTransaction[] = []
      const failed: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push(ids[index])
          this.logger.error(`Failed to update transaction ${ids[index]}:`, result.reason)
        }
      })

      if (failed.length > 0) {
        this.logger.warn(`Bulk update partially failed for IDs: ${failed.join(', ')}`)
      }

      return successful
    } catch (error) {
      this.logger.error('Failed to bulk update transactions', error)
      throw error
    }
  }

  /**
   * 处理交易（批准、拒绝等）
   */
  async processTransaction(
    id: string, 
    action: 'APPROVE' | 'REJECT' | 'PROCESS',
    reason?: string
  ): Promise<UnifiedTransaction> {
    try {
      let newStatus: string
      switch (action) {
        case 'APPROVE':
          newStatus = 'PROCESSING'
          break
        case 'REJECT':
          newStatus = 'FAILED'
          break
        case 'PROCESS':
          newStatus = 'COMPLETED'
          break
        default:
          throw new BadRequestException(`Invalid action: ${action}`)
      }

      return this.updateStatus(id, newStatus, { action, reason, processedAt: new Date() })
    } catch (error) {
      this.logger.error('Failed to process transaction', error)
      throw error
    }
  }

  /**
   * 获取交易统计
   */
  async getStatistics(query: TransactionQuery = {}) {
    try {
      const { data: transactions } = await this.findAll({ ...query, limit: 10000 })
      
      const stats = {
        totalCount: transactions.length,
        totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        avgAmount: 0,
        recentTrend: [] as Array<{ date: string; count: number; amount: number }>
      }

      // 统计状态分布
      transactions.forEach(tx => {
        stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1
        stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1
      })

      // 计算平均金额
      stats.avgAmount = stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0

      return stats
    } catch (error) {
      this.logger.error('Failed to get transaction statistics', error)
      throw error
    }
  }

  /**
   * 导出交易数据
   */
  async exportTransactions(
    query: TransactionQuery = {},
    format: 'csv' | 'excel' | 'json' = 'csv'
  ): Promise<string | Buffer> {
    try {
      const { data: transactions } = await this.findAll({ ...query, limit: 10000 })
      
      switch (format) {
        case 'csv':
          return this.generateCSV(transactions)
        case 'json':
          return JSON.stringify(transactions, null, 2)
        case 'excel':
          return Buffer.from('Excel placeholder')
        default:
          throw new BadRequestException(`Unsupported format: ${format}`)
      }
    } catch (error) {
      this.logger.error('Failed to export transactions', error)
      throw error
    }
  }

  /**
   * 获取交易概览
   */
  async getOverview(timeRange: '24h' | '7d' | '30d' = '24h') {
    const endDate = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
    }

    const stats = await this.getStatistics({ startDate, endDate })

    return {
      overall: stats,
      timeRange,
      lastUpdated: new Date()
    }
  }

  /**
   * 映射提现状态到统一交易状态
   */
  private mapWithdrawalStatus(status: string): UnifiedTransaction['status'] {
    switch (status) {
      case 'COMPLETED':
        return 'COMPLETED'
      case 'PENDING':
      case 'REVIEWING':
      case 'APPROVED':
        return 'PENDING'
      case 'PROCESSING':
        return 'PROCESSING'
      case 'FAILED':
      case 'REJECTED':
      case 'CANCELED':
        return 'FAILED'
      default:
        return 'PENDING'
    }
  }

  /**
   * 映射统一状态到提现状态
   */
  private mapStatusToWithdrawal(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'COMPLETED'
      case 'PENDING':
        return 'PENDING'
      case 'PROCESSING':
        return 'PROCESSING'
      case 'FAILED':
        return 'FAILED'
      default:
        return 'PENDING'
    }
  }

  /**
   * 根据链ID获取提现方法
   */
  private getWithdrawalMethod(chainId: number): string {
    switch (chainId) {
      case 1: // Ethereum
        return 'ETHEREUM'
      case 56: // BSC
        return 'BSC'
      case 137: // Polygon
        return 'POLYGON'
      case 42161: // Arbitrum
        return 'ARBITRUM'
      default:
        return 'CRYPTO'
    }
  }

  /**
   * 生成CSV格式数据
   */
  private generateCSV(transactions: UnifiedTransaction[]): string {
    const headers = ['ID', '类型', '用户邮箱', '金额', '币种', '方式', '状态', '创建时间', '完成时间']
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.id,
        tx.type,
        tx.userEmail,
        tx.amount,
        tx.currency,
        tx.method,
        tx.status,
        tx.createdAt.toISOString(),
        tx.completedAt?.toISOString() || ''
      ].join(','))
    ].join('\n')

    return csvContent
  }
}