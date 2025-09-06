export enum ApiVersioningStrategy {
  URL_PATH = 'URL_PATH',           // /api/v1/users
  QUERY_PARAMETER = 'QUERY_PARAM', // /api/users?version=v1
  HEADER = 'HEADER',               // API-Version: v1
  CONTENT_NEGOTIATION = 'CONTENT', // Accept: application/vnd.qaapp.v1+json
  SUBDOMAIN = 'SUBDOMAIN',         // v1.api.qaapp.com
  CUSTOM_HEADER = 'CUSTOM_HEADER'  // X-API-Version: v1
}

export enum VersionStatus {
  BETA = 'BETA',           // 测试版本
  STABLE = 'STABLE',       // 稳定版本
  DEPRECATED = 'DEPRECATED', // 已废弃
  SUNSET = 'SUNSET'        // 即将下线
}

export interface ApiVersion {
  version: string;           // v1, v2, v1.0, v1.1.0
  majorVersion: number;      // 1, 2
  minorVersion?: number;     // 0, 1
  patchVersion?: number;     // 0, 1, 2
  status: VersionStatus;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;         // 下线日期
  description?: string;
  changelog?: string[];
  breakingChanges?: string[];
  supportedUntil?: Date;     // 支持截止日期
}

export interface ApiEndpointVersion {
  path: string;              // /users/:id
  method: string;            // GET, POST, PUT, DELETE
  version: string;           // v1, v2
  handler: string;           // 处理器名称
  deprecated?: boolean;
  deprecationMessage?: string;
  alternativeEndpoint?: string; // 替代端点
  requestSchema?: Record<string, unknown>;       // 请求schema
  responseSchema?: Record<string, unknown>;      // 响应schema
  examples?: {
    request?: Record<string, unknown>;
    response?: Record<string, unknown>;
  };
}

export interface VersioningConfig {
  strategy: ApiVersioningStrategy;
  defaultVersion: string;
  supportedVersions: string[];
  headerName?: string;       // 自定义Header名称
  parameterName?: string;    // 查询参数名称
  contentTypePrefix?: string; // 内容类型前缀
  strictVersioning?: boolean; // 严格版本控制
  versionValidation?: boolean; // 版本验证
  autoDeprecationWarnings?: boolean; // 自动废弃警告
}

export interface ClientVersionInfo {
  clientId?: string;
  userAgent?: string;
  preferredVersion?: string;
  supportedVersions?: string[];
  lastUsedVersion?: string;
  usageStats?: {
    [version: string]: {
      count: number;
      lastUsed: Date;
    };
  };
}

export interface VersionMigrationPlan {
  fromVersion: string;
  toVersion: string;
  migrationSteps: MigrationStep[];
  estimatedDuration: number; // 小时
  rollbackPlan?: string[];
  testingPlan?: string[];
  communicationPlan?: string[];
}

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  type: 'code' | 'data' | 'config' | 'deployment';
  estimatedTime: number; // 分钟
  dependencies?: string[]; // 依赖的步骤ID
  rollbackAction?: string;
  validation?: string;
}

export interface ApiUsageMetrics {
  version: string;
  endpoint: string;
  method: string;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  clients: {
    [clientId: string]: {
      requests: number;
      lastAccess: Date;
      userAgent?: string;
    };
  };
  dailyStats: {
    [date: string]: {
      requests: number;
      errors: number;
      uniqueClients: number;
    };
  };
}

export interface VersionCompatibilityMatrix {
  [version: string]: {
    backwardCompatible: string[];  // 向后兼容的版本
    forwardCompatible: string[];   // 向前兼容的版本
    breakingChangesWith: string[]; // 有破坏性变更的版本
    migrationRequired: string[];   // 需要迁移的版本
  };
}

export interface ApiDeprecationNotice {
  version: string;
  endpoint?: string;
  deprecationDate: Date;
  sunsetDate: Date;
  reason: string;
  alternative?: string;
  migrationGuide?: string;
  contactInfo?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface VersioningPolicy {

  // 版本生命周期
  supportDuration: number;      // 支持持续时间（月）
  deprecationPeriod: number;    // 废弃期（月）
  sunsetNotificationPeriod: number; // 下线通知期（月）

  // 兼容性策略
  backwardCompatibilityPeriod: number; // 向后兼容期（月）
  majorVersionChangePolicy: 'breaking' | 'non-breaking';
  minorVersionChangePolicy: 'feature-only' | 'backward-compatible';

  // 自动化策略
  autoDeprecateAfterMonths?: number;
  autoSunsetAfterMonths?: number;
  autoMigrationEnabled?: boolean;

  // 通知策略
  deprecationWarningThresholds: number[]; // 警告阈值（天）
  clientNotificationChannels: string[];   // 通知渠道

  // 监控策略
  usageTrackingEnabled: boolean;
  performanceMonitoringEnabled: boolean;
  errorTrackingEnabled: boolean;
  analyticsEnabled: boolean;
}
