import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiVersionService } from './version.service';
import { ClientVersionInfo, ApiVersioningStrategy } from '@qa-app/shared';

interface VersionedRequest extends Request {
  apiVersion?: string;
  clientInfo?: ClientVersionInfo;
  versioningMetadata?: {
    strategy: ApiVersioningStrategy;
    originalVersion?: string;
    resolvedVersion: string;
    isDeprecated: boolean;
    deprecationWarning?: string;
  };
}

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiVersionMiddleware.name);

  constructor(private versionService: ApiVersionService) {}

  use(req: VersionedRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();

    try {
      // 解析客户端版本请求
      const requestedVersion = this.versionService.parseClientVersion(req);
      
      // 提取客户端信息
      const clientInfo: ClientVersionInfo = {
        userAgent: req.headers['user-agent'],
        clientId: this.extractClientId(req),
        preferredVersion: requestedVersion
      };

      // 设置请求上下文
      req.apiVersion = requestedVersion;
      req.clientInfo = clientInfo;
      req.versioningMetadata = {
        strategy: this.getVersioningStrategy(),
        originalVersion: requestedVersion,
        resolvedVersion: requestedVersion,
        isDeprecated: false
      };

      // 检查版本状态
      this.checkVersionStatus(req, res);

      // 设置响应头
      this.setVersionHeaders(res, requestedVersion);

      // 监听响应完成
      res.on('finish', () => {
        this.recordUsage(req, res, Date.now() - startTime);
      });

      next();

    } catch (error) {
      this.logger.error('Version middleware error:', error);
      
      // 版本错误处理
      res.status(400).json({
        error: 'Invalid API Version',
        message: error.message,
        supportedVersions: this.getSupportedVersions()
      });
    }
  }

  /**
   * 检查版本状态并设置警告
   */
  private checkVersionStatus(req: VersionedRequest, res: Response): void {
    const version = req.apiVersion!;
    const versionData = this.versionService.getVersionData(version);

    if (!versionData) {
      return;
    }

    // 检查是否废弃
    if (versionData.status === 'DEPRECATED') {
      req.versioningMetadata!.isDeprecated = true;
      
      const deprecationMessage = this.buildDeprecationMessage(versionData);
      req.versioningMetadata!.deprecationWarning = deprecationMessage;

      // 设置废弃警告头
      res.setHeader('API-Deprecated', 'true');
      res.setHeader('API-Deprecation-Date', versionData.deprecationDate?.toISOString() || '');
      res.setHeader('API-Sunset-Date', versionData.sunsetDate?.toISOString() || '');
      res.setHeader('API-Deprecation-Message', deprecationMessage);
      
      if (versionData.alternativeVersion) {
        res.setHeader('API-Alternative-Version', versionData.alternativeVersion);
      }

      // 记录废弃版本使用
      this.logger.warn(`Deprecated API version used: ${version}`, {
        userAgent: req.clientInfo?.userAgent,
        clientId: req.clientInfo?.clientId,
        endpoint: `${req.method} ${req.path}`
      });
    }

    // 检查即将下线
    if (versionData.sunsetDate) {
      const daysUntilSunset = Math.ceil(
        (versionData.sunsetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilSunset <= 90) {
        res.setHeader('API-Sunset-Warning', `API will be sunset in ${daysUntilSunset} days`);
        
        if (daysUntilSunset <= 30) {
          this.logger.warn(`API sunset approaching: ${version} (${daysUntilSunset} days remaining)`);
        }
      }
    }
  }

  /**
   * 设置版本相关响应头
   */
  private setVersionHeaders(res: Response, version: string): void {
    res.setHeader('API-Version', version);
    res.setHeader('API-Version-Strategy', this.getVersioningStrategy());
    res.setHeader('API-Supported-Versions', this.getSupportedVersions().join(', '));
  }

  /**
   * 记录API使用情况
   */
  private recordUsage(req: VersionedRequest, res: Response, responseTime: number): void {
    const version = req.apiVersion!;
    const endpoint = this.normalizeEndpoint(req.path);
    const method = req.method;
    const clientInfo = req.clientInfo!;
    const statusCode = res.statusCode;

    // 异步记录，不影响响应性能
    this.versionService.recordApiUsage(
      version,
      endpoint,
      method,
      clientInfo,
      responseTime,
      statusCode
    ).catch(error => {
      this.logger.error('Failed to record API usage:', error);
    });
  }

  /**
   * 提取客户端ID
   */
  private extractClientId(req: Request): string | undefined {
    // 尝试从多个源提取客户端ID
    return (
      req.headers['x-client-id'] as string ||
      req.headers['x-app-id'] as string ||
      req.headers['x-api-key'] as string ||
      this.extractClientIdFromToken(req) ||
      undefined
    );
  }

  /**
   * 从JWT Token提取客户端ID
   */
  private extractClientIdFromToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }

    try {
      const token = authHeader.substring(7);
      // 这里应该解析JWT token获取client_id
      // 简化实现，实际项目中需要验证和解析JWT
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.client_id || payload.sub;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * 构建废弃消息
   */
  private buildDeprecationMessage(versionData: any): string {
    let message = `API version ${versionData.version} is deprecated`;
    
    if (versionData.deprecationDate) {
      message += ` since ${versionData.deprecationDate.toDateString()}`;
    }
    
    if (versionData.sunsetDate) {
      message += ` and will be sunset on ${versionData.sunsetDate.toDateString()}`;
    }
    
    if (versionData.alternativeVersion) {
      message += `. Please migrate to ${versionData.alternativeVersion}`;
    }
    
    return message;
  }

  /**
   * 规范化端点路径
   */
  private normalizeEndpoint(path: string): string {
    // 移除版本前缀和参数
    return path
      .replace(/\/api\/v\d+(\.\d+)?(\.\d+)?/, '')
      .replace(/\/\d+/g, '/:id')
      .replace(/\?.*/, '');
  }

  /**
   * 获取版本策略
   */
  private getVersioningStrategy(): ApiVersioningStrategy {
    return this.versionService.getVersioningConfig().strategy;
  }

  /**
   * 获取支持的版本列表
   */
  private getSupportedVersions(): string[] {
    return this.versionService.getVersioningConfig().supportedVersions;
  }
}

/**
 * 版本化响应拦截器
 */
@Injectable()
export class VersionedResponseInterceptor {
  private readonly logger = new Logger(VersionedResponseInterceptor.name);

  constructor(private versionService: ApiVersionService) {}

  intercept(req: VersionedRequest, res: Response, data: any): any {
    const version = req.apiVersion;
    const endpoint = req.path;
    
    if (!version) {
      return data;
    }

    try {
      // 应用版本特定的响应转换
      const transformedData = this.transformResponseForVersion(data, version, endpoint);
      
      // 添加版本元数据
      const versionedResponse = {
        ...transformedData,
        _meta: {
          version,
          timestamp: new Date().toISOString(),
          ...(req.versioningMetadata?.isDeprecated && {
            deprecation: {
              deprecated: true,
              message: req.versioningMetadata.deprecationWarning,
              alternativeVersion: this.getAlternativeVersion(version)
            }
          })
        }
      };

      return versionedResponse;

    } catch (error) {
      this.logger.error('Response transformation error:', error);
      return data;
    }
  }

  /**
   * 为特定版本转换响应数据
   */
  private transformResponseForVersion(data: any, version: string, endpoint: string): any {
    // 根据版本应用不同的数据转换规则
    switch (version) {
      case 'v1':
        return this.transformForV1(data, endpoint);
      case 'v2':
        return this.transformForV2(data, endpoint);
      default:
        return data;
    }
  }

  /**
   * V1版本数据转换
   */
  private transformForV1(data: any, endpoint: string): any {
    if (!data) return data;

    // 用户数据转换示例
    if (endpoint.includes('/users')) {
      return this.transformUserDataForV1(data);
    }

    // 订单数据转换示例
    if (endpoint.includes('/orders')) {
      return this.transformOrderDataForV1(data);
    }

    return data;
  }

  /**
   * V2版本数据转换
   */
  private transformForV2(data: any, endpoint: string): any {
    // V2版本通常是最新格式，无需转换
    return data;
  }

  /**
   * V1用户数据格式转换
   */
  private transformUserDataForV1(data: any): any {
    if (Array.isArray(data)) {
      return data.map(user => this.transformSingleUserForV1(user));
    }
    
    return this.transformSingleUserForV1(data);
  }

  private transformSingleUserForV1(user: any): any {
    if (!user) return user;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      // V1版本没有phone字段
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      // V1版本使用下划线命名
      profile: user.profile ? {
        first_name: user.profile.firstName,
        last_name: user.profile.lastName,
        avatar_url: user.profile.avatarUrl
      } : null
    };
  }

  /**
   * V1订单数据格式转换
   */
  private transformOrderDataForV1(data: any): any {
    if (Array.isArray(data)) {
      return data.map(order => this.transformSingleOrderForV1(order));
    }
    
    return this.transformSingleOrderForV1(data);
  }

  private transformSingleOrderForV1(order: any): any {
    if (!order) return order;

    return {
      id: order.id,
      user_id: order.userId,
      position_id: order.positionId,
      amount: order.amount,
      price: order.price,
      status: order.status,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      // V1版本没有某些新字段
      total: order.amount * order.price
    };
  }

  /**
   * 获取替代版本
   */
  private getAlternativeVersion(currentVersion: string): string | undefined {
    // 简单的版本映射逻辑
    const versionMap: Record<string, string> = {
      'v1': 'v2',
      'v1.0': 'v2.0'
    };
    
    return versionMap[currentVersion];
  }
}