export interface TransactionQueryWhere {
  userId?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  status?: string;
}

export interface TransactionStatusFilter {
  status?: string;
}

export interface UnifiedTransaction {
  id: string;
  userId: string;
  type: 'PAYOUT' | 'WITHDRAWAL' | 'DEPOSIT';
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
  userEmail?: string;
  method?: string;
  completedAt?: Date;
  failureReason?: string;
}

export interface PaginatedTransactionResult {
  data: UnifiedTransaction[];
  total: number;
  page: number;
  pageSize: number;
}