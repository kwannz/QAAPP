import { Injectable } from '@nestjs/common';

export interface SagaInstance {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: string[];
  currentStep?: number;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SagaRepository {
  private sagas: Map<string, SagaInstance> = new Map();

  async findById(id: string): Promise<SagaInstance | null> {
    return this.sagas.get(id) || null;
  }

  async save(saga: SagaInstance): Promise<void> {
    this.sagas.set(saga.id, { ...saga, updatedAt: new Date() });
  }

  async findByStatus(status: SagaInstance['status']): Promise<SagaInstance[]> {
    return Array.from(this.sagas.values()).filter(saga => saga.status === status);
  }
}