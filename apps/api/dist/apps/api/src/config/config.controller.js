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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
let ConfigController = class ConfigController {
    constructor(configService) {
        this.configService = configService;
    }
    async getSystemConfig() {
        return this.configService.getSystemConfig();
    }
    async updateSystemConfig(configData) {
        return this.configService.updateSystemConfig(configData);
    }
    async getBusinessConfig() {
        return this.configService.getBusinessConfig();
    }
    async updateBusinessConfig(configData) {
        return this.configService.updateBusinessConfig(configData);
    }
    async getSecurityConfig() {
        return this.configService.getSecurityConfig();
    }
    async updateSecurityConfig(configData) {
        return this.configService.updateSecurityConfig(configData);
    }
    async getPaymentConfig() {
        return this.configService.getPaymentConfig();
    }
    async updatePaymentConfig(configData) {
        return this.configService.updatePaymentConfig(configData);
    }
    async getNotificationConfig() {
        return this.configService.getNotificationConfig();
    }
    async updateNotificationConfig(configData) {
        return this.configService.updateNotificationConfig(configData);
    }
    async getConfigCategories() {
        return this.configService.getConfigCategories();
    }
    async backupConfig(backupData) {
        return this.configService.createConfigBackup(backupData);
    }
    async getConfigBackups(page = 1, limit = 20) {
        return this.configService.getConfigBackups({ page, limit });
    }
    async restoreConfig(backupId) {
        return this.configService.restoreConfigFromBackup(backupId);
    }
    async getConfigAuditLog(category, page = 1, limit = 20) {
        return this.configService.getConfigAuditLog({ category, page, limit });
    }
    async testConfig(category) {
        return this.configService.testConfiguration(category);
    }
    async resetConfig(category) {
        return this.configService.resetConfigToDefaults(category);
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get system configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System configuration retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getSystemConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update system configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System configuration updated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('system'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateSystemConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get business configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business configuration retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('business'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getBusinessConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update business configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business configuration updated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('business'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateBusinessConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get security configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security configuration retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('security'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getSecurityConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update security configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security configuration updated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('security'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateSecurityConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get payment configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment configuration retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('payment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getPaymentConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update payment configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment configuration updated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('payment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updatePaymentConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification configuration retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getNotificationConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update notification configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification configuration updated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('notifications'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateNotificationConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all configuration categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration categories retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getConfigCategories", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Backup system configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration backup created successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('backup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "backupConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration backups' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration backups retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('backups'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getConfigBackups", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Restore configuration from backup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration restored successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('restore/:backupId'),
    __param(0, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "restoreConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration audit log' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration audit log retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('audit-log'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getConfigAuditLog", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Test configuration settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration test completed' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('test/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "testConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Reset configuration to defaults' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration reset to defaults successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('reset/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "resetConfig", null);
exports.ConfigController = ConfigController = __decorate([
    (0, swagger_1.ApiTags)('config'),
    (0, common_1.Controller)('config'),
    __param(0, (0, common_2.Inject)('ConfigService')),
    __metadata("design:paramtypes", [Object])
], ConfigController);
//# sourceMappingURL=config.controller.js.map