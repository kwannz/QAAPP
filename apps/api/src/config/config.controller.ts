import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(@Inject('ConfigService') private readonly configService: any) {}

  // ==================== 管理员端点 ====================

  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({ status: 200, description: 'System configuration retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('system')
  async getSystemConfig() {
    return this.configService.getSystemConfig();
  }

  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({ status: 200, description: 'System configuration updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('system')
  async updateSystemConfig(
    @Body() configData: {
      siteName?: string;
      siteUrl?: string;
      supportEmail?: string;
      maintenanceMode?: boolean;
      allowRegistration?: boolean;
      maxFileUpload?: number;
      defaultLanguage?: string;
      timezone?: string;
    }
  ) {
    return this.configService.updateSystemConfig(configData);
  }

  @ApiOperation({ summary: 'Get business configuration' })
  @ApiResponse({ status: 200, description: 'Business configuration retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('business')
  async getBusinessConfig() {
    return this.configService.getBusinessConfig();
  }

  @ApiOperation({ summary: 'Update business configuration' })
  @ApiResponse({ status: 200, description: 'Business configuration updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('business')
  async updateBusinessConfig(
    @Body() configData: {
      minimumInvestment?: number;
      maximumInvestment?: number;
      defaultRiskLevel?: string;
      commissionRates?: any;
      kycRequired?: boolean;
      autoApprovalLimit?: number;
      businessHours?: any;
    }
  ) {
    return this.configService.updateBusinessConfig(configData);
  }

  @ApiOperation({ summary: 'Get security configuration' })
  @ApiResponse({ status: 200, description: 'Security configuration retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('security')
  async getSecurityConfig() {
    return this.configService.getSecurityConfig();
  }

  @ApiOperation({ summary: 'Update security configuration' })
  @ApiResponse({ status: 200, description: 'Security configuration updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('security')
  async updateSecurityConfig(
    @Body() configData: {
      passwordPolicy?: any;
      sessionTimeout?: number;
      maxLoginAttempts?: number;
      enableTwoFactor?: boolean;
      ipWhitelist?: string[];
      enableRateLimit?: boolean;
      rateLimitWindow?: number;
      rateLimitMax?: number;
    }
  ) {
    return this.configService.updateSecurityConfig(configData);
  }

  @ApiOperation({ summary: 'Get payment configuration' })
  @ApiResponse({ status: 200, description: 'Payment configuration retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('payment')
  async getPaymentConfig() {
    return this.configService.getPaymentConfig();
  }

  @ApiOperation({ summary: 'Update payment configuration' })
  @ApiResponse({ status: 200, description: 'Payment configuration updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('payment')
  async updatePaymentConfig(
    @Body() configData: {
      enabledMethods?: string[];
      defaultCurrency?: string;
      minimumAmount?: number;
      maximumAmount?: number;
      processingFee?: number;
      withdrawalLimit?: number;
      autoProcessingThreshold?: number;
    }
  ) {
    return this.configService.updatePaymentConfig(configData);
  }

  @ApiOperation({ summary: 'Get notification configuration' })
  @ApiResponse({ status: 200, description: 'Notification configuration retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('notifications')
  async getNotificationConfig() {
    return this.configService.getNotificationConfig();
  }

  @ApiOperation({ summary: 'Update notification configuration' })
  @ApiResponse({ status: 200, description: 'Notification configuration updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('notifications')
  async updateNotificationConfig(
    @Body() configData: {
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      pushEnabled?: boolean;
      emailProvider?: string;
      smsProvider?: string;
      templates?: any;
      adminNotifications?: any;
    }
  ) {
    return this.configService.updateNotificationConfig(configData);
  }

  @ApiOperation({ summary: 'Get all configuration categories' })
  @ApiResponse({ status: 200, description: 'Configuration categories retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('categories')
  async getConfigCategories() {
    return this.configService.getConfigCategories();
  }

  @ApiOperation({ summary: 'Backup system configuration' })
  @ApiResponse({ status: 200, description: 'Configuration backup created successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('backup')
  async backupConfig(@Body() backupData: { name?: string; description?: string }) {
    return this.configService.createConfigBackup(backupData);
  }

  @ApiOperation({ summary: 'Get configuration backups' })
  @ApiResponse({ status: 200, description: 'Configuration backups retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('backups')
  async getConfigBackups(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.configService.getConfigBackups({ page, limit });
  }

  @ApiOperation({ summary: 'Restore configuration from backup' })
  @ApiResponse({ status: 200, description: 'Configuration restored successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('restore/:backupId')
  async restoreConfig(@Param('backupId') backupId: string) {
    return this.configService.restoreConfigFromBackup(backupId);
  }

  @ApiOperation({ summary: 'Get configuration audit log' })
  @ApiResponse({ status: 200, description: 'Configuration audit log retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('audit-log')
  async getConfigAuditLog(
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.configService.getConfigAuditLog({ category, page, limit });
  }

  @ApiOperation({ summary: 'Test configuration settings' })
  @ApiResponse({ status: 200, description: 'Configuration test completed' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('test/:category')
  async testConfig(@Param('category') category: string) {
    return this.configService.testConfiguration(category);
  }

  @ApiOperation({ summary: 'Reset configuration to defaults' })
  @ApiResponse({ status: 200, description: 'Configuration reset to defaults successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('reset/:category')
  async resetConfig(@Param('category') category: string) {
    return this.configService.resetConfigToDefaults(category);
  }
}