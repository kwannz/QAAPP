import { YieldDistributionService, DistributionBatch, YieldDistributionTask } from '../services/yield-distribution.service';
declare class TriggerDistributionDto {
    positionIds?: string[];
    forceExecute?: boolean;
    dryRun?: boolean;
}
declare class DistributionStatsDto {
    totalDistributed: number;
    totalBatches: number;
    successRate: number;
    lastDistribution?: Date;
    pendingTasks: number;
    failedTasks: number;
}
export declare class YieldDistributionController {
    private yieldDistributionService;
    constructor(yieldDistributionService: YieldDistributionService);
    triggerDistribution(triggerDto: TriggerDistributionDto): Promise<{
        success: boolean;
        batch: DistributionBatch;
        message: string;
    }>;
    getDistributionStats(): Promise<DistributionStatsDto>;
    getDistributionBatches(limit?: string): Promise<{
        batches: DistributionBatch[];
        total: number;
    }>;
    getDistributionBatch(batchId: string): Promise<{
        batch: DistributionBatch | null;
        success: boolean;
        message?: string;
    }>;
    getTodayDistributionStatus(): Promise<{
        hasDistributedToday: boolean;
        batch?: DistributionBatch;
        nextScheduledTime: string;
    }>;
    getSystemHealth(): Promise<{
        healthy: boolean;
        checks: {
            database: boolean;
            blockchain: boolean;
            gasBalance: boolean;
        };
        timestamp: string;
    }>;
    getDistributionConfig(): Promise<{
        scheduleCron: string;
        batchSize: number;
        maxRetryCount: number;
        gasLimit: number;
        minGasBalance: string;
        timezone: string;
    }>;
    pauseAutomaticDistribution(): Promise<{
        success: boolean;
        message: string;
    }>;
    resumeAutomaticDistribution(): Promise<{
        success: boolean;
        message: string;
    }>;
    getFailedTasks(batchId?: string, limit?: string): Promise<{
        tasks: YieldDistributionTask[];
        total: number;
    }>;
    retryFailedTasks(batchId: string): Promise<{
        success: boolean;
        message: string;
        retriedCount: number;
    }>;
    exportDistributionReport(startDate?: string, endDate?: string, format?: string): Promise<{
        success: boolean;
        data?: any;
        downloadUrl?: string;
        message?: string;
    }>;
}
export {};
