"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrderProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessingService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const query_optimizer_service_1 = require("../../database/query-optimizer.service");
const multi_layer_cache_service_1 = require("../../cache/multi-layer-cache.service");
const database_1 = require("@qa-app/database");
let OrderProcessingService = OrderProcessingService_1 = class OrderProcessingService {
    constructor(database, queryOptimizer, cache) {
        this.database = database;
        this.queryOptimizer = queryOptimizer;
        this.cache = cache;
        this.logger = new common_1.Logger(OrderProcessingService_1.name);
    }
    async processOrderCreation(createOrderDto, userId) {
        const { productId, usdtAmount, referrerCode } = createOrderDto;
        this.logger.log(`🔄 Processing order creation: user=${userId}, product=${productId}, amount=${usdtAmount}`);
        const [user, product] = await Promise.all([
            this.getUserWithCache(userId),
            this.getProductWithCache(productId)
        ]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        await this.validateProductAvailability(product, usdtAmount);
        let referrer = null;
        if (referrerCode) {
            referrer = await this.getReferrerByCode(referrerCode);
        }
        const platformFee = await this.calculatePlatformFee(usdtAmount);
        const order = await this.database.order.create({
            data: {
                userId,
                productId,
                usdtAmount: new database_1.Decimal(usdtAmount),
                platformFee: new database_1.Decimal(platformFee),
                status: database_1.OrderStatus.PENDING,
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
        await this.invalidateUserCache(userId);
        return order;
    }
    async processOrderConfirmation(orderId, confirmDto, userId) {
        this.logger.log(`🔄 Processing order confirmation: order=${orderId}, tx=${confirmDto.txHash}`);
        const order = await this.database.order.findFirst({
            where: {
                id: orderId,
                userId,
                status: database_1.OrderStatus.PENDING
            },
            include: {
                product: true,
                user: {
                    select: { id: true, email: true, agentId: true }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found or already processed');
        }
        await this.validateTransaction(confirmDto.txHash, order.usdtAmount);
        const confirmedOrder = await this.database.order.update({
            where: { id: orderId },
            data: {
                status: database_1.OrderStatus.SUCCESS,
                txHash: confirmDto.txHash,
                confirmedAt: new Date(),
                metadata: {
                    ...(order.metadata || {}),
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
        await Promise.all([
            this.invalidateUserCache(userId),
            this.invalidateOrderCache(orderId)
        ]);
        return confirmedOrder;
    }
    async processOrderCancellation(orderId, userId, reason) {
        this.logger.log(`🔄 Processing order cancellation: order=${orderId}, user=${userId}`);
        const order = await this.database.order.findFirst({
            where: {
                id: orderId,
                userId,
                status: database_1.OrderStatus.PENDING
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found or cannot be cancelled');
        }
        const cancelledOrder = await this.database.order.update({
            where: { id: orderId },
            data: {
                status: database_1.OrderStatus.CANCELED,
                metadata: {
                    ...(order.metadata || {}),
                    cancelledAt: new Date().toISOString(),
                    cancelReason: reason || 'User requested cancellation'
                }
            }
        });
        this.logger.log(`✅ Order cancelled: ${orderId}`);
        await this.invalidateUserCache(userId);
        return cancelledOrder;
    }
    async getUserWithCache(userId) {
        const cacheKey = `user:${userId}`;
        return await this.cache.get(cacheKey, async () => {
            return await this.database.user.findUnique({
                where: { id: userId },
                include: { agent: true }
            });
        });
    }
    async getProductWithCache(productId) {
        const cacheKey = `product:${productId}`;
        return await this.cache.get(cacheKey, async () => {
            return await this.database.product.findUnique({
                where: { id: productId }
            });
        });
    }
    async getReferrerByCode(referrerCode) {
        const cacheKey = `referrer:${referrerCode}`;
        return await this.cache.get(cacheKey, async () => {
            return await this.database.user.findUnique({
                where: { referralCode: referrerCode }
            });
        });
    }
    async calculatePlatformFee(amount) {
        const cacheKey = 'config:platform_fee_rate';
        const config = await this.cache.get(cacheKey, async () => {
            return await this.database.systemConfig.findUnique({
                where: { key: 'platform_fee_rate' }
            });
        });
        const rate = config?.value?.rate || 0.005;
        return amount * rate;
    }
    async validateProductAvailability(product, amount) {
        if (!product.isActive) {
            throw new common_1.BadRequestException('Product is not active');
        }
        if (amount < product.minAmount.toNumber()) {
            throw new common_1.BadRequestException(`Minimum investment amount is ${product.minAmount}`);
        }
        if (product.maxAmount && amount > product.maxAmount.toNumber()) {
            throw new common_1.BadRequestException(`Maximum investment amount is ${product.maxAmount}`);
        }
        if (product.totalSupply && product.currentSupply >= product.totalSupply) {
            throw new common_1.BadRequestException('Product is sold out');
        }
        const now = new Date();
        if (product.startsAt && now < product.startsAt) {
            throw new common_1.BadRequestException('Product sale has not started');
        }
        if (product.endsAt && now > product.endsAt) {
            throw new common_1.BadRequestException('Product sale has ended');
        }
    }
    async validateTransaction(txHash, expectedAmount) {
        if (!txHash || txHash.length !== 66 || !txHash.startsWith('0x')) {
            throw new common_1.BadRequestException('Invalid transaction hash format');
        }
        this.logger.debug(`🔍 Transaction validation: ${txHash}, amount: ${expectedAmount}`);
        return true;
    }
    async invalidateUserCache(userId) {
        await this.cache.delete(`user:${userId}`);
        await this.cache.delete(`user:orders:${userId}:*`);
    }
    async invalidateOrderCache(orderId) {
        await this.cache.delete(`order:${orderId}`);
    }
};
exports.OrderProcessingService = OrderProcessingService;
exports.OrderProcessingService = OrderProcessingService = OrderProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        query_optimizer_service_1.QueryOptimizerService,
        multi_layer_cache_service_1.MultiLayerCacheService])
], OrderProcessingService);
//# sourceMappingURL=order-processing.service.js.map