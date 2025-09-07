export interface AlertRuleData {
    name: string;
    description?: string;
    condition: string;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    notificationChannels: string[];
    metadata?: Record<string, unknown>;
}
export interface DataCleanupConfig {
    targetTables: string[];
    retentionDays: number;
    batchSize?: number;
    dryRun?: boolean;
    excludeConditions?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
