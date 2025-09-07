import { DatabaseService } from '../../database/database.service';
import { UpdatePreferencesRequest, NotificationFilters, AdminNotificationFilters, NotificationData, BulkNotificationData, NotificationTemplateData, RetryNotificationData, CampaignData } from '../interfaces/notification.interface';
export declare class NotificationsService {
    private database;
    private readonly logger;
    constructor(database: DatabaseService);
    getUserNotifications(userId: string, filters: NotificationFilters): Promise<{
        data: {
            id: string;
            userId: string | null;
            type: string;
            title: string;
            message: string;
            priority: string;
            status: string;
            channels: import("@prisma/client/runtime/library").JsonValue;
            data: import("@prisma/client/runtime/library").JsonValue;
            readAt: Date | null;
            sentAt: Date | null;
            deliveredAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        summary: {
            totalNotifications: number;
            unreadCount: number;
            highPriorityCount: number;
        };
    }>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<{
        success: boolean;
        message: string;
        notificationId: string;
        readAt: string;
    }>;
    markAllNotificationsAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
        markedCount: number;
        readAt: string;
    }>;
    getNotificationStats(userId: string): Promise<{
        userId: string;
        stats: {
            total: number;
            unread: number;
            read: number;
            byPriority: {
                urgent: number;
                high: number;
                medium: number;
                low: number;
            };
            byType: {
                orderUpdates: number;
                commissionPayments: number;
                systemAlerts: number;
            };
        };
    }>;
    getNotificationPreferences(userId: string): Promise<{
        userId: string;
        preferences: {
            email: boolean;
            push: boolean;
            sms: boolean;
            types: {
                orderUpdates: boolean;
                commissionPayments: boolean;
                systemAlerts: boolean;
                promotions: boolean;
            };
            schedule: {
                quietHoursEnabled: boolean;
                quietHoursStart: string;
                quietHoursEnd: string;
                timezone: string;
            };
        };
        lastUpdated: string;
    }>;
    updateNotificationPreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<{
        success: boolean;
        message: string;
        userId: string;
        updatedPreferences: UpdatePreferencesRequest;
        updatedAt: string;
    }>;
    deleteNotification(userId: string, notificationId: string): Promise<{
        success: boolean;
        message: string;
        userId: string;
        notificationId: string;
        deletedAt: string;
    }>;
    getAdminNotifications(filters: AdminNotificationFilters): Promise<{
        data: {
            id: string;
            userId: string | null;
            type: string;
            title: string;
            message: string;
            priority: string;
            status: string;
            channels: import("@prisma/client/runtime/library").JsonValue;
            data: import("@prisma/client/runtime/library").JsonValue;
            readAt: Date | null;
            sentAt: Date | null;
            deliveredAt: Date | null;
            createdAt: Date;
            user: {
                email: string | null;
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        summary: {
            totalNotifications: number;
            pendingCount: number;
            sentCount: number;
            failedCount: number;
        };
    }>;
    sendNotification(notificationData: NotificationData): Promise<{
        success: boolean;
        message: string;
        notification: {
            id: string;
            status: string;
            createdAt: Date;
            sentAt: Date | null;
        };
        delivery: {
            channels: import("@prisma/client/runtime/library").JsonValue;
            estimatedDelivery: string | Date;
        };
    }>;
    sendBulkNotifications(bulkData: BulkNotificationData): Promise<{
        success: boolean;
        message: string;
        batchId: string;
        summary: {
            totalRecipients: number;
            successfulSends: number;
            failedSends: number;
            channels: string[] | undefined;
        };
        results: ({
            recipientId: string;
            status: string;
            error: null;
            sentAt: Date | null;
        } | {
            recipientId: string;
            status: string;
            error: string;
            sentAt: null;
        })[];
    }>;
    getNotificationTemplates(): Promise<{
        data: {
            id: string;
            name: string;
            type: string;
            title: string;
            content: string;
            variables: import("@prisma/client/runtime/library").JsonValue;
            channels: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        categories: {
            type: string;
            name: string;
            count: number;
        }[];
    }>;
    createNotificationTemplate(templateData: NotificationTemplateData): Promise<{
        success: boolean;
        message: string;
        template: {
            id: string;
            name: string;
            type: string;
            createdAt: Date;
        };
    }>;
    updateNotificationTemplate(templateId: string, templateData: Partial<NotificationTemplateData>): Promise<{
        success: boolean;
        message: string;
        templateId: string;
        updatedFields: string[];
        updatedAt: string;
    }>;
    deleteNotificationTemplate(templateId: string): Promise<{
        success: boolean;
        message: string;
        templateId: string;
        deletedAt: string;
    }>;
    getAdminNotificationStats(filters: AdminNotificationFilters): Promise<{
        period: string;
        overview: {
            totalSent: number;
            successRate: number;
            bounceRate: number;
            openRate: number;
            clickRate: number;
        };
        byChannel: {
            email: {
                sent: number;
                delivered: number;
                opened: number;
                clicked: number;
            };
            push: {
                sent: number;
                delivered: number;
                opened: number;
                clicked: number;
            };
            sms: {
                sent: number;
                delivered: number;
                opened: number;
                clicked: number;
            };
        };
        byType: {
            orderUpdates: {
                count: number;
                successRate: number;
            };
            commissionPayments: {
                count: number;
                successRate: number;
            };
            systemAlerts: {
                count: number;
                successRate: number;
            };
            promotions: {
                count: number;
                successRate: number;
            };
        };
        trends: {
            dailyVolume: never[];
        };
    }>;
    getDeliveryReport(filters: AdminNotificationFilters): Promise<{
        reportId: string;
        filters: AdminNotificationFilters;
        summary: {
            totalNotifications: number;
            successfulDeliveries: number;
            failedDeliveries: number;
            successRate: number;
        };
        deliveryDetails: {
            notificationId: string;
            recipientId: string | null;
            channel: any;
            status: string;
            sentAt: Date | undefined;
            deliveredAt: Date | undefined;
            openedAt: Date | null;
        }[];
        metrics: {
            averageDeliveryTime: string;
            retryRate: number;
            bounceRate: number;
        };
    }>;
    retryFailedNotifications(retryData: RetryNotificationData): Promise<{
        success: boolean;
        message: string;
        retryBatchId: string;
        summary: {
            totalRetried: number;
            successfulRetries: number;
            stillFailed: number;
            retryMethod: string;
        };
        results: never[];
    }>;
    scheduleCampaign(campaignData: CampaignData): Promise<{
        success: boolean;
        message: string;
        campaign: {
            id: string;
            name: string;
            status: string;
            scheduledFor: Date;
            createdAt: string;
        };
        estimatedReach: {
            totalRecipients: number;
            channels: string[];
        };
    }>;
    getCampaigns(filters: AdminNotificationFilters): Promise<{
        data: never[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        summary: {
            totalCampaigns: number;
            scheduled: number;
            active: number;
            completed: number;
        };
    }>;
    cancelCampaign(campaignId: string): Promise<{
        success: boolean;
        message: string;
        campaignId: string;
        cancelledAt: string;
        refundedCredits: number;
    }>;
    private getTypeDisplayName;
    private calculateOpenRate;
    private calculateClickRate;
    private getDeliveredCount;
    private getOpenedCount;
    private getClickedCount;
    private calculateTypeSuccessRate;
    private calculateAverageDeliveryTime;
    private calculateRetryRate;
}
