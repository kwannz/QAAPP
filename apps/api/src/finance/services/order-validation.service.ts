import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { MultiLayerCacheService } from '../../cache/multi-layer-cache.service';
import { CreateOrderDto } from '../dto/orders.dto';
import { OrderStatus } from '@qa-app/database';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class OrderValidationService {
  private readonly logger = new Logger(OrderValidationService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly cache: MultiLayerCacheService
  ) {}

  /**
   * 综合订单验证
   */
  async validateOrderCreation(createOrderDto: CreateOrderDto, userId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.logger.debug(`🔍 Validating order creation for user ${userId}`);

    // 并行执行所有验证
    const validationResults = await Promise.allSettled([
      this.validateUser(userId),
      this.validateProduct(createOrderDto.productId),
      this.validateAmount(createOrderDto.usdtAmount),
      this.validateUserLimits(userId, createOrderDto.usdtAmount),
      this.validateReferrer(createOrderDto.referrerCode),
      this.validateRiskFactors(userId, createOrderDto)
    ]);

    // 收集验证结果
    validationResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const validationNames = [
          'User validation',
          'Product validation', 
          'Amount validation',
          'User limits validation',
          'Referrer validation',
          'Risk validation'
        ];
        errors.push(`${validationNames[index]}: ${result.reason}`);
      } else if (result.value) {
        if (result.value.error) errors.push(result.value.error);
        if (result.value.warning) warnings.push(result.value.warning);
      }
    });

    const isValid = errors.length === 0;
    
    this.logger.log(`📊 Validation result: ${isValid ? '✅ PASS' : '❌ FAIL'} (${errors.length} errors, ${warnings.length} warnings)`);

    return {
      isValid,
      errors,
      warnings,
      metadata: {
        validatedAt: new Date().toISOString(),
        userId,
        productId: createOrderDto.productId
      }
    };
  }

  /**
   * 验证用户状态
   */
  private async validateUser(userId: string): Promise<{ error?: string; warning?: string }> {
    const user = await this.database.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (!user.isActive) {
      return { error: 'User account is deactivated' };
    }

    if (user.kycStatus === 'REJECTED') {
      return { error: 'User KYC verification failed' };
    }

    if (user.kycStatus === 'PENDING') {
      return { warning: 'User KYC verification is pending' };
    }

    if (user.kycStatus === 'EXPIRED') {
      return { error: 'User KYC verification has expired' };
    }

    return {};
  }

  /**
   * 验证产品状态
   */
  private async validateProduct(productId: string): Promise<{ error?: string; warning?: string }> {
    const product = await this.database.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    if (!product.isActive) {
      return { error: 'Product is not active' };
    }

    const now = new Date();
    
    if (product.startsAt && now < product.startsAt) {
      return { error: `Product sale starts at ${product.startsAt.toISOString()}` };
    }

    if (product.endsAt && now > product.endsAt) {
      return { error: `Product sale ended at ${product.endsAt.toISOString()}` };
    }

    // 检查库存
    if (product.totalSupply && product.currentSupply >= product.totalSupply) {
      return { error: 'Product is sold out' };
    }

    // 检查即将售罄
    if (product.totalSupply && product.currentSupply > product.totalSupply * 0.9) {
      return { warning: 'Product stock is low (less than 10% remaining)' };
    }

    return {};
  }

  /**
   * 验证投资金额
   */
  private async validateAmount(amount: number): Promise<{ error?: string; warning?: string }> {
    if (amount <= 0) {
      return { error: 'Investment amount must be positive' };
    }

    if (amount < 10) {
      return { error: 'Minimum investment amount is 10 USDT' };
    }

    if (amount > 1000000) {
      return { error: 'Maximum investment amount is 1,000,000 USDT' };
    }

    // 检查是否为可疑金额
    if (amount > 100000) {
      return { warning: 'Large investment amount detected, may require additional verification' };
    }

    return {};
  }

  /**
   * 验证用户投资限制
   */
  private async validateUserLimits(userId: string, amount: number): Promise<{ error?: string; warning?: string }> {
    // 获取用户总投资金额
    const userStats = await this.database.order.aggregate({
      where: {
        userId,
        status: OrderStatus.SUCCESS
      },
      _sum: {
        usdtAmount: true
      }
    });

    const totalInvestment = userStats._sum.usdtAmount?.toNumber() || 0;
    const newTotal = totalInvestment + amount;

    // 检查投资限制
    const maxUserInvestment = 500000; // 单用户最大投资限制
    if (newTotal > maxUserInvestment) {
      return { error: `Total investment limit exceeded. Current: ${totalInvestment}, Limit: ${maxUserInvestment}` };
    }

    // 检查每日投资限制
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyInvestment = await this.database.order.aggregate({
      where: {
        userId,
        status: OrderStatus.SUCCESS,
        createdAt: { gte: today }
      },
      _sum: {
        usdtAmount: true
      }
    });

    const dailyTotal = (dailyInvestment._sum.usdtAmount?.toNumber() || 0) + amount;
    const maxDailyInvestment = 50000; // 每日最大投资限制

    if (dailyTotal > maxDailyInvestment) {
      return { error: `Daily investment limit exceeded. Daily total would be: ${dailyTotal}, Limit: ${maxDailyInvestment}` };
    }

    // 警告用户接近限制
    if (newTotal > maxUserInvestment * 0.8) {
      return { warning: `Approaching total investment limit (${Math.round(newTotal / maxUserInvestment * 100)}%)` };
    }

    return {};
  }

  /**
   * 验证推荐人
   */
  private async validateReferrer(referrerCode?: string): Promise<{ error?: string; warning?: string }> {
    if (!referrerCode) return {};

    const referrer = await this.database.user.findUnique({
      where: { referralCode: referrerCode }
    });

    if (!referrer) {
      return { error: 'Invalid referrer code' };
    }

    if (!referrer.isActive) {
      return { error: 'Referrer account is deactivated' };
    }

    if (referrer.kycStatus !== 'APPROVED') {
      return { warning: 'Referrer KYC verification is not complete' };
    }

    return {};
  }

  /**
   * 验证风险因素
   */
  private async validateRiskFactors(userId: string, createOrderDto: CreateOrderDto): Promise<{ error?: string; warning?: string }> {
    // 检查用户是否在风险黑名单
    const riskUser = await this.database.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, lastLoginAt: true, createdAt: true }
    });

    if (!riskUser) {
      return { error: 'User not found for risk assessment' };
    }

    // 检查新用户大额投资
    const accountAge = Date.now() - riskUser.createdAt.getTime();
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
    
    if (accountAgeDays < 1 && createOrderDto.usdtAmount > 1000) {
      return { warning: 'New user making large investment - flagged for review' };
    }

    // 检查异常投资模式
    const recentOrders = await this.database.order.count({
      where: {
        userId,
        status: OrderStatus.SUCCESS,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 最近24小时
        }
      }
    });

    if (recentOrders > 10) {
      return { warning: 'High frequency trading detected - may require additional verification' };
    }

    // 检查用户最后登录时间
    if (riskUser.lastLoginAt) {
      const daysSinceLogin = (Date.now() - riskUser.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > 30) {
        return { warning: 'User has not logged in for over 30 days' };
      }
    }

    return {};
  }

  // 缓存失效方法
  private async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(`user:${userId}`),
      this.cache.delete(`user:orders:${userId}:*`),
      this.cache.delete(`user:stats:${userId}`)
    ]);
  }

  private async invalidateOrderCache(orderId: string): Promise<void> {
    await this.cache.delete(`order:${orderId}`);
  }
}