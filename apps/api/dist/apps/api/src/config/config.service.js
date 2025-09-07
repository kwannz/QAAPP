"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
let ConfigService = class ConfigService {
    constructor() {
        this.systemConfig = {
            siteName: 'QA Investment Platform',
            siteUrl: 'https://qa-investment.com',
            supportEmail: 'support@qa-investment.com',
            maintenanceMode: false,
            allowRegistration: true,
            maxFileUpload: 10485760,
            defaultLanguage: 'en',
            timezone: 'UTC'
        };
        this.businessConfig = {
            minimumInvestment: 1000,
            maximumInvestment: 1000000,
            defaultRiskLevel: 'MEDIUM',
            commissionRates: {
                level1: 3.0,
                level2: 2.5,
                level3: 2.0,
                level4: 1.5,
                level5: 1.0
            },
            kycRequired: true,
            autoApprovalLimit: 10000,
            businessHours: {
                start: '09:00',
                end: '17:00',
                timezone: 'UTC',
                workdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            }
        };
        this.securityConfig = {
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSymbols: true,
                maxAge: 90
            },
            sessionTimeout: 3600,
            maxLoginAttempts: 5,
            enableTwoFactor: false,
            ipWhitelist: [],
            enableRateLimit: true,
            rateLimitWindow: 900,
            rateLimitMax: 100
        };
        this.paymentConfig = {
            enabledMethods: ['BANK_TRANSFER', 'CREDIT_CARD', 'CRYPTOCURRENCY'],
            defaultCurrency: 'USD',
            minimumAmount: 100,
            maximumAmount: 100000,
            processingFee: 2.5,
            withdrawalLimit: 50000,
            autoProcessingThreshold: 5000
        };
        this.notificationConfig = {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            emailProvider: 'sendgrid',
            smsProvider: 'twilio',
            templates: {
                welcome: 'Welcome to QA Investment Platform',
                orderApproved: 'Your investment order has been approved',
                commissionPaid: 'Your commission payment has been processed'
            },
            adminNotifications: {
                newOrder: true,
                riskAlert: true,
                systemError: true,
                maintenanceMode: true
            }
        };
        this.auditLog = [
            {
                id: 'audit-001',
                category: 'system',
                action: 'update',
                field: 'maintenanceMode',
                oldValue: true,
                newValue: false,
                adminId: 'admin-001',
                timestamp: '2024-01-20T10:30:00Z',
                ipAddress: '192.168.1.100'
            },
            {
                id: 'audit-002',
                category: 'business',
                action: 'update',
                field: 'minimumInvestment',
                oldValue: 500,
                newValue: 1000,
                adminId: 'admin-001',
                timestamp: '2024-01-19T14:15:00Z',
                ipAddress: '192.168.1.100'
            }
        ];
        this.configBackups = [
            {
                id: 'backup-001',
                name: 'Pre-maintenance backup',
                description: 'Backup before system maintenance',
                createdAt: '2024-01-15T12:00:00Z',
                createdBy: 'admin-001',
                size: '2.4 KB',
                categories: ['system', 'business', 'security']
            },
            {
                id: 'backup-002',
                name: 'Weekly backup',
                description: 'Scheduled weekly configuration backup',
                createdAt: '2024-01-10T00:00:00Z',
                createdBy: 'system',
                size: '2.3 KB',
                categories: ['system', 'business', 'security', 'payment', 'notifications']
            }
        ];
    }
    async getSystemConfig() {
        return {
            category: 'system',
            config: this.systemConfig,
            lastUpdated: '2024-01-20T10:30:00Z',
            updatedBy: 'admin-001'
        };
    }
    async updateSystemConfig(configData) {
        Object.assign(this.systemConfig, configData);
        return {
            success: true,
            message: 'System configuration updated successfully',
            updatedFields: Object.keys(configData),
            timestamp: new Date().toISOString()
        };
    }
    async getBusinessConfig() {
        return {
            category: 'business',
            config: this.businessConfig,
            lastUpdated: '2024-01-19T14:15:00Z',
            updatedBy: 'admin-001'
        };
    }
    async updateBusinessConfig(configData) {
        Object.assign(this.businessConfig, configData);
        return {
            success: true,
            message: 'Business configuration updated successfully',
            updatedFields: Object.keys(configData),
            timestamp: new Date().toISOString()
        };
    }
    async getSecurityConfig() {
        return {
            category: 'security',
            config: this.securityConfig,
            lastUpdated: '2024-01-18T09:45:00Z',
            updatedBy: 'admin-002'
        };
    }
    async updateSecurityConfig(configData) {
        Object.assign(this.securityConfig, configData);
        return {
            success: true,
            message: 'Security configuration updated successfully',
            updatedFields: Object.keys(configData),
            timestamp: new Date().toISOString()
        };
    }
    async getPaymentConfig() {
        return {
            category: 'payment',
            config: this.paymentConfig,
            lastUpdated: '2024-01-17T16:20:00Z',
            updatedBy: 'admin-001'
        };
    }
    async updatePaymentConfig(configData) {
        Object.assign(this.paymentConfig, configData);
        return {
            success: true,
            message: 'Payment configuration updated successfully',
            updatedFields: Object.keys(configData),
            timestamp: new Date().toISOString()
        };
    }
    async getNotificationConfig() {
        return {
            category: 'notifications',
            config: this.notificationConfig,
            lastUpdated: '2024-01-16T11:30:00Z',
            updatedBy: 'admin-003'
        };
    }
    async updateNotificationConfig(configData) {
        Object.assign(this.notificationConfig, configData);
        return {
            success: true,
            message: 'Notification configuration updated successfully',
            updatedFields: Object.keys(configData),
            timestamp: new Date().toISOString()
        };
    }
    async getConfigCategories() {
        return {
            categories: [
                {
                    id: 'system',
                    name: 'System Configuration',
                    description: 'Basic system settings and general configuration',
                    icon: 'Settings',
                    lastUpdated: '2024-01-20T10:30:00Z'
                },
                {
                    id: 'business',
                    name: 'Business Configuration',
                    description: 'Investment limits, commission rates, and business rules',
                    icon: 'Briefcase',
                    lastUpdated: '2024-01-19T14:15:00Z'
                },
                {
                    id: 'security',
                    name: 'Security Configuration',
                    description: 'Authentication, authorization, and security policies',
                    icon: 'Shield',
                    lastUpdated: '2024-01-18T09:45:00Z'
                },
                {
                    id: 'payment',
                    name: 'Payment Configuration',
                    description: 'Payment methods, limits, and processing settings',
                    icon: 'CreditCard',
                    lastUpdated: '2024-01-17T16:20:00Z'
                },
                {
                    id: 'notifications',
                    name: 'Notification Configuration',
                    description: 'Email, SMS, and push notification settings',
                    icon: 'Bell',
                    lastUpdated: '2024-01-16T11:30:00Z'
                }
            ]
        };
    }
    async createConfigBackup(backupData) {
        const backup = {
            id: 'backup-' + Date.now(),
            name: backupData.name || 'Manual backup',
            description: backupData.description || 'Manual configuration backup',
            createdAt: new Date().toISOString(),
            createdBy: 'admin-001',
            size: '2.5 KB',
            categories: ['system', 'business', 'security', 'payment', 'notifications'],
            data: {
                system: this.systemConfig,
                business: this.businessConfig,
                security: this.securityConfig,
                payment: this.paymentConfig,
                notifications: this.notificationConfig
            }
        };
        return {
            success: true,
            message: 'Configuration backup created successfully',
            backup: {
                id: backup.id,
                name: backup.name,
                createdAt: backup.createdAt,
                size: backup.size
            }
        };
    }
    async getConfigBackups(pagination) {
        const total = this.configBackups.length;
        const page = parseInt(pagination.page ?? '1') || 1;
        const limit = parseInt(pagination.limit ?? '20') || 20;
        const offset = (page - 1) * limit;
        return {
            data: this.configBackups.slice(offset, offset + limit),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async restoreConfigFromBackup(backupId) {
        return {
            success: true,
            message: 'Configuration restored from backup successfully',
            backupId,
            restoredCategories: ['system', 'business', 'security', 'payment', 'notifications'],
            restoredAt: new Date().toISOString()
        };
    }
    async getConfigAuditLog(filters) {
        let filtered = [...this.auditLog];
        if (filters.category) {
            filtered = filtered.filter(log => log.category === filters.category);
        }
        const total = filtered.length;
        const page = parseInt(filters.page ?? '1') || 1;
        const limit = parseInt(filters.limit ?? '20') || 20;
        const offset = (page - 1) * limit;
        return {
            data: filtered.slice(offset, offset + limit),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            summary: {
                totalChanges: this.auditLog.length,
                categories: ['system', 'business', 'security', 'payment', 'notifications'],
                recentActivity: this.auditLog.length > 0 ? this.auditLog[0].timestamp : null
            }
        };
    }
    async testConfiguration(category) {
        const testResults = {
            system: {
                siteName: 'OK',
                siteUrl: 'OK - URL accessible',
                supportEmail: 'OK - Valid email format',
                maintenanceMode: 'OK',
                timezone: 'OK - Valid timezone'
            },
            business: {
                investmentLimits: 'OK - Valid range',
                commissionRates: 'OK - All rates within bounds',
                kycSettings: 'OK',
                businessHours: 'OK - Valid time format'
            },
            security: {
                passwordPolicy: 'OK - Strong policy',
                sessionTimeout: 'OK - Reasonable timeout',
                rateLimit: 'OK - Configured correctly',
                twoFactor: 'WARNING - Not enabled'
            },
            payment: {
                paymentMethods: 'OK - All methods available',
                limits: 'OK - Within regulatory bounds',
                fees: 'OK - Reasonable fees',
                processing: 'OK - All processors online'
            },
            notifications: {
                emailService: 'OK - Connected',
                smsService: 'WARNING - Not configured',
                templates: 'OK - All templates valid',
                deliverability: 'OK - High success rate'
            }
        };
        return {
            category,
            status: 'completed',
            results: testResults[category] || {},
            summary: {
                passed: 4,
                warnings: 1,
                errors: 0,
                testedAt: new Date().toISOString()
            }
        };
    }
    async resetConfigToDefaults(category) {
        const defaultConfigs = {
            system: {
                siteName: 'QA Investment Platform',
                siteUrl: 'https://qa-investment.com',
                supportEmail: 'support@qa-investment.com',
                maintenanceMode: false,
                allowRegistration: true,
                maxFileUpload: 10485760,
                defaultLanguage: 'en',
                timezone: 'UTC'
            },
            business: {
                minimumInvestment: 1000,
                maximumInvestment: 1000000,
                defaultRiskLevel: 'MEDIUM',
                kycRequired: true,
                autoApprovalLimit: 10000
            },
            security: {
                sessionTimeout: 3600,
                maxLoginAttempts: 5,
                enableTwoFactor: false,
                enableRateLimit: true,
                rateLimitWindow: 900,
                rateLimitMax: 100
            },
            payment: {
                enabledMethods: ['BANK_TRANSFER', 'CREDIT_CARD'],
                defaultCurrency: 'USD',
                minimumAmount: 100,
                maximumAmount: 100000,
                processingFee: 2.5
            },
            notifications: {
                emailEnabled: true,
                smsEnabled: false,
                pushEnabled: true,
                emailProvider: 'sendgrid'
            }
        };
        return {
            success: true,
            message: `${category.charAt(0).toUpperCase() + category.slice(1)} configuration reset to defaults successfully`,
            category,
            resetFields: Object.keys(defaultConfigs[category] || {}),
            resetAt: new Date().toISOString()
        };
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)()
], ConfigService);
//# sourceMappingURL=config.service.js.map