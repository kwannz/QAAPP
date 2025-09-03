import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { WithdrawalsService, CreateWithdrawalDto, UpdateWithdrawalDto, WithdrawalQueryDto } from '../services/withdrawals.service';

@ApiTags('Finance - Withdrawals')
@Controller('finance/withdrawals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WithdrawalsController {
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
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get withdrawals with filters' })
  @ApiResponse({ status: 200, description: 'Withdrawals retrieved' })
  async getWithdrawals(@Query() query: WithdrawalQueryDto) {
    return this.withdrawalsService.getWithdrawals(query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get withdrawal statistics' })
  @ApiResponse({ status: 200, description: 'Withdrawal statistics retrieved' })
  async getWithdrawalStats() {
    return this.withdrawalsService.getWithdrawalStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get withdrawal by ID' })
  @ApiResponse({ status: 200, description: 'Withdrawal retrieved' })
  async getWithdrawalById(@Param('id') id: string) {
    return this.withdrawalsService.getWithdrawalById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update withdrawal status' })
  @ApiResponse({ status: 200, description: 'Withdrawal updated' })
  async updateWithdrawal(
    @Param('id') id: string,
    @Body() updateDto: UpdateWithdrawalDto,
    @Request() req: any
  ) {
    return this.withdrawalsService.updateWithdrawal(id, updateDto, req.user.sub);
  }

  @Put('batch')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Batch update withdrawals' })
  @ApiResponse({ status: 200, description: 'Withdrawals batch updated' })
  async batchUpdateWithdrawals(
    @Body() batchData: { ids: string[]; updateDto: UpdateWithdrawalDto },
    @Request() req: any
  ) {
    return this.withdrawalsService.batchUpdateWithdrawals(
      batchData.ids, 
      batchData.updateDto, 
      req.user.sub
    );
  }
}