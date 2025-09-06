import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Delete,
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import { MetricsService } from '../../common/metrics/metrics.service'
import { Auth } from '../../auth/decorators/auth.decorator'
import { MonitoringService, MonitoringQuery } from '../services/monitoring.service'
import { 
  GetMetricsDto,
  CreateAlertDto,
  ResolveAlertDto,
  ExportDataDto
} from '../dto'

@Controller('monitoring')
@Auth('ADMIN')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * 获取监控综合指标
   * 整合 logs + audit + alerts + performance
   */
  @Get('metrics')
  async getMetrics(@Query() query: GetMetricsDto) {
    const monitoringQuery: MonitoringQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      level: query.level,
      module: query.module,
      userId: query.userId,
      limit: query.limit,
      offset: query.offset
    }

    return this.monitoringService.getMetrics(monitoringQuery)
  }

  /**
   * 获取仪表板数据
   */
  @Get('dashboard')
  async getDashboard(@Query('timeRange') timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
    return this.monitoringService.getDashboardData(timeRange)
  }

  /**
   * 获取弃用端点统计（按命中次数降序）
   */
  @Get('deprecations')
  async getDeprecationStats() {
    return {
      timestamp: new Date(),
      items: this.metricsService.getDeprecationStats(),
    }
  }

  /**
   * 获取日志数据
   * 代理到原 logs 服务，返回弃用头
   */
  @Get('logs')
  async getLogs(
    @Query() query: GetMetricsDto,
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) res: Response
  ) {
    // 添加弃用警告头
    res.setHeader('Deprecation', 'true')
    res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0')
    
    // 记录弃用API调用
    this.monitoringService['logger'].warn('Deprecated API called', {
      endpoint: '/monitoring/logs',
      userAgent: headers['user-agent'],
      ip: headers['x-forwarded-for'] || 'unknown'
    })

    const monitoringQuery: MonitoringQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      level: query.level,
      module: query.module,
      limit: query.limit,
      offset: query.offset
    }

    return this.monitoringService.getLogs(monitoringQuery)
  }

  /**
   * 获取审计数据  
   * 代理到原 audit 服务，返回弃用头
   */
  @Get('audit')
  async getAuditLogs(
    @Query() query: GetMetricsDto,
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) res: Response
  ) {
    res.setHeader('Deprecation', 'true')
    res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0')
    
    this.monitoringService['logger'].warn('Deprecated API called', {
      endpoint: '/monitoring/audit',
      userAgent: headers['user-agent']
    })

    const monitoringQuery: MonitoringQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      userId: query.userId,
      limit: query.limit,
      offset: query.offset
    }

    return this.monitoringService.getAuditLogs(monitoringQuery)
  }

  /**
   * 获取告警数据
   * 代理到原 alerts 服务，返回弃用头
   */
  @Get('alerts')
  async getAlerts(
    @Query() query: GetMetricsDto,
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) res: Response
  ) {
    res.setHeader('Deprecation', 'true')
    res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0')
    
    this.monitoringService['logger'].warn('Deprecated API called', {
      endpoint: '/monitoring/alerts',
      userAgent: headers['user-agent']
    })

    const monitoringQuery: MonitoringQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset
    }

    return this.monitoringService.getAlerts(monitoringQuery)
  }

  /**
   * 获取性能数据
   * 代理到原 performance 服务，返回弃用头
   */
  @Get('performance')
  async getPerformanceData(
    @Query() query: GetMetricsDto,
    @Headers() headers: Record<string, string>,
    @Res({ passthrough: true }) res: Response
  ) {
    res.setHeader('Deprecation', 'true')
    res.setHeader('X-API-Deprecation-Info', 'Use /monitoring/metrics instead. This endpoint will be removed in v2.0')
    
    this.monitoringService['logger'].warn('Deprecated API called', {
      endpoint: '/monitoring/performance',
      userAgent: headers['user-agent']
    })

    const monitoringQuery: MonitoringQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset
    }

    return this.monitoringService.getPerformanceData(monitoringQuery)
  }

  /**
   * 创建告警
   */
  @Post('alerts')
  @HttpCode(HttpStatus.CREATED)
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    return this.monitoringService.createAlert(createAlertDto)
  }

  /**
   * 解决告警
   */
  @Patch('alerts/:id/resolve')
  async resolveAlert(
    @Param('id') id: string,
    @Body() resolveAlertDto: ResolveAlertDto
  ) {
    return this.monitoringService.resolveAlert(id, resolveAlertDto.resolution)
  }

  /**
   * 导出监控数据
   */
  @Post('export')
  async exportData(
    @Body() exportDto: ExportDataDto,
    @Res() res: Response
  ) {
    const monitoringQuery: MonitoringQuery = {
      startDate: exportDto.startDate ? new Date(exportDto.startDate) : undefined,
      endDate: exportDto.endDate ? new Date(exportDto.endDate) : undefined,
      level: exportDto.level,
      module: exportDto.module
    }

    const data = await this.monitoringService.exportData(monitoringQuery, exportDto.format)
    
    const filename = `monitoring_${new Date().toISOString().split('T')[0]}.${exportDto.format}`
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    if (exportDto.format === 'json') {
      res.setHeader('Content-Type', 'application/json')
    } else if (exportDto.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
    } else if (exportDto.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
    
    res.send(data)
  }

  /**
   * 健康检查端点
   */
  @Get('health')
  async healthCheck() {
    const systemStatus = await this.monitoringService['getSystemStatus']()
    
    return {
      status: systemStatus.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      issues: systemStatus.issues
    }
  }

  /**
   * 系统实时指标（SSE）
   */
  @Get('realtime')
  async getRealtimeMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 定期发送监控数据
    const interval = setInterval(async () => {
      try {
        const metrics = await this.monitoringService.getMetrics()
        res.write(`data: ${JSON.stringify(metrics)}\n\n`)
      } catch (error) {
        console.error('Failed to send realtime metrics:', error)
        res.write('data: {"error": "Failed to get metrics"}\n\n')
      }
    }, 5000) // 每5秒更新一次

    // 清理资源
    res.on('close', () => {
      clearInterval(interval)
    })

    res.on('error', () => {
      clearInterval(interval)
    })
  }

  /**
   * 获取性能优化报告
   */
  @Get('performance-optimization')
  async getPerformanceOptimizationReport() {
    return this.monitoringService.getPerformanceOptimizationReport()
  }

  /**
   * 获取查询优化统计
   */
  @Get('query-optimization')
  async getQueryOptimizationStats(@Query() query: GetMetricsDto) {
    return this.monitoringService.getQueryOptimizationStats({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset
    })
  }

  /**
   * 获取缓存性能统计
   */
  @Get('cache-performance')
  async getCachePerformanceStats() {
    return this.monitoringService.getCachePerformanceStats()
  }

  /**
   * 清理性能优化缓存
   */
  @Post('performance/clear-cache')
  @HttpCode(HttpStatus.OK)
  async clearPerformanceCache() {
    return this.monitoringService.clearPerformanceCache()
  }
}
