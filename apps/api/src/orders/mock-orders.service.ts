import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { MockDatabaseService, MockOrder } from '../database/mock-database.service';
import { MockProductsService } from '../products/mock-products.service';
import { PositionsService } from '../positions/positions.service';

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
      status: 'PENDING',
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
    if (updateOrderDto.status === 'CANCELED' && order.status === 'PENDING') {
      const updatedOrder = await this.mockDatabase.updateOrder(id, {
        status: 'CANCELED',
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
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in pending status');
    }

    // 模拟区块链验证 - 在实际环境中这里会验证交易
    const simulatedSuccess = Math.random() > 0.1; // 90% 成功率

    if (simulatedSuccess) {
      const updatedOrder = await this.mockDatabase.updateOrder(orderId, {
        status: 'SUCCESS',
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
        status: 'FAILED',
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
    };
  }
}