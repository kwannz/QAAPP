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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const database_1 = require("@qa-app/database");
const audit_service_1 = require("./audit.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getMyAuditLogs(userId, page, limit) {
        return this.auditService.getUserAuditLogs(userId, { page, limit });
    }
    async getMyActivityStats(userId, days) {
        return this.auditService.getUserActivityStats(userId, days);
    }
    async getAuditLogs(page, limit, actorId, actorType, action, resourceType, resourceId, startDate, endDate) {
        const options = {
            page,
            limit,
            actorId,
            actorType,
            action,
            resourceType,
            resourceId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        return this.auditService.findMany(options);
    }
    async getUserAuditLogs(userId, page, limit) {
        return this.auditService.getUserAuditLogs(userId, { page, limit });
    }
    async getUserActivityStats(userId, days) {
        return this.auditService.getUserActivityStats(userId, days);
    }
    async getResourceAuditLogs(resourceType, resourceId, page, limit) {
        return this.auditService.getResourceAuditLogs(resourceType, resourceId, { page, limit });
    }
    async getActionStats(startDate, endDate) {
        return this.auditService.getActionStats(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async detectUserAnomalousActivity(userId, timeWindowHours) {
        return this.auditService.detectAnomalousActivity(userId, timeWindowHours);
    }
    async exportLogs(format = 'json', startDate, endDate, actorId, resourceType) {
        return this.auditService.exportLogs({
            format,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            actorId,
            resourceType,
        });
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户操作历史' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: '每页数量' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getMyAuditLogs", null);
__decorate([
    (0, common_1.Get)('me/activity-stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的活动统计' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number, description: '统计天数' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)('id')),
    __param(1, (0, common_1.Query)('days', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getMyActivityStats", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '获取审计日志列表（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'actorId', required: false, type: String, description: '操作者ID' }),
    (0, swagger_1.ApiQuery)({ name: 'actorType', required: false, type: String, description: '操作者类型' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, type: String, description: '操作类型' }),
    (0, swagger_1.ApiQuery)({ name: 'resourceType', required: false, type: String, description: '资源类型' }),
    (0, swagger_1.ApiQuery)({ name: 'resourceId', required: false, type: String, description: '资源ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: '开始日期 (ISO格式)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: '结束日期 (ISO格式)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('actorId')),
    __param(3, (0, common_1.Query)('actorType')),
    __param(4, (0, common_1.Query)('action')),
    __param(5, (0, common_1.Query)('resourceType')),
    __param(6, (0, common_1.Query)('resourceId')),
    __param(7, (0, common_1.Query)('startDate')),
    __param(8, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('users/:userId/logs'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN, database_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({ summary: '获取指定用户操作历史（管理员/代理商）' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: '用户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserAuditLogs", null);
__decorate([
    (0, common_1.Get)('users/:userId/activity-stats'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN, database_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({ summary: '获取用户活动统计（管理员/代理商）' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: '用户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number, description: '统计天数' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('days', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserActivityStats", null);
__decorate([
    (0, common_1.Get)('resources/:resourceType/:resourceId'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '获取资源操作历史（管理员）' }),
    (0, swagger_1.ApiParam)({ name: 'resourceType', description: '资源类型' }),
    (0, swagger_1.ApiParam)({ name: 'resourceId', description: '资源ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('resourceType')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getResourceAuditLogs", null);
__decorate([
    (0, common_1.Get)('stats/actions'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '获取操作类型统计（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: '开始日期' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: '结束日期' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getActionStats", null);
__decorate([
    (0, common_1.Get)('users/:userId/anomaly-detection'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '检测用户异常活动（管理员）' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: '用户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'timeWindowHours', required: false, type: Number, description: '时间窗口（小时）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '检测完成' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('timeWindowHours', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "detectUserAnomalousActivity", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)(database_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '导出审计日志（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['json', 'csv'], description: '导出格式' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'actorId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'resourceType', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '导出成功' }),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('actorId')),
    __param(4, (0, common_1.Query)('resourceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "exportLogs", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('审计日志'),
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map