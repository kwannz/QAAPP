export declare enum ApiVersioningStrategy {
    URL_PATH = "URL_PATH",
    QUERY_PARAMETER = "QUERY_PARAM",
    HEADER = "HEADER",
    CONTENT_NEGOTIATION = "CONTENT",
    SUBDOMAIN = "SUBDOMAIN",
    CUSTOM_HEADER = "CUSTOM_HEADER"
}
export declare enum VersionStatus {
    BETA = "BETA",
    STABLE = "STABLE",
    DEPRECATED = "DEPRECATED",
    SUNSET = "SUNSET"
}
export interface ApiVersion {
    version: string;
    majorVersion: number;
    minorVersion?: number;
    patchVersion?: number;
    status: VersionStatus;
    releaseDate: Date;
    deprecationDate?: Date;
    sunsetDate?: Date;
    description?: string;
    changelog?: string[];
    breakingChanges?: string[];
    supportedUntil?: Date;
}
export interface ApiEndpointVersion {
    path: string;
    method: string;
    version: string;
    handler: string;
    deprecated?: boolean;
    deprecationMessage?: string;
    alternativeEndpoint?: string;
    requestSchema?: Record<string, unknown>;
    responseSchema?: Record<string, unknown>;
    examples?: {
        request?: Record<string, unknown>;
        response?: Record<string, unknown>;
    };
}
export interface VersioningConfig {
    strategy: ApiVersioningStrategy;
    defaultVersion: string;
    supportedVersions: string[];
    headerName?: string;
    parameterName?: string;
    contentTypePrefix?: string;
    strictVersioning?: boolean;
    versionValidation?: boolean;
    autoDeprecationWarnings?: boolean;
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
    estimatedDuration: number;
    rollbackPlan?: string[];
    testingPlan?: string[];
    communicationPlan?: string[];
}
export interface MigrationStep {
    id: string;
    name: string;
    description: string;
    type: 'code' | 'data' | 'config' | 'deployment';
    estimatedTime: number;
    dependencies?: string[];
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
        backwardCompatible: string[];
        forwardCompatible: string[];
        breakingChangesWith: string[];
        migrationRequired: string[];
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
    supportDuration: number;
    deprecationPeriod: number;
    sunsetNotificationPeriod: number;
    backwardCompatibilityPeriod: number;
    majorVersionChangePolicy: 'breaking' | 'non-breaking';
    minorVersionChangePolicy: 'feature-only' | 'backward-compatible';
    autoDeprecateAfterMonths?: number;
    autoSunsetAfterMonths?: number;
    autoMigrationEnabled?: boolean;
    deprecationWarningThresholds: number[];
    clientNotificationChannels: string[];
    usageTrackingEnabled: boolean;
    performanceMonitoringEnabled: boolean;
    errorTrackingEnabled: boolean;
    analyticsEnabled: boolean;
}
