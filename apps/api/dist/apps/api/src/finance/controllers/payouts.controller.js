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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PayoutsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const payouts_service_1 = require("../services/payouts.service");
const positions_service_1 = require("../services/positions.service");
const deprecated_decorator_1 = require("../../common/decorators/deprecated.decorator");
const error_utils_1 = require("../../common/utils/error.utils");
class ClaimPayoutsDto {
}
class PayoutDto {
}
class ClaimablePayoutsResponseDto {
}
class PayoutHistoryResponseDto {
}
class ClaimResponseDto {
}
let PayoutsController = PayoutsController_1 = class PayoutsController {
    constructor(payoutsService, positionsService) {
        this.payoutsService = payoutsService;
        this.positionsService = positionsService;
        this.logger = new common_1.Logger(PayoutsController_1.name);
    }
    async getUserClaimablePayouts(userId, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=PAYOUT instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: GET /payouts/user/:userId/claimable');
        try {
            const userPositions = await this.positionsService.getUserPositions(userId);
            if (!userPositions.positions || userPositions.positions.length === 0) {
                return {
                    payouts: [],
                    totalAmount: 0,
                };
            }
            const allPayouts = [];
            let totalAmount = 0;
            for (const position of userPositions.positions) {
                if (position.status !== 'ACTIVE' && position.status !== 'REDEEMING') {
                    continue;
                }
                const payouts = await this.payoutsService.generateClaimablePayouts(position.id, userId);
                const formattedPayouts = payouts.map(payout => ({
                    id: payout.id,
                    userId: payout.userId,
                    positionId: payout.positionId,
                    amount: payout.amount,
                    periodStart: payout.periodStart.toISOString(),
                    periodEnd: payout.periodEnd.toISOString(),
                    isClaimable: payout.status === 'PENDING',
                    claimedAt: payout.claimedAt?.toISOString(),
                    claimTxHash: payout.txHash,
                    createdAt: payout.createdAt.toISOString(),
                    updatedAt: payout.updatedAt.toISOString(),
                }));
                allPayouts.push(...formattedPayouts);
                totalAmount += formattedPayouts.reduce((sum, p) => sum + p.amount, 0);
            }
            return {
                payouts: allPayouts,
                totalAmount,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get claimable payouts for user ${userId}:`, error);
            throw new common_1.BadRequestException(`获取可领取收益失败: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
    async getUserPayoutHistory(userId, page = '1', limit = '20', res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions?type=PAYOUT instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: GET /payouts/user/:userId/history');
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 20;
            const userPositions = await this.positionsService.getUserPositions(userId);
            if (!userPositions.positions || userPositions.positions.length === 0) {
                return {
                    payouts: [],
                    total: 0,
                    totalClaimed: 0,
                    totalPending: 0,
                };
            }
            const allPayouts = [];
            let totalClaimed = 0;
            let totalPending = 0;
            for (const position of userPositions.positions) {
                const payouts = await this.payoutsService.getPositionPayouts(position.id);
                const formattedPayouts = payouts.map(payout => ({
                    id: payout.id,
                    userId: payout.userId,
                    positionId: payout.positionId,
                    amount: payout.amount,
                    periodStart: payout.periodStart.toISOString(),
                    periodEnd: payout.periodEnd.toISOString(),
                    isClaimable: payout.status === 'PENDING',
                    claimedAt: payout.claimedAt?.toISOString(),
                    claimTxHash: payout.txHash,
                    createdAt: payout.createdAt.toISOString(),
                    updatedAt: payout.updatedAt.toISOString(),
                }));
                allPayouts.push(...formattedPayouts);
                formattedPayouts.forEach(payout => {
                    if (payout.isClaimable) {
                        totalPending += payout.amount;
                    }
                    else {
                        totalClaimed += payout.amount;
                    }
                });
            }
            allPayouts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const startIndex = (pageNum - 1) * limitNum;
            const paginatedPayouts = allPayouts.slice(startIndex, startIndex + limitNum);
            return {
                payouts: paginatedPayouts,
                total: allPayouts.length,
                totalClaimed,
                totalPending,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get payout history for user ${userId}:`, error);
            throw new common_1.BadRequestException(`获取收益历史失败: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
    async claimPayouts(claimDto, res) {
        res.setHeader('Deprecation', 'true');
        res.setHeader('X-API-Deprecation-Info', 'Use /finance/transactions for payout processing instead. This endpoint will be removed in v2.0');
        this.logger.warn('Deprecated API called: POST /payouts/claim');
        try {
            const { userId, payoutIds } = claimDto;
            if (!payoutIds || payoutIds.length === 0) {
                throw new common_1.BadRequestException('请选择要领取的收益');
            }
            const payoutPromises = payoutIds.map(id => this.payoutsService.findPayoutById(id));
            const payouts = await Promise.all(payoutPromises);
            let totalAmount = 0;
            for (const payout of payouts) {
                if (!payout) {
                    throw new common_1.NotFoundException('收益记录不存在');
                }
                if (payout.userId !== userId) {
                    throw new common_1.BadRequestException('无权限领取此收益');
                }
                if (payout.status !== 'PENDING') {
                    throw new common_1.BadRequestException('该收益已被领取或不可领取');
                }
                totalAmount += payout.amount;
            }
            const claimResults = await this.payoutsService.claimMultiplePayouts(payoutIds, userId);
            if (!claimResults.success) {
                throw new common_1.BadRequestException(claimResults.message || '领取失败');
            }
            return {
                success: true,
                claimedAmount: claimResults.totalAmount,
                txHash: claimResults.txHash,
                claimedPayouts: payoutIds,
            };
        }
        catch (error) {
            this.logger.error('Failed to claim payouts:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`收益领取失败: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
    async getPayoutById(payoutId) {
        try {
            const payout = await this.payoutsService.findPayoutById(payoutId);
            if (!payout) {
                throw new common_1.NotFoundException('收益记录不存在');
            }
            return {
                id: payout.id,
                userId: payout.userId,
                positionId: payout.positionId,
                amount: payout.amount,
                periodStart: payout.periodStart.toISOString(),
                periodEnd: payout.periodEnd.toISOString(),
                isClaimable: payout.status === 'PENDING',
                claimedAt: payout.claimedAt?.toISOString(),
                claimTxHash: payout.txHash,
                createdAt: payout.createdAt.toISOString(),
                updatedAt: payout.updatedAt.toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get payout ${payoutId}:`, error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`获取收益详情失败: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取用户可领取收益' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '可领取收益列表获取成功',
        type: ClaimablePayoutsResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, common_1.Get)('user/:userId/claimable'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_2.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getUserClaimablePayouts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取用户收益历史' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '收益历史获取成功',
        type: PayoutHistoryResponseDto
    }),
    (0, common_1.Get)('user/:userId/history'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_2.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getUserPayoutHistory", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '领取收益' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '收益领取成功',
        type: ClaimResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '领取失败' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('claim'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClaimPayoutsDto, Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "claimPayouts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取单个收益详情' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '收益详情获取成功',
        type: PayoutDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '收益记录不存在' }),
    (0, common_1.Get)(':payoutId'),
    __param(0, (0, common_1.Param)('payoutId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getPayoutById", null);
exports.PayoutsController = PayoutsController = PayoutsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payouts'),
    (0, common_1.Controller)('payouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, deprecated_decorator_1.Deprecated)({
        since: 'v2.1.0',
        until: 'v3.0.0',
        replacement: '/api/finance/transactions',
        reason: 'Payouts integrated into unified transactions API'
    }),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService,
        positions_service_1.PositionsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map