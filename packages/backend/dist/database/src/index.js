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
__exportStar(require("@prisma/client"), exports);
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
const client_2 = require("@prisma/client");
const config_1 = require("./config");
if (!(0, config_1.validateDatabaseConfig)()) {
    throw new Error('数据库配置验证失败，请检查环境变量');
}
const dbConfig = (0, config_1.getDatabaseConfig)();
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_2.PrismaClient({
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
async function healthCheck() {
    const timestamp = new Date().toISOString();
    try {
        const isConnected = await checkDatabaseConnection();
        if (isConnected) {
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
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
}
process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
});
__exportStar(require("./config"), exports);
__exportStar(require("./utils/database-helpers"), exports);
__exportStar(require("./utils/validation-helpers"), exports);
//# sourceMappingURL=index.js.map