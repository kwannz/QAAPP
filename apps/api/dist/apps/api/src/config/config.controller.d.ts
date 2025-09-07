export declare class ConfigController {
    private readonly configService;
    constructor(configService: any);
    getSystemConfig(): Promise<any>;
    updateSystemConfig(configData: {
        siteName?: string;
        siteUrl?: string;
        supportEmail?: string;
        maintenanceMode?: boolean;
        allowRegistration?: boolean;
        maxFileUpload?: number;
        defaultLanguage?: string;
        timezone?: string;
    }): Promise<any>;
    getBusinessConfig(): Promise<any>;
    updateBusinessConfig(configData: {
        minimumInvestment?: number;
        maximumInvestment?: number;
        defaultRiskLevel?: string;
        commissionRates?: any;
        kycRequired?: boolean;
        autoApprovalLimit?: number;
        businessHours?: any;
    }): Promise<any>;
    getSecurityConfig(): Promise<any>;
    updateSecurityConfig(configData: {
        passwordPolicy?: any;
        sessionTimeout?: number;
        maxLoginAttempts?: number;
        enableTwoFactor?: boolean;
        ipWhitelist?: string[];
        enableRateLimit?: boolean;
        rateLimitWindow?: number;
        rateLimitMax?: number;
    }): Promise<any>;
    getPaymentConfig(): Promise<any>;
    updatePaymentConfig(configData: {
        enabledMethods?: string[];
        defaultCurrency?: string;
        minimumAmount?: number;
        maximumAmount?: number;
        processingFee?: number;
        withdrawalLimit?: number;
        autoProcessingThreshold?: number;
    }): Promise<any>;
    getNotificationConfig(): Promise<any>;
    updateNotificationConfig(configData: {
        emailEnabled?: boolean;
        smsEnabled?: boolean;
        pushEnabled?: boolean;
        emailProvider?: string;
        smsProvider?: string;
        templates?: any;
        adminNotifications?: any;
    }): Promise<any>;
    getConfigCategories(): Promise<any>;
    backupConfig(backupData: {
        name?: string;
        description?: string;
    }): Promise<any>;
    getConfigBackups(page?: number, limit?: number): Promise<any>;
    restoreConfig(backupId: string): Promise<any>;
    getConfigAuditLog(category?: string, page?: number, limit?: number): Promise<any>;
    testConfig(category: string): Promise<any>;
    resetConfig(category: string): Promise<any>;
}
