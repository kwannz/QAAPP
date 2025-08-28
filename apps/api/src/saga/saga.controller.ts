import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Param, 
  Body, 
  Query, 
  HttpStatus,
  HttpException,
  UseGuards,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { 
  SagaExecution, 
  SagaStatus,
  SagaDefinition 
} from '@qa-app/shared';
import { SagaOrchestratorService } from './saga-orchestrator.service';
import { SagaRepository } from './saga.repository';
import { SagaStepRegistry } from './saga-step-registry.service';

export class CreateSagaDto {
  definitionId: string;
  definitionVersion?: string;
  context: Record<string, any>;
  metadata?: Record<string, any>;
}

export class RetryStepDto {
  stepId: string;
  reason?: string;
}

@ApiTags('Saga')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('saga')
export class SagaController {
  private readonly logger = new Logger(SagaController.name);

  constructor(
    private orchestrator: SagaOrchestratorService,
    private repository: SagaRepository,
    private stepRegistry: SagaStepRegistry
  ) {}

  /**
   * 创建并执行新的Saga
   */
  @Post()
  @ApiOperation({ summary: 'Create and execute a new saga' })
  @ApiResponse({ status: 201, description: 'Saga created and started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid saga definition or context' })
  @Roles('user', 'trader', 'admin')
  async createSaga(
    @Body() createSagaDto: CreateSagaDto,
    @CurrentUser() user: any
  ): Promise<{ sagaId: string; status: string }> {
    try {
      this.logger.log(`Creating saga ${createSagaDto.definitionId} for user ${user.id}`);

      // 验证Saga定义
      const definition = await this.stepRegistry.getSagaDefinition(
        createSagaDto.definitionId,
        createSagaDto.definitionVersion || 'latest'
      );

      if (!definition) {
        throw new HttpException(
          `Saga definition not found: ${createSagaDto.definitionId}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 创建Saga执行实例
      const sagaExecution: SagaExecution = {
        id: this.generateSagaId(),
        definitionId: definition.id,
        definitionVersion: definition.version,
        status: SagaStatus.CREATED,
        context: {
          ...createSagaDto.context,
          userId: user.id,
          createdBy: user.id,
          createdAt: new Date()
        },
        steps: {},
        startedAt: new Date(),
        metadata: createSagaDto.metadata
      };

      // 保存Saga执行记录
      await this.repository.saveSagaExecution(sagaExecution);

      // 异步执行Saga
      this.orchestrator.execute(sagaExecution.id).catch(error => {
        this.logger.error(`Saga execution failed: ${sagaExecution.id}`, error);
      });

      return {
        sagaId: sagaExecution.id,
        status: SagaStatus.RUNNING
      };

    } catch (error) {
      this.logger.error('Failed to create saga:', error);
      throw new HttpException(
        error.message || 'Failed to create saga',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取Saga执行状态
   */
  @Get(':sagaId')
  @ApiOperation({ summary: 'Get saga execution status' })
  @ApiResponse({ status: 200, description: 'Saga status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Saga not found' })
  @Roles('user', 'trader', 'admin')
  async getSagaStatus(
    @Param('sagaId') sagaId: string,
    @CurrentUser() user: any
  ): Promise<SagaExecution> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);

    if (!sagaExecution) {
      throw new HttpException('Saga not found', HttpStatus.NOT_FOUND);
    }

    // 权限检查：用户只能查看自己的Saga
    if (sagaExecution.context.userId !== user.id && !user.roles.includes('admin')) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return sagaExecution;
  }

  /**
   * 获取用户的Saga列表
   */
  @Get()
  @ApiOperation({ summary: 'Get user saga list' })
  @ApiResponse({ status: 200, description: 'Saga list retrieved successfully' })
  @Roles('user', 'trader', 'admin')
  async getUserSagas(
    @Query('status') status?: SagaStatus,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20,
    @CurrentUser() user: any
  ): Promise<{
    sagas: SagaExecution[];
    total: number;
    page: number;
    size: number;
  }> {
    const sagas = await this.repository.findUserSagas(
      user.id,
      status,
      (page - 1) * size,
      size
    );

    const total = await this.repository.countUserSagas(user.id, status);

    return {
      sagas,
      total,
      page,
      size
    };
  }

  /**
   * 重试失败的Saga步骤
   */
  @Put(':sagaId/retry')
  @ApiOperation({ summary: 'Retry failed saga step' })
  @ApiResponse({ status: 200, description: 'Step retry initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid retry request' })
  @Roles('user', 'trader', 'admin')
  async retryStep(
    @Param('sagaId') sagaId: string,
    @Body() retryDto: RetryStepDto,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);

    if (!sagaExecution) {
      throw new HttpException('Saga not found', HttpStatus.NOT_FOUND);
    }

    // 权限检查
    if (sagaExecution.context.userId !== user.id && !user.roles.includes('admin')) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    // 验证步骤状态
    const step = sagaExecution.steps[retryDto.stepId];
    if (!step) {
      throw new HttpException('Step not found', HttpStatus.BAD_REQUEST);
    }

    if (step.status !== SagaStepStatus.FAILED) {
      throw new HttpException(
        'Only failed steps can be retried',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await this.orchestrator.retry(sagaId, retryDto.stepId);
      
      this.logger.log(
        `Step retry initiated: ${retryDto.stepId} in saga ${sagaId} by user ${user.id}`,
        { reason: retryDto.reason }
      );

      return { message: 'Step retry initiated successfully' };

    } catch (error) {
      this.logger.error(`Failed to retry step ${retryDto.stepId}:`, error);
      throw new HttpException(
        'Failed to retry step',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 暂停Saga执行
   */
  @Put(':sagaId/pause')
  @ApiOperation({ summary: 'Pause saga execution' })
  @ApiResponse({ status: 200, description: 'Saga paused successfully' })
  @Roles('user', 'trader', 'admin')
  async pauseSaga(
    @Param('sagaId') sagaId: string,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);

    if (!sagaExecution) {
      throw new HttpException('Saga not found', HttpStatus.NOT_FOUND);
    }

    // 权限检查
    if (sagaExecution.context.userId !== user.id && !user.roles.includes('admin')) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    if (sagaExecution.status !== SagaStatus.RUNNING) {
      throw new HttpException(
        'Only running sagas can be paused',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await this.orchestrator.pause(sagaId);
      this.logger.log(`Saga paused: ${sagaId} by user ${user.id}`);
      
      return { message: 'Saga paused successfully' };

    } catch (error) {
      this.logger.error(`Failed to pause saga ${sagaId}:`, error);
      throw new HttpException(
        'Failed to pause saga',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 恢复Saga执行
   */
  @Put(':sagaId/resume')
  @ApiOperation({ summary: 'Resume saga execution' })
  @ApiResponse({ status: 200, description: 'Saga resumed successfully' })
  @Roles('user', 'trader', 'admin')
  async resumeSaga(
    @Param('sagaId') sagaId: string,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);

    if (!sagaExecution) {
      throw new HttpException('Saga not found', HttpStatus.NOT_FOUND);
    }

    // 权限检查
    if (sagaExecution.context.userId !== user.id && !user.roles.includes('admin')) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    try {
      await this.orchestrator.resume(sagaId);
      this.logger.log(`Saga resumed: ${sagaId} by user ${user.id}`);
      
      return { message: 'Saga resumed successfully' };

    } catch (error) {
      this.logger.error(`Failed to resume saga ${sagaId}:`, error);
      throw new HttpException(
        'Failed to resume saga',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 取消Saga执行
   */
  @Put(':sagaId/cancel')
  @ApiOperation({ summary: 'Cancel saga execution' })
  @ApiResponse({ status: 200, description: 'Saga cancelled successfully' })
  @Roles('user', 'trader', 'admin')
  async cancelSaga(
    @Param('sagaId') sagaId: string,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);

    if (!sagaExecution) {
      throw new HttpException('Saga not found', HttpStatus.NOT_FOUND);
    }

    // 权限检查
    if (sagaExecution.context.userId !== user.id && !user.roles.includes('admin')) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    if (sagaExecution.status === SagaStatus.COMPLETED || 
        sagaExecution.status === SagaStatus.COMPENSATED) {
      throw new HttpException(
        'Cannot cancel completed or compensated saga',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await this.orchestrator.cancel(sagaId);
      this.logger.log(`Saga cancelled: ${sagaId} by user ${user.id}`);
      
      return { message: 'Saga cancelled successfully' };

    } catch (error) {
      this.logger.error(`Failed to cancel saga ${sagaId}:`, error);
      throw new HttpException(
        'Failed to cancel saga',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取可用的Saga定义
   */
  @Get('definitions/list')
  @ApiOperation({ summary: 'Get available saga definitions' })
  @ApiResponse({ status: 200, description: 'Saga definitions retrieved successfully' })
  @Roles('user', 'trader', 'admin')
  async getSagaDefinitions(): Promise<SagaDefinition[]> {
    return await this.stepRegistry.getAllSagaDefinitions();
  }

  /**
   * 获取Saga事件历史
   */
  @Get(':sagaId/events')
  @ApiOperation({ summary: 'Get saga event history' })
  @ApiResponse({ status: 200, description: 'Saga events retrieved successfully' })
  @Roles('user', 'trader', 'admin')
  async getSagaEvents(
    @Param('sagaId') sagaId: string,
    @CurrentUser() user: any
  ): Promise<any[]> {
    const sagaExecution = await this.repository.getSagaExecution(sagaId);

    if (!sagaExecution) {
      throw new HttpException('Saga not found', HttpStatus.NOT_FOUND);
    }

    // 权限检查
    if (sagaExecution.context.userId !== user.id && !user.roles.includes('admin')) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return await this.repository.getSagaEvents(sagaId);
  }

  /**
   * 私有辅助方法
   */
  private generateSagaId(): string {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}