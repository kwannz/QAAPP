export declare class CommissionsService {
    private commissionRules;
    private mockCommissions;
    getUserCommissionHistory(userId: string, pagination: any): Promise<{
        data: ({
            id: string;
            userId: string;
            orderId: string;
            commissionType: string;
            amount: number;
            rate: number;
            baseAmount: number;
            status: string;
            period: string;
            createdAt: string;
            paidAt: string;
        } | {
            id: string;
            userId: string;
            orderId: string;
            commissionType: string;
            amount: number;
            rate: number;
            baseAmount: number;
            status: string;
            period: string;
            createdAt: string;
            paidAt?: undefined;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getUserCommissionSummary(userId: string): Promise<{
        userId: string;
        summary: {
            totalEarned: number;
            pendingAmount: number;
            paidAmount: number;
            thisMonthEarnings: number;
            lastMonthEarnings: number;
            averageMonthlyEarnings: number;
        };
        breakdown: {
            directSales: number;
            referralBonuses: number;
            performanceBonuses: number;
        };
    }>;
    getAdminCommissionList(filters: any): Promise<{
        data: ({
            id: string;
            userId: string;
            orderId: string;
            commissionType: string;
            amount: number;
            rate: number;
            baseAmount: number;
            status: string;
            period: string;
            createdAt: string;
            paidAt: string;
        } | {
            id: string;
            userId: string;
            orderId: string;
            commissionType: string;
            amount: number;
            rate: number;
            baseAmount: number;
            status: string;
            period: string;
            createdAt: string;
            paidAt?: undefined;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getCommissionStats(period?: string): Promise<{
        period: string;
        overview: {
            totalCommissions: number;
            pendingCommissions: number;
            paidCommissions: number;
            totalAgentsWithCommissions: number;
            averageCommissionPerAgent: number;
        };
        breakdown: {
            directSales: {
                amount: number;
                percentage: number;
            };
            referralBonuses: {
                amount: number;
                percentage: number;
            };
            performanceBonuses: {
                amount: number;
                percentage: number;
            };
        };
        trends: {
            monthOverMonth: string;
            topPerformingLevel: number;
            averageCommissionRate: number;
        };
    }>;
    calculateCommissions(calculationData: any): Promise<{
        success: boolean;
        period: any;
        calculationId: string;
        summary: {
            totalCalculated: any;
            totalAmount: number;
            averagePerAgent: number;
            includeSubAgents: any;
        };
        results: {
            agentId: string;
            baseCommission: number;
            bonusCommission: number;
            totalCommission: number;
            commissionRate: number;
            volume: number;
        }[];
        processingTime: string;
    }>;
    processCommissionPayments(paymentData: any): Promise<{
        success: boolean;
        batchId: string;
        summary: {
            totalProcessed: number;
            totalAmount: number;
            successfulPayments: number;
            failedPayments: number;
            pendingPayments: number;
        };
        results: {
            commissionId: string;
            agentId: string;
            amount: number;
            status: string;
            transactionId: string;
        }[];
        failedPayments: {
            commissionId: string;
            agentId: string;
            amount: number;
            status: string;
            error: string;
        }[];
    }>;
    getCommissionBreakdown(period: string, groupBy?: string): Promise<{
        period: string;
        groupBy: string | undefined;
        breakdown: {
            agentId: string;
            agentName: string;
            directSales: number;
            referralBonuses: number;
            performanceBonuses: number;
            total: number;
        }[];
    } | {
        period: string;
        groupBy: string | undefined;
        breakdown: {
            level: number;
            count: number;
            totalAmount: number;
            averageAmount: number;
        }[];
    }>;
    updateCommissionStructure(structureData: any): Promise<{
        success: boolean;
        message: string;
        oldStructure: {
            level: number;
            rate: number;
            bonusThreshold: number;
        } | undefined;
        newStructure: any;
        effectiveDate: any;
        affectedAgents: number;
    }>;
    getCommissionRules(): Promise<{
        rules: {
            minCommissionThreshold: number;
            maxCommissionRate: number;
            payoutFrequency: string;
            holdingPeriod: number;
            levelStructure: {
                level: number;
                rate: number;
                bonusThreshold: number;
            }[];
        };
        lastUpdated: string;
        updatedBy: string;
    }>;
    updateCommissionRules(rulesData: any): Promise<{
        success: boolean;
        message: string;
        updatedRules: any;
        effectiveDate: string;
    }>;
    generateCommissionReport(reportData: any): Promise<{
        success: boolean;
        reportId: string;
        type: any;
        period: any;
        format: any;
        downloadUrl: string;
        expiresAt: string;
        summary: {
            totalRecords: number;
            totalAmount: number;
            generatedAt: string;
        };
    }>;
    exportCommissions(exportData: any): Promise<{
        success: boolean;
        message: string;
        format: any;
        recordCount: number;
        downloadUrl: string;
        expiresAt: string;
    }>;
    validateCommissions(validationData: any): Promise<{
        success: boolean;
        period: any;
        validation: {
            totalRecords: number;
            sampleSize: number;
            accuracyRate: number;
            discrepancies: {
                commissionId: string;
                issue: string;
                expectedAmount: number;
                actualAmount: number;
                difference: number;
            }[];
            summary: {
                passed: number;
                failed: number;
                totalDiscrepancy: number;
            };
        };
    }>;
    retryFailedPayments(retryData: any): Promise<{
        success: boolean;
        retryBatchId: string;
        summary: {
            totalRetried: number;
            successfulRetries: number;
            stillFailed: number;
            totalAmount: number;
        };
        results: {
            commissionId: string;
            status: string;
            amount: number;
            transactionId: string;
        }[];
    }>;
}
