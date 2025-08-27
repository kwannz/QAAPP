import { Prisma } from '@prisma/client';

// 分页查询辅助函数
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

export function createPaginationQuery(options: PaginationOptions) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}

export function createPaginatedResult<T extends { id: string }>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextCursor: hasNextPage && data.length > 0 ? data[data.length - 1].id : undefined,
      prevCursor: hasPrevPage && data.length > 0 ? data[0].id : undefined,
    },
  };
}

// 搜索查询构建器
export function buildSearchQuery(
  searchTerm: string,
  searchFields: string[]
): Prisma.StringFilter[] {
  if (!searchTerm || !searchFields.length) {
    return [];
  }

  return searchFields.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive' as const,
    },
  }));
}

// 排序查询构建器
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export function buildSortQuery(sortOptions?: SortOptions) {
  if (!sortOptions) {
    return { createdAt: 'desc' as const };
  }

  return {
    [sortOptions.field]: sortOptions.direction,
  };
}

// 日期范围查询构建器
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export function buildDateRangeQuery(dateRange?: DateRangeFilter) {
  if (!dateRange) return undefined;

  const query: Prisma.DateTimeFilter = {};

  if (dateRange.from) {
    query.gte = dateRange.from;
  }

  if (dateRange.to) {
    query.lte = dateRange.to;
  }

  return Object.keys(query).length > 0 ? query : undefined;
}

// 批量操作辅助函数
export async function batchOperation<T>(
  items: T[],
  operation: (batch: T[]) => Promise<void>,
  batchSize = 100
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await operation(batch);
  }
}

// 事务辅助函数
export type TransactionCallback<T> = (tx: Prisma.TransactionClient) => Promise<T>;

export function createTransaction<T>(callback: TransactionCallback<T>) {
  return callback;
}

// 数据库错误处理
export function handleDatabaseError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new Error('违反唯一约束：该记录已存在');
      case 'P2003':
        throw new Error('违反外键约束：关联记录不存在');
      case 'P2004':
        throw new Error('违反约束条件');
      case 'P2025':
        throw new Error('记录未找到');
      default:
        throw new Error(`数据库操作失败：${error.message}`);
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new Error('未知数据库错误');
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new Error('数据库引擎错误');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new Error('数据库连接失败');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new Error(`数据验证失败：${error.message}`);
  }

  // 未知错误
  throw error;
}

// 软删除支持
export interface SoftDeleteOptions {
  deletedAt?: Date | null;
}

export function createSoftDeleteQuery(includeDeleted = false) {
  if (includeDeleted) {
    return {};
  }

  return {
    deletedAt: null,
  };
}

// 审计日志辅助函数
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

export function createAuditLog(data: AuditLogData) {
  return {
    ...data,
    createdAt: new Date(),
  };
}