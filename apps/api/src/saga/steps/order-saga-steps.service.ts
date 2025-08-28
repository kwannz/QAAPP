import { Injectable, Logger } from '@nestjs/common';
import { SagaStepHandler, RetryPolicy, OrderSagaEvents } from '@qa-app/shared';
import { OrderService } from '../../order/order.service';
import { UserService } from '../../user/user.service';
import { PositionService } from '../../position/position.service';
import { AuditService } from '../../audit/audit.service';
import { PaymentService } from '../../payment/payment.service'; // 假设存在
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * 订单创建步骤处理器
 */
@Injectable()
export class CreateOrderStepHandler implements SagaStepHandler {
  private readonly logger = new Logger(CreateOrderStepHandler.name);

  constructor(
    private orderService: OrderService,
    private eventEmitter: EventEmitter2
  ) {}

  async execute(
    payload: { userId: number; positionId: string; amount: number; price: number },
    context: Record<string, any>
  ): Promise<{ orderId: string; totalAmount: number }> {
    this.logger.debug('Creating order:', payload);

    // 创建订单
    const order = await this.orderService.create({
      userId: payload.userId,
      positionId: payload.positionId,
      amount: payload.amount,
      price: payload.price,
      status: 'PENDING'
    });

    const result = {
      orderId: order.id,
      totalAmount: payload.amount * payload.price
    };

    // 发布领域事件
    const event: OrderSagaEvents['OrderCreated'] = {
      orderId: order.id,
      userId: payload.userId,
      positionId: payload.positionId,
      amount: payload.amount,
      price: payload.price
    };

    this.eventEmitter.emit('order.created', event);

    return result;
  }

  async compensate(
    result: { orderId: string; totalAmount: number },
    context: Record<string, any>
  ): Promise<void> {
    this.logger.debug('Compensating order creation:', result);

    // 取消订单
    await this.orderService.cancel(result.orderId, 'SAGA_COMPENSATION');

    // 发布补偿事件
    const event: OrderSagaEvents['OrderCancelled'] = {
      orderId: result.orderId,
      reason: 'SAGA_COMPENSATION'
    };

    this.eventEmitter.emit('order.cancelled', event);
  }

  async validate(payload: any): Promise<boolean> {
    // 验证用户是否存在
    if (!payload.userId || typeof payload.userId !== 'number') {
      return false;
    }

    // 验证金额是否有效
    if (!payload.amount || payload.amount <= 0) {
      return false;
    }

    // 验证价格是否有效
    if (!payload.price || payload.price <= 0) {
      return false;
    }

    return true;
  }

  getTimeout(): number {
    return 30000; // 30秒超时
  }

  getRetryPolicy(): RetryPolicy {
    return {
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000,
      maxDelay: 10000,
      jitter: true
    };
  }
}

/**
 * 支付处理步骤处理器
 */
@Injectable()
export class ProcessPaymentStepHandler implements SagaStepHandler {
  private readonly logger = new Logger(ProcessPaymentStepHandler.name);

  constructor(
    private paymentService: PaymentService,
    private eventEmitter: EventEmitter2
  ) {}

  async execute(
    payload: { orderId: string; userId: number; amount: number },
    context: Record<string, any>
  ): Promise<{ paymentId: string; transactionId: string }> {
    this.logger.debug('Processing payment:', payload);

    // 处理支付
    const payment = await this.paymentService.processPayment({
      orderId: payload.orderId,
      userId: payload.userId,
      amount: payload.amount,
      currency: 'USD',
      method: 'BALANCE' // 使用账户余额
    });

    const result = {
      paymentId: payment.id,
      transactionId: payment.transactionId
    };

    // 发布支付完成事件
    const event: OrderSagaEvents['PaymentProcessed'] = {
      paymentId: payment.id,
      orderId: payload.orderId,
      amount: payload.amount
    };

    this.eventEmitter.emit('payment.processed', event);

    return result;
  }

  async compensate(
    result: { paymentId: string; transactionId: string },
    context: Record<string, any>
  ): Promise<void> {
    this.logger.debug('Compensating payment:', result);

    // 退款
    const refund = await this.paymentService.refundPayment(
      result.paymentId,
      'SAGA_COMPENSATION'
    );

    // 发布退款事件
    const event: OrderSagaEvents['PaymentRefunded'] = {
      paymentId: result.paymentId,
      refundId: refund.id,
      amount: refund.amount
    };

    this.eventEmitter.emit('payment.refunded', event);
  }

  async validate(payload: any): Promise<boolean> {
    // 验证订单ID
    if (!payload.orderId || typeof payload.orderId !== 'string') {
      return false;
    }

    // 验证用户余额是否充足
    const userBalance = await this.paymentService.getUserBalance(payload.userId);
    if (userBalance < payload.amount) {
      return false;
    }

    return true;
  }

  getTimeout(): number {
    return 60000; // 60秒超时
  }

  getRetryPolicy(): RetryPolicy {
    return {
      maxAttempts: 2,
      backoffStrategy: 'exponential',
      baseDelay: 2000,
      maxDelay: 10000,
      jitter: false
    };
  }
}

/**
 * 仓位更新步骤处理器
 */
@Injectable()
export class UpdatePositionStepHandler implements SagaStepHandler {
  private readonly logger = new Logger(UpdatePositionStepHandler.name);

  constructor(
    private positionService: PositionService,
    private eventEmitter: EventEmitter2
  ) {}

  async execute(
    payload: { positionId: string; orderId: string; quantityChange: number },
    context: Record<string, any>
  ): Promise<{ previousQuantity: number; newQuantity: number; positionValue: number }> {
    this.logger.debug('Updating position:', payload);

    // 获取当前仓位
    const currentPosition = await this.positionService.findById(payload.positionId);
    if (!currentPosition) {
      throw new Error(`Position not found: ${payload.positionId}`);
    }

    const previousQuantity = currentPosition.quantity;
    const newQuantity = previousQuantity + payload.quantityChange;

    // 更新仓位
    const updatedPosition = await this.positionService.updateQuantity(
      payload.positionId,
      newQuantity
    );

    const result = {
      previousQuantity,
      newQuantity,
      positionValue: updatedPosition.value
    };

    // 发布仓位更新事件
    const event: OrderSagaEvents['PositionUpdated'] = {
      positionId: payload.positionId,
      orderId: payload.orderId,
      newQuantity
    };

    this.eventEmitter.emit('position.updated', event);

    return result;
  }

  async compensate(
    result: { previousQuantity: number; newQuantity: number; positionValue: number },
    context: Record<string, any>
  ): Promise<void> {
    this.logger.debug('Compensating position update:', result);

    const positionId = context.positionId || context.payload?.positionId;
    
    // 恢复仓位到原始数量
    await this.positionService.updateQuantity(positionId, result.previousQuantity);

    // 发布仓位恢复事件
    const event: OrderSagaEvents['PositionReverted'] = {
      positionId,
      previousQuantity: result.previousQuantity
    };

    this.eventEmitter.emit('position.reverted', event);
  }

  async validate(payload: any): Promise<boolean> {
    // 验证仓位ID
    if (!payload.positionId || typeof payload.positionId !== 'string') {
      return false;
    }

    // 验证数量变化
    if (!payload.quantityChange || typeof payload.quantityChange !== 'number') {
      return false;
    }

    // 验证仓位是否存在
    const position = await this.positionService.findById(payload.positionId);
    if (!position) {
      return false;
    }

    // 验证操作后数量不会为负
    const newQuantity = position.quantity + payload.quantityChange;
    if (newQuantity < 0) {
      return false;
    }

    return true;
  }

  getTimeout(): number {
    return 20000; // 20秒超时
  }

  getRetryPolicy(): RetryPolicy {
    return {
      maxAttempts: 3,
      backoffStrategy: 'linear',
      baseDelay: 500,
      maxDelay: 5000,
      jitter: true
    };
  }
}

/**
 * 审计日志步骤处理器
 */
@Injectable()
export class CreateAuditLogStepHandler implements SagaStepHandler {
  private readonly logger = new Logger(CreateAuditLogStepHandler.name);

  constructor(
    private auditService: AuditService,
    private eventEmitter: EventEmitter2
  ) {}

  async execute(
    payload: { 
      entityType: string; 
      entityId: string; 
      action: string; 
      userId: number;
      details: any 
    },
    context: Record<string, any>
  ): Promise<{ auditId: string }> {
    this.logger.debug('Creating audit log:', payload);

    const auditLog = await this.auditService.createLog({
      entityType: payload.entityType,
      entityId: payload.entityId,
      action: payload.action,
      userId: payload.userId,
      details: payload.details,
      timestamp: new Date(),
      sagaId: context.sagaId // 关联到Saga执行
    });

    const result = { auditId: auditLog.id };

    // 发布审计日志创建事件
    const event: OrderSagaEvents['AuditLogCreated'] = {
      auditId: auditLog.id,
      entityType: payload.entityType,
      entityId: payload.entityId,
      action: payload.action
    };

    this.eventEmitter.emit('audit.created', event);

    return result;
  }

  async compensate(
    result: { auditId: string },
    context: Record<string, any>
  ): Promise<void> {
    this.logger.debug('Compensating audit log creation:', result);

    // 审计日志通常不需要补偿，但可以标记为已撤销
    await this.auditService.markAsReverted(result.auditId, 'SAGA_COMPENSATION');
  }

  async validate(payload: any): Promise<boolean> {
    // 验证必填字段
    return !!(
      payload.entityType &&
      payload.entityId &&
      payload.action &&
      payload.userId
    );
  }

  getTimeout(): number {
    return 10000; // 10秒超时
  }

  getRetryPolicy(): RetryPolicy {
    return {
      maxAttempts: 2,
      backoffStrategy: 'fixed',
      baseDelay: 1000,
      jitter: false
    };
  }
}

/**
 * 风险检查步骤处理器
 */
@Injectable()
export class RiskCheckStepHandler implements SagaStepHandler {
  private readonly logger = new Logger(RiskCheckStepHandler.name);

  constructor(
    private userService: UserService,
    private positionService: PositionService
  ) {}

  async execute(
    payload: { 
      userId: number; 
      positionId: string; 
      amount: number; 
      price: number 
    },
    context: Record<string, any>
  ): Promise<{ riskScore: number; approved: boolean; limits: any }> {
    this.logger.debug('Performing risk check:', payload);

    // 获取用户风险配置
    const userRisk = await this.userService.getRiskProfile(payload.userId);
    
    // 计算交易金额
    const tradeAmount = payload.amount * payload.price;
    
    // 获取用户当前仓位总值
    const totalPositionValue = await this.positionService.getUserTotalValue(payload.userId);
    
    // 计算风险指标
    const riskScore = this.calculateRiskScore(
      tradeAmount,
      totalPositionValue,
      userRisk
    );

    const approved = riskScore <= userRisk.maxRiskScore;

    const result = {
      riskScore,
      approved,
      limits: {
        maxTradeAmount: userRisk.maxTradeAmount,
        maxPositionValue: userRisk.maxPositionValue,
        currentPositionValue: totalPositionValue
      }
    };

    if (!approved) {
      throw new Error(`Risk check failed: score ${riskScore} exceeds limit ${userRisk.maxRiskScore}`);
    }

    return result;
  }

  // 风险检查步骤通常不需要补偿
  async compensate(): Promise<void> {
    // 无需补偿操作
  }

  async validate(payload: any): Promise<boolean> {
    return !!(
      payload.userId &&
      payload.positionId &&
      payload.amount > 0 &&
      payload.price > 0
    );
  }

  getTimeout(): number {
    return 15000; // 15秒超时
  }

  getRetryPolicy(): RetryPolicy {
    return {
      maxAttempts: 1, // 风险检查不重试
      backoffStrategy: 'fixed',
      baseDelay: 0
    };
  }

  private calculateRiskScore(
    tradeAmount: number,
    totalPositionValue: number,
    userRisk: any
  ): number {
    // 简化的风险评分计算
    const positionRatio = totalPositionValue / userRisk.maxPositionValue;
    const tradeRatio = tradeAmount / userRisk.maxTradeAmount;
    
    return Math.max(positionRatio, tradeRatio) * 100;
  }
}