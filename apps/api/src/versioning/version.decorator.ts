import { SetMetadata, applyDecorators, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiOperation } from '@nestjs/swagger';

export const API_VERSION_METADATA_KEY = 'api:version';
export const API_ENDPOINT_VERSION_METADATA_KEY = 'api:endpoint:version';
export const API_DEPRECATED_METADATA_KEY = 'api:deprecated';
export const API_VERSION_SINCE_METADATA_KEY = 'api:version:since';
export const API_VERSION_UNTIL_METADATA_KEY = 'api:version:until';

/**
 * API版本装饰器 - 标记控制器或方法的版本
 */
export function ApiVersion(version: string | string[]) {
  const versions = Array.isArray(version) ? version : [version];
  return SetMetadata(API_VERSION_METADATA_KEY, versions);
}

/**
 * API端点版本装饰器 - 详细的端点版本配置
 */
export function ApiEndpointVersion(config: {
  version: string;
  since?: string;
  until?: string;
  deprecated?: boolean;
  alternativeEndpoint?: string;
  description?: string;
}) {
  const decorators = [
    SetMetadata(API_ENDPOINT_VERSION_METADATA_KEY, config)
  ];

  // 添加Swagger文档
  if (config.description) {
    decorators.push(ApiOperation({ 
      summary: config.description,
      description: `Available since version ${config.since || config.version}${config.until ? `, deprecated since ${config.until}` : ''}`
    }));
  }

  // 如果标记为废弃
  if (config.deprecated) {
    decorators.push(
      SetMetadata(API_DEPRECATED_METADATA_KEY, {
        deprecated: true,
        alternativeEndpoint: config.alternativeEndpoint,
        deprecatedSince: config.until
      })
    );

    // 添加废弃响应头文档
    decorators.push(
      ApiHeader({
        name: 'API-Deprecated',
        description: 'Indicates this endpoint is deprecated',
        required: false
      }),
      ApiResponse({
        status: 200,
        description: 'Success (Deprecated endpoint)',
        headers: {
          'API-Deprecated': {
            description: 'Indicates this endpoint is deprecated',
            schema: { type: 'string', example: 'true' }
          },
          'API-Sunset-Date': {
            description: 'Date when this endpoint will be removed',
            schema: { type: 'string', format: 'date-time' }
          },
          'API-Alternative-Version': {
            description: 'Recommended alternative version',
            schema: { type: 'string', example: 'v2' }
          }
        }
      })
    );
  }

  return applyDecorators(...decorators);
}

/**
 * API版本范围装饰器 - 指定版本支持范围
 */
export function ApiVersionRange(since: string, until?: string) {
  const decorators = [
    SetMetadata(API_VERSION_SINCE_METADATA_KEY, since)
  ];

  if (until) {
    decorators.push(SetMetadata(API_VERSION_UNTIL_METADATA_KEY, until));
  }

  return applyDecorators(...decorators);
}

/**
 * API废弃装饰器 - 标记端点已废弃
 */
export function ApiDeprecated(config?: {
  since?: string;
  until?: string;
  alternativeEndpoint?: string;
  reason?: string;
}) {
  return applyDecorators(
    SetMetadata(API_DEPRECATED_METADATA_KEY, {
      deprecated: true,
      ...config
    }),
    ApiHeader({
      name: 'API-Deprecated',
      description: 'This endpoint is deprecated',
      required: false
    }),
    ApiResponse({
      status: 200,
      description: 'Success (Deprecated endpoint)',
      headers: {
        'API-Deprecated': {
          description: 'Indicates this endpoint is deprecated',
          schema: { type: 'string', example: 'true' }
        }
      }
    })
  );
}

/**
 * 版本兼容装饰器 - 标记向后兼容的版本
 */
export function ApiVersionCompatible(versions: string[]) {
  return SetMetadata('api:version:compatible', versions);
}

/**
 * 破坏性变更装饰器 - 标记包含破坏性变更的版本
 */
export function ApiBreakingChange(version: string, changes: string[]) {
  return SetMetadata('api:breaking:change', {
    version,
    changes
  });
}

/**
 * 参数装饰器：获取当前API版本
 */
export const ApiVersionParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.apiVersion || 'v1';
  }
);

/**
 * 参数装饰器：获取客户端版本信息
 */
export const ClientVersionInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.clientInfo;
  }
);

/**
 * 参数装饰器：获取版本元数据
 */
export const VersionMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.versioningMetadata;
  }
);

/**
 * 组合装饰器：完整的版本化端点
 */
export function VersionedEndpoint(config: {
  version: string | string[];
  since?: string;
  until?: string;
  deprecated?: boolean;
  alternativeEndpoint?: string;
  description?: string;
  breakingChanges?: string[];
}) {
  const decorators = [
    ApiVersion(config.version),
    ApiEndpointVersion({
      version: Array.isArray(config.version) ? config.version[0] : config.version,
      since: config.since,
      until: config.until,
      deprecated: config.deprecated,
      alternativeEndpoint: config.alternativeEndpoint,
      description: config.description
    })
  ];

  if (config.breakingChanges && config.breakingChanges.length > 0) {
    decorators.push(
      ApiBreakingChange(
        Array.isArray(config.version) ? config.version[0] : config.version,
        config.breakingChanges
      )
    );
  }

  if (config.since && config.until) {
    decorators.push(ApiVersionRange(config.since, config.until));
  }

  return applyDecorators(...decorators);
}

/**
 * 实验性API装饰器
 */
export function ApiExperimental(config?: {
  description?: string;
  stableVersion?: string;
}) {
  return applyDecorators(
    SetMetadata('api:experimental', true),
    ApiHeader({
      name: 'API-Experimental',
      description: 'This is an experimental endpoint',
      required: false
    }),
    ApiResponse({
      status: 200,
      description: 'Success (Experimental endpoint)',
      headers: {
        'API-Experimental': {
          description: 'Indicates this is an experimental endpoint',
          schema: { type: 'string', example: 'true' }
        },
        'API-Stable-Alternative': {
          description: 'Stable alternative version if available',
          schema: { type: 'string', example: 'v2' }
        }
      }
    }),
    ...(config?.description ? [ApiOperation({
      summary: config.description,
      description: 'This is an experimental API endpoint. Use with caution in production.'
    })] : [])
  );
}

/**
 * Beta API装饰器
 */
export function ApiBeta(config?: {
  version?: string;
  description?: string;
  stableDate?: string;
}) {
  return applyDecorators(
    SetMetadata('api:beta', {
      version: config?.version,
      stableDate: config?.stableDate
    }),
    ApiHeader({
      name: 'API-Beta',
      description: 'This is a beta endpoint',
      required: false
    }),
    ApiResponse({
      status: 200,
      description: 'Success (Beta endpoint)',
      headers: {
        'API-Beta': {
          description: 'Indicates this is a beta endpoint',
          schema: { type: 'string', example: 'true' }
        }
      }
    }),
    ...(config?.description ? [ApiOperation({
      summary: config.description,
      description: `Beta endpoint${config.stableDate ? ` (expected stable: ${config.stableDate})` : ''}`
    })] : [])
  );
}

/**
 * 内部API装饰器 - 仅供内部使用
 */
export function ApiInternal(config?: {
  description?: string;
  allowedClients?: string[];
}) {
  return applyDecorators(
    SetMetadata('api:internal', {
      allowedClients: config?.allowedClients
    }),
    ApiHeader({
      name: 'X-Internal-API',
      description: 'Internal API access token',
      required: true
    }),
    ...(config?.description ? [ApiOperation({
      summary: `${config.description} (Internal API)`,
      description: 'This endpoint is for internal use only and requires special authentication.'
    })] : [])
  );
}