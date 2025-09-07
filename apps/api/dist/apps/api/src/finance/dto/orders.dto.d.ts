import { OrderStatus } from '@qa-app/database';
export declare enum PaymentType {
    USDT = "USDT",
    ETH = "ETH",
    FIAT = "FIAT"
}
export declare class CreateOrderDto {
    productId: string;
    usdtAmount: number;
    referrerCode?: string;
}
export declare class ConfirmOrderDto {
    txHash: string;
    signature?: string;
}
declare const UpdateOrderDto_base: import("@nestjs/common").Type<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status?: OrderStatus;
    failureReason?: string;
}
export declare class OrderQueryDto {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    productId?: string;
    userId?: string;
}
export declare class OrderResponseDto {
    id: string;
    userId: string;
    productId: string;
    usdtAmount: number;
    platformFee: number;
    txHash?: string;
    status: OrderStatus;
    referrerId?: string;
    agentId?: string;
    failureReason?: string;
    metadata?: any;
    createdAt: Date;
    confirmedAt?: Date;
    updatedAt: Date;
    product?: {
        id: string;
        symbol: string;
        name: string;
        description?: string;
        nftMetadata?: any;
    };
    user?: {
        id: string;
        email?: string;
        referralCode: string;
    };
    referrer?: {
        id: string;
        referralCode: string;
        email?: string;
    };
    agent?: {
        id: string;
        referralCode: string;
        email?: string;
    };
    positions?: any[];
}
export declare class OrderListResponseDto {
    orders: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class BatchUpdateOrdersDto {
    orderIds: string[];
    action: 'approve' | 'reject';
    reason?: string;
    notes?: string;
}
export declare class OrderStatsResponseDto {
    total: number;
    pending: number;
    success: number;
    failed: number;
    canceled: number;
    totalVolume: number;
    averageOrderValue: number;
    todayOrders: number;
    weekOrders: number;
    monthOrders: number;
    paymentTypes: {
        [key in PaymentType]: {
            count: number;
            volume: number;
        };
    };
    topProducts: Array<{
        productId: string;
        productName: string;
        orderCount: number;
        totalVolume: number;
    }>;
    dailyTrends: Array<{
        date: string;
        orderCount: number;
        volume: number;
    }>;
}
export {};
