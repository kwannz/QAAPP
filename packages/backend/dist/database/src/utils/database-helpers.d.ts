import { Prisma } from '@prisma/client';
export interface PaginationOptions {
    page?: number;
    limit?: number;
    cursor?: string;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextCursor?: string;
        prevCursor?: string;
    };
}
export declare function createPaginationQuery(options: PaginationOptions): {
    skip: number;
    take: number;
    page: number;
    limit: number;
};
export declare function createPaginatedResult<T extends {
    id: string;
}>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
export declare function buildSearchQuery(searchTerm: string, searchFields: string[]): Prisma.StringFilter[];
export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}
export declare function buildSortQuery(sortOptions?: SortOptions): {
    createdAt: "desc";
} | {
    [sortOptions.field]: "asc" | "desc";
    createdAt?: undefined;
};
export interface DateRangeFilter {
    from?: Date;
    to?: Date;
}
export declare function buildDateRangeQuery(dateRange?: DateRangeFilter): Prisma.DateTimeFilter<never> | undefined;
export declare function batchOperation<T>(items: T[], operation: (batch: T[]) => Promise<void>, batchSize?: number): Promise<void>;
export type TransactionCallback<T> = (tx: Prisma.TransactionClient) => Promise<T>;
export declare function createTransaction<T>(callback: TransactionCallback<T>): TransactionCallback<T>;
export declare function handleDatabaseError(error: unknown): never;
export interface SoftDeleteOptions {
    deletedAt?: Date | null;
}
export declare function createSoftDeleteQuery(includeDeleted?: boolean): {
    deletedAt?: undefined;
} | {
    deletedAt: null;
};
export interface AuditLogData {
    actorId?: string;
    actorType?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}
export declare function createAuditLog(data: AuditLogData): {
    createdAt: Date;
    actorId?: string;
    actorType?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
};
