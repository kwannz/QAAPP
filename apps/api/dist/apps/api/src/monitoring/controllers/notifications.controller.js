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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../services/notifications.service");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getUserNotifications(userId, type, status, page = '1', limit = '20') {
        return this.notificationsService.getUserNotifications(userId, {
            type,
            status,
            page,
            limit
        });
    }
    async markAsRead(userId, notificationId) {
        return this.notificationsService.markNotificationAsRead(userId, notificationId);
    }
    async markAllAsRead(userId) {
        return this.notificationsService.markAllNotificationsAsRead(userId);
    }
    async getNotificationStats(userId) {
        return this.notificationsService.getNotificationStats(userId);
    }
    async getNotificationPreferences(userId) {
        return this.notificationsService.getNotificationPreferences(userId);
    }
    async updateNotificationPreferences(userId, preferences) {
        return this.notificationsService.updateNotificationPreferences(userId, preferences);
    }
    async deleteNotification(userId, notificationId) {
        return this.notificationsService.deleteNotification(userId, notificationId);
    }
    async getAdminNotifications(type, status, recipient, dateFrom, dateTo, page = '1', limit = '20') {
        return this.notificationsService.getAdminNotifications({
            type,
            status,
            recipient,
            page,
            limit
        });
    }
    async sendNotification(notificationData) {
        return this.notificationsService.sendNotification({
            ...notificationData,
            userId: notificationData.recipientId || '',
            scheduledFor: notificationData.scheduledFor ? new Date(notificationData.scheduledFor) : undefined
        });
    }
    async sendBulkNotifications(bulkData) {
        return this.notificationsService.sendBulkNotifications(bulkData);
    }
    async getNotificationTemplates() {
        return this.notificationsService.getNotificationTemplates();
    }
    async createNotificationTemplate(templateData) {
        return this.notificationsService.createNotificationTemplate(templateData);
    }
    async updateNotificationTemplate(templateId, templateData) {
        return this.notificationsService.updateNotificationTemplate(templateId, templateData);
    }
    async deleteNotificationTemplate(templateId) {
        return this.notificationsService.deleteNotificationTemplate(templateId);
    }
    async getAdminNotificationStats(period, type) {
        return this.notificationsService.getAdminNotificationStats({ period, type });
    }
    async getDeliveryReport(notificationId, dateFrom, dateTo, channel) {
        return this.notificationsService.getDeliveryReport({
            channel
        });
    }
    async retryFailedNotifications(retryData) {
        return this.notificationsService.retryFailedNotifications({
            ...retryData,
            notificationIds: retryData.notificationIds || []
        });
    }
    async scheduleCampaign(campaignData) {
        return this.notificationsService.scheduleCampaign({
            ...campaignData,
            scheduledFor: new Date(campaignData.scheduledFor)
        });
    }
    async getCampaigns(status, page = '1', limit = '20') {
        return this.notificationsService.getCampaigns({ status, page, limit });
    }
    async cancelCampaign(campaignId) {
        return this.notificationsService.cancelCampaign(campaignId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User notifications retrieved successfully' }),
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUserNotifications", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('user/:userId/read/:notificationId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('user/:userId/read-all'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification statistics retrieved successfully' }),
    (0, common_1.Get)('user/:userId/stats'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences retrieved successfully' }),
    (0, common_1.Get)('user/:userId/preferences'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update notification preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences updated successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('user/:userId/preferences'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted successfully' }),
    (0, common_1.Delete)('user/:userId/:notificationId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all notifications for admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/list'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('recipient')),
    __param(3, (0, common_1.Query)('dateFrom')),
    __param(4, (0, common_1.Query)('dateTo')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAdminNotifications", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send notification to user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification sent successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('admin/send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send bulk notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk notifications sent successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('admin/send-bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendBulkNotifications", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification templates retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationTemplates", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create notification template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification template created successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('admin/templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createNotificationTemplate", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update notification template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification template updated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Put)('admin/templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateNotificationTemplate", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification template deleted successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Delete)('admin/templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotificationTemplate", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics for admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification statistics retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/stats'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAdminNotificationStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification delivery report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification delivery report retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/delivery-report'),
    __param(0, (0, common_1.Query)('notificationId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getDeliveryReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Retry failed notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Failed notifications retry initiated' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('admin/retry-failed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "retryFailedNotifications", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Schedule notification campaign' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification campaign scheduled successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('admin/campaigns'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "scheduleCampaign", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get notification campaigns' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification campaigns retrieved successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('admin/campaigns'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getCampaigns", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cancel scheduled campaign' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Campaign cancelled successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Delete)('admin/campaigns/:campaignId'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "cancelCampaign", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map