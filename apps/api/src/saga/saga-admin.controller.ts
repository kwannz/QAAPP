import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SagaOrchestratorService } from './saga-orchestrator.service';
import { SagaMonitorService } from './saga-monitor.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('saga-admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin/saga')
export class SagaAdminController {
  constructor(
    private readonly sagaOrchestratorService: SagaOrchestratorService,
    private readonly sagaMonitorService: SagaMonitorService,
  ) {}

  @ApiOperation({ summary: 'Get all running sagas' })
  @ApiResponse({ status: 200, description: 'List of running sagas' })
  @Get('running')
  async getRunningSagas() {
    // TODO: Implement saga monitoring
    return { sagas: [], message: 'Saga monitoring not implemented yet' };
  }

  @ApiOperation({ summary: 'Get saga details' })
  @ApiResponse({ status: 200, description: 'Saga details' })
  @Get(':id')
  async getSagaDetails(@Param('id') id: string) {
    // TODO: Implement saga details retrieval
    return { id, message: 'Saga details not implemented yet' };
  }

  @ApiOperation({ summary: 'Cancel a saga' })
  @ApiResponse({ status: 200, description: 'Saga cancelled' })
  @Post(':id/cancel')
  async cancelSaga(@Param('id') id: string) {
    // TODO: Implement saga cancellation
    return { id, message: 'Saga cancellation not implemented yet' };
  }
}