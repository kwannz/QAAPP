import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface AlertRule {
  id?: string;
  name: string;
  description?: string;
  type: 'LOGIN_FAILURE' | 'HIGH_RISK_OPERATION' | 'ABNORMAL_ACTIVITY' | 'SYSTEM_ERROR' | 'CUSTOM';
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
    timeWindow?: number; // 时间窗口（分钟）
    threshold?: number; // 阈值
  };
  actions: {
    type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'NOTIFICATION';
    recipients?: string[];
    webhookUrl?: string;
    template?: string;
  }[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AlertInstance {
  id?: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  severity: string;
  message: string;
  details: any;
  status: 'triggered' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

@Injectable()
export class AlertsService {
  private alertRules: Map<string, AlertRule> = new Map();
  private alertInstances: AlertInstance[] = [];
  private alertHandlers: Map<string, Function> = new Map();

  constructor(
    private database: DatabaseService,
    private auditService: AuditService,
  ) {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // 默认规则：登录失败过多
    this.createRule({
      name: '登录失败告警',
      type: 'LOGIN_FAILURE',
      description: '5分钟内登录失败超过5次',
      condition: {
        field: 'action',
        operator: 'equals',
        value: 'LOGIN_FAILED',
        timeWindow: 5,
        threshold: 5
      },
      actions: [{
        type: 'NOTIFICATION',
        recipients: ['admin@example.com']
      }],
      severity: 'high',
      isActive: true
    });

    // 默认规则：高风险操作
    this.createRule({
      name: '高风险操作告警',
      type: 'HIGH_RISK_OPERATION',
      description: '检测到高风险操作',
      condition: {
        field: 'severity',
        operator: 'in',
        value: ['high', 'critical']
      },
      actions: [{
        type: 'NOTIFICATION',
        recipients: ['admin@example.com']
      }],
      severity: 'high',
      isActive: true
    });

    // 默认规则：系统错误率
    this.createRule({
      name: '系统错误率告警',
      type: 'SYSTEM_ERROR',
      description: '系统错误率超过阈值',
      condition: {
        field: 'errorRate',
        operator: 'greater_than',
        value: 0.05,
        timeWindow: 10
      },
      actions: [{
        type: 'EMAIL',
        recipients: ['ops@example.com']
      }],
      severity: 'critical',
      isActive: true
    });
  }

  // 创建告警规则
  async createRule(rule: AlertRule): Promise<AlertRule> {
    const ruleWithId = {
      ...rule,
      id: rule.id || this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.alertRules.set(ruleWithId.id, ruleWithId);
    
    // 持久化到数据库
    await this.saveRuleToDB(ruleWithId);
    
    // 注册规则处理器
    this.registerRuleHandler(ruleWithId);
    
    return ruleWithId;
  }

  // 更新告警规则
  async updateRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const rule = this.alertRules.get(id);
    if (!rule) {
      throw new Error('Alert rule not found');
    }

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date()
    };

    this.alertRules.set(id, updatedRule);
    await this.saveRuleToDB(updatedRule);
    
    // 重新注册规则处理器
    this.unregisterRuleHandler(id);
    this.registerRuleHandler(updatedRule);

    return updatedRule;
  }

  // 删除告警规则
  async deleteRule(id: string): Promise<void> {
    this.alertRules.delete(id);
    this.unregisterRuleHandler(id);
    await this.deleteRuleFromDB(id);
  }

  // 获取所有告警规则
  async getRules(): Promise<AlertRule[]> {
    return Array.from(this.alertRules.values());
  }

  // 获取单个告警规则
  async getRule(id: string): Promise<AlertRule | undefined> {
    return this.alertRules.get(id);
  }

  // 触发告警
  async triggerAlert(ruleId: string, details: any): Promise<AlertInstance> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error('Alert rule not found');
    }

    const alertInstance: AlertInstance = {
      id: this.generateId(),
      ruleId: rule.id!,
      ruleName: rule.name,
      triggeredAt: new Date(),
      severity: rule.severity,
      message: this.generateAlertMessage(rule, details),
      details,
      status: 'triggered'
    };

    this.alertInstances.push(alertInstance);
    
    // 执行告警动作
    await this.executeAlertActions(rule, alertInstance);
    
    // 记录到审计日志
    await this.auditService.createAuditLog({
      action: 'ALERT_TRIGGERED',
      resourceType: 'ALERT',
      resourceId: alertInstance.id,
      metadata: {
        ruleName: rule.name,
        severity: rule.severity,
        details
      }
    });

    return alertInstance;
  }

  // 确认告警
  async acknowledgeAlert(alertId: string, userId: string): Promise<AlertInstance> {
    const alert = this.alertInstances.find(a => a.id === alertId);
    if (!alert) {
      throw new Error('Alert instance not found');
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    return alert;
  }

  // 解决告警
  async resolveAlert(alertId: string, userId: string): Promise<AlertInstance> {
    const alert = this.alertInstances.find(a => a.id === alertId);
    if (!alert) {
      throw new Error('Alert instance not found');
    }

    alert.status = 'resolved';
    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();

    return alert;
  }

  // 获取告警实例
  async getAlertInstances(filters?: {
    status?: string;
    severity?: string;
    ruleId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AlertInstance[]> {
    let instances = [...this.alertInstances];

    if (filters) {
      if (filters.status) {
        instances = instances.filter(i => i.status === filters.status);
      }
      if (filters.severity) {
        instances = instances.filter(i => i.severity === filters.severity);
      }
      if (filters.ruleId) {
        instances = instances.filter(i => i.ruleId === filters.ruleId);
      }
      if (filters.startDate) {
        instances = instances.filter(i => i.triggeredAt >= filters.startDate);
      }
      if (filters.endDate) {
        instances = instances.filter(i => i.triggeredAt <= filters.endDate);
      }
    }

    return instances.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  // 定期检查告警规则
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAlertRules() {
    for (const rule of this.alertRules.values()) {
      if (!rule.isActive) continue;

      try {
        await this.evaluateRule(rule);
      } catch (error) {
        console.error(`Error evaluating rule ${rule.name}:`, error);
      }
    }
  }

  // 评估规则
  private async evaluateRule(rule: AlertRule) {
    switch (rule.type) {
      case 'LOGIN_FAILURE':
        await this.checkLoginFailures(rule);
        break;
      case 'HIGH_RISK_OPERATION':
        await this.checkHighRiskOperations(rule);
        break;
      case 'SYSTEM_ERROR':
        await this.checkSystemErrors(rule);
        break;
      case 'ABNORMAL_ACTIVITY':
        await this.checkAbnormalActivity(rule);
        break;
      case 'CUSTOM':
        await this.evaluateCustomRule(rule);
        break;
    }
  }

  // 检查登录失败
  private async checkLoginFailures(rule: AlertRule) {
    const timeWindow = rule.condition.timeWindow || 5;
    const threshold = rule.condition.threshold || 5;
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);

    const logs = await this.auditService.getAuditLogs({
      action: 'LOGIN_FAILED',
      startDate: startTime,
      endDate: new Date()
    });

    if (logs.logs.length >= threshold) {
      await this.triggerAlert(rule.id!, {
        failureCount: logs.logs.length,
        timeWindow,
        threshold,
        affectedUsers: [...new Set(logs.logs.map((l: any) => l.actorId))]
      });
    }
  }

  // 检查高风险操作
  private async checkHighRiskOperations(rule: AlertRule) {
    const startTime = new Date(Date.now() - 5 * 60 * 1000);

    const logs = await this.auditService.getAuditLogs({
      startDate: startTime,
      endDate: new Date()
    });

    const highRiskLogs = logs.logs.filter((log: any) => 
      rule.condition.value.includes(log.severity)
    );

    for (const log of highRiskLogs) {
      await this.triggerAlert(rule.id!, {
        operation: log.action,
        severity: 'high', // 使用默认值
        user: log.actorId || 'unknown',
        details: log.metadata
      });
    }
  }

  // 检查系统错误
  private async checkSystemErrors(rule: AlertRule) {
    // 这里应该从监控系统获取错误率
    // 暂时使用模拟数据
    const errorRate = Math.random() * 0.1;

    if (errorRate > rule.condition.value) {
      await this.triggerAlert(rule.id!, {
        errorRate,
        threshold: rule.condition.value,
        timeWindow: rule.condition.timeWindow
      });
    }
  }

  // 检查异常活动
  private async checkAbnormalActivity(rule: AlertRule) {
    // 实现异常活动检测逻辑
    // 可以使用机器学习模型或统计方法
  }

  // 评估自定义规则
  private async evaluateCustomRule(rule: AlertRule) {
    // 实现自定义规则评估逻辑
    const handler = this.alertHandlers.get(rule.id!);
    if (handler) {
      await handler(rule);
    }
  }

  // 执行告警动作
  private async executeAlertActions(rule: AlertRule, alert: AlertInstance) {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'EMAIL':
            await this.sendEmailAlert(action, alert);
            break;
          case 'SMS':
            await this.sendSMSAlert(action, alert);
            break;
          case 'WEBHOOK':
            await this.sendWebhookAlert(action, alert);
            break;
          case 'NOTIFICATION':
            await this.sendNotificationAlert(action, alert);
            break;
        }
      } catch (error) {
        console.error(`Error executing alert action ${action.type}:`, error);
      }
    }
  }

  // 发送邮件告警
  private async sendEmailAlert(action: any, alert: AlertInstance) {
    console.log('Sending email alert:', { action, alert });
    // 实际实现需要集成邮件服务
  }

  // 发送短信告警
  private async sendSMSAlert(action: any, alert: AlertInstance) {
    console.log('Sending SMS alert:', { action, alert });
    // 实际实现需要集成短信服务
  }

  // 发送Webhook告警
  private async sendWebhookAlert(action: any, alert: AlertInstance) {
    if (action.webhookUrl) {
      try {
        const response = await fetch(action.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
        console.log('Webhook response:', response.status);
      } catch (error) {
        console.error('Webhook error:', error);
      }
    }
  }

  // 发送系统通知
  private async sendNotificationAlert(action: any, alert: AlertInstance) {
    console.log('Sending notification alert:', { action, alert });
    // 通过WebSocket发送实时通知
  }

  // 生成告警消息
  private generateAlertMessage(rule: AlertRule, details: any): string {
    return `告警: ${rule.name} - ${rule.description || ''} - 详情: ${JSON.stringify(details)}`;
  }

  // 注册规则处理器
  private registerRuleHandler(rule: AlertRule) {
    if (rule.type === 'CUSTOM' && rule.id) {
      // 可以注册自定义处理函数
    }
  }

  // 注销规则处理器
  private unregisterRuleHandler(ruleId: string) {
    this.alertHandlers.delete(ruleId);
  }

  // 保存规则到数据库
  private async saveRuleToDB(rule: AlertRule) {
    // 实际实现需要Prisma模型
    console.log('Saving rule to DB:', rule);
  }

  // 从数据库删除规则
  private async deleteRuleFromDB(ruleId: string) {
    // 实际实现需要Prisma模型
    console.log('Deleting rule from DB:', ruleId);
  }

  // 生成ID
  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取告警列表 (Controller需要的方法)
  async getAlerts(filters: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    ruleId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const { page = 1, limit = 20, ...filterOptions } = filters;
    const instances = await this.getAlertInstances(filterOptions);
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedInstances = instances.slice(start, end);

    return {
      data: paginatedInstances,
      total: instances.length,
      page,
      limit,
      totalPages: Math.ceil(instances.length / limit),
    };
  }

  // 获取最近的告警
  async getRecentAlerts(hours: number = 24) {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getAlertInstances({ startDate });
  }

  // 获取告警摘要
  async getAlertsSummary() {
    const allAlerts = await this.getAlertInstances();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentAlerts = allAlerts.filter(alert => alert.triggeredAt >= last24Hours);
    const weeklyAlerts = allAlerts.filter(alert => alert.triggeredAt >= last7Days);

    return {
      totalAlerts: allAlerts.length,
      recentAlerts: recentAlerts.length,
      weeklyAlerts: weeklyAlerts.length,
      activeRules: Array.from(this.alertRules.values()).filter(rule => rule.isActive).length,
      totalRules: this.alertRules.size,
      severityBreakdown: {
        critical: allAlerts.filter(a => a.severity === 'critical').length,
        high: allAlerts.filter(a => a.severity === 'high').length,
        medium: allAlerts.filter(a => a.severity === 'medium').length,
        low: allAlerts.filter(a => a.severity === 'low').length,
      },
      statusBreakdown: {
        triggered: allAlerts.filter(a => a.status === 'triggered').length,
        acknowledged: allAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: allAlerts.filter(a => a.status === 'resolved').length,
      }
    };
  }
}