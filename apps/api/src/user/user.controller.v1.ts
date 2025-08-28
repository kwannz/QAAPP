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
  ApiDeprecated
} from '../versioning/version.decorator';
import { UserService } from './user.service';

// V1版本的数据传输对象
export class CreateUserV1Dto {
  username: string;
  email: string;
  password: string;
  first_name?: string;  // V1使用下划线命名
  last_name?: string;
}

export class UpdateUserV1Dto {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export class UserV1Response {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  // V1版本没有phone, avatar等字段
}

@ApiTags('Users V1')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
@ApiVersion('v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserV1Controller {

  constructor(private userService: UserService) {}

  /**
   * 获取用户列表 - V1版本
   */
  @Get()
  @VersionedEndpoint({
    version: 'v1',
    since: 'v1.0.0',
    until: 'v2.0.0',
    deprecated: true,
    alternativeEndpoint: '/v2/users',
    description: 'Get users list (V1 format with underscore naming)'
  })
  @ApiOperation({ 
    summary: 'Get users list (V1)', 
    description: 'Returns users in V1 format with underscore field naming' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Users retrieved successfully',
    type: [UserV1Response]
  })
  @Roles('admin', 'user')
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @ApiVersionParam() version: string,
    @ClientVersionInfo() clientInfo: any
  ): Promise<{
    users: UserV1Response[];
    total: number;
    page: number;
    limit: number;
    has_next: boolean; // V1使用下划线命名
    has_prev: boolean;
  }> {
    const result = await this.userService.findMany({
      page,
      limit,
      search
    });

    // 转换为V1格式
    const users = result.users.map(user => this.transformToV1Format(user));

    return {
      users,
      total: result.total,
      page: result.page,
      limit: result.limit,
      has_next: result.hasNext,
      has_prev: result.hasPrev
    };
  }

  /**
   * 获取单个用户 - V1版本
   */
  @Get(':id')
  @VersionedEndpoint({
    version: 'v1',
    since: 'v1.0.0',
    until: 'v2.0.0',
    deprecated: true,
    alternativeEndpoint: '/v2/users/:id',
    description: 'Get user by ID (V1 format)'
  })
  @ApiOperation({ summary: 'Get user by ID (V1)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User found',
    type: UserV1Response
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin', 'user')
  async getUserById(
    @Param('id') id: number,
    @CurrentUser() currentUser: any,
    @ApiVersionParam() version: string
  ): Promise<UserV1Response> {
    // 权限检查：用户只能查看自己的信息，管理员可以查看所有
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Access denied');
    }

    const user = await this.userService.findById(id);
    return this.transformToV1Format(user);
  }

  /**
   * 创建用户 - V1版本
   */
  @Post()
  @VersionedEndpoint({
    version: 'v1',
    since: 'v1.0.0',
    until: 'v2.0.0',
    deprecated: true,
    alternativeEndpoint: '/v2/users',
    description: 'Create new user (V1 format)',
    breakingChanges: [
      'V2 uses camelCase field names instead of snake_case',
      'V2 includes additional profile fields'
    ]
  })
  @ApiOperation({ 
    summary: 'Create user (V1)', 
    description: 'Create new user with V1 field naming conventions' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User created successfully',
    type: UserV1Response
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @Roles('admin')
  async createUser(
    @Body() createUserDto: CreateUserV1Dto,
    @ApiVersionParam() version: string,
    @ClientVersionInfo() clientInfo: any
  ): Promise<UserV1Response> {
    // 转换V1格式到内部格式
    const userData = {
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      profile: {
        firstName: createUserDto.first_name,
        lastName: createUserDto.last_name
      }
    };

    const user = await this.userService.create(userData);
    return this.transformToV1Format(user);
  }

  /**
   * 更新用户 - V1版本
   */
  @Put(':id')
  @VersionedEndpoint({
    version: 'v1',
    since: 'v1.0.0',
    until: 'v2.0.0',
    deprecated: true,
    alternativeEndpoint: '/v2/users/:id',
    description: 'Update user (V1 format)'
  })
  @ApiOperation({ summary: 'Update user (V1)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User updated successfully',
    type: UserV1Response
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin', 'user')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserV1Dto,
    @CurrentUser() currentUser: any,
    @ApiVersionParam() version: string
  ): Promise<UserV1Response> {
    // 权限检查
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Access denied');
    }

    // 转换V1格式到内部格式
    const updateData: any = {
      username: updateUserDto.username,
      email: updateUserDto.email
    };

    if (updateUserDto.first_name !== undefined || updateUserDto.last_name !== undefined) {
      updateData.profile = {
        firstName: updateUserDto.first_name,
        lastName: updateUserDto.last_name
      };
    }

    const user = await this.userService.update(id, updateData);
    return this.transformToV1Format(user);
  }

  /**
   * 删除用户 - V1版本
   */
  @Delete(':id')
  @VersionedEndpoint({
    version: 'v1',
    since: 'v1.0.0',
    until: 'v2.0.0',
    deprecated: true,
    alternativeEndpoint: '/v2/users/:id',
    description: 'Delete user (V1)'
  })
  @ApiOperation({ summary: 'Delete user (V1)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin')
  async deleteUser(
    @Param('id') id: number,
    @ApiVersionParam() version: string
  ): Promise<{ message: string; deleted_id: number }> {
    await this.userService.delete(id);
    
    return {
      message: 'User deleted successfully',
      deleted_id: id  // V1使用下划线命名
    };
  }

  /**
   * 获取用户统计 - V1版本，即将废弃
   */
  @Get('stats/summary')
  @ApiDeprecated({
    since: 'v1.5.0',
    until: 'v2.0.0',
    alternativeEndpoint: '/v2/users/analytics',
    reason: 'Replaced with more comprehensive analytics endpoint'
  })
  @ApiOperation({ 
    summary: 'Get user statistics (Deprecated)', 
    description: 'This endpoint is deprecated. Use /v2/users/analytics instead.' 
  })
  @Roles('admin')
  async getUserStats(
    @ApiVersionParam() version: string
  ): Promise<{
    total_users: number;
    active_users: number;
    new_users_today: number;
  }> {
    const stats = await this.userService.getBasicStats();
    
    return {
      total_users: stats.totalUsers,
      active_users: stats.activeUsers,
      new_users_today: stats.newUsersToday
    };
  }

  /**
   * 数据格式转换：内部格式 -> V1格式
   */
  private transformToV1Format(user: any): UserV1Response {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.profile?.firstName,
      last_name: user.profile?.lastName,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString()
      // V1版本不包含: phone, avatar, lastLoginAt, isActive 等字段
    };
  }
}