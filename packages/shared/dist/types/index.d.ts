export declare enum UserRole {
    USER = "USER",
    AGENT = "AGENT",
    ADMIN = "ADMIN"
}
export declare enum KycStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export interface User {
    id: string;
    email?: string;
    role: UserRole;
    referralCode: string;
    referredById?: string;
    agentId?: string;
    kycStatus: KycStatus;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Wallet {
    id: string;
    userId: string;
    chainId: number;
    address: string;
    isPrimary: boolean;
    label?: string;
    createdAt: Date;
}
export interface Product {
    id: string;
    symbol: string;
    name: string;
    description?: string;
    minAmount: number;
    maxAmount?: number;
    apr: number;
    lockDays: number;
    nftTokenId?: number;
    nftMetadata?: unknown;
    totalSupply?: number;
    currentSupply: number;
    isActive: boolean;
    startsAt: Date;
    endsAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELED = "CANCELED"
}
export interface Order {
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
    metadata?: unknown;
    createdAt: Date;
    confirmedAt?: Date;
    updatedAt: Date;
}
export declare enum PositionStatus {
    ACTIVE = "ACTIVE",
    REDEEMING = "REDEEMING",
    CLOSED = "CLOSED",
    DEFAULTED = "DEFAULTED"
}
export interface Position {
    id: string;
    userId: string;
    productId: string;
    orderId: string;
    principal: number;
    startDate: Date;
    endDate: Date;
    nextPayoutAt?: Date;
    nftTokenId?: number;
    nftTokenUri?: string;
    status: PositionStatus;
    metadata?: unknown;
    createdAt: Date;
    updatedAt: Date;
}
export interface Payout {
    id: string;
    userId: string;
    positionId: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    isClaimable: boolean;
    claimedAt?: Date;
    claimTxHash?: string;
    merkleIndex?: number;
    merkleProof?: unknown;
    batchId?: string;
    distributionTx?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum CommissionType {
    REFERRAL = "REFERRAL",
    AGENT = "AGENT"
}
export declare enum CommissionStatus {
    PENDING = "PENDING",
    READY = "READY",
    PAID = "PAID",
    FAILED = "FAILED"
}
export interface Commission {
    id: string;
    userId: string;
    orderId: string;
    basisAmount: number;
    rate: number;
    amount: number;
    commissionType: CommissionType;
    status: CommissionStatus;
    settledAt?: Date;
    settlementTxHash?: string;
    batchId?: string;
    metadata?: unknown;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        requestId: string;
        timestamp: number;
        version: string;
    };
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface UserStats {
    totalInvestment: number;
    totalRevenue: number;
    claimableAmount: number;
    activePositions: number;
    totalPositions: number;
    referralCount: number;
    commissionEarned: number;
}
export interface ProductStats {
    totalSales: number;
    totalParticipants: number;
    averageInvestment: number;
    totalRevenuePaid: number;
}
export interface ReferralStats {
    totalReferrals: number;
    successfulReferrals: number;
    totalCommission: number;
    pendingCommission: number;
    conversionRate: number;
}
export interface ChainConfig {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}
export interface ContractConfig {
    address: string;
    abi: unknown[];
    deployedAt: number;
}
export interface BlockchainEvent {
    id: string;
    type: string;
    chainId: number;
    contractAddress: string;
    transactionHash: string;
    blockNumber: number;
    eventData: unknown;
    processed: boolean;
    createdAt: Date;
}
export interface BatchJob {
    id: string;
    type: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    parameters?: unknown;
    result?: unknown;
    errorMsg?: string;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuditLog {
    id: string;
    actorId?: string;
    actorType: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: unknown;
    createdAt: Date;
}
export * from './cache.types';
