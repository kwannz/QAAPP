'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Search,
  Filter,
  Download,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  Eye,
  RefreshCw,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Network,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface SystemEvent {
  id: string
  timestamp: string
  eventType: 'performance' | 'security' | 'error' | 'info' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  service: string
  component: string
  message: string
  details: Record<string, any>
  status: 'resolved' | 'active' | 'investigating'
  affectedUsers: number
  responseTime: number
  memoryUsage: number
  cpuUsage: number
}

interface SystemMetrics {
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  activeConnections: number
}

// 模拟系统事件数据
const mockSystemEvents: SystemEvent[] = [
  {
    id: 'sys-001',
    timestamp: '2024-01-27T14:30:00Z',
    eventType: 'performance',
    severity: 'high',
    service: 'API服务',
    component: 'auth-service',
    message: 'API响应时间超过阈值',
    details: {
      endpoint: '/api/auth/login',
      avgResponseTime: 2500,
      threshold: 1000,
      requestCount: 245
    },
    status: 'investigating',
    affectedUsers: 150,
    responseTime: 2500,
    memoryUsage: 85,
    cpuUsage: 78
  },
  {
    id: 'sys-002',
    timestamp: '2024-01-27T14:15:00Z',
    eventType: 'security',
    severity: 'critical',
    service: '认证系统',
    component: 'security-guard',
    message: '检测到大量失败登录尝试',
    details: {
      failedAttempts: 500,
      timeWindow: '5分钟',
      suspiciousIPs: ['45.123.67.89', '203.134.56.78'],
      pattern: '暴力破解攻击'
    },
    status: 'active',
    affectedUsers: 0,
    responseTime: 150,
    memoryUsage: 45,
    cpuUsage: 23
  },
  {
    id: 'sys-003',
    timestamp: '2024-01-27T13:45:00Z',
    eventType: 'error',
    severity: 'medium',
    service: '数据库',
    component: 'postgresql',
    message: '数据库连接池接近饱和',
    details: {
      activeConnections: 95,
      maxConnections: 100,
      waitingQueries: 12,
      avgWaitTime: 450
    },
    status: 'resolved',
    affectedUsers: 25,
    responseTime: 1200,
    memoryUsage: 72,
    cpuUsage: 34
  },
  {
    id: 'sys-004',
    timestamp: '2024-01-27T13:30:00Z',
    eventType: 'warning',
    severity: 'medium',
    service: '缓存系统',
    component: 'redis',
    message: '缓存命中率下降',
    details: {
      hitRate: 65,
      threshold: 80,
      missCount: 1250,
      totalRequests: 3500
    },
    status: 'resolved',
    affectedUsers: 0,
    responseTime: 350,
    memoryUsage: 68,
    cpuUsage: 15
  },
  {
    id: 'sys-005',
    timestamp: '2024-01-27T12:00:00Z',
    eventType: 'info',
    severity: 'low',
    service: '系统维护',
    component: 'backup-service',
    message: '定时备份任务执行成功',
    details: {
      backupSize: '2.5GB',
      duration: '15分钟',
      location: 'backup-server-01',
      status: 'success'
    },
    status: 'resolved',
    affectedUsers: 0,
    responseTime: 0,
    memoryUsage: 25,
    cpuUsage: 8
  },
  {
    id: 'sys-006',
    timestamp: '2024-01-27T11:45:00Z',
    eventType: 'performance',
    severity: 'high',
    service: '区块链服务',
    component: 'blockchain-sync',
    message: '区块同步延迟',
    details: {
      currentBlock: 12345,
      latestBlock: 12350,
      syncDelay: '5分钟',
      gasPrice: 'HIGH'
    },
    status: 'active',
    affectedUsers: 200,
    responseTime: 5000,
    memoryUsage: 78,
    cpuUsage: 65
  }
]

// 模拟系统指标
const mockSystemMetrics: SystemMetrics = {
  uptime: 99.8,
  responseTime: 245,
  errorRate: 0.12,
  throughput: 1250,
  memoryUsage: 68,
  cpuUsage: 45,
  diskUsage: 32,
  activeConnections: 156
}

export default function SystemAuditPage() {
  const [events, setEvents] = useState<SystemEvent[]>(mockSystemEvents)
  const [filteredEvents, setFilteredEvents] = useState<SystemEvent[]>(mockSystemEvents)
  const [metrics, setMetrics] = useState<SystemMetrics>(mockSystemMetrics)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEventType, setFilterEventType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // 应用筛选条件
    let filtered = [...events]

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 事件类型筛选
    if (filterEventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filterEventType)
    }

    // 严重程度筛选
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === filterSeverity)
    }

    // 状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => event.status === filterStatus)
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, filterEventType, filterSeverity, filterStatus])

  // 获取事件类型样式
  const getEventTypeStyle = (eventType: string) => {
    switch (eventType) {
      case 'performance':
        return 'bg-blue-100 text-blue-800'
      case 'security':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-orange-100 text-orange-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取严重程度样式
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取事件类型图标
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'performance':
        return <TrendingUp className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'error':
        return <XCircle className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'info':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const handleViewDetails = (event: SystemEvent) => {
    setSelectedEvent(event)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      // 模拟刷新数据
      setMetrics({
        ...metrics,
        responseTime: Math.floor(Math.random() * 500) + 100,
        cpuUsage: Math.floor(Math.random() * 40) + 30,
        memoryUsage: Math.floor(Math.random() * 30) + 50
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleExportReport = () => {
    alert('导出系统审计报告功能开发中')
  }

  const handleSystemHealthCheck = () => {
    alert('系统健康检查功能开发中')
  }

  const handlePerformanceAnalysis = () => {
    alert('性能分析功能开发中')
  }

  const handleSecurityScan = () => {
    alert('安全扫描功能开发中')
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
                <Server className="w-8 h-8 mr-3" />
                系统审计
              </h1>
              <p className="text-gray-600 mt-2">
                系统事件监控和性能指标分析
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
                onClick={handleSystemHealthCheck}
              >
                <Activity className="w-4 h-4 mr-2" />
                健康检查
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePerformanceAnalysis}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                性能分析
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

          {/* 系统指标卡片 */}
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
                    <p className="text-sm text-gray-600">系统正常运行时间</p>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.uptime}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">平均响应时间</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.responseTime}ms
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">错误率</p>
                    <p className="text-2xl font-bold text-red-600">
                      {metrics.errorRate}%
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
                    <p className="text-sm text-gray-600">活跃连接数</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {metrics.activeConnections}
                    </p>
                  </div>
                  <Network className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 资源使用情况 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-medium">CPU使用率</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.cpuUsage > 80 ? 'bg-red-500' :
                      metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.cpuUsage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 mr-2 text-green-600" />
                    <span className="font-medium">内存使用率</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.memoryUsage > 80 ? 'bg-red-500' :
                      metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.memoryUsage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <HardDrive className="w-5 h-5 mr-2 text-purple-600" />
                    <span className="font-medium">磁盘使用率</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.diskUsage > 80 ? 'bg-red-500' :
                      metrics.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.diskUsage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSecurityScan}
            >
              <Shield className="w-4 h-4 mr-2" />
              安全事件追踪
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              系统状态概览
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              错误异常事件
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              性能指标审计
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Database className="w-4 h-4 mr-2" />
              系统关键事件
            </Button>
          </motion.div>

          {/* 筛选和搜索 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索服务、组件、事件消息..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部类型</option>
                <option value="performance">性能</option>
                <option value="security">安全</option>
                <option value="error">错误</option>
                <option value="warning">警告</option>
                <option value="info">信息</option>
              </select>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部级别</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="critical">严重</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="investigating">调查中</option>
                <option value="resolved">已解决</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* 系统事件列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>系统事件 ({filteredEvents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventTypeStyle(event.eventType)}`}>
                          {getEventTypeIcon(event.eventType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {event.message}
                            </h3>
                            <Badge className={getEventTypeStyle(event.eventType)}>
                              {event.eventType === 'performance' && '性能'}
                              {event.eventType === 'security' && '安全'}
                              {event.eventType === 'error' && '错误'}
                              {event.eventType === 'warning' && '警告'}
                              {event.eventType === 'info' && '信息'}
                            </Badge>
                            <Badge className={getSeverityStyle(event.severity)}>
                              {event.severity === 'low' && '低'}
                              {event.severity === 'medium' && '中'}
                              {event.severity === 'high' && '高'}
                              {event.severity === 'critical' && '严重'}
                            </Badge>
                            <Badge className={getStatusStyle(event.status)}>
                              {event.status === 'active' && '活跃'}
                              {event.status === 'investigating' && '调查中'}
                              {event.status === 'resolved' && '已解决'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                            <span>服务: {event.service}</span>
                            <span>组件: {event.component}</span>
                            <span>响应时间: {event.responseTime}ms</span>
                            <span>影响用户: {event.affectedUsers}</span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Cpu className="w-3 h-3 mr-1" />
                              <span>CPU: {event.cpuUsage}%</span>
                            </div>
                            <div className="flex items-center">
                              <Database className="w-3 h-3 mr-1" />
                              <span>内存: {event.memoryUsage}%</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{new Date(event.timestamp).toLocaleString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(event)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredEvents.length === 0 && (
                    <div className="text-center py-12">
                      <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到系统事件</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterEventType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all'
                          ? '尝试调整搜索条件或筛选器'
                          : '暂无系统事件记录'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 事件详情弹窗 */}
          {showDetailModal && selectedEvent && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">系统事件详情</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 基本信息 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">事件消息:</span>
                          <span className="font-medium">{selectedEvent.message}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">事件类型:</span>
                          <Badge className={getEventTypeStyle(selectedEvent.eventType)}>
                            {selectedEvent.eventType === 'performance' && '性能'}
                            {selectedEvent.eventType === 'security' && '安全'}
                            {selectedEvent.eventType === 'error' && '错误'}
                            {selectedEvent.eventType === 'warning' && '警告'}
                            {selectedEvent.eventType === 'info' && '信息'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">严重程度:</span>
                          <Badge className={getSeverityStyle(selectedEvent.severity)}>
                            {selectedEvent.severity === 'low' && '低'}
                            {selectedEvent.severity === 'medium' && '中'}
                            {selectedEvent.severity === 'high' && '高'}
                            {selectedEvent.severity === 'critical' && '严重'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">事件状态:</span>
                          <Badge className={getStatusStyle(selectedEvent.status)}>
                            {selectedEvent.status === 'active' && '活跃'}
                            {selectedEvent.status === 'investigating' && '调查中'}
                            {selectedEvent.status === 'resolved' && '已解决'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">发生时间:</span>
                          <span className="font-medium">
                            {new Date(selectedEvent.timestamp).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 系统信息 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">系统信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">服务:</span>
                          <span className="font-medium">{selectedEvent.service}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">组件:</span>
                          <span className="font-medium">{selectedEvent.component}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">响应时间:</span>
                          <span className="font-medium">{selectedEvent.responseTime}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">影响用户数:</span>
                          <span className={`font-medium ${selectedEvent.affectedUsers > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedEvent.affectedUsers}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">事件ID:</span>
                          <span className="font-mono text-sm">{selectedEvent.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 性能指标 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">性能指标</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <Cpu className="w-5 h-5 mr-2 text-blue-600" />
                          <span>CPU使用率</span>
                        </div>
                        <span className="font-bold">{selectedEvent.cpuUsage}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <Database className="w-5 h-5 mr-2 text-green-600" />
                          <span>内存使用率</span>
                        </div>
                        <span className="font-bold">{selectedEvent.memoryUsage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  {selectedEvent.details && Object.keys(selectedEvent.details).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">详细信息</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedEvent.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 关闭按钮 */}
                  <div className="flex justify-end pt-4 border-t">
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