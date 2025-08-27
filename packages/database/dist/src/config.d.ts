/**
 * 数据库连接配置管理
 * 根据环境变量自动选择合适的数据库连接
 */
export interface DatabaseConfig {
    url: string;
    poolSize?: number;
    connectionTimeout?: number;
    ssl?: boolean;
    schema?: string;
}
/**
 * 获取当前环境
 */
export declare function getEnvironment(): string;
/**
 * 获取数据库连接URL
 */
export declare function getDatabaseUrl(): string;
/**
 * 获取完整的数据库配置
 */
export declare function getDatabaseConfig(): DatabaseConfig;
/**
 * 验证数据库配置
 */
export declare function validateDatabaseConfig(): boolean;
/**
 * 数据库健康检查配置
 */
export declare const HEALTH_CHECK_CONFIG: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
};
/**
 * 迁移配置
 */
export declare const MIGRATION_CONFIG: {
    autoMigrate: boolean;
    seedOnMigrate: boolean;
    backupBeforeMigrate: boolean;
};
//# sourceMappingURL=config.d.ts.map