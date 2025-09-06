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

// 通知查询过滤器
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

// 管理员通知过滤器
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

// 通知数据接口
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

// 批量通知数据
export interface BulkNotificationData {
  recipientIds: string[];
  title: string;
  message: string;
  type: string;
  channels?: string[];
  priority?: string;
  data?: any;
}

// 通知模板数据
export interface NotificationTemplateData {
  name: string;
  title: string;
  content: string;
  type: string;
  variables?: string[];
  channels?: string[];
}

// 重试数据接口
export interface RetryNotificationData {
  notificationIds: string[];
  maxRetries?: number;
  retryInterval?: number;
  channel?: string;
}

// 活动数据接口
export interface CampaignData {
  name: string;
  description?: string;
  scheduledFor: Date;
  channels: string[];
  customRecipients?: string[];
}

// 数据库Where子句类型
export interface NotificationWhereClause {
  userId?: string;
  status?: string;
  type?: string | { contains?: string };
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
  priority?: string | { in?: string[] };
  OR?: Array<Record<string, unknown>>;
  AND?: Array<Record<string, unknown>>;
}