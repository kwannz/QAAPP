import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { WithdrawalsService, CreateWithdrawalDto, UpdateWithdrawalDto, WithdrawalQueryDto } from './withdrawals.service';
import { WithdrawalStatus, WithdrawalType } from '@qa-app/database';

// DTO定义
class CreateWithdrawalRequestDto {
  amount: number;
  withdrawalType: WithdrawalType;
  walletAddress: string;
  chainId: number;
}

class UpdateWithdrawalRequestDto {
  status?: WithdrawalStatus;
  reviewNotes?: string;
  rejectionReason?: string;
}

class BatchUpdateWithdrawalsDto {
  ids: string[];
  updateData: UpdateWithdrawalRequestDto;
}

class WithdrawalResponseDto {
  id: string;
  userId: string;
  amount: number;
  withdrawalType: WithdrawalType;
  status: WithdrawalStatus;
  walletAddress: string;
  chainId: number;
  platformFee: number;
  actualAmount: number;
  riskScore: number;
  riskLevel: string;
  autoApproved: boolean;
  createdAt: string;
  requestedAt: string;
  user: {
    id: string;
    email: string;
    referralCode: string;
    kycStatus: string;
  };
}

class WithdrawalsListResponseDto {
  withdrawals: WithdrawalResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class WithdrawalStatsResponseDto {
  total: number;
  byStatus: {
    pending: number;
    completed: number;
    rejected: number;
  };
  totalCompletedAmount: number;
  riskLevelDistribution: Record<string, number>;
  recent24h: number;
}

@ApiTags('Withdrawals')
@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  @ApiOperation({ summary: '创建提现申请' })
  @ApiResponse({
    status: 201,
    description: '提现申请创建成功',
    type: WithdrawalResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误或余额不足' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createWithdrawal(
    @Body() createDto: CreateWithdrawalRequestDto,
    @Req() req: any,
  ): Promise<WithdrawalResponseDto> {
    try {
      const userId = req.user.id; // 从JWT token获取用户ID
      
      const withdrawal = await this.withdrawalsService.createWithdrawal(
        {
          ...createDto,
          userId,
        },
        userId, // actorId
      );

      return this.formatWithdrawalResponse(withdrawal);
    } catch (error) {
      console.error('Failed to create withdrawal:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`创建提现申请失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '获取提现申请列表' })
  @ApiResponse({
    status: 200,
    description: '提现申请列表获取成功',
    type: WithdrawalsListResponseDto,
  })
  @ApiQuery({ name: 'status', required: false, enum: WithdrawalStatus })
  @ApiQuery({ name: 'riskLevel', required: false, description: '风险等级' })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  async getWithdrawals(
    @Query() query: WithdrawalQueryDto,
    @Req() req: any,
  ): Promise<WithdrawalsListResponseDto> {
    try {
      // 非管理员只能查看自己的提现记录
      if (!req.user.roles?.includes('ADMIN')) {
        query.userId = req.user.id;
      }

      const result = await this.withdrawalsService.getWithdrawals(query);
      
      return {
        withdrawals: result.withdrawals.map(w => this.formatWithdrawalResponse(w)),
        pagination: result.pagination,
      };
    } catch (error) {
      console.error('Failed to get withdrawals:', error);
      throw new BadRequestException(`获取提现记录失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '获取单个提现申请详情' })
  @ApiResponse({
    status: 200,
    description: '提现申请详情获取成功',
    type: WithdrawalResponseDto,
  })
  @ApiResponse({ status: 404, description: '提现申请不存在' })
  @Get(':id')
  async getWithdrawalById(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<WithdrawalResponseDto> {
    try {
      const withdrawal = await this.withdrawalsService.getWithdrawalById(id);

      // 非管理员只能查看自己的提现记录
      if (!req.user.roles?.includes('ADMIN') && withdrawal.userId !== req.user.id) {
        throw new NotFoundException('提现记录不存在');
      }

      return this.formatWithdrawalResponse(withdrawal);
    } catch (error) {
      console.error(`Failed to get withdrawal ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`获取提现详情失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '更新提现申请状态（管理员）' })
  @ApiResponse({
    status: 200,
    description: '提现申请状态更新成功',
    type: WithdrawalResponseDto,
  })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '提现申请不存在' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async updateWithdrawal(
    @Param('id') id: string,
    @Body() updateDto: UpdateWithdrawalRequestDto,
    @Req() req: any,
  ): Promise<WithdrawalResponseDto> {
    try {
      const withdrawal = await this.withdrawalsService.updateWithdrawal(
        id,
        updateDto,
        req.user.id,
      );

      return this.formatWithdrawalResponse(withdrawal);
    } catch (error) {
      console.error(`Failed to update withdrawal ${id}:`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`更新提现状态失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '批量更新提现申请（管理员）' })
  @ApiResponse({
    status: 200,
    description: '批量更新成功',
    schema: {
      properties: {
        updated: { type: 'number', description: '成功更新数量' },
        failed: { type: 'array', items: { type: 'string' }, description: '失败的ID列表' },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put('batch/update')
  async batchUpdateWithdrawals(
    @Body() batchDto: BatchUpdateWithdrawalsDto,
    @Req() req: any,
  ): Promise<{ updated: number; failed: string[] }> {
    try {
      const { ids, updateData } = batchDto;

      if (!ids || ids.length === 0) {
        throw new BadRequestException('请提供要更新的提现申请ID列表');
      }

      if (ids.length > 100) {
        throw new BadRequestException('批量操作最多支持100条记录');
      }

      return await this.withdrawalsService.batchUpdateWithdrawals(
        ids,
        updateData,
        req.user.id,
      );
    } catch (error) {
      console.error('Failed to batch update withdrawals:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`批量更新失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '获取提现统计信息（管理员）' })
  @ApiResponse({
    status: 200,
    description: '提现统计信息获取成功',
    type: WithdrawalStatsResponseDto,
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  async getWithdrawalStats(): Promise<WithdrawalStatsResponseDto> {
    try {
      return await this.withdrawalsService.getWithdrawalStats();
    } catch (error) {
      console.error('Failed to get withdrawal stats:', error);
      throw new BadRequestException(`获取统计信息失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '获取用户提现历史' })
  @ApiResponse({
    status: 200,
    description: '用户提现历史获取成功',
    type: WithdrawalsListResponseDto,
  })
  @Get('user/:userId/history')
  async getUserWithdrawalHistory(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ): Promise<WithdrawalsListResponseDto> {
    try {
      // 非管理员只能查看自己的记录
      if (!req.user.roles?.includes('ADMIN') && userId !== req.user.id) {
        throw new NotFoundException('用户不存在');
      }

      const query: WithdrawalQueryDto = {
        userId,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const result = await this.withdrawalsService.getWithdrawals(query);

      return {
        withdrawals: result.withdrawals.map(w => this.formatWithdrawalResponse(w)),
        pagination: result.pagination,
      };
    } catch (error) {
      console.error(`Failed to get withdrawal history for user ${userId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`获取提现历史失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '取消提现申请' })
  @ApiResponse({
    status: 200,
    description: '提现申请取消成功',
    type: WithdrawalResponseDto,
  })
  @ApiResponse({ status: 400, description: '无法取消此提现申请' })
  @Put(':id/cancel')
  async cancelWithdrawal(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<WithdrawalResponseDto> {
    try {
      const withdrawal = await this.withdrawalsService.getWithdrawalById(id);

      // 用户只能取消自己的提现，且状态必须是PENDING或REVIEWING
      if (withdrawal.userId !== req.user.id) {
        throw new BadRequestException('无权限取消此提现申请');
      }

      if (!['PENDING', 'REVIEWING'].includes(withdrawal.status)) {
        throw new BadRequestException('当前状态下无法取消提现申请');
      }

      const canceledWithdrawal = await this.withdrawalsService.updateWithdrawal(
        id,
        { status: WithdrawalStatus.CANCELED },
        req.user.id,
      );

      return this.formatWithdrawalResponse(canceledWithdrawal);
    } catch (error) {
      console.error(`Failed to cancel withdrawal ${id}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`取消提现失败: ${error.message}`);
    }
  }

  private formatWithdrawalResponse(withdrawal: any): WithdrawalResponseDto {
    return {
      id: withdrawal.id,
      userId: withdrawal.userId,
      amount: Number(withdrawal.amount),
      withdrawalType: withdrawal.withdrawalType,
      status: withdrawal.status,
      walletAddress: withdrawal.walletAddress,
      chainId: withdrawal.chainId,
      platformFee: Number(withdrawal.platformFee),
      actualAmount: Number(withdrawal.actualAmount),
      riskScore: withdrawal.riskScore,
      riskLevel: withdrawal.riskLevel,
      autoApproved: withdrawal.autoApproved,
      createdAt: withdrawal.createdAt.toISOString(),
      requestedAt: withdrawal.requestedAt.toISOString(),
      user: withdrawal.user,
    };
  }
}