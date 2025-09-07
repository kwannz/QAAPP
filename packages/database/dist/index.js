"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.RiskLevel = exports.WithdrawalType = exports.WithdrawalStatus = exports.CommissionStatus = exports.CommissionType = exports.PositionStatus = exports.OrderStatus = exports.KycStatus = exports.UserRole = exports.Decimal = exports.PrismaClient = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.healthCheck = healthCheck;
exports.disconnectDatabase = disconnectDatabase;
// 数据库包主入口文件
__exportStar(require("@prisma/client"), exports);
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
var library_1 = require("@prisma/client/runtime/library");
Object.defineProperty(exports, "Decimal", { enumerable: true, get: function () { return library_1.Decimal; } });
// 导出PostgreSQL原生枚举（类型和值）
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return client_2.UserRole; } });
Object.defineProperty(exports, "KycStatus", { enumerable: true, get: function () { return client_2.KycStatus; } });
Object.defineProperty(exports, "OrderStatus", { enumerable: true, get: function () { return client_2.OrderStatus; } });
Object.defineProperty(exports, "PositionStatus", { enumerable: true, get: function () { return client_2.PositionStatus; } });
Object.defineProperty(exports, "CommissionType", { enumerable: true, get: function () { return client_2.CommissionType; } });
Object.defineProperty(exports, "CommissionStatus", { enumerable: true, get: function () { return client_2.CommissionStatus; } });
Object.defineProperty(exports, "WithdrawalStatus", { enumerable: true, get: function () { return client_2.WithdrawalStatus; } });
Object.defineProperty(exports, "WithdrawalType", { enumerable: true, get: function () { return client_2.WithdrawalType; } });
Object.defineProperty(exports, "RiskLevel", { enumerable: true, get: function () { return client_2.RiskLevel; } });
// 导出新的数据库管理器和缓存管理器
__exportStar(require("./connection"), exports);
__exportStar(require("./cache"), exports);
// 导出数据库实例
const client_3 = require("@prisma/client");
const config_1 = require("./config");
// 验证数据库配置
if (!(0, config_1.validateDatabaseConfig)()) {
    throw new Error('数据库配置验证失败，请检查环境变量');
}
const dbConfig = (0, config_1.getDatabaseConfig)();
// 全局数据库实例，避免在开发环境中创建多个连接
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_3.PrismaClient({
        datasources: {
            db: {
                url: dbConfig.url,
            },
        },
        log: (0, config_1.getEnvironment)() === 'development'
            ? ['query', 'error', 'warn', 'info']
            : ['error'],
        errorFormat: 'pretty',
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
// 数据库连接状态检查
async function checkDatabaseConnection() {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
// 数据库健康检查
async function healthCheck() {
    const timestamp = new Date().toISOString();
    try {
        const isConnected = await checkDatabaseConnection();
        if (isConnected) {
            // 获取数据库版本信息
            const result = await exports.prisma.$queryRaw `SELECT version()`;
            const version = result[0]?.version;
            return {
                database: true,
                timestamp,
                version,
            };
        }
        return {
            database: false,
            timestamp,
        };
    }
    catch (error) {
        return {
            database: false,
            timestamp,
        };
    }
}
// 优雅关闭数据库连接
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
}
// 监听进程退出事件，确保数据库连接正确关闭
process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
});
// 导出配置相关函数
__exportStar(require("./config"), exports);
// 导出常用的数据库操作辅助函数
__exportStar(require("./utils/database-helpers"), exports);
__exportStar(require("./utils/validation-helpers"), exports);
//# sourceMappingURL=index.js.map