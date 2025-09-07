import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ApiResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    meta?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>>;
    private isSpecialResponse;
    private logRequest;
    private generateRequestId;
}
