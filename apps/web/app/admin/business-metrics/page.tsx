'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  RefreshCw,
  Clock,
  DollarSign,
  Users,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  Settings,
  PlayCircle,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface KPIMetric {
  id: string
  name: string
  category: 'financial' | 'user' | 'operational' | 'marketing' | 'product'
  value: number
  unit: string
  target: number
  previousValue: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  description: string
  lastUpdated: string
  updateFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
}

interface BusinessHealth {
  category: string
  score: number
  metrics: {
    name: string
    value: number
    target: number
    status: 'good' | 'warning' | 'critical'
  }[]
}

interface BusinessTrend {
  date: string
  revenue: number
  activeUsers: number
  conversion: number
  retention: number
  satisfaction: number
}

interface BusinessAlert {
  id: string
  type: 'threshold' | 'trend' | 'anomaly' | 'forecast'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  message: string
  triggeredAt: string
  status: 'active' | 'acknowledged' | 'resolved'
  threshold?: number
  currentValue?: number
}

// 模拟KPI指标数据
const mockKPIs: KPIMetric[] = [
  {
    id: 'kpi-001',
    name: '月收入',
    category: 'financial',
    value: 1250000,
    unit: '元',
    target: 1500000,
    previousValue: 1100000,
    trend: 'up',
    status: 'warning',
    description: '月度总收入，包括投资收益和手续费',
    lastUpdated: '2024-01-27T14:30:00Z',
    updateFrequency: 'daily'
  },
  {
    id: 'kpi-002',
    name: '活跃用户数',
    category: 'user',
    value: 15240,
    unit: '人',
    target: 18000,
    previousValue: 14800,
    trend: 'up',
    status: 'good',
    description: '月度活跃用户数量',
    lastUpdated: '2024-01-27T14:25:00Z',
    updateFrequency: 'hourly'
  },
  {
    id: 'kpi-003',
    name: '用户转化率',
    category: 'marketing',
    value: 12.5,
    unit: '%',
    target: 15.0,
    previousValue: 11.8,
    trend: 'up',
    status: 'warning',
    description: '从注册到首次投资的转化率',
    lastUpdated: '2024-01-27T14:20:00Z',
    updateFrequency: 'daily'
  },
  {
    id: 'kpi-004',
    name: '客户留存率',
    category: 'user',
    value: 85.2,
    unit: '%',
    target: 90.0,
    previousValue: 87.1,
    trend: 'down',
    status: 'warning',
    description: '90天客户留存率',
    lastUpdated: '2024-01-27T14:15:00Z',
    updateFrequency: 'weekly'
  },
  {
    id: 'kpi-005',
    name: '平均响应时间',
    category: 'operational',
    value: 0.45,
    unit: '秒',
    target: 0.5,
    previousValue: 0.52,
    trend: 'up',
    status: 'good',
    description: 'API平均响应时间',
    lastUpdated: '2024-01-27T14:30:00Z',
    updateFrequency: 'real-time'
  },
  {
    id: 'kpi-006',
    name: '客户满意度',
    category: 'product',
    value: 4.3,
    unit: '分',
    target: 4.5,
    previousValue: 4.1,
    trend: 'up',
    status: 'good',
    description: '客户满意度评分（5分制）',
    lastUpdated: '2024-01-27T13:45:00Z',
    updateFrequency: 'daily'
  },
  {
    id: 'kpi-007',
    name: '投资总额',
    category: 'financial',
    value: 25600000,
    unit: '元',
    target: 30000000,
    previousValue: 23800000,
    trend: 'up',
    status: 'good',
    description: '平台总投资金额',
    lastUpdated: '2024-01-27T14:00:00Z',
    updateFrequency: 'hourly'
  },
  {
    id: 'kpi-008',
    name: '系统可用性',
    category: 'operational',
    value: 99.8,
    unit: '%',
    target: 99.9,
    previousValue: 99.7,
    trend: 'up',
    status: 'good',
    description: '系统正常运行时间百分比',
    lastUpdated: '2024-01-27T14:30:00Z',
    updateFrequency: 'real-time'
  }
]

// 模拟业务健康度数据
const mockBusinessHealth: BusinessHealth[] = [
  {
    category: '财务健康',
    score: 82,
    metrics: [
      { name: '收入增长', value: 13.6, target: 15.0, status: 'warning' },
      { name: '利润率', value: 18.5, target: 20.0, status: 'warning' },
      { name: '成本控制', value: 92.0, target: 90.0, status: 'good' }
    ]
  },
  {
    category: '用户健康',
    score: 88,
    metrics: [
      { name: '用户增长', value: 2.97, target: 3.0, status: 'good' },
      { name: '活跃度', value: 84.7, target: 85.0, status: 'good' },
      { name: '留存率', value: 85.2, target: 90.0, status: 'warning' }
    ]
  },
  {
    category: '运营健康',
    score: 91,
    metrics: [
      { name: '系统性能', value: 99.8, target: 99.5, status: 'good' },
      { name: '错误率', value: 0.02, target: 0.05, status: 'good' },
      { name: '处理效率', value: 95.3, target: 92.0, status: 'good' }
    ]
  },
  {
    category: '产品健康',
    score: 85,
    metrics: [
      { name: '功能使用率', value: 78.5, target: 80.0, status: 'warning' },
      { name: '用户满意度', value: 4.3, target: 4.5, status: 'good' },
      { name: '缺陷率', value: 0.8, target: 1.0, status: 'good' }
    ]
  }
]

// 模拟业务告警数据
const mockAlerts: BusinessAlert[] = [
  {
    id: 'alert-001',
    type: 'threshold',
    severity: 'high',
    metric: '月收入',
    message: '月收入低于目标值16.7%，需要关注业务增长策略',
    triggeredAt: '2024-01-27T10:30:00Z',
    status: 'active',
    threshold: 1500000,
    currentValue: 1250000
  },
  {
    id: 'alert-002',
    type: 'trend',
    severity: 'medium',
    metric: '客户留存率',
    message: '客户留存率连续3周下降，建议优化用户体验',
    triggeredAt: '2024-01-26T15:20:00Z',
    status: 'acknowledged',
    currentValue: 85.2
  },
  {
    id: 'alert-003',
    type: 'anomaly',
    severity: 'critical',
    metric: '活跃用户数',
    message: '活跃用户数异常波动，检测到可能的数据质量问题',
    triggeredAt: '2024-01-25T09:15:00Z',
    status: 'resolved',
    currentValue: 15240
  }
]

// 模拟趋势数据
const mockTrends: BusinessTrend[] = [
  { date: '2024-01-21', revenue: 1100000, activeUsers: 14200, conversion: 11.2, retention: 87.5, satisfaction: 4.0 },
  { date: '2024-01-22', revenue: 1150000, activeUsers: 14400, conversion: 11.5, retention: 87.1, satisfaction: 4.1 },
  { date: '2024-01-23', revenue: 1180000, activeUsers: 14600, conversion: 11.8, retention: 86.8, satisfaction: 4.1 },
  { date: '2024-01-24', revenue: 1200000, activeUsers: 14800, conversion: 12.0, retention: 86.2, satisfaction: 4.2 },
  { date: '2024-01-25', revenue: 1220000, activeUsers: 15000, conversion: 12.2, retention: 85.8, satisfaction: 4.2 },
  { date: '2024-01-26', revenue: 1240000, activeUsers: 15120, conversion: 12.3, retention: 85.4, satisfaction: 4.3 },
  { date: '2024-01-27', revenue: 1250000, activeUsers: 15240, conversion: 12.5, retention: 85.2, satisfaction: 4.3 }
]

export default function BusinessMetricsPage() {
  const [kpis, setKpis] = useState<KPIMetric[]>(mockKPIs)
  const [businessHealth, setBusinessHealth] = useState<BusinessHealth[]>(mockBusinessHealth)
  const [alerts, setAlerts] = useState<BusinessAlert[]>(mockAlerts)
  const [trends] = useState<BusinessTrend[]>(mockTrends)
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'health' | 'alerts'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 获取分类样式
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-100 text-green-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      case 'operational':
        return 'bg-purple-100 text-purple-800'
      case 'marketing':
        return 'bg-orange-100 text-orange-800'
      case 'product':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取严重程度样式
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="w-4 h-4" />
      case 'user':
        return <Users className="w-4 h-4" />
      case 'operational':
        return <Settings className="w-4 h-4" />
      case 'marketing':
        return <Target className="w-4 h-4" />
      case 'product':
        return <Award className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      // 模拟刷新数据
      setKpis(prevKpis =>
        prevKpis.map(kpi => ({
          ...kpi,
          value: kpi.category === 'financial' ? 
            kpi.value + Math.floor(Math.random() * 100000) - 50000 :
            kpi.value + Math.floor(Math.random() * 100) - 50,
          lastUpdated: new Date().toISOString()
        }))
      )
      setIsLoading(false)
    }, 1000)
  }

  const handleExportReport = () => {
    alert('导出业务指标报告功能开发中')
  }

  const handleBusinessAnalysis = () => {
    alert('业务趋势分析功能开发中')
  }

  const handleHealthCheck = () => {
    alert('业务健康度评估功能开发中')
  }

  const handleOptimizationAdvice = () => {
    alert('业务优化建议功能开发中')
  }

  const handleAlertConfiguration = () => {
    alert('业务风险预警功能开发中')
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  const latestTrend = trends[trends.length - 1]
  const previousTrend = trends[trends.length - 2]
  const revenueGrowth = previousTrend ? ((latestTrend.revenue - previousTrend.revenue) / previousTrend.revenue * 100) : 0
  const userGrowth = previousTrend ? ((latestTrend.activeUsers - previousTrend.activeUsers) / previousTrend.activeUsers * 100) : 0
  const activeAlerts = alerts.filter(a => a.status === 'active').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length
  const avgHealthScore = businessHealth.reduce((sum, h) => sum + h.score, 0) / businessHealth.length || 0

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3" />
                业务指标
              </h1>
              <p className="text-gray-600 mt-2">
                业务KPI监控、健康度分析和趋势预测
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBusinessAnalysis}
              >
                <LineChart className="w-4 h-4 mr-2" />
                趋势分析
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleHealthCheck}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                健康评估
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportReport}
              >
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </motion.div>

          {/* 核心指标概览卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">收入增长</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-2xl font-bold text-green-600">
                        {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                      </p>
                      {revenueGrowth > 0 ? 
                        <TrendingUp className="w-4 h-4 text-green-600" /> :
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      }
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">用户增长</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-2xl font-bold text-blue-600">
                        {userGrowth > 0 ? '+' : ''}{userGrowth.toFixed(1)}%
                      </p>
                      {userGrowth > 0 ? 
                        <TrendingUp className="w-4 h-4 text-blue-600" /> :
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      }
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">健康评分</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(avgHealthScore)}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">活跃告警</p>
                    <p className={`text-2xl font-bold ${activeAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {activeAlerts}
                    </p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${activeAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 标签切换 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex space-x-1 bg-gray-100 rounded-lg p-1"
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              业务概览
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'kpis'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              KPI指标
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'health'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              健康度
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              业务告警
            </button>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {activeTab === 'overview' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  业务KPI展示
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  业务趋势分析
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  目标完成情况
                </Button>
              </>
            )}
            {activeTab === 'kpis' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  KPI配置管理
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  目标设置
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  指标对比分析
                </Button>
              </>
            )}
            {activeTab === 'health' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleHealthCheck}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  业务健康度评估
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOptimizationAdvice}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  业务优化建议
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  健康趋势监控
                </Button>
              </>
            )}
            {activeTab === 'alerts' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAlertConfiguration}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  业务风险预警
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  告警规则配置
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  自动告警测试
                </Button>
              </>
            )}
          </motion.div>

          {/* 搜索和筛选 */}
          {(activeTab === 'kpis' || activeTab === 'alerts') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={
                    activeTab === 'kpis' ? "搜索KPI指标名称..." :
                    "搜索告警消息、指标..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                {activeTab === 'kpis' && (
                  <>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部分类</option>
                      <option value="financial">财务</option>
                      <option value="user">用户</option>
                      <option value="operational">运营</option>
                      <option value="marketing">营销</option>
                      <option value="product">产品</option>
                    </select>
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部状态</option>
                      <option value="good">良好</option>
                      <option value="warning">警告</option>
                      <option value="critical">严重</option>
                    </select>
                  </>
                )}

                {activeTab === 'alerts' && (
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">全部状态</option>
                    <option value="active">活跃</option>
                    <option value="acknowledged">已确认</option>
                    <option value="resolved">已解决</option>
                  </select>
                )}
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  高级筛选
                </Button>
              </div>
            </motion.div>
          )}

          {/* 内容区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 收入趋势图 */}
                <Card>
                  <CardHeader>
                    <CardTitle>收入趋势</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">收入趋势图表</p>
                        <p className="text-sm text-gray-500">显示过去7天的收入变化</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 用户增长图 */}
                <Card>
                  <CardHeader>
                    <CardTitle>用户增长</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">用户增长图表</p>
                        <p className="text-sm text-gray-500">显示活跃用户数变化趋势</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 关键指标概览 */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>关键指标概览</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {kpis.slice(0, 4).map((kpi) => (
                        <div key={kpi.id} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${getCategoryStyle(kpi.category)}`}>
                            {getCategoryIcon(kpi.category)}
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{kpi.name}</h3>
                          <div className="flex items-center justify-center space-x-1">
                            <p className="text-lg font-bold">{kpi.value.toLocaleString()}</p>
                            <span className="text-xs text-gray-500">{kpi.unit}</span>
                            {getTrendIcon(kpi.trend)}
                          </div>
                          <p className="text-xs text-gray-500">
                            目标: {kpi.target.toLocaleString()}{kpi.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'kpis' && (
              <Card>
                <CardHeader>
                  <CardTitle>KPI指标 ({kpis.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpis
                      .filter(kpi => 
                        (searchQuery === '' || kpi.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterCategory === 'all' || kpi.category === filterCategory) &&
                        (filterStatus === 'all' || kpi.status === filterStatus)
                      )
                      .map((kpi) => (
                        <div
                          key={kpi.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyle(kpi.category)}`}>
                              {getCategoryIcon(kpi.category)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {kpi.name}
                                </h3>
                                <Badge className={getCategoryStyle(kpi.category)}>
                                  {kpi.category === 'financial' && '财务'}
                                  {kpi.category === 'user' && '用户'}
                                  {kpi.category === 'operational' && '运营'}
                                  {kpi.category === 'marketing' && '营销'}
                                  {kpi.category === 'product' && '产品'}
                                </Badge>
                                <Badge className={getStatusStyle(kpi.status)}>
                                  {kpi.status === 'good' && '良好'}
                                  {kpi.status === 'warning' && '警告'}
                                  {kpi.status === 'critical' && '严重'}
                                </Badge>
                                {getTrendIcon(kpi.trend)}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span className="font-bold text-lg">
                                  {kpi.value.toLocaleString()}{kpi.unit}
                                </span>
                                <span>目标: {kpi.target.toLocaleString()}{kpi.unit}</span>
                                <span>完成率: {Math.round((kpi.value / kpi.target) * 100)}%</span>
                                <span>更新: {kpi.updateFrequency}</span>
                              </div>

                              <p className="text-sm text-gray-500 mb-1">
                                {kpi.description}
                              </p>

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>更新时间: {new Date(kpi.lastUpdated).toLocaleString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(kpi)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'health' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businessHealth.map((health) => (
                  <Card key={health.category}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{health.category}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{health.score}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            health.score >= 90 ? 'bg-green-500' :
                            health.score >= 80 ? 'bg-yellow-500' :
                            health.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {health.metrics.map((metric, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{metric.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    metric.status === 'good' ? 'bg-green-500' :
                                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold w-16">
                                {metric.value}
                                {metric.target < 10 ? '' : metric.target < 100 ? '%' : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <Card>
                <CardHeader>
                  <CardTitle>业务告警 ({alerts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts
                      .filter(alert => 
                        (searchQuery === '' || 
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.metric.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterStatus === 'all' || alert.status === filterStatus)
                      )
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSeverityStyle(alert.severity)}`}>
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {alert.metric}
                                </h3>
                                <Badge variant="outline">
                                  {alert.type === 'threshold' && '阈值'}
                                  {alert.type === 'trend' && '趋势'}
                                  {alert.type === 'anomaly' && '异常'}
                                  {alert.type === 'forecast' && '预测'}
                                </Badge>
                                <Badge className={getSeverityStyle(alert.severity)}>
                                  {alert.severity === 'low' && '低'}
                                  {alert.severity === 'medium' && '中'}
                                  {alert.severity === 'high' && '高'}
                                  {alert.severity === 'critical' && '严重'}
                                </Badge>
                                <Badge className={getStatusStyle(alert.status)}>
                                  {alert.status === 'active' && '活跃'}
                                  {alert.status === 'acknowledged' && '已确认'}
                                  {alert.status === 'resolved' && '已解决'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                {alert.message}
                              </p>

                              {alert.threshold && alert.currentValue && (
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                  <span>当前值: {alert.currentValue.toLocaleString()}</span>
                                  <span>阈值: {alert.threshold.toLocaleString()}</span>
                                  <span>偏差: {Math.round(((alert.currentValue - alert.threshold) / alert.threshold) * 100)}%</span>
                                </div>
                              )}

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>触发时间: {new Date(alert.triggeredAt).toLocaleString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(alert)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* 详情弹窗 */}
          {showDetailModal && selectedItem && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {activeTab === 'kpis' ? 'KPI指标详情' : '告警详情'}
                    </h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'kpis' && selectedItem && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 block">指标名称:</span>
                              <span className="font-medium">{selectedItem.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">指标分类:</span>
                              <Badge className={getCategoryStyle(selectedItem.category)}>
                                {selectedItem.category === 'financial' && '财务'}
                                {selectedItem.category === 'user' && '用户'}
                                {selectedItem.category === 'operational' && '运营'}
                                {selectedItem.category === 'marketing' && '营销'}
                                {selectedItem.category === 'product' && '产品'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-600 block">指标描述:</span>
                              <span className="font-medium">{selectedItem.description}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">更新频率:</span>
                              <span className="font-medium">{selectedItem.updateFrequency}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">指标数据</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 block">当前值:</span>
                              <span className="text-2xl font-bold text-blue-600">
                                {selectedItem.value.toLocaleString()}{selectedItem.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">目标值:</span>
                              <span className="font-medium">{selectedItem.target.toLocaleString()}{selectedItem.unit}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">完成率:</span>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      (selectedItem.value / selectedItem.target) >= 1 ? 'bg-green-500' :
                                      (selectedItem.value / selectedItem.target) >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min((selectedItem.value / selectedItem.target) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold">{Math.round((selectedItem.value / selectedItem.target) * 100)}%</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 block">上期对比:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {selectedItem.previousValue.toLocaleString()}{selectedItem.unit}
                                </span>
                                <span className={`text-sm ${
                                  selectedItem.value > selectedItem.previousValue ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ({selectedItem.value > selectedItem.previousValue ? '+' : ''}
                                  {Math.round(((selectedItem.value - selectedItem.previousValue) / selectedItem.previousValue) * 100)}%)
                                </span>
                                {getTrendIcon(selectedItem.trend)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">状态信息</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">当前状态</span>
                            <div className="mt-1">
                              <Badge className={getStatusStyle(selectedItem.status)}>
                                {selectedItem.status === 'good' && '良好'}
                                {selectedItem.status === 'warning' && '警告'}
                                {selectedItem.status === 'critical' && '严重'}
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">最后更新</span>
                            <p className="text-sm font-medium mt-1">
                              {new Date(selectedItem.lastUpdated).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}