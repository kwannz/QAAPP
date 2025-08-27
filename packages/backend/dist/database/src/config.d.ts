export interface DatabaseConfig {
    url: string;
    poolSize?: number;
    connectionTimeout?: number;
    ssl?: boolean;
    schema?: string;
}
export declare function getEnvironment(): string;
export declare function getDatabaseUrl(): string;
export declare function getDatabaseConfig(): DatabaseConfig;
export declare function validateDatabaseConfig(): boolean;
export declare const HEALTH_CHECK_CONFIG: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
};
export declare const MIGRATION_CONFIG: {
    autoMigrate: boolean;
    seedOnMigrate: boolean;
    backupBeforeMigrate: boolean;
};
