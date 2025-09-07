import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PositionsService } from './positions.service';
import { DatabaseService } from '../../database/database.service';
export interface YieldDistributionTask {
    id: string;
    positionId: string;
    userId: string;
    amount: number;
    scheduledAt: Date;
    executedAt?: Date;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    txHash?: string;
    failureReason?: string;
    retryCount: number;
    createdAt: Date;
}
export interface DistributionBatch {
    id: string;
    date: Date;
    totalAmount: number;
    totalPositions: number;
    completedTasks: number;
    failedTasks: number;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    startedAt: Date;
    completedAt?: Date;
    tasks: YieldDistributionTask[];
}
export declare class YieldDistributionService implements OnModuleInit, OnModuleDestroy {
    private payoutsService;
    private positionsService;
    private database;
    private readonly logger;
    private distributionTasks;
    private distributionBatches;
    private readonly maxRetryCount;
    private readonly batchSize;
    private readonly gasLimit;
    private readonly minGasBalance;
    private batchProcessingIntervalId;
    private healthMonitoringIntervalId;
    constructor(payoutsService: PayoutsService, positionsService: PositionsService, database: DatabaseService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    scheduleDailyYieldDistribution(): Promise<void>;
    triggerManualDistribution(positionIds?: string[]): Promise<DistributionBatch>;
    private createDistributionBatch;
    private createDistributionTasks;
    private executeBatchDistribution;
    private executeDistributionTask;
    private calculateDailyYield;
    private createPayoutRecord;
    private executeOnChainTransfer;
    private checkSystemHealth;
    private checkChainHealth;
    private checkGasBalance;
    private checkDatabaseHealth;
    private scheduleRetryTasks;
    private recoverPendingTasks;
    private startHealthMonitoring;
    private sendAlert;
    private getProductInfo;
    private chunkArray;
    private delay;
    getDistributionBatch(batchId: string): Promise<DistributionBatch | null>;
    getRecentDistributionBatches(limit?: number): Promise<DistributionBatch[]>;
    getDistributionStats(): Promise<{
        totalDistributed: number;
        totalBatches: number;
        successRate: number;
        lastDistribution?: Date;
        pendingTasks: number;
        failedTasks: number;
    }>;
}
