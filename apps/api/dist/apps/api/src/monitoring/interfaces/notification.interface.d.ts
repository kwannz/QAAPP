export interface NotificationPreferences {
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
}
export interface UpdatePreferencesRequest {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    types?: Partial<NotificationPreferences['preferences']['types']>;
    schedule?: Partial<NotificationPreferences['preferences']['schedule']>;
}
export interface NotificationChannel {
    type: 'email' | 'push' | 'sms' | 'webhook';
    config: Record<string, unknown>;
    enabled: boolean;
}
export interface NotificationFilters {
    userId?: string;
    status?: string;
    type?: string;
    channel?: string;
    startDate?: Date;
    endDate?: Date;
    priority?: string;
    isRead?: boolean;
    page?: string;
    limit?: string;
}
export interface AdminNotificationFilters {
    status?: string;
    type?: string;
    channel?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    recipient?: string;
    page?: string;
    limit?: string;
    period?: string;
}
export interface NotificationData {
    userId: string;
    title: string;
    message: string;
    type: string;
    channels?: string[];
    priority?: string;
    data?: any;
    scheduledFor?: Date;
}
export interface BulkNotificationData {
    recipientIds: string[];
    title: string;
    message: string;
    type: string;
    channels?: string[];
    priority?: string;
    data?: any;
}
export interface NotificationTemplateData {
    name: string;
    title: string;
    content: string;
    type: string;
    variables?: string[];
    channels?: string[];
}
export interface RetryNotificationData {
    notificationIds: string[];
    maxRetries?: number;
    retryInterval?: number;
    channel?: string;
}
export interface CampaignData {
    name: string;
    description?: string;
    scheduledFor: Date;
    channels: string[];
    customRecipients?: string[];
}
export interface NotificationWhereClause {
    userId?: string;
    status?: string;
    type?: string | {
        contains?: string;
    };
    channel?: string;
    isRead?: boolean;
    createdAt?: {
        gte?: Date;
        lte?: Date;
    };
    sentAt?: {
        not?: null;
    } | null;
    readAt?: {
        not?: null;
    } | null;
    deliveredAt?: {
        not?: null;
    } | null;
    channels?: {
        array_contains?: string;
    };
    priority?: string | {
        in?: string[];
    };
    OR?: Array<Record<string, unknown>>;
    AND?: Array<Record<string, unknown>>;
}
