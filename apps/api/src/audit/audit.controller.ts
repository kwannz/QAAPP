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
import { AuditLog } from '@qa-app/database';
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
  async createAuditLog(@Body() createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditService.createAuditLog(createAuditLogDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @Roles('ADMIN')
  async getAuditLogs(@Query() query: AuditLogQueryDto): Promise<{ logs: AuditLog[], pagination: any }> {
    return this.auditService.getAuditLogs(query);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @Roles('ADMIN')
  async getAuditLogById(@Param('id') id: string): Promise<AuditLog | null> {
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
    // 注意：导出功能预留，未来可扩展为 CSV/PDF 格式
    return { message: 'Export functionality available for future implementation', query };
  }

  @Post('batch-mark-abnormal')
  @ApiOperation({ summary: 'Batch mark logs as abnormal' })
  @Roles('ADMIN')
  async batchMarkAbnormal(@Body() body: { logIds: string[] }) {
    // 注意：批量标记功能预留，可扩展为实际数据库操作
    return { 
      message: `Batch marking functionality ready for implementation`,
      affectedLogs: body.logIds.length,
      logIds: body.logIds
    };
  }

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate audit summary' })
  @Roles('ADMIN')
  async generateSummary(@Body() query: AuditLogQueryDto) {
    // 注意：摘要生成功能预留，可扩展为统计分析
    return { 
      message: 'Summary generation ready for implementation',
      timeRange: query,
      status: 'prepared'
    };
  }
}