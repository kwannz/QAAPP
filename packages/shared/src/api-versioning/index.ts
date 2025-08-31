// API版本控制相关类型
export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  sunsetDate?: Date;
}

export interface VersionedEndpoint {
  path: string;
  versions: ApiVersion[];
}