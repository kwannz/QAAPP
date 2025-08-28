import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  SagaDefinition, 
  SagaExecution, 
  SagaStep,
  SagaStatus, 
  SagaStepStatus,
  SagaStepHandler,
  SagaOrchestrator,
  SagaStepResult,
  SagaEvent,
  RetryPolicy
} from '@qa-app/shared';
import { SagaRepository } from './saga.repository';
import { SagaStepRegistry } from './saga-step-registry.service';

@Injectable()
export class SagaOrchestratorService implements SagaOrchestrator, OnModuleInit {
  private readonly logger = new Logger(SagaOrchestratorService.name);
  private readonly executingSagas = new Map<string, Promise<void>>();

  constructor(
    private repository: SagaRepository,
    private stepRegistry: SagaStepRegistry,
    private eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    // 启动时恢复未完成的Saga
    await this.recoverPendingSagas();
    
    // 启动超时监控
    this.startTimeoutMonitoring();
  }

  /**
   * 执行Saga
   */
  async execute(sagaId: string): Promise<void> {
    // 避免重复执行
    if (this.executingSagas.has(sagaId)) {
      this.logger.debug(`Saga ${sagaId} is already executing`);
      return this.executingSagas.get(sagaId)!;
    }

    const execution = this.executeSagaInternal(sagaId);
    this.executingSagas.set(sagaId, execution);

    try {
      await execution;
    } finally {
      this.executingSagas.delete(sagaId);
    }
  }

  private async executeSagaInternal(sagaId: string): Promise<void> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);
    if (!sagaExecution) {
      throw new Error(`Saga execution not found: ${sagaId}`);
    }

    this.logger.log(`Starting Saga execution: ${sagaId}`);
    
    try {
      // 更新Saga状态为运行中
      await this.updateSagaStatus(sagaId, SagaStatus.RUNNING);

      // 获取Saga定义
      const definition = await this.stepRegistry.getSagaDefinition(
        sagaExecution.definitionId,
        sagaExecution.definitionVersion
      );

      if (!definition) {
        throw new Error(`Saga definition not found: ${sagaExecution.definitionId}@${sagaExecution.definitionVersion}`);
      }

      // 执行Saga步骤
      await this.executeSteps(sagaExecution, definition);

      // 标记Saga完成
      await this.updateSagaStatus(sagaId, SagaStatus.COMPLETED);
      await this.emitSagaEvent(sagaId, 'SagaCompleted', { sagaId });

      this.logger.log(`Saga completed successfully: ${sagaId}`);

    } catch (error) {
      this.logger.error(`Saga execution failed: ${sagaId}`, error);
      
      try {
        // 开始补偿流程
        await this.compensate(sagaId);
      } catch (compensationError) {
        this.logger.error(`Saga compensation failed: ${sagaId}`, compensationError);
        await this.updateSagaStatus(sagaId, SagaStatus.FAILED);
        await this.emitSagaEvent(sagaId, 'SagaFailed', { 
          sagaId, 
          error: error.message,
          compensationError: compensationError.message
        });
      }
    }
  }

  /**
   * 执行Saga步骤
   */
  private async executeSteps(
    sagaExecution: SagaExecution, 
    definition: SagaDefinition
  ): Promise<void> {
    const stepsToExecute = this.getExecutableSteps(sagaExecution, definition);

    while (stepsToExecute.length > 0) {
      // 并行执行无依赖的步骤
      const parallelSteps = stepsToExecute.filter(step => 
        this.canExecuteStep(step, sagaExecution)
      );

      if (parallelSteps.length === 0) {
        throw new Error('Deadlock detected: no executable steps found');
      }

      await Promise.all(
        parallelSteps.map(step => 
          this.executeStep(sagaExecution.id, step, sagaExecution.context)
        )
      );

      // 移除已执行的步骤
      stepsToExecute.splice(0, parallelSteps.length);
    }
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(
    sagaId: string, 
    step: SagaStep, 
    context: Record<string, any>
  ): Promise<void> {
    this.logger.debug(`Executing step: ${step.id} in saga: ${sagaId}`);

    try {
      // 更新步骤状态
      await this.updateStepStatus(sagaId, step.id, SagaStepStatus.RUNNING);

      // 获取步骤处理器
      const handler = this.stepRegistry.getStepHandler(step.action);
      if (!handler) {
        throw new Error(`Step handler not found: ${step.action}`);
      }

      // 执行步骤
      const result = await this.executeWithRetry(handler, step, context);

      // 更新步骤状态和结果
      await this.updateStepStatus(sagaId, step.id, SagaStepStatus.COMPLETED, result);
      
      // 更新执行上下文
      context[step.id] = result;

      await this.emitSagaEvent(sagaId, 'StepCompleted', {
        stepId: step.id,
        stepName: step.name,
        result
      });

      this.logger.debug(`Step completed: ${step.id} in saga: ${sagaId}`);

    } catch (error) {
      this.logger.error(`Step failed: ${step.id} in saga: ${sagaId}`, error);
      
      await this.updateStepStatus(sagaId, step.id, SagaStepStatus.FAILED, null, error);
      await this.emitSagaEvent(sagaId, 'StepFailed', {
        stepId: step.id,
        stepName: step.name,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * 带重试的步骤执行
   */
  private async executeWithRetry(
    handler: SagaStepHandler,
    step: SagaStep,
    context: Record<string, any>
  ): Promise<any> {
    const retryPolicy = handler.getRetryPolicy?.() || {
      maxAttempts: step.maxRetries,
      backoffStrategy: 'exponential' as const,
      baseDelay: 1000
    };

    let attempt = 0;
    let lastError: Error;

    while (attempt <= retryPolicy.maxAttempts) {
      try {
        // 验证步骤输入
        if (handler.validate) {
          const isValid = await handler.validate(step.payload);
          if (!isValid) {
            throw new Error('Step validation failed');
          }
        }

        // 执行步骤
        const result = await Promise.race([
          handler.execute(step.payload, context),
          this.createTimeout(step.timeout)
        ]);

        return result;

      } catch (error) {
        lastError = error;
        attempt++;

        if (attempt > retryPolicy.maxAttempts) {
          throw lastError;
        }

        // 计算重试延迟
        const delay = this.calculateRetryDelay(retryPolicy, attempt);
        this.logger.warn(`Step ${step.id} failed, retrying in ${delay}ms (attempt ${attempt}/${retryPolicy.maxAttempts})`);
        
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Saga补偿流程
   */
  async compensate(sagaId: string, fromStep?: string): Promise<void> {
    this.logger.log(`Starting compensation for saga: ${sagaId}`);
    
    const sagaExecution = await this.repository.getSagaExecution(sagaId);
    if (!sagaExecution) {
      throw new Error(`Saga execution not found: ${sagaId}`);
    }

    await this.updateSagaStatus(sagaId, SagaStatus.COMPENSATING);

    const completedSteps = Object.values(sagaExecution.steps)
      .filter(step => step.status === SagaStepStatus.COMPLETED)
      .reverse(); // 按逆序补偿

    for (const step of completedSteps) {
      if (fromStep && step.id !== fromStep) {
        continue;
      }

      await this.compensateStep(sagaId, step, sagaExecution.context);
    }

    await this.updateSagaStatus(sagaId, SagaStatus.COMPENSATED);
    await this.emitSagaEvent(sagaId, 'SagaCompensated', { sagaId });

    this.logger.log(`Saga compensation completed: ${sagaId}`);
  }

  /**
   * 补偿单个步骤
   */
  private async compensateStep(
    sagaId: string,
    step: SagaStep,
    context: Record<string, any>
  ): Promise<void> {
    if (!step.compensation) {
      this.logger.debug(`No compensation needed for step: ${step.id}`);
      return;
    }

    this.logger.debug(`Compensating step: ${step.id} in saga: ${sagaId}`);

    try {
      const handler = this.stepRegistry.getStepHandler(step.action);
      if (!handler?.compensate) {
        throw new Error(`Compensation handler not found: ${step.compensation}`);
      }

      await handler.compensate(step.result, context);
      
      await this.updateStepStatus(sagaId, step.id, SagaStepStatus.COMPENSATED);
      await this.emitSagaEvent(sagaId, 'StepCompensated', {
        stepId: step.id,
        stepName: step.name
      });

      this.logger.debug(`Step compensated: ${step.id} in saga: ${sagaId}`);

    } catch (error) {
      this.logger.error(`Step compensation failed: ${step.id} in saga: ${sagaId}`, error);
      throw error;
    }
  }

  /**
   * 重试步骤
   */
  async retry(sagaId: string, stepId: string): Promise<void> {
    this.logger.log(`Retrying step: ${stepId} in saga: ${sagaId}`);
    
    const sagaExecution = await this.repository.getSagaExecution(sagaId);
    if (!sagaExecution) {
      throw new Error(`Saga execution not found: ${sagaId}`);
    }

    const step = sagaExecution.steps[stepId];
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    if (step.status !== SagaStepStatus.FAILED) {
      throw new Error(`Step is not in failed state: ${stepId}`);
    }

    // 重置步骤状态
    step.retryCount++;
    step.status = SagaStepStatus.PENDING;
    step.error = undefined;

    await this.repository.saveSagaExecution(sagaExecution);

    // 重新执行Saga
    await this.execute(sagaId);
  }

  /**
   * 暂停Saga
   */
  async pause(sagaId: string): Promise<void> {
    // 实现Saga暂停逻辑
    this.logger.log(`Pausing saga: ${sagaId}`);
    // 这里可以设置暂停标志，在步骤执行前检查
  }

  /**
   * 恢复Saga
   */
  async resume(sagaId: string): Promise<void> {
    this.logger.log(`Resuming saga: ${sagaId}`);
    await this.execute(sagaId);
  }

  /**
   * 取消Saga
   */
  async cancel(sagaId: string): Promise<void> {
    this.logger.log(`Cancelling saga: ${sagaId}`);
    await this.compensate(sagaId);
    await this.updateSagaStatus(sagaId, SagaStatus.COMPENSATED);
  }

  /**
   * 获取Saga状态
   */
  async getStatus(sagaId: string): Promise<SagaExecution | null> {
    return await this.repository.getSagaExecution(sagaId);
  }

  /**
   * 辅助方法
   */
  private getExecutableSteps(
    sagaExecution: SagaExecution, 
    definition: SagaDefinition
  ): SagaStep[] {
    return definition.steps.filter(step => 
      !sagaExecution.steps[step.id] || 
      sagaExecution.steps[step.id].status === SagaStepStatus.PENDING
    );
  }

  private canExecuteStep(step: SagaStep, sagaExecution: SagaExecution): boolean {
    if (!step.dependencies) {
      return true;
    }

    return step.dependencies.every(depId => {
      const depStep = sagaExecution.steps[depId];
      return depStep && depStep.status === SagaStepStatus.COMPLETED;
    });
  }

  private async updateSagaStatus(sagaId: string, status: SagaStatus): Promise<void> {
    await this.repository.updateSagaStatus(sagaId, status);
  }

  private async updateStepStatus(
    sagaId: string, 
    stepId: string, 
    status: SagaStepStatus, 
    result?: any, 
    error?: any
  ): Promise<void> {
    await this.repository.updateStepStatus(sagaId, stepId, status, result, error);
  }

  private async emitSagaEvent(
    sagaId: string, 
    eventType: string, 
    eventData: any
  ): Promise<void> {
    const event: SagaEvent = {
      sagaId,
      eventType,
      eventData,
      timestamp: Date.now()
    };

    await this.repository.saveSagaEvent(event);
    this.eventEmitter.emit(`saga.${eventType}`, event);
  }

  private createTimeout(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Step timeout')), timeoutMs);
    });
  }

  private calculateRetryDelay(policy: RetryPolicy, attempt: number): number {
    let delay: number;

    switch (policy.backoffStrategy) {
      case 'fixed':
        delay = policy.baseDelay;
        break;
      case 'linear':
        delay = policy.baseDelay * attempt;
        break;
      case 'exponential':
      default:
        delay = policy.baseDelay * Math.pow(2, attempt - 1);
        break;
    }

    if (policy.maxDelay) {
      delay = Math.min(delay, policy.maxDelay);
    }

    if (policy.jitter) {
      delay += Math.random() * 1000; // 添加最多1秒的随机延迟
    }

    return delay;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 恢复未完成的Saga
   */
  private async recoverPendingSagas(): Promise<void> {
    try {
      const pendingSagas = await this.repository.findPendingSagas();
      this.logger.log(`Recovering ${pendingSagas.length} pending sagas`);

      for (const saga of pendingSagas) {
        this.execute(saga.id).catch(error => {
          this.logger.error(`Failed to recover saga ${saga.id}:`, error);
        });
      }
    } catch (error) {
      this.logger.error('Failed to recover pending sagas:', error);
    }
  }

  /**
   * 启动超时监控
   */
  private startTimeoutMonitoring(): void {
    setInterval(async () => {
      try {
        const timeoutSagas = await this.repository.findTimeoutSagas(300000); // 5分钟超时
        
        for (const saga of timeoutSagas) {
          this.logger.warn(`Saga timeout detected: ${saga.id}`);
          await this.compensate(saga.id);
        }
      } catch (error) {
        this.logger.error('Timeout monitoring error:', error);
      }
    }, 60000); // 每分钟检查一次
  }
}