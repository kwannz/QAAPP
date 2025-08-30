import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { MockDatabaseService, MockOrder } from '../database/mock-database.service';
import { MockProductsService } from '../products/mock-products.service';
import { PositionsService } from '../positions/positions.service';
import { OrderStatus } from '@qa-app/database';

@Injectable()
export class MockOrdersService {
  private readonly logger = new Logger(MockOrdersService.name);

  constructor(
    private mockDatabase: MockDatabaseService,
    private mockProductsService: MockProductsService,
    private positionsService: PositionsService,
  ) {}

  async findAll(queryDto: any = {}): Promise<{
    orders: MockOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    // 简化的查询实现
    const allOrders = Array.from((this.mockDatabase as any).orders.values()) as MockOrder[];
    const total = allOrders.length;
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      orders: allOrders.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string, userId?: string): Promise<MockOrder> {
    const order = await this.mockDatabase.findOrder(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    // 如果指定了用户ID，检查权限
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async create(createOrderDto: any, userId?: string): Promise<MockOrder> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const { productId, usdtAmount, ethAmount, paymentType = 'USDT', referrerCode } = createOrderDto;
    
    // 确定实际支付金额
    const paymentAmount = paymentType === 'ETH' ? ethAmount : usdtAmount;
    
    // 如果是ETH支付，需要转换为等值USDT进行验证
    let equivalentUSDT = usdtAmount;
    if (paymentType === 'ETH') {
      // 简化处理：1 ETH = 2000 USDT
      equivalentUSDT = ethAmount * 2000;
    }

    // 验证产品
    const availability = await this.mockProductsService.checkAvailability(productId, equivalentUSDT);
    if (!availability.available) {
      throw new BadRequestException(availability.reason);
    }

    // 计算平台手续费 (0.5%)
    const platformFee = equivalentUSDT * 0.005;

    // 创建订单
    const order = await this.mockDatabase.createOrder({
      userId,
      productId,
      usdtAmount: equivalentUSDT, // 存储等值USDT金额
      platformFee,
      status: OrderStatus.PENDING,
      metadata: {
        productSymbol: 'MOCK_PRODUCT',
        referrerCode,
        paymentType,
        originalAmount: paymentAmount,
        ethAmount: paymentType === 'ETH' ? ethAmount : null,
        ethToUsdtRate: paymentType === 'ETH' ? 2000 : null,
      },
    });

    this.logger.log(`Created order ${order.id} for user ${userId}`);
    return order;
  }

  async update(id: string, updateOrderDto: any, userId?: string): Promise<MockOrder> {
    const order = await this.findOne(id, userId);
    
    // 只允许取消待处理的订单
    if (updateOrderDto.status === OrderStatus.CANCELED && order.status === OrderStatus.PENDING) {
      const updatedOrder = await this.mockDatabase.updateOrder(id, {
        status: OrderStatus.CANCELED,
        metadata: {
          ...order.metadata,
          cancelledAt: new Date().toISOString(),
          cancelReason: 'User requested cancellation',
        },
      });
      
      if (!updatedOrder) {
        throw new NotFoundException('Failed to update order');
      }

      this.logger.log(`Order ${id} cancelled by user ${userId}`);
      return updatedOrder;
    }

    throw new BadRequestException('Update operation not supported');
  }

  async confirmOrder(orderId: string, confirmDto: any, userId: string): Promise<MockOrder> {
    const { txHash } = confirmDto;
    
    const order = await this.findOne(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    // 模拟区块链验证 - 在实际环境中这里会验证交易
    const simulatedSuccess = Math.random() > 0.1; // 90% 成功率

    if (simulatedSuccess) {
      const updatedOrder = await this.mockDatabase.updateOrder(orderId, {
        status: OrderStatus.SUCCESS,
        txHash,
        confirmedAt: new Date(),
        metadata: {
          ...order.metadata,
          blockNumber: Math.floor(Math.random() * 1000000),
          gasUsed: Math.floor(Math.random() * 100000) + 21000,
        },
      });

      this.logger.log(`Order ${orderId} confirmed with tx ${txHash}`);

      // 订单确认成功后，自动创建持仓
      try {
        const product = await this.mockDatabase.findProduct(order.productId);
        if (product) {
          // 创建持仓
          const position = await this.positionsService.createPosition(updatedOrder, product);
          this.logger.log(`Position ${position.id} created for confirmed order ${orderId}`);
        } else {
          this.logger.warn(`Product ${order.productId} not found for order ${orderId}, position not created`);
        }
      } catch (positionError) {
        this.logger.error(`Failed to create position for order ${orderId}:`, positionError);
        // 不抛出错误，因为订单确认已成功，持仓创建失败不应影响订单状态
      }

      return updatedOrder!;
    } else {
      const updatedOrder = await this.mockDatabase.updateOrder(orderId, {
        status: OrderStatus.FAILED,
        failureReason: 'Transaction verification failed',
        metadata: {
          ...order.metadata,
          failureDetails: 'Simulated blockchain verification failure',
        },
      });

      throw new BadRequestException('Transaction verification failed');
    }
  }

  async findUserOrders(userId: string, queryDto: any = {}) {
    const userOrders = await this.mockDatabase.findUserOrders(userId);
    const total = userOrders.length;
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      orders: userOrders.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // Admin methods - Mock implementations
  async getAdminOrderList(filters: any) {
    return this.findAll(filters);
  }

  async getOrderStats() {
    const allOrders = Array.from((this.mockDatabase as any).orders.values()) as MockOrder[];
    const totalVolume = allOrders
      .filter(o => o.status === OrderStatus.SUCCESS)
      .reduce((sum, order) => sum + order.usdtAmount, 0);
    
    const successOrders = allOrders.filter(o => o.status === OrderStatus.SUCCESS);
    const averageOrderValue = successOrders.length > 0 ? totalVolume / successOrders.length : 0;
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === OrderStatus.PENDING).length,
      success: allOrders.filter(o => o.status === OrderStatus.SUCCESS).length,
      failed: allOrders.filter(o => o.status === OrderStatus.FAILED).length,
      canceled: allOrders.filter(o => o.status === OrderStatus.CANCELED).length,
      totalVolume,
      averageOrderValue,
      todayOrders: allOrders.filter(o => o.createdAt >= todayStart).length,
      weekOrders: allOrders.filter(o => o.createdAt >= weekStart).length,
      monthOrders: allOrders.filter(o => o.createdAt >= monthStart).length,
      paymentTypes: {
        USDT: { count: 0, volume: 0 },
        ETH: { count: 0, volume: 0 },
        FIAT: { count: 0, volume: 0 },
      },
      topProducts: [],
      dailyTrends: [],
    };
  }

  async approveOrder(id: string, approvalData: any) {
    const order = await this.findOne(id);
    return this.mockDatabase.updateOrder(id, { status: OrderStatus.SUCCESS, metadata: { ...order.metadata, approvalData, approved: true } });
  }

  async rejectOrder(id: string, rejectionData: any) {
    const order = await this.findOne(id);
    return this.mockDatabase.updateOrder(id, { status: OrderStatus.FAILED, metadata: { ...order.metadata, rejectionData, rejected: true } });
  }

  async batchUpdateOrders(batchData: any) {
    const { orderIds, action } = batchData;
    const results = [];
    for (const id of orderIds) {
      if (action === 'approve') {
        results.push(await this.approveOrder(id, batchData));
      } else if (action === 'reject') {
        results.push(await this.rejectOrder(id, batchData));
      }
    }
    return { updated: results.length, results };
  }

  async getOrderRiskAnalysis(id: string) {
    const order = await this.findOne(id);
    return {
      orderId: id,
      riskLevel: 'LOW',
      riskScore: 0.2,
      factors: ['No suspicious patterns detected'],
      recommendation: 'APPROVE'
    };
  }

  async reEvaluateOrderRisk(id: string) {
    return this.getOrderRiskAnalysis(id);
  }

  async exportOrders(filters: any) {
    const orders = await this.findAll(filters);
    return {
      format: filters.format || 'csv',
      data: orders.orders,
      fileName: `orders_export_${Date.now()}.${filters.format || 'csv'}`
    };
  }

  async getOrderAuditTrail(id: string) {
    return [
      {
        timestamp: new Date().toISOString(),
        action: 'CREATED',
        user: 'system',
        details: 'Order created'
      }
    ];
  }
}