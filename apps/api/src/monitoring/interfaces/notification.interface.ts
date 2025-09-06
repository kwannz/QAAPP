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