"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationQuery = createPaginationQuery;
exports.createPaginatedResult = createPaginatedResult;
exports.buildSearchQuery = buildSearchQuery;
exports.buildSortQuery = buildSortQuery;
exports.buildDateRangeQuery = buildDateRangeQuery;
exports.batchOperation = batchOperation;
exports.createTransaction = createTransaction;
exports.handleDatabaseError = handleDatabaseError;
exports.createSoftDeleteQuery = createSoftDeleteQuery;
exports.createAuditLog = createAuditLog;
const client_1 = require("@prisma/client");
function createPaginationQuery(options) {
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
function createPaginatedResult(data, total, page, limit) {
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
function buildSearchQuery(searchTerm, searchFields) {
    if (!searchTerm || !searchFields.length) {
        return [];
    }
    return searchFields.map(field => ({
        [field]: {
            contains: searchTerm,
            mode: 'insensitive',
        },
    }));
}
function buildSortQuery(sortOptions) {
    if (!sortOptions) {
        return { createdAt: 'desc' };
    }
    return {
        [sortOptions.field]: sortOptions.direction,
    };
}
function buildDateRangeQuery(dateRange) {
    if (!dateRange)
        return undefined;
    const query = {};
    if (dateRange.from) {
        query.gte = dateRange.from;
    }
    if (dateRange.to) {
        query.lte = dateRange.to;
    }
    return Object.keys(query).length > 0 ? query : undefined;
}
// 批量操作辅助函数
async function batchOperation(items, operation, batchSize = 100) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await operation(batch);
    }
}
function createTransaction(callback) {
    return callback;
}
// 数据库错误处理
function handleDatabaseError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
    if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        throw new Error('未知数据库错误');
    }
    if (error instanceof client_1.Prisma.PrismaClientRustPanicError) {
        throw new Error('数据库引擎错误');
    }
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        throw new Error('数据库连接失败');
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        throw new Error(`数据验证失败：${error.message}`);
    }
    // 未知错误
    throw error;
}
function createSoftDeleteQuery(includeDeleted = false) {
    if (includeDeleted) {
        return {};
    }
    return {
        deletedAt: null,
    };
}
function createAuditLog(data) {
    return {
        ...data,
        createdAt: new Date(),
    };
}
//# sourceMappingURL=database-helpers.js.map