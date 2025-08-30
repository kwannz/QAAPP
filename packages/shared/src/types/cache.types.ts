// 缓存相关类型定义

export enum CacheLayer {
  L1_MEMORY = 'L1_MEMORY',
  L2_REDIS = 'L2_REDIS',
  L3_CDN = 'L3_CDN'
}

export interface CacheStats {
  layer: CacheLayer;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  memoryUsage: number;
  operationsPerSecond: number;
}

export interface MultiLayerCacheConfig {
  l1: {
    ttl: number;
    maxMemoryMB: number;
    evictionPolicy: string;
    serialization: string;
  };
  l2: {
    ttl: number;
    cluster: boolean;
    keyPrefix: string;
    sharding: boolean;
    compression: boolean;
    serialization: string;
  };
  l3: {
    ttl: number;
    provider: string;
    regions: string[];
    compression: boolean;
    serialization: string;
  };
}

export enum CacheOperation {
  GET = 'GET',
  SET = 'SET',
  DELETE = 'DELETE',
  INVALIDATE = 'INVALIDATE'
}

export interface CacheKey {
  prefix: string;
  namespace: string;
  key: string;
  version?: string;
}

// 系统监控相关类型
export interface SystemStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheck[];
  metrics: SystemMetric[];
  activeAlerts: Alert[];
  uptime: number;
  version: string;
  lastUpdated: Date;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  lastCheck: Date;
}

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  service: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: any;
}
