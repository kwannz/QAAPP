import { AlertRuleData, DataCleanupConfig } from './interfaces/admin.interface';
export declare class AdminController {
    constructor();
    getUserAuditRecords(userId?: string): Promise<{
        audits: {
            id: string;
            userId: string;
            userName: string;
            userEmail: string;
            riskLevel: string;
            riskScore: number;
            behaviorPattern: string;
            suspicious: boolean;
            lastActivity: Date;
            kycStatus: string;
            accountAge: number;
            totalTransactionVolume: number;
            flags: string[];
            createdAt: Date;
        }[];
        total: number;
    }>;
    getSystemAuditEvents(type?: string): Promise<{
        events: {
            id: string;
            type: string;
            severity: string;
            title: string;
            description: string;
            affectedServices: string[];
            startTime: Date;
            endTime: null;
            status: string;
            impact: string;
            metadata: {
                avgResponseTime: number;
                threshold: number;
                affectedRequests: number;
            };
        }[];
        total: number;
    }>;
    getSystemMetrics(): Promise<{
        performance: {
            cpuUsage: number;
            memoryUsage: number;
            diskUsage: number;
            networkIO: number;
        };
        availability: {
            uptime: number;
            downtime: string;
            mttr: string;
            mtbf: string;
        };
        security: {
            activeThreats: number;
            blockedIPs: number;
            failedLogins: number;
            suspiciousActivities: number;
        };
        database: {
            connectionPool: number;
            queryTime: number;
            lockWaitTime: number;
            deadlocks: number;
        };
    }>;
    getPermissions(): Promise<{
        permissions: {
            id: string;
            name: string;
            description: string;
            module: string;
            type: string;
            createdAt: Date;
        }[];
        total: number;
    }>;
    getRoles(): Promise<{
        roles: {
            id: string;
            name: string;
            description: string;
            permissions: string[];
            userCount: number;
            createdAt: Date;
        }[];
        total: number;
    }>;
    getUserRoles(): Promise<{
        userRoles: {
            id: string;
            userId: string;
            userName: string;
            userEmail: string;
            roleId: string;
            roleName: string;
            assignedAt: Date;
            assignedBy: string;
            status: string;
        }[];
        total: number;
    }>;
    getPerformanceMetrics(): Promise<{
        metrics: {
            id: string;
            name: string;
            category: string;
            value: number;
            unit: string;
            target: number;
            status: string;
            trend: string;
            timestamp: Date;
            metadata: {
                p50: number;
                p90: number;
                p99: number;
            };
        }[];
        total: number;
    }>;
    getPerformanceTests(): Promise<{
        tests: {
            id: string;
            name: string;
            type: string;
            status: string;
            duration: number;
            virtualUsers: number;
            requestCount: number;
            errorRate: number;
            avgResponseTime: number;
            throughput: number;
            startTime: Date;
            endTime: Date;
        }[];
        total: number;
    }>;
    getComplianceStandards(): Promise<{
        standards: {
            id: string;
            name: string;
            category: string;
            description: string;
            requirements: string[];
            complianceLevel: number;
            status: string;
            lastAssessment: Date;
            nextReview: Date;
        }[];
        total: number;
    }>;
    getComplianceChecks(): Promise<{
        checks: {
            id: string;
            standardId: string;
            name: string;
            type: string;
            frequency: string;
            lastRun: Date;
            nextRun: Date;
            status: string;
            result: {
                score: number;
                issues: never[];
                recommendations: never[];
            };
        }[];
        total: number;
    }>;
    getBusinessKPIs(): Promise<{
        kpis: {
            id: string;
            name: string;
            category: string;
            value: number;
            target: number;
            unit: string;
            trend: string;
            change: number;
            status: string;
            period: string;
            timestamp: Date;
        }[];
        total: number;
    }>;
    getBusinessHealth(): Promise<{
        overallScore: number;
        categories: {
            financial: {
                score: number;
                status: string;
            };
            operational: {
                score: number;
                status: string;
            };
            customer: {
                score: number;
                status: string;
            };
            technology: {
                score: number;
                status: string;
            };
        };
        trends: {
            revenue: {
                value: number;
                change: number;
                trend: string;
            };
            users: {
                value: number;
                change: number;
                trend: string;
            };
            satisfaction: {
                value: number;
                change: number;
                trend: string;
            };
        };
        alerts: {
            id: string;
            type: string;
            message: string;
            severity: string;
            timestamp: Date;
        }[];
    }>;
    createAlertRule(ruleData: AlertRuleData): Promise<{
        createdAt: Date;
        status: string;
        name: string;
        description?: string;
        condition: string;
        threshold: number;
        severity: "low" | "medium" | "high" | "critical";
        enabled: boolean;
        notificationChannels: string[];
        metadata?: Record<string, unknown>;
        id: string;
    }>;
    getAlertRules(): Promise<{
        rules: {
            id: string;
            name: string;
            condition: string;
            threshold: number;
            action: string;
            status: string;
            createdAt: Date;
        }[];
        total: number;
    }>;
    executeDataCleanup(cleanupConfig: DataCleanupConfig): Promise<{
        taskId: string;
        status: string;
        config: DataCleanupConfig;
        estimatedDuration: string;
        submittedAt: Date;
    }>;
}
