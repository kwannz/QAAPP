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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt_1 = require("bcrypt");
const database_service_1 = require("../database/database.service");
const performance_optimizer_service_1 = require("../common/performance/performance-optimizer.service");
const database_1 = require("@qa-app/database");
let UsersService = UsersService_1 = class UsersService {
    constructor(database, performanceOptimizer) {
        this.database = database;
        this.performanceOptimizer = performanceOptimizer;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findById(id) {
        const cacheKey = `user_detail:${id}`;
        return this.performanceOptimizer.optimizeDbQuery(cacheKey, async () => {
            const user = await this.database.user.findUnique({
                where: { id },
                include: {
                    wallets: {
                        select: {
                            id: true,
                            address: true,
                            chainId: true,
                            isPrimary: true,
                            label: true,
                            createdAt: true,
                        },
                        orderBy: { isPrimary: 'desc' },
                    },
                    referredBy: {
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
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const { passwordHash, ...safeUser } = user;
            return safeUser;
        }, { selectFields: ['id', 'email', 'role', 'isActive'], joinOptimization: true });
    }
    async findByEmail(email) {
        return this.database.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                wallets: true,
            },
        });
    }
    async findByReferralCode(referralCode) {
        const user = await this.database.user.findUnique({
            where: { referralCode },
            select: {
                id: true,
                email: true,
                referralCode: true,
                role: true,
                kycStatus: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findAll(queryDto) {
        const { page = 1, limit = 20, email, role, kycStatus, referralCode, isActive } = queryDto;
        const skip = (page - 1) * limit;
        const cacheKey = `users_list:${JSON.stringify(queryDto)}`;
        return this.performanceOptimizer.optimizeDbQuery(cacheKey, async () => {
            const where = {};
            if (email) {
                where.email = { contains: email, mode: 'insensitive' };
            }
            if (role) {
                where.role = role;
            }
            if (kycStatus) {
                where.kycStatus = kycStatus;
            }
            if (referralCode) {
                where.referralCode = { contains: referralCode, mode: 'insensitive' };
            }
            if (isActive !== undefined) {
                where.isActive = isActive;
            }
            const [users, total] = await Promise.all([
                this.database.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [
                        { createdAt: 'desc' },
                        { id: 'asc' }
                    ],
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        referralCode: true,
                        kycStatus: true,
                        isActive: true,
                        createdAt: true,
                        lastLoginAt: true,
                        wallets: {
                            where: { isPrimary: true },
                            select: {
                                id: true,
                                address: true,
                                chainId: true,
                                label: true,
                                isPrimary: true,
                            },
                            take: 1
                        },
                        referredBy: {
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
                        _count: {
                            select: {
                                referrals: true,
                                agentUsers: true,
                                orders: true
                            }
                        }
                    },
                }),
                this.database.user.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                users: users.map(user => this.mapDatabaseUserToResponseDto(user)),
                total,
                page,
                limit,
                totalPages,
            };
        }, { selectFields: ['id', 'email', 'role', 'kycStatus'], joinOptimization: true });
    }
    async updateProfile(userId, updateDto) {
        const existingUser = await this.database.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateDto.email && updateDto.email !== existingUser.email) {
            const emailExists = await this.database.user.findUnique({
                where: { email: updateDto.email.toLowerCase() },
            });
            if (emailExists) {
                throw new common_1.BadRequestException('Email already in use');
            }
        }
        const updateData = {};
        if (updateDto.email) {
            updateData.email = updateDto.email.toLowerCase();
        }
        if (updateDto.password) {
            updateData.passwordHash = await (0, bcrypt_1.hash)(updateDto.password, 12);
        }
        const updatedUser = await this.database.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                wallets: {
                    select: {
                        id: true,
                        address: true,
                        chainId: true,
                        isPrimary: true,
                        label: true,
                    },
                },
                referredBy: {
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
        await this.createAuditLog(userId, 'USER_UPDATE', 'USER', userId, {
            updatedFields: Object.keys(updateData),
            email: updateDto.email,
        });
        this.logger.log(`User profile updated: ${userId}`);
        const { passwordHash, ...safeUser } = updatedUser;
        return safeUser;
    }
    async addWallet(userId, walletDto) {
        const user = await this.database.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingWallet = await this.database.wallet.findFirst({
            where: {
                address: walletDto.address.toLowerCase(),
                chainId: walletDto.chainId,
            },
        });
        if (existingWallet) {
            throw new common_1.BadRequestException('Wallet address already registered');
        }
        if (walletDto.isPrimary) {
            await this.database.wallet.updateMany({
                where: { userId },
                data: { isPrimary: false },
            });
        }
        const wallet = await this.database.wallet.create({
            data: {
                userId,
                address: walletDto.address.toLowerCase(),
                chainId: walletDto.chainId,
                label: walletDto.label || `Wallet ${walletDto.chainId}`,
                isPrimary: walletDto.isPrimary || false,
            },
        });
        await this.createAuditLog(userId, 'WALLET_ADD', 'WALLET', wallet.id, {
            address: wallet.address,
            chainId: wallet.chainId,
            label: wallet.label,
        });
        this.logger.log(`Wallet added for user ${userId}: ${wallet.address}`);
        return wallet;
    }
    async removeWallet(userId, walletId) {
        const wallet = await this.database.wallet.findFirst({
            where: {
                id: walletId,
                userId,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found or does not belong to user');
        }
        await this.database.wallet.delete({
            where: { id: walletId },
        });
        await this.createAuditLog(userId, 'WALLET_REMOVE', 'WALLET', walletId, {
            address: wallet.address,
            chainId: wallet.chainId,
        });
        this.logger.log(`Wallet removed for user ${userId}: ${wallet.address}`);
        return { message: 'Wallet removed successfully' };
    }
    async updateKycStatus(userId, kycDto, adminId) {
        const user = await this.database.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.database.user.update({
            where: { id: userId },
            data: {
                kycStatus: kycDto.kycStatus,
                kycData: kycDto.kycData || user.kycData,
            },
            include: {
                wallets: {
                    select: {
                        id: true,
                        address: true,
                        chainId: true,
                        isPrimary: true,
                        label: true,
                    },
                },
            },
        });
        await this.createAuditLog(adminId, 'KYC_UPDATE', 'USER', userId, {
            oldStatus: user.kycStatus,
            newStatus: kycDto.kycStatus,
            kycData: kycDto.kycData,
        });
        this.logger.log(`KYC status updated for user ${userId}: ${user.kycStatus} -> ${kycDto.kycStatus}`);
        const { passwordHash, ...safeUser } = updatedUser;
        return safeUser;
    }
    async updateUserRole(userId, roleDto, adminId) {
        const user = await this.database.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.database.user.update({
            where: { id: userId },
            data: { role: roleDto.role },
            include: {
                wallets: {
                    select: {
                        id: true,
                        address: true,
                        chainId: true,
                        isPrimary: true,
                        label: true,
                    },
                },
            },
        });
        await this.createAuditLog(adminId, 'ROLE_UPDATE', 'USER', userId, {
            oldRole: user.role,
            newRole: roleDto.role,
        });
        this.logger.log(`User role updated for ${userId}: ${user.role} -> ${roleDto.role}`);
        const { passwordHash, ...safeUser } = updatedUser;
        return safeUser;
    }
    async toggleUserStatus(userId, adminId) {
        const user = await this.database.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.database.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            include: {
                wallets: {
                    select: {
                        id: true,
                        address: true,
                        chainId: true,
                        isPrimary: true,
                        label: true,
                    },
                },
            },
        });
        await this.createAuditLog(adminId, user.isActive ? 'USER_DEACTIVATE' : 'USER_ACTIVATE', 'USER', userId, {
            oldStatus: user.isActive,
            newStatus: !user.isActive,
        });
        this.logger.log(`User status toggled for ${userId}: ${user.isActive} -> ${!user.isActive}`);
        const { passwordHash, ...safeUser } = updatedUser;
        return safeUser;
    }
    async getUserStats(statsDto) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        let dateFilter = {};
        if (statsDto.startDate && statsDto.endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(statsDto.startDate),
                    lte: new Date(statsDto.endDate),
                },
            };
        }
        const [totalUsers, activeUsers, newUsersToday, newUsersThisWeek, newUsersThisMonth, usersByRole, usersByKycStatus,] = await Promise.all([
            this.database.user.count(dateFilter.createdAt ? { where: dateFilter } : { where: {} }),
            this.database.user.count({
                where: { isActive: true, ...dateFilter }
            }),
            this.database.user.count({
                where: { createdAt: { gte: today } }
            }),
            this.database.user.count({
                where: { createdAt: { gte: thisWeek } }
            }),
            this.database.user.count({
                where: { createdAt: { gte: thisMonth } }
            }),
            this.database.user.groupBy({
                by: ['role'],
                _count: true,
                ...(dateFilter.createdAt && { where: dateFilter }),
            }),
            this.database.user.groupBy({
                by: ['kycStatus'],
                _count: true,
                ...(dateFilter.createdAt && { where: dateFilter }),
            }),
        ]);
        const roleStats = {};
        Object.values(database_1.UserRole).forEach(role => {
            roleStats[role] = 0;
        });
        usersByRole.forEach(item => {
            roleStats[item.role] = item._count;
        });
        const kycStats = {};
        Object.values(database_1.KycStatus).forEach(status => {
            kycStats[status] = 0;
        });
        usersByKycStatus.forEach(item => {
            kycStats[item.kycStatus] = item._count;
        });
        return {
            totalUsers,
            activeUsers,
            newUsersToday,
            newUsersThisWeek,
            newUsersThisMonth,
            usersByRole: roleStats,
            usersByKycStatus: kycStats,
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
                    metadata: metadata,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }
    mapDatabaseUserToResponseDto(user) {
        return {
            id: user.id,
            email: user.email ?? undefined,
            role: user.role,
            referralCode: user.referralCode,
            kycStatus: user.kycStatus,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt ?? undefined,
            wallets: (user.wallets || []).map((wallet) => ({
                id: wallet.id,
                address: wallet.address,
                chainId: wallet.chainId,
                isPrimary: wallet.isPrimary ?? false,
                label: wallet.label ?? undefined,
            })),
            referredBy: user.referredBy ? {
                id: user.referredBy.id,
                referralCode: user.referredBy.referralCode,
                email: user.referredBy.email ?? undefined,
            } : undefined,
            agent: user.agent ? {
                id: user.agent.id,
                referralCode: user.agent.referralCode,
                email: user.agent.email ?? undefined,
            } : undefined,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        performance_optimizer_service_1.PerformanceOptimizerService])
], UsersService);
//# sourceMappingURL=users.service.js.map