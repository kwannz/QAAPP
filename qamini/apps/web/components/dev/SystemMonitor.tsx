'use client';

import { AlertCircle, Activity, Database, Zap, Server, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import apiClient, { monitoringApi } from '@/lib/api-client';

interface PerformanceMetrics {
  memory: {
    heapUsed: number
    heapTotal: number
    usagePercent: number
    redis: {
      used: number
      fragmentation: number
    }
  }
  responseTimes: {
    average: number
    p95: number
    p99: number
  }
  cache: {
    health: {
      l1: boolean
      l2: boolean
      l3: boolean
    }
    stats: Array<{
      layer: string
      hitRate: number
      memoryUsage: number
    }>
  }
  database: {
    queryTimes: {
      average: number
      p95: number
    }
    slowQueries: number
  }
  requests: {
    total: number
  }
  uptime: number
  timestamp: string
}

interface RealTimeMetrics {
  performance: {
    responseTime: {
      current: number
      average: number
      p95: number
    }
    memory: {
      usagePercent: number
    }
    cache: {
      hitRate: number
    }
    database: {
      slowQueries: number
    }
  }
  timestamp: number
}

interface ApiEndpoint {
  name: string
  url: string
  status: 'checking' | 'online' | 'offline' | 'error'
  responseTime?: number
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: '后端健康', url: '/health', status: 'checking' },
    { name: '产品API', url: '/api/products', status: 'checking' },
    { name: '认证API', url: '/api/auth/health', status: 'checking' },
  ]);
  const [clientUrl, setClientUrl] = useState('http://localhost:3002');

  const checkEndpoint = async (endpoint: ApiEndpoint): Promise<ApiEndpoint> => {
    const startTime = Date.now();
    try {
      const baseURL = (apiClient.defaults.baseURL || '');
      const rootURL = baseURL.replace(/\/?api\/?$/, '') || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

      // 对于以 /api 开头的端点，使用 apiClient；否则使用根URL
      await (endpoint.url.startsWith('/api') ? apiClient.get(endpoint.url.replace('/api', '')) : fetch(`${rootURL}${endpoint.url}`, { method: 'GET' }));
      const responseTime = Date.now() - startTime;
      return { ...endpoint, status: 'online', responseTime };
    } catch {
      return { ...endpoint, status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // 使用 monitoring/performance（已标记弃用但保持兼容），后续可迁移至 /monitoring/metrics
        const { data } = await monitoringApi.getDashboard('24h');

        // 将 dashboard 的相关字段映射至当前视图（简化处理）
        setMetrics({
          memory: {
            heapUsed: data?.system?.memoryUsed || 0,
            heapTotal: data?.system?.memoryTotal || 0,
            usagePercent: data?.system?.memory || 0,
            redis: { used: data?.cache?.redisUsed || 0, fragmentation: data?.cache?.fragmentation || 0 },
          },
          responseTimes: {
            average: data?.performance?.apiLatency || 0,
            p95: data?.performance?.p95 || 0,
            p99: data?.performance?.p99 || 0,
          },
          cache: {
            health: { l1: true, l2: true, l3: true },
            stats: [
              { layer: 'L1_MEMORY', hitRate: Math.round((data?.performance?.cacheHitRate || 0) * 100), memoryUsage: 0 },
              { layer: 'L2_REDIS', hitRate: Math.round((data?.performance?.cacheHitRate || 0) * 100), memoryUsage: 0 },
              { layer: 'L3_CDN', hitRate: 0, memoryUsage: 0 },
            ],
          },
          database: {
            queryTimes: { average: data?.performance?.dbQueryAvg || 0, p95: data?.performance?.dbQueryP95 || 0 },
            slowQueries: data?.performance?.slowQueries || 0,
          },
          requests: { total: data?.requests?.total || 0 },
          uptime: data?.system?.uptimeSeconds || 0,
          timestamp: new Date().toISOString(),
        } as any);
        setIsConnected(true);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        setIsConnected(false);
      }
    };

    const fetchRealTime = async () => {
      try {
        // 保留原开发路径；后续若接入 SSE，可改用 EventSource('/monitoring/realtime')
        const response = await fetch('/api/performance/realtime');
        if (response.ok) {
          const data = await response.json();
          setRealTimeData(data);
        }
      } catch (error) {
        console.error('Failed to fetch real-time metrics:', error);
      }
    };

    const checkAllEndpoints = async () => {
      const results = await Promise.all(endpoints.map(checkEndpoint));
      setEndpoints(results);
    };

    // Initial fetch
    fetchMetrics();
    fetchRealTime();
    checkAllEndpoints();

    // Set up intervals
    const metricsInterval = setInterval(fetchMetrics, 30_000); // 30s
    const realTimeInterval = setInterval(fetchRealTime, 5000); // 5s
    const endpointsInterval = setInterval(checkAllEndpoints, 30_000); // 30s

    return () => {
      clearInterval(metricsInterval);
      clearInterval(realTimeInterval);
      clearInterval(endpointsInterval);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientUrl(window.location.origin);
    }
  }, []);

  const getStatusBadge = (value: number, thresholds: { good: number, warning: number }) => {
    if (value <= thresholds.good) {
      return <Badge className="bg-green-100 text-green-800">优秀</Badge>;
    } else if (value <= thresholds.warning) {
      return <Badge className="bg-yellow-100 text-yellow-800">警告</Badge>;
    }
      return <Badge className="bg-red-100 text-red-800">严重</Badge>;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemorySize = (bytes: number) => {
    return `${bytes}MB`;
  };

  const getStatusIcon = (status: ApiEndpoint['status']) => {
    switch (status) {
      case 'online': {
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      }
      case 'offline': {
        return <XCircle className="w-3 h-3 text-red-500" />;
      }
      case 'error': {
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      }
      case 'checking': {
        return <Activity className="w-3 h-3 text-orange-500 animate-pulse" />;
      }
      default: {
        return <Activity className="w-3 h-3 text-gray-500" />;
      }
    }
  };

  const getStatusText = (endpoint: ApiEndpoint) => {
    switch (endpoint.status) {
      case 'online': {
        return `正常 (${endpoint.responseTime}ms)`;
      }
      case 'offline': {
        return '离线';
      }
      case 'error': {
        return '错误';
      }
      case 'checking': {
        return '检查中...';
      }
      default: {
        return '未知';
      }
    }
  };

  const overallStatus = endpoints.every(e => e.status === 'online')
? 'online'
                      : (endpoints.some(e => e.status === 'online') ? 'partial' : 'offline');

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-4 h-4 animate-spin" />
            <span>加载系统监控数据...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* API状态栏 */}
      <div className="flex items-center gap-4 text-xs p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-1">
          {overallStatus === 'online'
? (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          )
: (overallStatus === 'partial'
? (
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          )
: (
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          ))}
          <span className="text-gray-600">系统状态: </span>
          <span className={
            overallStatus === 'online'
? 'text-green-600'
            : (overallStatus === 'partial' ? 'text-yellow-600' : 'text-red-600')
          }
          >
            {overallStatus === 'online' ? '正常' : (overallStatus === 'partial' ? '部分可用' : '异常')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="flex items-center gap-1">
              {getStatusIcon(endpoint.status)}
              <span className="text-gray-500">
                {endpoint.name}: {getStatusText(endpoint)}
              </span>
            </div>
          ))}
        </div>

        <div className="text-gray-400 border-l pl-2">
          API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} | Web: {clientUrl}
        </div>
      </div>

      {/* 连接状态 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统性能监控</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? '已连接' : '连接断开'}
            {lastUpdate && ` • 最后更新: ${lastUpdate.toLocaleTimeString()}`}
          </span>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 响应时间 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              响应时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTimes.average}ms</div>
            <div className="text-xs text-gray-600 mt-1">
              P95: {metrics.responseTimes.p95}ms • P99: {metrics.responseTimes.p99}ms
            </div>
            {getStatusBadge(metrics.responseTimes.p95, { good: 200, warning: 500 })}
          </CardContent>
        </Card>

        {/* 内存使用 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Server className="w-4 h-4 mr-2" />
              内存使用
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory.usagePercent}%</div>
            <div className="text-xs text-gray-600 mt-1">
              {formatMemorySize(metrics.memory.heapUsed)} / {formatMemorySize(metrics.memory.heapTotal)}
            </div>
            {getStatusBadge(metrics.memory.usagePercent, { good: 70, warning: 85 })}
          </CardContent>
        </Card>

        {/* 缓存命中率 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              缓存命中率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cache.stats[0]?.hitRate || 0}%
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Redis: {metrics.cache.health.l2 ? '正常' : '异常'} •
              L1: {formatMemorySize(metrics.cache.stats[0]?.memoryUsage || 0)}
            </div>
            {getStatusBadge(100 - (metrics.cache.stats[0]?.hitRate || 0), { good: 40, warning: 60 })}
          </CardContent>
        </Card>

        {/* 数据库性能 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="w-4 h-4 mr-2" />
              数据库性能
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.queryTimes.average}ms</div>
            <div className="text-xs text-gray-600 mt-1">
              P95: {metrics.database.queryTimes.p95}ms • 慢查询: {metrics.database.slowQueries}
            </div>
            {getStatusBadge(metrics.database.queryTimes.p95, { good: 100, warning: 300 })}
          </CardContent>
        </Card>
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">运行时间</div>
                <div className="text-lg font-semibold">{formatUptime(metrics.uptime)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">总请求数</div>
                <div className="text-lg font-semibold">{metrics.requests.total.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Redis 内存</div>
                <div className="text-lg font-semibold">{formatMemorySize(metrics.memory.redis.used)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">内存碎片率</div>
                <div className="text-lg font-semibold">{metrics.memory.redis.fragmentation.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 缓存层状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              多层缓存状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">L1 内存缓存</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={metrics.cache.health.l1 ? 'default' : 'destructive'}>
                    {metrics.cache.health.l1 ? '正常' : '异常'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {metrics.cache.stats.find(s => s.layer === 'L1_MEMORY')?.hitRate || 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">L2 Redis缓存</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={metrics.cache.health.l2 ? 'default' : 'destructive'}>
                    {metrics.cache.health.l2 ? '正常' : '异常'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {metrics.cache.stats.find(s => s.layer === 'L2_REDIS')?.hitRate || 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">L3 CDN缓存</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={metrics.cache.health.l3 ? 'default' : 'destructive'}>
                    {metrics.cache.health.l3 ? '正常' : '异常'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {metrics.cache.stats.find(s => s.layer === 'L3_CDN')?.hitRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 实时指标 */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              实时指标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">当前响应时间</div>
                <div className="text-xl font-bold text-blue-600">
                  {realTimeData.performance.responseTime.current}ms
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">内存使用率</div>
                <div className="text-xl font-bold text-green-600">
                  {realTimeData.performance.memory.usagePercent}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">缓存命中率</div>
                <div className="text-xl font-bold text-purple-600">
                  {realTimeData.performance.cache.hitRate}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">慢查询数</div>
                <div className="text-xl font-bold text-orange-600">
                  {realTimeData.performance.database.slowQueries}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能警告 */}
      {(metrics.responseTimes.p95 > 500
        || metrics.memory.usagePercent > 80
        || metrics.database.slowQueries > 5) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              性能警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-yellow-700">
              {metrics.responseTimes.p95 > 500 && (
                <li>• API 响应时间偏高 (P95: {metrics.responseTimes.p95}ms)</li>
              )}
              {metrics.memory.usagePercent > 80 && (
                <li>• 内存使用率过高 ({metrics.memory.usagePercent}%)</li>
              )}
              {metrics.database.slowQueries > 5 && (
                <li>• 检测到 {metrics.database.slowQueries} 个慢查询</li>
              )}
              {!metrics.cache.health.l2 && (
                <li>• Redis 缓存连接异常</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
