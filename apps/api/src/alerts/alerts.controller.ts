import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@qa-app/database';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system alerts' })
  @ApiResponse({ status: 200, description: 'Return system alerts.' })
  async getAlerts(@Query('limit') limit?: string, @Query('severity') severity?: string) {
    return this.alertsService.getAlerts({
      limit: limit ? parseInt(limit, 10) : 50,
      severity,
    });
  }

  @Get('recent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get recent alerts' })
  @ApiResponse({ status: 200, description: 'Return recent alerts.' })
  async getRecentAlerts(@Query('hours') hours?: string) {
    const hoursNumber = hours ? parseInt(hours, 10) : 24;
    return this.alertsService.getRecentAlerts(hoursNumber);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get alerts summary' })
  @ApiResponse({ status: 200, description: 'Return alerts summary.' })
  async getAlertsSummary() {
    return this.alertsService.getAlertsSummary();
  }
}