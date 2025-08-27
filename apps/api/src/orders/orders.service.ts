import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProductsService } from '../products/products.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  OrderQueryDto,
  ConfirmOrderDto,
  OrderResponseDto 
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

  /**
   * 确认订单并处理支付
   */
  async confirmOrder(orderId: string, confirmDto: ConfirmOrderDto, userId: string): Promise<OrderResponseDto> {
    const { txHash, signature } = confirmDto;

    // 查找订单
    const order = await this.database.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: OrderStatus.PENDING,
      },
      include: {
        product: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or not in pending status');
    }

    try {
      // 验证区块链交易
      const txReceipt = await this.blockchainService.getTransactionReceipt(txHash);
      
      if (!txReceipt || txReceipt.status !== 'success') {
        throw new BadRequestException('Transaction failed or not found');
      }

      // 验证交易金额和接收地址（这里需要实际的区块链验证逻辑）
      const isValidTransaction = await this.blockchainService.validateTransaction(
        txHash,
        order.usdtAmount.toNumber(),
        order.product.symbol,
      );

      if (!isValidTransaction) {
        throw new BadRequestException('Invalid transaction');
      }

      // 更新订单状态
      const confirmedOrder = await this.database.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.SUCCESS,
          txHash,
          confirmedAt: new Date(),
          metadata: {
            ...(order.metadata as object || {}),
            signature,
            blockNumber: txReceipt.blockNumber,
            gasUsed: txReceipt.gasUsed,
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

      // 更新产品供应量
      if (order.product.totalSupply) {
        await this.database.product.update({
          where: { id: order.productId },
          data: {
            currentSupply: {
              increment: 1,
            },
          },
        });
      }

      // 创建持仓记录
      await this.createPosition(confirmedOrder);

      // 创建佣金记录
      await this.createCommissions(confirmedOrder);

      // 记录审计日志
      await this.createAuditLog(userId, 'ORDER_CONFIRM', 'ORDER', orderId, {
        txHash,
        amount: order.usdtAmount.toNumber(),
        productSymbol: order.product.symbol,
      });

      this.logger.log(`Order confirmed: ${orderId} with tx ${txHash}`);

      return this.formatOrderResponse(confirmedOrder);
    } catch (error) {
      // 如果确认失败，更新订单状态为失败
      await this.database.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.FAILED,
          failureReason: error.message,
          metadata: {
            ...(order.metadata as object || {}),
            failureDetails: error.toString(),
            failedAt: new Date().toISOString(),
          } as any,
        },
      });

      this.logger.error(`Order confirmation failed: ${orderId}`, error);
      throw error;
    }
  }

  /**
   * 获取用户订单列表
   */
  async findUserOrders(userId: string, queryDto: OrderQueryDto = {}) {
    const { page = 1, limit = 20, status, productId } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (productId) {
      where.productId = productId;
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
   * 获取所有订单（管理员功能）
   */
  async findAll(queryDto: OrderQueryDto = {}) {
    return this.findAllOrders(queryDto);
  }

  /**
   * 创建订单
   */
  async create(createOrderDto: CreateOrderDto, userId?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.createDraft(createOrderDto, userId);
  }

  /**
   * 更新订单
   */
  async update(orderId: string, updateOrderDto: UpdateOrderDto, userId?: string) {
    // 基本的更新逻辑，可以根据需要扩展
    if (updateOrderDto.status === OrderStatus.CANCELED && userId) {
      return this.cancelOrder(orderId, userId);
    }
    throw new BadRequestException('Update operation not supported');
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
  async findOne(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    
    // 如果不是管理员调用，只能查看自己的订单
    if (userId) {
      where.userId = userId;
    }

    const order = await this.database.order.findFirst({
      where,
      include: {
        product: {
          select: {
            id: true,
            symbol: true,
            name: true,
            description: true,
            aprBps: true,
            lockDays: true,
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
        positions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            nftTokenId: true,
          },
        },
      },
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
}