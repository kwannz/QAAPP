import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, UserRole, KycStatus } from '@qa-app/database';

import { 
  prisma, 
  createPaginationQuery, 
  createPaginatedResult,
  PaginationOptions,
  PaginatedResult,
  validateUserData,
  handleDatabaseError
} from '@qa-app/database';

@Injectable()
export class UsersService {
  // 根据ID查找用户
  async findById(id: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
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
            take: 10, // 只返回最近10个活跃仓位
          },
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 根据邮箱查找用户
  async findByEmail(email: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
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
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 根据推荐码查找用户
  async findByReferralCode(referralCode: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
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
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 根据钱包地址查找用户
  async findByWalletAddress(address: string): Promise<any> {
    try {
      const wallet = await prisma.wallet.findFirst({
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
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 分页查询用户列表
  async findMany(options: PaginationOptions & {
    role?: UserRole;
    kycStatus?: KycStatus;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedResult<any>> {
    const { skip, take, page, limit } = createPaginationQuery(options);

    try {
      const where: Prisma.UserWhereInput = {};

      // 角色筛选
      if (options.role) {
        where.role = options.role;
      }

      // KYC状态筛选
      if (options.kycStatus) {
        where.kycStatus = options.kycStatus;
      }

      // 活跃状态筛选
      if (options.isActive !== undefined) {
        where.isActive = options.isActive;
      }

      // 搜索条件
      if (options.search) {
        where.OR = [
          { email: { contains: options.search, mode: 'insensitive' } },
          { referralCode: { contains: options.search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
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
        prisma.user.count({ where }),
      ]);

      return createPaginatedResult(users, total, page, limit);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 创建新用户
  async create(userData: Prisma.UserCreateInput): Promise<any> {
    // 验证用户数据
    const validation = validateUserData({
      email: userData.email ?? undefined,
      role: userData.role,
      referralCode: userData.referralCode,
      kycStatus: userData.kycStatus,
    });

    if (!validation.isValid) {
      throw new BadRequestException(`数据验证失败: ${validation.errors.join(', ')}`);
    }

    try {
      return await prisma.user.create({
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
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 更新用户信息
  async update(id: string, updateData: Prisma.UserUpdateInput): Promise<any> {
    // 验证更新数据
    const validation = validateUserData({
      email: updateData.email as string,
      role: updateData.role as string,
      kycStatus: updateData.kycStatus as string,
    });

    if (!validation.isValid) {
      throw new BadRequestException(`数据验证失败: ${validation.errors.join(', ')}`);
    }

    try {
      const user = await prisma.user.update({
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
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 更新最后登录时间
  async updateLastLogin(id: string): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 更新密码
  async updatePassword(id: string, passwordHash: string): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 更新KYC状态
  async updateKycStatus(id: string, kycStatus: KycStatus, kycData?: any): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          kycStatus,
          kycData,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 添加钱包地址
  async addWallet(userId: string, walletData: {
    chainId: number;
    address: string;
    isPrimary?: boolean;
    label?: string;
  }) {
    try {
      // 如果是主钱包，先将其他钱包设为非主钱包
      if (walletData.isPrimary) {
        await prisma.wallet.updateMany({
          where: { userId },
          data: { isPrimary: false },
        });
      }

      return await prisma.wallet.create({
        data: {
          userId,
          ...walletData,
          address: walletData.address.toLowerCase(),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 删除钱包地址
  async removeWallet(userId: string, walletId: string) {
    try {
      // 检查钱包是否属于该用户
      const wallet = await prisma.wallet.findFirst({
        where: { 
          id: walletId,
          userId,
        },
      });

      if (!wallet) {
        throw new NotFoundException('钱包地址不存在');
      }

      return await prisma.wallet.delete({
        where: { id: walletId },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 设置主钱包
  async setPrimaryWallet(userId: string, walletId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 检查钱包是否属于该用户
        const wallet = await tx.wallet.findFirst({
          where: { 
            id: walletId,
            userId,
          },
        });

        if (!wallet) {
          throw new NotFoundException('钱包地址不存在');
        }

        // 将所有钱包设为非主钱包
        await tx.wallet.updateMany({
          where: { userId },
          data: { isPrimary: false },
        });

        // 设置指定钱包为主钱包
        return await tx.wallet.update({
          where: { id: walletId },
          data: { isPrimary: true },
        });
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 获取用户统计信息
  async getUserStats(userId: string) {
    try {
      const [
        orderStats,
        positionStats,
        commissionStats,
        payoutStats,
      ] = await Promise.all([
        // 订单统计
        prisma.order.aggregate({
          where: { userId },
          _count: true,
          _sum: { usdtAmount: true },
        }),
        // 仓位统计
        prisma.position.aggregate({
          where: { userId },
          _count: true,
          _sum: { principal: true },
        }),
        // 佣金统计
        prisma.commission.aggregate({
          where: { userId },
          _count: true,
          _sum: { amount: true },
        }),
        // 分红统计
        prisma.payout.aggregate({
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
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 获取推荐用户列表
  async getReferrals(userId: string, options: PaginationOptions): Promise<any> {
    const { skip, take, page, limit } = createPaginationQuery(options);

    try {
      const [referrals, total] = await Promise.all([
        prisma.user.findMany({
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
        prisma.user.count({
          where: { referredById: userId },
        }),
      ]);

      return createPaginatedResult(referrals, total, page, limit);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 禁用/启用用户
  async toggleUserStatus(id: string, isActive: boolean): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 软删除用户（将isActive设为false）
  async softDelete(id: string): Promise<any> {
    return this.toggleUserStatus(id, false);
  }
}