// 共享类型定义

// 用户相关类型
export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',  
  ADMIN = 'ADMIN'
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED', 
  EXPIRED = 'EXPIRED'
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

// 钱包相关类型
export interface Wallet {
  id: string;
  userId: string;
  chainId: number;
  address: string;
  isPrimary: boolean;
  label?: string;
  createdAt: Date;
}

// 产品相关类型
export interface Product {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  minAmount: number;
  maxAmount?: number;
  apr: number; // 年化收益率(百分比)
  lockDays: number;
  nftTokenId?: number;
  nftMetadata?: any;
  totalSupply?: number;
  currentSupply: number;
  isActive: boolean;
  startsAt: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 订单相关类型
export enum OrderStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
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
  metadata?: any;
  createdAt: Date;
  confirmedAt?: Date;
  updatedAt: Date;
}

// 持仓相关类型
export enum PositionStatus {
  ACTIVE = 'ACTIVE',
  REDEEMING = 'REDEEMING',
  CLOSED = 'CLOSED',
  DEFAULTED = 'DEFAULTED'
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
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// 收益相关类型
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
  merkleProof?: any;
  batchId?: string;
  distributionTx?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 佣金相关类型
export enum CommissionType {
  REFERRAL = 'REFERRAL',
  AGENT = 'AGENT'
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export interface Commission {
  id: string;
  userId: string;
  orderId: string;
  basisAmount: number;
  rate: number; // 佣金比例(百分比)
  amount: number;
  commissionType: CommissionType;
  status: CommissionStatus;
  settledAt?: Date;
  settlementTxHash?: string;
  batchId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
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

// 统计相关类型
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

// Web3相关类型
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
  abi: any[];
  deployedAt: number;
}

// 事件相关类型
export interface BlockchainEvent {
  id: string;
  type: string;
  chainId: number;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  eventData: any;
  processed: boolean;
  createdAt: Date;
}

// 批处理相关类型
export interface BatchJob {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parameters?: any;
  result?: any;
  errorMsg?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 审计日志类型
export interface AuditLog {
  id: string;
  actorId?: string;
  actorType: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: Date;
}