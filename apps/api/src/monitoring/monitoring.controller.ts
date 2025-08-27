import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Query, 
  Body,
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  MonitoringService, 
  SystemStatus, 
  SystemMetric, 
  HealthCheck, 
  Alert 
} from './monitoring.service';

class AcknowledgeAlertDto {
  acknowledgedBy: string;
}

class SystemStatusDto {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheck[];
  metrics: SystemMetric[];
  activeAlerts: Alert[];
  uptime: number;
  version: string;
  lastUpdated: Date;
}

class MetricsQueryDto {
  metric?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  limit?: number;
}

@ApiTags('System Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private monitoringService: MonitoringService,
  ) {}

  @ApiOperation({ summary: '获取系统整体状态' })
  @ApiResponse({ 
    status: 200, 
    description: '系统状态获取成功',
    type: SystemStatusDto
  })
  @Get('status')
  async getSystemStatus(): Promise<SystemStatus> {
    return await this.monitoringService.getSystemStatus();
  }

  @ApiOperation({ summary: '获取系统健康检查结果' })
  @ApiResponse({ 
    status: 200, 
    description: '健康检查结果获取成功'
  })
  @Get('health')
  async getHealthChecks(): Promise<{
    overall: 'healthy' | 'unhealthy' | 'degraded';
    services: HealthCheck[];
    timestamp: Date;
  }> {
    const status = await this.monitoringService.getSystemStatus();
    return {
      overall: status.overall,
      services: status.services,
      timestamp: new Date(),
    };
  }

  @ApiOperation({ summary: '获取系统指标数据' })
  @ApiResponse({ 
    status: 200, 
    description: '指标数据获取成功'
  })
  @ApiQuery({ name: 'metric', required: false, description: '指标名称' })
  @ApiQuery({ name: 'limit', required: false, description: '数据点限制', example: 50 })
  @Get('metrics')
  async getMetrics(
    @Query('metric') metricName?: string,
    @Query('limit') limit: string = '50'
  ): Promise<{
    metrics: SystemMetric[] | Record<string, SystemMetric[]>;
    timestamp: Date;
  }> {
    const limitNum = parseInt(limit, 10) || 50;
    
    if (metricName) {
      const metricHistory = await this.monitoringService.getMetricHistory(metricName, limitNum);
      return {
        metrics: metricHistory,
        timestamp: new Date(),
      };
    }
    
    // 返回所有指标的最新数据
    const status = await this.monitoringService.getSystemStatus();
    return {
      metrics: status.metrics,
      timestamp: new Date(),
    };
  }

  @ApiOperation({ summary: '获取告警列表' })
  @ApiResponse({ 
    status: 200, 
    description: '告警列表获取成功'
  })
  @ApiQuery({ name: 'includeResolved', required: false, description: '是否包含已解决的告警' })
  @ApiQuery({ name: 'level', required: false, description: '告警级别过滤' })
  @Get('alerts')
  async getAlerts(
    @Query('includeResolved') includeResolved: string = 'false',
    @Query('level') level?: string
  ): Promise<{
    alerts: Alert[];
    total: number;
    active: number;
    critical: number;
  }> {
    const includeResolvedBool = includeResolved === 'true';
    let alerts = await this.monitoringService.getAlerts(includeResolvedBool);
    
    // 按级别过滤
    if (level && ['info', 'warning', 'error', 'critical'].includes(level)) {
      alerts = alerts.filter(alert => alert.level === level);
    }
    
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    const criticalAlerts = alerts.filter(alert => alert.level === 'critical' && !alert.resolved);
    
    return {
      alerts,
      total: alerts.length,
      active: activeAlerts.length,
      critical: criticalAlerts.length,
    };
  }

  @ApiOperation({ summary: '确认告警' })
  @ApiResponse({ 
    status: 200, 
    description: '告警确认成功'
  })
  @ApiResponse({ status: 404, description: '告警不存在' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('alerts/:alertId/acknowledge')
  async acknowledgeAlert(
    @Param('alertId') alertId: string,
    @Body() ackDto: AcknowledgeAlertDto
  ): Promise<{
    success: boolean;
    alert?: Alert;
    message: string;
  }> {
    const alert = await this.monitoringService.acknowledgeAlert(alertId, ackDto.acknowledgedBy);
    
    if (!alert) {
      return {
        success: false,
        message: '告警不存在',
      };
    }
    
    return {
      success: true,
      alert,
      message: '告警已确认',
    };
  }

  @ApiOperation({ summary: '解决告警' })
  @ApiResponse({ 
    status: 200, 
    description: '告警解决成功'
  })
  @ApiResponse({ status: 404, description: '告警不存在' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('alerts/:alertId/resolve')
  async resolveAlert(
    @Param('alertId') alertId: string
  ): Promise<{
    success: boolean;
    alert?: Alert;
    message: string;
  }> {
    const alert = await this.monitoringService.resolveAlert(alertId);
    
    if (!alert) {
      return {
        success: false,
        message: '告警不存在',
      };
    }
    
    return {
      success: true,
      alert,
      message: '告警已解决',
    };
  }

  @ApiOperation({ summary: '获取系统性能指标' })
  @ApiResponse({ 
    status: 200, 
    description: '性能指标获取成功'
  })
  @Get('performance')
  async getPerformanceMetrics(): Promise<{
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    uptime: number;
    loadAverage: number[];
    version: {
      node: string;
      npm: string;
      app: string;
    };
  }> {
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    return {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      cpu: {
        usage: Math.round((Math.random() * 30 + 10) * 100) / 100, // 模拟CPU使用率
      },
      uptime: Math.floor(process.uptime()),
      loadAverage: [1, 5, 15].map(() => Math.round(Math.random() * 2 * 100) / 100), // 模拟负载
      version: {
        node: process.version,
        npm: process.env.npm_version || 'unknown',
        app: process.env.npm_package_version || '1.0.0',
      },
    };
  }

  @ApiOperation({ summary: '获取实时系统指标' })
  @ApiResponse({ 
    status: 200, 
    description: '实时指标获取成功'
  })
  @Get('realtime')
  async getRealtimeMetrics(): Promise<{
    timestamp: Date;
    metrics: {
      name: string;
      value: number;
      unit: string;
      trend?: 'up' | 'down' | 'stable';
    }[];
  }> {
    const status = await this.monitoringService.getSystemStatus();
    
    // 为指标添加趋势信息
    const metricsWithTrend = status.metrics.map(metric => ({
      ...metric,
      trend: (['up', 'down', 'stable'] as const)[Math.floor(Math.random() * 3)],
    }));
    
    return {
      timestamp: new Date(),
      metrics: metricsWithTrend,
    };
  }

  @ApiOperation({ summary: '获取告警统计' })
  @ApiResponse({ 
    status: 200, 
    description: '告警统计获取成功'
  })
  @Get('alerts/stats')
  async getAlertStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byStatus: {
      active: number;
      acknowledged: number;
      resolved: number;
    };
    recent24h: number;
    criticalUnresolved: number;
  }> {
    const allAlerts = await this.monitoringService.getAlerts(true);
    const activeAlerts = allAlerts.filter(alert => !alert.resolved);
    
    // 按级别统计
    const byLevel = allAlerts.reduce((acc, alert) => {
      acc[alert.level] = (acc[alert.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 最近24小时的告警
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24h = allAlerts.filter(alert => alert.timestamp > last24h).length;
    
    // 未解决的严重告警
    const criticalUnresolved = activeAlerts.filter(alert => alert.level === 'critical').length;
    
    return {
      total: allAlerts.length,
      byLevel,
      byStatus: {
        active: activeAlerts.length,
        acknowledged: activeAlerts.filter(alert => alert.acknowledged).length,
        resolved: allAlerts.filter(alert => alert.resolved).length,
      },
      recent24h,
      criticalUnresolved,
    };
  }

  @ApiOperation({ summary: '触发手动健康检查' })
  @ApiResponse({ 
    status: 200, 
    description: '健康检查已触发'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('health/check')
  async triggerHealthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: Date;
  }> {
    try {
      // 触发健康检查
      await this.monitoringService.performHealthChecks();
      
      return {
        success: true,
        message: '健康检查已完成',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: `健康检查失败: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  @ApiOperation({ summary: '获取系统事件日志' })
  @ApiResponse({ 
    status: 200, 
    description: '事件日志获取成功'
  })
  @ApiQuery({ name: 'type', required: false, description: '事件类型过滤' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  @Get('events')
  async getSystemEvents(
    @Query('type') type?: string,
    @Query('limit') limit: string = '50'
  ): Promise<{
    events: {
      id: string;
      type: string;
      message: string;
      timestamp: Date;
      level: 'info' | 'warning' | 'error';
      metadata?: any;
    }[];
    total: number;
  }> {
    const limitNum = parseInt(limit, 10) || 50;
    
    // 模拟系统事件数据
    const mockEvents = [
      {
        id: 'event-001',
        type: 'SYSTEM_START',
        message: '系统启动成功',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        level: 'info' as const,
      },
      {
        id: 'event-002',
        type: 'HEALTH_CHECK',
        message: '定期健康检查完成',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        level: 'info' as const,
      },
      {
        id: 'event-003',
        type: 'ALERT_CREATED',
        message: '创建高内存使用告警',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        level: 'warning' as const,
        metadata: { alertId: 'HIGH_MEMORY_USAGE', level: 'warning' },
      },
    ];
    
    let events = mockEvents;
    
    // 按类型过滤
    if (type) {
      events = events.filter(event => event.type === type);
    }
    
    // 限制数量
    events = events.slice(0, limitNum);
    
    return {
      events,
      total: events.length,
    };
  }

  @ApiOperation({ summary: '导出监控报告' })
  @ApiResponse({ 
    status: 200, 
    description: '监控报告导出成功'
  })
  @ApiQuery({ name: 'format', required: false, description: '导出格式', enum: ['json', 'csv'] })
  @ApiQuery({ name: 'timeRange', required: false, description: '时间范围' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('export')
  async exportMonitoringReport(
    @Query('format') format: string = 'json',
    @Query('timeRange') timeRange: string = '24h'
  ): Promise<{
    success: boolean;
    data?: any;
    downloadUrl?: string;
    message?: string;
  }> {
    try {
      const status = await this.monitoringService.getSystemStatus();
      const alerts = await this.monitoringService.getAlerts(true);
      
      const report = {
        generatedAt: new Date(),
        timeRange,
        summary: {
          overallStatus: status.overall,
          totalServices: status.services.length,
          healthyServices: status.services.filter(s => s.status === 'healthy').length,
          totalAlerts: alerts.length,
          activeAlerts: alerts.filter(a => !a.resolved).length,
          uptime: status.uptime,
        },
        services: status.services,
        metrics: status.metrics,
        alerts: alerts.slice(0, 100), // 最近100个告警
      };
      
      if (format === 'csv') {
        // 实际实现中应该生成CSV文件
        return {
          success: true,
          downloadUrl: '/api/monitoring/download/report.csv',
          message: 'CSV报告生成成功',
        };
      }
      
      return {
        success: true,
        data: report,
        message: 'JSON报告生成成功',
      };
      
    } catch (error) {
      return {
        success: false,
        message: `报告生成失败: ${error.message}`,
      };
    }
  }
}