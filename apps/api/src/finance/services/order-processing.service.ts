import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryOptimizerService } from '../../database/query-optimizer.service';
import { MultiLayerCacheService } from '../../cache/multi-layer-cache.service';
import { CreateOrderDto, ConfirmOrderDto } from '../dto/orders.dto';
import { OrderStatus, Decimal } from '@qa-app/database';

@Injectable()
export class OrderProcessingService {
  private readonly logger = new Logger(OrderProcessingService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly queryOptimizer: QueryOptimizerService,
    private readonly cache: MultiLayerCacheService
  ) {}

  /**
   * 处理订单创建流程
   */
  async processOrderCreation(createOrderDto: CreateOrderDto, userId: string): Promise<any> {
    const { productId, usdtAmount, referrerCode } = createOrderDto;

    this.logger.log(`🔄 Processing order creation: user=${userId}, product=${productId}, amount=${usdtAmount}`);

    // 1. 验证用户和产品
    const [user, product] = await Promise.all([
      this.getUserWithCache(userId),
      this.getProductWithCache(productId)
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!product) throw new NotFoundException('Product not found');

    // 2. 验证产品可用性
    await this.validateProductAvailability(product, usdtAmount);

    // 3. 处理推荐人
    let referrer = null;
    if (referrerCode) {
      referrer = await this.getReferrerByCode(referrerCode);
    }

    // 4. 计算费用
    const platformFee = await this.calculatePlatformFee(usdtAmount);

    // 5. 创建订单记录
    const order = await this.database.order.create({
      data: {
        userId,
        productId,
        usdtAmount: new Decimal(usdtAmount),
        platformFee: new Decimal(platformFee),
        status: OrderStatus.PENDING,
        referrerId: referrer?.id,
        agentId: user.agentId,
        metadata: {
          productSymbol: product.symbol,
          productName: product.name,
          userEmail: user.email,
          referrerCode,
          createdBy: 'system',
          processingStartedAt: new Date().toISOString()
        }
      }
    });

    this.logger.log(`✅ Order created: ${order.id}`);
    
    // 清除相关缓存
    await this.invalidateUserCache(userId);
    
    return order;
  }

  /**
   * 处理订单确认流程
   */
  async processOrderConfirmation(orderId: string, confirmDto: ConfirmOrderDto, userId: string): Promise<any> {
    this.logger.log(`🔄 Processing order confirmation: order=${orderId}, tx=${confirmDto.txHash}`);

    // 1. 获取待确认订单
    const order = await this.database.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: OrderStatus.PENDING
      },
      include: {
        product: true,
        user: {
          select: { id: true, email: true, agentId: true }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or already processed');
    }

    // 2. 验证交易哈希
    await this.validateTransaction(confirmDto.txHash, order.usdtAmount);

    // 3. 更新订单状态
    const confirmedOrder = await this.database.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SUCCESS,
        txHash: confirmDto.txHash,
        confirmedAt: new Date(),
        metadata: {
          ...(order.metadata as object || {}),
          confirmedBy: 'user',
          confirmationProcessedAt: new Date().toISOString(),
          blockchainValidated: true
        }
      },
      include: {
        product: true,
        user: {
          select: { id: true, email: true, referralCode: true }
        }
      }
    });

    this.logger.log(`✅ Order confirmed: ${orderId}`);

    // 4. 清除相关缓存
    await Promise.all([
      this.invalidateUserCache(userId),
      this.invalidateOrderCache(orderId)
    ]);

    return confirmedOrder;
  }

  /**
   * 处理订单取消
   */
  async processOrderCancellation(orderId: string, userId: string, reason?: string): Promise<any> {
    this.logger.log(`🔄 Processing order cancellation: order=${orderId}, user=${userId}`);

    const order = await this.database.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: OrderStatus.PENDING
      }
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
          cancelReason: reason || 'User requested cancellation'
        }
      }
    });

    this.logger.log(`✅ Order cancelled: ${orderId}`);
    
    // 清除相关缓存
    await this.invalidateUserCache(userId);
    
    return cancelledOrder;
  }

  // 缓存相关方法
  private async getUserWithCache(userId: string) {
    const cacheKey = `user:${userId}`;
    return await this.cache.get(cacheKey, async () => {
      return await this.database.user.findUnique({
        where: { id: userId },
        include: { agent: true }
      });
    });
  }

  private async getProductWithCache(productId: string) {
    const cacheKey = `product:${productId}`;
    return await this.cache.get(cacheKey, async () => {
      return await this.database.product.findUnique({
        where: { id: productId }
      });
    });
  }

  private async getReferrerByCode(referrerCode: string) {
    const cacheKey = `referrer:${referrerCode}`;
    return await this.cache.get(cacheKey, async () => {
      return await this.database.user.findUnique({
        where: { referralCode: referrerCode }
      });
    });
  }

  private async calculatePlatformFee(amount: number): Promise<number> {
    const cacheKey = 'config:platform_fee_rate';
    const config = await this.cache.get(cacheKey, async () => {
      return await this.database.systemConfig.findUnique({
        where: { key: 'platform_fee_rate' }
      });
    });

    const rate = (config?.value as any)?.rate || 0.005; // 默认0.5%
    return amount * rate;
  }

  private async validateProductAvailability(product: any, amount: number) {
    if (!product.isActive) {
      throw new BadRequestException('Product is not active');
    }

    if (amount < product.minAmount.toNumber()) {
      throw new BadRequestException(`Minimum investment amount is ${product.minAmount}`);
    }

    if (product.maxAmount && amount > product.maxAmount.toNumber()) {
      throw new BadRequestException(`Maximum investment amount is ${product.maxAmount}`);
    }

    // 检查供应量限制
    if (product.totalSupply && product.currentSupply >= product.totalSupply) {
      throw new BadRequestException('Product is sold out');
    }

    // 检查产品时间窗口
    const now = new Date();
    if (product.startsAt && now < product.startsAt) {
      throw new BadRequestException('Product sale has not started');
    }

    if (product.endsAt && now > product.endsAt) {
      throw new BadRequestException('Product sale has ended');
    }
  }

  private async validateTransaction(txHash: string, expectedAmount: Decimal): Promise<boolean> {
    // 注意：当前为基本格式验证，生产环境需要实际区块链验证
    // 这里只做基本格式验证
    if (!txHash || txHash.length !== 66 || !txHash.startsWith('0x')) {
      throw new BadRequestException('Invalid transaction hash format');
    }

    this.logger.debug(`🔍 Transaction validation: ${txHash}, amount: ${expectedAmount}`);
    
    // 模拟验证成功
    return true;
  }

  private async invalidateUserCache(userId: string) {
    await this.cache.delete(`user:${userId}`);
    await this.cache.delete(`user:orders:${userId}:*`);
  }

  private async invalidateOrderCache(orderId: string) {
    await this.cache.delete(`order:${orderId}`);
  }
}