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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const users_dto_1 = require("./dto/users.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        return this.usersService.findById(req.user.id);
    }
    async updateProfile(req, updateDto) {
        return this.usersService.updateProfile(req.user.id, updateDto);
    }
    async getMyWallets(req) {
        const user = await this.usersService.findById(req.user.id);
        return user.wallets;
    }
    async addWallet(req, walletDto) {
        return this.usersService.addWallet(req.user.id, walletDto);
    }
    async removeWallet(req, walletId) {
        return this.usersService.removeWallet(req.user.id, walletId);
    }
    async getUserByReferralCode(code) {
        return this.usersService.findByReferralCode(code);
    }
    async getAllUsers(queryDto) {
        return this.usersService.findAll(queryDto);
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async updateKycStatus(id, kycDto, req) {
        return this.usersService.updateKycStatus(id, kycDto, req.user.id);
    }
    async updateUserRole(id, roleDto, req) {
        return this.usersService.updateUserRole(id, roleDto, req.user.id);
    }
    async toggleUserStatus(id, req) {
        return this.usersService.toggleUserStatus(id, req.user.id);
    }
    async getUserStats(statsDto) {
        return this.usersService.getUserStats(statsDto);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully', type: users_dto_1.UserResponseDto }),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile updated successfully', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, common_1.Put)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateUserProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user wallets' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, common_1.Get)('me/wallets'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyWallets", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Add wallet to current user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Wallet address already registered' }),
    (0, common_1.Post)('me/wallets'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.AddWalletDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addWallet", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remove wallet from current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Wallet not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Delete)('me/wallets/:walletId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('walletId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeWallet", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get user by referral code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.Get)('referral/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByReferralCode", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (Admin only)' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.UserQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update user KYC status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status updated successfully', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Put)(':id/kyc'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateKycStatusDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateKycStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update user role (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role updated successfully', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Put)(':id/role'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserRoleDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserRole", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Toggle user active status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status toggled successfully', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleUserStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully', type: users_dto_1.UserStatsResponseDto }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.UserStatsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map