'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  Eye,
  RefreshCw,
  Clock,
  Database,
  Settings,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface AuditLog {
  id: string
  actorId: string
  actorEmail: string
  actorType: string
  action: string
  resourceType: string
  resourceId: string
  ipAddress: string
  userAgent: string
  metadata: Record<string, any>
  createdAt: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'user' | 'admin' | 'system' | 'transaction'
}

// 模拟审计日志数据
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    actorId: 'admin-001',
    actorEmail: 'admin@example.com',
    actorType: 'ADMIN',
    action: 'KYC_APPROVED',
    resourceType: 'USER',
    resourceId: 'user-001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: {
      userName: '张小明',
      userEmail: 'zhang@example.com',
      kycScore: 85
    },
    createdAt: '2024-01-27T14:30:00Z',
    severity: 'medium',
    category: 'admin'
  },
  {
    id: 'log-002',
    actorId: 'user-002',
    actorEmail: 'li@example.com',
    actorType: 'USER',
    action: 'LOGIN_SUCCESS',
    resourceType: 'SESSION',
    resourceId: 'session-123',
    ipAddress: '203.134.56.78',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: {
      loginMethod: 'email',
      sessionDuration: 3600
    },
    createdAt: '2024-01-27T14:15:00Z',
    severity: 'low',
    category: 'auth'
  },
  {
    id: 'log-003',
    actorId: 'user-003',
    actorEmail: 'wang@example.com',
    actorType: 'USER',
    action: 'ORDER_CREATED',
    resourceType: 'ORDER',
    resourceId: 'order-456',
    ipAddress: '114.55.123.45',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    metadata: {
      productId: 'prod-gold-001',
      amount: 50000,
      currency: 'USDT'
    },
    createdAt: '2024-01-27T13:45:00Z',
    severity: 'high',
    category: 'transaction'
  },
  {
    id: 'log-004',
    actorId: 'system',
    actorEmail: 'system@qa-app.com',
    actorType: 'SYSTEM',
    action: 'PAYOUT_DISTRIBUTED',
    resourceType: 'PAYOUT',
    resourceId: 'payout-789',
    ipAddress: '127.0.0.1',
    userAgent: 'QA-System/1.0',
    metadata: {
      batchId: 'batch-2024-01-27',
      totalAmount: 12456.78,
      userCount: 245
    },
    createdAt: '2024-01-27T10:00:00Z',
    severity: 'medium',
    category: 'system'
  },
  {
    id: 'log-005',
    actorId: 'admin-002',
    actorEmail: 'admin2@example.com',
    actorType: 'ADMIN',
    action: 'USER_BANNED',
    resourceType: 'USER',
    resourceId: 'user-004',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: {
      reason: '违规行为',
      userName: '赵小丽',
      userEmail: 'zhao@example.com'
    },
    createdAt: '2024-01-27T09:20:00Z',
    severity: 'critical',
    category: 'admin'
  },
  {
    id: 'log-006',
    actorId: 'user-005',
    actorEmail: 'test@example.com',
    actorType: 'USER',
    action: 'LOGIN_FAILED',
    resourceType: 'SESSION',
    resourceId: 'failed-login-001',
    ipAddress: '45.123.67.89',
    userAgent: 'curl/7.68.0',
    metadata: {
      reason: 'invalid_password',
      attempts: 5
    },
    createdAt: '2024-01-27T08:55:00Z',
    severity: 'high',
    category: 'auth'
  }
]

const actionLabels: Record<string, string> = {
  'LOGIN_SUCCESS': '登录成功',
  'LOGIN_FAILED': '登录失败',
  'LOGOUT': '登出',
  'KYC_APPROVED': 'KYC审核通过',
  'KYC_REJECTED': 'KYC审核拒绝',
  'USER_CREATED': '用户注册',
  'USER_UPDATED': '用户信息更新',
  'USER_BANNED': '用户被封禁',
  'USER_UNBANNED': '用户解封',
  'ORDER_CREATED': '订单创建',
  'ORDER_CANCELLED': '订单取消',
  'PAYOUT_DISTRIBUTED': '收益分发',
  'WITHDRAWAL_REQUESTED': '提现申请',
  'WITHDRAWAL_APPROVED': '提现审核通过',
  'PASSWORD_RESET': '密码重置',
  'SYSTEM_BACKUP': '系统备份',
  'CONFIG_UPDATED': '配置更新'
}

const categoryLabels: Record<string, string> = {
  'auth': '认证',
  'user': '用户',
  'admin': '管理',
  'system': '系统',
  'transaction': '交易'
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('today')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
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
    let filtered = [...logs]

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery) ||
        actionLabels[log.action]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 分类筛选
    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory)
    }

    // 严重程度筛选
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === filterSeverity)
    }

    // 时间范围筛选
    if (filterDateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()

      switch (filterDateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(log => 
        new Date(log.createdAt) >= startDate
      )
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery, filterCategory, filterSeverity, filterDateRange])

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

  // 获取分类样式
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'auth':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-indigo-100 text-indigo-800'
      case 'system':
        return 'bg-gray-100 text-gray-800'
      case 'transaction':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <Lock className="w-4 h-4" />
      case 'user':
        return <User className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      case 'transaction':
        return <Activity className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // 模拟刷新数据
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExportLogs = () => {
    // TODO: 实现导出功能
    alert('导出功能开发中')
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
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
                <FileText className="w-8 h-8 mr-3" />
                审计日志
              </h1>
              <p className="text-gray-600 mt-2">
                系统操作记录和安全审计追踪
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
                onClick={handleExportLogs}
              >
                <Download className="w-4 h-4 mr-2" />
                导出日志
              </Button>
            </div>
          </motion.div>

          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">总日志数</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {logs.length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">今日活动</p>
                    <p className="text-2xl font-bold text-green-600">
                      {logs.filter(log => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return new Date(log.createdAt) >= today
                      }).length}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">高风险操作</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {logs.filter(log => log.severity === 'high').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">严重告警</p>
                    <p className="text-2xl font-bold text-red-600">
                      {logs.filter(log => log.severity === 'critical').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">登录失败</p>
                    <p className="text-2xl font-bold text-red-600">
                      {logs.filter(log => log.action === 'LOGIN_FAILED').length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 筛选和搜索 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索用户邮箱、操作类型、IP地址..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部分类</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
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
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="week">近7天</option>
                <option value="month">近30天</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* 日志列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>操作日志 ({filteredLogs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyle(log.category)}`}>
                          {getCategoryIcon(log.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {actionLabels[log.action] || log.action}
                            </h3>
                            <Badge className={getCategoryStyle(log.category)}>
                              {categoryLabels[log.category]}
                            </Badge>
                            <Badge className={getSeverityStyle(log.severity)}>
                              {log.severity === 'low' && '低'}
                              {log.severity === 'medium' && '中'}
                              {log.severity === 'high' && '高'}
                              {log.severity === 'critical' && '严重'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>用户: {log.actorEmail}</span>
                            <span>IP: {log.ipAddress}</span>
                            <span>资源: {log.resourceType}#{log.resourceId}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{new Date(log.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到日志</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterCategory !== 'all' || filterSeverity !== 'all' || filterDateRange !== 'all'
                          ? '尝试调整搜索条件或筛选器'
                          : '暂无审计日志记录'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 日志详情弹窗 */}
          {showDetailModal && selectedLog && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">日志详细信息</h2>
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
                          <span className="text-gray-600 block">操作类型:</span>
                          <span className="font-medium">{actionLabels[selectedLog.action] || selectedLog.action}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">操作分类:</span>
                          <Badge className={getCategoryStyle(selectedLog.category)}>
                            {categoryLabels[selectedLog.category]}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">严重程度:</span>
                          <Badge className={getSeverityStyle(selectedLog.severity)}>
                            {selectedLog.severity === 'low' && '低'}
                            {selectedLog.severity === 'medium' && '中'}
                            {selectedLog.severity === 'high' && '高'}
                            {selectedLog.severity === 'critical' && '严重'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">操作时间:</span>
                          <span className="font-medium">
                            {new Date(selectedLog.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 用户信息 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">操作者信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">用户ID:</span>
                          <span className="font-medium">{selectedLog.actorId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">邮箱:</span>
                          <span className="font-medium">{selectedLog.actorEmail}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">用户类型:</span>
                          <span className="font-medium">{selectedLog.actorType}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">IP地址:</span>
                          <span className="font-medium">{selectedLog.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 资源信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">资源信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600 block">资源类型:</span>
                        <span className="font-medium">{selectedLog.resourceType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">资源ID:</span>
                        <span className="font-medium">{selectedLog.resourceId}</span>
                      </div>
                    </div>
                  </div>

                  {/* 技术信息 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">技术信息</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 block">用户代理:</span>
                        <code className="text-xs bg-gray-100 p-2 rounded block mt-1">
                          {selectedLog.userAgent}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-600 block">日志ID:</span>
                        <span className="font-mono text-sm">{selectedLog.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* 元数据 */}
                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">附加信息</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.metadata, null, 2)}
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