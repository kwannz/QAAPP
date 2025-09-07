"use strict";
/**
 * 数据库连接配置管理
 * 根据环境变量自动选择合适的数据库连接
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIGRATION_CONFIG = exports.HEALTH_CHECK_CONFIG = void 0;
exports.getEnvironment = getEnvironment;
exports.getDatabaseUrl = getDatabaseUrl;
exports.getDatabaseConfig = getDatabaseConfig;
exports.validateDatabaseConfig = validateDatabaseConfig;
/**
 * 获取当前环境
 */
function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}
/**
 * 获取数据库连接URL
 */
function getDatabaseUrl() {
    const env = getEnvironment();
    // 优先使用显式设置的DATABASE_URL
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    // 根据环境选择合适的数据库URL
    switch (env) {
        case 'production':
            return process.env.DATABASE_PROD_URL ||
                process.env.DATABASE_AWS_URL ||
                process.env.DATABASE_SUPABASE_URL ||
                process.env.DATABASE_RAILWAY_URL ||
                'postgresql://localhost:5432/qa_app_prod';
        case 'test':
            return process.env.DATABASE_TEST_URL ||
                'postgresql://localhost:5432/qa_app_test';
        case 'staging':
            return process.env.DATABASE_STAGING_URL ||
                'postgresql://localhost:5432/qa_app_staging';
        case 'development':
        default:
            return process.env.DATABASE_DEV_URL ||
                'postgresql://qa_user:qa_password@localhost:5432/qa_app_dev?schema=public';
    }
}
/**
 * 获取完整的数据库配置
 */
function getDatabaseConfig() {
    const url = getDatabaseUrl();
    return {
        url,
        poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
        ssl: process.env.NODE_ENV === 'production',
        schema: 'public'
    };
}
/**
 * 验证数据库配置
 */
function validateDatabaseConfig() {
    try {
        const config = getDatabaseConfig();
        if (!config.url) {
            console.error('❌ 数据库URL未配置');
            return false;
        }
        if (!config.url.startsWith('postgresql://') && !config.url.startsWith('file:')) {
            console.error('❌ 数据库URL格式错误，必须是PostgreSQL或SQLite格式');
            return false;
        }
        console.log(`✅ 数据库配置验证通过`);
        console.log(`   环境: ${getEnvironment()}`);
        console.log(`   连接池大小: ${config.poolSize}`);
        console.log(`   连接超时: ${config.connectionTimeout}ms`);
        console.log(`   SSL: ${config.ssl ? '启用' : '禁用'}`);
        console.log(`   URL: ${config.url.replace(/(:)[^:@]*(@)/, '$1****$2')}`); // 隐藏密码
        return true;
    }
    catch (error) {
        console.error('❌ 数据库配置验证失败:', error);
        return false;
    }
}
/**
 * 数据库健康检查配置
 */
exports.HEALTH_CHECK_CONFIG = {
    enabled: process.env.DB_HEALTH_CHECK_ENABLED !== 'false',
    interval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '60000'), // 1分钟
    timeout: parseInt(process.env.DB_HEALTH_CHECK_TIMEOUT || '5000'), // 5秒
    retries: parseInt(process.env.DB_HEALTH_CHECK_RETRIES || '3')
};
/**
 * 迁移配置
 */
exports.MIGRATION_CONFIG = {
    autoMigrate: process.env.AUTO_MIGRATE === 'true',
    seedOnMigrate: process.env.SEED_ON_MIGRATE === 'true',
    backupBeforeMigrate: process.env.BACKUP_BEFORE_MIGRATE === 'true'
};
//# sourceMappingURL=config.js.map