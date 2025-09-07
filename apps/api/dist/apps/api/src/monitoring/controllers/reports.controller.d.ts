import { ReportsService } from '../services/reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generateFinancialOverview(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        includeCharts?: boolean;
        breakdown?: string[];
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                totalRevenue: number;
                totalExpenses: number;
                netProfit: number;
                profitMargin: number;
                growthRate: number;
            };
            breakdown: {
                revenueStreams: {
                    source: string;
                    amount: number;
                    percentage: number;
                }[];
                expenseCategories: {
                    category: string;
                    amount: number;
                    percentage: number;
                }[];
            };
        };
    }>;
    generateCommissionReport(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        agentIds?: string[];
        groupBy?: 'agent' | 'level' | 'period';
        includeSubAgents?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                totalCommissions: number;
                totalAgents: number;
                averageCommission: number;
                topPerformingLevel: number;
            };
            breakdown: {
                byLevel: {
                    level: number;
                    agentCount: number;
                    totalCommission: number;
                    avgCommission: number;
                }[];
                topPerformers: {
                    agentId: string;
                    name: string;
                    commission: number;
                    level: number;
                }[];
            };
        };
    }>;
    generateRevenueReport(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        breakdown: 'daily' | 'weekly' | 'monthly';
        includeProjections?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                totalRevenue: number;
                averageDailyRevenue: number;
                growthRate: number;
                projectedAnnualRevenue: number;
            };
            trends: {
                period: string;
                revenue: number;
                growth: number;
            }[];
        };
    }>;
    generateInvestmentAnalysis(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        riskLevels?: string[];
        includePerformance?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                totalInvestments: number;
                totalOrders: number;
                averageOrderSize: number;
                riskDistribution: {
                    LOW: number;
                    MEDIUM: number;
                    HIGH: number;
                };
            };
            performance: {
                approvalRate: number;
                averageProcessingTime: string;
                topRiskFactors: string[];
            };
        };
    }>;
    generateAgentPerformanceReport(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        agentIds?: string[];
        metrics?: string[];
        includeHierarchy?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                totalAgents: number;
                activeAgents: number;
                topPerformer: string;
                averagePerformanceScore: number;
            };
            metrics: {
                newUserAcquisition: number;
                totalVolume: number;
                retentionRate: number;
                satisfactionScore: number;
            };
        };
    }>;
    generateCashFlowReport(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        includeProjections?: boolean;
        breakdown?: 'inflow' | 'outflow' | 'net';
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                totalInflow: number;
                totalOutflow: number;
                netCashFlow: number;
                cashFlowRatio: number;
            };
            breakdown: {
                inflow: {
                    source: string;
                    amount: number;
                    percentage: number;
                }[];
                outflow: {
                    category: string;
                    amount: number;
                    percentage: number;
                }[];
            };
        };
    }>;
    generateComplianceReport(reportData: {
        period: string;
        dateFrom: string;
        dateTo: string;
        format: 'pdf' | 'excel' | 'csv';
        regulations?: string[];
        includeAuditTrail?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        report: {
            id: string;
            name: string;
            status: string;
            estimatedCompletion: string;
        };
        data: {
            summary: {
                complianceScore: number;
                totalChecks: number;
                passedChecks: number;
                failedChecks: number;
                criticalIssues: number;
            };
            regulations: {
                name: string;
                status: string;
                score: number;
            }[];
        };
    }>;
    getReportTemplates(category?: string): Promise<{
        data: {
            id: string;
            name: string;
            category: string;
            description: string;
            dataSource: string;
            fields: string[];
            charts: string[];
            isActive: boolean;
            createdAt: string;
        }[];
        total: number;
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
    }>;
    createReportTemplate(templateData: {
        name: string;
        category: string;
        description?: string;
        dataSource: string;
        fields: string[];
        filters: any[];
        charts?: any[];
        schedule?: any;
    }): Promise<{
        success: boolean;
        message: string;
        template: {
            id: any;
            name: any;
            category: any;
            createdAt: any;
        };
    }>;
    getReportHistory(type?: string, status?: string, page?: number, limit?: number): Promise<{
        data: ({
            id: string;
            name: string;
            type: string;
            status: string;
            format: string;
            size: string;
            generatedAt: string;
            generatedBy: string;
            downloadUrl: string;
            expiresAt: string;
            progress?: undefined;
        } | {
            id: string;
            name: string;
            type: string;
            status: string;
            format: string;
            progress: number;
            generatedAt: string;
            generatedBy: string;
            size?: undefined;
            downloadUrl?: undefined;
            expiresAt?: undefined;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        summary: {
            totalReports: number;
            completed: number;
            processing: number;
            failed: number;
        };
    }>;
    getReport(reportId: string): Promise<{
        report: {
            id: string;
            name: string;
            type: string;
            status: string;
            format: string;
            size: string;
            generatedAt: string;
            generatedBy: string;
            downloadUrl: string;
            expiresAt: string;
            progress?: undefined;
        } | {
            id: string;
            name: string;
            type: string;
            status: string;
            format: string;
            progress: number;
            generatedAt: string;
            generatedBy: string;
            size?: undefined;
            downloadUrl?: undefined;
            expiresAt?: undefined;
        };
        metadata: {
            generationTime: string;
            dataPoints: number;
            lastUpdated: string;
        };
    }>;
    downloadReport(reportId: string, res: Response): Promise<void>;
    scheduleReport(scheduleData: {
        templateId: string;
        name: string;
        schedule: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
            dayOfWeek?: number;
            dayOfMonth?: number;
            time: string;
        };
        recipients: string[];
        format: 'pdf' | 'excel' | 'csv';
        parameters?: any;
    }): Promise<{
        success: boolean;
        message: string;
        schedule: {
            id: any;
            name: any;
            nextRun: any;
            createdAt: any;
        };
    }>;
    getScheduledReports(status?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            templateId: string;
            schedule: {
                frequency: string;
                dayOfMonth: number;
                time: string;
            };
            recipients: string[];
            format: string;
            status: string;
            lastRun: string;
            nextRun: string;
            createdAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        summary: {
            totalSchedules: number;
            active: number;
            paused: number;
        };
    }>;
    cancelScheduledReport(scheduleId: string): Promise<{
        success: boolean;
        message: string;
        scheduleId: string;
        cancelledAt: string;
    }>;
    getReportStats(period?: string): Promise<{
        period: string;
        overview: {
            totalReports: number;
            successRate: number;
            averageGenerationTime: string;
            totalDownloads: number;
        };
        byType: {
            financial: {
                count: number;
                successRate: number;
            };
            commissions: {
                count: number;
                successRate: number;
            };
            investments: {
                count: number;
                successRate: number;
            };
            compliance: {
                count: number;
                successRate: number;
            };
        };
        byFormat: {
            pdf: {
                count: number;
                percentage: number;
            };
            excel: {
                count: number;
                percentage: number;
            };
            csv: {
                count: number;
                percentage: number;
            };
        };
        trends: {
            daily: {
                date: string;
                generated: number;
                downloaded: number;
            }[];
        };
    }>;
    getDashboardKPIs(period?: string, comparison?: string): Promise<{
        period: string;
        comparison: string;
        kpis: {
            financial: {
                totalRevenue: {
                    value: number;
                    change: number;
                    trend: string;
                };
                netProfit: {
                    value: number;
                    change: number;
                    trend: string;
                };
                profitMargin: {
                    value: number;
                    change: number;
                    trend: string;
                };
                operatingCosts: {
                    value: number;
                    change: number;
                    trend: string;
                };
            };
            business: {
                totalOrders: {
                    value: number;
                    change: number;
                    trend: string;
                };
                averageOrderValue: {
                    value: number;
                    change: number;
                    trend: string;
                };
                approvalRate: {
                    value: number;
                    change: number;
                    trend: string;
                };
                customerSatisfaction: {
                    value: number;
                    change: number;
                    trend: string;
                };
            };
            agents: {
                activeAgents: {
                    value: number;
                    change: number;
                    trend: string;
                };
                totalCommissions: {
                    value: number;
                    change: number;
                    trend: string;
                };
                averagePerformance: {
                    value: number;
                    change: number;
                    trend: string;
                };
                newAgentSignups: {
                    value: number;
                    change: number;
                    trend: string;
                };
            };
        };
        alerts: ({
            type: string;
            message: string;
            metric: string;
            threshold: number;
            current: number;
            improvement?: undefined;
        } | {
            type: string;
            message: string;
            metric: string;
            improvement: number;
            threshold?: undefined;
            current?: undefined;
        })[];
    }>;
    exportReportData(exportData: {
        reportType: string;
        dateFrom: string;
        dateTo: string;
        format: 'csv' | 'excel' | 'json';
        filters?: any;
        fields?: string[];
    }): Promise<{
        success: boolean;
        message: string;
        exportId: string;
        format: any;
        estimatedCompletion: string;
        downloadUrl: string;
        summary: {
            recordCount: number;
            fields: any;
            dateRange: string;
        };
    }>;
    previewReport(previewData: {
        templateId?: string;
        type: string;
        parameters: any;
        sampleSize?: number;
    }): Promise<{
        success: boolean;
        preview: {
            reportType: any;
            sampleData: ({
                field: string;
                value: number;
                format: string;
            } | {
                field: string;
                value: string;
                format: string;
            })[];
            charts: ({
                type: string;
                title: string;
                dataPoints: number;
                segments?: undefined;
                categories?: undefined;
            } | {
                type: string;
                title: string;
                segments: number;
                dataPoints?: undefined;
                categories?: undefined;
            } | {
                type: string;
                title: string;
                categories: number;
                dataPoints?: undefined;
                segments?: undefined;
            })[];
            estimatedSize: string;
            generationTime: string;
        };
    }>;
}
