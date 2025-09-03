import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProductsService } from '../products/products.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PositionsService } from '../positions/positions.service';
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
import { OrderStatus, Decimal } from '@qa-app/database';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private database: DatabaseService,
    private productsService: ProductsService,
    private blockchainService: BlockchainService,
    @Inject(forwardRef(() => PositionsService))
    private positionsService: PositionsService,
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
    const { page = 1, limit = 20, status, productId } = queryDto;
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    if (status) where.status = status;
    if (productId) where.productId = productId;
    
    const [orders, total] = await Promise.all([
      this.database.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, symbol: true, name: true } },
          positions: true
        }
      }),
      this.database.order.count({ where })
    ]);
    
    return {
      orders: orders.map(order => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
  }

  /**
   * 获取所有订单（管理员功能）
   */
  async findAll(queryDto: OrderQueryDto = {}): Promise<OrderListResponseDto> {
    return this.findAllOrders(queryDto);
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
      
      const order = await this.createDraft(createOrderDto, userId);
      
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
    const where: any = { id: orderId };
    if (userId) where.userId = userId;
    
    const order = await this.database.order.update({
      where,
      data: updateOrderDto as any,
      include: {
        product: true,
        user: { select: { id: true, email: true, referralCode: true } },
        referrer: { select: { id: true, referralCode: true, email: true } },
        agent: { select: { id: true, referralCode: true, email: true } },
        positions: true
      }
    });
    
    return this.formatOrderResponse(order);
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
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * 根据ID获取订单详情
   */
  async findOne(orderId: string, userId?: string): Promise<OrderResponseDto> {
    const where: any = { id: orderId };
    if (userId) where.userId = userId;
    
    const order = await this.database.order.findFirst({
      where,
      include: {
        product: true,
        user: { select: { id: true, email: true, referralCode: true } },
        referrer: { select: { id: true, referralCode: true, email: true } },
        agent: { select: { id: true, referralCode: true, email: true } },
        positions: true
      }
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return this.formatOrderResponse(order);
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
    return this.findAllOrders(filters);
  }

  /**
   * 获取订单统计
   */
  async getOrderStats(): Promise<OrderStatsResponseDto> {
    const [total, pending, success, failed, canceled] = await Promise.all([
      this.database.order.count(),
      this.database.order.count({ where: { status: 'PENDING' } }),
      this.database.order.count({ where: { status: 'SUCCESS' } }),
      this.database.order.count({ where: { status: 'FAILED' } }),
      this.database.order.count({ where: { status: 'CANCELED' } })
    ]);
    
    const totalAmount = await this.database.order.aggregate({
      _sum: { usdtAmount: true },
      where: { status: 'SUCCESS' }
    });
    
    return {
      total,
      pending,
      success,
      failed,
      canceled,
      totalVolume: totalAmount._sum.usdtAmount?.toNumber() || 0,
      averageOrderValue: total > 0 ? (totalAmount._sum.usdtAmount?.toNumber() || 0) / total : 0,
      todayOrders: 0,
      weekOrders: 0,
      monthOrders: 0,
      paymentTypes: {
        USDT: { count: 0, volume: 0 },
        ETH: { count: 0, volume: 0 },
        FIAT: { count: 0, volume: 0 }
      },
      topProducts: [],
      dailyTrends: []
    };
  }

  /**
   * 批准订单
   */
  async approveOrder(id: string, approvalData: any): Promise<OrderResponseDto> {
    const order = await this.database.order.update({
      where: { id },
      data: { status: 'SUCCESS', ...approvalData },
      include: {
        product: true,
        user: { select: { id: true, email: true, referralCode: true } }
      }
    });
    return this.formatOrderResponse(order);
  }

  /**
   * 拒绝订单
   */
  async rejectOrder(id: string, rejectionData: any): Promise<OrderResponseDto> {
    const order = await this.database.order.update({
      where: { id },
      data: { status: 'FAILED', failureReason: rejectionData.reason },
      include: {
        product: true,
        user: { select: { id: true, email: true, referralCode: true } }
      }
    });
    return this.formatOrderResponse(order);
  }

  /**
   * 批量更新订单
   */
  async batchUpdateOrders(batchData: BatchUpdateOrdersDto) {
    const results = [];
    for (const orderId of batchData.orderIds) {
      if (batchData.action === 'approve') {
        const result = await this.approveOrder(orderId, { notes: batchData.notes });
        results.push(result);
      } else if (batchData.action === 'reject') {
        const result = await this.rejectOrder(orderId, { reason: batchData.reason });
        results.push(result);
      }
    }
    return { updated: results.length, results };
  }

  /**
   * 获取订单风险分析
   */
  async getOrderRiskAnalysis(id: string) {
    const order = await this.database.order.findUnique({
      where: { id },
      include: { user: true, product: true }
    });
    if (!order) throw new NotFoundException('Order not found');
    
    return {
      orderId: id,
      riskScore: Math.random() * 100,
      riskLevel: 'LOW',
      factors: ['standard_transaction']
    };
  }

  /**
   * 重新评估订单风险
   */
  async reEvaluateOrderRisk(id: string) {
    return this.getOrderRiskAnalysis(id);
  }

  /**
   * 导出订单
   */
  async exportOrders(filters: any) {
    const orders = await this.findAllOrders(filters);
    return { format: 'csv', data: orders.orders };
  }

  /**
   * 获取订单审计跟踪
   */
  async getOrderAuditTrail(id: string): Promise<{ orderId: string; auditTrail: any[] }> {
    const auditLogs = await this.database.auditLog.findMany({
      where: { resourceId: id, resourceType: 'ORDER' },
      orderBy: { createdAt: 'desc' }
    });
    return { orderId: id, auditTrail: auditLogs };
  }

  /**
   * 确认订单支付
   */
  async confirmOrder(orderId: string, confirmDto: ConfirmOrderDto, userId: string): Promise<OrderResponseDto> {
    const order = await this.database.order.findFirst({
      where: { id: orderId, userId, status: 'PENDING' },
      include: { product: true }
    });
    
    if (!order) throw new NotFoundException('Order not found');
    
    const confirmedOrder = await this.database.order.update({
      where: { id: orderId },
      data: {
        status: 'SUCCESS',
        txHash: confirmDto.txHash,
        confirmedAt: new Date()
      },
      include: {
        product: true,
        user: { select: { id: true, email: true, referralCode: true } },
        referrer: { select: { id: true, referralCode: true, email: true } },
        agent: { select: { id: true, referralCode: true, email: true } },
        positions: true
      }
    });
    
    // 创建持仓记录
    if (confirmedOrder.status === 'SUCCESS') {
      try {
        await this.positionsService.createPosition(
          {
            id: confirmedOrder.id,
            userId: confirmedOrder.userId,
            productId: confirmedOrder.productId,
            usdtAmount: confirmedOrder.usdtAmount.toNumber(),
            txHash: confirmedOrder.txHash,
            metadata: confirmedOrder.metadata
          },
          {
            id: confirmedOrder.productId,
            symbol: confirmedOrder.product.symbol,
            name: confirmedOrder.product.name,
            aprBps: confirmedOrder.product.aprBps,
            lockDays: confirmedOrder.product.lockDays,
            nftTokenId: confirmedOrder.product.nftTokenId
          }
        );
        this.logger.log(`Position created for confirmed order ${orderId}`);
      } catch (error) {
        this.logger.warn(`Failed to create position for confirmed order ${orderId}:`, error);
      }
    }
    
    return this.formatOrderResponse(confirmedOrder);
  }
}