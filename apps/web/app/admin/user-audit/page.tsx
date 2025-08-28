'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
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
  TrendingUp,
  MapPin,
  Smartphone,
  Flag,
  BarChart3,
  UserCheck,
  UserX,
  Ban
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'
import { auditApi } from '../../../lib/api-client'
import { downloadCSV, formatUserAuditForExport } from '../../../lib/export-utils'
import toast from 'react-hot-toast'

interface UserAudit {
  id: string
  userId: string
  userEmail: string
  userName: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  totalActivities: number
  suspiciousActivities: number
  lastActivity: string
  registrationDate: string
  loginFrequency: number
  deviceCount: number
  ipAddresses: string[]
  behaviorScore: number
  flaggedActions: string[]
  status: 'active' | 'suspicious' | 'blocked' | 'under_review'
  kycStatus: 'pending' | 'approved' | 'rejected'
  totalInvestment: number
  totalEarnings: number
}

// 模拟用户审计数据
const mockUserAudits: UserAudit[] = [
  {
    id: 'audit-001',
    userId: 'user-001',
    userEmail: 'zhang@example.com',
    userName: '张小明',
    riskLevel: 'medium',
    totalActivities: 156,
    suspiciousActivities: 3,
    lastActivity: '2024-01-27T14:30:00Z',
    registrationDate: '2023-12-01T10:00:00Z',
    loginFrequency: 12,
    deviceCount: 2,
    ipAddresses: ['192.168.1.100', '203.134.56.78'],
    behaviorScore: 78,
    flaggedActions: ['多设备登录', '异地登录'],
    status: 'active',
    kycStatus: 'approved',
    totalInvestment: 50000,
    totalEarnings: 2340
  },
  {
    id: 'audit-002',
    userId: 'user-002',
    userEmail: 'li@example.com',
    userName: '李小华',
    riskLevel: 'low',
    totalActivities: 89,
    suspiciousActivities: 0,
    lastActivity: '2024-01-27T13:15:00Z',
    registrationDate: '2024-01-15T08:30:00Z',
    loginFrequency: 8,
    deviceCount: 1,
    ipAddresses: ['114.55.123.45'],
    behaviorScore: 92,
    flaggedActions: [],
    status: 'active',
    kycStatus: 'approved',
    totalInvestment: 25000,
    totalEarnings: 1125
  },
  {
    id: 'audit-003',
    userId: 'user-003',
    userEmail: 'wang@example.com',
    userName: '王小强',
    riskLevel: 'high',
    totalActivities: 234,
    suspiciousActivities: 12,
    lastActivity: '2024-01-27T15:45:00Z',
    registrationDate: '2023-11-20T14:20:00Z',
    loginFrequency: 25,
    deviceCount: 5,
    ipAddresses: ['45.123.67.89', '203.134.56.78', '114.55.123.45', '192.168.1.100'],
    behaviorScore: 45,
    flaggedActions: ['频繁登录', '多设备登录', '异地登录', '短时间大额交易'],
    status: 'suspicious',
    kycStatus: 'under_review',
    totalInvestment: 150000,
    totalEarnings: 8750
  },
  {
    id: 'audit-004',
    userId: 'user-004',
    userEmail: 'zhao@example.com',
    userName: '赵小丽',
    riskLevel: 'critical',
    totalActivities: 45,
    suspiciousActivities: 18,
    lastActivity: '2024-01-26T09:20:00Z',
    registrationDate: '2024-01-20T16:45:00Z',
    loginFrequency: 15,
    deviceCount: 3,
    ipAddresses: ['45.123.67.89', '203.134.56.78'],
    behaviorScore: 25,
    flaggedActions: ['短期注册大额投资', '异常交易模式', '多设备登录'],
    status: 'blocked',
    kycStatus: 'rejected',
    totalInvestment: 200000,
    totalEarnings: 0
  },
  {
    id: 'audit-005',
    userId: 'user-005',
    userEmail: 'chen@example.com',
    userName: '陈小飞',
    riskLevel: 'low',
    totalActivities: 67,
    suspiciousActivities: 1,
    lastActivity: '2024-01-27T11:30:00Z',
    registrationDate: '2023-10-15T09:15:00Z',
    loginFrequency: 6,
    deviceCount: 1,
    ipAddresses: ['114.55.123.45'],
    behaviorScore: 88,
    flaggedActions: ['异地登录'],
    status: 'active',
    kycStatus: 'approved',
    totalInvestment: 35000,
    totalEarnings: 1890
  }
]

export default function UserAuditPage() {
  const [audits, setAudits] = useState<UserAudit[]>(mockUserAudits)
  const [filteredAudits, setFilteredAudits] = useState<UserAudit[]>(mockUserAudits)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterKycStatus, setFilterKycStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserAudit | null>(null)
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
    let filtered = [...audits]

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(audit => 
        audit.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.userId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 风险等级筛选
    if (filterRiskLevel !== 'all') {
      filtered = filtered.filter(audit => audit.riskLevel === filterRiskLevel)
    }

    // 状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(audit => audit.status === filterStatus)
    }

    // KYC状态筛选
    if (filterKycStatus !== 'all') {
      filtered = filtered.filter(audit => audit.kycStatus === filterKycStatus)
    }

    setFilteredAudits(filtered)
  }, [audits, searchQuery, filterRiskLevel, filterStatus, filterKycStatus])

  // 获取风险等级样式
  const getRiskLevelStyle = (riskLevel: string) => {
    switch (riskLevel) {
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
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取KYC状态样式
  const getKycStatusStyle = (kycStatus: string) => {
    switch (kycStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (audit: UserAudit) => {
    setSelectedUser(audit)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExportReport = () => {
    alert('导出用户审计报告功能开发中')
  }

  const handleBehaviorAnalysis = () => {
    alert('用户行为分析功能开发中')
  }

  const handleRiskAssessment = () => {
    alert('用户风险评估功能开发中')
  }

  const handleBulkReview = () => {
    alert('批量用户审查功能开发中')
  }

  const handleGenerateProfile = () => {
    alert('用户画像生成功能开发中')
  }

  const handleActivityReport = () => {
    alert('用户活动报告功能开发中')
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
                <Users className="w-8 h-8 mr-3" />
                用户审计
              </h1>
              <p className="text-gray-600 mt-2">
                用户行为分析和风险评估监控
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
                onClick={handleBehaviorAnalysis}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                行为分析
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRiskAssessment}
              >
                <Shield className="w-4 h-4 mr-2" />
                风险评估
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

          {/* 统计卡片 */}
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
                    <p className="text-sm text-gray-600">总用户数</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {audits.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">可疑用户</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {audits.filter(audit => audit.status === 'suspicious').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">高风险用户</p>
                    <p className="text-2xl font-bold text-red-600">
                      {audits.filter(audit => audit.riskLevel === 'high' || audit.riskLevel === 'critical').length}
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
                    <p className="text-sm text-gray-600">被封禁用户</p>
                    <p className="text-2xl font-bold text-red-600">
                      {audits.filter(audit => audit.status === 'blocked').length}
                    </p>
                  </div>
                  <Ban className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap gap-3"
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBulkReview}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              批量用户审查
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateProfile}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              用户画像生成
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleActivityReport}
            >
              <Activity className="w-4 h-4 mr-2" />
              用户活动报告
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Flag className="w-4 h-4 mr-2" />
              异常行为标记
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              操作轨迹追踪
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <UserX className="w-4 h-4 mr-2" />
              风险用户隔离
            </Button>
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
                placeholder="搜索用户邮箱、姓名、用户ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterRiskLevel}
                onChange={(e) => setFilterRiskLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部风险等级</option>
                <option value="low">低风险</option>
                <option value="medium">中风险</option>
                <option value="high">高风险</option>
                <option value="critical">严重风险</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="active">正常</option>
                <option value="suspicious">可疑</option>
                <option value="blocked">被封禁</option>
                <option value="under_review">审核中</option>
              </select>

              <select
                value={filterKycStatus}
                onChange={(e) => setFilterKycStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部KYC状态</option>
                <option value="approved">已通过</option>
                <option value="pending">待审核</option>
                <option value="rejected">已拒绝</option>
                <option value="under_review">审核中</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* 用户列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>用户审计列表 ({filteredAudits.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAudits.map((audit) => (
                    <div
                      key={audit.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRiskLevelStyle(audit.riskLevel)}`}>
                          <User className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {audit.userName}
                            </h3>
                            <Badge className={getRiskLevelStyle(audit.riskLevel)}>
                              {audit.riskLevel === 'low' && '低风险'}
                              {audit.riskLevel === 'medium' && '中风险'}
                              {audit.riskLevel === 'high' && '高风险'}
                              {audit.riskLevel === 'critical' && '严重风险'}
                            </Badge>
                            <Badge className={getStatusStyle(audit.status)}>
                              {audit.status === 'active' && '正常'}
                              {audit.status === 'suspicious' && '可疑'}
                              {audit.status === 'blocked' && '被封禁'}
                              {audit.status === 'under_review' && '审核中'}
                            </Badge>
                            <Badge className={getKycStatusStyle(audit.kycStatus)}>
                              KYC: {audit.kycStatus === 'approved' && '已通过'}
                              {audit.kycStatus === 'pending' && '待审核'}
                              {audit.kycStatus === 'rejected' && '已拒绝'}
                              {audit.kycStatus === 'under_review' && '审核中'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                            <span>邮箱: {audit.userEmail}</span>
                            <span>行为评分: {audit.behaviorScore}/100</span>
                            <span>可疑活动: {audit.suspiciousActivities}</span>
                            <span>设备数: {audit.deviceCount}</span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>投资总额: ¥{audit.totalInvestment.toLocaleString()}</span>
                            <span>总收益: ¥{audit.totalEarnings.toLocaleString()}</span>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>最后活动: {new Date(audit.lastActivity).toLocaleString('zh-CN')}</span>
                            </div>
                          </div>

                          {audit.flaggedActions.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Flag className="w-3 h-3 text-orange-600" />
                              <div className="flex flex-wrap gap-1">
                                {audit.flaggedActions.slice(0, 3).map((action, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                                {audit.flaggedActions.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{audit.flaggedActions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(audit)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredAudits.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到用户</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterRiskLevel !== 'all' || filterStatus !== 'all' || filterKycStatus !== 'all'
                          ? '尝试调整搜索条件或筛选器'
                          : '暂无用户审计记录'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 用户详情弹窗 */}
          {showDetailModal && selectedUser && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">用户审计详情 - {selectedUser.userName}</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 基本信息 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">基本信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">用户姓名:</span>
                          <span className="font-medium">{selectedUser.userName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">用户邮箱:</span>
                          <span className="font-medium">{selectedUser.userEmail}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">用户ID:</span>
                          <span className="font-mono text-sm">{selectedUser.userId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">注册时间:</span>
                          <span className="font-medium">
                            {new Date(selectedUser.registrationDate).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 风险评估 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">风险评估</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">风险等级:</span>
                          <Badge className={getRiskLevelStyle(selectedUser.riskLevel)}>
                            {selectedUser.riskLevel === 'low' && '低风险'}
                            {selectedUser.riskLevel === 'medium' && '中风险'}
                            {selectedUser.riskLevel === 'high' && '高风险'}
                            {selectedUser.riskLevel === 'critical' && '严重风险'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">行为评分:</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  selectedUser.behaviorScore >= 80 ? 'bg-green-500' :
                                  selectedUser.behaviorScore >= 60 ? 'bg-yellow-500' :
                                  selectedUser.behaviorScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${selectedUser.behaviorScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{selectedUser.behaviorScore}/100</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 block">账户状态:</span>
                          <Badge className={getStatusStyle(selectedUser.status)}>
                            {selectedUser.status === 'active' && '正常'}
                            {selectedUser.status === 'suspicious' && '可疑'}
                            {selectedUser.status === 'blocked' && '被封禁'}
                            {selectedUser.status === 'under_review' && '审核中'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600 block">KYC状态:</span>
                          <Badge className={getKycStatusStyle(selectedUser.kycStatus)}>
                            {selectedUser.kycStatus === 'approved' && '已通过'}
                            {selectedUser.kycStatus === 'pending' && '待审核'}
                            {selectedUser.kycStatus === 'rejected' && '已拒绝'}
                            {selectedUser.kycStatus === 'under_review' && '审核中'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 活动统计 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">活动统计</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">总活动数:</span>
                          <span className="font-medium">{selectedUser.totalActivities}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">可疑活动:</span>
                          <span className={`font-medium ${selectedUser.suspiciousActivities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedUser.suspiciousActivities}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">登录频率:</span>
                          <span className="font-medium">{selectedUser.loginFrequency} 次/周</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">设备数量:</span>
                          <span className="font-medium">{selectedUser.deviceCount} 台</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">最后活动:</span>
                          <span className="font-medium">
                            {new Date(selectedUser.lastActivity).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IP地址列表 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">IP地址历史</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedUser.ipAddresses.map((ip, index) => (
                        <div key={index} className="bg-gray-100 p-2 rounded text-sm font-mono">
                          {ip}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 标记操作 */}
                  {selectedUser.flaggedActions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">标记操作</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.flaggedActions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            <Flag className="w-3 h-3 mr-1" />
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 财务信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">投资信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">投资总额:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ¥{selectedUser.totalInvestment.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block">总收益:</span>
                          <span className="text-xl font-bold text-green-600">
                            ¥{selectedUser.totalEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">收益率</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 block">总收益率:</span>
                          <span className="text-xl font-bold text-green-600">
                            {((selectedUser.totalEarnings / selectedUser.totalInvestment) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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