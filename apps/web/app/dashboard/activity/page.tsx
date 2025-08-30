'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Shield,
  User,
  Settings,
  CreditCard,
  LogIn,
  LogOut,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  FileText,
  Edit,
  Trash2,
  Calendar,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../lib/auth-context'

// 活动日志类型定义
interface ActivityLog {
  id: string
  type: 'AUTH' | 'SECURITY' | 'PROFILE' | 'FINANCIAL' | 'SYSTEM' | 'API'
  action: string
  category: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'TRANSACTION' | 'SETTINGS' | 'SECURITY' | 'API_ACCESS' | 'DEVICE' | 'EMAIL' | 'PHONE'
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO'
  description: string
  details: {
    ip?: string
    userAgent?: string
    location?: string
    deviceType?: 'MOBILE' | 'DESKTOP' | 'TABLET'
    browser?: string
    os?: string
    amount?: number
    currency?: string
    previousValue?: string
    newValue?: string
    reason?: string
    endpoint?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    responseCode?: number
    errorMessage?: string
  }
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  createdAt: string
  relatedId?: string
  sessionId?: string
}

interface ActivitySummary {
  totalActivities: number
  todayActivities: number
  securityEvents: number
  failedAttempts: number
  uniqueDevices: number
  uniqueLocations: number
  riskScore: number
}

// 模拟数据
const mockActivities: ActivityLog[] = [
  {
    id: 'log-001',
    type: 'AUTH',
    action: '用户登录',
    category: 'LOGIN',
    status: 'SUCCESS',
    description: '从新设备成功登录',
    details: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15',
      location: '北京市, 中国',
      deviceType: 'MOBILE',
      browser: 'Safari',
      os: 'iOS 17.2'
    },
    riskLevel: 'MEDIUM',
    createdAt: '2024-02-01T10:30:00Z',
    sessionId: 'session-abc123'
  },
  {
    id: 'log-002',
    type: 'FINANCIAL',
    action: '投资交易',
    category: 'TRANSACTION',
    status: 'SUCCESS',
    description: '购买QA黄金卡投资产品',
    details: {
      amount: 10000,
      currency: 'USDT',
      ip: '192.168.1.100'
    },
    riskLevel: 'LOW',
    createdAt: '2024-02-01T10:35:00Z',
    relatedId: 'ORDER-2024-001'
  },
  {
    id: 'log-003',
    type: 'SECURITY',
    action: '密码修改',
    category: 'PASSWORD_CHANGE',
    status: 'SUCCESS',
    description: '用户修改登录密码',
    details: {
      ip: '192.168.1.100',
      location: '北京市, 中国'
    },
    riskLevel: 'MEDIUM',
    createdAt: '2024-02-01T09:15:00Z'
  },
  {
    id: 'log-004',
    type: 'AUTH',
    action: '异常登录尝试',
    category: 'LOGIN',
    status: 'FAILED',
    description: '来自异常位置的登录尝试被阻止',
    details: {
      ip: '203.0.113.45',
      location: '上海市, 中国',
      deviceType: 'DESKTOP',
      browser: 'Chrome',
      os: 'Windows 11',
      reason: '异常地理位置'
    },
    riskLevel: 'HIGH',
    createdAt: '2024-01-31T22:45:00Z'
  },
  {
    id: 'log-005',
    type: 'PROFILE',
    action: '个人信息更新',
    category: 'PROFILE_UPDATE',
    status: 'SUCCESS',
    description: '更新个人资料信息',
    details: {
      ip: '192.168.1.100',
      previousValue: 'John Smith',
      newValue: 'John Doe'
    },
    riskLevel: 'LOW',
    createdAt: '2024-01-31T16:20:00Z'
  },
  {
    id: 'log-006',
    type: 'FINANCIAL',
    action: '提现申请',
    category: 'TRANSACTION',
    status: 'SUCCESS',
    description: '申请提现到银行账户',
    details: {
      amount: 2500,
      currency: 'USDT',
      ip: '192.168.1.100'
    },
    riskLevel: 'MEDIUM',
    createdAt: '2024-01-31T14:20:00Z',
    relatedId: 'WITHDRAW-2024-003'
  },
  {
    id: 'log-007',
    type: 'SECURITY',
    action: '双重认证设置',
    category: 'SECURITY',
    status: 'SUCCESS',
    description: '启用Google Authenticator双重认证',
    details: {
      ip: '192.168.1.100',
      previousValue: 'disabled',
      newValue: 'enabled'
    },
    riskLevel: 'LOW',
    createdAt: '2024-01-30T11:30:00Z'
  },
  {
    id: 'log-008',
    type: 'API',
    action: 'API访问',
    category: 'API_ACCESS',
    status: 'SUCCESS',
    description: '通过API获取账户余额',
    details: {
      endpoint: '/api/v1/account/balance',
      method: 'GET',
      responseCode: 200,
      ip: '192.168.1.100'
    },
    riskLevel: 'LOW',
    createdAt: '2024-01-30T09:45:00Z'
  },
  {
    id: 'log-009',
    type: 'AUTH',
    action: '登出',
    category: 'LOGOUT',
    status: 'SUCCESS',
    description: '用户主动登出',
    details: {
      ip: '192.168.1.101',
      deviceType: 'DESKTOP',
      browser: 'Chrome',
      os: 'macOS'
    },
    riskLevel: 'LOW',
    createdAt: '2024-01-29T18:30:00Z',
    sessionId: 'session-def456'
  },
  {
    id: 'log-010',
    type: 'SECURITY',
    action: '可疑活动检测',
    category: 'SECURITY',
    status: 'WARNING',
    description: '检测到短时间内多次API调用',
    details: {
      ip: '192.168.1.100',
      endpoint: '/api/v1/transactions',
      method: 'GET',
      reason: '频率异常'
    },
    riskLevel: 'MEDIUM',
    createdAt: '2024-01-29T14:15:00Z'
  },
  {
    id: 'log-011',
    type: 'PROFILE',
    action: '邮箱验证',
    category: 'EMAIL',
    status: 'SUCCESS',
    description: '邮箱地址验证完成',
    details: {
      ip: '192.168.1.100',
      newValue: 'john.doe@example.com'
    },
    riskLevel: 'LOW',
    createdAt: '2024-01-28T10:20:00Z'
  },
  {
    id: 'log-012',
    type: 'FINANCIAL',
    action: '佣金收入',
    category: 'TRANSACTION',
    status: 'SUCCESS',
    description: '收到推荐佣金',
    details: {
      amount: 150,
      currency: 'USDT'
    },
    riskLevel: 'LOW',
    createdAt: '2024-01-28T08:45:00Z',
    relatedId: 'COMMISSION-001'
  }
]

const mockSummary: ActivitySummary = {
  totalActivities: 12,
  todayActivities: 3,
  securityEvents: 4,
  failedAttempts: 1,
  uniqueDevices: 3,
  uniqueLocations: 2,
  riskScore: 2.3
}

export default function UserActivity() {
  const { user } = useAuthStore()
  const [activities] = useState<ActivityLog[]>(mockActivities)
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>(mockActivities)
  const [summary] = useState<ActivitySummary>(mockSummary)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'AUTH' | 'SECURITY' | 'PROFILE' | 'FINANCIAL' | 'SYSTEM' | 'API'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO'>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('7')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = [...activities]

    // 日期筛选
    if (dateRangeFilter !== 'all') {
      const days = parseInt(dateRangeFilter)
      const cutoffDate = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(activity => new Date(activity.createdAt) >= cutoffDate)
    }

    // 类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter)
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter)
    }

    // 风险级别筛选
    if (riskFilter !== 'all') {
      filtered = filtered.filter(activity => activity.riskLevel === riskFilter)
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.ip?.includes(searchTerm) ||
        activity.details.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 按时间倒序排列
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredActivities(filtered)
  }, [activities, searchTerm, typeFilter, statusFilter, riskFilter, dateRangeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      case 'WARNING': return 'text-orange-600 bg-orange-100'
      case 'INFO': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'CRITICAL': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string, category?: string) => {
    switch (type) {
      case 'AUTH':
        return category === 'LOGIN' ? LogIn : category === 'LOGOUT' ? LogOut : Shield
      case 'SECURITY':
        return category === 'PASSWORD_CHANGE' ? Key : Shield
      case 'PROFILE':
        return category === 'EMAIL' ? Mail : category === 'PHONE' ? Phone : User
      case 'FINANCIAL':
        return CreditCard
      case 'API':
        return Globe
      case 'SYSTEM':
        return Settings
      default:
        return Activity
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'AUTH': return '身份认证'
      case 'SECURITY': return '安全'
      case 'PROFILE': return '个人资料'
      case 'FINANCIAL': return '财务'
      case 'API': return 'API访问'
      case 'SYSTEM': return '系统'
      default: return '活动'
    }
  }

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'MOBILE': return Smartphone
      case 'DESKTOP': return Monitor
      default: return Monitor
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score < 1) return 'text-green-600'
    if (score < 3) return 'text-yellow-600'
    if (score < 5) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('Exporting activity logs...', filteredActivities)
  }

  const handleRefresh = () => {
    // TODO: 刷新活动日志
    console.log('Refreshing activity logs...')
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-gray-50">
            <div className="qa-container py-8">
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {/* 页面标题 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">活动日志</h1>
                  <p className="text-gray-600 mt-2">
                    查看您的账户活动和安全事件记录
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    导出日志
                  </Button>
                </div>
              </motion.div>

              {/* 统计概览 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总活动数</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {summary.totalActivities}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-blue-600 font-medium">
                            今日 {summary.todayActivities}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">安全事件</p>
                        <p className="text-2xl font-bold text-orange-600 mt-1">
                          {summary.securityEvents}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-red-600 font-medium">
                            失败 {summary.failedAttempts}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">设备数量</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {summary.uniqueDevices}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {summary.uniqueLocations} 个位置
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">风险评分</p>
                        <p className={`text-2xl font-bold mt-1 ${getRiskScoreColor(summary.riskScore)}`}>
                          {summary.riskScore.toFixed(1)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 font-medium">
                            {summary.riskScore < 3 ? '安全' : summary.riskScore < 5 ? '注意' : '高风险'}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 筛选和搜索 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="搜索活动记录..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    
                    <select
                      value={dateRangeFilter}
                      onChange={(e) => setDateRangeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">全部时间</option>
                      <option value="1">最近24小时</option>
                      <option value="7">最近7天</option>
                      <option value="30">最近30天</option>
                      <option value="90">最近90天</option>
                    </select>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有类型</option>
                      <option value="AUTH">身份认证</option>
                      <option value="SECURITY">安全</option>
                      <option value="PROFILE">个人资料</option>
                      <option value="FINANCIAL">财务</option>
                      <option value="API">API访问</option>
                      <option value="SYSTEM">系统</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有状态</option>
                      <option value="SUCCESS">成功</option>
                      <option value="FAILED">失败</option>
                      <option value="WARNING">警告</option>
                      <option value="INFO">信息</option>
                    </select>

                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有风险</option>
                      <option value="LOW">低风险</option>
                      <option value="MEDIUM">中风险</option>
                      <option value="HIGH">高风险</option>
                      <option value="CRITICAL">严重</option>
                    </select>
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleExport()}>
                        <Download className="w-4 h-4 mr-2" />
                        导出选中 ({selectedItems.length})
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedItems([])}>
                        取消选择
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 活动日志列表 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>活动记录 ({filteredActivities.length})</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedItems.length === filteredActivities.length) {
                            setSelectedItems([])
                          } else {
                            setSelectedItems(filteredActivities.map(activity => activity.id))
                          }
                        }}
                      >
                        {selectedItems.length === filteredActivities.length ? '取消全选' : '全选'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredActivities.map((activity) => {
                        const TypeIcon = getTypeIcon(activity.type, activity.category)
                        const DeviceIcon = getDeviceIcon(activity.details.deviceType)
                        const isSelected = selectedItems.includes(activity.id)
                        
                        return (
                          <div 
                            key={activity.id}
                            className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <input
                                type="checkbox"
                                className="mt-1 rounded border-gray-300"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, activity.id])
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== activity.id))
                                  }
                                }}
                              />
                              
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                activity.status === 'SUCCESS' ? 'bg-green-100' :
                                activity.status === 'FAILED' ? 'bg-red-100' :
                                activity.status === 'WARNING' ? 'bg-orange-100' :
                                'bg-blue-100'
                              }`}>
                                <TypeIcon className={`w-5 h-5 ${
                                  activity.status === 'SUCCESS' ? 'text-green-600' :
                                  activity.status === 'FAILED' ? 'text-red-600' :
                                  activity.status === 'WARNING' ? 'text-orange-600' :
                                  'text-blue-600'
                                }`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h4 className="font-medium text-gray-900">{activity.action}</h4>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                        {activity.status === 'SUCCESS' ? '成功' :
                                         activity.status === 'FAILED' ? '失败' :
                                         activity.status === 'WARNING' ? '警告' : '信息'}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(activity.riskLevel)}`}>
                                        {activity.riskLevel === 'LOW' ? '低风险' :
                                         activity.riskLevel === 'MEDIUM' ? '中风险' :
                                         activity.riskLevel === 'HIGH' ? '高风险' : '严重'}
                                      </span>
                                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                        {getTypeName(activity.type)}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-500">
                                      {activity.details.ip && (
                                        <div className="flex items-center space-x-1">
                                          <Globe className="w-3 h-3" />
                                          <span>IP: {activity.details.ip}</span>
                                        </div>
                                      )}
                                      
                                      {activity.details.location && (
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="w-3 h-3" />
                                          <span>{activity.details.location}</span>
                                        </div>
                                      )}
                                      
                                      {activity.details.deviceType && (
                                        <div className="flex items-center space-x-1">
                                          <DeviceIcon className="w-3 h-3" />
                                          <span>{activity.details.browser} / {activity.details.os}</span>
                                        </div>
                                      )}
                                      
                                      {activity.details.amount && (
                                        <div className="flex items-center space-x-1">
                                          <CreditCard className="w-3 h-3" />
                                          <span>{activity.details.amount} {activity.details.currency}</span>
                                        </div>
                                      )}
                                      
                                      {activity.details.endpoint && (
                                        <div className="flex items-center space-x-1">
                                          <Globe className="w-3 h-3" />
                                          <span>{activity.details.method} {activity.details.endpoint}</span>
                                        </div>
                                      )}
                                      
                                      {activity.relatedId && (
                                        <div className="flex items-center space-x-1">
                                          <FileText className="w-3 h-3" />
                                          <span>关联: {activity.relatedId}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {(activity.details.reason || activity.details.errorMessage) && (
                                      <div className="mt-3 p-2 bg-orange-50 rounded text-xs">
                                        <div className="flex items-center space-x-1 text-orange-600">
                                          <AlertTriangle className="w-3 h-3" />
                                          <span>{activity.details.reason || activity.details.errorMessage}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {(activity.details.previousValue || activity.details.newValue) && (
                                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                                        <div className="text-blue-700">
                                          {activity.details.previousValue && (
                                            <div>旧值: {activity.details.previousValue}</div>
                                          )}
                                          {activity.details.newValue && (
                                            <div>新值: {activity.details.newValue}</div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-right ml-4">
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                      {formatDate(activity.createdAt)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ID: {activity.id}
                                    </div>
                                    {activity.sessionId && (
                                      <div className="text-xs text-gray-500">
                                        会话: {activity.sessionId.slice(-6)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDateTime(activity.createdAt)}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {filteredActivities.length === 0 && (
                        <div className="text-center py-12">
                          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动记录</h3>
                          <p className="text-gray-600">
                            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || riskFilter !== 'all'
                              ? '没有找到匹配的活动记录，请调整筛选条件'
                              : '您还没有任何活动记录'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}