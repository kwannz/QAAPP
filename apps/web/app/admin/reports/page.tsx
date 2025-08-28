'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Share2,
  Clock,
  DollarSign,
  Users,
  ShoppingBag,
  CreditCard,
  Target,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Settings,
  Mail,
  Printer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

// 报表类型定义
interface ReportTemplate {
  id: string
  name: string
  category: 'FINANCIAL' | 'USER' | 'TRANSACTION' | 'PERFORMANCE' | 'COMPLIANCE'
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
  description: string
  fields: string[]
  isActive: boolean
  lastGenerated: string | null
  createdAt: string
}

interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  title: string
  period: string
  generatedAt: string
  generatedBy: string
  status: 'GENERATING' | 'COMPLETED' | 'FAILED'
  fileUrl: string | null
  fileSize: number
  downloadCount: number
  expiresAt: string | null
}

interface ReportData {
  revenue: {
    current: number
    previous: number
    change: number
    trend: 'up' | 'down'
  }
  users: {
    total: number
    new: number
    active: number
    retention: number
  }
  transactions: {
    total: number
    volume: number
    success: number
    failed: number
  }
  commissions: {
    total: number
    paid: number
    pending: number
    agents: number
  }
}

// 模拟数据
const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'tpl-1',
    name: '每日财务报表',
    category: 'FINANCIAL',
    type: 'DAILY',
    description: '包含当日收入、支出、净利润等财务核心指标',
    fields: ['revenue', 'expenses', 'profit', 'commission_paid', 'refunds'],
    isActive: true,
    lastGenerated: '2024-02-01T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tpl-2',
    name: '用户增长分析',
    category: 'USER',
    type: 'WEEKLY',
    description: '用户注册、活跃度、留存率等用户相关数据分析',
    fields: ['new_users', 'active_users', 'retention_rate', 'user_behavior'],
    isActive: true,
    lastGenerated: '2024-01-29T09:00:00Z',
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 'tpl-3',
    name: '交易总结报告',
    category: 'TRANSACTION',
    type: 'MONTHLY',
    description: '月度交易量、成功率、异常交易等综合统计',
    fields: ['transaction_volume', 'success_rate', 'failed_transactions', 'avg_amount'],
    isActive: true,
    lastGenerated: '2024-01-31T23:59:00Z',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'tpl-4',
    name: '代理商绩效报表',
    category: 'PERFORMANCE',
    type: 'MONTHLY',
    description: '代理商销售业绩、佣金统计、排名分析',
    fields: ['sales_volume', 'commission_earned', 'customer_count', 'performance_ranking'],
    isActive: true,
    lastGenerated: '2024-01-31T18:00:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'tpl-5',
    name: '合规审计报告',
    category: 'COMPLIANCE',
    type: 'QUARTERLY',
    description: 'KYC审核、风险控制、合规检查等审计数据',
    fields: ['kyc_approvals', 'risk_assessments', 'compliance_violations', 'audit_findings'],
    isActive: true,
    lastGenerated: '2024-01-31T16:30:00Z',
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'tpl-6',
    name: '系统性能监控',
    category: 'PERFORMANCE',
    type: 'DAILY',
    description: '系统响应时间、错误率、服务器状态等技术指标',
    fields: ['response_time', 'error_rate', 'uptime', 'resource_usage'],
    isActive: false,
    lastGenerated: null,
    createdAt: '2024-01-25T00:00:00Z'
  }
]

const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'report-1',
    templateId: 'tpl-1',
    templateName: '每日财务报表',
    title: '2024年2月1日财务日报',
    period: '2024-02-01',
    generatedAt: '2024-02-01T10:05:00Z',
    generatedBy: 'admin',
    status: 'COMPLETED',
    fileUrl: '/reports/daily-financial-20240201.pdf',
    fileSize: 1.2, // MB
    downloadCount: 15,
    expiresAt: '2024-03-01T23:59:59Z'
  },
  {
    id: 'report-2',
    templateId: 'tpl-2',
    templateName: '用户增长分析',
    title: '第4周用户增长分析报告',
    period: '2024-01-22 至 2024-01-28',
    generatedAt: '2024-01-29T09:15:00Z',
    generatedBy: 'admin',
    status: 'COMPLETED',
    fileUrl: '/reports/user-growth-week4-2024.xlsx',
    fileSize: 2.8,
    downloadCount: 23,
    expiresAt: '2024-02-28T23:59:59Z'
  },
  {
    id: 'report-3',
    templateId: 'tpl-3',
    templateName: '交易总结报告',
    title: '2024年1月交易总结报告',
    period: '2024-01-01 至 2024-01-31',
    generatedAt: '2024-01-31T23:59:30Z',
    generatedBy: 'finance_admin',
    status: 'COMPLETED',
    fileUrl: '/reports/transaction-summary-202401.pdf',
    fileSize: 3.5,
    downloadCount: 42,
    expiresAt: '2024-04-30T23:59:59Z'
  },
  {
    id: 'report-4',
    templateId: 'tpl-4',
    templateName: '代理商绩效报表',
    title: '2024年1月代理商绩效报表',
    period: '2024-01-01 至 2024-01-31',
    generatedAt: '2024-02-01T08:30:00Z',
    generatedBy: 'sales_admin',
    status: 'GENERATING',
    fileUrl: null,
    fileSize: 0,
    downloadCount: 0,
    expiresAt: '2024-04-30T23:59:59Z'
  }
]

const mockReportData: ReportData = {
  revenue: {
    current: 1250000,
    previous: 1180000,
    change: 5.9,
    trend: 'up'
  },
  users: {
    total: 15420,
    new: 234,
    active: 8765,
    retention: 78.5
  },
  transactions: {
    total: 2450,
    volume: 18750000,
    success: 2389,
    failed: 61
  },
  commissions: {
    total: 125000,
    paid: 106500,
    pending: 18500,
    agents: 18
  }
}

export default function ReportsCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'generated' | 'analytics' | 'schedule' | 'settings'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'FINANCIAL' | 'USER' | 'TRANSACTION' | 'PERFORMANCE' | 'COMPLIANCE'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'GENERATING' | 'COMPLETED' | 'FAILED'>('all')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredTemplates = mockReportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredReports = mockGeneratedReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.templateName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'GENERATING':
        return 'text-blue-600 bg-blue-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FINANCIAL':
        return 'text-green-600 bg-green-100'
      case 'USER':
        return 'text-blue-600 bg-blue-100'
      case 'TRANSACTION':
        return 'text-purple-600 bg-purple-100'
      case 'PERFORMANCE':
        return 'text-orange-600 bg-orange-100'
      case 'COMPLIANCE':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`
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
              <h1 className="text-3xl font-bold text-gray-900">报表中心</h1>
              <p className="text-gray-600 mt-2">
                数据分析、报表生成和业务洞察中心
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="quarter">本季度</option>
                <option value="year">本年</option>
              </select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                批量导出
              </Button>
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                生成报表
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
                { key: 'overview', label: '数据概览', icon: BarChart3 },
                { key: 'templates', label: '报表模板', icon: FileText },
                { key: 'generated', label: '已生成报表', icon: Download },
                { key: 'analytics', label: '数据分析', icon: PieChart },
                { key: 'schedule', label: '定时生成', icon: Clock },
                { key: 'settings', label: '报表设置', icon: Settings }
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

          {/* 数据概览标签页 */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* 核心指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总收入</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(mockReportData.revenue.current)}
                        </p>
                        <div className="flex items-center mt-2">
                          {mockReportData.revenue.trend === 'up' ? (
                            <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-red-600 mr-1" />
                          )}
                          <span className={`text-xs font-medium ${
                            mockReportData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {mockReportData.revenue.change}%
                          </span>
                          <span className="text-xs text-gray-500 ml-1">较上月</span>
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
                        <p className="text-sm font-medium text-gray-600">活跃用户</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {mockReportData.users.active.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-blue-600 font-medium">
                            新增 {mockReportData.users.new}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">本周</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">交易量</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {mockReportData.transactions.total.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-green-600 font-medium">
                            成功率 {((mockReportData.transactions.success / mockReportData.transactions.total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">佣金总额</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(mockReportData.commissions.total)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-orange-600 font-medium">
                            待支付 {formatCurrency(mockReportData.commissions.pending)}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 图表和快速操作 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      收入趋势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">收入趋势图表</p>
                        <p className="text-xs mt-1">数据可视化功能开发中...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>快速生成报表</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      今日财务报表
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      用户增长分析
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      交易统计报告
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      佣金结算报表
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* 报表模板标签页 */}
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
                      placeholder="搜索模板名称或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">所有分类</option>
                    <option value="FINANCIAL">财务</option>
                    <option value="USER">用户</option>
                    <option value="TRANSACTION">交易</option>
                    <option value="PERFORMANCE">绩效</option>
                    <option value="COMPLIANCE">合规</option>
                  </select>
                </div>

                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  新建模板
                </Button>
              </div>

              {/* 模板网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                            {template.category === 'FINANCIAL' ? '财务' :
                             template.category === 'USER' ? '用户' :
                             template.category === 'TRANSACTION' ? '交易' :
                             template.category === 'PERFORMANCE' ? '绩效' : '合规'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">生成频率:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.type === 'DAILY' ? 'bg-green-100 text-green-800' :
                            template.type === 'WEEKLY' ? 'bg-blue-100 text-blue-800' :
                            template.type === 'MONTHLY' ? 'bg-purple-100 text-purple-800' :
                            template.type === 'QUARTERLY' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {template.type === 'DAILY' ? '每日' :
                             template.type === 'WEEKLY' ? '每周' :
                             template.type === 'MONTHLY' ? '每月' :
                             template.type === 'QUARTERLY' ? '每季度' : '每年'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">状态:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.isActive ? '启用' : '禁用'}
                          </span>
                        </div>

                        {template.lastGenerated && (
                          <div className="text-xs text-gray-500">
                            最后生成: {formatDate(template.lastGenerated)}
                          </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            生成
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="w-3 h-3 mr-1" />
                            设置
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* 已生成报表标签页 */}
          {activeTab === 'generated' && (
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
                      placeholder="搜索报表标题..."
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
                    <option value="COMPLETED">已完成</option>
                    <option value="GENERATING">生成中</option>
                    <option value="FAILED">失败</option>
                  </select>
                </div>

                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      批量下载 ({selectedItems.length})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      发送邮件
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>
                  </div>
                )}
              </div>

              {/* 报表列表 */}
              <Card>
                <CardHeader>
                  <CardTitle>已生成报表 ({filteredReports.length})</CardTitle>
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
                                  setSelectedItems(filteredReports.map(r => r.id))
                                } else {
                                  setSelectedItems([])
                                }
                              }}
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">报表名称</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">时间范围</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">文件大小</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">下载次数</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">生成时间</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => (
                          <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={selectedItems.includes(report.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, report.id])
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== report.id))
                                  }
                                }}
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{report.title}</p>
                                <p className="text-sm text-gray-500">{report.templateName}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">{report.period}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                {report.status === 'COMPLETED' ? '已完成' :
                                 report.status === 'GENERATING' ? '生成中' : '失败'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">
                                {report.fileSize > 0 ? formatFileSize(report.fileSize) : '-'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">{report.downloadCount}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">{formatDate(report.generatedAt)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {report.status === 'COMPLETED' && (
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                {report.status === 'GENERATING' && (
                                  <Button variant="ghost" size="sm">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 其他标签页... */}
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
                  <p className="text-gray-600">高级数据分析和可视化功能正在开发中...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>定时生成</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">自动化报表生成调度功能正在开发中...</p>
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
                  <CardTitle>报表设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">报表系统配置和个性化设置功能正在开发中...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}