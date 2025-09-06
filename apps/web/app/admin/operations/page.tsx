'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  UserCheck, 
  CreditCard,
  Settings,
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Ban,
  Unlock,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus,
  RefreshCw,
  Building2
} from 'lucide-react'

import { useFeatureFlag } from '@/lib/feature-flags'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { TabContainer } from '@/components/common/TabContainer'
import { FilterPanel } from '@/components/common/FilterPanel'
import { MetricsCard } from '@/components/ui'
import { 
  Button, 
  Input, 
  Badge, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import Link from 'next/link'
import apiClient from '@/lib/api-client'

// 类型定义
interface User {
  id: string
  email: string
  role: 'USER' | 'AGENT' | 'ADMIN'
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  isActive: boolean
  referralCode: string
  createdAt: string
  stats: {
    totalInvested: number
    totalEarnings: number
    referralCount: number
    orderCount: number
  }
  riskLevel: 'low' | 'medium' | 'high'
}

interface Product {
  id: string
  symbol: string
  name: string
  description: string
  minAmount: number
  maxAmount: number | null
  aprBps: number
  lockDays: number
  currentSupply: number
  totalSupply: number | null
  isActive: boolean
  createdAt: string
}

interface Order {
  id: string
  userId: string
  productId: string
  usdtAmount: number
  platformFee: number
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED'
  createdAt: string
  user: {
    email: string
    referralCode: string
    kycStatus: string
  }
  product: {
    symbol: string
    name: string
    aprBps: number
  }
  riskScore?: number
}

interface Agent {
  id: string
  email: string
  referralCode: string
  isActive: boolean
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  commissionRate: number
  totalCommissions: number
  referralCount: number
  createdAt: string
}

interface Withdrawal {
  id: string
  userId: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  requestedAt: string
  processedAt?: string
  user: {
    email: string
    kycStatus: string
  }
}

// API 服务（使用统一 apiClient）
const apiService = {
  async fetchUsers(filters: Record<string, any> = {}) {
    const { data } = await apiClient.get('/users', { params: filters })
    return data
  },
  async fetchProducts(filters: Record<string, any> = {}) {
    const { data } = await apiClient.get('/finance/products', { params: filters })
    return data
  },
  async fetchOrders(filters: Record<string, any> = {}) {
    const { data } = await apiClient.get('/finance/orders', { params: filters })
    return data
  },
  async fetchAgents(filters: Record<string, any> = {}) {
    const { data } = await apiClient.get('/agents/admin/list', { params: filters })
    return data
  },
  async fetchWithdrawals(filters: Record<string, any> = {}) {
    // 新统一端点建议：/finance/transactions?type=WITHDRAWAL
    const { data } = await apiClient.get('/finance/transactions', { params: { ...filters, type: 'WITHDRAWAL' } })
    return data
  },
  async fetchUserStats() {
    const { data } = await apiClient.get('/users/admin/stats')
    return data
  },
  async fetchAgentStats() {
    const { data } = await apiClient.get('/agents/admin/stats')
    return data
  },
  async fetchDashboardStats() {
    const { data } = await apiClient.get('/monitoring/dashboard')
    return data
  },
}

export default function OperationsCenter() {
  const isEnabled = useFeatureFlag('newOperationsCenter')
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showDetail, setShowDetail] = useState<{open: boolean; type: string; item: any}>({
    open: false,
    type: '',
    item: null
  })
  
  // 数据状态
  const [data, setData] = useState({
    users: [],
    products: [],
    orders: [],
    withdrawals: []
  })
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, kyc: 0, risk: 0 },
    products: { total: 0, active: 0, totalValue: 0 },
    orders: { total: 0, pending: 0, success: 0, failed: 0, volume: 0 },
    withdrawals: { total: 0, pending: 0, approved: 0, rejected: 0, amount: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 如果功能开关未启用，显示重定向页面
  if (!isEnabled) {
    return (
      <AdminGuard allowedRoles={['ADMIN']}>
        <AdminLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  运营中心升级
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  新的统一运营中心正在开发中，将整合所有管理功能到一个强大的界面
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  功能开关未启用 - 请联系技术团队
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link 
                  href="/admin/users"
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">用户管理</h3>
                  <p className="text-gray-600 text-sm">管理用户账户、KYC状态和权限设置</p>
                </Link>

                <Link 
                  href="/admin/products"
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">产品管理</h3>
                  <p className="text-gray-600 text-sm">管理投资产品、收益率和供应配置</p>
                </Link>

                <Link 
                  href="/admin/orders"
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">订单管理</h3>
                  <p className="text-gray-600 text-sm">处理订单状态、风险评估和交易审核</p>
                </Link>

                <Link 
                  href="/admin/agents"
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <UserCheck className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">代理管理</h3>
                  <p className="text-gray-600 text-sm">管理代理商账户、佣金结算和业绩</p>
                </Link>

                <Link 
                  href="/admin/withdrawals"
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <CreditCard className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">提现管理</h3>
                  <p className="text-gray-600 text-sm">审核提现申请、处理资金流转</p>
                </Link>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  const tabs = [
    {
      id: 'users',
      label: '用户管理',
      icon: <Users className="w-4 h-4" />,
      badge: stats.users.total
    },
    {
      id: 'products',
      label: '产品管理',
      icon: <Package className="w-4 h-4" />,
      badge: stats.products.total
    },
    {
      id: 'orders',
      label: '订单管理',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: stats.orders.pending
    },
    {
      id: 'withdrawals',
      label: '提现管理',
      icon: <CreditCard className="w-4 h-4" />,
      badge: stats.withdrawals.pending
    }
  ]

  const handleAction = async (action: string, entityType: string, id: string, data?: any) => {
    try {
      console.log(`${action} ${entityType}:`, { id, data })
      alert(`${action} 操作成功`)
    } catch (error) {
      alert(`${action} 操作失败`)
    }
  }

  const renderEntityCard = (entity: any, type: string) => {
    switch (type) {
      case 'users':
        return (
          <div key={entity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {entity.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{entity.email}</h3>
                  <Badge className={entity.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                   entity.role === 'AGENT' ? 'bg-blue-100 text-blue-800' : 
                                   'bg-gray-100 text-gray-800'}>
                    {entity.role}
                  </Badge>
                  <Badge className={entity.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                   entity.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                   'bg-red-100 text-red-800'}>
                    {entity.kycStatus}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  推荐码: {entity.referralCode} • 投资: ${entity.stats.totalInvested.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={entity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {entity.isActive ? '活跃' : '封禁'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowDetail({open: true, type: 'user', item: entity})}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant={entity.isActive ? "destructive" : "default"} 
                size="sm"
                onClick={() => handleAction(entity.isActive ? 'ban' : 'unban', 'user', entity.id)}
              >
                {entity.isActive ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )

      case 'products':
        return (
          <div key={entity.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{entity.name}</h3>
                  <Badge>{entity.symbol}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{entity.description}</p>
              </div>
              <Badge className={entity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {entity.isActive ? '活跃' : '暂停'}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-500">年化收益:</span>
                <span className="font-medium text-green-600 ml-2">
                  {(entity.aprBps / 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">锁定期:</span>
                <span className="font-medium ml-2">{entity.lockDays}天</span>
              </div>
              <div>
                <span className="text-gray-500">供应量:</span>
                <span className="font-medium ml-2">{entity.currentSupply}/{entity.totalSupply || '∞'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                投资范围: ${entity.minAmount.toLocaleString()} - ${entity.maxAmount?.toLocaleString() || '无限制'}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowDetail({open: true, type: 'product', item: entity})}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )

      case 'orders':
        return (
          <div key={entity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-mono text-sm">{entity.id}</span>
                <Badge className={entity.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                               entity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-red-100 text-red-800'}>
                  {entity.status}
                </Badge>
                {entity.riskScore && entity.riskScore >= 4 && (
                  <Badge variant="destructive">高风险</Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">用户:</span>
                  <span className="font-medium ml-2">{entity.user.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">产品:</span>
                  <span className="font-medium ml-2">{entity.product.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">金额:</span>
                  <span className="font-medium ml-2">${entity.usdtAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetail({open: true, type: 'order', item: entity})}>
                <Eye className="w-4 h-4" />
              </Button>
              {entity.status === 'PENDING' && (
                <>
                  <Button variant="default" size="sm" onClick={() => handleAction('approve', 'order', entity.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleAction('reject', 'order', entity.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )

      case 'withdrawals':
        return (
          <div key={entity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-mono text-sm">{entity.id}</span>
                <Badge className={entity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                               entity.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                               entity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-red-100 text-red-800'}>
                  {entity.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">用户:</span>
                  <span className="font-medium ml-2">{entity.user.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">金额:</span>
                  <span className="font-medium ml-2">${entity.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetail({open: true, type: 'withdrawal', item: entity})}>
                <Eye className="w-4 h-4" />
              </Button>
              {entity.status === 'PENDING' && (
                <>
                  <Button variant="default" size="sm" onClick={() => handleAction('approve', 'withdrawal', entity.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleAction('reject', 'withdrawal', entity.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // 加载数据函数
  const loadData = async (tab: string) => {
    if (!localStorage.getItem('token')) {
      setError('请先登录')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      let result
      switch (tab) {
        case 'users':
          result = await apiService.fetchUsers({ ...filters, search: searchTerm })
          setData(prev => ({ ...prev, users: result.data || [] }))
          break
        case 'products':
          result = await apiService.fetchProducts({ ...filters, search: searchTerm })
          setData(prev => ({ ...prev, products: result.data || [] }))
          break
        case 'orders':
          result = await apiService.fetchOrders({ ...filters, search: searchTerm })
          setData(prev => ({ ...prev, orders: result.data || [] }))
          break
        case 'withdrawals':
          result = await apiService.fetchWithdrawals({ ...filters, search: searchTerm })
          setData(prev => ({ ...prev, withdrawals: result.data || [] }))
          break
      }
    } catch (error: any) {
      console.error(`Failed to load ${tab}:`, error)
      setError(error.message || `加载${tab}数据失败`)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    if (!localStorage.getItem('token')) return
    
    try {
      const [userStats, agentStats, dashboardStats] = await Promise.all([
        apiService.fetchUserStats(),
        apiService.fetchAgentStats(),
        apiService.fetchDashboardStats()
      ])
      
      setStats({
        users: userStats || { total: 0, active: 0, kyc: 0, risk: 0 },
        products: dashboardStats?.products || { total: 0, active: 0, totalValue: 0 },
        orders: dashboardStats?.orders || { total: 0, pending: 0, success: 0, failed: 0, volume: 0 },
        withdrawals: dashboardStats?.withdrawals || { total: 0, pending: 0, approved: 0, rejected: 0, amount: 0 }
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // 数据加载effect
  useEffect(() => {
    if (isEnabled) {
      loadStats()
      loadData(activeTab)
    }
  }, [isEnabled, activeTab, filters, searchTerm])

  const getCurrentData = () => {
    switch (activeTab) {
      case 'users': return data.users
      case 'products': return data.products
      case 'orders': return data.orders
      case 'withdrawals': return data.withdrawals
      default: return []
    }
  }

  const getCurrentStats = () => {
    switch (activeTab) {
      case 'users': return [
        { title: '总用户数', value: stats.users.total, icon: Users, color: 'blue' },
        { title: '活跃用户', value: stats.users.active, icon: TrendingUp, color: 'green' },
        { title: 'KYC通过', value: stats.users.kyc, icon: CheckCircle, color: 'green' },
        { title: '高风险用户', value: stats.users.risk, icon: AlertTriangle, color: 'red' }
      ]
      case 'products': return [
        { title: '总产品数', value: stats.products.total, icon: Package, color: 'blue' },
        { title: '活跃产品', value: stats.products.active, icon: TrendingUp, color: 'green' },
        { title: '总价值', value: `$${(stats.products.totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'green' }
      ]
      case 'orders': return [
        { title: '总订单', value: stats.orders.total, icon: ShoppingCart, color: 'blue' },
        { title: '待处理', value: stats.orders.pending, icon: Clock, color: 'yellow' },
        { title: '成功订单', value: stats.orders.success, icon: CheckCircle, color: 'green' },
        { title: '总成交额', value: `$${(stats.orders.volume / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'green' }
      ]
      case 'withdrawals': return [
        { title: '总申请', value: stats.withdrawals.total, icon: CreditCard, color: 'blue' },
        { title: '待处理', value: stats.withdrawals.pending, icon: Clock, color: 'yellow' },
        { title: '已批准', value: stats.withdrawals.approved, icon: CheckCircle, color: 'green' },
        { title: '总金额', value: `$${(stats.withdrawals.amount / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'green' }
      ]
      default: return []
    }
  }

  return (
    <AdminGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="w-8 h-8 mr-3" />
                运营中心
              </h1>
              <p className="text-gray-600 mt-2">
                统一管理用户、产品、订单、代理和提现
              </p>
            </div>
            <Button onClick={() => { loadStats(); loadData(activeTab) }} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </motion.div>

          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {getCurrentStats().map((stat, index) => (
              <MetricsCard
                key={index}
                title={stat.title}
                value={stat.value.toString()}
                icon={stat.icon}
                trend={{ value: 12, isPositive: true }}
              />
            ))}
          </motion.div>

          {/* 主要内容区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabContainer
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {/* 筛选面板 */}
              <FilterPanel
                filters={[
                  {
                    id: 'status',
                    label: '状态',
                    type: 'select',
                    options: activeTab === 'users' 
                      ? [
                          { value: 'active', label: '活跃' },
                          { value: 'inactive', label: '封禁' }
                        ]
                      : activeTab === 'orders'
                      ? [
                          { value: 'PENDING', label: '待处理' },
                          { value: 'SUCCESS', label: '成功' },
                          { value: 'FAILED', label: '失败' }
                        ]
                      : [
                          { value: 'active', label: '活跃' },
                          { value: 'inactive', label: '停用' }
                        ]
                  },
                  {
                    id: 'dateRange',
                    label: '时间范围',
                    type: 'select',
                    options: [
                      { value: 'today', label: '今天' },
                      { value: 'week', label: '本周' },
                      { value: 'month', label: '本月' },
                      { value: 'quarter', label: '本季度' }
                    ]
                  }
                ]}
                values={filters}
                onChange={setFilters}
                onSearch={(term) => setSearchTerm(term)}
                searchPlaceholder={
                  activeTab === 'users' ? '搜索用户邮箱或推荐码...' :
                  activeTab === 'products' ? '搜索产品名称或代码...' :
                  activeTab === 'orders' ? '搜索订单ID或交易哈希...' :
                  '搜索...'
                }
                onExport={() => {
                  // Export functionality now available via monitoring API
                  window.open(`/api/monitoring/export?format=csv&type=${activeTab}`, '_blank')
                }}
              />

              {/* 错误状态 */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 实体列表 */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {tabs.find(t => t.id === activeTab)?.label} ({getCurrentData().length})
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {selectedItems.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            已选择 {selectedItems.length} 项
                          </span>
                          <Button variant="outline" size="sm">
                            批量操作
                          </Button>
                        </div>
                      )}
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        新建
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading && (
                      <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">加载中...</p>
                      </div>
                    )}
                    
                    {!loading && getCurrentData().map((entity) => renderEntityCard(entity, activeTab))}
                    
                    {!loading && getCurrentData().length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          {tabs.find(t => t.id === activeTab)?.icon}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          暂无{tabs.find(t => t.id === activeTab)?.label}
                        </h3>
                        <p className="text-gray-500">
                          {error ? '数据加载失败，请刷新重试' : '点击上方"新建"按钮开始添加'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabContainer>
          </motion.div>

          {/* 详情对话框 */}
          <Dialog open={showDetail.open} onOpenChange={(open) => !open && setShowDetail({open: false, type: '', item: null})}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {showDetail.type === 'user' && '用户详情'}
                  {showDetail.type === 'product' && '产品详情'}
                  {showDetail.type === 'order' && '订单详情'}
                  {showDetail.type === 'agent' && '代理详情'}
                  {showDetail.type === 'withdrawal' && '提现详情'}
                </DialogTitle>
              </DialogHeader>
              
              {showDetail.item && (
                <div className="space-y-4">
                  {showDetail.type === 'user' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">邮箱:</span>
                        <span className="font-medium ml-2">{showDetail.item.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">角色:</span>
                        <span className="font-medium ml-2">{showDetail.item.role}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">KYC状态:</span>
                        <span className="font-medium ml-2">{showDetail.item.kycStatus}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">总投资:</span>
                        <span className="font-medium ml-2">${showDetail.item.stats.totalInvested.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {showDetail.type === 'order' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">订单ID:</span>
                        <span className="font-medium ml-2">{showDetail.item.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">状态:</span>
                        <span className="font-medium ml-2">{showDetail.item.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">金额:</span>
                        <span className="font-medium ml-2">${showDetail.item.usdtAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">风险评分:</span>
                        <span className="font-medium ml-2">{showDetail.item.riskScore || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                  
                  {showDetail.type === 'product' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">产品名称:</span>
                        <span className="font-medium ml-2">{showDetail.item.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">代码:</span>
                        <span className="font-medium ml-2">{showDetail.item.symbol}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">年化收益:</span>
                        <span className="font-medium ml-2">{(showDetail.item.aprBps / 100).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">锁定期:</span>
                        <span className="font-medium ml-2">{showDetail.item.lockDays}天</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetail({open: false, type: '', item: null})}>
                  关闭
                </Button>
                <Button>
                  编辑
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}
