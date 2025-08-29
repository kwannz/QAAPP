import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(@Inject('CommissionsService') private readonly commissionsService: any) {}

  // ==================== 用户端点 ====================

  @ApiOperation({ summary: 'Get user commission history' })
  @ApiResponse({ status: 200, description: 'Commission history retrieved successfully' })
  @Get('user/:userId/history')
  async getUserCommissionHistory(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.commissionsService.getUserCommissionHistory(userId, { page, limit });
  }

  @ApiOperation({ summary: 'Get user commission summary' })
  @ApiResponse({ status: 200, description: 'Commission summary retrieved successfully' })
  @Get('user/:userId/summary')
  async getUserCommissionSummary(@Param('userId') userId: string) {
    return this.commissionsService.getUserCommissionSummary(userId);
  }

  // ==================== 管理员端点 ====================

  @ApiOperation({ summary: 'Get all commissions for admin' })
  @ApiResponse({ status: 200, description: 'Commissions retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/list')
  async getAdminCommissionList(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('period') period?: string,
    @Query('agentId') agentId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.commissionsService.getAdminCommissionList({
      status,
      type,
      period,
      agentId,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Get commission statistics' })
  @ApiResponse({ status: 200, description: 'Commission statistics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  async getCommissionStats(@Query('period') period?: string) {
    return this.commissionsService.getCommissionStats(period);
  }

  @ApiOperation({ summary: 'Calculate commissions for period' })
  @ApiResponse({ status: 200, description: 'Commission calculation completed' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/calculate')
  async calculateCommissions(
    @Body() calculationData: {
      period: string;
      agentIds?: string[];
      includeSubAgents?: boolean;
      forceRecalculate?: boolean;
    }
  ) {
    return this.commissionsService.calculateCommissions(calculationData);
  }

  @ApiOperation({ summary: 'Process commission payments' })
  @ApiResponse({ status: 200, description: 'Commission payments processed' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/process-payments')
  async processCommissionPayments(
    @Body() paymentData: {
      commissionIds?: string[];
      period?: string;
      batchSize?: number;
    }
  ) {
    return this.commissionsService.processCommissionPayments(paymentData);
  }

  @ApiOperation({ summary: 'Get commission breakdown' })
  @ApiResponse({ status: 200, description: 'Commission breakdown retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/breakdown')
  async getCommissionBreakdown(
    @Query('period') period: string,
    @Query('groupBy') groupBy?: string
  ) {
    return this.commissionsService.getCommissionBreakdown(period, groupBy);
  }

  @ApiOperation({ summary: 'Update commission structure' })
  @ApiResponse({ status: 200, description: 'Commission structure updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/update-structure')
  async updateCommissionStructure(
    @Body() structureData: {
      level: number;
      commissionRate: number;
      bonusThreshold?: number;
      effectiveDate?: string;
    }
  ) {
    return this.commissionsService.updateCommissionStructure(structureData);
  }

  @ApiOperation({ summary: 'Get commission rules' })
  @ApiResponse({ status: 200, description: 'Commission rules retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/rules')
  async getCommissionRules() {
    return this.commissionsService.getCommissionRules();
  }

  @ApiOperation({ summary: 'Update commission rules' })
  @ApiResponse({ status: 200, description: 'Commission rules updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/rules')
  async updateCommissionRules(
    @Body() rulesData: {
      minCommissionThreshold: number;
      maxCommissionRate: number;
      payoutFrequency: string;
      holdingPeriod: number;
      bonusStructure?: any;
    }
  ) {
    return this.commissionsService.updateCommissionRules(rulesData);
  }

  @ApiOperation({ summary: 'Generate commission report' })
  @ApiResponse({ status: 200, description: 'Commission report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('admin/generate-report')
  async generateCommissionReport(
    @Body() reportData: {
      period: string;
      type: 'summary' | 'detailed' | 'agent-breakdown';
      format: 'pdf' | 'excel' | 'csv';
      includeSubAgents?: boolean;
    }
  ) {
    return this.commissionsService.generateCommissionReport(reportData);
  }

  @ApiOperation({ summary: 'Export commission data' })
  @ApiResponse({ status: 200, description: 'Commission data exported successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/export')
  async exportCommissions(
    @Query('period') period?: string,
    @Query('status') status?: string,
    @Query('format') format: string = 'csv'
  ) {
    return this.commissionsService.exportCommissions({ period, status, format });
  }

  @ApiOperation({ summary: 'Validate commission calculation' })
  @ApiResponse({ status: 200, description: 'Commission validation completed' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('admin/validate')
  async validateCommissions(
    @Body() validationData: {
      period: string;
      sampleSize?: number;
    }
  ) {
    return this.commissionsService.validateCommissions(validationData);
  }

  @ApiOperation({ summary: 'Retry failed commission payments' })
  @ApiResponse({ status: 200, description: 'Failed payments retry initiated' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/retry-failed')
  async retryFailedPayments(
    @Body() retryData: {
      commissionIds?: string[];
      period?: string;
    }
  ) {
    return this.commissionsService.retryFailedPayments(retryData);
  }
}