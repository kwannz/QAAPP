'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { AdminGuard } from '../../components/admin/AdminGuard'

// 模拟数据
const adminStats = {
  totalUsers: 15420,
  pendingKyc: 89,
  activeOrders: 234,
  pendingWithdrawals: 12,
  totalRevenue: 1234567.89,
  dailyActiveUsers: 3421,
  systemHealth: 99.8,
  pendingReviews: 47
}

const recentActivities = [
  {
    id: 1,
    type: 'kyc_approved',
    user: 'user1234@example.com',
    action: 'KYC审核通过',
    timestamp: '5分钟前',
    status: 'success'
  },
  {
    id: 2,
    type: 'withdrawal_pending',
    user: 'user5678@example.com', 
    action: '提现申请待审核',
    amount: 5000,
    timestamp: '12分钟前',
    status: 'pending'
  },
  {
    id: 3,
    type: 'large_order',
    user: 'user9999@example.com',
    action: '大额订单预警',
    amount: 50000,
    timestamp: '25分钟前',
    status: 'warning'
  },
  {
    id: 4,
    type: 'kyc_rejected',
    user: 'user7777@example.com',
    action: 'KYC审核拒绝',
    timestamp: '1小时前',
    status: 'error'
  }
]

const quickStats = [
  {
    title: '待处理KYC',
    value: adminStats.pendingKyc,
    change: '+12%',
    changeType: 'increase',
    icon: UserCheck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    href: '/admin/kycreview'
  },
  {
    title: '待审核提现',
    value: adminStats.pendingWithdrawals,
    change: '-5%',
    changeType: 'decrease',
    icon: CreditCard,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    href: '/admin/withdrawals'
  },
  {
    title: '活跃订单',
    value: adminStats.activeOrders,
    change: '+8%',
    changeType: 'increase',
    icon: ShoppingBag,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    href: '/admin/orders'
  },
  {
    title: '系统健康度',
    value: `${adminStats.systemHealth}%`,
    change: '+0.2%',
    changeType: 'increase',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    href: '/admin/system'
  }
]

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('today')

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="space-y-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">管理员控制台</h1>
              <p className="text-gray-600 mt-2">
                系统运营概览和快速操作入口
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </motion.div>

          {/* 快捷统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                        <div className="flex items-center mt-2">
                          {stat.changeType === 'increase' ? (
                            <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-red-600 mr-1" />
                          )}
                          <span className={`text-xs font-medium ${
                            stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">较昨日</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 系统概览 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    系统概览
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {adminStats.totalUsers.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">总用户数</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(adminStats.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600">总收入</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">今日活跃用户</span>
                      <span className="font-semibold">{adminStats.dailyActiveUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">待处理事项</span>
                      <span className="font-semibold text-orange-600">{adminStats.pendingReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">系统健康度</span>
                      <span className="font-semibold text-green-600">{adminStats.systemHealth}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 最近活动 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      最近活动
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      查看全部
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status).split(' ')[1]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.user}
                            </p>
                            <span className="text-xs text-gray-500">
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {activity.action}
                            {activity.amount && (
                              <span className="font-semibold ml-1">
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status === 'success' && '成功'}
                          {activity.status === 'pending' && '待处理'}
                          {activity.status === 'warning' && '警告'}
                          {activity.status === 'error' && '失败'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 快速操作区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <UserCheck className="w-6 h-6 mb-2" />
                    <span className="text-xs">批量审核KYC</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="text-xs">批量处理提现</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <span className="text-xs">风险预警</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span className="text-xs">生成报告</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}