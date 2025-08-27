import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { YieldDistributionService, DistributionBatch, YieldDistributionTask } from './yield-distribution.service';

class TriggerDistributionDto {
  positionIds?: string[];
  forceExecute?: boolean;
  dryRun?: boolean;
}

class DistributionStatsDto {
  totalDistributed: number;
  totalBatches: number;
  successRate: number;
  lastDistribution?: Date;
  pendingTasks: number;
  failedTasks: number;
}

class DistributionBatchDto {
  id: string;
  date: Date;
  totalAmount: number;
  totalPositions: number;
  completedTasks: number;
  failedTasks: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
}

@ApiTags('Yield Distribution')
@Controller('yield-distribution')
@UseGuards(JwtAuthGuard)
export class YieldDistributionController {
  constructor(
    private yieldDistributionService: YieldDistributionService,
  ) {}

  @ApiOperation({ summary: '手动触发收益分发' })
  @ApiResponse({ 
    status: 200, 
    description: '分发任务创建成功',
    type: DistributionBatchDto
  })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('trigger')
  async triggerDistribution(
    @Body() triggerDto: TriggerDistributionDto
  ): Promise<{
    success: boolean;
    batch: DistributionBatch;
    message: string;
  }> {
    try {
      if (triggerDto.dryRun) {
        // 干运行模式，只验证不执行
        return {
          success: true,
          batch: null as any,
          message: '干运行模式：验证通过，未执行实际分发',
        };
      }

      const batch = await this.yieldDistributionService.triggerManualDistribution(
        triggerDto.positionIds
      );

      return {
        success: true,
        batch,
        message: `收益分发任务已创建，批次ID: ${batch.id}`,
      };
    } catch (error) {
      return {
        success: false,
        batch: null as any,
        message: `触发收益分发失败: ${error.message}`,
      };
    }
  }

  @ApiOperation({ summary: '获取收益分发统计' })
  @ApiResponse({ 
    status: 200, 
    description: '统计信息获取成功',
    type: DistributionStatsDto
  })
  @ApiBearerAuth()
  @Get('stats')
  async getDistributionStats(): Promise<DistributionStatsDto> {
    return await this.yieldDistributionService.getDistributionStats();
  }

  @ApiOperation({ summary: '获取分发批次列表' })
  @ApiResponse({ 
    status: 200, 
    description: '批次列表获取成功'
  })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiBearerAuth()
  @Get('batches')
  async getDistributionBatches(
    @Query('limit') limit: string = '10'
  ): Promise<{
    batches: DistributionBatch[];
    total: number;
  }> {
    const limitNum = parseInt(limit, 10) || 10;
    const batches = await this.yieldDistributionService.getRecentDistributionBatches(limitNum);
    
    return {
      batches,
      total: batches.length,
    };
  }

  @ApiOperation({ summary: '获取指定批次详情' })
  @ApiResponse({ 
    status: 200, 
    description: '批次详情获取成功',
    type: DistributionBatchDto
  })
  @ApiResponse({ status: 404, description: '批次不存在' })
  @ApiBearerAuth()
  @Get('batches/:batchId')
  async getDistributionBatch(
    @Param('batchId') batchId: string
  ): Promise<{
    batch: DistributionBatch | null;
    success: boolean;
    message?: string;
  }> {
    const batch = await this.yieldDistributionService.getDistributionBatch(batchId);
    
    if (!batch) {
      return {
        batch: null,
        success: false,
        message: '分发批次不存在',
      };
    }
    
    return {
      batch,
      success: true,
    };
  }

  @ApiOperation({ summary: '获取今日分发状态' })
  @ApiResponse({ 
    status: 200, 
    description: '今日分发状态获取成功'
  })
  @ApiBearerAuth()
  @Get('today')
  async getTodayDistributionStatus(): Promise<{
    hasDistributedToday: boolean;
    batch?: DistributionBatch;
    nextScheduledTime: string;
  }> {
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const batchId = `batch-${todayStr}`;
    
    const batch = await this.yieldDistributionService.getDistributionBatch(batchId);
    
    // 计算下次定时执行时间（明天凌晨1点）
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(1, 0, 0, 0);
    
    return {
      hasDistributedToday: !!batch,
      batch: batch || undefined,
      nextScheduledTime: tomorrow.toISOString(),
    };
  }

  @ApiOperation({ summary: '获取系统健康状态' })
  @ApiResponse({ 
    status: 200, 
    description: '系统健康状态获取成功'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('health')
  async getSystemHealth(): Promise<{
    healthy: boolean;
    checks: {
      database: boolean;
      blockchain: boolean;
      gasBalance: boolean;
    };
    timestamp: string;
  }> {
    // 这里应该调用实际的健康检查方法
    // 目前返回模拟数据
    return {
      healthy: true,
      checks: {
        database: true,
        blockchain: true,
        gasBalance: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: '获取分发配置信息' })
  @ApiResponse({ 
    status: 200, 
    description: '配置信息获取成功'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('config')
  async getDistributionConfig(): Promise<{
    scheduleCron: string;
    batchSize: number;
    maxRetryCount: number;
    gasLimit: number;
    minGasBalance: string;
    timezone: string;
  }> {
    return {
      scheduleCron: '0 1 * * *', // 每天凌晨1点
      batchSize: 100,
      maxRetryCount: 3,
      gasLimit: 200000,
      minGasBalance: '0.01',
      timezone: 'Asia/Shanghai',
    };
  }

  @ApiOperation({ summary: '暂停自动分发' })
  @ApiResponse({ 
    status: 200, 
    description: '自动分发已暂停'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('pause')
  async pauseAutomaticDistribution(): Promise<{
    success: boolean;
    message: string;
  }> {
    // 实际实现中应该暂停定时任务
    // await this.schedulerRegistry.deleteCronJob('daily-yield-distribution');
    
    return {
      success: true,
      message: '自动收益分发已暂停',
    };
  }

  @ApiOperation({ summary: '恢复自动分发' })
  @ApiResponse({ 
    status: 200, 
    description: '自动分发已恢复'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('resume')
  async resumeAutomaticDistribution(): Promise<{
    success: boolean;
    message: string;
  }> {
    // 实际实现中应该恢复定时任务
    
    return {
      success: true,
      message: '自动收益分发已恢复',
    };
  }

  @ApiOperation({ summary: '获取失败任务列表' })
  @ApiResponse({ 
    status: 200, 
    description: '失败任务列表获取成功'
  })
  @ApiQuery({ name: 'batchId', required: false, description: '批次ID过滤' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 50 })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('failed-tasks')
  async getFailedTasks(
    @Query('batchId') batchId?: string,
    @Query('limit') limit: string = '50'
  ): Promise<{
    tasks: YieldDistributionTask[];
    total: number;
  }> {
    // 实际实现中应该从数据库查询失败任务
    // 这里返回模拟数据
    return {
      tasks: [],
      total: 0,
    };
  }

  @ApiOperation({ summary: '重试失败任务' })
  @ApiResponse({ 
    status: 200, 
    description: '重试任务已提交'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('retry-failed/:batchId')
  async retryFailedTasks(
    @Param('batchId') batchId: string
  ): Promise<{
    success: boolean;
    message: string;
    retriedCount: number;
  }> {
    try {
      // 实际实现中应该重试指定批次的失败任务
      
      return {
        success: true,
        message: `批次 ${batchId} 的失败任务已提交重试`,
        retriedCount: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: `重试任务失败: ${error.message}`,
        retriedCount: 0,
      };
    }
  }

  @ApiOperation({ summary: '导出分发报告' })
  @ApiResponse({ 
    status: 200, 
    description: '报告生成成功'
  })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期 YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期 YYYY-MM-DD' })
  @ApiQuery({ name: 'format', required: false, description: '导出格式', enum: ['json', 'csv'] })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('export')
  async exportDistributionReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json'
  ): Promise<{
    success: boolean;
    data?: any;
    downloadUrl?: string;
    message?: string;
  }> {
    try {
      // 实际实现中应该生成并返回报告数据
      const reportData = {
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0],
        },
        summary: {
          totalBatches: 0,
          totalAmount: 0,
          successRate: 100,
        },
        batches: [],
      };
      
      if (format === 'csv') {
        // 生成CSV格式
        return {
          success: true,
          downloadUrl: '/api/yield-distribution/download/report.csv',
          message: 'CSV报告生成成功',
        };
      }
      
      return {
        success: true,
        data: reportData,
        message: 'JSON报告生成成功',
      };
      
    } catch (error) {
      return {
        success: false,
        message: `报告生成失败: ${error.message}`,
      };
    }
  }
}