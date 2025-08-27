import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @ApiOperation({ summary: 'Get system performance statistics' })
  @ApiResponse({ status: 200, description: 'Performance statistics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  getPerformanceStats() {
    return this.performanceService.getPerformanceStats();
  }

  @ApiOperation({ summary: 'Get system health check' })
  @ApiResponse({ status: 200, description: 'Health check completed successfully' })
  @Get('health')
  getHealthCheck() {
    return this.performanceService.getHealthCheck();
  }

  @ApiOperation({ summary: 'Generate performance report' })
  @ApiResponse({ status: 200, description: 'Performance report generated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('report')
  generatePerformanceReport(@Query('period') period: string = '24h') {
    return this.performanceService.generatePerformanceReport(period);
  }
}