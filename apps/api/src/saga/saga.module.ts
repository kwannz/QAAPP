import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Core Services
import { SagaOrchestratorService } from './saga-orchestrator.service';
import { SagaRepository } from './saga.repository';
import { SagaStepRegistry } from './saga-step-registry.service';
import { SagaMonitorService } from './saga-monitor.service';

// Step Handlers
import {
  CreateOrderStepHandler,
  ProcessPaymentStepHandler,
  UpdatePositionStepHandler,
  CreateAuditLogStepHandler,
  RiskCheckStepHandler
} from './steps/order-saga-steps.service';

// Controllers
import { SagaController } from './saga.controller';
import { SagaAdminController } from './saga-admin.controller';

// Event Sourcing
import { EventStoreService } from '../event-sourcing/event-store.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 50, // Increased for saga events
      verboseMemoryLeak: true
    }),
    ScheduleModule.forRoot()
  ],
  providers: [
    // Core Services
    SagaOrchestratorService,
    SagaRepository,
    SagaStepRegistry,
    SagaMonitorService,
    
    // Event Sourcing
    EventStoreService,
    
    // Step Handlers
    CreateOrderStepHandler,
    ProcessPaymentStepHandler,
    UpdatePositionStepHandler,
    CreateAuditLogStepHandler,
    RiskCheckStepHandler
  ],
  controllers: [
    SagaController,
    SagaAdminController
  ],
  exports: [
    SagaOrchestratorService,
    SagaRepository,
    SagaStepRegistry,
    SagaMonitorService,
    EventStoreService
  ]
})
export class SagaModule {}