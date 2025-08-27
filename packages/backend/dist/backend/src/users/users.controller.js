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
const database_1 = require("@qa-app/database");
const users_service_1 = require("./users.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getCurrentUser(user) {
        const fullUserInfo = await this.usersService.findById(user.id);
        const stats = await this.usersService.getUserStats(user.id);
        return {
            ...fullUserInfo,
            stats,
        };
    }
    async updateCurrentUser(userId, updateData) {
        const allowedFields = ['email'];
        const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
        }, {});
        return this.usersService.update(userId, filteredData);
    }
    async getCurrentUserStats(userId) {
        return this.usersService.getUserStats(userId);
    }
    async getMyReferrals(userId, page, limit) {
        return this.usersService.getReferrals(userId, { page, limit });
    }
    async addWallet(userId, walletData) {
        return this.usersService.addWallet(userId, walletData);
    }
    async removeWallet(userId, walletId) {
        return this.usersService.removeWallet(userId, walletId);
    }
    async setPrimaryWallet(userId, walletId) {
        return this.usersService.setPrimaryWallet(userId, walletId);
    }
    async getUsers(page, limit, role, kycStatus, isActive, search) {
        return this.usersService.findMany({
            page,
            limit,
            role,
            kycStatus,
            isActive,
            search,
        });
    }
    async getUser(id) {
        const user = await this.usersService.findById(id);
        const stats = await this.usersService.getUserStats(id);
        return {
            ...user,
            stats,
        };
    }
    async updateUser(id, updateData) {
        return this.usersService.update(id, updateData);
    }
    async updateKycStatus(id, data) {
        return this.usersService.updateKycStatus(id, data.kycStatus, data.kycData);
    }
    async toggleUserStatus(id, data) {
        return this.usersService.toggleUserStatus(id, data.isActive);
    }
    async getUserReferrals(id, page, limit) {
        return this.usersService.getReferrals(id, { page, limit });
    }
    async deleteUser(id) {
        return this.usersService.softDelete(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiOperation)({ summary: '更新当前用户信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateCurrentUser", null);
__decorate([
    (0, common_1.Get)('me/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUserStats", null);
__decorate([
    (0, common_1.Get)('me/referrals'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的推荐用户列表' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: '每页数量' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyReferrals", null);
__decorate([
    (0, common_1.Post)('me/wallets'),
    (0, swagger_1.ApiOperation)({ summary: '添加钱包地址' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '添加成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addWallet", null);
__decorate([
    (0, common_1.Delete)('me/wallets/:walletId'),
    (0, swagger_1.ApiOperation)({ summary: '删除钱包地址' }),
    (0, swagger_1.ApiParam)({ name: 'walletId', description: '钱包ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeWallet", null);
__decorate([
    (0, common_1.Put)('me/wallets/:walletId/primary'),
    (0, swagger_1.ApiOperation)({ summary: '设置主钱包' }),
    (0, swagger_1.ApiParam)({ name: 'walletId', description: '钱包ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '设置成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setPrimaryWallet", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '获取用户列表（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: database_1.UserRole }),
    (0, swagger_1.ApiQuery)({ name: 'kycStatus', required: false, enum: database_1.KycStatus }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('kycStatus')),
    __param(4, (0, common_1.Query)('isActive', new common_1.ParseBoolPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Boolean, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN, database_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({ summary: '获取指定用户信息（管理员/代理商）' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '更新用户信息（管理员）' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Put)(':id/kyc-status'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '更新用户KYC状态（管理员）' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateKycStatus", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '启用/禁用用户（管理员）' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Get)(':id/referrals'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN, database_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({ summary: '获取用户推荐列表（管理员/代理商）' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserReferrals", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '删除用户（软删除，管理员）' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('用户管理'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map