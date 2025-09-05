import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Logger, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Auth } from '../../auth/decorators/auth.decorator';
import { WithdrawalsService, CreateWithdrawalDto, UpdateWithdrawalDto, WithdrawalQueryDto } from '../services/withdrawals.service';
import { Response } from 'express';
import { Deprecated } from '../../common/decorators/deprecated.decorator';

@ApiTags('Finance - Withdrawals')
@Controller('finance/withdrawals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Deprecated({
  since: 'v2.1.0',
  until: 'v3.0.0',
  replacement: '/api/finance/transactions',
  reason: 'Withdrawals integrated into unified transactions API'
})
export class WithdrawalsController {
  private readonly logger = new Logger(WithdrawalsController.name);
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new withdrawal request' })
  @ApiResponse({ status: 201, description: 'Withdrawal request created' })
  async createWithdrawal(
    @Body() createDto: CreateWithdrawalDto,
    @Request() req: any
  ) {
    return this.withdrawalsService.createWithdrawal(createDto, req.user.sub);
  }

  @Get()
  @Auth('ADMIN')
  @ApiOperation({ summary: 'Get withdrawals with filters' })
  @ApiResponse({ status: 200, description: 'Withdrawals retrieved' })
  async getWithdrawals(@Query() query: WithdrawalQueryDto, @Res({ passthrough: true }) res: Response) {
    // Deprecation: use unified finance/transactions endpoints
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=WITHDRAWAL instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: GET /finance/withdrawals');
    return this.withdrawalsService.getWithdrawals(query);
  }

  @Get('stats')
  @Auth('ADMIN')
  @ApiOperation({ summary: 'Get withdrawal statistics' })
  @ApiResponse({ status: 200, description: 'Withdrawal statistics retrieved' })
  async getWithdrawalStats(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/stats instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: GET /finance/withdrawals/stats');
    return this.withdrawalsService.getWithdrawalStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get withdrawal by ID' })
  @ApiResponse({ status: 200, description: 'Withdrawal retrieved' })
  async getWithdrawalById(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/:id instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: GET /finance/withdrawals/:id');
    return this.withdrawalsService.getWithdrawalById(id);
  }

  @Put(':id')
  @Auth('ADMIN')
  @ApiOperation({ summary: 'Update withdrawal status' })
  @ApiResponse({ status: 200, description: 'Withdrawal updated' })
  async updateWithdrawal(
    @Param('id') id: string,
    @Body() updateDto: UpdateWithdrawalDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/:id/process or status endpoints instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: PUT /finance/withdrawals/:id');
    return this.withdrawalsService.updateWithdrawal(id, updateDto, req.user.sub);
  }

  @Put('batch')
  @Auth('ADMIN')
  @ApiOperation({ summary: 'Batch update withdrawals' })
  @ApiResponse({ status: 200, description: 'Withdrawals batch updated' })
  async batchUpdateWithdrawals(
    @Body() batchData: { ids: string[]; updateDto: UpdateWithdrawalDto },
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions/bulk/status instead. This endpoint will be removed in v2.0');
    this.logger.warn('Deprecated API called: PUT /finance/withdrawals/batch');
    return this.withdrawalsService.batchUpdateWithdrawals(
      batchData.ids, 
      batchData.updateDto, 
      req.user.sub
    );
  }
}
