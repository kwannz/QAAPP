'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Search,
  Filter,
  Download,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  RefreshCw,
  Clock,
  Cpu,
  Database,
  Network,
  HardDrive,
  BarChart3,
  Monitor,
  Globe,
  Server,
  Settings,
  PlayCircle,
  FileText,
  Target,
  Gauge
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface PerformanceMetric {
  id: string
  name: string
  category: 'response_time' | 'throughput' | 'resource' | 'availability' | 'error_rate'
  value: number
  unit: string
  threshold: number
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  description: string
}

interface PerformanceTest {
  id: string
  name: string
  type: 'load' | 'stress' | 'spike' | 'volume' | 'endurance'
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  startTime: string
  endTime: string | null
  duration: number
  virtualUsers: number
  requestsPerSecond: number
  totalRequests: number
  successRate: number
  avgResponseTime: number
  results: {
    cpu: number
    memory: number
    errorCount: number
    p95ResponseTime: number
    p99ResponseTime: number
  }
}

interface PerformanceReport {
  id: string
  name: string
  generatedAt: string
  period: string
  summary: {
    overallScore: number
    criticalIssues: number
    recommendations: number
    testsRun: number
  }
  categories: {
    performance: number
    reliability: number
    scalability: number
    efficiency: number
  }
}

// 模拟性能指标数据
const mockMetrics: PerformanceMetric[] = [
  {
    id: 'metric-001',
    name: 'API响应时间',
    category: 'response_time',
    value: 245,
    unit: 'ms',
    threshold: 500,
    status: 'good',
    trend: 'stable',
    lastUpdated: '2024-01-27T14:30:00Z',
    description: '平均API响应时间'
  },
  {
    id: 'metric-002',
    name: 'CPU使用率',
    category: 'resource',
    value: 78,
    unit: '%',
    threshold: 80,
    status: 'warning',
    trend: 'up',
    lastUpdated: '2024-01-27T14:29:00Z',
    description: '服务器CPU平均使用率'
  },
  {
    id: 'metric-003',
    name: '内存使用率',
    category: 'resource',
    value: 65,
    unit: '%',
    threshold: 85,
    status: 'good',
    trend: 'stable',
    lastUpdated: '2024-01-27T14:29:00Z',
    description: '服务器内存使用率'
  },
  {
    id: 'metric-004',
    name: '错误率',
    category: 'error_rate',
    value: 0.12,
    unit: '%',
    threshold: 1.0,
    status: 'good',
    trend: 'down',
    lastUpdated: '2024-01-27T14:28:00Z',
    description: '系统错误率'
  },
  {
    id: 'metric-005',
    name: '吞吐量',
    category: 'throughput',
    value: 1250,
    unit: 'req/s',
    threshold: 1000,
    status: 'good',
    trend: 'up',
    lastUpdated: '2024-01-27T14:30:00Z',
    description: '系统请求处理吞吐量'
  },
  {
    id: 'metric-006',
    name: '系统可用性',
    category: 'availability',
    value: 99.8,
    unit: '%',
    threshold: 99.5,
    status: 'good',
    trend: 'stable',
    lastUpdated: '2024-01-27T14:25:00Z',
    description: '系统正常运行时间百分比'
  },
  {
    id: 'metric-007',
    name: '数据库响应时间',
    category: 'response_time',
    value: 85,
    unit: 'ms',
    threshold: 100,
    status: 'good',
    trend: 'stable',
    lastUpdated: '2024-01-27T14:30:00Z',
    description: '数据库查询平均响应时间'
  },
  {
    id: 'metric-008',
    name: '磁盘I/O',
    category: 'resource',
    value: 92,
    unit: '%',
    threshold: 90,
    status: 'critical',
    trend: 'up',
    lastUpdated: '2024-01-27T14:29:00Z',
    description: '磁盘I/O使用率'
  }
]

// 模拟性能测试数据
const mockTests: PerformanceTest[] = [
  {
    id: 'test-001',
    name: '用户登录压力测试',
    type: 'stress',
    status: 'completed',
    startTime: '2024-01-27T13:00:00Z',
    endTime: '2024-01-27T13:15:00Z',
    duration: 900,
    virtualUsers: 500,
    requestsPerSecond: 45,
    totalRequests: 22500,
    successRate: 98.5,
    avgResponseTime: 320,
    results: {
      cpu: 85,
      memory: 72,
      errorCount: 337,
      p95ResponseTime: 850,
      p99ResponseTime: 1200
    }
  },
  {
    id: 'test-002',
    name: 'API负载测试',
    type: 'load',
    status: 'completed',
    startTime: '2024-01-27T12:00:00Z',
    endTime: '2024-01-27T12:30:00Z',
    duration: 1800,
    virtualUsers: 200,
    requestsPerSecond: 25,
    totalRequests: 45000,
    successRate: 99.2,
    avgResponseTime: 245,
    results: {
      cpu: 65,
      memory: 58,
      errorCount: 360,
      p95ResponseTime: 650,
      p99ResponseTime: 950
    }
  },
  {
    id: 'test-003',
    name: '数据库连接池测试',
    type: 'spike',
    status: 'running',
    startTime: '2024-01-27T14:20:00Z',
    endTime: null,
    duration: 0,
    virtualUsers: 1000,
    requestsPerSecond: 80,
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    results: {
      cpu: 0,
      memory: 0,
      errorCount: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    }
  }
]

// 模拟性能报告数据
const mockReports: PerformanceReport[] = [
  {
    id: 'report-001',
    name: '2024年1月周性能报告',
    generatedAt: '2024-01-27T10:00:00Z',
    period: '2024-01-20 至 2024-01-27',
    summary: {
      overallScore: 85,
      criticalIssues: 2,
      recommendations: 5,
      testsRun: 12
    },
    categories: {
      performance: 88,
      reliability: 92,
      scalability: 78,
      efficiency: 82
    }
  },
  {
    id: 'report-002',
    name: '2024年1月月度性能报告',
    generatedAt: '2024-01-01T00:00:00Z',
    period: '2023-12-01 至 2024-01-01',
    summary: {
      overallScore: 82,
      criticalIssues: 3,
      recommendations: 8,
      testsRun: 45
    },
    categories: {
      performance: 85,
      reliability: 89,
      scalability: 75,
      efficiency: 79
    }
  }
]

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(mockMetrics)
  const [tests, setTests] = useState<PerformanceTest[]>(mockTests)
  const [reports, setReports] = useState<PerformanceReport[]>(mockReports)
  const [activeTab, setActiveTab] = useState<'metrics' | 'tests' | 'reports'>('metrics')
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

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'scheduled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取分类样式
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'response_time':
        return 'bg-blue-100 text-blue-800'
      case 'throughput':
        return 'bg-green-100 text-green-800'
      case 'resource':
        return 'bg-purple-100 text-purple-800'
      case 'availability':
        return 'bg-orange-100 text-orange-800'
      case 'error_rate':
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
      case 'response_time':
        return <Clock className="w-4 h-4" />
      case 'throughput':
        return <BarChart3 className="w-4 h-4" />
      case 'resource':
        return <Cpu className="w-4 h-4" />
      case 'availability':
        return <Server className="w-4 h-4" />
      case 'error_rate':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Gauge className="w-4 h-4" />
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
      setMetrics(prevMetrics =>
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.category === 'resource' ? 
            Math.floor(Math.random() * 40) + 40 : 
            metric.value + Math.floor(Math.random() * 20) - 10,
          lastUpdated: new Date().toISOString()
        }))
      )
      setIsLoading(false)
    }, 1000)
  }

  const handleRunPerformanceTest = () => {
    alert('执行性能测试功能开发中')
  }

  const handleGenerateReport = () => {
    alert('生成性能报告功能开发中')
  }

  const handleOptimizationAdvice = () => {
    alert('性能优化建议功能开发中')
  }

  const handleConfigureAlert = () => {
    alert('配置性能告警功能开发中')
  }

  const handleSetBaseline = () => {
    alert('设置性能基准功能开发中')
  }

  const handleCompareAnalysis = () => {
    alert('性能对比分析功能开发中')
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

  const criticalMetrics = metrics.filter(m => m.status === 'critical').length
  const warningMetrics = metrics.filter(m => m.status === 'warning').length
  const avgResponseTime = metrics.filter(m => m.category === 'response_time').reduce((sum, m) => sum + m.value, 0) / metrics.filter(m => m.category === 'response_time').length || 0

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
                <Zap className="w-8 h-8 mr-3" />
                性能评估
              </h1>
              <p className="text-gray-600 mt-2">
                系统性能监控、测试和优化分析
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
                onClick={handleRunPerformanceTest}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                性能测试
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateReport}
              >
                <FileText className="w-4 h-4 mr-2" />
                生成报告
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOptimizationAdvice}
              >
                <Download className="w-4 h-4 mr-2" />
                导出分析
              </Button>
            </div>
          </motion.div>

          {/* 性能概览卡片 */}
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
                    <p className="text-sm text-gray-600">平均响应时间</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(avgResponseTime)}ms
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">严重告警</p>
                    <p className="text-2xl font-bold text-red-600">
                      {criticalMetrics}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">警告指标</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {warningMetrics}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">运行中测试</p>
                    <p className="text-2xl font-bold text-green-600">
                      {tests.filter(t => t.status === 'running').length}
                    </p>
                  </div>
                  <PlayCircle className="w-8 h-8 text-green-600" />
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
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'metrics'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              性能指标
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tests'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              性能测试
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              性能报告
            </button>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {activeTab === 'metrics' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleConfigureAlert}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  性能告警配置
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSetBaseline}
                >
                  <Target className="w-4 h-4 mr-2" />
                  性能基准设置
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  性能监控配置
                </Button>
              </>
            )}
            {activeTab === 'tests' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  执行负载测试
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Server className="w-4 h-4 mr-2" />
                  压力测试
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  性能问题诊断
                </Button>
              </>
            )}
            {activeTab === 'reports' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCompareAnalysis}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  性能对比分析
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOptimizationAdvice}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  性能优化建议
                </Button>
              </>
            )}
          </motion.div>

          {/* 搜索和筛选 */}
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
                  activeTab === 'metrics' ? "搜索性能指标名称..." :
                  activeTab === 'tests' ? "搜索测试名称、类型..." :
                  "搜索报告名称、期间..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {activeTab === 'metrics' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部分类</option>
                  <option value="response_time">响应时间</option>
                  <option value="throughput">吞吐量</option>
                  <option value="resource">资源使用</option>
                  <option value="availability">可用性</option>
                  <option value="error_rate">错误率</option>
                </select>
              )}

              {(activeTab === 'tests' || activeTab === 'metrics') && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部状态</option>
                  {activeTab === 'metrics' && (
                    <>
                      <option value="good">正常</option>
                      <option value="warning">警告</option>
                      <option value="critical">严重</option>
                    </>
                  )}
                  {activeTab === 'tests' && (
                    <>
                      <option value="running">运行中</option>
                      <option value="completed">已完成</option>
                      <option value="failed">失败</option>
                      <option value="scheduled">已计划</option>
                    </>
                  )}
                </select>
              )}
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* 内容区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {activeTab === 'metrics' && (
              <Card>
                <CardHeader>
                  <CardTitle>性能指标 ({metrics.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics
                      .filter(metric => 
                        (searchQuery === '' || metric.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterCategory === 'all' || metric.category === filterCategory) &&
                        (filterStatus === 'all' || metric.status === filterStatus)
                      )
                      .map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyle(metric.category)}`}>
                              {getCategoryIcon(metric.category)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {metric.name}
                                </h3>
                                <Badge className={getCategoryStyle(metric.category)}>
                                  {metric.category === 'response_time' && '响应时间'}
                                  {metric.category === 'throughput' && '吞吐量'}
                                  {metric.category === 'resource' && '资源使用'}
                                  {metric.category === 'availability' && '可用性'}
                                  {metric.category === 'error_rate' && '错误率'}
                                </Badge>
                                <Badge className={getStatusStyle(metric.status)}>
                                  {metric.status === 'good' && '正常'}
                                  {metric.status === 'warning' && '警告'}
                                  {metric.status === 'critical' && '严重'}
                                </Badge>
                                {getTrendIcon(metric.trend)}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span className="font-bold text-lg">
                                  {metric.value}{metric.unit}
                                </span>
                                <span>阈值: {metric.threshold}{metric.unit}</span>
                                <span>{metric.description}</span>
                              </div>

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>更新时间: {new Date(metric.lastUpdated).toLocaleString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(metric)}
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

            {activeTab === 'tests' && (
              <Card>
                <CardHeader>
                  <CardTitle>性能测试 ({tests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tests
                      .filter(test => 
                        (searchQuery === '' || 
                         test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.type.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterStatus === 'all' || test.status === filterStatus)
                      )
                      .map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <PlayCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {test.name}
                                </h3>
                                <Badge variant="outline">
                                  {test.type === 'load' && '负载测试'}
                                  {test.type === 'stress' && '压力测试'}
                                  {test.type === 'spike' && '峰值测试'}
                                  {test.type === 'volume' && '容量测试'}
                                  {test.type === 'endurance' && '持续测试'}
                                </Badge>
                                <Badge className={getStatusStyle(test.status)}>
                                  {test.status === 'running' && '运行中'}
                                  {test.status === 'completed' && '已完成'}
                                  {test.status === 'failed' && '失败'}
                                  {test.status === 'scheduled' && '已计划'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>虚拟用户: {test.virtualUsers}</span>
                                <span>请求/秒: {test.requestsPerSecond}</span>
                                {test.status === 'completed' && (
                                  <>
                                    <span>成功率: {test.successRate}%</span>
                                    <span>平均响应: {test.avgResponseTime}ms</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>开始时间: {new Date(test.startTime).toLocaleString('zh-CN')}</span>
                                {test.endTime && (
                                  <span className="ml-4">结束时间: {new Date(test.endTime).toLocaleString('zh-CN')}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(test)}
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

            {activeTab === 'reports' && (
              <Card>
                <CardHeader>
                  <CardTitle>性能报告 ({reports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports
                      .filter(report => 
                        searchQuery === '' || 
                        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        report.period.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {report.name}
                                </h3>
                                <Badge className={`${report.summary.overallScore >= 80 ? 'bg-green-100 text-green-800' : 
                                  report.summary.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  评分: {report.summary.overallScore}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>期间: {report.period}</span>
                                <span>严重问题: {report.summary.criticalIssues}</span>
                                <span>建议: {report.summary.recommendations}</span>
                                <span>测试数: {report.summary.testsRun}</span>
                              </div>

                              <div className="flex items-center space-x-3 text-xs">
                                <span>性能: {report.categories.performance}</span>
                                <span>可靠性: {report.categories.reliability}</span>
                                <span>可扩展性: {report.categories.scalability}</span>
                                <span>效率: {report.categories.efficiency}</span>
                              </div>

                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>生成时间: {new Date(report.generatedAt).toLocaleString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(report)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              查看
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
                      {activeTab === 'metrics' ? '性能指标详情' : 
                       activeTab === 'tests' ? '测试详情' : '报告详情'}
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
                  {activeTab === 'metrics' && selectedItem && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-600 block">指标名称:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">当前值:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedItem.value}{selectedItem.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">阈值:</span>
                        <span className="font-medium">{selectedItem.threshold}{selectedItem.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">状态:</span>
                        <Badge className={getStatusStyle(selectedItem.status)}>
                          {selectedItem.status === 'good' && '正常'}
                          {selectedItem.status === 'warning' && '警告'}
                          {selectedItem.status === 'critical' && '严重'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600 block">趋势:</span>
                        <div className="flex items-center">
                          {getTrendIcon(selectedItem.trend)}
                          <span className="ml-2">
                            {selectedItem.trend === 'up' && '上升'}
                            {selectedItem.trend === 'down' && '下降'}
                            {selectedItem.trend === 'stable' && '稳定'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 block">描述:</span>
                        <span className="font-medium">{selectedItem.description}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tests' && selectedItem && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 block">测试名称:</span>
                              <span className="font-medium">{selectedItem.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">测试类型:</span>
                              <span className="font-medium">
                                {selectedItem.type === 'load' && '负载测试'}
                                {selectedItem.type === 'stress' && '压力测试'}
                                {selectedItem.type === 'spike' && '峰值测试'}
                                {selectedItem.type === 'volume' && '容量测试'}
                                {selectedItem.type === 'endurance' && '持续测试'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">测试状态:</span>
                              <Badge className={getStatusStyle(selectedItem.status)}>
                                {selectedItem.status === 'running' && '运行中'}
                                {selectedItem.status === 'completed' && '已完成'}
                                {selectedItem.status === 'failed' && '失败'}
                                {selectedItem.status === 'scheduled' && '已计划'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {selectedItem.status === 'completed' && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">测试结果</h3>
                            <div className="space-y-3">
                              <div>
                                <span className="text-gray-600 block">成功率:</span>
                                <span className="font-medium">{selectedItem.successRate}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600 block">平均响应时间:</span>
                                <span className="font-medium">{selectedItem.avgResponseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600 block">P95响应时间:</span>
                                <span className="font-medium">{selectedItem.results.p95ResponseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600 block">P99响应时间:</span>
                                <span className="font-medium">{selectedItem.results.p99ResponseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-600 block">错误数量:</span>
                                <span className="font-medium">{selectedItem.results.errorCount}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">配置参数</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">虚拟用户</span>
                            <p className="text-lg font-bold">{selectedItem.virtualUsers}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">请求/秒</span>
                            <p className="text-lg font-bold">{selectedItem.requestsPerSecond}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">总请求数</span>
                            <p className="text-lg font-bold">{selectedItem.totalRequests}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">持续时间</span>
                            <p className="text-lg font-bold">{Math.round(selectedItem.duration / 60)}分钟</p>
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