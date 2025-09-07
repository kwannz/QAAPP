export declare class GetTransactionsDto {
    userId?: string;
    type?: 'PAYOUT' | 'WITHDRAWAL' | 'ALL';
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}
export declare class UpdateTransactionStatusDto {
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    metadata?: any;
}
export declare class ProcessTransactionDto {
    action: 'APPROVE' | 'REJECT' | 'PROCESS';
    reason?: string;
}
export declare class ExportTransactionsDto {
    userId?: string;
    type?: 'PAYOUT' | 'WITHDRAWAL' | 'ALL';
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    startDate?: string;
    endDate?: string;
    format: 'csv' | 'excel' | 'json';
}
export declare class BulkUpdateTransactionsDto {
    ids: string[];
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    metadata?: any;
}
