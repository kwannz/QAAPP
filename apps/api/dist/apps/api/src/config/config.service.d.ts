import { SystemConfigData, BusinessConfigData, SecurityConfigData, PaymentConfigData, NotificationConfigData, ConfigBackupData, ConfigPagination, ConfigAuditFilters } from './interfaces/config.interface';
export declare class ConfigService {
    private systemConfig;
    private businessConfig;
    private securityConfig;
    private paymentConfig;
    private notificationConfig;
    private auditLog;
    private configBackups;
    getSystemConfig(): Promise<{
        category: string;
        config: {
            siteName: string;
            siteUrl: string;
            supportEmail: string;
            maintenanceMode: boolean;
            allowRegistration: boolean;
            maxFileUpload: number;
            defaultLanguage: string;
            timezone: string;
        };
        lastUpdated: string;
        updatedBy: string;
    }>;
    updateSystemConfig(configData: SystemConfigData): Promise<{
        success: boolean;
        message: string;
        updatedFields: string[];
        timestamp: string;
    }>;
    getBusinessConfig(): Promise<{
        category: string;
        config: {
            minimumInvestment: number;
            maximumInvestment: number;
            defaultRiskLevel: string;
            commissionRates: {
                level1: number;
                level2: number;
                level3: number;
                level4: number;
                level5: number;
            };
            kycRequired: boolean;
            autoApprovalLimit: number;
            businessHours: {
                start: string;
                end: string;
                timezone: string;
                workdays: string[];
            };
        };
        lastUpdated: string;
        updatedBy: string;
    }>;
    updateBusinessConfig(configData: BusinessConfigData): Promise<{
        success: boolean;
        message: string;
        updatedFields: string[];
        timestamp: string;
    }>;
    getSecurityConfig(): Promise<{
        category: string;
        config: {
            passwordPolicy: {
                minLength: number;
                requireUppercase: boolean;
                requireLowercase: boolean;
                requireNumbers: boolean;
                requireSymbols: boolean;
                maxAge: number;
            };
            sessionTimeout: number;
            maxLoginAttempts: number;
            enableTwoFactor: boolean;
            ipWhitelist: never[];
            enableRateLimit: boolean;
            rateLimitWindow: number;
            rateLimitMax: number;
        };
        lastUpdated: string;
        updatedBy: string;
    }>;
    updateSecurityConfig(configData: SecurityConfigData): Promise<{
        success: boolean;
        message: string;
        updatedFields: string[];
        timestamp: string;
    }>;
    getPaymentConfig(): Promise<{
        category: string;
        config: {
            enabledMethods: string[];
            defaultCurrency: string;
            minimumAmount: number;
            maximumAmount: number;
            processingFee: number;
            withdrawalLimit: number;
            autoProcessingThreshold: number;
        };
        lastUpdated: string;
        updatedBy: string;
    }>;
    updatePaymentConfig(configData: PaymentConfigData): Promise<{
        success: boolean;
        message: string;
        updatedFields: string[];
        timestamp: string;
    }>;
    getNotificationConfig(): Promise<{
        category: string;
        config: {
            emailEnabled: boolean;
            smsEnabled: boolean;
            pushEnabled: boolean;
            emailProvider: string;
            smsProvider: string;
            templates: {
                welcome: string;
                orderApproved: string;
                commissionPaid: string;
            };
            adminNotifications: {
                newOrder: boolean;
                riskAlert: boolean;
                systemError: boolean;
                maintenanceMode: boolean;
            };
        };
        lastUpdated: string;
        updatedBy: string;
    }>;
    updateNotificationConfig(configData: NotificationConfigData): Promise<{
        success: boolean;
        message: string;
        updatedFields: string[];
        timestamp: string;
    }>;
    getConfigCategories(): Promise<{
        categories: {
            id: string;
            name: string;
            description: string;
            icon: string;
            lastUpdated: string;
        }[];
    }>;
    createConfigBackup(backupData: ConfigBackupData): Promise<{
        success: boolean;
        message: string;
        backup: {
            id: string;
            name: string;
            createdAt: string;
            size: string;
        };
    }>;
    getConfigBackups(pagination: ConfigPagination): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            createdAt: string;
            createdBy: string;
            size: string;
            categories: string[];
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    restoreConfigFromBackup(backupId: string): Promise<{
        success: boolean;
        message: string;
        backupId: string;
        restoredCategories: string[];
        restoredAt: string;
    }>;
    getConfigAuditLog(filters: ConfigAuditFilters): Promise<{
        data: ({
            id: string;
            category: string;
            action: string;
            field: string;
            oldValue: boolean;
            newValue: boolean;
            adminId: string;
            timestamp: string;
            ipAddress: string;
        } | {
            id: string;
            category: string;
            action: string;
            field: string;
            oldValue: number;
            newValue: number;
            adminId: string;
            timestamp: string;
            ipAddress: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        summary: {
            totalChanges: number;
            categories: string[];
            recentActivity: string | null;
        };
    }>;
    testConfiguration(category: string): Promise<{
        category: string;
        status: string;
        results: any;
        summary: {
            passed: number;
            warnings: number;
            errors: number;
            testedAt: string;
        };
    }>;
    resetConfigToDefaults(category: string): Promise<{
        success: boolean;
        message: string;
        category: string;
        resetFields: string[];
        resetAt: string;
    }>;
}
