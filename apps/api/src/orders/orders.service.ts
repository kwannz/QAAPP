import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProductsService } from '../products/products.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { MockOrdersService } from './mock-orders.service';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  OrderQueryDto,
  ConfirmOrderDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsResponseDto,
  BatchUpdateOrdersDto
} from './dto/orders.dto';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private database: DatabaseService,
    private productsService: ProductsService,
    private blockchainService: BlockchainService,
    private mockOrdersService: MockOrdersService,
  ) {}

  /**
   * 创建订单草稿
   */
  async createDraft(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto> {
    const { productId, usdtAmount, referrerCode } = createOrderDto;

    // 验证产品存在性和可用性
    const product = await this.database.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 检查产品是否可购买
    const availability = await this.productsService.checkAvailability(productId, usdtAmount);
    if (!availability.available) {
      throw new BadRequestException(availability.reason);
    }

    // 查找推荐人（如果有）
    let referrer = null;
    if (referrerCode) {
      referrer = await this.database.user.findUnique({
        where: { referralCode: referrerCode },
      });

      if (!referrer) {
        throw new BadRequestException('Invalid referrer code');
      }
    }

    // 获取用户信息
    const user = await this.database.user.findUnique({
      where: { id: userId },
      include: { agent: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 计算平台手续费
    const platformFeeConfig = await this.database.systemConfig.findUnique({
      where: { key: 'platform_fee_rate' },
    });

    const platformFeeRate = (platformFeeConfig?.value as any)?.rate || 0.005; // 默认0.5%
    const platformFee = usdtAmount * platformFeeRate;

    // 创建订单
    const order = await this.database.order.create({
      data: {
        userId,
        productId,
        usdtAmount: new Decimal(usdtAmount),
        platformFee: new Decimal(platformFee),
        status: OrderStatus.PENDING,
        referrerId: referrer?.id,
        agentId: user.agent?.id,
        metadata: {
          productSymbol: product.symbol,
          productName: product.name,
          userEmail: user.email,
          referrerCode: referrerCode,
        },
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
          },
        },
        referrer: {
          select: {
            id: true,
            referralCode: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            referralCode: true,
            email: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.createAuditLog(userId, 'ORDER_DRAFT_CREATE', 'ORDER', order.id, {
      productId,
      usdtAmount,
      platformFee,
      referrerCode,
    });

    this.logger.log(`Order draft created: ${order.id} for user ${userId}`);

    return this.formatOrderResponse(order);
  }

  // 原始确认订单方法已移到底部作为备用

  /**
   * 获取用户订单列表
   */
  async findUserOrders(userId: string, queryDto: OrderQueryDto = {}): Promise<OrderListResponseDto> {
    try {
      this.logger.log(`Finding orders for user ${userId}`);
      return await this.mockOrdersService.findUserOrders(userId, queryDto);
    } catch (error) {
      this.logger.error(`Failed to find orders for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 获取所有订单（管理员功能）
   */
  async findAll(queryDto: OrderQueryDto = {}): Promise<OrderListResponseDto> {
    // Delegate to mock service for now
    return this.mockOrdersService.findAll(queryDto);
  }

  /**
   * 创建订单
   */
  async create(createOrderDto: CreateOrderDto, userId?: string): Promise<OrderResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      this.logger.log(`Creating order for user ${userId}, product: ${createOrderDto.productId}, amount: ${createOrderDto.usdtAmount}`);
      
      const order = await this.mockOrdersService.create(createOrderDto, userId);
      
      // 自动创建持仓记录（如果订单创建成功）
      if (order.status === 'SUCCESS') {
        try {
          await this.positionsService.createPosition(
            {
              id: order.id,
              userId: order.userId,
              productId: order.productId,
              usdtAmount: order.usdtAmount,
              txHash: order.txHash,
              metadata: order.metadata
            },
            {
              id: order.productId,
              symbol: order.metadata?.productSymbol || 'UNKNOWN',
              name: order.metadata?.productName || 'Unknown Product',
              aprBps: 800, // 默认8%年化
              lockDays: 7,  // 默认7天锁定期
              nftTokenId: 1
            }
          );
          this.logger.log(`Position created for order ${order.id}`);
        } catch (error) {
          this.logger.warn(`Failed to create position for order ${order.id}:`, error);
        }
      }
      
      return order;
    } catch (error) {
      this.logger.error(`Failed to create order for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 更新订单
   */
  async update(orderId: string, updateOrderDto: UpdateOrderDto, userId?: string): Promise<OrderResponseDto> {
    // Delegate to mock service for now
    return this.mockOrdersService.update(orderId, updateOrderDto, userId);
  }

  /**
   * 获取所有订单（管理员功能）
   */
  async findAllOrders(queryDto: OrderQueryDto = {}) {
    const { page = 1, limit = 20, status, productId, userId } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      this.database.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              symbol: true,
              name: true,
              nftMetadata: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              referralCode: true,
            },
          },
          referrer: {
            select: {
              id: true,
              referralCode: true,
              email: true,
            },
          },
          agent: {
            select: {
              id: true,
              referralCode: true,
              email: true,
            },
          },
        },
      }),
      this.database.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * 根据ID获取订单详情
   */
  async findOne(orderId: string, userId?: string): Promise<OrderResponseDto> {
    // Delegate to mock service for now
    return this.mockOrdersService.findOne(orderId, userId);
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.database.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: OrderStatus.PENDING,
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or cannot be cancelled');
    }

    const cancelledOrder = await this.database.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELED,
        metadata: {
          ...(order.metadata as object || {}),
          cancelledAt: new Date().toISOString(),
          cancelReason: 'User requested cancellation',
        } as any,
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.createAuditLog(userId, 'ORDER_CANCEL', 'ORDER', orderId, {
      reason: 'User cancellation',
      amount: order.usdtAmount.toNumber(),
    });

    this.logger.log(`Order cancelled: ${orderId} by user ${userId}`);

    return this.formatOrderResponse(cancelledOrder);
  }

  /**
   * 创建持仓记录
   */
  private async createPosition(order: any) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + order.product.lockDays * 24 * 60 * 60 * 1000);
    const nextPayoutAt = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 第二天开始分红

    const position = await this.database.position.create({
      data: {
        userId: order.userId,
        productId: order.productId,
        orderId: order.id,
        principal: order.usdtAmount,
        startDate,
        endDate,
        nextPayoutAt,
        nftTokenId: order.product.nftTokenId,
        nftTokenUri: order.product.nftMetadata?.image || null,
        status: 'ACTIVE',
        metadata: {
          productSymbol: order.product.symbol,
          apr: order.product.aprBps / 100,
          lockDays: order.product.lockDays,
          txHash: order.txHash,
        },
      },
    });

    this.logger.log(`Position created: ${position.id} for order ${order.id}`);
    return position;
  }

  /**
   * 创建佣金记录
   */
  private async createCommissions(order: any) {
    const commissions = [];

    // 推荐佣金
    if (order.referrerId) {
      const referralRate = await this.database.systemConfig.findUnique({
        where: { key: 'referral_commission_rate' },
      });

      const rateBps = ((referralRate?.value as any)?.rate || 0.01) * 10000; // 转换为基点
      const amount = order.usdtAmount.toNumber() * (rateBps / 10000);

      const referralCommission = await this.database.commission.create({
        data: {
          userId: order.referrerId,
          orderId: order.id,
          basisAmount: order.usdtAmount,
          rateBps: rateBps,
          amount: new Decimal(amount),
          commissionType: 'REFERRAL',
          status: 'READY',
        },
      });

      commissions.push(referralCommission);
    }

    // 代理商佣金
    if (order.agentId) {
      const agentRate = await this.database.systemConfig.findUnique({
        where: { key: 'agent_commission_rate' },
      });

      const rateBps = ((agentRate?.value as any)?.rate || 0.03) * 10000; // 转换为基点
      const amount = order.usdtAmount.toNumber() * (rateBps / 10000);

      const agentCommission = await this.database.commission.create({
        data: {
          userId: order.agentId,
          orderId: order.id,
          basisAmount: order.usdtAmount,
          rateBps: rateBps,
          amount: new Decimal(amount),
          commissionType: 'AGENT',
          status: 'READY',
        },
      });

      commissions.push(agentCommission);
    }

    if (commissions.length > 0) {
      this.logger.log(`Created ${commissions.length} commission records for order ${order.id}`);
    }

    return commissions;
  }

  /**
   * 格式化订单响应
   */
  private formatOrderResponse(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      productId: order.productId,
      usdtAmount: order.usdtAmount.toNumber(),
      platformFee: order.platformFee.toNumber(),
      txHash: order.txHash,
      status: order.status,
      referrerId: order.referrerId,
      agentId: order.agentId,
      failureReason: order.failureReason,
      metadata: order.metadata,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      updatedAt: order.updatedAt,
      product: order.product ? {
        id: order.product.id,
        symbol: order.product.symbol,
        name: order.product.name,
        description: order.product.description,
        nftMetadata: order.product.nftMetadata,
      } : undefined,
      user: order.user,
      referrer: order.referrer,
      agent: order.agent,
      positions: order.positions,
    };
  }

  /**
   * 创建审计日志
   */
  private async createAuditLog(
    actorId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: any,
  ): Promise<void> {
    try {
      await this.database.auditLog.create({
        data: {
          actorId,
          actorType: 'USER',
          action,
          resourceType,
          resourceId,
          metadata,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  // ==================== Admin Methods (Mock Implementations) ====================

  /**
   * 获取管理员订单列表
   */
  async getAdminOrderList(filters: any): Promise<OrderListResponseDto> {
    return this.mockOrdersService.getAdminOrderList(filters);
  }

  /**
   * 获取订单统计
   */
  async getOrderStats(): Promise<OrderStatsResponseDto> {
    return this.mockOrdersService.getOrderStats();
  }

  /**
   * 批准订单
   */
  async approveOrder(id: string, approvalData: any): Promise<OrderResponseDto> {
    return this.mockOrdersService.approveOrder(id, approvalData);
  }

  /**
   * 拒绝订单
   */
  async rejectOrder(id: string, rejectionData: any): Promise<OrderResponseDto> {
    return this.mockOrdersService.rejectOrder(id, rejectionData);
  }

  /**
   * 批量更新订单
   */
  async batchUpdateOrders(batchData: BatchUpdateOrdersDto) {
    return this.mockOrdersService.batchUpdateOrders(batchData);
  }

  /**
   * 获取订单风险分析
   */
  async getOrderRiskAnalysis(id: string) {
    return this.mockOrdersService.getOrderRiskAnalysis(id);
  }

  /**
   * 重新评估订单风险
   */
  async reEvaluateOrderRisk(id: string) {
    return this.mockOrdersService.reEvaluateOrderRisk(id);
  }

  /**
   * 导出订单
   */
  async exportOrders(filters: any) {
    return this.mockOrdersService.exportOrders(filters);
  }

  /**
   * 获取订单审计跟踪
   */
  async getOrderAuditTrail(id: string) {
    return this.mockOrdersService.getOrderAuditTrail(id);
  }

  /**
   * 确认订单支付
   */
  async confirmOrder(orderId: string, confirmDto: ConfirmOrderDto, userId: string): Promise<OrderResponseDto> {
    try {
      this.logger.log(`Confirming order ${orderId} for user ${userId} with tx: ${confirmDto.txHash}`);
      
      const order = await this.mockOrdersService.confirmOrder(orderId, confirmDto, userId);
      
      // 如果订单确认成功，自动创建持仓记录
      if (order.status === 'SUCCESS') {
        try {
          await this.positionsService.createPosition(
            {
              id: order.id,
              userId: order.userId,
              productId: order.productId,
              usdtAmount: order.usdtAmount,
              txHash: order.txHash,
              metadata: order.metadata
            },
            {
              id: order.productId,
              symbol: order.metadata?.productSymbol || 'UNKNOWN',
              name: order.metadata?.productName || 'Unknown Product',
              aprBps: 800, // 默认8%年化
              lockDays: 7,  // 默认7天锁定期
              nftTokenId: 1
            }
          );
          this.logger.log(`Position created for confirmed order ${order.id}`);
        } catch (error) {
          this.logger.warn(`Failed to create position for confirmed order ${order.id}:`, error);
        }
      }
      
      return order;
    } catch (error) {
      this.logger.error(`Failed to confirm order ${orderId}:`, error);
      throw error;
    }
  }
}