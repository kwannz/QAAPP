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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatsResponseDto = exports.BatchUpdateOrdersDto = exports.OrderListResponseDto = exports.OrderResponseDto = exports.OrderQueryDto = exports.UpdateOrderDto = exports.ConfirmOrderDto = exports.CreateOrderDto = exports.PaymentType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const database_1 = require("@qa-app/database");
var PaymentType;
(function (PaymentType) {
    PaymentType["USDT"] = "USDT";
    PaymentType["ETH"] = "ETH";
    PaymentType["FIAT"] = "FIAT";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'prod-silver-001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, description: 'Investment amount in USDT' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "usdtAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'REFER123', description: 'Referrer code for commission' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "referrerCode", void 0);
class ConfirmOrderDto {
}
exports.ConfirmOrderDto = ConfirmOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        description: 'Transaction hash from blockchain'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsHexadecimal)(),
    __metadata("design:type", String)
], ConfirmOrderDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        description: 'Optional signature for additional verification'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsHexadecimal)(),
    __metadata("design:type", String)
], ConfirmOrderDto.prototype, "signature", void 0);
class UpdateOrderDto extends (0, swagger_1.PartialType)(CreateOrderDto) {
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: database_1.OrderStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.OrderStatus),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "failureReason", void 0);
class OrderQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.OrderQueryDto = OrderQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: database_1.OrderStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.OrderStatus),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'product-uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user-uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderQueryDto.prototype, "userId", void 0);
class OrderResponseDto {
}
exports.OrderResponseDto = OrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "usdtAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "platformFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: database_1.OrderStatus }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "referrerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "agentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "confirmedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "referrer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "agent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], OrderResponseDto.prototype, "positions", void 0);
class OrderListResponseDto {
}
exports.OrderListResponseDto = OrderListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderResponseDto] }),
    __metadata("design:type", Array)
], OrderListResponseDto.prototype, "orders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderListResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], OrderListResponseDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], OrderListResponseDto.prototype, "hasPreviousPage", void 0);
class BatchUpdateOrdersDto {
}
exports.BatchUpdateOrdersDto = BatchUpdateOrdersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['order-id-1', 'order-id-2'], description: 'Array of order IDs to update' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], BatchUpdateOrdersDto.prototype, "orderIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['approve', 'reject'], example: 'approve', description: 'Action to perform' }),
    (0, class_validator_1.IsEnum)(['approve', 'reject']),
    __metadata("design:type", String)
], BatchUpdateOrdersDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bulk approval for Q4 orders', description: 'Reason for batch action' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchUpdateOrdersDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Additional notes for this batch operation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchUpdateOrdersDto.prototype, "notes", void 0);
class OrderStatsResponseDto {
}
exports.OrderStatsResponseDto = OrderStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of orders' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of pending orders' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of successful orders' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of failed orders' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of canceled orders' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "canceled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total investment volume in USDT' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "totalVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average order value in USDT' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "averageOrderValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Today orders count' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "todayOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'This week orders count' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "weekOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'This month orders count' }),
    __metadata("design:type", Number)
], OrderStatsResponseDto.prototype, "monthOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Orders by payment type' }),
    __metadata("design:type", Object)
], OrderStatsResponseDto.prototype, "paymentTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Top products by order count' }),
    __metadata("design:type", Array)
], OrderStatsResponseDto.prototype, "topProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Daily order trends (last 30 days)' }),
    __metadata("design:type", Array)
], OrderStatsResponseDto.prototype, "dailyTrends", void 0);
//# sourceMappingURL=orders.dto.js.map