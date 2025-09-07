import { Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { GetTransactionsDto, UpdateTransactionStatusDto, ProcessTransactionDto, ExportTransactionsDto } from '../dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getTransactions(query: GetTransactionsDto): Promise<import("../interfaces/transaction.interface").PaginatedTransactionResult>;
    getTransaction(id: string): Promise<import("../interfaces/transaction.interface").UnifiedTransaction>;
    updateTransactionStatus(id: string, updateDto: UpdateTransactionStatusDto): Promise<import("../interfaces/transaction.interface").UnifiedTransaction>;
    processTransaction(id: string, processDto: ProcessTransactionDto): Promise<import("../interfaces/transaction.interface").UnifiedTransaction>;
    bulkUpdateStatus(body: {
        ids: string[];
        status: string;
        metadata?: any;
    }): Promise<import("../interfaces/transaction.interface").UnifiedTransaction[]>;
    getStatistics(query: GetTransactionsDto): Promise<{
        totalCount: number;
        totalAmount: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        avgAmount: number;
        recentTrend: {
            date: string;
            count: number;
            amount: number;
        }[];
    }>;
    getOverview(timeRange: '24h' | '7d' | '30d'): Promise<{
        overall: {
            totalCount: number;
            totalAmount: number;
            byStatus: Record<string, number>;
            byType: Record<string, number>;
            avgAmount: number;
            recentTrend: {
                date: string;
                count: number;
                amount: number;
            }[];
        };
        timeRange: "30d" | "7d" | "24h";
        lastUpdated: Date;
    }>;
    exportTransactions(exportDto: ExportTransactionsDto, res: Response): Promise<void>;
}
export declare class LegacyTransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getLegacyPayouts(query: GetTransactionsDto, headers: Record<string, string>, res: Response): Promise<{
        data: {
            id: string;
            userId: string;
            userEmail: string | undefined;
            amount: number;
            currency: string;
            status: string;
            commissionId: unknown;
            createdAt: Date;
            updatedAt: Date;
            completedAt: Date | undefined;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getLegacyWithdrawals(query: GetTransactionsDto, headers: Record<string, string>, res: Response): Promise<{
        data: {
            id: string;
            userId: string;
            userEmail: string | undefined;
            amount: number;
            currency: string;
            method: string | undefined;
            status: string;
            bankAccount: unknown;
            alipayAccount: unknown;
            walletAddress: unknown;
            createdAt: Date;
            updatedAt: Date;
            completedAt: Date | undefined;
            rejectReason: string | undefined;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
