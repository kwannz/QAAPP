import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiVersion,
  VersionStatus,
  VersioningConfig,
  ApiVersioningStrategy,
  ApiEndpointVersion,
  ApiUsageMetrics,
  ClientVersionInfo,
  ApiDeprecationNotice,
  VersioningPolicy,
  VersionCompatibilityMatrix
} from '@qa-app/shared';
import { PrismaService } from '@qa-app/database';

@Injectable()
export class ApiVersionService implements OnModuleInit {
  private readonly logger = new Logger(ApiVersionService.name);
  private readonly versions = new Map<string, ApiVersion>();
  private readonly endpoints = new Map<string, ApiEndpointVersion[]>();
  private readonly usageMetrics = new Map<string, ApiUsageMetrics>();
  private readonly compatibilityMatrix: VersionCompatibilityMatrix = {};
  private versioningConfig: VersioningConfig;
  private versioningPolicy: VersioningPolicy;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {
    this.initializeConfiguration();
  }

  async onModuleInit() {
    await this.loadVersionsFromDatabase();
    this.startUsageTracking();
    this.startDeprecationMonitoring();
  }

  /**
   * 初始化版本配置
   */
  private initializeConfiguration(): void {
    this.versioningConfig = {
      strategy: this.configService.get('API_VERSIONING_STRATEGY', ApiVersioningStrategy.URL_PATH),
      defaultVersion: this.configService.get('API_DEFAULT_VERSION', 'v1'),
      supportedVersions: this.configService.get('API_SUPPORTED_VERSIONS', 'v1,v2').split(','),
      headerName: this.configService.get('API_VERSION_HEADER', 'API-Version'),
      parameterName: this.configService.get('API_VERSION_PARAM', 'version'),
      contentTypePrefix: this.configService.get('API_CONTENT_PREFIX', 'application/vnd.qaapp'),
      strictVersioning: this.configService.get('API_STRICT_VERSIONING', true),
      versionValidation: this.configService.get('API_VERSION_VALIDATION', true),
      autoDeprecationWarnings: this.configService.get('API_AUTO_DEPRECATION_WARNINGS', true)
    };

    this.versioningPolicy = {
      supportDuration: this.configService.get('API_SUPPORT_DURATION_MONTHS', 24),
      deprecationPeriod: this.configService.get('API_DEPRECATION_PERIOD_MONTHS', 6),
      sunsetNotificationPeriod: this.configService.get('API_SUNSET_NOTIFICATION_MONTHS', 3),
      backwardCompatibilityPeriod: this.configService.get('API_BACKWARD_COMPATIBILITY_MONTHS', 12),
      majorVersionChangePolicy: this.configService.get('API_MAJOR_VERSION_POLICY', 'breaking'),
      minorVersionChangePolicy: this.configService.get('API_MINOR_VERSION_POLICY', 'backward-compatible'),
      deprecationWarningThresholds: [90, 60, 30, 14, 7, 1], // 天
      clientNotificationChannels: ['email', 'webhook', 'in-app'],
      usageTrackingEnabled: true,
      performanceMonitoringEnabled: true,
      errorTrackingEnabled: true,
      analyticsEnabled: true
    };
  }

  /**
   * 注册API版本
   */
  async registerVersion(version: ApiVersion): Promise<void> {
    this.validateVersion(version);
    
    // 保存到内存
    this.versions.set(version.version, version);
    
    // 保存到数据库
    await this.saveVersionToDatabase(version);
    
    // 更新兼容性矩阵
    this.updateCompatibilityMatrix(version);
    
    // 发布版本注册事件
    this.eventEmitter.emit('api.version.registered', {
      version: version.version,
      status: version.status,
      releaseDate: version.releaseDate
    });

    this.logger.log(`API version registered: ${version.version} (${version.status})`);
  }

  /**
   * 注册API端点版本
   */
  async registerEndpoint(endpoint: ApiEndpointVersion): Promise<void> {
    const key = `${endpoint.method}:${endpoint.path}`;
    
    if (!this.endpoints.has(key)) {
      this.endpoints.set(key, []);
    }
    
    const endpointVersions = this.endpoints.get(key)!;
    
    // 检查是否已存在相同版本
    const existingIndex = endpointVersions.findIndex(ep => ep.version === endpoint.version);
    
    if (existingIndex >= 0) {
      endpointVersions[existingIndex] = endpoint;
    } else {
      endpointVersions.push(endpoint);
    }
    
    // 按版本排序
    endpointVersions.sort((a, b) => this.compareVersions(b.version, a.version));
    
    await this.saveEndpointToDatabase(endpoint);
    
    this.logger.debug(`API endpoint registered: ${endpoint.method} ${endpoint.path} (${endpoint.version})`);
  }

  /**
   * 解析客户端请求版本
   */
  parseClientVersion(request: any): string {
    let requestedVersion: string | undefined;

    switch (this.versioningConfig.strategy) {
      case ApiVersioningStrategy.URL_PATH:
        // 从URL路径提取版本，如 /api/v1/users
        const pathMatch = request.path.match(/\/api\/(v\d+(?:\.\d+)?(?:\.\d+)?)\//);
        requestedVersion = pathMatch?.[1];
        break;

      case ApiVersioningStrategy.QUERY_PARAMETER:
        requestedVersion = request.query[this.versioningConfig.parameterName!];
        break;

      case ApiVersioningStrategy.HEADER:
        requestedVersion = request.headers[this.versioningConfig.headerName!.toLowerCase()];
        break;

      case ApiVersioningStrategy.CUSTOM_HEADER:
        requestedVersion = request.headers['x-api-version'];
        break;

      case ApiVersioningStrategy.CONTENT_NEGOTIATION:
        const accept = request.headers['accept'];
        if (accept) {
          const match = accept.match(new RegExp(`${this.versioningConfig.contentTypePrefix}\\.(v\\d+(?:\\.\\d+)?(?:\\.\\d+)?)\\+json`));
          requestedVersion = match?.[1];
        }
        break;

      case ApiVersioningStrategy.SUBDOMAIN:
        const host = request.headers['host'];
        if (host) {
          const match = host.match(/^(v\d+(?:\.\d+)?(?:\.\d+)?)\./);
          requestedVersion = match?.[1];
        }
        break;
    }

    // 验证版本
    if (requestedVersion && this.versioningConfig.versionValidation) {
      if (!this.isVersionSupported(requestedVersion)) {
        throw new Error(`Unsupported API version: ${requestedVersion}`);
      }
    }

    return requestedVersion || this.versioningConfig.defaultVersion;
  }

  /**
   * 获取端点的特定版本
   */
  getEndpointVersion(method: string, path: string, version: string): ApiEndpointVersion | null {
    const key = `${method}:${path}`;
    const endpointVersions = this.endpoints.get(key);
    
    if (!endpointVersions) {
      return null;
    }

    // 查找确切版本
    let endpoint = endpointVersions.find(ep => ep.version === version);
    
    // 如果找不到确切版本，查找兼容版本
    if (!endpoint && this.compatibilityMatrix[version]) {
      const compatibleVersions = this.compatibilityMatrix[version].backwardCompatible;
      for (const compatibleVersion of compatibleVersions) {
        endpoint = endpointVersions.find(ep => ep.version === compatibleVersion);
        if (endpoint) {
          break;
        }
      }
    }

    return endpoint || null;
  }

  /**
   * 记录API使用情况
   */
  async recordApiUsage(
    version: string,
    endpoint: string,
    method: string,
    clientInfo: ClientVersionInfo,
    responseTime: number,
    statusCode: number
  ): Promise<void> {
    if (!this.versioningPolicy.usageTrackingEnabled) {
      return;
    }

    const key = `${version}:${method}:${endpoint}`;
    let metrics = this.usageMetrics.get(key);

    if (!metrics) {
      metrics = {
        version,
        endpoint,
        method,
        requestCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        clients: {},
        dailyStats: {}
      };
      this.usageMetrics.set(key, metrics);
    }

    // 更新基本指标
    metrics.requestCount++;
    if (statusCode >= 400) {
      metrics.errorCount++;
    }

    // 更新平均响应时间
    metrics.averageResponseTime = (
      (metrics.averageResponseTime * (metrics.requestCount - 1) + responseTime) /
      metrics.requestCount
    );

    // 更新客户端信息
    const clientId = clientInfo.clientId || 'anonymous';
    if (!metrics.clients[clientId]) {
      metrics.clients[clientId] = {
        requests: 0,
        lastAccess: new Date(),
        userAgent: clientInfo.userAgent
      };
    }
    metrics.clients[clientId].requests++;
    metrics.clients[clientId].lastAccess = new Date();

    // 更新每日统计
    const today = new Date().toISOString().split('T')[0];
    if (!metrics.dailyStats[today]) {
      metrics.dailyStats[today] = {
        requests: 0,
        errors: 0,
        uniqueClients: 0
      };
    }
    metrics.dailyStats[today].requests++;
    if (statusCode >= 400) {
      metrics.dailyStats[today].errors++;
    }
    metrics.dailyStats[today].uniqueClients = Object.keys(metrics.clients).length;

    // 异步保存到数据库
    this.saveUsageMetricsToDatabase(metrics).catch(error => {
      this.logger.error('Failed to save usage metrics:', error);
    });
  }

  /**
   * 废弃API版本
   */
  async deprecateVersion(
    version: string,
    reason: string,
    sunsetDate: Date,
    alternative?: string
  ): Promise<void> {
    const apiVersion = this.versions.get(version);
    if (!apiVersion) {
      throw new Error(`Version not found: ${version}`);
    }

    apiVersion.status = VersionStatus.DEPRECATED;
    apiVersion.deprecationDate = new Date();
    apiVersion.sunsetDate = sunsetDate;

    await this.saveVersionToDatabase(apiVersion);

    const notice: ApiDeprecationNotice = {
      version,
      deprecationDate: new Date(),
      sunsetDate,
      reason,
      alternative,
      severity: 'medium'
    };

    await this.notifyClientsOfDeprecation(notice);

    this.eventEmitter.emit('api.version.deprecated', {
      version,
      reason,
      sunsetDate,
      alternative
    });

    this.logger.warn(`API version deprecated: ${version}. Sunset date: ${sunsetDate.toISOString()}`);
  }

  /**
   * 获取版本使用统计
   */
  getVersionUsageStats(version?: string): ApiUsageMetrics[] {
    if (version) {
      return Array.from(this.usageMetrics.values())
        .filter(metrics => metrics.version === version);
    }
    
    return Array.from(this.usageMetrics.values());
  }

  /**
   * 获取版本健康报告
   */
  async getVersionHealthReport(): Promise<{
    totalVersions: number;
    activeVersions: number;
    deprecatedVersions: number;
    sunsetVersions: number;
    mostUsedVersion: string;
    leastUsedVersion: string;
    deprecationAlerts: ApiDeprecationNotice[];
    recommendations: string[];
  }> {
    const versions = Array.from(this.versions.values());
    const usageStats = this.getVersionUsageStats();

    // 统计版本状态
    const statusCounts = versions.reduce((counts, version) => {
      counts[version.status] = (counts[version.status] || 0) + 1;
      return counts;
    }, {} as Record<VersionStatus, number>);

    // 计算使用量
    const versionUsage = usageStats.reduce((usage, stats) => {
      usage[stats.version] = (usage[stats.version] || 0) + stats.requestCount;
      return usage;
    }, {} as Record<string, number>);

    const sortedVersions = Object.entries(versionUsage)
      .sort(([, a], [, b]) => b - a);

    // 获取废弃警告
    const deprecationAlerts = await this.getDeprecationAlerts();

    // 生成建议
    const recommendations = this.generateVersionRecommendations(versions, usageStats);

    return {
      totalVersions: versions.length,
      activeVersions: statusCounts[VersionStatus.STABLE] || 0,
      deprecatedVersions: statusCounts[VersionStatus.DEPRECATED] || 0,
      sunsetVersions: statusCounts[VersionStatus.SUNSET] || 0,
      mostUsedVersion: sortedVersions[0]?.[0] || 'N/A',
      leastUsedVersion: sortedVersions[sortedVersions.length - 1]?.[0] || 'N/A',
      deprecationAlerts,
      recommendations
    };
  }

  /**
   * 私有辅助方法
   */
  private validateVersion(version: ApiVersion): void {
    if (!version.version || !version.version.match(/^v\d+(\.\d+)?(\.\d+)?$/)) {
      throw new Error('Invalid version format. Use vX.Y.Z or vX format.');
    }

    if (this.versions.has(version.version)) {
      throw new Error(`Version already exists: ${version.version}`);
    }
  }

  private compareVersions(a: string, b: string): number {
    const parseVersion = (v: string) => {
      const match = v.match(/^v?(\d+)\.?(\d+)?\.?(\d+)?$/);
      if (!match) return [0, 0, 0];
      return [
        parseInt(match[1]) || 0,
        parseInt(match[2]) || 0,
        parseInt(match[3]) || 0
      ];
    };

    const [aMajor, aMinor, aPatch] = parseVersion(a);
    const [bMajor, bMinor, bPatch] = parseVersion(b);

    if (aMajor !== bMajor) return aMajor - bMajor;
    if (aMinor !== bMinor) return aMinor - bMinor;
    return aPatch - bPatch;
  }

  private isVersionSupported(version: string): boolean {
    return this.versioningConfig.supportedVersions.includes(version) ||
           this.versions.has(version);
  }

  private updateCompatibilityMatrix(version: ApiVersion): void {
    // 简化的兼容性计算
    const versionParts = this.parseVersionNumber(version.version);
    const compatibleVersions: string[] = [];
    const breakingVersions: string[] = [];

    for (const [existingVersion, existingVersionData] of this.versions.entries()) {
      if (existingVersion === version.version) continue;

      const existingParts = this.parseVersionNumber(existingVersion);
      
      // 主版本相同 = 向后兼容
      if (versionParts.major === existingParts.major) {
        if (versionParts.minor >= existingParts.minor) {
          compatibleVersions.push(existingVersion);
        }
      }
      
      // 主版本不同 = 破坏性变更
      if (versionParts.major !== existingParts.major) {
        breakingVersions.push(existingVersion);
      }
    }

    this.compatibilityMatrix[version.version] = {
      backwardCompatible: compatibleVersions,
      forwardCompatible: [],
      breakingChangesWith: breakingVersions,
      migrationRequired: breakingVersions
    };
  }

  private parseVersionNumber(version: string): { major: number; minor: number; patch: number } {
    const match = version.match(/^v?(\d+)\.?(\d+)?\.?(\d+)?$/);
    return {
      major: parseInt(match?.[1] || '0'),
      minor: parseInt(match?.[2] || '0'),
      patch: parseInt(match?.[3] || '0')
    };
  }

  private async loadVersionsFromDatabase(): Promise<void> {
    try {
      // 从数据库加载版本信息
      // 这里使用mock数据，实际项目中应该从数据库加载
      const mockVersions: ApiVersion[] = [
        {
          version: 'v1',
          majorVersion: 1,
          minorVersion: 0,
          patchVersion: 0,
          status: VersionStatus.STABLE,
          releaseDate: new Date('2024-01-01'),
          description: 'Initial stable release'
        },
        {
          version: 'v2',
          majorVersion: 2,
          minorVersion: 0,
          patchVersion: 0,
          status: VersionStatus.BETA,
          releaseDate: new Date('2024-06-01'),
          description: 'Major update with new features'
        }
      ];

      for (const version of mockVersions) {
        this.versions.set(version.version, version);
        this.updateCompatibilityMatrix(version);
      }

      this.logger.log(`Loaded ${mockVersions.length} API versions from database`);
    } catch (error) {
      this.logger.error('Failed to load versions from database:', error);
    }
  }

  private async saveVersionToDatabase(version: ApiVersion): Promise<void> {
    // 实际项目中应该保存到数据库
    // await this.prisma.apiVersion.upsert({ ... });
  }

  private async saveEndpointToDatabase(endpoint: ApiEndpointVersion): Promise<void> {
    // 实际项目中应该保存到数据库
    // await this.prisma.apiEndpoint.upsert({ ... });
  }

  private async saveUsageMetricsToDatabase(metrics: ApiUsageMetrics): Promise<void> {
    // 实际项目中应该保存到数据库
    // await this.prisma.apiUsageMetrics.create({ ... });
  }

  private startUsageTracking(): void {
    // 每小时聚合和清理使用统计
    setInterval(() => {
      this.aggregateUsageMetrics().catch(error => {
        this.logger.error('Failed to aggregate usage metrics:', error);
      });
    }, 60 * 60 * 1000); // 1 hour
  }

  private startDeprecationMonitoring(): void {
    // 每天检查废弃警告
    setInterval(() => {
      this.checkDeprecationAlerts().catch(error => {
        this.logger.error('Failed to check deprecation alerts:', error);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private async aggregateUsageMetrics(): Promise<void> {
    // 实现使用统计聚合逻辑
    this.logger.debug('Aggregating usage metrics');
  }

  private async checkDeprecationAlerts(): Promise<void> {
    const now = new Date();
    
    for (const [version, versionData] of this.versions.entries()) {
      if (versionData.status === VersionStatus.DEPRECATED && versionData.sunsetDate) {
        const daysUntilSunset = Math.ceil(
          (versionData.sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (this.versioningPolicy.deprecationWarningThresholds.includes(daysUntilSunset)) {
          const notice: ApiDeprecationNotice = {
            version,
            deprecationDate: versionData.deprecationDate!,
            sunsetDate: versionData.sunsetDate,
            reason: 'Scheduled sunset',
            severity: daysUntilSunset <= 7 ? 'critical' : daysUntilSunset <= 30 ? 'high' : 'medium'
          };

          await this.notifyClientsOfDeprecation(notice);
        }
      }
    }
  }

  private async notifyClientsOfDeprecation(notice: ApiDeprecationNotice): Promise<void> {
    this.eventEmitter.emit('api.deprecation.warning', notice);
    this.logger.warn(`Deprecation warning sent for version ${notice.version}`);
  }

  private async getDeprecationAlerts(): Promise<ApiDeprecationNotice[]> {
    const alerts: ApiDeprecationNotice[] = [];
    const now = new Date();

    for (const [version, versionData] of this.versions.entries()) {
      if (versionData.status === VersionStatus.DEPRECATED && versionData.sunsetDate) {
        const daysUntilSunset = Math.ceil(
          (versionData.sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilSunset <= 90) {
          alerts.push({
            version,
            deprecationDate: versionData.deprecationDate!,
            sunsetDate: versionData.sunsetDate,
            reason: 'Scheduled sunset',
            severity: daysUntilSunset <= 7 ? 'critical' : daysUntilSunset <= 30 ? 'high' : 'medium'
          });
        }
      }
    }

    return alerts;
  }

  private generateVersionRecommendations(
    versions: ApiVersion[],
    usageStats: ApiUsageMetrics[]
  ): string[] {
    const recommendations: string[] = [];

    // 检查版本使用分布
    const versionUsage = usageStats.reduce((usage, stats) => {
      usage[stats.version] = (usage[stats.version] || 0) + stats.requestCount;
      return usage;
    }, {} as Record<string, number>);

    const totalRequests = Object.values(versionUsage).reduce((sum, count) => sum + count, 0);
    
    // 如果旧版本使用量过高
    const v1Usage = versionUsage['v1'] || 0;
    if (v1Usage / totalRequests > 0.7) {
      recommendations.push('建议推动客户端升级到最新版本，v1版本使用量过高');
    }

    // 检查废弃版本
    const deprecatedVersions = versions.filter(v => v.status === VersionStatus.DEPRECATED);
    if (deprecatedVersions.length > 0) {
      recommendations.push(`存在${deprecatedVersions.length}个废弃版本，建议加速客户端迁移`);
    }

    // 检查版本数量
    if (versions.length > 3) {
      recommendations.push('同时维护的版本过多，建议合并或下线旧版本');
    }

    return recommendations;
  }
}