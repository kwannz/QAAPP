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
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { 
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
  ConfirmOrderDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsResponseDto,
  BatchUpdateOrdersDto
} from '../dto/orders.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ==================== 用户端点 ====================

  @ApiOperation({ 
    summary: 'Get current user orders',
    description: 'Retrieve paginated list of orders for the authenticated user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELED'], description: 'Filter by order status' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getMyOrders(
    @Req() req: any,
    @Query(new ValidationPipe({ transform: true })) queryDto: OrderQueryDto
  ): Promise<OrderListResponseDto> {
    return this.ordersService.findUserOrders(req.user.id, queryDto);
  }

  @ApiOperation({ 
    summary: 'Get specific order details',
    description: 'Retrieve detailed information about a specific order.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order found successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied - can only view own orders'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Create new order',
    description: 'Create a new investment order for a product.'
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid order data or insufficient product availability'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
    @Req() req: any
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Create ETH payment order',
    description: 'Create a new investment order with ETH payment method.'
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ 
    status: 201, 
    description: 'ETH order created successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid order data'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('eth')
  @HttpCode(HttpStatus.CREATED)
  async createWithETH(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
    @Req() req: any
  ): Promise<OrderResponseDto> {
    const ethOrderDto = { ...createOrderDto, paymentType: 'ETH' };
    return this.ordersService.create(ethOrderDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Confirm order payment',
    description: 'Confirm payment for a pending order with transaction hash.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: ConfirmOrderDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Order confirmed successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Order cannot be confirmed (invalid status or transaction)' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/confirm')
  async confirmOrder(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body(ValidationPipe) confirmDto: ConfirmOrderDto,
    @Req() req: any
  ): Promise<OrderResponseDto> {
    return this.ordersService.confirmOrder(id, confirmDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Cancel pending order',
    description: 'Cancel a pending order that has not been confirmed yet.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order cancelled successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Order cannot be cancelled (already processed)'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, { status: 'CANCELED' }, req.user.id);
  }

  // ==================== 管理员端点 ====================

  @ApiOperation({ 
    summary: 'Get all orders for admin with filters',
    description: 'Retrieve all orders with advanced filtering, sorting, and pagination for administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/list')
  async getAdminOrderList(
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('dateRange') dateRange?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<OrderListResponseDto> {
    return this.ordersService.getAdminOrderList({
      status,
      riskLevel, 
      dateRange,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    });
  }

  @ApiOperation({ 
    summary: 'Get order statistics for admin',
    description: 'Retrieve comprehensive order statistics and analytics for administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order statistics retrieved successfully',
    type: OrderStatsResponseDto
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  async getOrderStats(): Promise<OrderStatsResponseDto> {
    return this.ordersService.getOrderStats();
  }

  @ApiOperation({ 
    summary: 'Approve order',
    description: 'Manually approve a pending order. Requires admin privileges.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order approved successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/approve')
  async approveOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approvalData?: { notes?: string }
  ): Promise<OrderResponseDto> {
    return this.ordersService.approveOrder(id, approvalData);
  }

  @ApiOperation({ 
    summary: 'Reject order',
    description: 'Reject a pending order with reason. Requires admin privileges.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order rejected successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Rejection reason is required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/:id/reject')
  async rejectOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) rejectionData: { reason: string; notes?: string }
  ): Promise<OrderResponseDto> {
    return this.ordersService.rejectOrder(id, rejectionData);
  }

  @ApiOperation({ 
    summary: 'Batch update orders',
    description: 'Update multiple orders at once. Requires admin privileges.'
  })
  @ApiBody({ type: BatchUpdateOrdersDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders updated successfully',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
        failed: { type: 'number' },
        results: { 
          type: 'array',
          items: { type: 'object' }
        }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Put('admin/batch-update')
  async batchUpdateOrders(
    @Body(ValidationPipe) batchData: BatchUpdateOrdersDto
  ) {
    return this.ordersService.batchUpdateOrders(batchData);
  }

  @ApiOperation({ 
    summary: 'Get order risk analysis',
    description: 'Retrieve detailed risk analysis for a specific order.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Risk analysis retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        riskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        riskScore: { type: 'number' },
        factors: { 
          type: 'array',
          items: { type: 'string' }
        },
        recommendation: { type: 'string', enum: ['APPROVE', 'REVIEW', 'REJECT'] }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/risk-analysis')
  async getOrderRiskAnalysis(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrderRiskAnalysis(id);
  }

  @ApiOperation({ 
    summary: 'Re-evaluate order risk',
    description: 'Trigger a fresh risk evaluation for an order.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Risk re-evaluation completed'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/:id/re-evaluate-risk')
  async reEvaluateOrderRisk(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.reEvaluateOrderRisk(id);
  }

  @ApiOperation({ 
    summary: 'Export orders to CSV/Excel',
    description: 'Export filtered orders to various formats for analysis.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders exported successfully',
    schema: {
      type: 'object',
      properties: {
        format: { type: 'string' },
        fileName: { type: 'string' },
        downloadUrl: { type: 'string' },
        recordCount: { type: 'number' }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/export')
  async exportOrders(
    @Query('status') status?: string,
    @Query('dateRange') dateRange?: string,
    @Query('format') format: string = 'csv'
  ) {
    return this.ordersService.exportOrders({ status, dateRange, format });
  }

  @ApiOperation({ 
    summary: 'Get order audit trail',
    description: 'Retrieve complete audit trail for an order showing all status changes and actions.'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit trail retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timestamp: { type: 'string' },
          action: { type: 'string' },
          user: { type: 'string' },
          details: { type: 'object' },
          previousState: { type: 'object' },
          newState: { type: 'object' }
        }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id/audit-trail')
  async getOrderAuditTrail(@Param('id', ParseUUIDPipe) id: string): Promise<{ orderId: string; auditTrail: any[] }> {
    return this.ordersService.getOrderAuditTrail(id);
  }
}