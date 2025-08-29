import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
  constructor(@Inject('AgentsService') private readonly agentsService: any) {}

  // ==================== 用户端点 ====================

  @ApiOperation({ summary: 'Get agent profile' })
  @ApiResponse({ status: 200, description: 'Agent profile retrieved successfully' })
  @Get('profile')
  async getAgentProfile(@Query('userId') userId: string) {
    return this.agentsService.getAgentProfile(userId);
  }

  @ApiOperation({ summary: 'Apply to become agent' })
  @ApiResponse({ status: 201, description: 'Agent application submitted successfully' })
  @Post('apply')
  async applyToBeAgent(@Body() applicationData: {
    userId: string;
    businessInfo: any;
    referenceContacts?: any[];
  }) {
    return this.agentsService.submitAgentApplication(applicationData);
  }

  // ==================== 管理员端点 ====================

  @ApiOperation({ summary: 'Get all agents for admin with filters' })
  @ApiResponse({ status: 200, description: 'Agents retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/list')
  async getAdminAgentList(
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('performance') performance?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.agentsService.getAdminAgentList({
      status,
      level,
      performance,
      search,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Get agent statistics for admin' })
  @ApiResponse({ status: 200, description: 'Agent statistics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  async getAgentStats() {
    return this.agentsService.getAgentStats();
  }

  @ApiOperation({ summary: 'Get agent hierarchy structure' })
  @ApiResponse({ status: 200, description: 'Agent hierarchy retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/hierarchy')
  async getAgentHierarchy(@Query('rootAgentId') rootAgentId?: string) {
    return this.agentsService.getAgentHierarchy(rootAgentId);
  }

  @ApiOperation({ summary: 'Get agent performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/performance')
  async getAgentPerformance(
    @Param('id') agentId: string,
    @Query('period') period?: string
  ) {
    return this.agentsService.getAgentPerformance(agentId, period);
  }

  @ApiOperation({ summary: 'Approve agent application' })
  @ApiResponse({ status: 200, description: 'Agent approved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/approve')
  async approveAgent(
    @Param('id') agentId: string,
    @Body() approvalData: {
      level: number;
      commissionRate: number;
      parentAgentId?: string;
      notes?: string;
    }
  ) {
    return this.agentsService.approveAgent(agentId, approvalData);
  }

  @ApiOperation({ summary: 'Reject agent application' })
  @ApiResponse({ status: 200, description: 'Agent rejected successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/reject')
  async rejectAgent(
    @Param('id') agentId: string,
    @Body() rejectionData: { reason: string; notes?: string }
  ) {
    return this.agentsService.rejectAgent(agentId, rejectionData);
  }

  @ApiOperation({ summary: 'Update agent commission rate' })
  @ApiResponse({ status: 200, description: 'Commission rate updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/commission')
  async updateCommissionRate(
    @Param('id') agentId: string,
    @Body() commissionData: {
      commissionRate: number;
      effectiveDate?: string;
      reason?: string;
    }
  ) {
    return this.agentsService.updateCommissionRate(agentId, commissionData);
  }

  @ApiOperation({ summary: 'Update agent level' })
  @ApiResponse({ status: 200, description: 'Agent level updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/level')
  async updateAgentLevel(
    @Param('id') agentId: string,
    @Body() levelData: {
      newLevel: number;
      reason?: string;
    }
  ) {
    return this.agentsService.updateAgentLevel(agentId, levelData);
  }

  @ApiOperation({ summary: 'Ban/Unban agent' })
  @ApiResponse({ status: 200, description: 'Agent status updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/toggle-status')
  async toggleAgentStatus(
    @Param('id') agentId: string,
    @Body() statusData: { 
      action: 'ban' | 'unban';
      reason?: string;
    }
  ) {
    return this.agentsService.toggleAgentStatus(agentId, statusData);
  }

  @ApiOperation({ summary: 'Batch update agents' })
  @ApiResponse({ status: 200, description: 'Agents updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('admin/batch-update')
  async batchUpdateAgents(
    @Body() batchData: {
      agentIds: string[];
      action: 'approve' | 'reject' | 'ban' | 'unban';
      reason?: string;
      data?: any;
    }
  ) {
    return this.agentsService.batchUpdateAgents(batchData);
  }

  @ApiOperation({ summary: 'Get agent team structure' })
  @ApiResponse({ status: 200, description: 'Team structure retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/team')
  async getAgentTeam(@Param('id') agentId: string) {
    return this.agentsService.getAgentTeam(agentId);
  }

  @ApiOperation({ summary: 'Calculate agent commissions' })
  @ApiResponse({ status: 200, description: 'Commission calculation completed' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/:id/calculate-commission')
  async calculateAgentCommission(
    @Param('id') agentId: string,
    @Body() calculationData: {
      period: string;
      includeSubAgents: boolean;
    }
  ) {
    return this.agentsService.calculateAgentCommission(agentId, calculationData);
  }

  @ApiOperation({ summary: 'Export agents to CSV' })
  @ApiResponse({ status: 200, description: 'Agents exported successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/export')
  async exportAgents(
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('format') format: string = 'csv'
  ) {
    return this.agentsService.exportAgents({ status, level, format });
  }

  @ApiOperation({ summary: 'Get agent audit trail' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/audit-trail')
  async getAgentAuditTrail(@Param('id') agentId: string) {
    return this.agentsService.getAgentAuditTrail(agentId);
  }

  @ApiOperation({ summary: 'Get commission payout history' })
  @ApiResponse({ status: 200, description: 'Payout history retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/payouts')
  async getAgentPayouts(
    @Param('id') agentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.agentsService.getAgentPayouts(agentId, { page, limit });
  }
}