'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Share2,
  Copy,
  Eye,
  Download,
  Calendar,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  Star,
  Award,
  Target,
  Zap,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../lib/auth-store'
import { commissionApi } from '../../../lib/api-client'
import toast from 'react-hot-toast'

// 佣金相关类型定义
interface Commission {
  id: string
  type: 'DIRECT_SALE' | 'REFERRAL_BONUS' | 'PERFORMANCE_BONUS' | 'TIER_BONUS'
  amount: number
  status: 'PENDING' | 'PAID' | 'PROCESSING'
  referredUserId: string
  referredUserEmail: string
  sourceOrderId?: string
  productName?: string
  tier: number
  rate: number
  createdAt: string
  paidAt?: string
  description: string
}

interface ReferralUser {
  id: string
  email: string
  registeredAt: string
  firstInvestmentAt?: string
  totalInvestment: number
  status: 'REGISTERED' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE'
  tier: number
  totalCommissionsGenerated: number
  lastActivityAt: string
}

interface CommissionStats {
  totalEarned: number
  totalPending: number
  thisMonthEarned: number
  totalWithdrawn: number
  availableBalance: number
  totalReferrals: number
  activeReferrals: number
  averageCommissionRate: number
  topTierReferrals: number
}

interface CommissionTier {
  tier: number
  name: string
  minReferrals: number
  maxReferrals?: number
  commissionRate: number
  bonusRate?: number
  requirements: string[]
  benefits: string[]
}

// 模拟数据
const mockCommissions: Commission[] = [
  {
    id: 'comm-1',
    type: 'DIRECT_SALE',
    amount: 150.00,
    status: 'PAID',
    referredUserId: 'user-123',
    referredUserEmail: 'user123@example.com',
    sourceOrderId: 'ORDER-2024-001',
    productName: 'QA黄金卡',
    tier: 1,
    rate: 1.5,
    createdAt: '2024-02-01T10:30:00Z',
    paidAt: '2024-02-02T09:15:00Z',
    description: '直接推荐用户购买QA黄金卡获得的佣金'
  },
  {
    id: 'comm-2',
    type: 'REFERRAL_BONUS',
    amount: 30.00,
    status: 'PAID',
    referredUserId: 'user-456',
    referredUserEmail: 'user456@example.com',
    tier: 1,
    rate: 0.5,
    createdAt: '2024-01-28T16:45:00Z',
    paidAt: '2024-01-30T11:20:00Z',
    description: '推荐好友注册并完成首次投资的奖励'
  },
  {
    id: 'comm-3',
    type: 'PERFORMANCE_BONUS',
    amount: 200.00,
    status: 'PROCESSING',
    referredUserId: 'system',
    referredUserEmail: '系统奖励',
    tier: 2,
    rate: 0,
    createdAt: '2024-01-31T23:59:00Z',
    description: '达成月度推荐目标获得的绩效奖金'
  },
  {
    id: 'comm-4',
    type: 'DIRECT_SALE',
    amount: 75.00,
    status: 'PENDING',
    referredUserId: 'user-789',
    referredUserEmail: 'user789@example.com',
    sourceOrderId: 'ORDER-2024-015',
    productName: 'QA白银卡',
    tier: 1,
    rate: 1.5,
    createdAt: '2024-02-01T14:22:00Z',
    description: '直接推荐用户购买QA白银卡获得的佣金'
  },
  {
    id: 'comm-5',
    type: 'TIER_BONUS',
    amount: 25.00,
    status: 'PAID',
    referredUserId: 'user-321',
    referredUserEmail: 'user321@example.com',
    tier: 2,
    rate: 0.25,
    createdAt: '2024-01-25T08:10:00Z',
    paidAt: '2024-01-27T15:30:00Z',
    description: '二级推荐用户投资产生的层级奖励'
  }
]

const mockReferrals: ReferralUser[] = [
  {
    id: 'user-123',
    email: 'user123@example.com',
    registeredAt: '2024-01-15T10:00:00Z',
    firstInvestmentAt: '2024-01-16T14:30:00Z',
    totalInvestment: 10000,
    status: 'ACTIVE',
    tier: 1,
    totalCommissionsGenerated: 150,
    lastActivityAt: '2024-02-01T10:30:00Z'
  },
  {
    id: 'user-456',
    email: 'user456@example.com',
    registeredAt: '2024-01-20T16:20:00Z',
    firstInvestmentAt: '2024-01-28T09:45:00Z',
    totalInvestment: 5000,
    status: 'ACTIVE',
    tier: 1,
    totalCommissionsGenerated: 30,
    lastActivityAt: '2024-01-30T12:15:00Z'
  },
  {
    id: 'user-789',
    email: 'user789@example.com',
    registeredAt: '2024-01-30T11:30:00Z',
    firstInvestmentAt: '2024-02-01T14:20:00Z',
    totalInvestment: 5000,
    status: 'ACTIVE',
    tier: 1,
    totalCommissionsGenerated: 75,
    lastActivityAt: '2024-02-01T14:22:00Z'
  },
  {
    id: 'user-321',
    email: 'user321@example.com',
    registeredAt: '2024-01-10T09:15:00Z',
    firstInvestmentAt: undefined,
    totalInvestment: 0,
    status: 'REGISTERED',
    tier: 1,
    totalCommissionsGenerated: 0,
    lastActivityAt: '2024-01-10T09:15:00Z'
  }
]

const mockStats: CommissionStats = {
  totalEarned: 480.00,
  totalPending: 75.00,
  thisMonthEarned: 455.00,
  totalWithdrawn: 205.00,
  availableBalance: 275.00,
  totalReferrals: 8,
  activeReferrals: 5,
  averageCommissionRate: 1.2,
  topTierReferrals: 2
}

const mockTiers: CommissionTier[] = [
  {
    tier: 1,
    name: '青铜推荐员',
    minReferrals: 0,
    maxReferrals: 9,
    commissionRate: 1.5,
    requirements: ['完成实名认证', '至少1个有效推荐'],
    benefits: ['1.5%直推佣金', '推荐奖励30 USDT']
  },
  {
    tier: 2,
    name: '白银推荐员',
    minReferrals: 10,
    maxReferrals: 29,
    commissionRate: 2.0,
    bonusRate: 0.25,
    requirements: ['10个有效推荐', '推荐用户总投资≥50,000 USDT'],
    benefits: ['2%直推佣金', '0.25%二级奖励', '月度绩效奖金']
  },
  {
    tier: 3,
    name: '黄金推荐员',
    minReferrals: 30,
    maxReferrals: 99,
    commissionRate: 2.5,
    bonusRate: 0.5,
    requirements: ['30个有效推荐', '推荐用户总投资≥200,000 USDT'],
    benefits: ['2.5%直推佣金', '0.5%二级奖励', '专属客服支持']
  },
  {
    tier: 4,
    name: '钻石推荐员',
    minReferrals: 100,
    commissionRate: 3.0,
    bonusRate: 1.0,
    requirements: ['100个有效推荐', '推荐用户总投资≥1,000,000 USDT'],
    benefits: ['3%直推佣金', '1%二级奖励', '年度分红奖励', 'VIP专线服务']
  }
]

export default function UserCommissionsCenter() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'referrals' | 'tiers' | 'withdrawal'>('overview')
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [referrals, setReferrals] = useState<ReferralUser[]>([])
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [tiers] = useState<CommissionTier[]>(mockTiers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'PAID' | 'PROCESSING'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'DIRECT_SALE' | 'REFERRAL_BONUS' | 'PERFORMANCE_BONUS' | 'TIER_BONUS'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showReferralCode, setShowReferralCode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载佣金数据
  useEffect(() => {
    const loadCommissionData = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 并行加载所有数据
        const [commissionHistory, commissionSummary] = await Promise.all([
          commissionApi.getUserHistory(user.id, { page: 1, limit: 50 }),
          commissionApi.getUserSummary(user.id)
        ])

        // 设置佣金历史数据
        if (commissionHistory.data) {
          setCommissions(commissionHistory.data.commissions || [])
          // 从历史数据中提取推荐用户信息
          const uniqueReferrals = new Map()
          commissionHistory.data.commissions?.forEach((commission: Commission) => {
            if (!uniqueReferrals.has(commission.referredUserId)) {
              uniqueReferrals.set(commission.referredUserId, {
                id: commission.referredUserId,
                email: commission.referredUserEmail,
                registeredAt: commission.createdAt,
                totalInvestment: 0, // 需要从其他接口获取
                status: 'ACTIVE',
                tier: commission.tier,
                totalCommissionsGenerated: 0,
                lastActivityAt: commission.createdAt
              })
            }
          })
          setReferrals(Array.from(uniqueReferrals.values()))
        }

        // 设置统计数据
        if (commissionSummary.data) {
          setStats({
            totalEarned: commissionSummary.data.totalEarned || 0,
            totalPending: commissionSummary.data.totalPending || 0,
            thisMonthEarned: commissionSummary.data.thisMonthEarned || 0,
            totalWithdrawn: commissionSummary.data.totalWithdrawn || 0,
            availableBalance: commissionSummary.data.availableBalance || 0,
            totalReferrals: commissionSummary.data.totalReferrals || 0,
            activeReferrals: commissionSummary.data.activeReferrals || 0,
            averageCommissionRate: commissionSummary.data.averageCommissionRate || 0,
            topTierReferrals: commissionSummary.data.topTierReferrals || 0
          })
        } else {
          // 使用 fallback 数据
          setStats(mockStats)
        }

      } catch (error: any) {
        console.error('Failed to load commission data:', error)
        setError('加载佣金数据失败，使用模拟数据')
        // 使用 fallback 数据
        setCommissions(mockCommissions)
        setReferrals(mockReferrals)
        setStats(mockStats)
        toast.error('加载佣金数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadCommissionData()
  }, [user?.id])

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.referredUserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter
    const matchesType = typeFilter === 'all' || commission.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const currentUserTier = mockTiers.find(tier => {
    const referralCount = stats?.totalReferrals || 0
    return referralCount >= tier.minReferrals && (!tier.maxReferrals || referralCount <= tier.maxReferrals)
  }) || mockTiers[0]

  const nextTier = mockTiers.find(tier => tier.tier === currentUserTier.tier + 1)

  const handleCopyReferralCode = async () => {
    const referralCode = user?.referralCode || 'QA2024XXXX'
    try {
      await navigator.clipboard.writeText(`https://qa-app.com/register?ref=${referralCode}`)
      toast.success('推荐链接已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败，请手动复制')
    }
  }

  const handleWithdraw = () => {
    if (!stats?.availableBalance || stats.availableBalance <= 0) {
      toast.error('暂无可提现余额')
      return
    }
    // 跳转到提现页面
    window.location.href = '/dashboard/withdrawals'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-100'
      case 'PROCESSING': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DIRECT_SALE': return DollarSign
      case 'REFERRAL_BONUS': return Gift
      case 'PERFORMANCE_BONUS': return Award
      case 'TIER_BONUS': return Star
      default: return DollarSign
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'DIRECT_SALE': return '直推佣金'
      case 'REFERRAL_BONUS': return '推荐奖励'
      case 'PERFORMANCE_BONUS': return '绩效奖金'
      case 'TIER_BONUS': return '层级奖励'
      default: return '佣金'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'VERIFIED': return 'text-blue-600 bg-blue-100'
      case 'REGISTERED': return 'text-orange-600 bg-orange-100'
      case 'INACTIVE': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
                  <h1 className="text-3xl font-bold text-gray-900">佣金中心</h1>
                  <p className="text-gray-600 mt-2">
                    管理您的推荐佣金和推广收益
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    分享推荐链接
                  </Button>
                  <Button onClick={handleWithdraw} disabled={stats.availableBalance <= 0}>
                    <Wallet className="w-4 h-4 mr-2" />
                    申请提现
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
                        <p className="text-sm font-medium text-gray-600">总收益</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats?.totalEarned || 0)}
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600 font-medium">+15.2%</span>
                          <span className="text-xs text-gray-500 ml-1">本月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">可提现余额</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats?.availableBalance || 0)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-blue-600 font-medium">
                            待结算 {formatCurrency(stats?.totalPending || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">推荐用户</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stats?.totalReferrals || 0}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-purple-600 font-medium">
                            活跃 {stats?.activeReferrals || 0}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">当前等级</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {currentUserTier.name}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-orange-600 font-medium">
                            {currentUserTier.commissionRate}% 佣金率
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 标签导航 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-b border-gray-200"
              >
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: 'overview', label: '收益概览', icon: BarChart3 },
                    { key: 'commissions', label: '佣金明细', icon: DollarSign },
                    { key: 'referrals', label: '我的推荐', icon: Users },
                    { key: 'tiers', label: '等级系统', icon: Award },
                    { key: 'withdrawal', label: '提现记录', icon: CreditCard }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </motion.div>

              {/* 收益概览页面 */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 推荐链接 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Share2 className="w-5 h-5 mr-2" />
                          我的推荐链接
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">推荐码</p>
                              <p className="font-bold text-lg text-gray-900">
                                {user?.referralCode || 'QA2024XXXX'}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleCopyReferralCode}>
                              <Copy className="w-4 h-4 mr-2" />
                              复制链接
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">分享奖励</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 好友注册成功奖励: 30 USDT</li>
                            <li>• 好友首次投资佣金: {currentUserTier.commissionRate}%</li>
                            <li>• 持续投资返佣: {currentUserTier.commissionRate}%</li>
                            {currentUserTier.bonusRate && (
                              <li>• 二级推荐奖励: {currentUserTier.bonusRate}%</li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 本月表现 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          本月表现
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">本月收益</span>
                            <span className="font-semibold text-lg text-green-600">
                              {formatCurrency(stats?.thisMonthEarned || 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">新增推荐</span>
                            <span className="font-semibold text-blue-600">3人</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">推荐投资总额</span>
                            <span className="font-semibold text-purple-600">15,000 USDT</span>
                          </div>
                          
                          {nextTier && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-900">升级进度</span>
                                <span className="text-sm text-blue-700">
                                  {stats?.totalReferrals || 0}/{nextTier.minReferrals}
                                </span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, ((stats?.totalReferrals || 0) / nextTier.minReferrals) * 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-blue-700 mt-1">
                                还需推荐 {Math.max(0, nextTier.minReferrals - (stats?.totalReferrals || 0))} 人升级到{nextTier.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 最近佣金 */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          最近佣金记录
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('commissions')}>
                          查看全部 <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {commissions.slice(0, 5).map((commission) => {
                          const TypeIcon = getTypeIcon(commission.type)
                          return (
                            <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <TypeIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{getTypeName(commission.type)}</p>
                                  <p className="text-sm text-gray-600">{commission.referredUserEmail}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">+{formatCurrency(commission.amount)}</p>
                                <p className="text-xs text-gray-500">{formatDate(commission.createdAt)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 佣金明细页面 */}
              {activeTab === 'commissions' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  {/* 搜索和筛选 */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="搜索用户邮箱或描述..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-80"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">所有状态</option>
                        <option value="PAID">已支付</option>
                        <option value="PROCESSING">处理中</option>
                        <option value="PENDING">待支付</option>
                      </select>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">所有类型</option>
                        <option value="DIRECT_SALE">直推佣金</option>
                        <option value="REFERRAL_BONUS">推荐奖励</option>
                        <option value="PERFORMANCE_BONUS">绩效奖金</option>
                        <option value="TIER_BONUS">层级奖励</option>
                      </select>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      导出记录
                    </Button>
                  </div>

                  {/* 佣金列表 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>佣金明细 ({filteredCommissions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-900">类型</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">推荐用户</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">佣金金额</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">创建时间</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCommissions.map((commission) => {
                              const TypeIcon = getTypeIcon(commission.type)
                              return (
                                <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center space-x-2">
                                      <TypeIcon className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium">{getTypeName(commission.type)}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{commission.referredUserEmail}</p>
                                      {commission.productName && (
                                        <p className="text-xs text-gray-500">{commission.productName}</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(commission.amount)}
                                    </span>
                                    {commission.rate > 0 && (
                                      <p className="text-xs text-gray-500">{commission.rate}% 佣金率</p>
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                                      {commission.status === 'PAID' ? '已支付' :
                                       commission.status === 'PROCESSING' ? '处理中' : '待支付'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-sm text-gray-600">
                                      {formatDate(commission.createdAt)}
                                    </span>
                                    {commission.paidAt && (
                                      <p className="text-xs text-gray-500">
                                        已支付: {formatDate(commission.paidAt)}
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 我的推荐页面 */}
              {activeTab === 'referrals' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>推荐用户列表</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {referrals.map((referral) => (
                          <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{referral.email}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>注册: {formatDate(referral.registeredAt)}</span>
                                  {referral.firstInvestmentAt && (
                                    <span>• 首投: {formatDate(referral.firstInvestmentAt)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReferralStatusColor(referral.status)}`}>
                                  {referral.status === 'ACTIVE' ? '活跃' :
                                   referral.status === 'VERIFIED' ? '已验证' :
                                   referral.status === 'REGISTERED' ? '已注册' : '不活跃'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                总投资: {formatCurrency(referral.totalInvestment)}
                              </p>
                              <p className="text-sm text-green-600">
                                已产生佣金: {formatCurrency(referral.totalCommissionsGenerated)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 等级系统页面 */}
              {activeTab === 'tiers' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    {tiers.map((tier) => (
                      <Card key={tier.tier} className={`overflow-hidden ${currentUserTier.tier === tier.tier ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardHeader className={`${currentUserTier.tier === tier.tier ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center">
                              <Award className="w-5 h-5 mr-2" />
                              {tier.name}
                              {currentUserTier.tier === tier.tier && (
                                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                  当前等级
                                </span>
                              )}
                            </CardTitle>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{tier.commissionRate}%</p>
                              <p className="text-sm text-gray-600">直推佣金率</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">升级要求</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>推荐用户: {tier.minReferrals}{tier.maxReferrals ? `-${tier.maxReferrals}` : '+'} 人</li>
                                {tier.requirements.map((req, index) => (
                                  <li key={index}>• {req}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">等级特权</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {tier.benefits.map((benefit, index) => (
                                  <li key={index}>• {benefit}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex items-center justify-center">
                              {currentUserTier.tier === tier.tier ? (
                                <div className="text-center">
                                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-green-600">已达成</p>
                                </div>
                              ) : currentUserTier.tier > tier.tier ? (
                                <div className="text-center">
                                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">已超越</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">未达成</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 提现记录页面 */}
              {activeTab === 'withdrawal' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>提现记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无提现记录</h3>
                        <p className="text-gray-600 mb-4">
                          您还没有申请过佣金提现
                        </p>
                        <Button onClick={handleWithdraw} disabled={stats.availableBalance <= 0}>
                          <Wallet className="w-4 h-4 mr-2" />
                          立即提现
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}