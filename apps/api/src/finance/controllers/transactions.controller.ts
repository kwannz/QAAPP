import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Res,
  BadRequestException
} from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { TransactionsService, TransactionQuery } from '../services/transactions.service'
import { 
  GetTransactionsDto,
  UpdateTransactionStatusDto,
  ProcessTransactionDto,
  ExportTransactionsDto
} from '../dto'

@Controller('finance/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * 获取统一交易记录
   * 新端点 - 整合 payouts + withdrawals
   */
  @Get()
  @Roles('ADMIN', 'AGENT')
  async getTransactions(@Query() query: GetTransactionsDto) {
    const transactionQuery: TransactionQuery = {
      userId: query.userId,
      type: query.type,
      status: query.status,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset
    }

    return this.transactionsService.findAll(transactionQuery)
  }

  /**
   * 获取单个交易详情
   */
  @Get(':id')
  @Roles('ADMIN', 'AGENT')
  async getTransaction(@Param('id') id: string) {
    return this.transactionsService.findOne(id)
  }

  /**
   * 更新交易状态
   */
  @Patch(':id/status')
  @Roles('ADMIN')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionStatusDto
  ) {
    return this.transactionsService.updateStatus(
      id, 
      updateDto.status, 
      updateDto.metadata
    )
  }

  /**
   * 处理交易（批准/拒绝/完成）
   */
  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async processTransaction(
    @Param('id') id: string,
    @Body() processDto: ProcessTransactionDto
  ) {
    return this.transactionsService.processTransaction(
      id, 
      processDto.action, 
      processDto.reason
    )
  }

  /**
   * 批量更新交易状态
   */
  @Patch('bulk/status')
  @Roles('ADMIN')
  async bulkUpdateStatus(@Body() body: {
    ids: string[]
    status: string
    metadata?: any
  }) {
    if (!body.ids || body.ids.length === 0) {
      throw new BadRequestException('IDs array is required')
    }

    return this.transactionsService.bulkUpdateStatus(
      body.ids, 
      body.status, 
      body.metadata
    )
  }

  /**
   * 获取交易统计
   */
  @Get('stats/overview')
  @Roles('ADMIN', 'AGENT')
  async getStatistics(@Query() query: GetTransactionsDto) {
    const transactionQuery: TransactionQuery = {
      userId: query.userId,
      type: query.type,
      status: query.status,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined
    }

    return this.transactionsService.getStatistics(transactionQuery)
  }

  /**
   * 获取交易概览（仪表板用）
   */
  @Get('overview/:timeRange')
  @Roles('ADMIN', 'AGENT')
  async getOverview(@Param('timeRange') timeRange: '24h' | '7d' | '30d') {
    return this.transactionsService.getOverview(timeRange)
  }

  /**
   * 导出交易数据
   */
  @Post('export')
  @Roles('ADMIN')
  async exportTransactions(
    @Body() exportDto: ExportTransactionsDto,
    @Res() res: Response
  ) {
    const transactionQuery: TransactionQuery = {
      userId: exportDto.userId,
      type: exportDto.type,
      status: exportDto.status,
      startDate: exportDto.startDate ? new Date(exportDto.startDate) : undefined,
      endDate: exportDto.endDate ? new Date(exportDto.endDate) : undefined
    }

    const data = await this.transactionsService.exportTransactions(transactionQuery, exportDto.format)
    
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `transactions_${timestamp}.${exportDto.format}`
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    if (exportDto.format === 'json') {
      res.setHeader('Content-Type', 'application/json')
    } else if (exportDto.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      // 添加BOM以支持中文Excel打开
      res.write('\ufeff')
    } else if (exportDto.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
    
    res.send(data)
  }
}

/**
 * 兼容性控制器 - 处理旧的 payouts 和 withdrawals 路由
 * 提供代理功能并返回弃用警告
 */
@Controller()
export class LegacyTransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * 代理旧的 payouts 路由
   */
  @Get('payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getLegacyPayouts(
    @Query() query: any,
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) res: Response
  ) {
    // 添加弃用警告
    res.setHeader('Deprecation', 'true')
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=PAYOUT instead. This endpoint will be removed in v2.0')
    res.setHeader('X-Migration-Guide', 'https://docs.qa-app.com/api/migration/payouts')
    
    // 记录弃用调用
    console.warn('Deprecated API called: /payouts', {
      userAgent: headers['user-agent'],
      ip: headers['x-forwarded-for'] || 'unknown',
      timestamp: new Date().toISOString()
    })

    // 转换查询参数并代理到新服务
    const transactionQuery: TransactionQuery = {
      ...query,
      type: 'PAYOUT',
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined
    }

    const result = await this.transactionsService.findAll(transactionQuery)
    
    // 转换为旧格式以保持兼容性
    return {
      data: result.data.filter(tx => tx.type === 'PAYOUT').map(tx => ({
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.userEmail,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        commissionId: tx.metadata?.commissionId,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        completedAt: tx.completedAt
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    }
  }

  /**
   * 代理旧的 withdrawals 路由
   */
  @Get('withdrawals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getLegacyWithdrawals(
    @Query() query: any,
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) res: Response
  ) {
    // 添加弃用警告
    res.setHeader('Deprecation', 'true')
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=WITHDRAWAL instead. This endpoint will be removed in v2.0')
    res.setHeader('X-Migration-Guide', 'https://docs.qa-app.com/api/migration/withdrawals')
    
    // 记录弃用调用
    console.warn('Deprecated API called: /withdrawals', {
      userAgent: headers['user-agent'],
      ip: headers['x-forwarded-for'] || 'unknown',
      timestamp: new Date().toISOString()
    })

    // 转换查询参数并代理到新服务
    const transactionQuery: TransactionQuery = {
      ...query,
      type: 'WITHDRAWAL',
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined
    }

    const result = await this.transactionsService.findAll(transactionQuery)
    
    // 转换为旧格式以保持兼容性
    return {
      data: result.data.filter(tx => tx.type === 'WITHDRAWAL').map(tx => ({
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.userEmail,
        amount: tx.amount,
        currency: tx.currency,
        method: tx.method,
        status: tx.status,
        bankAccount: tx.metadata?.bankAccount,
        alipayAccount: tx.metadata?.alipayAccount,
        walletAddress: tx.metadata?.walletAddress,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        completedAt: tx.completedAt,
        rejectReason: tx.failureReason
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    }
  }
}