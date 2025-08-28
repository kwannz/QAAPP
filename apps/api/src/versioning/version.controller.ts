import { 
  Controller, 
  Get, 
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiVersionService } from './version.service';
import { ApiMigrationService } from './migration.service';
import { VersionCompatibilityService } from './compatibility.service';
import { 
  ApiVersionParam,
  ClientVersionInfo 
} from './version.decorator';

@ApiTags('API Versioning')
@ApiBearerAuth()
@Controller('api/versioning')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VersionController {

  constructor(
    private versionService: ApiVersionService,
    private migrationService: ApiMigrationService,
    private compatibilityService: VersionCompatibilityService
  ) {}

  /**
   * 获取所有支持的API版本
   */
  @Get('versions')
  @ApiOperation({ summary: 'Get all supported API versions' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'API versions retrieved successfully'
  })
  async getSupportedVersions(): Promise<{
    current: string;
    supported: string[];
    deprecated: string[];
    beta: string[];
    versions: Array<{
      version: string;
      status: string;
      releaseDate: string;
      deprecationDate?: string;
      sunsetDate?: string;
      description?: string;
      changelog?: string[];
      breakingChanges?: string[];
    }>;
  }> {
    const versions = await this.versionService.getAllVersions();
    const config = this.versionService.getVersioningConfig();

    const categorized = {
      supported: [] as string[],
      deprecated: [] as string[],
      beta: [] as string[]
    };

    const versionDetails = versions.map(version => {
      // 分类版本
      switch (version.status) {
        case 'STABLE':
          categorized.supported.push(version.version);
          break;
        case 'DEPRECATED':
          categorized.deprecated.push(version.version);
          break;
        case 'BETA':
          categorized.beta.push(version.version);
          break;
      }

      return {
        version: version.version,
        status: version.status,
        releaseDate: version.releaseDate.toISOString(),
        deprecationDate: version.deprecationDate?.toISOString(),
        sunsetDate: version.sunsetDate?.toISOString(),
        description: version.description,
        changelog: version.changelog,
        breakingChanges: version.breakingChanges
      };
    });

    return {
      current: config.defaultVersion,
      supported: categorized.supported,
      deprecated: categorized.deprecated,
      beta: categorized.beta,
      versions: versionDetails
    };
  }

  /**
   * 获取客户端版本兼容性信息
   */
  @Get('compatibility/:version')
  @ApiOperation({ summary: 'Get version compatibility information' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Compatibility information retrieved'
  })
  async getVersionCompatibility(
    @Param('version') version: string
  ): Promise<{
    version: string;
    isSupported: boolean;
    compatibilityLevel: string;
    backwardCompatible: string[];
    forwardCompatible: string[];
    breakingChangesWith: string[];
    migrationRequired: string[];
    recommendations: string[];
  }> {
    const compatibility = await this.compatibilityService.checkCompatibility(version);
    const recommendations = await this.compatibilityService.getRecommendations(version);

    return {
      version,
      isSupported: compatibility.isSupported,
      compatibilityLevel: compatibility.level,
      backwardCompatible: compatibility.backwardCompatible,
      forwardCompatible: compatibility.forwardCompatible,
      breakingChangesWith: compatibility.breakingChangesWith,
      migrationRequired: compatibility.migrationRequired,
      recommendations
    };
  }

  /**
   * 获取API使用统计
   */
  @Get('usage/stats')
  @ApiOperation({ summary: 'Get API version usage statistics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Usage statistics retrieved'
  })
  @Roles('admin', 'developer')
  async getUsageStats(
    @Query('version') version?: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'month',
    @Query('groupBy') groupBy: 'version' | 'endpoint' | 'client' = 'version'
  ): Promise<{
    period: string;
    totalRequests: number;
    versionBreakdown: Record<string, {
      requests: number;
      percentage: number;
      uniqueClients: number;
      averageResponseTime: number;
      errorRate: number;
    }>;
    topEndpoints: Array<{
      endpoint: string;
      method: string;
      version: string;
      requests: number;
    }>;
    clientDistribution: Array<{
      clientId: string;
      userAgent?: string;
      requests: number;
      versions: string[];
      lastActivity: string;
    }>;
  }> {
    const stats = await this.versionService.getUsageAnalytics({
      version,
      period,
      groupBy
    });

    return stats;
  }

  /**
   * 生成迁移计划
   */
  @Post('migration/plan')
  @ApiOperation({ summary: 'Generate migration plan between versions' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Migration plan generated'
  })
  @Roles('admin', 'developer')
  async generateMigrationPlan(
    @Body() request: {
      fromVersion: string;
      toVersion: string;
      includeBreakingChanges?: boolean;
      includeDataMigration?: boolean;
    }
  ): Promise<{
    fromVersion: string;
    toVersion: string;
    complexity: 'low' | 'medium' | 'high';
    estimatedTime: number;
    breakingChanges: Array<{
      type: string;
      description: string;
      impact: string;
      solution: string;
    }>;
    migrationSteps: Array<{
      step: number;
      name: string;
      description: string;
      type: 'code' | 'data' | 'config';
      estimatedTime: number;
      dependencies: number[];
      validation: string;
    }>;
    rollbackPlan: string[];
    testingRecommendations: string[];
  }> {
    const plan = await this.migrationService.generateMigrationPlan(
      request.fromVersion,
      request.toVersion,
      {
        includeBreakingChanges: request.includeBreakingChanges ?? true,
        includeDataMigration: request.includeDataMigration ?? true
      }
    );

    return plan;
  }

  /**
   * 检查API健康状况
   */
  @Get('health')
  @ApiOperation({ summary: 'Get API versioning health status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Health status retrieved'
  })
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    version: string;
    timestamp: string;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
      affectedVersions: string[];
    }>;
    metrics: {
      totalVersions: number;
      activeVersions: number;
      deprecatedVersions: number;
      averageResponseTime: number;
      errorRate: number;
    };
    recommendations: string[];
  }> {
    const health = await this.versionService.getVersionHealthReport();
    
    // 确定整体健康状态
    const criticalIssues = health.deprecationAlerts.filter(alert => 
      alert.severity === 'critical'
    ).length;
    
    const highIssues = health.deprecationAlerts.filter(alert => 
      alert.severity === 'high'
    ).length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalIssues > 0) {
      status = 'critical';
    } else if (highIssues > 0 || health.metrics.successRate < 95) {
      status = 'warning';
    }

    const issues = health.deprecationAlerts.map(alert => ({
      type: 'deprecation',
      severity: alert.severity,
      message: `Version ${alert.version}: ${alert.reason}`,
      affectedVersions: [alert.version]
    }));

    return {
      status,
      version: 'v2.0.0', // 版本服务本身的版本
      timestamp: new Date().toISOString(),
      issues,
      metrics: {
        totalVersions: health.totalVersions,
        activeVersions: health.activeVersions,
        deprecatedVersions: health.deprecatedVersions,
        averageResponseTime: health.metrics.averageResponseTime || 0,
        errorRate: (100 - health.metrics.successRate) || 0
      },
      recommendations: health.recommendations
    };
  }

  /**
   * 获取版本变更历史
   */
  @Get('changelog')
  @ApiOperation({ summary: 'Get API version changelog' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Changelog retrieved'
  })
  async getChangelog(
    @Query('version') version?: string,
    @Query('limit') limit: number = 50
  ): Promise<{
    changes: Array<{
      version: string;
      releaseDate: string;
      type: 'major' | 'minor' | 'patch';
      changes: Array<{
        type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed';
        description: string;
        endpoint?: string;
        breakingChange: boolean;
      }>;
      migrationNotes?: string[];
    }>;
  }> {
    const changelog = await this.versionService.getChangelog(version, limit);
    return { changes: changelog };
  }

  /**
   * 订阅版本更新通知
   */
  @Post('notifications/subscribe')
  @ApiOperation({ summary: 'Subscribe to version update notifications' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Subscription created'
  })
  @Roles('user', 'admin', 'developer')
  async subscribeToNotifications(
    @Body() subscription: {
      email?: string;
      webhook?: string;
      events: Array<'deprecation' | 'sunset' | 'new-version' | 'breaking-change'>;
      versions?: string[]; // 可选：只订阅特定版本
    },
    @CurrentUser() user: any,
    @ClientVersionInfo() clientInfo: any
  ): Promise<{
    subscriptionId: string;
    message: string;
    subscribedEvents: string[];
  }> {
    const subscriptionId = await this.versionService.createNotificationSubscription({
      userId: user.id,
      email: subscription.email || user.email,
      webhook: subscription.webhook,
      events: subscription.events,
      versions: subscription.versions,
      clientInfo
    });

    return {
      subscriptionId,
      message: 'Successfully subscribed to version notifications',
      subscribedEvents: subscription.events
    };
  }

  /**
   * 获取客户端当前使用的版本信息
   */
  @Get('client/info')
  @ApiOperation({ summary: 'Get current client version information' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Client information retrieved'
  })
  async getClientVersionInfo(
    @ApiVersionParam() version: string,
    @ClientVersionInfo() clientInfo: any
  ): Promise<{
    requestedVersion: string;
    resolvedVersion: string;
    isDeprecated: boolean;
    supportStatus: string;
    recommendations: string[];
    migrationPath?: {
      targetVersion: string;
      complexity: string;
      estimatedEffort: string;
    };
  }> {
    const versionData = await this.versionService.getVersionData(version);
    const recommendations = await this.compatibilityService.getRecommendations(version);
    
    let migrationPath;
    if (versionData?.status === 'DEPRECATED') {
      const latestVersion = await this.versionService.getLatestVersion();
      const plan = await this.migrationService.generateMigrationPlan(version, latestVersion);
      migrationPath = {
        targetVersion: latestVersion,
        complexity: plan.complexity,
        estimatedEffort: `${plan.estimatedTime} hours`
      };
    }

    return {
      requestedVersion: version,
      resolvedVersion: version,
      isDeprecated: versionData?.status === 'DEPRECATED',
      supportStatus: versionData?.status || 'UNKNOWN',
      recommendations,
      migrationPath
    };
  }
}