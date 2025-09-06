'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Wifi,
  HardDrive,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

import { MetricsCard, SystemHealthCard, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { monitoringApi } from '@/lib/api-client';

import { AdminGuard } from '../../../components/admin/AdminGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { TabContainer } from '../../../components/common/TabContainer';


interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  activeConnections: number
  responseTime: number
  errorRate: number
}

interface BusinessMetrics {
  totalRevenue: number
  dailyRevenue: number
  totalOrders: number
  activeUsers: number
  conversionRate: number
  avgOrderValue: number
  returnRate: number
  customerSatisfaction: number
}

interface PerformanceMetrics {
  apiLatency: number
  dbQueries: number
  cacheHitRate: number
  throughput: number
  errorRate: number
  availability: number
  optimizer: {
    cacheHitRate: number
    queryOptimizations: number
    memoryUsage: number
    recommendations: string[]
    healthStatus: string
  }
  queries: {
    totalQueries: number
    optimizedQueries: number
    slowQueries: number
    averageQueryTime: number
  }
}

// 模拟数据
const mockSystemMetrics: SystemMetrics = {
  cpu: 35.2,
  memory: 68.5,
  disk: 45.8,
  network: 12.3,
  uptime: '15天 8小时 32分钟',
  activeConnections: 234,
  responseTime: 85,
  errorRate: 0.02,
};

const mockBusinessMetrics: BusinessMetrics = {
  totalRevenue: 2_456_780.5,
  dailyRevenue: 34_567.8,
  totalOrders: 8934,
  activeUsers: 2341,
  conversionRate: 3.2,
  avgOrderValue: 275.3,
  returnRate: 1.8,
  customerSatisfaction: 4.7,
};

const mockPerformanceMetrics: PerformanceMetrics = {
  apiLatency: 85,
  dbQueries: 1250,
  cacheHitRate: 94.5,
  throughput: 450,
  errorRate: 0.02,
  availability: 99.95,
  optimizer: {
    cacheHitRate: 0.92,
    queryOptimizations: 1847,
    memoryUsage: 256.8,
    recommendations: ['内存使用正常', '缓存性能优秀'],
    healthStatus: 'healthy',
  },
  queries: {
    totalQueries: 12_847,
    optimizedQueries: 11_823,
    slowQueries: 23,
    averageQueryTime: 45.2,
  },
};

export default function AdminMonitoringCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>(mockBusinessMetrics);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>(mockPerformanceMetrics);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const tabs = [
    {
      id: 'overview',
      label: '总览',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: 'system',
      label: '系统监控',
      icon: <Server className="h-4 w-4" />,
      badge: systemMetrics.cpu > 80 ? '警告' : '正常',
    },
    {
      id: 'performance',
      label: '性能分析',
      icon: <Activity className="h-4 w-4" />,
      badge: performanceMetrics.availability >= 99.9 ? '优秀' : '一般',
    },
    {
      id: 'cache',
      label: '缓存性能',
      icon: <Database className="h-4 w-4" />,
      badge: performanceMetrics.optimizer.cacheHitRate >= 0.9 ? '优秀' : '良好',
    },
    {
      id: 'business',
      label: '业务指标',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'deprecations',
      label: '弃用端点',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  // 弃用端点统计（新增 Tab 在后续迭代曝光）
  const [deprecations, setDeprecations] = useState<{ path: string; count: number }[]>([]);

  const loadDeprecations = async () => {
    try {
      const { data } = await monitoringApi.getDeprecations();
      setDeprecations((data?.items as any[]) || []);
    } catch {
      // ignore errors; keep page resilient
    }
  };

  useEffect(() => {
    // 初始数据加载
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // 调用监控中心 Dashboard + Metrics 接口
        const [{ data }, metricsRes] = await Promise.all([
          monitoringApi.getDashboard('24h'),
          monitoringApi.getMetrics(),
        ]);

        // 这里只做最小映射，若接口包含更丰富字段，可逐步扩展
        if (data?.business) {
          setBusinessMetrics((previous) => ({
            ...previous,
            totalRevenue: data.business.totalRevenue ?? previous.totalRevenue,
            dailyRevenue: data.business.dailyRevenue ?? previous.dailyRevenue,
            totalOrders: data.business.totalOrders ?? previous.totalOrders,
            activeUsers: data.business.activeUsers ?? previous.activeUsers,
          }));
        }
        if (data?.system) {
          setSystemMetrics((previous) => ({
            ...previous,
            cpu: data.system.cpu ?? previous.cpu,
            memory: data.system.memory ?? previous.memory,
            disk: data.system.disk ?? previous.disk,
            network: data.system.network ?? previous.network,
            responseTime: data.system.responseTime ?? previous.responseTime,
            errorRate: data.system.errorRate ?? previous.errorRate,
          }));
        }
        if (data?.performance) {
          setPerformanceMetrics((previous) => ({
            ...previous,
            apiLatency: data.performance.apiLatency ?? previous.apiLatency,
            dbQueries: data.performance.dbQueries ?? previous.dbQueries,
            cacheHitRate: data.performance.cacheHitRate ?? previous.cacheHitRate,
            throughput: data.performance.throughput ?? previous.throughput,
            availability: data.performance.availability ?? previous.availability,
          }));
        }

        // 合并 metrics 指标（若可用）
        if (metricsRes?.data) {
          setMetricsData(metricsRes.data);
        }

        if (metricsRes?.data?.performance) {
          const pm = metricsRes.data.performance;
          setPerformanceMetrics((previous) => ({
            ...previous,
            apiLatency: pm.avgResponseTime ?? previous.apiLatency,
            cacheHitRate: pm.optimizer?.cacheHitRate ?? previous.cacheHitRate,
            availability: pm.uptime ?? previous.availability,
            queries: {
              ...previous.queries,
              totalQueries: pm.queries?.totalQueries ?? previous.queries.totalQueries,
              optimizedQueries: pm.queries?.optimizedQueries ?? previous.queries.optimizedQueries,
              slowQueries: pm.queries?.slowQueries ?? previous.queries.slowQueries,
              averageQueryTime: pm.queries?.averageQueryTime ?? previous.queries.averageQueryTime,
            },
            optimizer: {
              ...previous.optimizer,
              cacheHitRate: pm.optimizer?.cacheHitRate ?? previous.optimizer.cacheHitRate,
              queryOptimizations: pm.optimizer?.queryOptimizations ?? previous.optimizer.queryOptimizations,
              memoryUsage: pm.optimizer?.memoryUsage ?? previous.optimizer.memoryUsage,
              recommendations: pm.optimizer?.recommendations ?? previous.optimizer.recommendations,
              healthStatus: pm.optimizer?.healthStatus ?? previous.optimizer.healthStatus,
            },
          }));
        }

        setIsLoading(false);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to load monitoring data:', error);

        // 回退使用本地mock
        setIsLoading(false);
        setLastUpdated(new Date());
      }
    };

    loadInitialData();

    // 设置实时数据更新 - 每30秒更新一次
    const interval = setInterval(async () => {
      try {
        // 暂时模拟实时更新（SSE对接在后续迭代）
        setLastUpdated(new Date());

        // 模拟一些指标的轻微变化
        setSystemMetrics(previous => ({
          ...previous,
          cpu: Math.max(20, Math.min(80, previous.cpu + (Math.random() - 0.5) * 5)),
          memory: Math.max(50, Math.min(90, previous.memory + (Math.random() - 0.5) * 3)),
          responseTime: Math.max(50, Math.min(200, previous.responseTime + (Math.random() - 0.5) * 10)),
        }));

        setPerformanceMetrics(previous => ({
          ...previous,
          optimizer: {
            ...previous.optimizer,
            queryOptimizations: previous.optimizer.queryOptimizations + Math.floor(Math.random() * 3),
            cacheHitRate: Math.max(0.8, Math.min(0.98, previous.optimizer.cacheHitRate + (Math.random() - 0.5) * 0.02)),
          },
        }));
      } catch (error) {
        console.error('Failed to update real-time data:', error);
      }
    }, 30_000); // 30秒更新一次

    return () => {
      clearInterval(interval);

      // 在实际实现中，这里还需要关闭 EventSource
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'deprecations') {
      loadDeprecations();
    }
  }, [activeTab]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 关键指标概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SystemHealthCard health={99.8} />
        <MetricsCard
          title="日收入"
          value={`¥${businessMetrics.dailyRevenue.toLocaleString('zh-CN')}`}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          change={{ value: 8.5, type: 'increase', label: '比昨日' }}
          status="success"
        />
        <MetricsCard
          title="活跃用户"
          value={businessMetrics.activeUsers}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          change={{ value: 12.3, type: 'increase', label: '比昨日' }}
        />
        <MetricsCard
          title="查询优化率"
          value={`${((performanceMetrics.queries.optimizedQueries / performanceMetrics.queries.totalQueries) * 100).toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          status={performanceMetrics.queries.optimizedQueries / performanceMetrics.queries.totalQueries >= 0.8 ? 'success' : 'warning'}
          change={{ value: 5.2, type: 'increase', label: '比昨日' }}
          description={`已优化 ${performanceMetrics.queries.optimizedQueries} 个查询`}
        />
      </div>

      {/* 监控KPIs（来自 /monitoring/metrics）*/}
      {metricsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="日志总数/错误/警告"
            value={`${metricsData.logs?.total ?? 0} / ${metricsData.logs?.errors ?? 0} / ${metricsData.logs?.warnings ?? 0}`}
            icon={<Activity className="h-5 w-5 text-red-600" />}
            status={metricsData.logs?.errors ? 'warning' : 'success'}
          />
          <MetricsCard
            title="审计总数/今日/关键"
            value={`${metricsData.audit?.total ?? 0} / ${metricsData.audit?.todayEntries ?? 0} / ${metricsData.audit?.criticalActions ?? 0}`}
            icon={<Shield className="h-5 w-5 text-blue-600" />}
          />
          <MetricsCard
            title="告警 活跃/已解决/严重"
            value={`${metricsData.alerts?.active ?? 0} / ${metricsData.alerts?.resolved ?? 0} / ${metricsData.alerts?.critical ?? 0}`}
            icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
            status={metricsData.alerts?.critical ? 'warning' : 'success'}
          />
          <MetricsCard
            title="平均响应时间"
            value={`${metricsData.performance?.avgResponseTime ?? performanceMetrics.apiLatency} ms`}
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            status={(metricsData.performance?.avgResponseTime ?? performanceMetrics.apiLatency) < 120 ? 'success' : 'warning'}
          />
        </div>
      )}

      {/* 指标图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>响应时间趋势</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(metricsData?.performance?.metrics || Array.from({ length: 12 }).map((_, index) => ({
                  name: `${index + 1}`,
                  responseTime: performanceMetrics.apiLatency + Math.round((Math.random() - 0.5) * 20),
                }))).map((m: any, index: number) => ({
                  name: m.name || `${index + 1}`,
                  responseTime: m.responseTime || m.avgResponseTime || performanceMetrics.apiLatency,
                }))}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="ms" />
                <Tooltip />
                <Line
type="monotone" dataKey="responseTime" stroke="#8884d8"
strokeWidth={2} dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>告警概览</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[{
                  name: 'Alerts',
                  active: metricsData?.alerts?.active || 0,
                  resolved: metricsData?.alerts?.resolved || 0,
                  critical: metricsData?.alerts?.critical || 0,
                }]}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="active" fill="#3b82f6" />
                <Bar dataKey="resolved" fill="#16a34a" />
                <Bar dataKey="critical" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 更多趋势图：错误率与查询时长对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>错误率趋势</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Array.from({ length: 12 }).map((_, index) => ({
                  name: `${index + 1}`,
                  errorRate: +(metricsData?.performance?.errorRate ?? performanceMetrics.errorRate) * (0.8 + (Math.random() * 0.4)),
                }))}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip formatter={(v: any) => `${Math.round(v * 100)}%`} />
                <Line
type="monotone" dataKey="errorRate" stroke="#ef4444"
strokeWidth={2} dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>查询时长对比</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[{
                  name: 'Query Time',
                  avg: metricsData?.performance?.queries?.averageQueryTime ?? performanceMetrics.queries.averageQueryTime,
                  p95: Math.round((metricsData?.performance?.queries?.averageQueryTime ?? performanceMetrics.queries.averageQueryTime) * 1.6),
                  p99: Math.round((metricsData?.performance?.queries?.averageQueryTime ?? performanceMetrics.queries.averageQueryTime) * 2.2),
                }]}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="ms" />
                <Tooltip />
                <Bar dataKey="avg" fill="#6366f1" />
                <Bar dataKey="p95" fill="#10b981" />
                <Bar dataKey="p99" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 实时状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>系统资源使用率</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'CPU', value: systemMetrics.cpu, icon: Server, color: 'bg-blue-500' },
              { label: '内存', value: systemMetrics.memory, icon: Database, color: 'bg-green-500' },
              { label: '磁盘', value: systemMetrics.disk, icon: HardDrive, color: 'bg-yellow-500' },
              { label: '网络', value: systemMetrics.network, icon: Wifi, color: 'bg-purple-500' },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-4 w-4 text-gray-600" />
                    <span>{metric.label}</span>
                  </div>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>实时业务数据</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{businessMetrics.totalOrders}</div>
                <div className="text-sm text-gray-600">总订单数</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{businessMetrics.conversionRate}%</div>
                <div className="text-sm text-gray-600">转化率</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">¥{businessMetrics.avgOrderValue}</div>
                <div className="text-sm text-gray-600">平均订单金额</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{businessMetrics.customerSatisfaction}/5</div>
                <div className="text-sm text-gray-600">客户满意度</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 查询优化概览卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>查询优化概览</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{performanceMetrics.optimizer.queryOptimizations}</div>
                <div className="text-sm text-blue-600">优化次数</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{(performanceMetrics.optimizer.cacheHitRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-green-600">缓存命中</div>
              </div>
            </div>

            {/* 优化建议摘要 */}
            {performanceMetrics.optimizer.recommendations.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="text-sm text-yellow-800 font-medium mb-1">待处理建议</div>
                <div className="text-sm text-yellow-700">
                  {performanceMetrics.optimizer.recommendations[0]}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDeprecations = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>弃用端点命中统计</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deprecations.length === 0
? (
            <div className="text-sm text-muted-foreground">暂无弃用端点命中</div>
          )
: (
            <div className="space-y-2">
              {deprecations.map((item, index) => (
                <div key={item.path} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <code className="text-xs">{item.path}</code>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard
          title="系统运行时间"
          value={systemMetrics.uptime}
          icon={<Clock className="h-5 w-5 text-green-600" />}
          status="success"
        />
        <MetricsCard
          title="活跃连接"
          value={systemMetrics.activeConnections}
          icon={<Wifi className="h-5 w-5 text-blue-600" />}
        />
        <MetricsCard
          title="响应时间"
          value={`${systemMetrics.responseTime}ms`}
          icon={<Activity className="h-5 w-5 text-purple-600" />}
          status={systemMetrics.responseTime < 100 ? 'success' : 'warning'}
        />
      </div>

      {/* 这里可以添加更详细的系统监控图表 */}
      <Card>
        <CardHeader>
          <CardTitle>系统资源详细监控</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">实时系统监控图表将在此处显示</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderBusinessMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="总收入"
          value={`¥${businessMetrics.totalRevenue.toLocaleString('zh-CN')}`}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          change={{ value: 15.3, type: 'increase', label: '本月' }}
          status="success"
        />
        <MetricsCard
          title="日收入"
          value={`¥${businessMetrics.dailyRevenue.toLocaleString('zh-CN')}`}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          change={{ value: 8.5, type: 'increase', label: '比昨日' }}
        />
        <MetricsCard
          title="总订单"
          value={businessMetrics.totalOrders}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          change={{ value: 23.1, type: 'increase', label: '本月' }}
        />
        <MetricsCard
          title="活跃用户"
          value={businessMetrics.activeUsers}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          change={{ value: 12.3, type: 'increase', label: '本周' }}
        />
      </div>

      {/* 业务趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle>业务趋势分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">业务数据趋势图表将在此处显示</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      {/* 核心性能指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="可用性"
          value={`${performanceMetrics.availability}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          status={performanceMetrics.availability >= 99.9 ? 'success' : 'warning'}
        />
        <MetricsCard
          title="缓存命中率"
          value={`${(performanceMetrics.optimizer.cacheHitRate * 100).toFixed(1)}%`}
          icon={<Database className="h-5 w-5 text-blue-600" />}
          status={performanceMetrics.optimizer.cacheHitRate >= 0.9 ? 'success' : 'warning'}
          description={'优化器缓存性能'}
        />
        <MetricsCard
          title="查询优化数"
          value={performanceMetrics.optimizer.queryOptimizations}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          status="success"
          description={`已优化 ${performanceMetrics.queries.optimizedQueries}/${performanceMetrics.queries.totalQueries} 查询`}
        />
        <MetricsCard
          title="内存使用"
          value={`${performanceMetrics.optimizer.memoryUsage.toFixed(1)}MB`}
          icon={<HardDrive className="h-5 w-5 text-orange-600" />}
          status={performanceMetrics.optimizer.memoryUsage < 300 ? 'success' : 'warning'}
        />
      </div>

      {/* 查询性能分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>查询性能统计</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{performanceMetrics.queries.totalQueries}</div>
                <div className="text-sm text-blue-600">总查询数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{performanceMetrics.queries.optimizedQueries}</div>
                <div className="text-sm text-green-600">已优化查询</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{performanceMetrics.queries.slowQueries}</div>
                <div className="text-sm text-yellow-600">慢查询数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{performanceMetrics.queries.averageQueryTime.toFixed(0)}ms</div>
                <div className="text-sm text-purple-600">平均查询时间</div>
              </div>
            </div>

            {/* 优化效率进度条 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>查询优化率</span>
                <span className="font-medium">{((performanceMetrics.queries.optimizedQueries / performanceMetrics.queries.totalQueries) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(performanceMetrics.queries.optimizedQueries / performanceMetrics.queries.totalQueries) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>优化器健康状态</span>
              <div className={`ml-2 w-3 h-3 rounded-full ${
                performanceMetrics.optimizer.healthStatus === 'healthy'
? 'bg-green-400'
                : (performanceMetrics.optimizer.healthStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400')
              }`}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="text-lg font-semibold text-gray-900">
                状态: {performanceMetrics.optimizer.healthStatus === 'healthy'
? '健康'
                      : (performanceMetrics.optimizer.healthStatus === 'warning' ? '警告' : '严重')}
              </div>

              {/* 推荐建议 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">优化建议</h4>
                {performanceMetrics.optimizer.recommendations.length > 0
? (
                  <ul className="space-y-1">
                    {performanceMetrics.optimizer.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )
: (
                  <p className="text-sm text-green-600 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>系统性能良好，无需优化</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 性能详细分析 */}
      <Card>
        <CardHeader>
          <CardTitle>性能详细分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{(performanceMetrics.optimizer.cacheHitRate * 100).toFixed(1)}%</div>
              <div className="text-sm text-blue-600 font-medium">缓存命中率</div>
              <div className="text-xs text-blue-500 mt-1">优化器核心指标</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{performanceMetrics.optimizer.queryOptimizations}</div>
              <div className="text-sm text-green-600 font-medium">查询优化次数</div>
              <div className="text-xs text-green-500 mt-1">自启动以来累计</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">{performanceMetrics.queries.averageQueryTime.toFixed(0)}ms</div>
              <div className="text-sm text-purple-600 font-medium">平均查询时间</div>
              <div className="text-xs text-purple-500 mt-1">包含缓存优化</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCachePerformance = () => (
    <div className="space-y-6">
      {/* 缓存性能概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="缓存命中率"
          value={`${(performanceMetrics.optimizer.cacheHitRate * 100).toFixed(1)}%`}
          icon={<Database className="h-5 w-5 text-blue-600" />}
          status={performanceMetrics.optimizer.cacheHitRate >= 0.9 ? 'success' : 'warning'}
          change={{ value: 2.3, type: 'increase', label: '比昨日' }}
        />
        <MetricsCard
          title="缓存内存使用"
          value={`${performanceMetrics.optimizer.memoryUsage.toFixed(1)}MB`}
          icon={<HardDrive className="h-5 w-5 text-purple-600" />}
          status={performanceMetrics.optimizer.memoryUsage < 300 ? 'success' : 'warning'}
        />
        <MetricsCard
          title="查询缓存数"
          value={Math.floor(performanceMetrics.queries.totalQueries * 0.6)}
          icon={<Server className="h-5 w-5 text-green-600" />}
          description="活跃缓存条目"
        />
        <MetricsCard
          title="响应缓存数"
          value={Math.floor(performanceMetrics.queries.totalQueries * 0.4)}
          icon={<Wifi className="h-5 w-5 text-orange-600" />}
          description="响应级缓存"
        />
      </div>

      {/* 缓存详细分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>缓存效率分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* 命中率进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>查询缓存命中率</span>
                  <span className="font-medium">{(performanceMetrics.optimizer.cacheHitRate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${performanceMetrics.optimizer.cacheHitRate * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* 缓存性能指标 */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">~5ms</div>
                  <div className="text-xs text-green-600">平均命中时间</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">~50ms</div>
                  <div className="text-xs text-red-600">平均缺失时间</div>
                </div>
              </div>

              {/* 效率评级 */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600 mb-1">
                  {performanceMetrics.optimizer.cacheHitRate >= 0.9
? '优秀'
                   : (performanceMetrics.optimizer.cacheHitRate >= 0.7 ? '良好' : '需改进')}
                </div>
                <div className="text-sm text-gray-600">缓存效率评级</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>缓存优化建议</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 当前状态 */}
              <div className={`p-4 rounded-lg border-l-4 ${
                performanceMetrics.optimizer.healthStatus === 'healthy'
                  ? 'bg-green-50 border-green-400'
                  : (performanceMetrics.optimizer.healthStatus === 'warning'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-red-50 border-red-400')
              }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {performanceMetrics.optimizer.healthStatus === 'healthy'
? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )
: (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    {performanceMetrics.optimizer.healthStatus === 'healthy' ? '缓存运行健康' : '需要关注'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {performanceMetrics.optimizer.healthStatus === 'healthy'
                    ? '缓存系统运行正常，性能优化效果良好'
                    : '缓存性能可能存在优化空间'}
                </p>
              </div>

              {/* 优化建议列表 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">智能优化建议</h4>
                {performanceMetrics.optimizer.recommendations.length > 0
? (
                  <ul className="space-y-2">
                    {performanceMetrics.optimizer.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
: (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">缓存性能优秀，当前无优化建议</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 缓存统计图表区 */}
      <Card>
        <CardHeader>
          <CardTitle>缓存统计详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">缓存类型分布</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <span className="text-sm font-medium">查询缓存</span>
                  </div>
                  <span className="text-sm text-blue-600">{Math.floor(performanceMetrics.queries.totalQueries * 0.6)} 条目</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span className="text-sm font-medium">响应缓存</span>
                  </div>
                  <span className="text-sm text-green-600">{Math.floor(performanceMetrics.queries.totalQueries * 0.4)} 条目</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">性能提升效果</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600 mb-1">10x</div>
                  <div className="text-sm text-gray-600">响应速度提升</div>
                  <div className="text-xs text-gray-500">相比无缓存查询</div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600 mb-1">65%</div>
                  <div className="text-sm text-gray-600">数据库负载减少</div>
                  <div className="text-xs text-gray-500">通过查询优化</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': {
        return renderOverview();
      }
      case 'system': {
        return renderSystemMonitoring();
      }
      case 'performance': {
        return renderPerformanceAnalysis();
      }
      case 'cache': {
        return renderCachePerformance();
      }
      case 'business': {
        return renderBusinessMetrics();
      }
      case 'deprecations': {
        return renderDeprecations();
      }
      default: {
        return renderOverview();
      }
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面头部 */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">监控中心</h1>
              <p className="text-gray-600">系统监控、业务指标和性能分析</p>
            </div>

            {/* 实时状态指示器 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>实时监控</span>
              </div>
              <div className="text-xs text-gray-400">
                更新于: {lastUpdated.toLocaleTimeString('zh-CN')}
              </div>
            </div>
          </div>

          {/* 标签页内容 */}
          <TabContainer
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {renderTabContent()}
          </TabContainer>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
