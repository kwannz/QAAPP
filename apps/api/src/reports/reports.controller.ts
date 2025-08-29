import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(@Inject('ReportsService') private readonly reportsService: any) {}

  // ==================== 管理员端点 ====================

  @ApiOperation({ summary: 'Generate financial overview report' })
  @ApiResponse({ status: 200, description: 'Financial overview report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('financial/overview')
  async generateFinancialOverview(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      includeCharts?: boolean;
      breakdown?: string[];
    }
  ) {
    return this.reportsService.generateFinancialOverview(reportData);
  }

  @ApiOperation({ summary: 'Generate commission report' })
  @ApiResponse({ status: 200, description: 'Commission report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('commissions')
  async generateCommissionReport(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      agentIds?: string[];
      groupBy?: 'agent' | 'level' | 'period';
      includeSubAgents?: boolean;
    }
  ) {
    return this.reportsService.generateCommissionReport(reportData);
  }

  @ApiOperation({ summary: 'Generate revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('revenue')
  async generateRevenueReport(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      breakdown: 'daily' | 'weekly' | 'monthly';
      includeProjections?: boolean;
    }
  ) {
    return this.reportsService.generateRevenueReport(reportData);
  }

  @ApiOperation({ summary: 'Generate investment analysis report' })
  @ApiResponse({ status: 200, description: 'Investment analysis report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('investments/analysis')
  async generateInvestmentAnalysis(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      riskLevels?: string[];
      includePerformance?: boolean;
    }
  ) {
    return this.reportsService.generateInvestmentAnalysis(reportData);
  }

  @ApiOperation({ summary: 'Generate agent performance report' })
  @ApiResponse({ status: 200, description: 'Agent performance report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('agents/performance')
  async generateAgentPerformanceReport(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      agentIds?: string[];
      metrics?: string[];
      includeHierarchy?: boolean;
    }
  ) {
    return this.reportsService.generateAgentPerformanceReport(reportData);
  }

  @ApiOperation({ summary: 'Generate cash flow report' })
  @ApiResponse({ status: 200, description: 'Cash flow report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('cashflow')
  async generateCashFlowReport(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      includeProjections?: boolean;
      breakdown?: 'inflow' | 'outflow' | 'net';
    }
  ) {
    return this.reportsService.generateCashFlowReport(reportData);
  }

  @ApiOperation({ summary: 'Generate regulatory compliance report' })
  @ApiResponse({ status: 200, description: 'Regulatory compliance report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('compliance')
  async generateComplianceReport(
    @Body() reportData: {
      period: string;
      dateFrom: string;
      dateTo: string;
      format: 'pdf' | 'excel' | 'csv';
      regulations?: string[];
      includeAuditTrail?: boolean;
    }
  ) {
    return this.reportsService.generateComplianceReport(reportData);
  }

  @ApiOperation({ summary: 'Get report templates' })
  @ApiResponse({ status: 200, description: 'Report templates retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('templates')
  async getReportTemplates(@Query('category') category?: string) {
    return this.reportsService.getReportTemplates(category);
  }

  @ApiOperation({ summary: 'Create custom report template' })
  @ApiResponse({ status: 201, description: 'Report template created successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('templates')
  async createReportTemplate(
    @Body() templateData: {
      name: string;
      category: string;
      description?: string;
      dataSource: string;
      fields: string[];
      filters: any[];
      charts?: any[];
      schedule?: any;
    }
  ) {
    return this.reportsService.createReportTemplate(templateData);
  }

  @ApiOperation({ summary: 'Get report history' })
  @ApiResponse({ status: 200, description: 'Report history retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('history')
  async getReportHistory(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.reportsService.getReportHistory({
      type,
      status,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get(':reportId')
  async getReport(@Param('reportId') reportId: string) {
    return this.reportsService.getReport(reportId);
  }

  @ApiOperation({ summary: 'Download report' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get(':reportId/download')
  async downloadReport(
    @Param('reportId') reportId: string,
    @Res() res: Response
  ) {
    const result = await this.reportsService.downloadReport(reportId);
    
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }

  @ApiOperation({ summary: 'Schedule report generation' })
  @ApiResponse({ status: 201, description: 'Report scheduled successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('schedule')
  async scheduleReport(
    @Body() scheduleData: {
      templateId: string;
      name: string;
      schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
        dayOfWeek?: number;
        dayOfMonth?: number;
        time: string;
      };
      recipients: string[];
      format: 'pdf' | 'excel' | 'csv';
      parameters?: any;
    }
  ) {
    return this.reportsService.scheduleReport(scheduleData);
  }

  @ApiOperation({ summary: 'Get scheduled reports' })
  @ApiResponse({ status: 200, description: 'Scheduled reports retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('scheduled/list')
  async getScheduledReports(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.reportsService.getScheduledReports({
      status,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Cancel scheduled report' })
  @ApiResponse({ status: 200, description: 'Scheduled report cancelled successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('scheduled/:scheduleId/cancel')
  async cancelScheduledReport(@Param('scheduleId') scheduleId: string) {
    return this.reportsService.cancelScheduledReport(scheduleId);
  }

  @ApiOperation({ summary: 'Get report statistics' })
  @ApiResponse({ status: 200, description: 'Report statistics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('stats/overview')
  async getReportStats(@Query('period') period?: string) {
    return this.reportsService.getReportStats(period);
  }

  @ApiOperation({ summary: 'Generate dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'Dashboard KPIs generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('dashboard/kpis')
  async getDashboardKPIs(
    @Query('period') period: string = '30d',
    @Query('comparison') comparison: string = 'previous_period'
  ) {
    return this.reportsService.getDashboardKPIs(period, comparison);
  }

  @ApiOperation({ summary: 'Export report data' })
  @ApiResponse({ status: 200, description: 'Report data exported successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('export')
  async exportReportData(
    @Body() exportData: {
      reportType: string;
      dateFrom: string;
      dateTo: string;
      format: 'csv' | 'excel' | 'json';
      filters?: any;
      fields?: string[];
    }
  ) {
    return this.reportsService.exportReportData(exportData);
  }

  @ApiOperation({ summary: 'Get report preview' })
  @ApiResponse({ status: 200, description: 'Report preview generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('preview')
  async previewReport(
    @Body() previewData: {
      templateId?: string;
      type: string;
      parameters: any;
      sampleSize?: number;
    }
  ) {
    return this.reportsService.previewReport(previewData);
  }
}