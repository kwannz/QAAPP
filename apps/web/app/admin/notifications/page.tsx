'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  Calendar,
  Mail,
  Smartphone,
  Globe,
  Target,
  Zap,
  FileText,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

// 通知类型定义
interface NotificationTemplate {
  id: string
  name: string
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'SYSTEM'
  category: 'MARKETING' | 'TRANSACTION' | 'SYSTEM' | 'SECURITY'
  subject: string
  content: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationCampaign {
  id: string
  name: string
  templateId: string
  templateName: string
  targetType: 'ALL_USERS' | 'USER_GROUPS' | 'SPECIFIC_USERS'
  targetCount: number
  scheduledAt: string | null
  sentAt: string | null
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
  deliveryStats: {
    total: number
    sent: number
    delivered: number
    failed: number
    opened: number
    clicked: number
  }
  createdAt: string
}

interface SystemNotification {
  id: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  title: string
  message: string
  targetUsers: 'ALL' | 'ADMINS' | 'AGENTS' | 'CUSTOMERS'
  isRead: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  expiresAt: string | null
  createdAt: string
  createdBy: string
}

// 模拟数据
const mockTemplates: NotificationTemplate[] = [
  {
    id: 'tpl-1',
    name: '新用户欢迎邮件',
    type: 'EMAIL',
    category: 'MARKETING',
    subject: '欢迎加入QA投资平台',
    content: '亲爱的{{userName}}，欢迎加入我们的投资平台！您的账户已成功创建...',
    variables: ['userName', 'email', 'referralCode'],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'tpl-2',
    name: '投资确认通知',
    type: 'SMS',
    category: 'TRANSACTION',
    subject: '投资确认',
    content: '您的{{productName}}投资（{{amount}} USDT）已确认，预期年化收益率{{apr}}%',
    variables: ['productName', 'amount', 'apr'],
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-25T11:45:00Z'
  },
  {
    id: 'tpl-3',
    name: '收益到账通知',
    type: 'PUSH',
    category: 'TRANSACTION',
    subject: '收益到账',
    content: '恭喜！您获得了{{amount}} USDT的投资收益',
    variables: ['amount', 'productName'],
    isActive: true,
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-22T13:10:00Z'
  },
  {
    id: 'tpl-4',
    name: '系统维护通知',
    type: 'SYSTEM',
    category: 'SYSTEM',
    subject: '系统维护通知',
    content: '系统将于{{maintenanceTime}}进行维护，预计持续{{duration}}小时',
    variables: ['maintenanceTime', 'duration'],
    isActive: false,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  }
]

const mockCampaigns: NotificationCampaign[] = [
  {
    id: 'camp-1',
    name: '新产品推广活动',
    templateId: 'tpl-1',
    templateName: '新用户欢迎邮件',
    targetType: 'USER_GROUPS',
    targetCount: 1250,
    scheduledAt: '2024-02-01T10:00:00Z',
    sentAt: '2024-02-01T10:05:00Z',
    status: 'SENT',
    deliveryStats: {
      total: 1250,
      sent: 1245,
      delivered: 1198,
      failed: 47,
      opened: 856,
      clicked: 234
    },
    createdAt: '2024-01-28T14:30:00Z'
  },
  {
    id: 'camp-2',
    name: '收益提醒推送',
    templateId: 'tpl-3',
    templateName: '收益到账通知',
    targetType: 'SPECIFIC_USERS',
    targetCount: 89,
    scheduledAt: null,
    sentAt: '2024-01-30T16:45:00Z',
    status: 'SENT',
    deliveryStats: {
      total: 89,
      sent: 89,
      delivered: 87,
      failed: 2,
      opened: 76,
      clicked: 45
    },
    createdAt: '2024-01-30T16:40:00Z'
  },
  {
    id: 'camp-3',
    name: '周末投资活动',
    templateId: 'tpl-2',
    templateName: '投资确认通知',
    targetType: 'ALL_USERS',
    targetCount: 3420,
    scheduledAt: '2024-02-03T09:00:00Z',
    sentAt: null,
    status: 'SCHEDULED',
    deliveryStats: {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0
    },
    createdAt: '2024-01-29T11:20:00Z'
  }
]

const mockSystemNotifications: SystemNotification[] = [
  {
    id: 'sys-1',
    type: 'INFO',
    title: '系统升级通知',
    message: '平台将于今晚22:00-24:00进行系统升级，期间可能影响部分功能使用',
    targetUsers: 'ALL',
    isRead: false,
    priority: 'MEDIUM',
    expiresAt: '2024-02-05T00:00:00Z',
    createdAt: '2024-02-01T10:30:00Z',
    createdBy: 'admin'
  },
  {
    id: 'sys-2',
    type: 'WARNING',
    title: '安全提醒',
    message: '检测到异常登录活动，请注意账户安全',
    targetUsers: 'CUSTOMERS',
    isRead: true,
    priority: 'HIGH',
    expiresAt: null,
    createdAt: '2024-01-31T14:15:00Z',
    createdBy: 'security_admin'
  },
  {
    id: 'sys-3',
    type: 'SUCCESS',
    title: '功能更新',
    message: '新增了投资组合分析功能，欢迎体验',
    targetUsers: 'CUSTOMERS',
    isRead: false,
    priority: 'LOW',
    expiresAt: '2024-02-10T23:59:59Z',
    createdAt: '2024-01-30T09:45:00Z',
    createdBy: 'product_admin'
  }
]

const notificationStats = {
  totalSent: 45623,
  deliveryRate: 96.8,
  openRate: 68.5,
  clickRate: 23.7,
  activeTemplates: 12,
  scheduledCampaigns: 3,
  systemNotifications: 8
}

export default function NotificationsManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'campaigns' | 'system' | 'analytics' | 'settings'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [templateFilter, setTemplateFilter] = useState<'all' | 'EMAIL' | 'SMS' | 'PUSH' | 'SYSTEM'>('all')
  const [campaignFilter, setcampaignFilter] = useState<'all' | 'DRAFT' | 'SCHEDULED' | 'SENT' | 'SENDING' | 'FAILED'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = templateFilter === 'all' || template.type === templateFilter
    return matchesSearch && matchesFilter
  })

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.templateName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = campaignFilter === 'all' || campaign.status === campaignFilter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'SUCCESS':
      case 'DELIVERED':
        return 'text-green-600 bg-green-100'
      case 'SCHEDULED':
      case 'INFO':
        return 'text-blue-600 bg-blue-100'
      case 'SENDING':
      case 'DRAFT':
        return 'text-yellow-600 bg-yellow-100'
      case 'FAILED':
      case 'ERROR':
        return 'text-red-600 bg-red-100'
      case 'WARNING':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return Mail
      case 'SMS':
        return Smartphone
      case 'PUSH':
        return Bell
      case 'SYSTEM':
        return Globe
      default:
        return Bell
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
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
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">通知管理</h1>
              <p className="text-gray-600 mt-2">
                管理系统通知模板、推送活动和消息分发
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowTemplateModal(true)} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                新建模板
              </Button>
              <Button onClick={() => setShowCampaignModal(true)} variant="outline" className="flex items-center">
                <Send className="w-4 h-4 mr-2" />
                创建推送
              </Button>
            </div>
          </motion.div>

          {/* 导航标签 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-b border-gray-200"
          >
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: '概览', icon: BarChart3 },
                { key: 'templates', label: '模板管理', icon: FileText },
                { key: 'campaigns', label: '推送活动', icon: Send },
                { key: 'system', label: '系统通知', icon: Bell },
                { key: 'analytics', label: '数据分析', icon: BarChart3 },
                { key: 'settings', label: '通知设置', icon: Settings }
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

          {/* 概览标签页 */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总发送量</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {notificationStats.totalSent.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 font-medium">+12%</span>
                          <span className="text-xs text-gray-500 ml-1">较上月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Send className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">送达率</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {notificationStats.deliveryRate}%
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 font-medium">+0.8%</span>
                          <span className="text-xs text-gray-500 ml-1">较上月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">打开率</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {notificationStats.openRate}%
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-orange-600 font-medium">-2.3%</span>
                          <span className="text-xs text-gray-500 ml-1">较上月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">点击率</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {notificationStats.clickRate}%
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 font-medium">+1.2%</span>
                          <span className="text-xs text-gray-500 ml-1">较上月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 快速操作 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>快速操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      创建新模板
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      发送即时通知
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      计划推送活动
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      查看详细报告
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>最近活动</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">新产品推广邮件发送完成</p>
                          <p className="text-xs text-gray-500">1,245封邮件，送达率98.5%</p>
                        </div>
                        <span className="text-xs text-gray-500">2小时前</span>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">周末活动推送已计划</p>
                          <p className="text-xs text-gray-500">预计发送3,420条消息</p>
                        </div>
                        <span className="text-xs text-gray-500">5小时前</span>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">系统通知模板需要更新</p>
                          <p className="text-xs text-gray-500">2个模板待审核</p>
                        </div>
                        <span className="text-xs text-gray-500">1天前</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* 模板管理标签页 */}
          {activeTab === 'templates' && (
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
                      placeholder="搜索模板名称或内容..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <select
                    value={templateFilter}
                    onChange={(e) => setTemplateFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">所有类型</option>
                    <option value="EMAIL">邮件</option>
                    <option value="SMS">短信</option>
                    <option value="PUSH">推送</option>
                    <option value="SYSTEM">系统</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    导入模板
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出模板
                  </Button>
                </div>
              </div>

              {/* 模板列表 */}
              <Card>
                <CardHeader>
                  <CardTitle>通知模板 ({filteredTemplates.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(filteredTemplates.map(t => t.id))
                                } else {
                                  setSelectedItems([])
                                }
                              }}
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">模板名称</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">类型</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">分类</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">更新时间</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTemplates.map((template) => {
                          const TypeIcon = getTypeIcon(template.type)
                          return (
                            <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300"
                                  checked={selectedItems.includes(template.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItems([...selectedItems, template.id])
                                    } else {
                                      setSelectedItems(selectedItems.filter(id => id !== template.id))
                                    }
                                  }}
                                />
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{template.name}</p>
                                  <p className="text-sm text-gray-500">{template.subject}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <TypeIcon className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm">{template.type}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  template.category === 'MARKETING' ? 'bg-purple-100 text-purple-800' :
                                  template.category === 'TRANSACTION' ? 'bg-green-100 text-green-800' :
                                  template.category === 'SYSTEM' ? 'bg-blue-100 text-blue-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {template.category === 'MARKETING' ? '营销' :
                                   template.category === 'TRANSACTION' ? '交易' :
                                   template.category === 'SYSTEM' ? '系统' : '安全'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {template.isActive ? '启用' : '禁用'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-600">
                                  {formatDate(template.updatedAt)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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

          {/* 推送活动标签页 */}
          {activeTab === 'campaigns' && (
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
                      placeholder="搜索活动名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <select
                    value={campaignFilter}
                    onChange={(e) => setCampaignFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">所有状态</option>
                    <option value="DRAFT">草稿</option>
                    <option value="SCHEDULED">已计划</option>
                    <option value="SENDING">发送中</option>
                    <option value="SENT">已发送</option>
                    <option value="FAILED">失败</option>
                  </select>
                </div>

                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      批量发送 ({selectedItems.length})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-2" />
                      暂停
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </Button>
                  </div>
                )}
              </div>

              {/* 活动列表 */}
              <div className="grid gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            className="mt-1 rounded border-gray-300"
                            checked={selectedItems.includes(campaign.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, campaign.id])
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== campaign.id))
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status === 'DRAFT' ? '草稿' :
                                 campaign.status === 'SCHEDULED' ? '已计划' :
                                 campaign.status === 'SENDING' ? '发送中' :
                                 campaign.status === 'SENT' ? '已发送' : '失败'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              模板: {campaign.templateName} | 目标用户: {campaign.targetCount.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>创建: {formatDate(campaign.createdAt)}</span>
                              {campaign.scheduledAt && (
                                <span>计划: {formatDate(campaign.scheduledAt)}</span>
                              )}
                              {campaign.sentAt && (
                                <span>发送: {formatDate(campaign.sentAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 发送统计 */}
                      {campaign.status === 'SENT' && campaign.deliveryStats.total > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{campaign.deliveryStats.total}</p>
                              <p className="text-xs text-gray-500">总数</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-blue-600">{campaign.deliveryStats.sent}</p>
                              <p className="text-xs text-gray-500">已发送</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-green-600">{campaign.deliveryStats.delivered}</p>
                              <p className="text-xs text-gray-500">已送达</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-red-600">{campaign.deliveryStats.failed}</p>
                              <p className="text-xs text-gray-500">失败</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-purple-600">{campaign.deliveryStats.opened}</p>
                              <p className="text-xs text-gray-500">已打开</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-orange-600">{campaign.deliveryStats.clicked}</p>
                              <p className="text-xs text-gray-500">已点击</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* 系统通知标签页 */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">系统通知</h3>
                  <p className="text-sm text-gray-600">管理系统内通知消息</p>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  发布通知
                </Button>
              </div>

              <div className="space-y-4">
                {mockSystemNotifications.map((notification) => (
                  <Card key={notification.id} className={`overflow-hidden ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(notification.type).split(' ')[1]}`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.type)}`}>
                                {notification.type === 'INFO' ? '信息' :
                                 notification.type === 'WARNING' ? '警告' :
                                 notification.type === 'ERROR' ? '错误' : '成功'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                notification.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.priority === 'CRITICAL' ? '紧急' :
                                 notification.priority === 'HIGH' ? '高' :
                                 notification.priority === 'MEDIUM' ? '中' : '低'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                              <span>目标: {
                                notification.targetUsers === 'ALL' ? '所有用户' :
                                notification.targetUsers === 'ADMINS' ? '管理员' :
                                notification.targetUsers === 'AGENTS' ? '代理商' : '客户'
                              }</span>
                              <span>发布: {formatDate(notification.createdAt)}</span>
                              <span>发布者: {notification.createdBy}</span>
                              {notification.expiresAt && (
                                <span>过期: {formatDate(notification.expiresAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* 其他标签页内容... */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>数据分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">详细的通知数据分析和报告功能正在开发中...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>通知设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">通知系统配置和设置功能正在开发中...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}