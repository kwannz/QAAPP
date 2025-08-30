'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Wallet,
  ShoppingBag,
  Gift,
  Minus,
  Plus,
  ExternalLink,
  FileText,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../lib/auth-context'

// 交易类型定义
interface Transaction {
  id: string
  type: 'INVESTMENT' | 'WITHDRAWAL' | 'COMMISSION' | 'REFUND' | 'TRANSFER' | 'REWARD'
  subType?: 'DEPOSIT' | 'PURCHASE' | 'SALE' | 'PAYOUT' | 'REFERRAL' | 'PERFORMANCE'
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: 'USDT' | 'USD' | 'CNY'
  direction: 'IN' | 'OUT'
  description: string
  details?: {
    productName?: string
    orderId?: string
    fromAddress?: string
    toAddress?: string
    transactionHash?: string
    referralCode?: string
    commissionRate?: number
  }
  balanceBefore: number
  balanceAfter: number
  fee?: number
  createdAt: string
  completedAt?: string
  failedAt?: string
  cancelledAt?: string
  notes?: string
}

interface TransactionSummary {
  totalIn: number
  totalOut: number
  netAmount: number
  transactionCount: number
  completedCount: number
  pendingCount: number
  failedCount: number
  averageAmount: number
}

interface DateRange {
  start: string
  end: string
  label: string
}

// 模拟数据
const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    type: 'COMMISSION',
    subType: 'REFERRAL',
    status: 'COMPLETED',
    amount: 150.00,
    currency: 'USDT',
    direction: 'IN',
    description: '推荐佣金 - 用户投资QA黄金卡',
    details: {
      productName: 'QA黄金卡',
      orderId: 'ORDER-2024-001',
      referralCode: 'QA2024USER',
      commissionRate: 1.5
    },
    balanceBefore: 2850.00,
    balanceAfter: 3000.00,
    createdAt: '2024-02-01T10:30:00Z',
    completedAt: '2024-02-01T10:31:00Z'
  },
  {
    id: 'tx-002',
    type: 'INVESTMENT',
    subType: 'PURCHASE',
    status: 'COMPLETED',
    amount: 10000.00,
    currency: 'USDT',
    direction: 'OUT',
    description: '购买投资产品 - QA钻石卡',
    details: {
      productName: 'QA钻石卡',
      orderId: 'ORDER-2024-015',
      transactionHash: '0x1234...abcd'
    },
    balanceBefore: 12850.00,
    balanceAfter: 2850.00,
    fee: 5.00,
    createdAt: '2024-01-31T16:45:00Z',
    completedAt: '2024-01-31T16:47:00Z'
  },
  {
    id: 'tx-003',
    type: 'WITHDRAWAL',
    status: 'PENDING',
    amount: 2500.00,
    currency: 'USDT',
    direction: 'OUT',
    description: '提现申请 - 银行卡',
    details: {
      toAddress: '****1234'
    },
    balanceBefore: 3000.00,
    balanceAfter: 500.00,
    fee: 25.00,
    createdAt: '2024-02-01T14:20:00Z',
    notes: '预计1-3个工作日到账'
  },
  {
    id: 'tx-004',
    type: 'REWARD',
    subType: 'PAYOUT',
    status: 'COMPLETED',
    amount: 41.67,
    currency: 'USDT',
    direction: 'IN',
    description: '投资收益 - QA白银卡月度分红',
    details: {
      productName: 'QA白银卡',
      orderId: 'ORDER-2024-008'
    },
    balanceBefore: 2808.33,
    balanceAfter: 2850.00,
    createdAt: '2024-01-30T09:00:00Z',
    completedAt: '2024-01-30T09:01:00Z'
  },
  {
    id: 'tx-005',
    type: 'TRANSFER',
    subType: 'DEPOSIT',
    status: 'COMPLETED',
    amount: 5000.00,
    currency: 'USDT',
    direction: 'IN',
    description: '充值 - USDT转入',
    details: {
      fromAddress: '0xabcd...1234',
      transactionHash: '0x5678...efgh'
    },
    balanceBefore: 7850.00,
    balanceAfter: 12850.00,
    createdAt: '2024-01-29T11:15:00Z',
    completedAt: '2024-01-29T11:25:00Z'
  },
  {
    id: 'tx-006',
    type: 'COMMISSION',
    subType: 'PERFORMANCE',
    status: 'COMPLETED',
    amount: 200.00,
    currency: 'USDT',
    direction: 'IN',
    description: '绩效奖金 - 月度推荐目标达成',
    balanceBefore: 7650.00,
    balanceAfter: 7850.00,
    createdAt: '2024-01-28T23:59:00Z',
    completedAt: '2024-01-29T00:01:00Z'
  },
  {
    id: 'tx-007',
    type: 'INVESTMENT',
    subType: 'PURCHASE',
    status: 'FAILED',
    amount: 15000.00,
    currency: 'USDT',
    direction: 'OUT',
    description: '投资失败 - QA铂金卡',
    details: {
      productName: 'QA铂金卡',
      orderId: 'ORDER-2024-020'
    },
    balanceBefore: 7650.00,
    balanceAfter: 7650.00,
    createdAt: '2024-01-27T14:30:00Z',
    failedAt: '2024-01-27T14:35:00Z',
    notes: '余额不足'
  },
  {
    id: 'tx-008',
    type: 'REFUND',
    status: 'COMPLETED',
    amount: 1000.00,
    currency: 'USDT',
    direction: 'IN',
    description: '订单退款 - QA白银卡部分退款',
    details: {
      productName: 'QA白银卡',
      orderId: 'ORDER-2024-005'
    },
    balanceBefore: 6650.00,
    balanceAfter: 7650.00,
    createdAt: '2024-01-26T16:00:00Z',
    completedAt: '2024-01-26T16:05:00Z'
  },
  {
    id: 'tx-009',
    type: 'COMMISSION',
    subType: 'REFERRAL',
    status: 'COMPLETED',
    amount: 75.00,
    currency: 'USDT',
    direction: 'IN',
    description: '推荐佣金 - 二级用户投资',
    details: {
      productName: 'QA白银卡',
      orderId: 'ORDER-2024-012',
      referralCode: 'QA2024FRIEND',
      commissionRate: 0.75
    },
    balanceBefore: 6575.00,
    balanceAfter: 6650.00,
    createdAt: '2024-01-25T10:45:00Z',
    completedAt: '2024-01-25T10:46:00Z'
  },
  {
    id: 'tx-010',
    type: 'WITHDRAWAL',
    status: 'CANCELLED',
    amount: 3000.00,
    currency: 'USDT',
    direction: 'OUT',
    description: '提现取消 - 用户主动取消',
    details: {
      toAddress: '****5678'
    },
    balanceBefore: 6575.00,
    balanceAfter: 6575.00,
    createdAt: '2024-01-24T13:20:00Z',
    cancelledAt: '2024-01-24T15:30:00Z',
    notes: '用户取消提现申请'
  }
]

const dateRanges: DateRange[] = [
  {
    start: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: '最近24小时'
  },
  {
    start: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: '最近7天'
  },
  {
    start: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: '最近30天'
  },
  {
    start: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: '最近90天'
  }
]

export default function TransactionHistory() {
  const { user } = useAuthStore()
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'INVESTMENT' | 'WITHDRAWAL' | 'COMMISSION' | 'REWARD' | 'TRANSFER' | 'REFUND'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED'>('all')
  const [directionFilter, setDirectionFilter] = useState<'all' | 'IN' | 'OUT'>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('30')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIn: 0,
    totalOut: 0,
    netAmount: 0,
    transactionCount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    averageAmount: 0
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = [...transactions]

    // 日期筛选
    if (dateRangeFilter !== 'all') {
      const days = parseInt(dateRangeFilter)
      const cutoffDate = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= cutoffDate)
    }

    // 类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter)
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter)
    }

    // 方向筛选
    if (directionFilter !== 'all') {
      filtered = filtered.filter(tx => tx.direction === directionFilter)
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.details?.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.details?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 按创建时间倒序排列
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredTransactions(filtered)

    // 计算统计数据
    const newSummary: TransactionSummary = {
      totalIn: filtered.filter(tx => tx.direction === 'IN' && tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.amount, 0),
      totalOut: filtered.filter(tx => tx.direction === 'OUT' && tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.amount, 0),
      netAmount: 0,
      transactionCount: filtered.length,
      completedCount: filtered.filter(tx => tx.status === 'COMPLETED').length,
      pendingCount: filtered.filter(tx => tx.status === 'PENDING').length,
      failedCount: filtered.filter(tx => tx.status === 'FAILED' || tx.status === 'CANCELLED').length,
      averageAmount: filtered.length > 0 ? filtered.reduce((sum, tx) => sum + tx.amount, 0) / filtered.length : 0
    }
    newSummary.netAmount = newSummary.totalIn - newSummary.totalOut
    setSummary(newSummary)
  }, [transactions, searchTerm, typeFilter, statusFilter, directionFilter, dateRangeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'PENDING': return 'text-orange-600 bg-orange-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      case 'CANCELLED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string, direction: string) => {
    switch (type) {
      case 'INVESTMENT':
        return direction === 'IN' ? TrendingUp : ShoppingBag
      case 'WITHDRAWAL':
        return CreditCard
      case 'COMMISSION':
        return Gift
      case 'REWARD':
        return TrendingUp
      case 'TRANSFER':
        return direction === 'IN' ? ArrowDownLeft : ArrowUpRight
      case 'REFUND':
        return RefreshCw
      default:
        return DollarSign
    }
  }

  const getTypeName = (type: string, subType?: string) => {
    switch (type) {
      case 'INVESTMENT':
        return subType === 'PURCHASE' ? '投资购买' : '投资'
      case 'WITHDRAWAL':
        return '提现'
      case 'COMMISSION':
        return subType === 'REFERRAL' ? '推荐佣金' : subType === 'PERFORMANCE' ? '绩效奖金' : '佣金'
      case 'REWARD':
        return subType === 'PAYOUT' ? '投资收益' : '奖励'
      case 'TRANSFER':
        return subType === 'DEPOSIT' ? '充值' : '转账'
      case 'REFUND':
        return '退款'
      default:
        return '交易'
    }
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('Exporting transactions...', filteredTransactions)
  }

  const handleBatchAction = (action: string) => {
    // TODO: 实现批量操作
    console.log('Batch action:', action, selectedTransactions)
  }

  const formatCurrency = (amount: number, currency: string = 'USDT') => {
    if (currency === 'USDT') {
      return `${amount.toFixed(2)} USDT`
    }
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency === 'CNY' ? 'CNY' : 'USD'
    }).format(amount)
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
                  <h1 className="text-3xl font-bold text-gray-900">交易历史</h1>
                  <p className="text-gray-600 mt-2">
                    查看您的所有交易记录和资金流水
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    导出记录
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </motion.div>

              {/* 统计卡片 */}
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
                        <p className="text-sm font-medium text-gray-600">总收入</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(summary.totalIn)}
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowDownLeft className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-gray-500">资金流入</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总支出</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                          {formatCurrency(summary.totalOut)}
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUpRight className="w-3 h-3 text-red-600 mr-1" />
                          <span className="text-xs text-gray-500">资金流出</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Minus className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">净流入</p>
                        <p className={`text-2xl font-bold mt-1 ${
                          summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(summary.netAmount))}
                        </p>
                        <div className="flex items-center mt-2">
                          {summary.netAmount >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                          )}
                          <span className="text-xs text-gray-500">
                            {summary.netAmount >= 0 ? '盈利' : '亏损'}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">交易笔数</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {summary.transactionCount}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 font-medium">
                            {summary.completedCount} 已完成
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            • {summary.pendingCount} 处理中
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
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
                        placeholder="搜索交易记录..."
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
                      <option value="INVESTMENT">投资</option>
                      <option value="WITHDRAWAL">提现</option>
                      <option value="COMMISSION">佣金</option>
                      <option value="REWARD">收益</option>
                      <option value="TRANSFER">转账</option>
                      <option value="REFUND">退款</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有状态</option>
                      <option value="COMPLETED">已完成</option>
                      <option value="PENDING">处理中</option>
                      <option value="FAILED">失败</option>
                      <option value="CANCELLED">已取消</option>
                    </select>

                    <select
                      value={directionFilter}
                      onChange={(e) => setDirectionFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">全部方向</option>
                      <option value="IN">收入</option>
                      <option value="OUT">支出</option>
                    </select>
                  </div>

                  {selectedTransactions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleBatchAction('export')}>
                        <Download className="w-4 h-4 mr-2" />
                        导出选中 ({selectedTransactions.length})
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedTransactions([])}>
                        取消选择
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 交易列表 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>交易记录 ({filteredTransactions.length})</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedTransactions.length === filteredTransactions.length) {
                            setSelectedTransactions([])
                          } else {
                            setSelectedTransactions(filteredTransactions.map(tx => tx.id))
                          }
                        }}
                      >
                        {selectedTransactions.length === filteredTransactions.length ? '取消全选' : '全选'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => {
                        const TypeIcon = getTypeIcon(transaction.type, transaction.direction)
                        const isSelected = selectedTransactions.includes(transaction.id)
                        
                        return (
                          <div 
                            key={transaction.id}
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
                                    setSelectedTransactions([...selectedTransactions, transaction.id])
                                  } else {
                                    setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id))
                                  }
                                }}
                              />
                              
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                transaction.direction === 'IN' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                <TypeIcon className={`w-6 h-6 ${
                                  transaction.direction === 'IN' ? 'text-green-600' : 'text-red-600'
                                }`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-1">
                                      <h4 className="font-medium text-gray-900">
                                        {getTypeName(transaction.type, transaction.subType)}
                                      </h4>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                        {transaction.status === 'COMPLETED' ? '已完成' :
                                         transaction.status === 'PENDING' ? '处理中' :
                                         transaction.status === 'FAILED' ? '失败' : '已取消'}
                                      </span>
                                      {transaction.details?.productName && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                          {transaction.details.productName}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                      {transaction.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>创建: {formatDate(transaction.createdAt)}</span>
                                      </div>
                                      
                                      {transaction.completedAt && (
                                        <div className="flex items-center space-x-1">
                                          <CheckCircle className="w-3 h-3" />
                                          <span>完成: {formatDate(transaction.completedAt)}</span>
                                        </div>
                                      )}
                                      
                                      {transaction.details?.orderId && (
                                        <div className="flex items-center space-x-1">
                                          <FileText className="w-3 h-3" />
                                          <span>订单: {transaction.details.orderId}</span>
                                        </div>
                                      )}
                                      
                                      {transaction.details?.transactionHash && (
                                        <div className="flex items-center space-x-1">
                                          <ExternalLink className="w-3 h-3" />
                                          <span>哈希: {transaction.details.transactionHash.slice(0, 10)}...</span>
                                        </div>
                                      )}
                                      
                                      {transaction.fee && transaction.fee > 0 && (
                                        <span>手续费: {formatCurrency(transaction.fee)}</span>
                                      )}
                                    </div>
                                    
                                    {transaction.notes && (
                                      <p className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded">
                                        备注: {transaction.notes}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="text-right ml-4">
                                    <p className={`text-lg font-semibold ${
                                      transaction.direction === 'IN' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {transaction.direction === 'IN' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                                    </p>
                                    <div className="text-xs text-gray-500 mt-1">
                                      <div>余额: {formatCurrency(transaction.balanceAfter)}</div>
                                      <div>ID: {transaction.id}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center space-x-2">
                                    {transaction.details?.referralCode && (
                                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                        推荐码: {transaction.details.referralCode}
                                      </span>
                                    )}
                                    {transaction.details?.commissionRate && (
                                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        佣金率: {transaction.details.commissionRate}%
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
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
                      
                      {filteredTransactions.length === 0 && (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无交易记录</h3>
                          <p className="text-gray-600">
                            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || directionFilter !== 'all'
                              ? '没有找到匹配的交易记录，请调整筛选条件'
                              : '您还没有任何交易记录'}
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