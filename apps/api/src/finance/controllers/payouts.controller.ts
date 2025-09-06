import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PayoutsService } from '../services/payouts.service';
import { PositionsService } from '../services/positions.service';
import { Deprecated } from '../../common/decorators/deprecated.decorator';

// DTO定义
class ClaimPayoutsDto {
  userId: string;
  payoutIds: string[];
}

class PayoutDto {
  id: string;
  userId: string;
  positionId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  isClaimable: boolean;
  claimedAt?: string;
  claimTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

class ClaimablePayoutsResponseDto {
  payouts: PayoutDto[];
  totalAmount: number;
}

class PayoutHistoryResponseDto {
  payouts: PayoutDto[];
  total: number;
  totalClaimed: number;
  totalPending: number;
}

class ClaimResponseDto {
  success: boolean;
  claimedAmount: number;
  txHash: string;
  claimedPayouts: string[];
}

@ApiTags('Payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Deprecated({
  since: 'v2.1.0',
  until: 'v3.0.0', 
  replacement: '/api/finance/transactions',
  reason: 'Payouts integrated into unified transactions API'
})
export class PayoutsController {
  private readonly logger = new Logger(PayoutsController.name);

  constructor(
    private payoutsService: PayoutsService,
    private positionsService: PositionsService,
  ) {}

  @ApiOperation({ summary: '获取用户可领取收益' })
  @ApiResponse({ 
    status: 200, 
    description: '可领取收益列表获取成功',
    type: ClaimablePayoutsResponseDto
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @Get('user/:userId/claimable')
  async getUserClaimablePayouts(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ClaimablePayoutsResponseDto> {
    // Deprecation notice: migrate to unified transactions endpoint
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=PAYOUT instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: GET /payouts/user/:userId/claimable');
    try {
      // 获取用户的所有持仓（包括活跃和可赎回状态）
      const userPositions = await this.positionsService.getUserPositions(userId);
      
      if (!userPositions.positions || userPositions.positions.length === 0) {
        return {
          payouts: [],
          totalAmount: 0,
        };
      }

      // 为每个活跃持仓生成可领取收益
      const allPayouts: PayoutDto[] = [];
      let totalAmount = 0;

      for (const position of userPositions.positions) {
        // 只处理活跃或可赎回状态的持仓
        if (position.status !== 'ACTIVE' && position.status !== 'REDEEMING') {
          continue;
        }
        
        // 生成未领取的收益记录
        const payouts = await this.payoutsService.generateClaimablePayouts(position.id, userId);
        
        // 转换为前端期望的格式
        const formattedPayouts = payouts.map(payout => ({
          id: payout.id,
          userId: payout.userId,
          positionId: payout.positionId,
          amount: payout.amount,
          periodStart: payout.periodStart.toISOString(),
          periodEnd: payout.periodEnd.toISOString(),
          isClaimable: payout.status === 'PENDING',
          claimedAt: payout.claimedAt?.toISOString(),
          claimTxHash: payout.txHash,
          createdAt: payout.createdAt.toISOString(),
          updatedAt: payout.updatedAt.toISOString(),
        }));

        allPayouts.push(...formattedPayouts);
        totalAmount += formattedPayouts.reduce((sum, p) => sum + p.amount, 0);
      }

      return {
        payouts: allPayouts,
        totalAmount,
      };
    } catch (error) {
      this.logger.error(`Failed to get claimable payouts for user ${userId}:`, error);
      throw new BadRequestException(`获取可领取收益失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '获取用户收益历史' })
  @ApiResponse({ 
    status: 200, 
    description: '收益历史获取成功',
    type: PayoutHistoryResponseDto
  })
  @Get('user/:userId/history')
  async getUserPayoutHistory(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Res({ passthrough: true }) res: Response
  ): Promise<PayoutHistoryResponseDto> {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=PAYOUT instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: GET /payouts/user/:userId/history');
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;

      // 获取用户所有持仓
      const userPositions = await this.positionsService.getUserPositions(userId);
      
      if (!userPositions.positions || userPositions.positions.length === 0) {
        return {
          payouts: [],
          total: 0,
          totalClaimed: 0,
          totalPending: 0,
        };
      }

      // 获取所有收益记录
      const allPayouts: PayoutDto[] = [];
      let totalClaimed = 0;
      let totalPending = 0;

      for (const position of userPositions.positions) {
        // 获取该持仓的所有收益记录
        const payouts = await this.payoutsService.getPositionPayouts(position.id);
        
        const formattedPayouts = payouts.map(payout => ({
          id: payout.id,
          userId: payout.userId,
          positionId: payout.positionId,
          amount: payout.amount,
          periodStart: payout.periodStart.toISOString(),
          periodEnd: payout.periodEnd.toISOString(),
          isClaimable: payout.status === 'PENDING',
          claimedAt: payout.claimedAt?.toISOString(),
          claimTxHash: payout.txHash,
          createdAt: payout.createdAt.toISOString(),
          updatedAt: payout.updatedAt.toISOString(),
        }));

        allPayouts.push(...formattedPayouts);

        // 统计已领取和待领取金额
        formattedPayouts.forEach(payout => {
          if (payout.isClaimable) {
            totalPending += payout.amount;
          } else {
            totalClaimed += payout.amount;
          }
        });
      }

      // 按创建时间倒序排序
      allPayouts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 分页处理
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedPayouts = allPayouts.slice(startIndex, startIndex + limitNum);

      return {
        payouts: paginatedPayouts,
        total: allPayouts.length,
        totalClaimed,
        totalPending,
      };
    } catch (error) {
      this.logger.error(`Failed to get payout history for user ${userId}:`, error);
      throw new BadRequestException(`获取收益历史失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '领取收益' })
  @ApiResponse({ 
    status: 200, 
    description: '收益领取成功',
    type: ClaimResponseDto
  })
  @ApiResponse({ status: 400, description: '领取失败' })
  @HttpCode(HttpStatus.OK)
  @Post('claim')
  async claimPayouts(
    @Body() claimDto: ClaimPayoutsDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ClaimResponseDto> {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions for payout processing instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: POST /payouts/claim');
    try {
      const { userId, payoutIds } = claimDto;

      if (!payoutIds || payoutIds.length === 0) {
        throw new BadRequestException('请选择要领取的收益');
      }

      // 验证所有收益记录是否存在且属于该用户
      const payoutPromises = payoutIds.map(id => 
        this.payoutsService.findPayoutById(id)
      );
      const payouts = await Promise.all(payoutPromises);

      // 验证权限和状态
      let totalAmount = 0;
      for (const payout of payouts) {
        if (!payout) {
          throw new NotFoundException('收益记录不存在');
        }
        if (payout.userId !== userId) {
          throw new BadRequestException('无权限领取此收益');
        }
        if (payout.status !== 'PENDING') {
          throw new BadRequestException('该收益已被领取或不可领取');
        }
        totalAmount += payout.amount;
      }

      // 执行领取操作
      const claimResults = await this.payoutsService.claimMultiplePayouts(payoutIds, userId);
      
      if (!claimResults.success) {
        throw new BadRequestException(claimResults.message || '领取失败');
      }

      return {
        success: true,
        claimedAmount: claimResults.totalAmount,
        txHash: claimResults.txHash,
        claimedPayouts: payoutIds,
      };
    } catch (error) {
      this.logger.error('Failed to claim payouts:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`收益领取失败: ${error.message}`);
    }
  }

  @ApiOperation({ summary: '获取单个收益详情' })
  @ApiResponse({ 
    status: 200, 
    description: '收益详情获取成功',
    type: PayoutDto
  })
  @ApiResponse({ status: 404, description: '收益记录不存在' })
  @Get(':payoutId')
  async getPayoutById(
    @Param('payoutId') payoutId: string
  ): Promise<PayoutDto> {
    try {
      const payout = await this.payoutsService.findPayoutById(payoutId);
      
      if (!payout) {
        throw new NotFoundException('收益记录不存在');
      }

      return {
        id: payout.id,
        userId: payout.userId,
        positionId: payout.positionId,
        amount: payout.amount,
        periodStart: payout.periodStart.toISOString(),
        periodEnd: payout.periodEnd.toISOString(),
        isClaimable: payout.status === 'PENDING',
        claimedAt: payout.claimedAt?.toISOString(),
        claimTxHash: payout.txHash,
        createdAt: payout.createdAt.toISOString(),
        updatedAt: payout.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get payout ${payoutId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`获取收益详情失败: ${error.message}`);
    }
  }
}
