import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { PerformanceOptimizerService } from '../../common/performance/performance-optimizer.service';
import { UnifiedTransaction, PaginatedTransactionResult } from '../interfaces/transaction.interface';
export interface TransactionQuery {
    userId?: string;
    type?: 'PAYOUT' | 'WITHDRAWAL' | 'ALL';
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
export declare class TransactionsService {
    private configService;
    private database;
    private performanceOptimizer;
    private readonly logger;
    constructor(configService: ConfigService, database: DatabaseService, performanceOptimizer: PerformanceOptimizerService);
    findAll(query?: TransactionQuery): Promise<PaginatedTransactionResult>;
    private executeTransactionQuery;
    findOne(id: string): Promise<UnifiedTransaction>;
    updateStatus(id: string, status: string, metadata?: any): Promise<UnifiedTransaction>;
    bulkUpdateStatus(ids: string[], status: string, metadata?: any): Promise<UnifiedTransaction[]>;
    processTransaction(id: string, action: 'APPROVE' | 'REJECT' | 'PROCESS', reason?: string): Promise<UnifiedTransaction>;
    getStatistics(query?: TransactionQuery): Promise<{
        totalCount: number;
        totalAmount: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        avgAmount: number;
        recentTrend: Array<{
            date: string;
            count: number;
            amount: number;
        }>;
    }>;
    exportTransactions(query?: TransactionQuery, format?: 'csv' | 'excel' | 'json'): Promise<string | Buffer>;
    getOverview(timeRange?: '24h' | '7d' | '30d'): Promise<{
        overall: {
            totalCount: number;
            totalAmount: number;
            byStatus: Record<string, number>;
            byType: Record<string, number>;
            avgAmount: number;
            recentTrend: Array<{
                date: string;
                count: number;
                amount: number;
            }>;
        };
        timeRange: "30d" | "7d" | "24h";
        lastUpdated: Date;
    }>;
    private mapWithdrawalStatus;
    private mapStatusToWithdrawal;
    private getWithdrawalMethod;
    private generateCSV;
}
