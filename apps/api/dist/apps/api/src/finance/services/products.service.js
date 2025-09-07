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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const database_1 = require("@qa-app/database");
let ProductsService = ProductsService_1 = class ProductsService {
    constructor(database) {
        this.database = database;
        this.logger = new common_1.Logger(ProductsService_1.name);
    }
    async findAll(queryDto = {}) {
        return this.findAllFromDatabase(queryDto);
    }
    async findAllFromDatabase(queryDto = {}) {
        const { page = 1, limit = 20, symbol, isActive, includeInactive = false } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (symbol) {
            where.symbol = { contains: symbol, mode: 'insensitive' };
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        else if (!includeInactive) {
            where.isActive = true;
        }
        where.OR = [
            { endsAt: null },
            { endsAt: { gt: new Date() } }
        ];
        const [products, total] = await Promise.all([
            this.database.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { isActive: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    orders: {
                        where: { status: 'SUCCESS' },
                        select: { id: true, usdtAmount: true },
                    },
                    positions: {
                        where: { status: 'ACTIVE' },
                        select: { id: true, principal: true },
                    },
                    _count: {
                        select: {
                            orders: {
                                where: { status: 'SUCCESS' }
                            },
                            positions: {
                                where: { status: 'ACTIVE' }
                            }
                        }
                    }
                },
            }),
            this.database.product.count({ where }),
        ]);
        const productsWithStats = products.map(product => {
            const totalSales = product.orders.reduce((sum, order) => {
                return sum + order.usdtAmount.toNumber();
            }, 0);
            const totalInvestments = product.positions.reduce((sum, position) => {
                return sum + position.principal.toNumber();
            }, 0);
            const soldCount = product._count.orders;
            const activePositions = product._count.positions;
            let availableSupply = null;
            if (product.totalSupply) {
                availableSupply = product.totalSupply - product.currentSupply;
            }
            return {
                id: product.id,
                symbol: product.symbol,
                name: product.name,
                description: product.description,
                minAmount: product.minAmount.toNumber(),
                maxAmount: product.maxAmount?.toNumber(),
                apr: product.aprBps / 100,
                lockDays: product.lockDays,
                nftTokenId: product.nftTokenId,
                nftMetadata: product.nftMetadata,
                totalSupply: product.totalSupply,
                currentSupply: product.currentSupply,
                availableSupply,
                isActive: product.isActive,
                startsAt: product.startsAt,
                endsAt: product.endsAt,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                stats: {
                    totalSales,
                    totalInvestments,
                    soldCount,
                    activePositions,
                }
            };
        });
        const totalPages = Math.ceil(total / limit);
        return {
            products: productsWithStats,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findOne(id) {
        return this.findOneFromDatabase(id);
    }
    async findOneFromDatabase(id) {
        const product = await this.database.product.findUnique({
            where: { id },
            include: {
                orders: {
                    where: { status: 'SUCCESS' },
                    select: {
                        id: true,
                        usdtAmount: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                positions: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        principal: true,
                        startDate: true,
                        endDate: true,
                    },
                },
                _count: {
                    select: {
                        orders: {
                            where: { status: 'SUCCESS' }
                        },
                        positions: {
                            where: { status: 'ACTIVE' }
                        }
                    }
                }
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const totalSales = product.orders.reduce((sum, order) => {
            return sum + order.usdtAmount.toNumber();
        }, 0);
        const totalInvestments = product.positions.reduce((sum, position) => {
            return sum + position.principal.toNumber();
        }, 0);
        const availableSupply = product.totalSupply
            ? product.totalSupply - product.currentSupply
            : null;
        const expectedAnnualReturn = (product.aprBps / 10000) * 100;
        return {
            ...product,
            minAmount: product.minAmount.toNumber(),
            maxAmount: product.maxAmount?.toNumber(),
            apr: product.aprBps / 100,
            availableSupply,
            expectedAnnualReturn,
            stats: {
                totalSales,
                totalInvestments,
                soldCount: product._count.orders,
                activePositions: product._count.positions,
                recentOrders: product.orders.map(order => ({
                    id: order.id,
                    amount: order.usdtAmount.toNumber(),
                    createdAt: order.createdAt,
                })),
            }
        };
    }
    async findBySymbol(symbol) {
        const product = await this.database.product.findUnique({
            where: { symbol: symbol.toUpperCase() },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return {
            ...product,
            minAmount: product.minAmount.toNumber(),
            maxAmount: product.maxAmount?.toNumber(),
            apr: product.aprBps / 100,
        };
    }
    async create(createProductDto, adminId) {
        return this.createInDatabase(createProductDto, adminId);
    }
    async createInDatabase(createProductDto, adminId) {
        const existingProduct = await this.database.product.findUnique({
            where: { symbol: createProductDto.symbol.toUpperCase() },
        });
        if (existingProduct) {
            throw new common_1.BadRequestException('Product symbol already exists');
        }
        if (createProductDto.nftTokenId) {
            const existingNftProduct = await this.database.product.findUnique({
                where: { nftTokenId: createProductDto.nftTokenId },
            });
            if (existingNftProduct) {
                throw new common_1.BadRequestException('NFT Token ID already in use');
            }
        }
        const product = await this.database.product.create({
            data: {
                symbol: createProductDto.symbol.toUpperCase(),
                name: createProductDto.name,
                description: createProductDto.description,
                minAmount: new database_1.Decimal(createProductDto.minAmount),
                maxAmount: createProductDto.maxAmount ? new database_1.Decimal(createProductDto.maxAmount) : null,
                aprBps: Math.round(createProductDto.apr * 100),
                lockDays: createProductDto.lockDays,
                nftTokenId: createProductDto.nftTokenId,
                nftMetadata: createProductDto.nftMetadata,
                totalSupply: createProductDto.totalSupply,
                currentSupply: 0,
                isActive: createProductDto.isActive ?? true,
                startsAt: createProductDto.startsAt || new Date(),
                endsAt: createProductDto.endsAt,
            },
        });
        await this.createAuditLog(adminId, 'PRODUCT_CREATE', 'PRODUCT', product.id, {
            symbol: product.symbol,
            name: product.name,
            apr: createProductDto.apr,
            lockDays: product.lockDays,
        });
        this.logger.log(`Product created: ${product.symbol} by admin ${adminId}`);
        return {
            ...product,
            minAmount: product.minAmount.toNumber(),
            maxAmount: product.maxAmount?.toNumber(),
            apr: product.aprBps / 100,
        };
    }
    async update(id, updateProductDto, adminId) {
        return this.updateInDatabase(id, updateProductDto, adminId);
    }
    async updateInDatabase(id, updateProductDto, adminId) {
        const existingProduct = await this.database.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (updateProductDto.symbol && updateProductDto.symbol !== existingProduct.symbol) {
            const symbolConflict = await this.database.product.findUnique({
                where: { symbol: updateProductDto.symbol.toUpperCase() },
            });
            if (symbolConflict) {
                throw new common_1.BadRequestException('Product symbol already exists');
            }
        }
        if (updateProductDto.nftTokenId && updateProductDto.nftTokenId !== existingProduct.nftTokenId) {
            const nftConflict = await this.database.product.findUnique({
                where: { nftTokenId: updateProductDto.nftTokenId },
            });
            if (nftConflict) {
                throw new common_1.BadRequestException('NFT Token ID already in use');
            }
        }
        const updateData = {};
        if (updateProductDto.symbol) {
            updateData.symbol = updateProductDto.symbol.toUpperCase();
        }
        if (updateProductDto.name) {
            updateData.name = updateProductDto.name;
        }
        if (updateProductDto.description !== undefined) {
            updateData.description = updateProductDto.description;
        }
        if (updateProductDto.minAmount) {
            updateData.minAmount = new database_1.Decimal(updateProductDto.minAmount);
        }
        if (updateProductDto.maxAmount !== undefined) {
            updateData.maxAmount = updateProductDto.maxAmount ? new database_1.Decimal(updateProductDto.maxAmount) : null;
        }
        if (updateProductDto.apr) {
            updateData.aprBps = Math.round(updateProductDto.apr * 100);
        }
        if (updateProductDto.lockDays) {
            updateData.lockDays = updateProductDto.lockDays;
        }
        if (updateProductDto.nftTokenId !== undefined) {
            updateData.nftTokenId = updateProductDto.nftTokenId;
        }
        if (updateProductDto.nftMetadata !== undefined) {
            updateData.nftMetadata = updateProductDto.nftMetadata;
        }
        if (updateProductDto.totalSupply !== undefined) {
            updateData.totalSupply = updateProductDto.totalSupply;
        }
        if (updateProductDto.isActive !== undefined) {
            updateData.isActive = updateProductDto.isActive;
        }
        if (updateProductDto.startsAt) {
            updateData.startsAt = new Date(updateProductDto.startsAt);
        }
        if (updateProductDto.endsAt !== undefined) {
            updateData.endsAt = updateProductDto.endsAt ? new Date(updateProductDto.endsAt) : null;
        }
        const updatedProduct = await this.database.product.update({
            where: { id },
            data: updateData,
        });
        await this.createAuditLog(adminId, 'PRODUCT_UPDATE', 'PRODUCT', id, {
            updatedFields: Object.keys(updateData),
            symbol: updatedProduct.symbol,
        });
        this.logger.log(`Product updated: ${updatedProduct.symbol} by admin ${adminId}`);
        return {
            ...updatedProduct,
            minAmount: updatedProduct.minAmount.toNumber(),
            maxAmount: updatedProduct.maxAmount?.toNumber(),
            apr: updatedProduct.aprBps / 100,
        };
    }
    async remove(id, adminId) {
        const result = await this.removeFromDatabase(id, adminId);
        return { message: 'Product deactivated successfully', productId: result.id };
    }
    async removeFromDatabase(id, adminId) {
        const product = await this.database.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const activePositions = await this.database.position.count({
            where: {
                productId: id,
                status: 'ACTIVE',
            },
        });
        if (activePositions > 0) {
            throw new common_1.BadRequestException('Cannot delete product with active positions');
        }
        const updatedProduct = await this.database.product.update({
            where: { id },
            data: { isActive: false },
        });
        await this.createAuditLog(adminId, 'PRODUCT_DELETE', 'PRODUCT', id, {
            symbol: product.symbol,
            name: product.name,
        });
        this.logger.log(`Product deactivated: ${product.symbol} by admin ${adminId}`);
        return {
            id: updatedProduct.id,
            symbol: updatedProduct.symbol,
            deleted: true,
            deletedAt: new Date(),
        };
    }
    async getStatistics(id) {
        const product = await this.findOneFromDatabase(id);
        return product.stats;
    }
    async checkAvailability(productId, amount) {
        const result = await this.checkAvailabilityFromDatabase(productId, amount);
        return result;
    }
    async checkAvailabilityFromDatabase(productId, amount) {
        const product = await this.database.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return { available: false, reason: 'Product not found' };
        }
        if (!product.isActive) {
            return { available: false, reason: 'Product is not active' };
        }
        if (product.startsAt > new Date()) {
            return { available: false, reason: 'Product sale has not started' };
        }
        if (product.endsAt && product.endsAt < new Date()) {
            return { available: false, reason: 'Product sale has ended' };
        }
        if (amount < product.minAmount.toNumber()) {
            return { available: false, reason: `Minimum investment amount is ${product.minAmount}` };
        }
        if (product.maxAmount && amount > product.maxAmount.toNumber()) {
            return { available: false, reason: `Maximum investment amount is ${product.maxAmount}` };
        }
        if (product.totalSupply) {
            const availableSupply = product.totalSupply - product.currentSupply;
            if (availableSupply <= 0) {
                return { available: false, reason: 'Product is sold out' };
            }
        }
        return { available: true };
    }
    async createAuditLog(actorId, action, resourceType, resourceId, metadata) {
        try {
            await this.database.auditLog.create({
                data: {
                    actorId,
                    actorType: 'ADMIN',
                    action,
                    resourceType,
                    resourceId,
                    metadata,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ProductsService);
//# sourceMappingURL=products.service.js.map