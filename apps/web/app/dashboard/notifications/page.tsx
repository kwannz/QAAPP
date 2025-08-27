'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  BellRing,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  Search,
  Trash2,
  Settings,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Clock,
  Archive,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Smartphone,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@qa-app/ui'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../lib/auth-store'
import { notificationApi } from '../../../lib/api-client'
import toast from 'react-hot-toast'

// 通知类型定义
interface UserNotification {
  id: string
  type: 'SYSTEM' | 'TRANSACTION' | 'MARKETING' | 'SECURITY' | 'PROMOTION'
  category: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  isRead: boolean
  isStarred: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP'
  createdAt: string
  readAt?: string
  expiresAt?: string
  metadata?: {
    amount?: number
    productName?: string
    orderId?: string
  }
}

interface NotificationSettings {
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  transactionAlerts: boolean
  securityAlerts: boolean
  promotionNotices: boolean
}

// 模拟数据
const mockNotifications: UserNotification[] = [
  {
    id: 'notif-1',
    type: 'TRANSACTION',
    category: 'SUCCESS',
    title: '投资收益到账',
    message: '您的QA黄金卡产品产生了41.67 USDT的收益，已自动添加到您的账户余额中。',
    actionUrl: '/dashboard/earnings',
    actionText: '查看详情',
    isRead: false,
    isStarred: true,
    priority: 'HIGH',
    channel: 'PUSH',
    createdAt: '2024-02-01T10:30:00Z',
    metadata: {
      amount: 41.67,
      productName: 'QA黄金卡'
    }
  },
  {
    id: 'notif-2',
    type: 'SYSTEM',
    category: 'INFO',
    title: '系统维护通知',
    message: '平台将于今晚22:00-24:00进行系统升级维护，期间部分功能可能受到影响，请提前做好准备。',
    isRead: false,
    isStarred: false,
    priority: 'MEDIUM',
    channel: 'EMAIL',
    createdAt: '2024-02-01T08:15:00Z',
    expiresAt: '2024-02-02T00:00:00Z'
  },
  {
    id: 'notif-3',
    type: 'SECURITY',
    category: 'WARNING',
    title: '异常登录提醒',
    message: '检测到您的账户在新设备上登录（IP: 192.168.1.100），如非本人操作，请立即修改密码。',
    actionUrl: '/dashboard/profile?tab=security',
    actionText: '安全设置',
    isRead: true,
    isStarred: false,
    priority: 'CRITICAL',
    channel: 'SMS',
    createdAt: '2024-01-31T16:45:00Z',
    readAt: '2024-01-31T17:00:00Z'
  },
  {
    id: 'notif-4',
    type: 'MARKETING',
    category: 'INFO',
    title: '限时投资活动',
    message: '新春特惠：QA钻石卡年化收益率提升至20%，活动时间有限，把握投资良机！',
    actionUrl: '/products?type=diamond',
    actionText: '立即投资',
    isRead: true,
    isStarred: false,
    priority: 'LOW',
    channel: 'EMAIL',
    createdAt: '2024-01-30T14:20:00Z',
    readAt: '2024-01-30T15:30:00Z',
    expiresAt: '2024-02-05T23:59:59Z'
  },
  {
    id: 'notif-5',
    type: 'TRANSACTION',
    category: 'SUCCESS',
    title: '订单确认',
    message: '您的投资订单已成功确认，投资金额: 10,000 USDT，产品: QA白银卡，预期年化收益率: 12%。',
    actionUrl: '/dashboard',
    actionText: '查看投资',
    isRead: false,
    isStarred: false,
    priority: 'HIGH',
    channel: 'PUSH',
    createdAt: '2024-01-29T11:10:00Z',
    metadata: {
      amount: 10000,
      productName: 'QA白银卡',
      orderId: 'ORDER-2024-001'
    }
  },
  {
    id: 'notif-6',
    type: 'PROMOTION',
    category: 'SUCCESS',
    title: '推荐奖励到账',
    message: '恭喜！您成功推荐好友注册并完成首次投资，推荐奖励30 USDT已到账。',
    actionUrl: '/referral',
    actionText: '推荐更多',
    isRead: true,
    isStarred: true,
    priority: 'MEDIUM',
    channel: 'PUSH',
    createdAt: '2024-01-28T09:45:00Z',
    readAt: '2024-01-28T10:00:00Z',
    metadata: {
      amount: 30
    }
  }
]

const mockSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  marketingEmails: true,
  transactionAlerts: true,
  securityAlerts: true,
  promotionNotices: false
}

export default function NotificationsCenter() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(mockSettings)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred' | 'settings'>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'SYSTEM' | 'TRANSACTION' | 'MARKETING' | 'SECURITY' | 'PROMOTION'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, unread: 0 })

  // 加载通知数据
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 并行加载通知和统计数据
        const [notificationResponse, statsResponse, preferencesResponse] = await Promise.all([
          notificationApi.getUserNotifications(user.id, { page: 1, limit: 50 }),
          notificationApi.getStats(user.id),
          notificationApi.getPreferences(user.id)
        ])

        // 设置通知数据
        if (notificationResponse.data) {
          setNotifications(notificationResponse.data.notifications || [])
          setStats({
            total: notificationResponse.data.total || 0,
            unread: notificationResponse.data.unreadCount || 0
          })
        }

        // 设置用户偏好设置
        if (preferencesResponse.data) {
          setSettings({
            ...mockSettings,
            ...preferencesResponse.data
          })
        }

      } catch (error: any) {
        console.error('Failed to load notifications:', error)
        setError('加载通知数据失败，使用模拟数据')
        // 使用 fallback 数据
        setNotifications(mockNotifications)
        toast.error('加载通知失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [user?.id])

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !notification.isRead) ||
                      (activeTab === 'starred' && notification.isStarred)
    const matchesType = selectedType === 'all' || notification.type === selectedType
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesType && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const starredCount = notifications.filter(n => n.isStarred).length

  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return
    
    try {
      await notificationApi.markAsRead(user.id, id)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      )
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
      toast.success('已标记为已读')
    } catch (error) {
      toast.error('标记失败')
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    // 注意：大多数系统不提供"标记为未读"的API，这里保持本地操作
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, isRead: false, readAt: undefined }
          : notif
      )
    )
    setStats(prev => ({ ...prev, unread: prev.unread + 1 }))
  }

  const handleToggleStar = (id: string) => {
    // 收藏功能通常是本地状态，不需要API调用
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, isStarred: !notif.isStarred }
          : notif
      )
    )
  }

  const handleDelete = async (id: string) => {
    if (!user?.id) return
    
    try {
      await notificationApi.delete(user.id, id)
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      setSelectedItems(prev => prev.filter(itemId => itemId !== id))
      setStats(prev => ({ 
        ...prev, 
        total: prev.total - 1,
        unread: prev.unread - (notifications.find(n => n.id === id)?.isRead ? 0 : 1)
      }))
      toast.success('通知已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleBatchMarkAsRead = async () => {
    if (selectedItems.length > 0 && user?.id) {
      try {
        // 批量标记为已读（如果API支持的话，这里简化为逐个调用）
        await Promise.all(selectedItems.map(id => notificationApi.markAsRead(user.id, id)))
        
        setNotifications(prev => 
          prev.map(notif => 
            selectedItems.includes(notif.id)
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        )
        const unreadCount = selectedItems.filter(id => !notifications.find(n => n.id === id)?.isRead).length
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - unreadCount) }))
        setSelectedItems([])
        toast.success(`已标记 ${selectedItems.length} 条通知为已读`)
      } catch (error) {
        toast.error('批量操作失败')
      }
    }
  }

  const handleBatchDelete = async () => {
    if (selectedItems.length > 0 && user?.id) {
      try {
        // 批量删除（逐个调用API）
        await Promise.all(selectedItems.map(id => notificationApi.delete(user.id, id)))
        
        const deletingUnreadCount = selectedItems.filter(id => !notifications.find(n => n.id === id)?.isRead).length
        setNotifications(prev => prev.filter(notif => !selectedItems.includes(notif.id)))
        setStats(prev => ({ 
          ...prev, 
          total: prev.total - selectedItems.length,
          unread: Math.max(0, prev.unread - deletingUnreadCount)
        }))
        setSelectedItems([])
        toast.success(`已删除 ${selectedItems.length} 条通知`)
      } catch (error) {
        toast.error('批量删除失败')
      }
    }
  }

  // 更新通知偏好设置
  const handleUpdatePreferences = async (key: string, value: boolean) => {
    if (!user?.id) return
    
    try {
      const updatedSettings = { ...settings, [key]: value }
      
      // 映射前端设置到API格式
      const apiPreferences = {
        email: updatedSettings.emailNotifications,
        push: updatedSettings.pushNotifications,
        sms: updatedSettings.smsNotifications,
        types: {
          orderUpdates: updatedSettings.transactionAlerts,
          commissionPayments: updatedSettings.transactionAlerts,
          systemAlerts: updatedSettings.securityAlerts,
          promotions: updatedSettings.marketingEmails
        }
      }
      
      await notificationApi.updatePreferences(user.id, apiPreferences)
      setSettings(updatedSettings)
      toast.success('偏好设置已更新')
    } catch (error) {
      toast.error('更新设置失败')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return CheckCircle
      case 'SYSTEM': return Settings
      case 'SECURITY': return AlertTriangle
      case 'MARKETING': return Star
      case 'PROMOTION': return Star
      default: return Bell
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL': return Mail
      case 'SMS': return Smartphone
      case 'PUSH': return Bell
      default: return Globe
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SUCCESS': return 'text-green-600 bg-green-100'
      case 'WARNING': return 'text-orange-600 bg-orange-100'
      case 'ERROR': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-4 border-red-500'
      case 'HIGH': return 'border-l-4 border-orange-500'
      case 'MEDIUM': return 'border-l-4 border-yellow-500'
      default: return 'border-l-4 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return '刚刚'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`
    } else if (diffInHours < 48) {
      return '1天前'
    } else {
      return date.toLocaleDateString('zh-CN')
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
                    <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
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
                  <h1 className="text-3xl font-bold text-gray-900">通知中心</h1>
                  <p className="text-gray-600 mt-2">
                    查看和管理您的所有通知消息
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Archive className="w-4 h-4 mr-2" />
                    归档全部
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    通知设置
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
                <Card 
                  className={`cursor-pointer transition-all ${
                    activeTab === 'all' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">全部通知</p>
                        <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                      </div>
                      <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    activeTab === 'unread' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveTab('unread')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">未读通知</p>
                        <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                      </div>
                      <BellRing className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    activeTab === 'starred' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveTab('starred')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">星标通知</p>
                        <p className="text-2xl font-bold text-yellow-600">{starredCount}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">今日新增</p>
                        <p className="text-2xl font-bold text-green-600">
                          {notifications.filter(n => {
                            const today = new Date().toDateString()
                            return new Date(n.createdAt).toDateString() === today
                          }).length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 通知设置页面 */}
              {activeTab === 'settings' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>通知设置</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">通知渠道</h3>
                          
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Bell className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium">推送通知</p>
                                <p className="text-sm text-gray-600">浏览器推送通知</p>
                              </div>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSettings(prev => ({...prev, pushNotifications: !prev.pushNotifications}))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">邮件通知</p>
                                <p className="text-sm text-gray-600">重要通知邮件提醒</p>
                              </div>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSettings(prev => ({...prev, emailNotifications: !prev.emailNotifications}))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Smartphone className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="font-medium">短信通知</p>
                                <p className="text-sm text-gray-600">紧急情况短信提醒</p>
                              </div>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSettings(prev => ({...prev, smsNotifications: !prev.smsNotifications}))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">通知类型</h3>
                          
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">交易提醒</p>
                                <p className="text-sm text-gray-600">投资、收益、提现等</p>
                              </div>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.transactionAlerts ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSettings(prev => ({...prev, transactionAlerts: !prev.transactionAlerts}))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  settings.transactionAlerts ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <div>
                                <p className="font-medium">安全提醒</p>
                                <p className="text-sm text-gray-600">登录、密码、风险等</p>
                              </div>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.securityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSettings(prev => ({...prev, securityAlerts: !prev.securityAlerts}))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  settings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Star className="w-5 h-5 text-yellow-600" />
                              <div>
                                <p className="font-medium">营销推广</p>
                                <p className="text-sm text-gray-600">活动、优惠、新产品等</p>
                              </div>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSettings(prev => ({...prev, marketingEmails: !prev.marketingEmails}))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button>保存设置</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* 通知列表 */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* 搜索和筛选 */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="搜索通知..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-80"
                        />
                      </div>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">所有类型</option>
                        <option value="TRANSACTION">交易</option>
                        <option value="SYSTEM">系统</option>
                        <option value="SECURITY">安全</option>
                        <option value="MARKETING">营销</option>
                        <option value="PROMOTION">推广</option>
                      </select>
                    </div>

                    {selectedItems.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleBatchMarkAsRead}>
                          <Check className="w-4 h-4 mr-2" />
                          标记已读 ({selectedItems.length})
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleBatchDelete} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 通知列表 */}
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => {
                      const TypeIcon = getTypeIcon(notification.type)
                      const ChannelIcon = getChannelIcon(notification.channel)
                      const isExpired = notification.expiresAt && new Date(notification.expiresAt) < new Date()
                      
                      return (
                        <Card 
                          key={notification.id} 
                          className={`transition-all hover:shadow-md ${
                            !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          } ${getPriorityColor(notification.priority)} ${isExpired ? 'opacity-60' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                className="mt-1 rounded border-gray-300"
                                checked={selectedItems.includes(notification.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, notification.id])
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== notification.id))
                                  }
                                }}
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <TypeIcon className="w-4 h-4 text-gray-600" />
                                      <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {notification.title}
                                      </h3>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                                        {notification.category === 'SUCCESS' ? '成功' :
                                         notification.category === 'WARNING' ? '警告' :
                                         notification.category === 'ERROR' ? '错误' : '信息'}
                                      </span>
                                      {notification.priority === 'CRITICAL' && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                          紧急
                                        </span>
                                      )}
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                          <ChannelIcon className="w-3 h-3" />
                                          <span>{notification.channel}</span>
                                        </div>
                                        <span>{formatDate(notification.createdAt)}</span>
                                        {notification.readAt && (
                                          <span>已读于 {formatDate(notification.readAt)}</span>
                                        )}
                                        {isExpired && (
                                          <span className="text-red-500">已过期</span>
                                        )}
                                      </div>
                                      
                                      {notification.actionUrl && !isExpired && (
                                        <Button size="sm" variant="outline">
                                          {notification.actionText || '查看'}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleStar(notification.id)}
                                      className={notification.isStarred ? 'text-yellow-600' : 'text-gray-400'}
                                    >
                                      <Star className={`w-4 h-4 ${notification.isStarred ? 'fill-current' : ''}`} />
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => notification.isRead ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id)}
                                    >
                                      {notification.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(notification.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    
                    {filteredNotifications.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
                          <p className="text-gray-600">
                            {searchTerm ? '没有找到匹配的通知' : '您目前没有任何通知'}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}