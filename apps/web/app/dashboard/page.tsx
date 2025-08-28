'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, Wallet, TrendingUp, Gift, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

import { Button, InvestmentDashboard, WalletConnect, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Header } from '../../components/layout/Header'
import { useAuthStore } from '../../lib/auth-store'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { UserNFTs } from '../../components/dashboard/UserNFTs'

// 模拟数据
const mockStats = {
  totalInvested: 25000,
  currentValue: 27850,
  totalEarnings: 2850,
  claimableRewards: 125.50,
  activePositions: 3,
}

const mockPositions = [
  {
    id: 'pos-1',
    productName: 'QA黄金卡',
    productType: 'gold' as const,
    principal: 10000,
    currentValue: 11250,
    apr: 15,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    nextPayoutAt: '2024-02-15T10:00:00Z',
    nextPayoutAmount: 41.67,
    status: 'active' as const,
  },
  {
    id: 'pos-2',
    productName: 'QA钻石卡',
    productType: 'diamond' as const,
    principal: 15000,
    currentValue: 16600,
    apr: 18,
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    nextPayoutAt: '2024-02-01T10:00:00Z',
    nextPayoutAmount: 74.18,
    status: 'active' as const,
  },
]

const quickActions = [
  {
    title: '购买新产品',
    description: '浏览并购买投资产品',
    icon: PlusCircle,
    href: '/products',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: '管理钱包',
    description: '查看和管理钱包地址',
    icon: Wallet,
    href: '/dashboard/wallets',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: '推荐好友',
    description: '分享推荐码获取佣金',
    icon: Gift,
    href: '/referral',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleClaimRewards = () => {
    // TODO: 实现领取收益功能
    console.log('Claiming rewards...')
  }

  const handleViewPosition = (positionId: string) => {
    // TODO: 跳转到仓位详情页
    console.log('Viewing position:', positionId)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 qa-container py-8">
            <div className="space-y-8">
              {/* 加载骨架屏 */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-96" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
              
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
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
              {/* 欢迎区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div>
                  <h1 className="text-3xl font-bold">
                    欢迎回来, {user?.email ? user.email.split('@')[0] : `用户${user?.referralCode}`}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    管理您的投资组合，查看收益情况，探索新的投资机会。
                  </p>
                </div>
                
                <Link href="/products">
                  <Button size="lg" className="group">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    投资新产品
                  </Button>
                </Link>
              </motion.div>

              {/* 钱包连接状态 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <WalletConnect
                  // 这些状态会由wagmi hooks提供
                  isConnected={false}
                  onConnect={() => {}}
                  onDisconnect={() => {}}
                />
              </motion.div>

              {/* 快捷操作 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={action.title} href={action.href}>
                        <Card className="qa-card-hover cursor-pointer h-full">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${action.color}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{action.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>

              {/* 用户NFT资产 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <UserNFTs />
              </motion.div>

              {/* 投资仪表板 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <InvestmentDashboard
                  stats={mockStats}
                  positions={mockPositions}
                  onClaimRewards={handleClaimRewards}
                  onViewPosition={handleViewPosition}
                />
              </motion.div>

              {/* 最近活动 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>最近活动</CardTitle>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          type: 'investment',
                          title: '购买了 QA黄金卡',
                          amount: '$10,000 USDT',
                          time: '2小时前',
                          status: 'success',
                        },
                        {
                          type: 'payout',
                          title: '收到分红收益',
                          amount: '+$41.67 USDT',
                          time: '1天前',
                          status: 'success',
                        },
                        {
                          type: 'referral',
                          title: '推荐好友获得佣金',
                          amount: '+$30.00 USDT',
                          time: '3天前',
                          status: 'success',
                        },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === 'investment' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'payout' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {activity.type === 'investment' ? '💰' :
                               activity.type === 'payout' ? '📈' : '🎁'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                          <div className={`font-medium text-sm ${
                            activity.amount.startsWith('+') ? 'text-green-600' : 'text-foreground'
                          }`}>
                            {activity.amount}
                          </div>
                        </div>
                      ))}
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