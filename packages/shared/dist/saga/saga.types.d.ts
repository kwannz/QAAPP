export declare enum SagaStepStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    COMPENSATED = "COMPENSATED"
}
export declare enum SagaStatus {
    CREATED = "CREATED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    COMPENSATING = "COMPENSATING",
    COMPENSATED = "COMPENSATED"
}
export declare enum SagaStepType {
    ACTION = "ACTION",
    COMPENSATION = "COMPENSATION"
}
export interface SagaStep {
    id: string;
    name: string;
    type: SagaStepType;
    status: SagaStepStatus;
    action: string;
    compensation?: string;
    payload: unknown;
    result?: unknown;
    error?: unknown;
    retryCount: number;
    maxRetries: number;
    timeout: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    nextSteps?: string[];
    dependencies?: string[];
}
export interface SagaDefinition {
    id: string;
    name: string;
    version: string;
    description?: string;
    steps: SagaStep[];
    metadata?: Record<string, unknown>;
    timeout?: number;
    retryPolicy?: RetryPolicy;
    compensationPolicy?: CompensationPolicy;
}
export interface SagaExecution {
    id: string;
    definitionId: string;
    definitionVersion: string;
    status: SagaStatus;
    currentStep?: string;
    context: Record<string, unknown>;
    steps: Record<string, SagaStep>;
    startedAt: Date;
    completedAt?: Date;
    failedAt?: Date;
    compensatedAt?: Date;
    error?: unknown;
    metadata?: Record<string, unknown>;
}
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    baseDelay: number;
    maxDelay?: number;
    jitter?: boolean;
}
export interface CompensationPolicy {
    strategy: 'immediate' | 'delayed' | 'manual';
    timeout?: number;
    parallelCompensation?: boolean;
    compensationOrder?: 'reverse' | 'forward' | 'custom';
}
export interface SagaStepResult {
    success: boolean;
    data?: unknown;
    error?: unknown;
    shouldRetry?: boolean;
    compensationRequired?: boolean;
}
export interface SagaCommand {
    sagaId: string;
    stepId: string;
    command: string;
    payload: unknown;
    timestamp: number;
    correlationId?: string;
}
export interface SagaEvent {
    sagaId: string;
    stepId?: string;
    eventType: string;
    eventData: unknown;
    timestamp: number;
    correlationId?: string;
    causedBy?: string;
}
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
export interface SagaStepHandler<TPayload = unknown, TResult = unknown> {
    execute(payload: TPayload, context: Record<string, unknown>): Promise<TResult>;
    compensate?(payload: TPayload, context: Record<string, unknown>): Promise<void>;
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
    updateStepStatus(sagaId: string, stepId: string, status: SagaStepStatus, result?: unknown, error?: unknown): Promise<void>;
    findPendingSagas(): Promise<SagaExecution[]>;
    findTimeoutSagas(timeoutMs: number): Promise<SagaExecution[]>;
    saveSagaEvent(event: SagaEvent): Promise<void>;
    getSagaEvents(sagaId: string): Promise<SagaEvent[]>;
}
