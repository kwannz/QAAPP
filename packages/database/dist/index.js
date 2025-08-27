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
exports.prisma = exports.PrismaClient = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.healthCheck = healthCheck;
exports.disconnectDatabase = disconnectDatabase;
// 数据库包主入口文件
__exportStar(require("@prisma/client"), exports);
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
// 导出数据库实例
const client_2 = require("@prisma/client");
// 全局数据库实例，避免在开发环境中创建多个连接
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_2.PrismaClient({
        log: ['query', 'error', 'warn'],
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
// 导出常用的数据库操作辅助函数
__exportStar(require("./utils/database-helpers"), exports);
__exportStar(require("./utils/validation-helpers"), exports);
//# sourceMappingURL=index.js.map