// 系统配置接口
export interface SystemConfigData {
  appName?: string;
  appVersion?: string;
  environment?: string;
  maxUsers?: number;
  maxConcurrentSessions?: number;
  maintenanceMode?: boolean;
  features?: Record<string, boolean>;
  metadata?: Record<string, unknown>;
}

// 业务配置接口
export interface BusinessConfigData {
  commissionRate?: number;
  platformFee?: number;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  processingFee?: number;
  riskThreshold?: number;
  metadata?: Record<string, unknown>;
}

// 安全配置接口
export interface SecurityConfigData {
  sessionTimeout?: number;
  passwordPolicy?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
    maxAge?: number;
  };
  rateLimits?: Record<string, { ttl: number; limit: number }>;
  corsOrigins?: string[];
  metadata?: Record<string, unknown>;
}

// 支付配置接口
export interface PaymentConfigData {
  supportedChains?: number[];
  supportedTokens?: string[];
  gasLimits?: Record<string, number>;
  confirmationBlocks?: Record<string, number>;
  processingFees?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

// 通知配置接口
export interface NotificationConfigData {
  emailProvider?: string;
  pushProvider?: string;
  smsProvider?: string;
  webhookEndpoints?: string[];
  retryPolicy?: {
    maxRetries?: number;
    retryInterval?: number;
    backoffMultiplier?: number;
  };
  metadata?: Record<string, unknown>;
}

// 配置备份数据
export interface ConfigBackupData {
  name: string;
  description?: string;
  configSnapshot: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// 分页查询接口
export interface ConfigPagination {
  page?: string;
  limit?: string;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 审计日志过滤器
export interface ConfigAuditFilters {
  category?: string;
  configType?: string;
  action?: string;
  userId?: string;
  page?: string;
  limit?: string;
  startDate?: Date;
  endDate?: Date;
  offset?: number;
}