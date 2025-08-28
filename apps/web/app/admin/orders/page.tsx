'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Package,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'
import { AdminActionButtons, BatchActionButtons } from '../../../components/admin/AdminActionButtons'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface Order {
  id: string
  userId: string
  productId: string
  usdtAmount: number
  platformFee: number
  txHash: string | null
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED'
  referrerId: string | null
  agentId: string | null
  failureReason: string | null
  createdAt: string
  confirmedAt: string | null
  user: {
    id: string
    email: string
    referralCode: string
    kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  }
  product: {
    id: string
    symbol: string
    name: string
    aprBps: number
    lockDays: number
  }
  referrer?: {
    id: string
    email: string
    referralCode: string
  }
  agent?: {
    id: string
    email: string
    referralCode: string
  }
  riskScore?: number
  riskFactors?: string[]
}

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    userId: 'usr-001',
    productId: 'prod-001',
    usdtAmount: 10000,
    platformFee: 100,
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'SUCCESS',
    referrerId: null,
    agentId: 'agt-001',
    failureReason: null,
    createdAt: '2024-01-15T10:30:00Z',
    confirmedAt: '2024-01-15T10:35:00Z',
    user: {
      id: 'usr-001',
      email: 'user1@example.com',
      referralCode: 'QA001',
      kycStatus: 'APPROVED'
    },
    product: {
      id: 'prod-001',
      symbol: 'QA-GOLD',
      name: 'QA黄金卡',
      aprBps: 1500,
      lockDays: 90
    },
    agent: {
      id: 'agt-001',
      email: 'agent1@example.com',
      referralCode: 'AGT001'
    },
    riskScore: 2.5,
    riskFactors: ['新用户', '大额交易']
  },
  {
    id: 'ord-002',
    userId: 'usr-002',
    productId: 'prod-002',
    usdtAmount: 5000,
    platformFee: 50,
    txHash: null,
    status: 'PENDING',
    referrerId: 'usr-001',
    agentId: null,
    failureReason: null,
    createdAt: '2024-01-16T14:20:00Z',
    confirmedAt: null,
    user: {
      id: 'usr-002',
      email: 'user2@example.com',
      referralCode: 'QA002',
      kycStatus: 'PENDING'
    },
    product: {
      id: 'prod-002',
      symbol: 'QA-DIAMOND',
      name: 'QA钻石卡',
      aprBps: 1800,
      lockDays: 180
    },
    referrer: {
      id: 'usr-001',
      email: 'user1@example.com',
      referralCode: 'QA001'
    },
    riskScore: 4.2,
    riskFactors: ['未完成KYC', '异常设备', '推荐链可疑']
  }
]

const mockStats = {
  totalOrders: 1247,
  pendingOrders: 23,
  successOrders: 1180,
  failedOrders: 44,
  totalVolume: 15750000,
  todayVolume: 85000,
  avgOrderSize: 12633,
  highRiskOrders: 18
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // 过滤逻辑
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.txHash?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (riskFilter === 'high') {
      filtered = filtered.filter(order => (order.riskScore || 0) >= 4)
    } else if (riskFilter === 'medium') {
      filtered = filtered.filter(order => (order.riskScore || 0) >= 2 && (order.riskScore || 0) < 4)
    } else if (riskFilter === 'low') {
      filtered = filtered.filter(order => (order.riskScore || 0) < 2)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, riskFilter, dateRange])

  const handleOrderAction = async (action: string, orderId: string, data?: any) => {
    setIsLoading(true)
    try {
      // TODO: 实现API调用
      console.log('Order action:', { action, orderId, data })
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新本地状态
      if (action === 'approve') {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'SUCCESS' as const, confirmedAt: new Date().toISOString() }
            : order
        ))
      } else if (action === 'reject') {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'FAILED' as const, failureReason: data?.input || '管理员拒绝' }
            : order
        ))
      }

      alert(`订单 ${action} 操作成功`)
    } catch (error) {
      console.error('Order action failed:', error)
      alert('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchAction = async (action: string, orderIds: string[], data?: any) => {
    setIsLoading(true)
    try {
      console.log('Batch order action:', { action, orderIds, data })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (action === 'batchApprove') {
        setOrders(prev => prev.map(order => 
          orderIds.includes(order.id) 
            ? { ...order, status: 'SUCCESS' as const, confirmedAt: new Date().toISOString() }
            : order
        ))
      } else if (action === 'batchReject') {
        setOrders(prev => prev.map(order => 
          orderIds.includes(order.id) 
            ? { ...order, status: 'FAILED' as const, failureReason: data?.input || '批量拒绝' }
            : order
        ))
      }

      setSelectedOrders([])
      alert(`批量${action}操作成功`)
    } catch (error) {
      console.error('Batch action failed:', error)
      alert('批量操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const exportOrders = () => {
    // TODO: 实现导出功能
    const csv = [
      'ID,用户邮箱,产品名称,金额(USDT),状态,创建时间,风险评分',
      ...filteredOrders.map(order => [
        order.id,
        order.user.email,
        order.product.name,
        order.usdtAmount,
        order.status,
        new Date(order.createdAt).toLocaleString(),
        order.riskScore || 'N/A'
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      PENDING: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      SUCCESS: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      FAILED: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      CANCELED: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' }
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return null
    
    if (riskScore >= 4) {
      return <Badge variant="destructive">高风险 ({riskScore})</Badge>
    } else if (riskScore >= 2) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">中风险 ({riskScore})</Badge>
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-700">低风险 ({riskScore})</Badge>
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">订单管理</h1>
              <p className="text-muted-foreground mt-2">
                监控和管理所有用户订单，进行风险评估和状态管理
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportOrders}>
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
            </div>
          </motion.div>

          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">总订单数</p>
                    <p className="text-2xl font-bold">{mockStats.totalOrders.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% 相比上月</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">待处理</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockStats.pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">需要关注</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">总成交额</p>
                    <p className="text-2xl font-bold">${mockStats.totalVolume.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-muted-foreground">今日: ${mockStats.todayVolume.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">高风险订单</p>
                    <p className="text-2xl font-bold text-red-600">{mockStats.highRiskOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600">需要审核</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 批量操作栏 */}
          {selectedOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <BatchActionButtons
                type="order"
                selectedIds={selectedOrders}
                onBatchAction={handleBatchAction}
                disabled={isLoading}
              />
            </motion.div>
          )}

          {/* 搜索和过滤 */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户邮箱、推荐码、交易哈希..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">全部状态</option>
                  <option value="PENDING">待处理</option>
                  <option value="SUCCESS">已成功</option>
                  <option value="FAILED">已失败</option>
                  <option value="CANCELED">已取消</option>
                </select>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">全部风险</option>
                  <option value="high">高风险</option>
                  <option value="medium">中风险</option>
                  <option value="low">低风险</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">本周</option>
                  <option value="month">本月</option>
                  <option value="quarter">本季度</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 订单列表 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>订单列表 ({filteredOrders.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedOrders.length === filteredOrders.length) {
                        setSelectedOrders([])
                      } else {
                        setSelectedOrders(filteredOrders.map(o => o.id))
                      }
                    }}
                  >
                    {selectedOrders.length === filteredOrders.length ? '取消全选' : '全选'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => {
                          setSelectedOrders(prev => 
                            prev.includes(order.id)
                              ? prev.filter(id => id !== order.id)
                              : [...prev, order.id]
                          )
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm font-medium text-gray-900">
                                {order.id}
                              </span>
                              {getStatusBadge(order.status)}
                              {getRiskBadge(order.riskScore)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">用户信息</p>
                                <p className="font-medium text-sm">{order.user.email}</p>
                                <p className="text-xs text-gray-500">{order.user.referralCode}</p>
                                <Badge 
                                  variant={order.user.kycStatus === 'APPROVED' ? 'default' : 'outline'}
                                  className="text-xs mt-1"
                                >
                                  {order.user.kycStatus}
                                </Badge>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">产品信息</p>
                                <p className="font-medium text-sm">{order.product.name}</p>
                                <p className="text-xs text-gray-500">
                                  APR: {(order.product.aprBps / 100).toFixed(1)}% • {order.product.lockDays}天
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">金额信息</p>
                                <p className="font-medium text-sm">${order.usdtAmount.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  费用: ${order.platformFee.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>创建时间: {new Date(order.createdAt).toLocaleString()}</span>
                                {order.agent && (
                                  <span>代理: {order.agent.email}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Navigate to order detail page
                                alert(`订单详情: ${order.id}\n状态: ${order.status}\n金额: $${order.usdtAmount}\n风险评分: ${order.riskScore}`)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                            <AdminActionButtons
                              type="order"
                              itemId={order.id}
                              status={order.status}
                              onAction={handleOrderAction}
                              disabled={isLoading}
                              compact={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </AdminLayout>
    </AdminGuard>
  )
}