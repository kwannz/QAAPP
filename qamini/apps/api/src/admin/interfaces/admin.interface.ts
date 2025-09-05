// 管理员控制器接口

// 告警规则数据
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

// 数据清理配置
export interface DataCleanupConfig {
  targetTables: string[];
  retentionDays: number;
  batchSize?: number;
  dryRun?: boolean;
  excludeConditions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}