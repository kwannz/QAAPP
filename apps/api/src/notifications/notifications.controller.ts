import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(@Inject('NotificationsService') private readonly notificationsService: any) {}

  // ==================== 用户端点 ====================

  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.notificationsService.getUserNotifications(userId, {
      type,
      status,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @HttpCode(HttpStatus.OK)
  @Put('user/:userId/read/:notificationId')
  async markAsRead(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string
  ) {
    return this.notificationsService.markNotificationAsRead(userId, notificationId);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @HttpCode(HttpStatus.OK)
  @Put('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllNotificationsAsRead(userId);
  }

  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  @Get('user/:userId/stats')
  async getNotificationStats(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationStats(userId);
  }

  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  @Get('user/:userId/preferences')
  async getNotificationPreferences(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationPreferences(userId);
  }

  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  @HttpCode(HttpStatus.OK)
  @Put('user/:userId/preferences')
  async updateNotificationPreferences(
    @Param('userId') userId: string,
    @Body() preferences: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      types?: {
        orderUpdates?: boolean;
        commissionPayments?: boolean;
        systemAlerts?: boolean;
        promotions?: boolean;
      };
    }
  ) {
    return this.notificationsService.updateNotificationPreferences(userId, preferences);
  }

  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @Delete('user/:userId/:notificationId')
  async deleteNotification(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }

  // ==================== 管理员端点 ====================

  @ApiOperation({ summary: 'Get all notifications for admin' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/list')
  async getAdminNotifications(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('recipient') recipient?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.notificationsService.getAdminNotifications({
      type,
      status,
      recipient,
      dateFrom,
      dateTo,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('admin/send')
  async sendNotification(
    @Body() notificationData: {
      recipientId?: string;
      recipientType: 'USER' | 'AGENT' | 'ALL';
      type: string;
      title: string;
      message: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      channels: ('EMAIL' | 'PUSH' | 'SMS')[];
      data?: any;
      scheduledFor?: string;
    }
  ) {
    return this.notificationsService.sendNotification(notificationData);
  }

  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 200, description: 'Bulk notifications sent successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('admin/send-bulk')
  async sendBulkNotifications(
    @Body() bulkData: {
      recipientIds: string[];
      type: string;
      title: string;
      message: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      channels: ('EMAIL' | 'PUSH' | 'SMS')[];
      data?: any;
    }
  ) {
    return this.notificationsService.sendBulkNotifications(bulkData);
  }

  @ApiOperation({ summary: 'Get notification templates' })
  @ApiResponse({ status: 200, description: 'Notification templates retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/templates')
  async getNotificationTemplates() {
    return this.notificationsService.getNotificationTemplates();
  }

  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: 201, description: 'Notification template created successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('admin/templates')
  async createNotificationTemplate(
    @Body() templateData: {
      name: string;
      type: string;
      title: string;
      content: string;
      variables?: string[];
      channels: ('EMAIL' | 'PUSH' | 'SMS')[];
    }
  ) {
    return this.notificationsService.createNotificationTemplate(templateData);
  }

  @ApiOperation({ summary: 'Update notification template' })
  @ApiResponse({ status: 200, description: 'Notification template updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('admin/templates/:templateId')
  async updateNotificationTemplate(
    @Param('templateId') templateId: string,
    @Body() templateData: {
      name?: string;
      title?: string;
      content?: string;
      variables?: string[];
      channels?: ('EMAIL' | 'PUSH' | 'SMS')[];
      isActive?: boolean;
    }
  ) {
    return this.notificationsService.updateNotificationTemplate(templateId, templateData);
  }

  @ApiOperation({ summary: 'Delete notification template' })
  @ApiResponse({ status: 200, description: 'Notification template deleted successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/templates/:templateId')
  async deleteNotificationTemplate(@Param('templateId') templateId: string) {
    return this.notificationsService.deleteNotificationTemplate(templateId);
  }

  @ApiOperation({ summary: 'Get notification statistics for admin' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  async getAdminNotificationStats(
    @Query('period') period?: string,
    @Query('type') type?: string
  ) {
    return this.notificationsService.getAdminNotificationStats({ period, type });
  }

  @ApiOperation({ summary: 'Get notification delivery report' })
  @ApiResponse({ status: 200, description: 'Notification delivery report retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/delivery-report')
  async getDeliveryReport(
    @Query('notificationId') notificationId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('channel') channel?: string
  ) {
    return this.notificationsService.getDeliveryReport({
      notificationId,
      dateFrom,
      dateTo,
      channel
    });
  }

  @ApiOperation({ summary: 'Retry failed notifications' })
  @ApiResponse({ status: 200, description: 'Failed notifications retry initiated' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/retry-failed')
  async retryFailedNotifications(
    @Body() retryData: {
      notificationIds?: string[];
      channel?: string;
      maxRetries?: number;
    }
  ) {
    return this.notificationsService.retryFailedNotifications(retryData);
  }

  @ApiOperation({ summary: 'Schedule notification campaign' })
  @ApiResponse({ status: 201, description: 'Notification campaign scheduled successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('admin/campaigns')
  async scheduleCampaign(
    @Body() campaignData: {
      name: string;
      templateId: string;
      targetAudience: 'ALL' | 'USERS' | 'AGENTS' | 'CUSTOM';
      customRecipients?: string[];
      scheduledFor: string;
      channels: ('EMAIL' | 'PUSH' | 'SMS')[];
      variables?: Record<string, any>;
    }
  ) {
    return this.notificationsService.scheduleCampaign(campaignData);
  }

  @ApiOperation({ summary: 'Get notification campaigns' })
  @ApiResponse({ status: 200, description: 'Notification campaigns retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/campaigns')
  async getCampaigns(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.notificationsService.getCampaigns({ status, page, limit });
  }

  @ApiOperation({ summary: 'Cancel scheduled campaign' })
  @ApiResponse({ status: 200, description: 'Campaign cancelled successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Delete('admin/campaigns/:campaignId')
  async cancelCampaign(@Param('campaignId') campaignId: string) {
    return this.notificationsService.cancelCampaign(campaignId);
  }
}