import { Request } from 'express';
export interface AuthenticatedUser {
    id: string;
    sub: string;
    email: string;
    role: string;
    kycStatus: string;
    referralCode: string;
    isActive: boolean;
    wallets?: Array<{
        id: string;
        address: string;
        chainId: number;
        isPrimary: boolean;
    }>;
}
export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
export interface QueryFilters {
    userId?: string;
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: unknown;
}
export interface DatabaseWhereClause {
    [key: string]: unknown;
}
export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface ApiResponse<T = unknown> {
    data: T;
    meta?: PaginationMeta;
    message?: string;
}
