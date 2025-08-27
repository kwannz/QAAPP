"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@qa-app/database");
let UsersService = class UsersService {
    async findById(id) {
        try {
            return await database_1.prisma.user.findUnique({
                where: { id },
                include: {
                    wallets: true,
                    agent: {
                        select: {
                            id: true,
                            referralCode: true,
                            email: true,
                        },
                    },
                    referredBy: {
                        select: {
                            id: true,
                            referralCode: true,
                            email: true,
                        },
                    },
                    positions: {
                        where: {
                            status: 'ACTIVE',
                        },
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    symbol: true,
                                    name: true,
                                    aprBps: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 10,
                    },
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async findByEmail(email) {
        try {
            return await database_1.prisma.user.findUnique({
                where: { email },
                include: {
                    wallets: true,
                    agent: {
                        select: {
                            id: true,
                            referralCode: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async findByReferralCode(referralCode) {
        try {
            return await database_1.prisma.user.findUnique({
                where: { referralCode },
                include: {
                    agent: {
                        select: {
                            id: true,
                            referralCode: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async findByWalletAddress(address) {
        try {
            const wallet = await database_1.prisma.wallet.findFirst({
                where: {
                    address: address.toLowerCase(),
                },
                include: {
                    user: {
                        include: {
                            wallets: true,
                            agent: {
                                select: {
                                    id: true,
                                    referralCode: true,
                                },
                            },
                        },
                    },
                },
            });
            return wallet?.user;
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async findMany(options) {
        const { skip, take, page, limit } = (0, database_1.createPaginationQuery)(options);
        try {
            const where = {};
            if (options.role) {
                where.role = options.role;
            }
            if (options.kycStatus) {
                where.kycStatus = options.kycStatus;
            }
            if (options.isActive !== undefined) {
                where.isActive = options.isActive;
            }
            if (options.search) {
                where.OR = [
                    { email: { contains: options.search, mode: 'insensitive' } },
                    { referralCode: { contains: options.search, mode: 'insensitive' } },
                ];
            }
            const [users, total] = await Promise.all([
                database_1.prisma.user.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        wallets: {
                            select: {
                                address: true,
                                chainId: true,
                                isPrimary: true,
                                label: true,
                            },
                        },
                        agent: {
                            select: {
                                id: true,
                                referralCode: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                referrals: true,
                                positions: true,
                                orders: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                database_1.prisma.user.count({ where }),
            ]);
            return (0, database_1.createPaginatedResult)(users, total, page, limit);
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async create(userData) {
        const validation = (0, database_1.validateUserData)({
            email: userData.email ?? undefined,
            role: userData.role,
            referralCode: userData.referralCode,
            kycStatus: userData.kycStatus,
        });
        if (!validation.isValid) {
            throw new common_1.BadRequestException(`数据验证失败: ${validation.errors.join(', ')}`);
        }
        try {
            return await database_1.prisma.user.create({
                data: userData,
                include: {
                    wallets: true,
                    agent: {
                        select: {
                            id: true,
                            referralCode: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async update(id, updateData) {
        const validation = (0, database_1.validateUserData)({
            email: updateData.email,
            role: updateData.role,
            kycStatus: updateData.kycStatus,
        });
        if (!validation.isValid) {
            throw new common_1.BadRequestException(`数据验证失败: ${validation.errors.join(', ')}`);
        }
        try {
            const user = await database_1.prisma.user.update({
                where: { id },
                data: updateData,
                include: {
                    wallets: true,
                    agent: {
                        select: {
                            id: true,
                            referralCode: true,
                        },
                    },
                },
            });
            return user;
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async updateLastLogin(id) {
        try {
            return await database_1.prisma.user.update({
                where: { id },
                data: {
                    lastLoginAt: new Date(),
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async updatePassword(id, passwordHash) {
        try {
            return await database_1.prisma.user.update({
                where: { id },
                data: {
                    passwordHash,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async updateKycStatus(id, kycStatus, kycData) {
        try {
            return await database_1.prisma.user.update({
                where: { id },
                data: {
                    kycStatus,
                    kycData,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async addWallet(userId, walletData) {
        try {
            if (walletData.isPrimary) {
                await database_1.prisma.wallet.updateMany({
                    where: { userId },
                    data: { isPrimary: false },
                });
            }
            return await database_1.prisma.wallet.create({
                data: {
                    userId,
                    ...walletData,
                    address: walletData.address.toLowerCase(),
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async removeWallet(userId, walletId) {
        try {
            const wallet = await database_1.prisma.wallet.findFirst({
                where: {
                    id: walletId,
                    userId,
                },
            });
            if (!wallet) {
                throw new common_1.NotFoundException('钱包地址不存在');
            }
            return await database_1.prisma.wallet.delete({
                where: { id: walletId },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async setPrimaryWallet(userId, walletId) {
        try {
            return await database_1.prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.findFirst({
                    where: {
                        id: walletId,
                        userId,
                    },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException('钱包地址不存在');
                }
                await tx.wallet.updateMany({
                    where: { userId },
                    data: { isPrimary: false },
                });
                return await tx.wallet.update({
                    where: { id: walletId },
                    data: { isPrimary: true },
                });
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async getUserStats(userId) {
        try {
            const [orderStats, positionStats, commissionStats, payoutStats,] = await Promise.all([
                database_1.prisma.order.aggregate({
                    where: { userId },
                    _count: true,
                    _sum: { usdtAmount: true },
                }),
                database_1.prisma.position.aggregate({
                    where: { userId },
                    _count: true,
                    _sum: { principal: true },
                }),
                database_1.prisma.commission.aggregate({
                    where: { userId },
                    _count: true,
                    _sum: { amount: true },
                }),
                database_1.prisma.payout.aggregate({
                    where: {
                        userId,
                        isClaimable: true,
                    },
                    _count: true,
                    _sum: { amount: true },
                }),
            ]);
            return {
                order: {
                    count: orderStats._count,
                    totalAmount: orderStats._sum.usdtAmount?.toNumber() || 0,
                },
                position: {
                    count: positionStats._count,
                    totalPrincipal: positionStats._sum.principal?.toNumber() || 0,
                },
                commission: {
                    count: commissionStats._count,
                    totalAmount: commissionStats._sum.amount?.toNumber() || 0,
                },
                claimablePayouts: {
                    count: payoutStats._count,
                    totalAmount: payoutStats._sum.amount?.toNumber() || 0,
                },
            };
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async getReferrals(userId, options) {
        const { skip, take, page, limit } = (0, database_1.createPaginationQuery)(options);
        try {
            const [referrals, total] = await Promise.all([
                database_1.prisma.user.findMany({
                    where: { referredById: userId },
                    skip,
                    take,
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        kycStatus: true,
                        referralCode: true,
                        isActive: true,
                        createdAt: true,
                        _count: {
                            select: {
                                orders: true,
                                positions: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                database_1.prisma.user.count({
                    where: { referredById: userId },
                }),
            ]);
            return (0, database_1.createPaginatedResult)(referrals, total, page, limit);
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async toggleUserStatus(id, isActive) {
        try {
            return await database_1.prisma.user.update({
                where: { id },
                data: {
                    isActive,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async softDelete(id) {
        return this.toggleUserStatus(id, false);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map