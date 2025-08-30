import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
import { UserRole } from '@qa-app/database';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserResponseDto })
  @Get('me')
  async getProfile(@Req() req: any): Promise<UserResponseDto> {
    return this.usersService.findById(req.user.id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Put('me')
  async updateProfile(
    @Req() req: any,
    @Body() updateDto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Get current user wallets' })
  @ApiResponse({ 
    status: 200, 
    description: 'User wallets retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          address: { type: 'string' },
          chainId: { type: 'number' },
          isPrimary: { type: 'boolean' },
          label: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @Get('me/wallets')
  async getMyWallets(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return user.wallets;
  }

  @ApiOperation({ summary: 'Add wallet to current user' })
  @ApiResponse({ status: 201, description: 'Wallet added successfully' })
  @ApiResponse({ status: 400, description: 'Wallet address already registered' })
  @Post('me/wallets')
  async addWallet(
    @Req() req: any,
    @Body() walletDto: AddWalletDto,
  ) {
    return this.usersService.addWallet(req.user.id, walletDto);
  }

  @ApiOperation({ summary: 'Remove wallet from current user' })
  @ApiResponse({ status: 200, description: 'Wallet removed successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @HttpCode(HttpStatus.OK)
  @Delete('me/wallets/:walletId')
  async removeWallet(
    @Req() req: any,
    @Param('walletId', ParseUUIDPipe) walletId: string,
  ) {
    return this.usersService.removeWallet(req.user.id, walletId);
  }

  @ApiOperation({ summary: 'Get user by referral code' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('referral/:code')
  async getUserByReferralCode(@Param('code') code: string) {
    return this.usersService.findByReferralCode(code);
  }

  // Admin Routes
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' }
      }
    }
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllUsers(@Query() queryDto: UserQueryDto) {
    return this.usersService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update user KYC status (Admin only)' })
  @ApiResponse({ status: 200, description: 'KYC status updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/kyc')
  async updateKycStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() kycDto: UpdateKycStatusDto,
    @Req() req: any,
  ): Promise<UserResponseDto> {
    return this.usersService.updateKycStatus(id, kycDto, req.user.id);
  }

  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/role')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() roleDto: UpdateUserRoleDto,
    @Req() req: any,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserRole(id, roleDto, req.user.id);
  }

  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status toggled successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post(':id/toggle-status')
  async toggleUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<UserResponseDto> {
    return this.usersService.toggleUserStatus(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully', type: UserStatsResponseDto })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/stats')
  async getUserStats(@Query() statsDto: UserStatsDto): Promise<UserStatsResponseDto> {
    return this.usersService.getUserStats(statsDto);
  }
}