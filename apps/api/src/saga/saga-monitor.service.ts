import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { 
  SagaExecution, 
  SagaStatus, 
  SagaStepStatus, 
  SagaEvent 
} from '@qa-app/shared';
import { SagaRepository } from './saga.repository';
import { SagaOrchestratorService } from './saga-orchestrator.service';

interface SagaMetrics {
  totalSagas: number;
  completedSagas: number;
  failedSagas: number;
  compensatedSagas: number;
  runningSagas: number;
  averageExecutionTime: number;
  successRate: number;
  compensationRate: number;
  topFailureReasons: Array<{ reason: string; count: number }>;
}

interface SagaAlert {
  id: string;
  sagaId: string;
  type: 'timeout' | 'failure' | 'compensation' | 'stuck';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class SagaMonitorService {
  private readonly logger = new Logger(SagaMonitorService.name);
  private readonly alerts = new Map<string, SagaAlert>();
  private readonly metrics: SagaMetrics = {
    totalSagas: 0,
    completedSagas: 0,
    failedSagas: 0,
    compensatedSagas: 0,
    runningSagas: 0,
    averageExecutionTime: 0,
    successRate: 0,
    compensationRate: 0,
    topFailureReasons: []
  };

  constructor(
    private repository: SagaRepository,
    private orchestrator: SagaOrchestratorService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * 每分钟执行监控检查
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async performMonitoringCheck(): Promise<void> {
    try {
      await Promise.all([
        this.checkTimeoutSagas(),
        this.checkStuckSagas(),
        this.updateMetrics(),
        this.cleanupOldAlerts()
      ]);
    } catch (error) {
      this.logger.error('Monitoring check failed:', error);
    }
  }

  /**
   * 每小时生成监控报告
   */
  @Cron(CronExpression.EVERY_HOUR)
  async generateMonitoringReport(): Promise<void> {
    try {
      const report = await this.generateSagaReport();
      this.logger.log('Saga Monitoring Report:', report);
      
      // 发布监控报告事件
      this.eventEmitter.emit('saga.monitoring.report', report);
    } catch (error) {
      this.logger.error('Failed to generate monitoring report:', error);
    }
  }

  /**
   * 监听Saga事件
   */
  @OnEvent('saga.*')
  async handleSagaEvent(event: SagaEvent): Promise<void> {
    try {
      await this.processSagaEvent(event);
    } catch (error) {
      this.logger.error('Failed to process saga event:', error);
    }
  }

  /**
   * 检查超时的Saga
   */
  private async checkTimeoutSagas(): Promise<void> {
    const timeoutThreshold = 30 * 60 * 1000; // 30分钟
    const timeoutSagas = await this.repository.findTimeoutSagas(timeoutThreshold);

    for (const saga of timeoutSagas) {
      await this.createAlert({
        sagaId: saga.id,
        type: 'timeout',
        severity: 'high',
        message: `Saga ${saga.id} has been running for more than ${timeoutThreshold / 60000} minutes`,
        metadata: {
          startedAt: saga.startedAt,
          currentStep: saga.currentStep,
          status: saga.status
        }
      });

      // 自动处理超时Saga
      if (saga.status === SagaStatus.RUNNING) {
        this.logger.warn(`Auto-compensating timeout saga: ${saga.id}`);
        try {
          await this.orchestrator.compensate(saga.id);
        } catch (error) {
          this.logger.error(`Failed to compensate timeout saga ${saga.id}:`, error);
        }
      }
    }
  }

  /**
   * 检查卡住的Saga
   */
  private async checkStuckSagas(): Promise<void> {
    const stuckThreshold = 10 * 60 * 1000; // 10分钟无状态变化
    const now = new Date();
    
    // 查找状态长时间未更新的运行中Saga
    const stuckSagas = await this.repository.findSagasByStatus(SagaStatus.RUNNING);
    
    for (const saga of stuckSagas) {
      const lastUpdateTime = new Date(Math.max(
        saga.startedAt.getTime(),
        ...(saga.steps ? Object.values(saga.steps)
          .filter(step => step.startedAt)
          .map(step => step.startedAt!.getTime()) : [])
      ));

      const timeSinceUpdate = now.getTime() - lastUpdateTime.getTime();
      
      if (timeSinceUpdate > stuckThreshold) {
        await this.createAlert({
          sagaId: saga.id,
          type: 'stuck',
          severity: 'medium',
          message: `Saga ${saga.id} appears to be stuck (no activity for ${Math.round(timeSinceUpdate / 60000)} minutes)`,
          metadata: {
            lastUpdateTime,
            currentStep: saga.currentStep,
            timeSinceUpdate
          }
        });

        // 尝试恢复卡住的Saga
        try {
          await this.orchestrator.resume(saga.id);
        } catch (error) {
          this.logger.error(`Failed to resume stuck saga ${saga.id}:`, error);
        }
      }
    }
  }

  /**
   * 更新指标
   */
  private async updateMetrics(): Promise<void> {
    const [
      total,
      completed,
      failed,
      compensated,
      running
    ] = await Promise.all([
      this.repository.countSagasByStatus(),
      this.repository.countSagasByStatus(SagaStatus.COMPLETED),
      this.repository.countSagasByStatus(SagaStatus.FAILED),
      this.repository.countSagasByStatus(SagaStatus.COMPENSATED),
      this.repository.countSagasByStatus(SagaStatus.RUNNING)
    ]);

    // 计算平均执行时间
    const recentCompletedSagas = await this.repository.getRecentCompletedSagas(100);
    const executionTimes = recentCompletedSagas
      .filter(saga => saga.completedAt)
      .map(saga => saga.completedAt!.getTime() - saga.startedAt.getTime());
    
    const averageExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    // 更新指标
    this.metrics.totalSagas = total;
    this.metrics.completedSagas = completed;
    this.metrics.failedSagas = failed;
    this.metrics.compensatedSagas = compensated;
    this.metrics.runningSagas = running;
    this.metrics.averageExecutionTime = averageExecutionTime;
    this.metrics.successRate = total > 0 ? (completed / total) * 100 : 0;
    this.metrics.compensationRate = total > 0 ? (compensated / total) * 100 : 0;

    // 获取失败原因统计
    this.metrics.topFailureReasons = await this.getTopFailureReasons();
  }

  /**
   * 处理Saga事件
   */
  private async processSagaEvent(event: SagaEvent): Promise<void> {
    switch (event.eventType) {
      case 'SagaStarted':
        this.logger.debug(`Saga started: ${event.sagaId}`);
        break;
      
      case 'SagaCompleted':
        this.logger.log(`Saga completed: ${event.sagaId}`);
        await this.resolveAlerts(event.sagaId, ['timeout', 'stuck']);
        break;
      
      case 'SagaFailed':
        this.logger.warn(`Saga failed: ${event.sagaId}`, event.eventData);
        await this.createAlert({
          sagaId: event.sagaId,
          type: 'failure',
          severity: 'high',
          message: `Saga ${event.sagaId} failed: ${event.eventData.error}`,
          metadata: event.eventData
        });
        break;
      
      case 'SagaCompensated':
        this.logger.log(`Saga compensated: ${event.sagaId}`);
        await this.createAlert({
          sagaId: event.sagaId,
          type: 'compensation',
          severity: 'medium',
          message: `Saga ${event.sagaId} was compensated`,
          metadata: event.eventData
        });
        break;
      
      case 'StepFailed':
        this.logger.warn(`Step failed in saga ${event.sagaId}:`, event.eventData);
        await this.handleStepFailure(event);
        break;
    }
  }

  /**
   * 处理步骤失败
   */
  private async handleStepFailure(event: SagaEvent): Promise<void> {
    const { stepId, stepName, error } = event.eventData;
    
    // 检查是否为重复失败
    const saga = await this.repository.getSagaExecution(event.sagaId);
    if (saga?.steps[stepId]?.retryCount > 2) {
      await this.createAlert({
        sagaId: event.sagaId,
        type: 'failure',
        severity: 'critical',
        message: `Step ${stepName} in saga ${event.sagaId} failed multiple times: ${error}`,
        metadata: {
          stepId,
          stepName,
          error,
          retryCount: saga.steps[stepId].retryCount
        }
      });
    }
  }

  /**
   * 创建告警
   */
  private async createAlert(alertData: Omit<SagaAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const alert: SagaAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alert.id, alert);
    
    this.logger.warn(`Saga Alert [${alert.severity.toUpperCase()}]: ${alert.message}`, {
      sagaId: alert.sagaId,
      type: alert.type,
      metadata: alert.metadata
    });

    // 发布告警事件
    this.eventEmitter.emit('saga.alert.created', alert);

    // 高严重性告警需要立即通知
    if (alert.severity === 'critical' || alert.severity === 'high') {
      this.eventEmitter.emit('saga.alert.urgent', alert);
    }
  }

  /**
   * 解决告警
   */
  private async resolveAlerts(sagaId: string, alertTypes?: string[]): Promise<void> {
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.sagaId === sagaId && !alert.resolved) {
        if (!alertTypes || alertTypes.includes(alert.type)) {
          alert.resolved = true;
          this.eventEmitter.emit('saga.alert.resolved', alert);
        }
      }
    }
  }

  /**
   * 清理旧告警
   */
  private async cleanupOldAlerts(): Promise<void> {
    const oneDay = 24 * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - oneDay);

    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.timestamp < cutoffTime && alert.resolved) {
        this.alerts.delete(alertId);
      }
    }
  }

  /**
   * 获取失败原因统计
   */
  private async getTopFailureReasons(): Promise<Array<{ reason: string; count: number }>> {
    // 这里应该从数据库查询失败原因统计
    // 简化实现，返回模拟数据
    return [
      { reason: 'Payment processing timeout', count: 15 },
      { reason: 'Insufficient balance', count: 12 },
      { reason: 'Position not found', count: 8 },
      { reason: 'Risk check failed', count: 5 },
      { reason: 'Network connection error', count: 3 }
    ];
  }

  /**
   * 生成Saga监控报告
   */
  async generateSagaReport(): Promise<{
    timestamp: Date;
    metrics: SagaMetrics;
    activeAlerts: SagaAlert[];
    recommendations: string[];
  }> {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved);

    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date(),
      metrics: { ...this.metrics },
      activeAlerts,
      recommendations
    };
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // 基于成功率的建议
    if (this.metrics.successRate < 90) {
      recommendations.push('成功率低于90%，建议检查步骤处理器的错误处理逻辑');
    }

    // 基于补偿率的建议
    if (this.metrics.compensationRate > 10) {
      recommendations.push('补偿率过高，建议优化业务逻辑或增加前置验证');
    }

    // 基于平均执行时间的建议
    if (this.metrics.averageExecutionTime > 5 * 60 * 1000) { // 5分钟
      recommendations.push('平均执行时间过长，建议优化步骤处理逻辑或增加并行处理');
    }

    // 基于运行中Saga数量的建议
    if (this.metrics.runningSagas > 100) {
      recommendations.push('运行中的Saga过多，可能存在性能瓶颈或死锁问题');
    }

    // 基于活跃告警的建议
    const criticalAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved && alert.severity === 'critical').length;
    
    if (criticalAlerts > 5) {
      recommendations.push('存在多个严重告警，需要立即处理');
    }

    return recommendations;
  }

  /**
   * 公共方法：获取当前指标
   */
  getMetrics(): SagaMetrics {
    return { ...this.metrics };
  }

  /**
   * 公共方法：获取活跃告警
   */
  getActiveAlerts(): SagaAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * 公共方法：手动创建告警
   */
  async manualAlert(
    sagaId: string,
    message: string,
    severity: SagaAlert['severity'] = 'medium',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.createAlert({
      sagaId,
      type: 'failure',
      severity,
      message,
      metadata
    });
  }

  /**
   * 公共方法：解决告警
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      this.eventEmitter.emit('saga.alert.resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
    metrics: SagaMetrics;
    alertCount: number;
  }> {
    const issues: string[] = [];
    const activeAlerts = this.getActiveAlerts();
    
    // 检查成功率
    if (this.metrics.successRate < 80) {
      issues.push(`Low success rate: ${this.metrics.successRate.toFixed(1)}%`);
    }
    
    // 检查运行中的Saga数量
    if (this.metrics.runningSagas > 50) {
      issues.push(`Too many running sagas: ${this.metrics.runningSagas}`);
    }
    
    // 检查严重告警
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      issues.push(`Critical alerts present: ${criticalAlerts.length}`);
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      metrics: this.metrics,
      alertCount: activeAlerts.length
    };
  }

  /**
   * 私有辅助方法
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}