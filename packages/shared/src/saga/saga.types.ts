export enum SagaStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATED = 'COMPENSATED'
}

export enum SagaStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED'
}

export enum SagaStepType {
  ACTION = 'ACTION',
  COMPENSATION = 'COMPENSATION'
}

export interface SagaStep {
  id: string;
  name: string;
  type: SagaStepType;
  status: SagaStepStatus;
  action: string; // 操作名称
  compensation?: string; // 补偿操作名称
  payload: any;
  result?: any;
  error?: any;
  retryCount: number;
  maxRetries: number;
  timeout: number; // 超时时间（毫秒）
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  nextSteps?: string[]; // 后续步骤ID
  dependencies?: string[]; // 依赖步骤ID
}

export interface SagaDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  steps: SagaStep[];
  metadata?: Record<string, any>;
  timeout?: number; // 整个Saga超时时间
  retryPolicy?: RetryPolicy;
  compensationPolicy?: CompensationPolicy;
}

export interface SagaExecution {
  id: string;
  definitionId: string;
  definitionVersion: string;
  status: SagaStatus;
  currentStep?: string;
  context: Record<string, any>; // 执行上下文
  steps: Record<string, SagaStep>; // 步骤执行状态
  startedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  compensatedAt?: Date;
  error?: any;
  metadata?: Record<string, any>;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  baseDelay: number; // 毫秒
  maxDelay?: number;
  jitter?: boolean; // 随机延迟
}

export interface CompensationPolicy {
  strategy: 'immediate' | 'delayed' | 'manual';
  timeout?: number;
  parallelCompensation?: boolean;
  compensationOrder?: 'reverse' | 'forward' | 'custom';
}

export interface SagaStepResult {
  success: boolean;
  data?: any;
  error?: any;
  shouldRetry?: boolean;
  compensationRequired?: boolean;
}

export interface SagaCommand {
  sagaId: string;
  stepId: string;
  command: string;
  payload: any;
  timestamp: number;
  correlationId?: string;
}

export interface SagaEvent {
  sagaId: string;
  stepId?: string;
  eventType: string;
  eventData: any;
  timestamp: number;
  correlationId?: string;
  causedBy?: string; // 触发事件的原因
}

// 业务领域特定的事件类型
export interface OrderSagaEvents {
  OrderCreated: {
    orderId: string;
    userId: number;
    positionId: string;
    amount: number;
    price: number;
  };
  PaymentProcessed: {
    paymentId: string;
    orderId: string;
    amount: number;
  };
  PositionUpdated: {
    positionId: string;
    orderId: string;
    newQuantity: number;
  };
  AuditLogCreated: {
    auditId: string;
    entityType: string;
    entityId: string;
    action: string;
  };
  // 补偿事件
  OrderCancelled: {
    orderId: string;
    reason: string;
  };
  PaymentRefunded: {
    paymentId: string;
    refundId: string;
    amount: number;
  };
  PositionReverted: {
    positionId: string;
    previousQuantity: number;
  };
}

export interface SagaStepHandler<TPayload = any, TResult = any> {
  execute(payload: TPayload, context: Record<string, any>): Promise<TResult>;
  compensate?(payload: TPayload, context: Record<string, any>): Promise<void>;
  validate?(payload: TPayload): Promise<boolean>;
  getTimeout?(): number;
  getRetryPolicy?(): RetryPolicy;
}

export interface SagaOrchestrator {
  execute(sagaId: string): Promise<void>;
  compensate(sagaId: string, fromStep?: string): Promise<void>;
  retry(sagaId: string, stepId: string): Promise<void>;
  pause(sagaId: string): Promise<void>;
  resume(sagaId: string): Promise<void>;
  cancel(sagaId: string): Promise<void>;
  getStatus(sagaId: string): Promise<SagaExecution | null>;
}

export interface SagaRepository {
  saveSagaExecution(execution: SagaExecution): Promise<void>;
  getSagaExecution(sagaId: string): Promise<SagaExecution | null>;
  updateSagaStatus(sagaId: string, status: SagaStatus): Promise<void>;
  updateStepStatus(sagaId: string, stepId: string, status: SagaStepStatus, result?: any, error?: any): Promise<void>;
  findPendingSagas(): Promise<SagaExecution[]>;
  findTimeoutSagas(timeoutMs: number): Promise<SagaExecution[]>;
  saveSagaEvent(event: SagaEvent): Promise<void>;
  getSagaEvents(sagaId: string): Promise<SagaEvent[]>;
}