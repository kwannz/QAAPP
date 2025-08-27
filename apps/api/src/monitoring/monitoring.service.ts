import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: Record<string, any>;
  timestamp: Date;
  responseTime?: number;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface SystemStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheck[];
  metrics: SystemMetric[];
  activeAlerts: Alert[];
  uptime: number;
  version: string;
  lastUpdated: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  
  // 内存存储监控数据
  private metrics: Map<string, SystemMetric[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private startTime: Date = new Date();
  
  // 配置阈值
  private readonly thresholds = {
    // 响应时间阈值 (毫秒)
    responseTime: {
      warning: 1000,
      error: 3000,
    },
    // 内存使用阈值 (%)
    memoryUsage: {
      warning: 80,
      error: 95,
    },
    // CPU使用阈值 (%)
    cpuUsage: {
      warning: 80,
      error: 95,
    },
    // 错误率阈值 (%)
    errorRate: {
      warning: 5,
      error: 10,
    },
    // 数据库连接数阈值
    dbConnections: {
      warning: 80,
      error: 95,
    },
  };

  constructor(
    private configService: ConfigService,
  ) {
    this.logger.log('监控系统已启动');
    this.initializeHealthChecks();
  }

  /**
   * 每分钟收集系统指标
   */
  @Cron('0 * * * * *') // 每分钟
  async collectSystemMetrics(): Promise<void> {
    try {
      // 收集内存指标
      const memoryUsage = process.memoryUsage();
      await this.recordMetric('memory_rss', memoryUsage.rss / 1024 / 1024, 'MB');
      await this.recordMetric('memory_heap_used', memoryUsage.heapUsed / 1024 / 1024, 'MB');
      await this.recordMetric('memory_heap_total', memoryUsage.heapTotal / 1024 / 1024, 'MB');
      
      // 收集CPU使用率 (模拟)
      const cpuUsage = Math.random() * 30 + 10; // 10-40% 随机值
      await this.recordMetric('cpu_usage', cpuUsage, '%');
      
      // 收集Node.js进程指标
      const uptime = process.uptime();
      await this.recordMetric('process_uptime', uptime, 'seconds');
      
      // 检查内存使用警报
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      if (memoryUsagePercent > this.thresholds.memoryUsage.error) {
        await this.createAlert('HIGH_MEMORY_USAGE', 'critical', 
          '内存使用率过高', 
          `当前内存使用率: ${memoryUsagePercent.toFixed(1)}%`,
          { memoryUsage: memoryUsagePercent }
        );
      } else if (memoryUsagePercent > this.thresholds.memoryUsage.warning) {
        await this.createAlert('HIGH_MEMORY_USAGE', 'warning',
          '内存使用率警告',
          `当前内存使用率: ${memoryUsagePercent.toFixed(1)}%`,
          { memoryUsage: memoryUsagePercent }
        );
      }
      
    } catch (error) {
      this.logger.error('收集系统指标失败:', error);
    }
  }

  /**
   * 每5分钟执行健康检查
   */
  @Cron('0 */5 * * * *') // 每5分钟
  async performHealthChecks(): Promise<void> {
    this.logger.debug('开始执行健康检查');
    
    try {
      // API服务健康检查
      await this.checkAPIHealth();
      
      // 数据库健康检查
      await this.checkDatabaseHealth();
      
      // 区块链连接健康检查
      await this.checkBlockchainHealth();
      
      // 收益分发系统健康检查
      await this.checkYieldDistributionHealth();
      
      // 外部服务健康检查
      await this.checkExternalServicesHealth();
      
      this.logger.debug('健康检查完成');
      
    } catch (error) {
      this.logger.error('健康检查执行失败:', error);
      
      await this.createAlert('HEALTH_CHECK_FAILED', 'error',
        '健康检查失败',
        `健康检查执行失败: ${error.message}`,
        { error: error.stack }
      );
    }
  }

  /**
   * 记录指标
   */
  async recordMetric(
    name: string, 
    value: number, 
    unit: string, 
    labels?: Record<string, string>
  ): Promise<void> {
    const metric: SystemMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      labels,
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);
    
    // 保留最近100个数据点
    if (metricHistory.length > 100) {
      metricHistory.shift();
    }
    
    this.logger.debug(`记录指标: ${name} = ${value} ${unit}`);
  }

  /**
   * 创建告警
   */
  async createAlert(
    id: string,
    level: Alert['level'],
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<Alert> {
    // 检查是否已存在相同告警
    const existingAlert = this.alerts.get(id);
    if (existingAlert && !existingAlert.resolved) {
      // 更新现有告警
      existingAlert.message = message;
      existingAlert.timestamp = new Date();
      existingAlert.metadata = { ...existingAlert.metadata, ...metadata };
      return existingAlert;
    }
    
    const alert: Alert = {
      id,
      level,
      title,
      message,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      metadata,
    };
    
    this.alerts.set(id, alert);
    
    this.logger.warn(`新告警 [${level.toUpperCase()}]: ${title} - ${message}`);
    
    // 发送通知
    await this.sendNotification(alert);
    
    return alert;
  }

  /**
   * API服务健康检查
   */
  private async checkAPIHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 检查API服务状态
      const responseTime = Date.now() - startTime;
      
      const healthCheck: HealthCheck = {
        name: 'API服务',
        status: 'healthy',
        message: 'API服务运行正常',
        details: {
          responseTime,
          port: this.configService.get('PORT', 3001),
        },
        timestamp: new Date(),
        responseTime,
      };
      
      // 检查响应时间警报
      if (responseTime > this.thresholds.responseTime.error) {
        healthCheck.status = 'unhealthy';
        healthCheck.message = '响应时间过长';
        
        await this.createAlert('HIGH_RESPONSE_TIME', 'error',
          'API响应时间过长',
          `当前响应时间: ${responseTime}ms`,
          { responseTime }
        );
      } else if (responseTime > this.thresholds.responseTime.warning) {
        healthCheck.status = 'degraded';
        healthCheck.message = '响应时间较慢';
        
        await this.createAlert('HIGH_RESPONSE_TIME', 'warning',
          'API响应时间警告',
          `当前响应时间: ${responseTime}ms`,
          { responseTime }
        );
      }
      
      this.healthChecks.set('api', healthCheck);
      
    } catch (error) {
      const healthCheck: HealthCheck = {
        name: 'API服务',
        status: 'unhealthy',
        message: `API服务检查失败: ${error.message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
      
      this.healthChecks.set('api', healthCheck);
      
      await this.createAlert('API_HEALTH_CHECK_FAILED', 'critical',
        'API服务健康检查失败',
        error.message,
        { error: error.stack }
      );
    }
  }

  /**
   * 数据库健康检查
   */
  private async checkDatabaseHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 模拟数据库连接检查
      // 实际实现中应该执行简单的数据库查询
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const responseTime = Date.now() - startTime;
      
      const healthCheck: HealthCheck = {
        name: '数据库',
        status: 'healthy',
        message: '数据库连接正常',
        details: {
          responseTime,
          connectionPool: 'active',
          activeConnections: Math.floor(Math.random() * 10) + 1,
        },
        timestamp: new Date(),
        responseTime,
      };
      
      this.healthChecks.set('database', healthCheck);
      
    } catch (error) {
      const healthCheck: HealthCheck = {
        name: '数据库',
        status: 'unhealthy',
        message: `数据库连接失败: ${error.message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
      
      this.healthChecks.set('database', healthCheck);
      
      await this.createAlert('DATABASE_CONNECTION_FAILED', 'critical',
        '数据库连接失败',
        error.message,
        { error: error.stack }
      );
    }
  }

  /**
   * 区块链连接健康检查
   */
  private async checkBlockchainHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 模拟区块链连接检查
      // 实际实现中应该检查区块链节点连接
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
      
      const responseTime = Date.now() - startTime;
      const blockNumber = Math.floor(Math.random() * 1000000) + 15000000; // 模拟区块号
      
      const healthCheck: HealthCheck = {
        name: '区块链连接',
        status: 'healthy',
        message: '区块链连接正常',
        details: {
          responseTime,
          latestBlock: blockNumber,
          network: 'mainnet',
        },
        timestamp: new Date(),
        responseTime,
      };
      
      this.healthChecks.set('blockchain', healthCheck);
      
    } catch (error) {
      const healthCheck: HealthCheck = {
        name: '区块链连接',
        status: 'unhealthy',
        message: `区块链连接失败: ${error.message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
      
      this.healthChecks.set('blockchain', healthCheck);
      
      await this.createAlert('BLOCKCHAIN_CONNECTION_FAILED', 'critical',
        '区块链连接失败',
        error.message,
        { error: error.stack }
      );
    }
  }

  /**
   * 收益分发系统健康检查
   */
  private async checkYieldDistributionHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 检查收益分发系统状态
      // 实际实现中应该检查最近的分发任务状态
      
      const responseTime = Date.now() - startTime;
      const lastDistribution = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前
      
      const healthCheck: HealthCheck = {
        name: '收益分发系统',
        status: 'healthy',
        message: '收益分发系统运行正常',
        details: {
          responseTime,
          lastDistribution,
          pendingTasks: Math.floor(Math.random() * 5),
          successRate: '99.8%',
        },
        timestamp: new Date(),
        responseTime,
      };
      
      // 检查最后分发时间
      const hoursSinceLastDistribution = (Date.now() - lastDistribution.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastDistribution > 25) { // 超过25小时未分发
        healthCheck.status = 'degraded';
        healthCheck.message = '收益分发延迟';
        
        await this.createAlert('YIELD_DISTRIBUTION_DELAYED', 'warning',
          '收益分发延迟',
          `距离上次分发已超过${Math.floor(hoursSinceLastDistribution)}小时`,
          { hoursSinceLastDistribution }
        );
      }
      
      this.healthChecks.set('yield-distribution', healthCheck);
      
    } catch (error) {
      const healthCheck: HealthCheck = {
        name: '收益分发系统',
        status: 'unhealthy',
        message: `收益分发系统检查失败: ${error.message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
      
      this.healthChecks.set('yield-distribution', healthCheck);
      
      await this.createAlert('YIELD_DISTRIBUTION_HEALTH_FAILED', 'error',
        '收益分发系统健康检查失败',
        error.message,
        { error: error.stack }
      );
    }
  }

  /**
   * 外部服务健康检查
   */
  private async checkExternalServicesHealth(): Promise<void> {
    const services = [
      { name: 'Google OAuth', url: 'https://oauth2.googleapis.com' },
      { name: 'USDT Price API', url: 'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd' },
    ];
    
    for (const service of services) {
      const startTime = Date.now();
      
      try {
        // 模拟外部服务检查
        // 实际实现中应该发送HTTP请求
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
        
        const responseTime = Date.now() - startTime;
        
        const healthCheck: HealthCheck = {
          name: service.name,
          status: 'healthy',
          message: `${service.name}服务正常`,
          details: {
            responseTime,
            url: service.url,
          },
          timestamp: new Date(),
          responseTime,
        };
        
        this.healthChecks.set(service.name.toLowerCase().replace(/\s+/g, '-'), healthCheck);
        
      } catch (error) {
        const healthCheck: HealthCheck = {
          name: service.name,
          status: 'unhealthy',
          message: `${service.name}服务不可用: ${error.message}`,
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
        };
        
        this.healthChecks.set(service.name.toLowerCase().replace(/\s+/g, '-'), healthCheck);
        
        await this.createAlert(`EXTERNAL_SERVICE_FAILED_${service.name.toUpperCase()}`, 'warning',
          `${service.name}服务不可用`,
          error.message,
          { service: service.name, url: service.url }
        );
      }
    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(alert: Alert): Promise<void> {
    try {
      // 实际实现中应该集成邮件、短信、Slack等通知渠道
      this.logger.warn(`📢 告警通知: [${alert.level.toUpperCase()}] ${alert.title}`);
      this.logger.warn(`📝 详情: ${alert.message}`);
      
      // 可以集成第三方通知服务
      // await this.emailService.sendAlert(alert);
      // await this.slackService.sendAlert(alert);
      
    } catch (error) {
      this.logger.error('发送告警通知失败:', error);
    }
  }

  /**
   * 初始化健康检查
   */
  private initializeHealthChecks(): void {
    // 初始化各服务的健康状态
    const initialServices = ['api', 'database', 'blockchain', 'yield-distribution'];
    
    initialServices.forEach(service => {
      this.healthChecks.set(service, {
        name: service,
        status: 'healthy',
        message: '初始化中',
        timestamp: new Date(),
      });
    });
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const healthChecks = Array.from(this.healthChecks.values());
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => !alert.resolved);
    
    // 计算整体健康状态
    let overall: SystemStatus['overall'] = 'healthy';
    const unhealthyCount = healthChecks.filter(hc => hc.status === 'unhealthy').length;
    const degradedCount = healthChecks.filter(hc => hc.status === 'degraded').length;
    
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    }
    
    // 获取最新指标
    const latestMetrics: SystemMetric[] = [];
    for (const [name, metricHistory] of this.metrics.entries()) {
      if (metricHistory.length > 0) {
        latestMetrics.push(metricHistory[metricHistory.length - 1]);
      }
    }
    
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    
    return {
      overall,
      services: healthChecks,
      metrics: latestMetrics,
      activeAlerts,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      lastUpdated: new Date(),
    };
  }

  /**
   * 获取指标历史数据
   */
  async getMetricHistory(metricName: string, limit: number = 50): Promise<SystemMetric[]> {
    const metricHistory = this.metrics.get(metricName) || [];
    return metricHistory.slice(-limit);
  }

  /**
   * 获取告警列表
   */
  async getAlerts(includeResolved: boolean = false): Promise<Alert[]> {
    const allAlerts = Array.from(this.alerts.values());
    
    if (includeResolved) {
      return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    
    return allAlerts
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 确认告警
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<Alert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return null;
    }
    
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;
    
    this.logger.log(`告警 ${alertId} 已被 ${acknowledgedBy} 确认`);
    
    return alert;
  }

  /**
   * 解决告警
   */
  async resolveAlert(alertId: string): Promise<Alert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return null;
    }
    
    alert.resolved = true;
    alert.resolvedAt = new Date();
    
    this.logger.log(`告警 ${alertId} 已解决`);
    
    return alert;
  }

  /**
   * 清理过期数据
   */
  @Cron('0 0 2 * * *') // 每天凌晨2点
  async cleanupOldData(): Promise<void> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // 清理过期指标数据
      for (const [name, metricHistory] of this.metrics.entries()) {
        const filteredMetrics = metricHistory.filter(
          metric => metric.timestamp > oneWeekAgo
        );
        this.metrics.set(name, filteredMetrics);
      }
      
      // 清理已解决的旧告警
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      for (const [id, alert] of this.alerts.entries()) {
        if (alert.resolved && alert.resolvedAt && alert.resolvedAt < oneMonthAgo) {
          this.alerts.delete(id);
        }
      }
      
      this.logger.log('旧数据清理完成');
      
    } catch (error) {
      this.logger.error('清理旧数据失败:', error);
    }
  }
}