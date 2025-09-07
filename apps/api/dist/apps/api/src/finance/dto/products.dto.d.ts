export declare class CreateProductDto {
    symbol: string;
    name: string;
    description?: string;
    minAmount: number;
    maxAmount?: number;
    apr: number;
    lockDays: number;
    nftTokenId?: number;
    nftMetadata?: any;
    totalSupply?: number;
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
}
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
}
export declare class ProductQueryDto {
    page?: number;
    limit?: number;
    symbol?: string;
    isActive?: boolean;
    includeInactive?: boolean;
}
export declare class ProductResponseDto {
    id: string;
    symbol: string;
    name: string;
    description?: string;
    minAmount: number;
    maxAmount?: number;
    apr: number;
    lockDays: number;
    nftTokenId?: number;
    nftMetadata?: any;
    totalSupply?: number;
    currentSupply: number;
    availableSupply?: number;
    isActive: boolean;
    startsAt: Date;
    endsAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    stats: {
        totalSales: number;
        totalInvestments: number;
        soldCount: number;
        activePositions: number;
    };
}
export declare class ProductAvailabilityDto {
    productId: string;
    amount: number;
}
export declare class ProductAvailabilityResponseDto {
    available: boolean;
    reason?: string;
}
export declare class ProductListResponseDto {
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export {};
