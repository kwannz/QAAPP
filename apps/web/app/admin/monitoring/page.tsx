'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  HardDrive
} from 'lucide-react'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'
import { TabContainer } from '../../../components/common/TabContainer'
import { MetricsCard, SystemHealthCard } from '../../../components/common/MetricsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

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
  errorRate: 0.02
}

const mockBusinessMetrics: BusinessMetrics = {
  totalRevenue: 2456780.50,
  dailyRevenue: 34567.80,
  totalOrders: 8934,
  activeUsers: 2341,
  conversionRate: 3.2,
  avgOrderValue: 275.30,
  returnRate: 1.8,
  customerSatisfaction: 4.7
}

const mockPerformanceMetrics: PerformanceMetrics = {
  apiLatency: 85,
  dbQueries: 1250,
  cacheHitRate: 94.5,
  throughput: 450,
  errorRate: 0.02,
  availability: 99.95
}

export default function AdminMonitoringCenter() {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(mockSystemMetrics)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>(mockBusinessMetrics)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>(mockPerformanceMetrics)
  const [isLoading, setIsLoading] = useState(true)

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
      badge: systemMetrics.cpu > 80 ? '警告' : '正常'
    },
    {
      id: 'business',
      label: '业务指标',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'performance',
      label: '性能分析',
      icon: <Activity className="h-4 w-4" />,
      badge: performanceMetrics.availability >= 99.9 ? '优秀' : '一般'
    }
  ]

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

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
          title="API响应时间"
          value={`${performanceMetrics.apiLatency}ms`}
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          status={performanceMetrics.apiLatency < 100 ? 'success' : 'warning'}
          change={{ value: -5.2, type: 'decrease', label: '比昨日' }}
        />
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
              { label: '网络', value: systemMetrics.network, icon: Wifi, color: 'bg-purple-500' }
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
                    transition={{ duration: 0.8, ease: "easeOut" }}
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
      </div>
    </div>
  )

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
  )

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
  )

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard
          title="可用性"
          value={`${performanceMetrics.availability}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          status={performanceMetrics.availability >= 99.9 ? 'success' : 'warning'}
        />
        <MetricsCard
          title="缓存命中率"
          value={`${performanceMetrics.cacheHitRate}%`}
          icon={<Database className="h-5 w-5 text-blue-600" />}
          status={performanceMetrics.cacheHitRate >= 90 ? 'success' : 'warning'}
        />
        <MetricsCard
          title="错误率"
          value={`${(performanceMetrics.errorRate * 100).toFixed(2)}%`}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          status={performanceMetrics.errorRate < 0.1 ? 'success' : 'error'}
        />
      </div>

      {/* 性能详细分析 */}
      <Card>
        <CardHeader>
          <CardTitle>性能详细分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">性能分析图表和详细指标将在此处显示</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'system':
        return renderSystemMonitoring()
      case 'business':
        return renderBusinessMetrics()
      case 'performance':
        return renderPerformanceAnalysis()
      default:
        return renderOverview()
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面头部 */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">监控中心</h1>
            <p className="text-gray-600">系统监控、业务指标和性能分析</p>
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
  )
}