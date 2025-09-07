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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("../services/products.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const products_dto_1 = require("../dto/products.dto");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(queryDto) {
        return this.productsService.findAll(queryDto);
    }
    async findOne(id) {
        return this.productsService.findOne(id);
    }
    async create(createProductDto, req) {
        return this.productsService.create(createProductDto, req.user.id);
    }
    async update(id, updateProductDto, req) {
        return this.productsService.update(id, updateProductDto, req.user.id);
    }
    async remove(id, req) {
        return this.productsService.remove(id, req.user.id);
    }
    async checkAvailability(id, amount) {
        return this.productsService.checkAvailability(id, amount);
    }
    async getStatistics(id) {
        return this.productsService.getStatistics(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get all products with filtering and pagination',
        description: 'Retrieve a paginated list of products with optional filtering by symbol, status, and other criteria.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Products retrieved successfully',
        type: products_dto_1.ProductListResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid query parameters'
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'symbol', required: false, type: String, description: 'Filter by symbol' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiQuery)({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive products' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [products_dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get product by ID',
        description: 'Retrieve detailed information about a specific product by its ID.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Product UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product found successfully',
        type: products_dto_1.ProductResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid product ID format'
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Create new product',
        description: 'Create a new financial product. Requires admin privileges.'
    }),
    (0, swagger_1.ApiBody)({ type: products_dto_1.CreateProductDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Product created successfully',
        type: products_dto_1.ProductResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid product data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Product with this symbol already exists'
    }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [products_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Update product',
        description: 'Update an existing product. Requires admin privileges.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Product UUID' }),
    (0, swagger_1.ApiBody)({ type: products_dto_1.UpdateProductDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product updated successfully',
        type: products_dto_1.ProductResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid product data or ID format'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found'
    }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, products_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Delete product',
        description: 'Soft delete a product (mark as inactive). Requires admin privileges.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Product UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product deleted successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid product ID format'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found'
    }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get product availability',
        description: 'Check if a product is available for purchase with specified amount.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Product UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'amount', type: Number, description: 'Investment amount to check' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability check completed',
        schema: {
            type: 'object',
            properties: {
                available: { type: 'boolean' },
                reason: { type: 'string' },
                maxAmount: { type: 'number' },
                remainingCapacity: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found'
    }),
    (0, common_1.Get)(':id/availability'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "checkAvailability", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get product statistics',
        description: 'Retrieve statistical information about a product including performance metrics.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Product UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                totalInvestments: { type: 'number' },
                totalInvestors: { type: 'number' },
                averageInvestment: { type: 'number' },
                currentYield: { type: 'number' },
                performanceHistory: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            date: { type: 'string' },
                            yield: { type: 'number' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id/statistics'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getStatistics", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map