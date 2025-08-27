import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole, KycStatus } from '@qa-app/database';

import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/interfaces/auth.interface';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCurrentUser(@GetCurrentUser() user: CurrentUser): Promise<any> {
    const fullUserInfo = await this.usersService.findById(user.id);
    const stats = await this.usersService.getUserStats(user.id);
    
    return {
      ...fullUserInfo,
      stats,
    };
  }

  @Put('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCurrentUser(
    @GetCurrentUser('id') userId: string,
    @Body() updateData: any,
  ): Promise<any> {
    // 普通用户只能更新有限的字段
    const allowedFields = ['email'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key: string) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    return this.usersService.update(userId, filteredData);
  }

  @Get('me/stats')
  @ApiOperation({ summary: '获取当前用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCurrentUserStats(@GetCurrentUser('id') userId: string): Promise<any> {
    return this.usersService.getUserStats(userId);
  }

  @Get('me/referrals')
  @ApiOperation({ summary: '获取我的推荐用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyReferrals(
    @GetCurrentUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<any> {
    return this.usersService.getReferrals(userId, { page, limit });
  }

  @Post('me/wallets')
  @ApiOperation({ summary: '添加钱包地址' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addWallet(
    @GetCurrentUser('id') userId: string,
    @Body() walletData: {
      chainId: number;
      address: string;
      isPrimary?: boolean;
      label?: string;
    },
  ): Promise<any> {
    return this.usersService.addWallet(userId, walletData);
  }

  @Delete('me/wallets/:walletId')
  @ApiOperation({ summary: '删除钱包地址' })
  @ApiParam({ name: 'walletId', description: '钱包ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeWallet(
    @GetCurrentUser('id') userId: string,
    @Param('walletId') walletId: string,
  ): Promise<any> {
    return this.usersService.removeWallet(userId, walletId);
  }

  @Put('me/wallets/:walletId/primary')
  @ApiOperation({ summary: '设置主钱包' })
  @ApiParam({ name: 'walletId', description: '钱包ID' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setPrimaryWallet(
    @GetCurrentUser('id') userId: string,
    @Param('walletId') walletId: string,
  ): Promise<any> {
    return this.usersService.setPrimaryWallet(userId, walletId);
  }

  // 管理员专用接口
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取用户列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'kycStatus', required: false, enum: KycStatus })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('role') role?: UserRole,
    @Query('kycStatus') kycStatus?: KycStatus,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
  ): Promise<any> {
    return this.usersService.findMany({
      page,
      limit,
      role,
      kycStatus,
      isActive,
      search,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: '获取指定用户信息（管理员/代理商）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUser(@Param('id') id: string): Promise<any> {
    const user = await this.usersService.findById(id);
    const stats = await this.usersService.getUserStats(id);
    
    return {
      ...user,
      stats,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户信息（管理员）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
  ): Promise<any> {
    return this.usersService.update(id, updateData);
  }

  @Put(':id/kyc-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户KYC状态（管理员）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateKycStatus(
    @Param('id') id: string,
    @Body() data: { kycStatus: KycStatus; kycData?: any },
  ): Promise<any> {
    return this.usersService.updateKycStatus(id, data.kycStatus, data.kycData);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '启用/禁用用户（管理员）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() data: { isActive: boolean },
  ): Promise<any> {
    return this.usersService.toggleUserStatus(id, data.isActive);
  }

  @Get(':id/referrals')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: '获取用户推荐列表（管理员/代理商）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserReferrals(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<any> {
    return this.usersService.getReferrals(id, { page, limit });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除用户（软删除，管理员）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteUser(@Param('id') id: string): Promise<any> {
    return this.usersService.softDelete(id);
  }
}