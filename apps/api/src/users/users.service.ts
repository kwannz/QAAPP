import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { hash } from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { PerformanceOptimizerService } from '../common/performance/performance-optimizer.service';
import { 
  UpdateUserProfileDto, 
  AddWalletDto, 
  UpdateKycStatusDto, 
  UpdateUserRoleDto,
  UserQueryDto,
  UserStatsDto,
  UserResponseDto,
  UserStatsResponseDto
} from './dto/users.dto';
import { UserRole, KycStatus } from '@qa-app/database';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private database: DatabaseService,
    private performanceOptimizer: PerformanceOptimizerService
  ) {}

  /**
   * 根据ID查找用户 - 优化版本
   */
  async findById(id: string): Promise<any> {
    const cacheKey = `user_detail:${id}`;
    
    return this.performanceOptimizer.optimizeDbQuery(
      cacheKey,
      async () => {
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
              orderBy: { isPrimary: 'desc' }, // 主钱包优先
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
          throw new NotFoundException('User not found');
        }

        // 不返回敏感信息
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      },
      { selectFields: ['id', 'email', 'role', 'isActive'], joinOptimization: true } // 用户数据优化
    );
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<any> {
    return this.database.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        wallets: true,
      },
    });
  }

  /**
   * 根据推荐码查找用户
   */
  async findByReferralCode(referralCode: string): Promise<any> {
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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * 查找所有用户（分页）- 优化版本
   */
  async findAll(queryDto: UserQueryDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, email, role, kycStatus, referralCode, isActive } = queryDto;
    const skip = (page - 1) * limit;

    // 构建缓存键
    const cacheKey = `users_list:${JSON.stringify(queryDto)}`;

    return this.performanceOptimizer.optimizeDbQuery(
      cacheKey,
      async () => {
        // 构建查询条件
        const where: any = {};
        
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

        // 优化：使用批处理和高效选择
        const [users, total] = await Promise.all([
          this.database.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
              { createdAt: 'desc' },
              { id: 'asc' } // 辅助排序保证一致性
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
              // 优化：只加载主钱包，减少数据传输
              wallets: {
                where: { isPrimary: true },
                select: {
                  id: true,
                  address: true,
                  chainId: true,
                  label: true,
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
              // 添加聚合信息减少额外查询
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
          users: users as UserResponseDto[],
          total,
          page,
          limit,
          totalPages,
        };
      },
      { selectFields: ['id', 'email', 'role', 'kycStatus'], joinOptimization: true } // 用户列表优化
    );
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<UserResponseDto> {
    const existingUser = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // 检查邮箱是否已被使用
    if (updateDto.email && updateDto.email !== existingUser.email) {
      const emailExists = await this.database.user.findUnique({
        where: { email: updateDto.email.toLowerCase() },
      });

      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    // 准备更新数据
    const updateData: any = {};
    
    if (updateDto.email) {
      updateData.email = updateDto.email.toLowerCase();
    }
    
    if (updateDto.password) {
      updateData.passwordHash = await hash(updateDto.password, 12);
    }

    // 更新用户
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

    // 记录审计日志
    await this.createAuditLog(userId, 'USER_UPDATE', 'USER', userId, {
      updatedFields: Object.keys(updateData),
      email: updateDto.email,
    });

    this.logger.log(`User profile updated: ${userId}`);

    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser as UserResponseDto;
  }

  /**
   * 添加钱包地址
   */
  async addWallet(userId: string, walletDto: AddWalletDto): Promise<any> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 检查钱包地址是否已存在
    const existingWallet = await this.database.wallet.findFirst({
      where: { 
        address: walletDto.address.toLowerCase(),
        chainId: walletDto.chainId,
      },
    });

    if (existingWallet) {
      throw new BadRequestException('Wallet address already registered');
    }

    // 如果设置为主钱包，先将其他钱包设为非主钱包
    if (walletDto.isPrimary) {
      await this.database.wallet.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    // 创建钱包记录
    const wallet = await this.database.wallet.create({
      data: {
        userId,
        address: walletDto.address.toLowerCase(),
        chainId: walletDto.chainId,
        label: walletDto.label || `Wallet ${walletDto.chainId}`,
        isPrimary: walletDto.isPrimary || false,
      },
    });

    // 记录审计日志
    await this.createAuditLog(userId, 'WALLET_ADD', 'WALLET', wallet.id, {
      address: wallet.address,
      chainId: wallet.chainId,
      label: wallet.label,
    });

    this.logger.log(`Wallet added for user ${userId}: ${wallet.address}`);

    return wallet;
  }

  /**
   * 删除钱包地址
   */
  async removeWallet(userId: string, walletId: string): Promise<{ message: string }> {
    // 检查钱包是否属于该用户
    const wallet = await this.database.wallet.findFirst({
      where: { 
        id: walletId,
        userId,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found or does not belong to user');
    }

    // 删除钱包
    await this.database.wallet.delete({
      where: { id: walletId },
    });

    // 记录审计日志
    await this.createAuditLog(userId, 'WALLET_REMOVE', 'WALLET', walletId, {
      address: wallet.address,
      chainId: wallet.chainId,
    });

    this.logger.log(`Wallet removed for user ${userId}: ${wallet.address}`);

    return { message: 'Wallet removed successfully' };
  }

  /**
   * 更新用户KYC状态（管理员功能）
   */
  async updateKycStatus(userId: string, kycDto: UpdateKycStatusDto, adminId: string): Promise<UserResponseDto> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 更新KYC状态
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

    // 记录审计日志
    await this.createAuditLog(adminId, 'KYC_UPDATE', 'USER', userId, {
      oldStatus: user.kycStatus,
      newStatus: kycDto.kycStatus,
      kycData: kycDto.kycData,
    });

    this.logger.log(`KYC status updated for user ${userId}: ${user.kycStatus} -> ${kycDto.kycStatus}`);

    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser as UserResponseDto;
  }

  /**
   * 更新用户角色（超级管理员功能）
   */
  async updateUserRole(userId: string, roleDto: UpdateUserRoleDto, adminId: string): Promise<UserResponseDto> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 更新角色
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

    // 记录审计日志
    await this.createAuditLog(adminId, 'ROLE_UPDATE', 'USER', userId, {
      oldRole: user.role,
      newRole: roleDto.role,
    });

    this.logger.log(`User role updated for ${userId}: ${user.role} -> ${roleDto.role}`);

    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser as UserResponseDto;
  }

  /**
   * 激活/停用用户
   */
  async toggleUserStatus(userId: string, adminId: string): Promise<UserResponseDto> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 切换状态
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

    // 记录审计日志
    await this.createAuditLog(adminId, user.isActive ? 'USER_DEACTIVATE' : 'USER_ACTIVATE', 'USER', userId, {
      oldStatus: user.isActive,
      newStatus: !user.isActive,
    });

    this.logger.log(`User status toggled for ${userId}: ${user.isActive} -> ${!user.isActive}`);

    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser as UserResponseDto;
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(statsDto: UserStatsDto): Promise<UserStatsResponseDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 构建日期范围
    let dateFilter: any = {};
    if (statsDto.startDate && statsDto.endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(statsDto.startDate),
          lte: new Date(statsDto.endDate),
        },
      };
    }

    // 并行查询各种统计数据
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      usersByRole,
      usersByKycStatus,
    ] = await Promise.all([
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

    // 格式化角色统计
    const roleStats: Record<string, number> = {};
    Object.values(UserRole).forEach(role => {
      roleStats[role] = 0;
    });
    usersByRole.forEach(item => {
      roleStats[item.role] = item._count;
    });

    // 格式化KYC统计
    const kycStats: Record<string, number> = {};
    Object.values(KycStatus).forEach(status => {
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

  /**
   * 创建审计日志
   */
  private async createAuditLog(
    actorId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    metadata: any,
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }
}