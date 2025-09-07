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
var OrderValidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const multi_layer_cache_service_1 = require("../../cache/multi-layer-cache.service");
const database_1 = require("@qa-app/database");
let OrderValidationService = OrderValidationService_1 = class OrderValidationService {
    constructor(database, cache) {
        this.database = database;
        this.cache = cache;
        this.logger = new common_1.Logger(OrderValidationService_1.name);
    }
    async validateOrderCreation(createOrderDto, userId) {
        const errors = [];
        const warnings = [];
        this.logger.debug(`🔍 Validating order creation for user ${userId}`);
        const validationResults = await Promise.allSettled([
            this.validateUser(userId),
            this.validateProduct(createOrderDto.productId),
            this.validateAmount(createOrderDto.usdtAmount),
            this.validateUserLimits(userId, createOrderDto.usdtAmount),
            this.validateReferrer(createOrderDto.referrerCode),
            this.validateRiskFactors(userId, createOrderDto)
        ]);
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
            }
            else if (result.value) {
                if (result.value.error)
                    errors.push(result.value.error);
                if (result.value.warning)
                    warnings.push(result.value.warning);
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
    async validateUser(userId) {
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
    async validateProduct(productId) {
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
        if (product.totalSupply && product.currentSupply >= product.totalSupply) {
            return { error: 'Product is sold out' };
        }
        if (product.totalSupply && product.currentSupply > product.totalSupply * 0.9) {
            return { warning: 'Product stock is low (less than 10% remaining)' };
        }
        return {};
    }
    async validateAmount(amount) {
        if (amount <= 0) {
            return { error: 'Investment amount must be positive' };
        }
        if (amount < 10) {
            return { error: 'Minimum investment amount is 10 USDT' };
        }
        if (amount > 1000000) {
            return { error: 'Maximum investment amount is 1,000,000 USDT' };
        }
        if (amount > 100000) {
            return { warning: 'Large investment amount detected, may require additional verification' };
        }
        return {};
    }
    async validateUserLimits(userId, amount) {
        const userStats = await this.database.order.aggregate({
            where: {
                userId,
                status: database_1.OrderStatus.SUCCESS
            },
            _sum: {
                usdtAmount: true
            }
        });
        const totalInvestment = userStats._sum.usdtAmount?.toNumber() || 0;
        const newTotal = totalInvestment + amount;
        const maxUserInvestment = 500000;
        if (newTotal > maxUserInvestment) {
            return { error: `Total investment limit exceeded. Current: ${totalInvestment}, Limit: ${maxUserInvestment}` };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyInvestment = await this.database.order.aggregate({
            where: {
                userId,
                status: database_1.OrderStatus.SUCCESS,
                createdAt: { gte: today }
            },
            _sum: {
                usdtAmount: true
            }
        });
        const dailyTotal = (dailyInvestment._sum.usdtAmount?.toNumber() || 0) + amount;
        const maxDailyInvestment = 50000;
        if (dailyTotal > maxDailyInvestment) {
            return { error: `Daily investment limit exceeded. Daily total would be: ${dailyTotal}, Limit: ${maxDailyInvestment}` };
        }
        if (newTotal > maxUserInvestment * 0.8) {
            return { warning: `Approaching total investment limit (${Math.round(newTotal / maxUserInvestment * 100)}%)` };
        }
        return {};
    }
    async validateReferrer(referrerCode) {
        if (!referrerCode)
            return {};
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
    async validateRiskFactors(userId, createOrderDto) {
        const riskUser = await this.database.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, lastLoginAt: true, createdAt: true }
        });
        if (!riskUser) {
            return { error: 'User not found for risk assessment' };
        }
        const accountAge = Date.now() - riskUser.createdAt.getTime();
        const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
        if (accountAgeDays < 1 && createOrderDto.usdtAmount > 1000) {
            return { warning: 'New user making large investment - flagged for review' };
        }
        const recentOrders = await this.database.order.count({
            where: {
                userId,
                status: database_1.OrderStatus.SUCCESS,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        });
        if (recentOrders > 10) {
            return { warning: 'High frequency trading detected - may require additional verification' };
        }
        if (riskUser.lastLoginAt) {
            const daysSinceLogin = (Date.now() - riskUser.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLogin > 30) {
                return { warning: 'User has not logged in for over 30 days' };
            }
        }
        return {};
    }
    async invalidateUserCache(userId) {
        await Promise.all([
            this.cache.delete(`user:${userId}`),
            this.cache.delete(`user:orders:${userId}:*`),
            this.cache.delete(`user:stats:${userId}`)
        ]);
    }
    async invalidateOrderCache(orderId) {
        await this.cache.delete(`order:${orderId}`);
    }
};
exports.OrderValidationService = OrderValidationService;
exports.OrderValidationService = OrderValidationService = OrderValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        multi_layer_cache_service_1.MultiLayerCacheService])
], OrderValidationService);
//# sourceMappingURL=order-validation.service.js.map