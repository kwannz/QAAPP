import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiVersion,
  VersionedEndpoint,
  ApiVersionParam,
  ClientVersionInfo,
  ApiBeta
} from '../versioning/version.decorator';
import { UserService } from './user.service';

// V2版本的数据传输对象
export class CreateUserV2Dto {
  username: string;
  email: string;
  password: string;
  phone?: string;          // V2新增字段
  profile?: {
    firstName?: string;     // V2使用驼峰命名
    lastName?: string;
    avatar?: string;        // V2新增字段
    bio?: string;          // V2新增字段
    timezone?: string;     // V2新增字段
    preferences?: {        // V2新增嵌套对象
      notifications: boolean;
      theme: 'light' | 'dark';
      language: string;
    };
  };
  metadata?: Record<string, any>; // V2新增元数据
}

export class UpdateUserV2Dto {
  username?: string;
  email?: string;
  phone?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    timezone?: string;
    preferences?: {
      notifications?: boolean;
      theme?: 'light' | 'dark';
      language?: string;
    };
  };
  isActive?: boolean;      // V2新增字段
  metadata?: Record<string, any>;
}

export class UserV2Response {
  id: number;
  username: string;
  email: string;
  phone?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    timezone?: string;
    preferences: {
      notifications: boolean;
      theme: 'light' | 'dark';
      language: string;
    };
  };
  isActive: boolean;       // V2新增字段
  lastLoginAt?: string;    // V2新增字段
  createdAt: string;       // V2使用驼峰命名
  updatedAt: string;
  metadata?: Record<string, any>;
  // V2新增统计信息
  stats: {
    loginCount: number;
    positionCount: number;
    orderCount: number;
  };
}

export class UserAnalyticsV2Response {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRegion: Record<string, number>;
  usersByPlan: Record<string, number>;
  averageSessionDuration: number;
  retentionRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  topUserAgents: Array<{
    userAgent: string;
    count: number;
  }>;
}

@ApiTags('Users V2')
@ApiBearerAuth()
@Controller({ path: 'users', version: '2' })
@ApiVersion('v2')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserV2Controller {

  constructor(private userService: UserService) {}

  /**
   * 获取用户列表 - V2版本
   */
  @Get()
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Get users list (V2 format with enhanced fields and camelCase naming)'
  })
  @ApiOperation({ 
    summary: 'Get users list (V2)', 
    description: 'Returns users in V2 format with enhanced profile information and camelCase naming' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Users retrieved successfully',
    type: [UserV2Response]
  })
  @Roles('admin', 'user')
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('isActive') isActive?: boolean,        // V2新增过滤器
    @Query('region') region?: string,             // V2新增过滤器
    @ApiVersionParam() version: string,
    @ClientVersionInfo() clientInfo: any
  ): Promise<{
    users: UserV2Response[];
    pagination: {                                 // V2使用更结构化的分页信息
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {                                   // V2返回应用的过滤器
      isActive?: boolean;
      region?: string;
      search?: string;
    };
  }> {
    const result = await this.userService.findMany({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      isActive,
      region
    });

    // 转换为V2格式
    const users = await Promise.all(
      result.users.map(user => this.transformToV2Format(user))
    );

    return {
      users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      },
      filters: {
        isActive,
        region,
        search
      }
    };
  }

  /**
   * 获取单个用户 - V2版本
   */
  @Get(':id')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Get user by ID (V2 format with complete profile and statistics)'
  })
  @ApiOperation({ summary: 'Get user by ID (V2)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User found',
    type: UserV2Response
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin', 'user')
  async getUserById(
    @Param('id') id: number,
    @CurrentUser() currentUser: any,
    @ApiVersionParam() version: string,
    @Query('includeStats') includeStats: boolean = true    // V2可选统计信息
  ): Promise<UserV2Response> {
    // 权限检查
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Access denied');
    }

    const user = await this.userService.findById(id);
    return await this.transformToV2Format(user, includeStats);
  }

  /**
   * 创建用户 - V2版本
   */
  @Post()
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Create new user (V2 format with enhanced profile fields)'
  })
  @ApiOperation({ 
    summary: 'Create user (V2)', 
    description: 'Create new user with V2 enhanced profile and preference fields' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User created successfully',
    type: UserV2Response
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @Roles('admin')
  async createUser(
    @Body() createUserDto: CreateUserV2Dto,
    @ApiVersionParam() version: string,
    @ClientVersionInfo() clientInfo: any
  ): Promise<UserV2Response> {
    const user = await this.userService.create(createUserDto);
    return await this.transformToV2Format(user);
  }

  /**
   * 更新用户 - V2版本
   */
  @Put(':id')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Update user (V2 format with partial updates and nested profile)'
  })
  @ApiOperation({ summary: 'Update user (V2)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User updated successfully',
    type: UserV2Response
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin', 'user')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserV2Dto,
    @CurrentUser() currentUser: any,
    @ApiVersionParam() version: string
  ): Promise<UserV2Response> {
    // 权限检查
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Access denied');
    }

    const user = await this.userService.update(id, updateUserDto);
    return await this.transformToV2Format(user);
  }

  /**
   * 批量更新用户状态 - V2新增功能
   */
  @Put('batch/status')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.1.0',
    description: 'Batch update user status'
  })
  @ApiOperation({ summary: 'Batch update user status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Users updated successfully'
  })
  @Roles('admin')
  async batchUpdateUserStatus(
    @Body() data: { 
      userIds: number[]; 
      isActive: boolean; 
      reason?: string 
    },
    @ApiVersionParam() version: string
  ): Promise<{
    updatedCount: number;
    failedIds: number[];
    message: string;
  }> {
    const result = await this.userService.batchUpdateStatus(
      data.userIds, 
      data.isActive,
      data.reason
    );
    
    return {
      updatedCount: result.updatedCount,
      failedIds: result.failedIds,
      message: `Updated ${result.updatedCount} users successfully`
    };
  }

  /**
   * 删除用户 - V2版本（软删除）
   */
  @Delete(':id')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Soft delete user (V2 maintains data integrity)'
  })
  @ApiOperation({ 
    summary: 'Delete user (V2)', 
    description: 'Soft delete user to maintain data integrity and audit trail' 
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin')
  async deleteUser(
    @Param('id') id: number,
    @ApiVersionParam() version: string,
    @Body() data?: { reason?: string; hardDelete?: boolean }
  ): Promise<{
    message: string;
    deletedId: number;
    deletedAt: string;
    isHardDelete: boolean;
  }> {
    const result = await this.userService.delete(id, {
      reason: data?.reason,
      hardDelete: data?.hardDelete || false
    });
    
    return {
      message: result.hardDelete ? 'User permanently deleted' : 'User soft deleted successfully',
      deletedId: id,
      deletedAt: new Date().toISOString(),
      isHardDelete: result.hardDelete
    };
  }

  /**
   * 获取用户分析数据 - V2新功能
   */
  @Get('analytics/overview')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Get comprehensive user analytics and insights'
  })
  @ApiOperation({ 
    summary: 'Get user analytics (V2)', 
    description: 'Comprehensive user analytics with detailed metrics and insights' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Analytics retrieved successfully',
    type: UserAnalyticsV2Response
  })
  @Roles('admin')
  async getUserAnalytics(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('includeInactive') includeInactive: boolean = false,
    @ApiVersionParam() version: string
  ): Promise<UserAnalyticsV2Response> {
    const analytics = await this.userService.getAnalytics({
      period,
      includeInactive
    });

    return analytics;
  }

  /**
   * 导出用户数据 - V2新功能
   */
  @Post('export')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.2.0',
    description: 'Export user data in various formats'
  })
  @ApiOperation({ summary: 'Export user data' })
  @ApiResponse({ 
    status: HttpStatus.ACCEPTED, 
    description: 'Export job started'
  })
  @Roles('admin')
  async exportUsers(
    @Body() exportConfig: {
      format: 'csv' | 'json' | 'xlsx';
      filters?: {
        isActive?: boolean;
        createdAfter?: string;
        createdBefore?: string;
        region?: string;
      };
      fields?: string[];
      includeProfile?: boolean;
    },
    @ApiVersionParam() version: string,
    @CurrentUser() currentUser: any
  ): Promise<{
    jobId: string;
    status: string;
    estimatedTime: number;
    downloadUrl?: string;
  }> {
    const exportJob = await this.userService.createExportJob({
      ...exportConfig,
      requestedBy: currentUser.id
    });

    return {
      jobId: exportJob.id,
      status: exportJob.status,
      estimatedTime: exportJob.estimatedTime,
      downloadUrl: exportJob.downloadUrl
    };
  }

  /**
   * 用户偏好设置 - V2新功能
   */
  @Put(':id/preferences')
  @VersionedEndpoint({
    version: 'v2',
    since: 'v2.0.0',
    description: 'Update user preferences and settings'
  })
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Preferences updated successfully' })
  @Roles('admin', 'user')
  async updatePreferences(
    @Param('id') id: number,
    @Body() preferences: {
      notifications: boolean;
      theme: 'light' | 'dark';
      language: string;
      timezone?: string;
      emailSubscriptions?: {
        marketing: boolean;
        updates: boolean;
        security: boolean;
      };
    },
    @CurrentUser() currentUser: any,
    @ApiVersionParam() version: string
  ): Promise<{
    message: string;
    preferences: any;
  }> {
    // 权限检查
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Access denied');
    }

    const updatedPreferences = await this.userService.updatePreferences(id, preferences);
    
    return {
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    };
  }

  /**
   * 获取用户活动记录 - V2新功能
   */
  @Get(':id/activities')
  @ApiBeta({
    version: 'v2.3.0',
    description: 'User activity tracking',
    stableDate: '2024-12-01'
  })
  @ApiOperation({ summary: 'Get user activity log (Beta)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity log retrieved' })
  @Roles('admin', 'user')
  async getUserActivities(
    @Param('id') id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('type') type?: string,
    @CurrentUser() currentUser: any,
    @ApiVersionParam() version: string
  ): Promise<{
    activities: Array<{
      id: string;
      type: string;
      description: string;
      metadata: any;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
    }>;
    pagination: any;
  }> {
    // 权限检查
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Access denied');
    }

    const activities = await this.userService.getUserActivities(id, {
      page,
      limit,
      type
    });

    return activities;
  }

  /**
   * 数据格式转换：内部格式 -> V2格式
   */
  private async transformToV2Format(user: any, includeStats: boolean = true): Promise<UserV2Response> {
    // 获取用户统计信息
    const stats = includeStats ? await this.userService.getUserStats(user.id) : {
      loginCount: 0,
      positionCount: 0,
      orderCount: 0
    };

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        avatar: user.profile?.avatar,
        bio: user.profile?.bio,
        timezone: user.profile?.timezone,
        preferences: {
          notifications: user.profile?.preferences?.notifications ?? true,
          theme: user.profile?.preferences?.theme ?? 'light',
          language: user.profile?.preferences?.language ?? 'en'
        }
      },
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      metadata: user.metadata,
      stats
    };
  }
}