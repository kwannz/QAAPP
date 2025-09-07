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
var PositionCalculationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionCalculationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const multi_layer_cache_service_1 = require("../../cache/multi-layer-cache.service");
let PositionCalculationService = PositionCalculationService_1 = class PositionCalculationService {
    constructor(database, cache) {
        this.database = database;
        this.cache = cache;
        this.logger = new common_1.Logger(PositionCalculationService_1.name);
    }
    async calculatePayout(positionId, periodStart, periodEnd) {
        this.logger.debug(`🧮 Calculating payout for position ${positionId}`);
        const position = await this.database.position.findUnique({
            where: { id: positionId },
            include: {
                product: true,
                user: {
                    select: { id: true, email: true }
                }
            }
        });
        if (!position) {
            throw new Error(`Position ${positionId} not found`);
        }
        const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        const annualRateBps = position.product.aprBps;
        const annualRate = annualRateBps / 10000;
        const dailyRate = annualRate / 365;
        const principal = position.principal.toNumber();
        const periodRate = dailyRate * periodDays;
        const amount = principal * periodRate;
        const compoundingEnabled = await this.isCompoundingEnabled(position.productId);
        let finalAmount = amount;
        if (compoundingEnabled) {
            finalAmount = principal * (Math.pow(1 + dailyRate, periodDays) - 1);
        }
        this.logger.log(`💰 Payout calculated: ${finalAmount} USDT for position ${positionId} (${periodDays} days)`);
        return {
            amount: finalAmount,
            periodStart,
            periodEnd,
            dailyRate,
            annualizedReturn: annualRate * 100
        };
    }
    async calculatePositionMetrics(positionId) {
        const cacheKey = `position:metrics:${positionId}`;
        const cachedResult = await this.cache.get(cacheKey);
        if (cachedResult)
            return cachedResult;
        const result = await (async () => {
            const position = await this.database.position.findUnique({
                where: { id: positionId },
                include: {
                    product: true,
                    payouts: {
                        where: { claimedAt: { not: null } },
                        orderBy: { periodStart: 'desc' }
                    }
                }
            });
            if (!position) {
                throw new Error(`Position ${positionId} not found`);
            }
            const totalPrincipal = position.principal.toNumber();
            const totalEarnings = position.payouts.reduce((sum, payout) => sum + payout.amount.toNumber(), 0);
            const now = new Date();
            const startTime = position.startDate.getTime();
            const daysActive = Math.floor((now.getTime() - startTime) / (1000 * 60 * 60 * 24));
            const roi = totalPrincipal > 0 ? (totalEarnings / totalPrincipal) * 100 : 0;
            const dailyEarnings = daysActive > 0 ? totalEarnings / daysActive : 0;
            const nextPayoutAmount = await this.calculateNextPayoutAmount(position);
            const remainingDays = Math.ceil((position.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const projectedTotalReturn = totalEarnings + (dailyEarnings * Math.max(0, remainingDays));
            return {
                totalPrincipal,
                totalEarnings,
                dailyEarnings,
                roi,
                daysActive,
                nextPayoutAmount,
                projectedTotalReturn
            };
        })();
        await this.cache.set(cacheKey, result, 300000);
        return result;
    }
    async calculateBatchPayouts(positionIds, periodStart, periodEnd) {
        this.logger.log(`📊 Calculating batch payouts for ${positionIds.length} positions`);
        const results = new Map();
        const batchSize = 10;
        for (let i = 0; i < positionIds.length; i += batchSize) {
            const batch = positionIds.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(batch.map(id => this.calculatePayout(id, periodStart, periodEnd)));
            batchResults.forEach((result, index) => {
                const positionId = batch[index];
                if (result.status === 'fulfilled') {
                    results.set(positionId, result.value);
                }
                else {
                    this.logger.error(`Failed to calculate payout for position ${positionId}:`, result.reason);
                }
            });
        }
        this.logger.log(`✅ Batch payout calculation completed: ${results.size}/${positionIds.length} successful`);
        return results;
    }
    async calculatePortfolioValue(userId) {
        const cacheKey = `portfolio:${userId}`;
        const cachedResult = await this.cache.get(cacheKey);
        if (cachedResult)
            return cachedResult;
        const result = await (async () => {
            const [positions, payouts] = await Promise.all([
                this.database.position.findMany({
                    where: {
                        userId,
                        status: { in: ['ACTIVE', 'REDEEMING'] }
                    },
                    include: { product: true }
                }),
                this.database.payout.aggregate({
                    where: {
                        userId,
                        claimedAt: { not: null }
                    },
                    _sum: { amount: true }
                })
            ]);
            const totalPrincipal = positions.reduce((sum, pos) => sum + pos.principal.toNumber(), 0);
            const totalEarnings = payouts._sum.amount?.toNumber() || 0;
            const totalCurrentValue = totalPrincipal + totalEarnings;
            const portfolioROI = totalPrincipal > 0 ? (totalEarnings / totalPrincipal) * 100 : 0;
            return {
                totalPrincipal,
                totalCurrentValue,
                totalEarnings,
                activePositions: positions.length,
                portfolioROI
            };
        })();
        await this.cache.set(cacheKey, result, 600000);
        return result;
    }
    async predictFutureEarnings(positionId, days) {
        const position = await this.database.position.findUnique({
            where: { id: positionId },
            include: {
                product: true,
                payouts: {
                    where: { claimedAt: { not: null } },
                    orderBy: { periodStart: 'desc' },
                    take: 30
                }
            }
        });
        if (!position) {
            throw new Error(`Position ${positionId} not found`);
        }
        const annualRate = position.product.aprBps / 10000;
        const dailyRate = annualRate / 365;
        const theoreticalDailyEarnings = position.principal.toNumber() * dailyRate;
        const actualDailyEarnings = position.payouts.length > 0
            ? position.payouts.reduce((sum, p) => sum + p.amount.toNumber(), 0) / position.payouts.length
            : theoreticalDailyEarnings;
        const projectedDailyEarnings = (theoreticalDailyEarnings * 0.7) + (actualDailyEarnings * 0.3);
        const dataPoints = position.payouts.length;
        const confidenceLevel = Math.min(95, 50 + (dataPoints * 1.5));
        return {
            dailyEarnings: projectedDailyEarnings,
            projectedEarnings: projectedDailyEarnings * days,
            projectedTotal: position.principal.toNumber() + (projectedDailyEarnings * days),
            confidenceLevel
        };
    }
    async calculateNextPayoutAmount(position) {
        if (!position.nextPayoutAt || position.status !== 'ACTIVE') {
            return 0;
        }
        const periodStart = position.nextPayoutAt;
        const periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
        const payout = await this.calculatePayout(position.id, periodStart, periodEnd);
        return payout.amount;
    }
    async isCompoundingEnabled(productId) {
        const config = await this.database.systemConfig.findUnique({
            where: { key: `product:${productId}:compounding` }
        });
        return config?.value?.enabled || false;
    }
};
exports.PositionCalculationService = PositionCalculationService;
exports.PositionCalculationService = PositionCalculationService = PositionCalculationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        multi_layer_cache_service_1.MultiLayerCacheService])
], PositionCalculationService);
//# sourceMappingURL=position-calculation.service.js.map