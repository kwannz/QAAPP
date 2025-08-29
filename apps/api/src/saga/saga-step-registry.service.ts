import { Injectable, Logger } from '@nestjs/common';

export interface SagaStepHandler {
  execute(data: any): Promise<any>;
  compensate?(data: any): Promise<any>;
}

@Injectable()
export class SagaStepRegistry {
  private readonly logger = new Logger(SagaStepRegistry.name);
  private handlers: Map<string, SagaStepHandler> = new Map();

  registerHandler(stepName: string, handler: SagaStepHandler): void {
    this.handlers.set(stepName, handler);
    this.logger.log(`Registered saga step handler: ${stepName}`);
  }

  getHandler(stepName: string): SagaStepHandler | undefined {
    return this.handlers.get(stepName);
  }

  getAllHandlers(): Map<string, SagaStepHandler> {
    return new Map(this.handlers);
  }
}