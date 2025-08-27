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
import { OrdersService } from './orders.service';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject('OrdersService') private readonly ordersService: any) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: any) {
    // 在实际环境中，userId将从JWT token中获取
    const userId = 'user-test-001';
    return this.ordersService.create(createOrderDto, userId);
  }

  @Post('eth')
  createWithETH(@Body() createOrderDto: any) {
    // 在实际环境中，userId将从JWT token中获取
    const userId = 'user-test-001';
    // 设置支付类型为ETH
    const ethOrderDto = { ...createOrderDto, paymentType: 'ETH' };
    return this.ordersService.create(ethOrderDto, userId);
  }

  @Post(':id/confirm')
  confirmOrder(@Param('id') id: string, @Body() confirmDto: any) {
    // 在实际环境中，userId将从JWT token中获取
    const userId = 'user-test-001';
    return this.ordersService.confirmOrder(id, confirmDto, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // ==================== 管理员端点 ====================

  @ApiOperation({ summary: 'Get all orders for admin with filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/list')
  async getAdminOrderList(
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('dateRange') dateRange?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.ordersService.getAdminOrderList({
      status,
      riskLevel, 
      dateRange,
      search,
      page,
      limit
    });
  }

  @ApiOperation({ summary: 'Get order statistics for admin' })
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  async getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  @ApiOperation({ summary: 'Approve order' })
  @ApiResponse({ status: 200, description: 'Order approved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/approve')
  async approveOrder(
    @Param('id') id: string,
    @Body() approvalData?: { notes?: string }
  ) {
    return this.ordersService.approveOrder(id, approvalData);
  }

  @ApiOperation({ summary: 'Reject order' })
  @ApiResponse({ status: 200, description: 'Order rejected successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/reject')
  async rejectOrder(
    @Param('id') id: string,
    @Body() rejectionData: { reason: string; notes?: string }
  ) {
    return this.ordersService.rejectOrder(id, rejectionData);
  }

  @ApiOperation({ summary: 'Batch update orders' })
  @ApiResponse({ status: 200, description: 'Orders updated successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('admin/batch-update')
  async batchUpdateOrders(
    @Body() batchData: {
      orderIds: string[];
      action: 'approve' | 'reject';
      reason?: string;
      notes?: string;
    }
  ) {
    return this.ordersService.batchUpdateOrders(batchData);
  }

  @ApiOperation({ summary: 'Get order risk analysis' })
  @ApiResponse({ status: 200, description: 'Risk analysis retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/risk-analysis')
  async getOrderRiskAnalysis(@Param('id') id: string) {
    return this.ordersService.getOrderRiskAnalysis(id);
  }

  @ApiOperation({ summary: 'Re-evaluate order risk' })
  @ApiResponse({ status: 200, description: 'Risk re-evaluation completed' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/:id/re-evaluate-risk')
  async reEvaluateOrderRisk(@Param('id') id: string) {
    return this.ordersService.reEvaluateOrderRisk(id);
  }

  @ApiOperation({ summary: 'Export orders to CSV' })
  @ApiResponse({ status: 200, description: 'Orders exported successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/export')
  async exportOrders(
    @Query('status') status?: string,
    @Query('dateRange') dateRange?: string,
    @Query('format') format: string = 'csv'
  ) {
    return this.ordersService.exportOrders({ status, dateRange, format });
  }

  @ApiOperation({ summary: 'Get order audit trail' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/audit-trail')
  async getOrderAuditTrail(@Param('id') id: string) {
    return this.ordersService.getOrderAuditTrail(id);
  }
}