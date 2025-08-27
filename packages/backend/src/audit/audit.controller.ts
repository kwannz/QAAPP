import { 
  Controller, 
  Get, 
  Query, 
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@qa-app/database';

import { AuditService } from './audit.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('审计日志')
@Controller('audit')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户操作历史' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyAuditLogs(
    @GetCurrentUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.auditService.getUserAuditLogs(userId, { page, limit });
  }

  @Get('me/activity-stats')
  @ApiOperation({ summary: '获取我的活动统计' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '统计天数' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyActivityStats(
    @GetCurrentUser('id') userId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.auditService.getUserActivityStats(userId, days);
  }

  // 管理员专用接口
  @Get('logs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取审计日志列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'actorId', required: false, type: String, description: '操作者ID' })
  @ApiQuery({ name: 'actorType', required: false, type: String, description: '操作者类型' })
  @ApiQuery({ name: 'action', required: false, type: String, description: '操作类型' })
  @ApiQuery({ name: 'resourceType', required: false, type: String, description: '资源类型' })
  @ApiQuery({ name: 'resourceId', required: false, type: String, description: '资源ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期 (ISO格式)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期 (ISO格式)' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAuditLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('actorId') actorId?: string,
    @Query('actorType') actorType?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const options = {
      page,
      limit,
      actorId,
      actorType,
      action,
      resourceType,
      resourceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.auditService.findMany(options);
  }

  @Get('users/:userId/logs')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: '获取指定用户操作历史（管理员/代理商）' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.auditService.getUserAuditLogs(userId, { page, limit });
  }

  @Get('users/:userId/activity-stats')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: '获取用户活动统计（管理员/代理商）' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '统计天数' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserActivityStats(
    @Param('userId') userId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.auditService.getUserActivityStats(userId, days);
  }

  @Get('resources/:resourceType/:resourceId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取资源操作历史（管理员）' })
  @ApiParam({ name: 'resourceType', description: '资源类型' })
  @ApiParam({ name: 'resourceId', description: '资源ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getResourceAuditLogs(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.auditService.getResourceAuditLogs(
      resourceType, 
      resourceId, 
      { page, limit }
    );
  }

  @Get('stats/actions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取操作类型统计（管理员）' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getActionStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getActionStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('users/:userId/anomaly-detection')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '检测用户异常活动（管理员）' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ name: 'timeWindowHours', required: false, type: Number, description: '时间窗口（小时）' })
  @ApiResponse({ status: 200, description: '检测完成' })
  async detectUserAnomalousActivity(
    @Param('userId') userId: string,
    @Query('timeWindowHours', new ParseIntPipe({ optional: true })) timeWindowHours?: number,
  ) {
    return this.auditService.detectAnomalousActivity(userId, timeWindowHours);
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '导出审计日志（管理员）' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'], description: '导出格式' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'actorId', required: false, type: String })
  @ApiQuery({ name: 'resourceType', required: false, type: String })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportLogs(
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('actorId') actorId?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    return this.auditService.exportLogs({
      format,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      actorId,
      resourceType,
    });
  }
}