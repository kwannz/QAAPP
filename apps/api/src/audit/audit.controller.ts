import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService, CreateAuditLogDto, AuditLogQueryDto } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('logs')
  @ApiOperation({ summary: 'Create audit log' })
  @Roles('ADMIN')
  async createAuditLog(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditService.createAuditLog(createAuditLogDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @Roles('ADMIN')
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditService.getAuditLogs(query);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @Roles('ADMIN')
  async getAuditLogById(@Param('id') id: string) {
    return this.auditService.getAuditLogById(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  @Roles('ADMIN')
  async getAuditStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.auditService.getAuditStats(start, end);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export audit report' })
  @Roles('ADMIN')
  async exportAuditReport(@Body() query: AuditLogQueryDto) {
    // TODO: Implement audit report export
    return { message: 'Export functionality will be implemented' };
  }

  @Post('batch-mark-abnormal')
  @ApiOperation({ summary: 'Batch mark logs as abnormal' })
  @Roles('ADMIN')
  async batchMarkAbnormal(@Body() body: { logIds: string[] }) {
    // TODO: Implement batch marking as abnormal
    return { message: `Marked ${body.logIds.length} logs as abnormal` };
  }

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate audit summary' })
  @Roles('ADMIN')
  async generateSummary(@Body() query: AuditLogQueryDto) {
    // TODO: Implement audit summary generation
    return { message: 'Summary generation functionality will be implemented' };
  }
}