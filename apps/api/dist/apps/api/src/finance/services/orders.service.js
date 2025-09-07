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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const products_service_1 = require("./products.service");
const blockchain_service_1 = require("../../blockchain/blockchain.service");
const positions_service_1 = require("./positions.service");
const database_1 = require("@qa-app/database");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(database, productsService, blockchainService, positionsService) {
        this.database = database;
        this.productsService = productsService;
        this.blockchainService = blockchainService;
        this.positionsService = positionsService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async createDraft(createOrderDto, userId) {
        const { productId, usdtAmount, referrerCode } = createOrderDto;
        const product = await this.database.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const availability = await this.productsService.checkAvailability(productId, usdtAmount);
        if (!availability.available) {
            throw new common_1.BadRequestException(availability.reason);
        }
        let referrer = null;
        if (referrerCode) {
            referrer = await this.database.user.findUnique({
                where: { referralCode: referrerCode },
            });
            if (!referrer) {
                throw new common_1.BadRequestException('Invalid referrer code');
            }
        }
        const user = await this.database.user.findUnique({
            where: { id: userId },
            include: { agent: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const platformFeeConfig = await this.database.systemConfig.findUnique({
            where: { key: 'platform_fee_rate' },
        });
        const platformFeeRate = platformFeeConfig?.value?.rate || 0.005;
        const platformFee = usdtAmount * platformFeeRate;
        const order = await this.database.order.create({
            data: {
                userId,
                productId,
                usdtAmount: new database_1.Decimal(usdtAmount),
                platformFee: new database_1.Decimal(platformFee),
                status: database_1.OrderStatus.PENDING,
                referrerId: referrer?.id,
                agentId: user.agent?.id,
                metadata: {
                    productSymbol: product.symbol,
                    productName: product.name,
                    userEmail: user.email,
                    referrerCode: referrerCode,
                },
            },
            include: {
                product: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        referralCode: true,
                    },
                },
                referrer: {
                    select: {
                        id: true,
                        referralCode: true,
                        email: true,
                    },
                },
                agent: {
                    select: {
                        id: true,
                        referralCode: true,
                        email: true,
                    },
                },
            },
        });
        await this.createAuditLog(userId, 'ORDER_DRAFT_CREATE', 'ORDER', order.id, {
            productId,
            usdtAmount,
            platformFee,
            referrerCode,
        });
        this.logger.log(`Order draft created: ${order.id} for user ${userId}`);
        return this.formatOrderResponse(order);
    }
    async findUserOrders(userId, queryDto = {}) {
        const { page = 1, limit = 20, status, productId } = queryDto;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (status)
            where.status = status;
        if (productId)
            where.productId = productId;
        const [orders, total] = await Promise.all([
            this.database.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { id: true, symbol: true, name: true } },
                    positions: true
                }
            }),
            this.database.order.count({ where })
        ]);
        return {
            orders: orders.map(order => this.formatOrderResponse(order)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        };
    }
    async findAll(queryDto = {}) {
        return this.findAllOrders(queryDto);
    }
    async create(createOrderDto, userId) {
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required');
        }
        try {
            this.logger.log(`Creating order for user ${userId}, product: ${createOrderDto.productId}, amount: ${createOrderDto.usdtAmount}`);
            const order = await this.createDraft(createOrderDto, userId);
            if (order.status === 'SUCCESS') {
                try {
                    await this.positionsService.createPosition({
                        id: order.id,
                        userId: order.userId,
                        productId: order.productId,
                        usdtAmount: order.usdtAmount,
                        txHash: order.txHash,
                        metadata: order.metadata
                    }, {
                        id: order.productId,
                        symbol: order.metadata?.productSymbol || 'UNKNOWN',
                        name: order.metadata?.productName || 'Unknown Product',
                        aprBps: 800,
                        lockDays: 7,
                        nftTokenId: 1
                    });
                    this.logger.log(`Position created for order ${order.id}`);
                }
                catch (error) {
                    this.logger.warn(`Failed to create position for order ${order.id}:`, error);
                }
            }
            return order;
        }
        catch (error) {
            this.logger.error(`Failed to create order for user ${userId}:`, error);
            throw error;
        }
    }
    async update(orderId, updateOrderDto, userId) {
        const where = { id: orderId };
        if (userId)
            where.userId = userId;
        const order = await this.database.order.update({
            where,
            data: updateOrderDto,
            include: {
                product: true,
                user: { select: { id: true, email: true, referralCode: true } },
                referrer: { select: { id: true, referralCode: true, email: true } },
                agent: { select: { id: true, referralCode: true, email: true } },
                positions: true
            }
        });
        return this.formatOrderResponse(order);
    }
    async findAllOrders(queryDto = {}) {
        const { page = 1, limit = 20, status, productId, userId } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (productId) {
            where.productId = productId;
        }
        if (userId) {
            where.userId = userId;
        }
        const [orders, total] = await Promise.all([
            this.database.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: {
                        select: {
                            id: true,
                            symbol: true,
                            name: true,
                            nftMetadata: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            referralCode: true,
                        },
                    },
                    referrer: {
                        select: {
                            id: true,
                            referralCode: true,
                            email: true,
                        },
                    },
                    agent: {
                        select: {
                            id: true,
                            referralCode: true,
                            email: true,
                        },
                    },
                },
            }),
            this.database.order.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            orders: orders.map(order => this.formatOrderResponse(order)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
    async findOne(orderId, userId) {
        const where = { id: orderId };
        if (userId)
            where.userId = userId;
        const order = await this.database.order.findFirst({
            where,
            include: {
                product: true,
                user: { select: { id: true, email: true, referralCode: true } },
                referrer: { select: { id: true, referralCode: true, email: true } },
                agent: { select: { id: true, referralCode: true, email: true } },
                positions: true
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return this.formatOrderResponse(order);
    }
    async cancelOrder(orderId, userId) {
        const order = await this.database.order.findFirst({
            where: {
                id: orderId,
                userId,
                status: database_1.OrderStatus.PENDING,
            },
            include: {
                product: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        referralCode: true,
                    },
                },
            },
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
                    cancelReason: 'User requested cancellation',
                },
            },
            include: {
                product: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        referralCode: true,
                    },
                },
            },
        });
        await this.createAuditLog(userId, 'ORDER_CANCEL', 'ORDER', orderId, {
            reason: 'User cancellation',
            amount: order.usdtAmount.toNumber(),
        });
        this.logger.log(`Order cancelled: ${orderId} by user ${userId}`);
        return this.formatOrderResponse(cancelledOrder);
    }
    async createPosition(order) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + order.product.lockDays * 24 * 60 * 60 * 1000);
        const nextPayoutAt = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        const position = await this.database.position.create({
            data: {
                userId: order.userId,
                productId: order.productId,
                orderId: order.id,
                principal: order.usdtAmount,
                startDate,
                endDate,
                nextPayoutAt,
                nftTokenId: order.product.nftTokenId,
                nftTokenUri: order.product.nftMetadata?.image || null,
                status: 'ACTIVE',
                metadata: {
                    productSymbol: order.product.symbol,
                    apr: order.product.aprBps / 100,
                    lockDays: order.product.lockDays,
                    txHash: order.txHash,
                },
            },
        });
        this.logger.log(`Position created: ${position.id} for order ${order.id}`);
        return position;
    }
    async createCommissions(order) {
        const commissions = [];
        if (order.referrerId) {
            const referralRate = await this.database.systemConfig.findUnique({
                where: { key: 'referral_commission_rate' },
            });
            const rateBps = (referralRate?.value?.rate || 0.01) * 10000;
            const amount = order.usdtAmount.toNumber() * (rateBps / 10000);
            const referralCommission = await this.database.commission.create({
                data: {
                    userId: order.referrerId,
                    orderId: order.id,
                    basisAmount: order.usdtAmount,
                    rateBps: rateBps,
                    amount: new database_1.Decimal(amount),
                    commissionType: 'REFERRAL',
                    status: 'READY',
                },
            });
            commissions.push(referralCommission);
        }
        if (order.agentId) {
            const agentRate = await this.database.systemConfig.findUnique({
                where: { key: 'agent_commission_rate' },
            });
            const rateBps = (agentRate?.value?.rate || 0.03) * 10000;
            const amount = order.usdtAmount.toNumber() * (rateBps / 10000);
            const agentCommission = await this.database.commission.create({
                data: {
                    userId: order.agentId,
                    orderId: order.id,
                    basisAmount: order.usdtAmount,
                    rateBps: rateBps,
                    amount: new database_1.Decimal(amount),
                    commissionType: 'AGENT',
                    status: 'READY',
                },
            });
            commissions.push(agentCommission);
        }
        if (commissions.length > 0) {
            this.logger.log(`Created ${commissions.length} commission records for order ${order.id}`);
        }
        return commissions;
    }
    formatOrderResponse(order) {
        return {
            id: order.id,
            userId: order.userId,
            productId: order.productId,
            usdtAmount: order.usdtAmount.toNumber(),
            platformFee: order.platformFee.toNumber(),
            txHash: order.txHash,
            status: order.status,
            referrerId: order.referrerId,
            agentId: order.agentId,
            failureReason: order.failureReason,
            metadata: order.metadata,
            createdAt: order.createdAt,
            confirmedAt: order.confirmedAt,
            updatedAt: order.updatedAt,
            product: order.product ? {
                id: order.product.id,
                symbol: order.product.symbol,
                name: order.product.name,
                description: order.product.description,
                nftMetadata: order.product.nftMetadata,
            } : undefined,
            user: order.user,
            referrer: order.referrer,
            agent: order.agent,
            positions: order.positions,
        };
    }
    async createAuditLog(actorId, action, resourceType, resourceId, metadata) {
        try {
            await this.database.auditLog.create({
                data: {
                    actorId,
                    actorType: 'USER',
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
    async getAdminOrderList(filters) {
        return this.findAllOrders(filters);
    }
    async getOrderStats() {
        const [total, pending, success, failed, canceled] = await Promise.all([
            this.database.order.count(),
            this.database.order.count({ where: { status: 'PENDING' } }),
            this.database.order.count({ where: { status: 'SUCCESS' } }),
            this.database.order.count({ where: { status: 'FAILED' } }),
            this.database.order.count({ where: { status: 'CANCELED' } })
        ]);
        const totalAmount = await this.database.order.aggregate({
            _sum: { usdtAmount: true },
            where: { status: 'SUCCESS' }
        });
        return {
            total,
            pending,
            success,
            failed,
            canceled,
            totalVolume: totalAmount._sum.usdtAmount?.toNumber() || 0,
            averageOrderValue: total > 0 ? (totalAmount._sum.usdtAmount?.toNumber() || 0) / total : 0,
            todayOrders: 0,
            weekOrders: 0,
            monthOrders: 0,
            paymentTypes: {
                USDT: { count: 0, volume: 0 },
                ETH: { count: 0, volume: 0 },
                FIAT: { count: 0, volume: 0 }
            },
            topProducts: [],
            dailyTrends: []
        };
    }
    async approveOrder(id, approvalData) {
        const order = await this.database.order.update({
            where: { id },
            data: { status: 'SUCCESS', ...approvalData },
            include: {
                product: true,
                user: { select: { id: true, email: true, referralCode: true } }
            }
        });
        return this.formatOrderResponse(order);
    }
    async rejectOrder(id, rejectionData) {
        const order = await this.database.order.update({
            where: { id },
            data: { status: 'FAILED', failureReason: rejectionData.reason },
            include: {
                product: true,
                user: { select: { id: true, email: true, referralCode: true } }
            }
        });
        return this.formatOrderResponse(order);
    }
    async batchUpdateOrders(batchData) {
        const results = [];
        for (const orderId of batchData.orderIds) {
            if (batchData.action === 'approve') {
                const result = await this.approveOrder(orderId, { notes: batchData.notes });
                results.push(result);
            }
            else if (batchData.action === 'reject') {
                const result = await this.rejectOrder(orderId, { reason: batchData.reason });
                results.push(result);
            }
        }
        return { updated: results.length, results };
    }
    async getOrderRiskAnalysis(id) {
        const order = await this.database.order.findUnique({
            where: { id },
            include: { user: true, product: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return {
            orderId: id,
            riskScore: Math.random() * 100,
            riskLevel: 'LOW',
            factors: ['standard_transaction']
        };
    }
    async reEvaluateOrderRisk(id) {
        return this.getOrderRiskAnalysis(id);
    }
    async exportOrders(filters) {
        const orders = await this.findAllOrders(filters);
        return { format: 'csv', data: orders.orders };
    }
    async getOrderAuditTrail(id) {
        const auditLogs = await this.database.auditLog.findMany({
            where: { resourceId: id, resourceType: 'ORDER' },
            orderBy: { createdAt: 'desc' }
        });
        return { orderId: id, auditTrail: auditLogs };
    }
    async confirmOrder(orderId, confirmDto, userId) {
        const order = await this.database.order.findFirst({
            where: { id: orderId, userId, status: 'PENDING' },
            include: { product: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const confirmedOrder = await this.database.order.update({
            where: { id: orderId },
            data: {
                status: 'SUCCESS',
                txHash: confirmDto.txHash,
                confirmedAt: new Date()
            },
            include: {
                product: true,
                user: { select: { id: true, email: true, referralCode: true } },
                referrer: { select: { id: true, referralCode: true, email: true } },
                agent: { select: { id: true, referralCode: true, email: true } },
                positions: true
            }
        });
        if (confirmedOrder.status === 'SUCCESS') {
            try {
                await this.positionsService.createPosition({
                    id: confirmedOrder.id,
                    userId: confirmedOrder.userId,
                    productId: confirmedOrder.productId,
                    usdtAmount: confirmedOrder.usdtAmount.toNumber(),
                    txHash: confirmedOrder.txHash,
                    metadata: confirmedOrder.metadata
                }, {
                    id: confirmedOrder.productId,
                    symbol: confirmedOrder.product.symbol,
                    name: confirmedOrder.product.name,
                    aprBps: confirmedOrder.product.aprBps,
                    lockDays: confirmedOrder.product.lockDays,
                    nftTokenId: confirmedOrder.product.nftTokenId
                });
                this.logger.log(`Position created for confirmed order ${orderId}`);
            }
            catch (error) {
                this.logger.warn(`Failed to create position for confirmed order ${orderId}:`, error);
            }
        }
        return this.formatOrderResponse(confirmedOrder);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => positions_service_1.PositionsService))),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        products_service_1.ProductsService,
        blockchain_service_1.BlockchainService,
        positions_service_1.PositionsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map