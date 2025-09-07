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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("../services/orders.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const orders_dto_1 = require("../dto/orders.dto");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getMyOrders(req, queryDto) {
        return this.ordersService.findUserOrders(req.user.id, queryDto);
    }
    async findOne(id, req) {
        return this.ordersService.findOne(id, req.user.id);
    }
    async create(createOrderDto, req) {
        return this.ordersService.create(createOrderDto, req.user.id);
    }
    async createWithETH(createOrderDto, req) {
        const ethOrderDto = { ...createOrderDto, paymentType: 'ETH' };
        return this.ordersService.create(ethOrderDto, req.user.id);
    }
    async confirmOrder(id, confirmDto, req) {
        return this.ordersService.confirmOrder(id, confirmDto, req.user.id);
    }
    async cancelOrder(id, req) {
        return this.ordersService.update(id, { status: 'CANCELED' }, req.user.id);
    }
    async getAdminOrderList(status, riskLevel, dateRange, search, page = 1, limit = 20, sortBy, sortOrder = 'desc') {
        return this.ordersService.getAdminOrderList({
            status,
            riskLevel,
            dateRange,
            search,
            page,
            limit,
            sortBy,
            sortOrder
        });
    }
    async getOrderStats() {
        return this.ordersService.getOrderStats();
    }
    async approveOrder(id, approvalData) {
        return this.ordersService.approveOrder(id, approvalData);
    }
    async rejectOrder(id, rejectionData) {
        return this.ordersService.rejectOrder(id, rejectionData);
    }
    async batchUpdateOrders(batchData) {
        return this.ordersService.batchUpdateOrders(batchData);
    }
    async getOrderRiskAnalysis(id) {
        return this.ordersService.getOrderRiskAnalysis(id);
    }
    async reEvaluateOrderRisk(id) {
        return this.ordersService.reEvaluateOrderRisk(id);
    }
    async exportOrders(status, dateRange, format = 'csv') {
        return this.ordersService.exportOrders({ status, dateRange, format });
    }
    async getOrderAuditTrail(id) {
        return this.ordersService.getOrderAuditTrail(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user orders',
        description: 'Retrieve paginated list of orders for the authenticated user.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Orders retrieved successfully',
        type: orders_dto_1.OrderListResponseDto
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELED'], description: 'Filter by order status' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, orders_dto_1.OrderQueryDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get specific order details',
        description: 'Retrieve detailed information about a specific order.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order found successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Order not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Access denied - can only view own orders'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create new order',
        description: 'Create a new investment order for a product.'
    }),
    (0, swagger_1.ApiBody)({ type: orders_dto_1.CreateOrderDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Order created successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid order data or insufficient product availability'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create ETH payment order',
        description: 'Create a new investment order with ETH payment method.'
    }),
    (0, swagger_1.ApiBody)({ type: orders_dto_1.CreateOrderDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'ETH order created successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid order data'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('eth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createWithETH", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm order payment',
        description: 'Confirm payment for a pending order with transaction hash.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiBody)({ type: orders_dto_1.ConfirmOrderDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order confirmed successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Order cannot be confirmed (invalid status or transaction)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Order not found'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, orders_dto_1.ConfirmOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "confirmOrder", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel pending order',
        description: 'Cancel a pending order that has not been confirmed yet.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order cancelled successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Order cannot be cancelled (already processed)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Order not found'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get all orders for admin with filters',
        description: 'Retrieve all orders with advanced filtering, sorting, and pagination for administrators.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Orders retrieved successfully',
        type: orders_dto_1.OrderListResponseDto
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/list'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('riskLevel')),
    __param(2, (0, common_1.Query)('dateRange')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAdminOrderList", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get order statistics for admin',
        description: 'Retrieve comprehensive order statistics and analytics for administrators.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order statistics retrieved successfully',
        type: orders_dto_1.OrderStatsResponseDto
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Approve order',
        description: 'Manually approve a pending order. Requires admin privileges.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order approved successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Order not found'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Patch)('admin/:id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "approveOrder", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Reject order',
        description: 'Reject a pending order with reason. Requires admin privileges.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order rejected successfully',
        type: orders_dto_1.OrderResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Rejection reason is required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Order not found'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Patch)('admin/:id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "rejectOrder", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Batch update orders',
        description: 'Update multiple orders at once. Requires admin privileges.'
    }),
    (0, swagger_1.ApiBody)({ type: orders_dto_1.BatchUpdateOrdersDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Orders updated successfully',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'number' },
                failed: { type: 'number' },
                results: {
                    type: 'array',
                    items: { type: 'object' }
                }
            }
        }
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('admin/batch-update'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_dto_1.BatchUpdateOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "batchUpdateOrders", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get order risk analysis',
        description: 'Retrieve detailed risk analysis for a specific order.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Risk analysis retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                orderId: { type: 'string' },
                riskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                riskScore: { type: 'number' },
                factors: {
                    type: 'array',
                    items: { type: 'string' }
                },
                recommendation: { type: 'string', enum: ['APPROVE', 'REVIEW', 'REJECT'] }
            }
        }
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/:id/risk-analysis'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderRiskAnalysis", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Re-evaluate order risk',
        description: 'Trigger a fresh risk evaluation for an order.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Risk re-evaluation completed'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('admin/:id/re-evaluate-risk'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reEvaluateOrderRisk", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Export orders to CSV/Excel',
        description: 'Export filtered orders to various formats for analysis.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Orders exported successfully',
        schema: {
            type: 'object',
            properties: {
                format: { type: 'string' },
                fileName: { type: 'string' },
                downloadUrl: { type: 'string' },
                recordCount: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/export'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('dateRange')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "exportOrders", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get order audit trail',
        description: 'Retrieve complete audit trail for an order showing all status changes and actions.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit trail retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    timestamp: { type: 'string' },
                    action: { type: 'string' },
                    user: { type: 'string' },
                    details: { type: 'object' },
                    previousState: { type: 'object' },
                    newState: { type: 'object' }
                }
            }
        }
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/:id/audit-trail'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderAuditTrail", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map