'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Share2,
  Mail,
  Printer,
  Archive,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../lib/auth-store'
import { reportApi } from '../../../lib/api-client'
import toast from 'react-hot-toast'

// 报表数据类型定义
interface UserReport {
  id: string
  type: 'INVESTMENT_SUMMARY' | 'EARNINGS_REPORT' | 'TAX_STATEMENT' | 'TRANSACTION_HISTORY' | 'PORTFOLIO_ANALYSIS' | 'COMMISSION_REPORT'
  title: string
  description: string
  period: string
  generatedAt: string
  status: 'AVAILABLE' | 'GENERATING' | 'EXPIRED'
  fileUrl?: string
  fileSize: number // MB
  downloadCount: number
  isStarred: boolean
  validUntil?: string
  summary?: {
    totalInvestment?: number
    totalEarnings?: number
    totalCommissions?: number
    transactions?: number
    roi?: number
  }
}

interface ReportStats {
  totalInvestment: number
  totalEarnings: number
  totalCommissions: number
  totalWithdrawals: number
  netProfit: number
  portfolioValue: number
  roi: number
  activePositions: number
}

interface ReportTemplate {
  id: string
  type: string
  name: string
  description: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  lastGenerated?: string
  isEnabled: boolean
}

// 模拟数据
const mockReports: UserReport[] = [
  {
    id: 'report-1',
    type: 'INVESTMENT_SUMMARY',
    title: '2024年1月投资总结报告',
    description: '包含本月所有投资活动、收益情况和投资组合分析',
    period: '2024年1月',
    generatedAt: '2024-02-01T10:00:00Z',
    status: 'AVAILABLE',
    fileUrl: '/api/reports/investment-summary-202401.pdf',
    fileSize: 2.8,
    downloadCount: 5,
    isStarred: true,
    validUntil: '2024-08-01T23:59:59Z',
    summary: {
      totalInvestment: 25000,
      totalEarnings: 2850,
      transactions: 8,
      roi: 11.4
    }
  },
  {
    id: 'report-2',
    type: 'EARNINGS_REPORT',
    title: '收益明细报告 - Q4 2023',
    description: '详细的收益来源分析，包括本金收益、推荐奖励等',
    period: '2023年第四季度',
    generatedAt: '2024-01-05T15:30:00Z',
    status: 'AVAILABLE',
    fileUrl: '/api/reports/earnings-q4-2023.xlsx',
    fileSize: 1.5,
    downloadCount: 12,
    isStarred: false,
    validUntil: '2024-07-05T23:59:59Z',
    summary: {
      totalEarnings: 8750,
      totalCommissions: 1200,
      transactions: 24
    }
  },
  {
    id: 'report-3',
    type: 'TAX_STATEMENT',
    title: '2023年度税务报表',
    description: '年度投资收益税务申报所需的完整文档',
    period: '2023年度',
    generatedAt: '2024-01-15T09:00:00Z',
    status: 'AVAILABLE',
    fileUrl: '/api/reports/tax-statement-2023.pdf',
    fileSize: 4.2,
    downloadCount: 3,
    isStarred: true,
    validUntil: '2029-01-15T23:59:59Z', // 税务文件保存5年
    summary: {
      totalInvestment: 120000,
      totalEarnings: 18650,
      roi: 15.54
    }
  },
  {
    id: 'report-4',
    type: 'PORTFOLIO_ANALYSIS',
    title: '投资组合分析报告',
    description: '投资组合风险评估、资产配置建议和绩效分析',
    period: '截至2024年1月31日',
    generatedAt: '2024-01-31T18:45:00Z',
    status: 'GENERATING',
    fileSize: 0,
    downloadCount: 0,
    isStarred: false,
    summary: {
      totalInvestment: 65000,
      totalEarnings: 7320,
      activePositions: 3,
      roi: 11.26
    }
  },
  {
    id: 'report-5',
    type: 'COMMISSION_REPORT',
    title: '推荐佣金报告 - 2024年1月',
    description: '推荐好友获得的佣金收入和奖励明细',
    period: '2024年1月',
    generatedAt: '2024-02-01T12:20:00Z',
    status: 'AVAILABLE',
    fileUrl: '/api/reports/commission-202401.pdf',
    fileSize: 0.8,
    downloadCount: 2,
    isStarred: false,
    validUntil: '2024-08-01T23:59:59Z',
    summary: {
      totalCommissions: 450,
      transactions: 6
    }
  }
]

const mockStats: ReportStats = {
  totalInvestment: 65000,
  totalEarnings: 9250,
  totalCommissions: 1650,
  totalWithdrawals: 2500,
  netProfit: 8400,
  portfolioValue: 73400,
  roi: 12.92,
  activePositions: 3
}

const mockTemplates: ReportTemplate[] = [
  {
    id: 'tpl-1',
    type: 'INVESTMENT_SUMMARY',
    name: '投资总结报告',
    description: '每月自动生成投资活动总结',
    frequency: 'MONTHLY',
    lastGenerated: '2024-02-01T10:00:00Z',
    isEnabled: true
  },
  {
    id: 'tpl-2',
    type: 'EARNINGS_REPORT',
    name: '收益明细报告',
    description: '季度收益详情和分析',
    frequency: 'QUARTERLY',
    lastGenerated: '2024-01-05T15:30:00Z',
    isEnabled: true
  },
  {
    id: 'tpl-3',
    type: 'TAX_STATEMENT',
    name: '税务报表',
    description: '年度税务申报文档',
    frequency: 'YEARLY',
    lastGenerated: '2024-01-15T09:00:00Z',
    isEnabled: true
  }
]

export default function UserReportsCenter() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState<UserReport[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics' | 'templates' | 'archive'>('reports')
  const [selectedType, setSelectedType] = useState<'all' | 'INVESTMENT_SUMMARY' | 'EARNINGS_REPORT' | 'TAX_STATEMENT' | 'TRANSACTION_HISTORY' | 'PORTFOLIO_ANALYSIS' | 'COMMISSION_REPORT'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载报表数据
  useEffect(() => {
    const loadReports = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 并行加载报表历史和统计数据
        const [reportsResponse, statsResponse] = await Promise.all([
          reportApi.getHistory({ page: 1, limit: 50 }),
          reportApi.getStats()
        ])

        // 设置报表数据
        if (reportsResponse.data) {
          setReports(reportsResponse.data.reports || [])
        }

        // 设置统计数据
        if (statsResponse.data) {
          setStats(statsResponse.data)
        } else {
          setStats(mockStats)
        }

      } catch (error: any) {
        console.error('Failed to load reports:', error)
        setError('加载报表数据失败，使用模拟数据')
        // 使用 fallback 数据
        setReports(mockReports)
        setStats(mockStats)
        toast.error('加载报表数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [user?.id])

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesDate = true
    if (dateRange !== 'all') {
      const reportDate = new Date(report.generatedAt)
      const now = new Date()
      const monthsAgo = dateRange === 'month' ? 1 : dateRange === 'quarter' ? 3 : 12
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate())
      matchesDate = reportDate >= cutoffDate
    }
    
    return matchesType && matchesSearch && matchesDate
  })

  const handleDownload = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return
    
    try {
      // 通过API下载报表
      const response = await reportApi.downloadReport(reportId)
      
      // 创建下载链接
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.title}.pdf` // 假设是PDF格式
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // 更新下载次数
      setReports(prev => 
        prev.map(r => 
          r.id === reportId 
            ? { ...r, downloadCount: r.downloadCount + 1 }
            : r
        )
      )
      
      toast.success('报表下载成功')
    } catch (error) {
      console.error('Failed to download report:', error)
      toast.error('下载失败')
    }
  }

  const handleToggleStar = (reportId: string) => {
    setReports(prev => 
      prev.map(r => 
        r.id === reportId 
          ? { ...r, isStarred: !r.isStarred }
          : r
      )
    )
  }

  const handleGenerateReport = async (type: string) => {
    try {
      const reportTypeMap: { [key: string]: string } = {
        'INVESTMENT_SUMMARY': 'investment-analysis',
        'EARNINGS_REPORT': 'revenue', 
        'TAX_STATEMENT': 'financial-overview',
        'TRANSACTION_HISTORY': 'financial-overview',
        'PORTFOLIO_ANALYSIS': 'investment-analysis',
        'COMMISSION_REPORT': 'commission'
      }
      
      const apiReportType = reportTypeMap[type] || 'financial-overview'
      
      // 生成报表参数
      const reportData = {
        period: 'monthly',
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30天前
        dateTo: new Date().toISOString().split('T')[0], // 今天
        format: 'pdf' as const
      }
      
      let response
      switch (apiReportType) {
        case 'investment-analysis':
          response = await reportApi.generateInvestmentAnalysis(reportData)
          break
        case 'revenue':
          response = await reportApi.generateRevenueReport(reportData)
          break
        case 'commission':
          response = await reportApi.generateCommissionReport(reportData)
          break
        default:
          response = await reportApi.generateFinancialOverview(reportData)
      }
      
      // 添加到报表列表（模拟新生成的报表）
      const newReport: UserReport = {
        id: `report-${Date.now()}`,
        type: type as any,
        title: getReportTitle(type),
        description: '系统自动生成',
        period: '最近30天',
        generatedAt: new Date().toISOString(),
        status: 'AVAILABLE',
        fileSize: 2.5,
        downloadCount: 0,
        isStarred: false,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      setReports(prev => [newReport, ...prev])
      toast.success('报表生成成功')
      
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error('生成报表失败')
    }
  }
  
  const getReportTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      'INVESTMENT_SUMMARY': '投资总结报告',
      'EARNINGS_REPORT': '收益分析报告', 
      'TAX_STATEMENT': '税务报告',
      'TRANSACTION_HISTORY': '交易历史报告',
      'PORTFOLIO_ANALYSIS': '投资组合分析',
      'COMMISSION_REPORT': '佣金报告'
    }
    return titles[type] || '财务报告'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT_SUMMARY': return BarChart3
      case 'EARNINGS_REPORT': return DollarSign
      case 'TAX_STATEMENT': return FileText
      case 'TRANSACTION_HISTORY': return Clock
      case 'PORTFOLIO_ANALYSIS': return PieChart
      case 'COMMISSION_REPORT': return Percent
      default: return FileText
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'INVESTMENT_SUMMARY': return '投资总结'
      case 'EARNINGS_REPORT': return '收益报告'
      case 'TAX_STATEMENT': return '税务报表'
      case 'TRANSACTION_HISTORY': return '交易历史'
      case 'PORTFOLIO_ANALYSIS': return '组合分析'
      case 'COMMISSION_REPORT': return '佣金报告'
      default: return '报表'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100'
      case 'GENERATING': return 'text-blue-600 bg-blue-100'
      case 'EXPIRED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isReportExpired = (report: UserReport) => {
    return report.validUntil && new Date(report.validUntil) < new Date()
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
                  <h1 className="text-3xl font-bold text-gray-900">我的报表</h1>
                  <p className="text-gray-600 mt-2">
                    查看和下载您的投资报告、财务报表和分析文档
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新报表
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    生成报表
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
                        <p className="text-sm font-medium text-gray-600">总投资</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats?.totalInvestment || 0)}
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600 font-medium">+8.5%</span>
                          <span className="text-xs text-gray-500 ml-1">本月</span>
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
                        <p className="text-sm font-medium text-gray-600">总收益</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats?.totalEarnings || 0)}
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600 font-medium">+12.3%</span>
                          <span className="text-xs text-gray-500 ml-1">本月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">投资回报率</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {(stats?.roi || 0).toFixed(1)}%
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600 font-medium">+0.8%</span>
                          <span className="text-xs text-gray-500 ml-1">本月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Percent className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">佣金收入</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(stats?.totalCommissions || 0)}
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600 font-medium">+25.4%</span>
                          <span className="text-xs text-gray-500 ml-1">本月</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Percent className="w-6 h-6 text-orange-600" />
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
                    { key: 'reports', label: '我的报表', icon: FileText },
                    { key: 'analytics', label: '数据分析', icon: BarChart3 },
                    { key: 'templates', label: '报表设置', icon: Calendar },
                    { key: 'archive', label: '历史归档', icon: Archive }
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

              {/* 报表列表 */}
              {activeTab === 'reports' && (
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
                          placeholder="搜索报表..."
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
                        <option value="INVESTMENT_SUMMARY">投资总结</option>
                        <option value="EARNINGS_REPORT">收益报告</option>
                        <option value="TAX_STATEMENT">税务报表</option>
                        <option value="COMMISSION_REPORT">佣金报告</option>
                        <option value="PORTFOLIO_ANALYSIS">组合分析</option>
                      </select>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">全部时间</option>
                        <option value="month">近一个月</option>
                        <option value="quarter">近三个月</option>
                        <option value="year">近一年</option>
                      </select>
                    </div>
                  </div>

                  {/* 报表网格 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => {
                      const TypeIcon = getTypeIcon(report.type)
                      const expired = isReportExpired(report)
                      
                      return (
                        <Card key={report.id} className={`overflow-hidden hover:shadow-lg transition-all ${expired ? 'opacity-75' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <TypeIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {getTypeName(report.type)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                      {report.status === 'AVAILABLE' ? '可下载' :
                                       report.status === 'GENERATING' ? '生成中' : '已过期'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStar(report.id)}
                                className={report.isStarred ? 'text-yellow-600' : 'text-gray-400'}
                              >
                                <Star className={`w-4 h-4 ${report.isStarred ? 'fill-current' : ''}`} />
                              </Button>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {report.title}
                            </h3>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {report.description}
                            </p>

                            {/* 报表摘要 */}
                            {report.summary && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {report.summary.totalInvestment && (
                                    <div>
                                      <span className="text-gray-600">投资:</span>
                                      <span className="font-semibold text-gray-900 ml-1">
                                        {formatCurrency(report.summary.totalInvestment)}
                                      </span>
                                    </div>
                                  )}
                                  {report.summary.totalEarnings && (
                                    <div>
                                      <span className="text-gray-600">收益:</span>
                                      <span className="font-semibold text-green-600 ml-1">
                                        {formatCurrency(report.summary.totalEarnings)}
                                      </span>
                                    </div>
                                  )}
                                  {report.summary.totalCommissions && (
                                    <div>
                                      <span className="text-gray-600">佣金:</span>
                                      <span className="font-semibold text-orange-600 ml-1">
                                        {formatCurrency(report.summary.totalCommissions)}
                                      </span>
                                    </div>
                                  )}
                                  {report.summary.roi && (
                                    <div>
                                      <span className="text-gray-600">回报率:</span>
                                      <span className="font-semibold text-blue-600 ml-1">
                                        {report.summary.roi.toFixed(1)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 text-xs text-gray-500 mb-4">
                              <div className="flex items-center justify-between">
                                <span>报告期间:</span>
                                <span className="font-medium">{report.period}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>生成时间:</span>
                                <span>{formatDate(report.generatedAt)}</span>
                              </div>
                              {report.fileSize > 0 && (
                                <div className="flex items-center justify-between">
                                  <span>文件大小:</span>
                                  <span>{formatFileSize(report.fileSize)}</span>
                                </div>
                              )}
                              {report.downloadCount > 0 && (
                                <div className="flex items-center justify-between">
                                  <span>下载次数:</span>
                                  <span>{report.downloadCount}</span>
                                </div>
                              )}
                              {expired && (
                                <div className="flex items-center space-x-1 text-red-500">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>报表已过期</span>
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              {report.status === 'AVAILABLE' && !expired && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleDownload(report.id)}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    下载
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              
                              {report.status === 'GENERATING' && (
                                <Button size="sm" className="flex-1" disabled>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  生成中...
                                </Button>
                              )}
                              
                              {(expired || report.status === 'EXPIRED') && (
                                <Button 
                                  size="sm" 
                                  className="flex-1" 
                                  variant="outline"
                                  onClick={() => handleGenerateReport(report.type)}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  重新生成
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {filteredReports.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报表</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm ? '没有找到匹配的报表' : '您还没有生成任何报表'}
                        </p>
                        <Button onClick={() => handleGenerateReport('INVESTMENT_SUMMARY')}>
                          <FileText className="w-4 h-4 mr-2" />
                          生成投资总结报告
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* 其他标签页 */}
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
                      <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">数据分析功能</h3>
                        <p className="text-gray-600">
                          深度投资分析、趋势预测和个性化建议功能正在开发中...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'templates' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>自动报表设置</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockTemplates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-600">{template.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>频率: {
                                  template.frequency === 'MONTHLY' ? '每月' :
                                  template.frequency === 'QUARTERLY' ? '每季度' : '每年'
                                }</span>
                                {template.lastGenerated && (
                                  <span>上次生成: {formatDate(template.lastGenerated)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  template.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                    template.isEnabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'archive' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>历史归档</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">历史报表归档</h3>
                        <p className="text-gray-600">
                          长期报表存储和归档管理功能正在开发中...
                        </p>
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