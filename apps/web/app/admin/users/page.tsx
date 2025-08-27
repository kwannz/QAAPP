'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  Unlock,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Download,
  UserPlus,
  Calendar,
  Activity,
  DollarSign,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface User {
  id: string
  email: string
  role: 'USER' | 'AGENT' | 'ADMIN'
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  isActive: boolean
  referralCode: string
  referredBy?: string
  agentId?: string
  createdAt: string
  lastLoginAt?: string
  stats: {
    totalInvested: number
    totalEarnings: number
    referralCount: number
    orderCount: number
  }
  riskLevel: 'low' | 'medium' | 'high'
  wallets: Array<{
    id: string
    chainId: number
    address: string
    isPrimary: boolean
  }>
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'zhang@example.com',
    role: 'USER',
    kycStatus: 'APPROVED',
    isActive: true,
    referralCode: 'REF001',
    createdAt: '2024-01-15T08:30:00Z',
    lastLoginAt: '2024-01-27T14:20:00Z',
    stats: {
      totalInvested: 50000,
      totalEarnings: 2500,
      referralCount: 12,
      orderCount: 8
    },
    riskLevel: 'low',
    wallets: [
      {
        id: 'wallet-001',
        chainId: 1,
        address: '0x1234...5678',
        isPrimary: true
      }
    ]
  },
  {
    id: 'user-002', 
    email: 'li@example.com',
    role: 'AGENT',
    kycStatus: 'APPROVED',
    isActive: true,
    referralCode: 'AGT002',
    createdAt: '2024-01-10T10:15:00Z',
    lastLoginAt: '2024-01-27T09:45:00Z',
    stats: {
      totalInvested: 120000,
      totalEarnings: 15600,
      referralCount: 45,
      orderCount: 23
    },
    riskLevel: 'low',
    wallets: [
      {
        id: 'wallet-002',
        chainId: 1, 
        address: '0xABCD...EFGH',
        isPrimary: true
      }
    ]
  },
  {
    id: 'user-003',
    email: 'wang@example.com',
    role: 'USER',
    kycStatus: 'PENDING',
    isActive: true,
    referralCode: 'REF003',
    referredBy: 'user-002',
    createdAt: '2024-01-25T16:20:00Z',
    lastLoginAt: '2024-01-27T11:30:00Z',
    stats: {
      totalInvested: 0,
      totalEarnings: 0,
      referralCount: 0,
      orderCount: 0
    },
    riskLevel: 'medium',
    wallets: []
  },
  {
    id: 'user-004',
    email: 'zhao@example.com',
    role: 'USER', 
    kycStatus: 'REJECTED',
    isActive: false,
    referralCode: 'REF004',
    createdAt: '2024-01-20T12:45:00Z',
    lastLoginAt: '2024-01-26T08:15:00Z',
    stats: {
      totalInvested: 5000,
      totalEarnings: 0,
      referralCount: 1,
      orderCount: 1
    },
    riskLevel: 'high',
    wallets: [
      {
        id: 'wallet-004',
        chainId: 1,
        address: '0x9999...1111',
        isPrimary: true
      }
    ]
  }
]

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterKyc, setFilterKyc] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 筛选用户
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesKyc = filterKyc === 'all' || user.kycStatus === filterKyc
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) || 
      (filterStatus === 'inactive' && !user.isActive)
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesKyc && matchesStatus && matchesSearch
  })

  // 获取角色样式
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'AGENT':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'USER':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 获取KYC状态样式
  const getKycStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取风险等级样式
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 用户操作
  const handleBanUser = async (userId: string) => {
    if (confirm('确定要封禁该用户吗？')) {
      try {
        // TODO: 调用API封禁用户
        console.log('Banning user:', userId)
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: false } : user
        ))
        alert('用户已封禁')
      } catch (error) {
        alert('操作失败')
      }
    }
  }

  const handleUnbanUser = async (userId: string) => {
    if (confirm('确定要解封该用户吗？')) {
      try {
        // TODO: 调用API解封用户
        console.log('Unbanning user:', userId)
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: true } : user
        ))
        alert('用户已解封')
      } catch (error) {
        alert('操作失败')
      }
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (confirm('确定要重置该用户密码吗？系统将发送重置链接到用户邮箱。')) {
      try {
        // TODO: 调用API重置密码
        console.log('Resetting password for user:', userId)
        alert('密码重置邮件已发送')
      } catch (error) {
        alert('操作失败')
      }
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
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
                用户管理
              </h1>
              <p className="text-gray-600 mt-2">
                管理平台用户，监控用户活动，处理账户问题
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                邀请用户
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出数据
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
                      {users.length}
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
                    <p className="text-sm text-gray-600">活跃用户</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter(user => user.isActive).length}
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
                    <p className="text-sm text-gray-600">KYC通过</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter(user => user.kycStatus === 'APPROVED').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">高风险用户</p>
                    <p className="text-2xl font-bold text-red-600">
                      {users.filter(user => user.riskLevel === 'high').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
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
                placeholder="搜索用户邮箱或推荐码..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部角色</option>
                <option value="USER">普通用户</option>
                <option value="AGENT">代理商</option>
                <option value="ADMIN">管理员</option>
              </select>
              
              <select
                value={filterKyc}
                onChange={(e) => setFilterKyc(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部KYC</option>
                <option value="APPROVED">已通过</option>
                <option value="PENDING">待审核</option>
                <option value="REJECTED">已拒绝</option>
                <option value="EXPIRED">已过期</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">已封禁</option>
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
                <CardTitle>用户列表 ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.email[0].toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{user.email}</h3>
                            <Badge className={getRoleStyle(user.role)}>
                              {user.role === 'ADMIN' && '管理员'}
                              {user.role === 'AGENT' && '代理商'}
                              {user.role === 'USER' && '用户'}
                            </Badge>
                            <Badge className={getKycStatusStyle(user.kycStatus)}>
                              {user.kycStatus === 'APPROVED' && 'KYC通过'}
                              {user.kycStatus === 'PENDING' && 'KYC待审核'}
                              {user.kycStatus === 'REJECTED' && 'KYC拒绝'}
                              {user.kycStatus === 'EXPIRED' && 'KYC过期'}
                            </Badge>
                            <Badge className={getRiskLevelStyle(user.riskLevel)}>
                              {user.riskLevel === 'low' && '低风险'}
                              {user.riskLevel === 'medium' && '中风险'}
                              {user.riskLevel === 'high' && '高风险'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-600">推荐码: {user.referralCode}</p>
                            <p className="text-sm text-gray-600">
                              投资总额: {formatCurrency(user.stats.totalInvested)}
                            </p>
                            <p className="text-sm text-gray-600">
                              推荐人数: {user.stats.referralCount}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            注册时间: {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                            {user.lastLoginAt && (
                              <span className="ml-4">
                                最后登录: {new Date(user.lastLoginAt).toLocaleDateString('zh-CN')}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? '活跃' : '已封禁'}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                          
                          {user.isActive ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBanUser(user.id)}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              封禁
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleUnbanUser(user.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              解封
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            重置密码
                          </Button>

                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到用户</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterRole !== 'all' || filterKyc !== 'all' || filterStatus !== 'all'
                          ? '尝试调整搜索条件或筛选器'
                          : '暂无用户数据'
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
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">用户详细信息</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600">邮箱:</span>
                          <span className="font-medium ml-2">{selectedUser.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">角色:</span>
                          <Badge className={`ml-2 ${getRoleStyle(selectedUser.role)}`}>
                            {selectedUser.role === 'ADMIN' && '管理员'}
                            {selectedUser.role === 'AGENT' && '代理商'}
                            {selectedUser.role === 'USER' && '用户'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">推荐码:</span>
                          <span className="font-medium ml-2">{selectedUser.referralCode}</span>
                        </div>
                        {selectedUser.referredBy && (
                          <div>
                            <span className="text-gray-600">推荐人:</span>
                            <span className="font-medium ml-2">{selectedUser.referredBy}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">注册时间:</span>
                          <span className="font-medium ml-2">
                            {new Date(selectedUser.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {selectedUser.lastLoginAt && (
                          <div>
                            <span className="text-gray-600">最后登录:</span>
                            <span className="font-medium ml-2">
                              {new Date(selectedUser.lastLoginAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">状态信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600">账户状态:</span>
                          <Badge className={`ml-2 ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedUser.isActive ? '活跃' : '已封禁'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">KYC状态:</span>
                          <Badge className={`ml-2 ${getKycStatusStyle(selectedUser.kycStatus)}`}>
                            {selectedUser.kycStatus === 'APPROVED' && 'KYC通过'}
                            {selectedUser.kycStatus === 'PENDING' && 'KYC待审核'}
                            {selectedUser.kycStatus === 'REJECTED' && 'KYC拒绝'}
                            {selectedUser.kycStatus === 'EXPIRED' && 'KYC过期'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">风险等级:</span>
                          <Badge className={`ml-2 ${getRiskLevelStyle(selectedUser.riskLevel)}`}>
                            {selectedUser.riskLevel === 'low' && '低风险'}
                            {selectedUser.riskLevel === 'medium' && '中风险'}
                            {selectedUser.riskLevel === 'high' && '高风险'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">钱包数量:</span>
                          <span className="font-medium ml-2">{selectedUser.wallets.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 统计数据 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">用户统计</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedUser.stats.totalInvested)}
                        </div>
                        <div className="text-sm text-gray-600">总投资额</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedUser.stats.totalEarnings)}
                        </div>
                        <div className="text-sm text-gray-600">总收益</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedUser.stats.referralCount}
                        </div>
                        <div className="text-sm text-gray-600">推荐人数</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedUser.stats.orderCount}
                        </div>
                        <div className="text-sm text-gray-600">订单数量</div>
                      </div>
                    </div>
                  </div>

                  {/* 钱包信息 */}
                  {selectedUser.wallets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">钱包地址</h3>
                      <div className="space-y-2">
                        {selectedUser.wallets.map((wallet) => (
                          <div key={wallet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-mono text-sm">{wallet.address}</span>
                              <div className="text-xs text-gray-500">
                                链ID: {wallet.chainId}
                                {wallet.isPrimary && <span className="ml-2 text-blue-600">主钱包</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                    >
                      关闭
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleResetPassword(selectedUser.id)}
                    >
                      重置密码
                    </Button>
                    {selectedUser.isActive ? (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleBanUser(selectedUser.id)
                          setShowDetailModal(false)
                        }}
                      >
                        封禁用户
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handleUnbanUser(selectedUser.id)
                          setShowDetailModal(false)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        解封用户
                      </Button>
                    )}
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