import { Request } from 'express';

// 认证用户接口
export interface AuthenticatedUser {
  id: string;
  sub: string; // JWT subject, typically the user ID
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

// 认证请求接口
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// 通用查询过滤器
export interface QueryFilters {
  userId?: string;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// 基础分页查询
export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

// 错误类型定义
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

// 数据库where子句类型
export interface DatabaseWhereClause {
  [key: string]: unknown;
}

// 分页元数据
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API响应包装器
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}