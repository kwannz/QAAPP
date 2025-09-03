import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CommissionsService } from '../services/commissions.service';

@ApiTags('Finance - Commissions')
@Controller('finance/commissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get('user/:userId/history')
  @ApiOperation({ summary: 'Get user commission history' })
  @ApiResponse({ status: 200, description: 'User commission history retrieved' })
  async getUserCommissionHistory(
    @Param('userId') userId: string,
    @Query() pagination: any
  ) {
    return this.commissionsService.getUserCommissionHistory(userId, pagination);
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: 'Get user commission summary' })
  @ApiResponse({ status: 200, description: 'User commission summary retrieved' })
  async getUserCommissionSummary(@Param('userId') userId: string) {
    return this.commissionsService.getUserCommissionSummary(userId);
  }

  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get admin commission list with filters' })
  @ApiResponse({ status: 200, description: 'Admin commission list retrieved' })
  async getAdminCommissionList(@Query() filters: any) {
    return this.commissionsService.getAdminCommissionList(filters);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get commission statistics' })
  @ApiResponse({ status: 200, description: 'Commission statistics retrieved' })
  async getCommissionStats(@Query('period') period?: string) {
    return this.commissionsService.getCommissionStats(period);
  }

  @Post('calculate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Calculate commissions for period' })
  @ApiResponse({ status: 200, description: 'Commission calculation completed' })
  async calculateCommissions(@Body() calculationData: any) {
    return this.commissionsService.calculateCommissions(calculationData);
  }

  @Post('process-payments')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Process commission payments' })
  @ApiResponse({ status: 200, description: 'Commission payments processed' })
  async processCommissionPayments(@Body() paymentData: any) {
    return this.commissionsService.processCommissionPayments(paymentData);
  }

  @Get('breakdown')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get commission breakdown' })
  @ApiResponse({ status: 200, description: 'Commission breakdown retrieved' })
  async getCommissionBreakdown(
    @Query('period') period: string,
    @Query('groupBy') groupBy?: string
  ) {
    return this.commissionsService.getCommissionBreakdown(period, groupBy);
  }

  @Put('structure')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update commission structure' })
  @ApiResponse({ status: 200, description: 'Commission structure updated' })
  async updateCommissionStructure(@Body() structureData: any) {
    return this.commissionsService.updateCommissionStructure(structureData);
  }

  @Get('rules')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get commission rules' })
  @ApiResponse({ status: 200, description: 'Commission rules retrieved' })
  async getCommissionRules() {
    return this.commissionsService.getCommissionRules();
  }

  @Put('rules')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update commission rules' })
  @ApiResponse({ status: 200, description: 'Commission rules updated' })
  async updateCommissionRules(@Body() rulesData: any) {
    return this.commissionsService.updateCommissionRules(rulesData);
  }

  @Post('reports/generate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Generate commission report' })
  @ApiResponse({ status: 200, description: 'Commission report generated' })
  async generateCommissionReport(@Body() reportData: any) {
    return this.commissionsService.generateCommissionReport(reportData);
  }

  @Post('export')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Export commission data' })
  @ApiResponse({ status: 200, description: 'Commission data exported' })
  async exportCommissions(@Body() exportData: any) {
    return this.commissionsService.exportCommissions(exportData);
  }

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Validate commission calculations' })
  @ApiResponse({ status: 200, description: 'Commission validation completed' })
  async validateCommissions(@Body() validationData: any) {
    return this.commissionsService.validateCommissions(validationData);
  }

  @Post('retry-failed-payments')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Retry failed commission payments' })
  @ApiResponse({ status: 200, description: 'Failed payments retry completed' })
  async retryFailedPayments(@Body() retryData: any) {
    return this.commissionsService.retryFailedPayments(retryData);
  }
}