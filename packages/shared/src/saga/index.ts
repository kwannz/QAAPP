// Saga模式相关类型
export interface SagaStep {
  name: string;
  execute: () => Promise<any>;
  compensate?: () => Promise<void>;
}

export interface SagaOptions {
  timeout?: number;
  retries?: number;
}