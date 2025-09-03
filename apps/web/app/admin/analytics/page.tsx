'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  FileText, 
  Bell, 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Award,
  Send,
  Eye,
  Settings,
  Download,
  Filter,
  Activity,
  Shield,
  UserCheck,
  AlertTriangle,
  Key,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { TabContainer } from '../../../components/common/TabContainer'
import { MetricsCard } from '../../../components/common/MetricsCard'
import { FilterPanel } from '../../../components/common/FilterPanel'
import { useFeatureFlag } from '../../../lib/feature-flags'
import { motion } from 'framer-motion'

interface AnalyticsData {
  commissions: {
    total: number
    pending: number
    completed: number
    totalAmount: number
    rules: number
  }
  reports: {
    total: number
    scheduled: number
    generated: number
    templates: number
    downloads: number
  }
  notifications: {
    total: number
    sent: number
    pending: number
    templates: number
    campaigns: number
  }
  audit: {
    totalLogs: number
    todayLogs: number
    abnormalLogs: number
    criticalAlerts: number
    systemEvents: number
    userActions: number
    securityEvents: number
  }
  compliance: {
    pendingKYC: number
    approvedKYC: number
    rejectedKYC: number
    highRiskUsers: number
    complianceRate: number
    averageReviewTime: number
  }
}



export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取分析数据
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/monitoring/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('获取分析数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { 
      id: 'overview', 
      label: '总览', 
      icon: <BarChart3 className="w-4 h-4" />, 
      badge: null 
    },
    { 
      id: 'commissions', 
      label: '佣金分析', 
      icon: <DollarSign className="w-4 h-4" />, 
      badge: analyticsData?.commissions?.pending || 0 
    },
    { 
      id: 'reports', 
      label: '报告中心', 
      icon: <FileText className="w-4 h-4" />, 
      badge: analyticsData?.reports?.scheduled || 0 
    },
    { 
      id: 'notifications', 
      label: '通知管理', 
      icon: <Bell className="w-4 h-4" />, 
      badge: analyticsData?.notifications?.pending || 0 
    },
    { 
      id: 'audit', 
      label: '审计中心', 
      icon: <Shield className="w-4 h-4" />, 
      badge: analyticsData?.audit?.criticalAlerts || 0 
    },
    { 
      id: 'compliance', 
      label: '合规中心', 
      icon: <UserCheck className="w-4 h-4" />, 
      badge: analyticsData?.compliance?.pendingKYC || 0 
    }
  ]

  const filterConfig = {
    dateRange: { label: '时间范围', type: 'daterange' as const },
    status: { 
      label: '状态', 
      type: 'select' as const, 
      options: [
        { label: '全部', value: 'all' },
        { label: '活跃', value: 'active' },
        { label: '待处理', value: 'pending' },
        { label: '已完成', value: 'completed' }
      ] 
    },
    category: { 
      label: '类别', 
      type: 'select' as const,
      options: [
        { label: '全部类别', value: 'all' },
        { label: '佣金', value: 'commission' },
        { label: '报告', value: 'report' },
        { label: '通知', value: 'notification' }
      ]
    }
  }

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="总佣金收入"
          value={analyticsData ? `¥${analyticsData.commissions.totalAmount.toLocaleString()}` : '¥0'}
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricsCard
          title="报告生成数"
          value={analyticsData?.reports?.generated?.toString() || '0'}
          change="+8.3%"
          trend="up"
          icon={<FileText className="w-4 h-4" />}
        />
        <MetricsCard
          title="通知发送数"
          value={analyticsData?.notifications?.sent?.toString() || '0'}
          change="+15.2%"
          trend="up"
          icon={<Bell className="w-4 h-4" />}
        />
        <MetricsCard
          title="活跃用户数"
          value="2,847"
          change="+5.7%"
          trend="up"
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">佣金趋势</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            佣金趋势图表 - 等待图表库集成
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">系统活动</h3>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              详细日志
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">佣金规则更新</span>
              <Badge variant="secondary">2小时前</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">月度报告生成</span>
              <Badge variant="secondary">4小时前</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">通知模板更新</span>
              <Badge variant="secondary">1天前</Badge>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )

  const renderCommissions = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard
          title="待处理佣金"
          value={analyticsData?.commissions?.pending?.toString() || '0'}
          change="-2.1%"
          trend="down"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricsCard
          title="已完成佣金"
          value={analyticsData?.commissions?.completed?.toString() || '0'}
          change="+12.5%"
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricsCard
          title="佣金规则数"
          value={analyticsData?.commissions?.rules?.toString() || '0'}
          change="+2"
          trend="up"
          icon={<FileText className="w-4 h-4" />}
        />
      </div>
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          佣金详细分析功能 - 整合自原有佣金页面功能
        </div>
      </Card>
    </motion.div>
  )

  const renderReports = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard
          title="计划报告"
          value={analyticsData?.reports?.scheduled?.toString() || '0'}
          change="+1"
          trend="up"
          icon={<Calendar className="w-4 h-4" />}
        />
        <MetricsCard
          title="已生成报告"
          value={analyticsData?.reports?.generated?.toString() || '0'}
          change="+45"
          trend="up"
          icon={<FileText className="w-4 h-4" />}
        />
        <MetricsCard
          title="下载次数"
          value={analyticsData?.reports?.downloads?.toString() || '0'}
          change="+23.4%"
          trend="up"
          icon={<Download className="w-4 h-4" />}
        />
      </div>
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          报告生成与管理功能 - 整合自原有报告页面功能
        </div>
      </Card>
    </motion.div>
  )

  const renderNotifications = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard
          title="待发送通知"
          value={analyticsData?.notifications?.pending?.toString() || '0'}
          change="+12"
          trend="up"
          icon={<Bell className="w-4 h-4" />}
        />
        <MetricsCard
          title="已发送通知"
          value={analyticsData?.notifications?.sent?.toString() || '0'}
          change="+234"
          trend="up"
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricsCard
          title="活跃推广"
          value={analyticsData?.notifications?.campaigns?.toString() || '0'}
          change="+1"
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          通知管理与推广功能 - 整合自原有通知页面功能
        </div>
      </Card>
    </motion.div>
  )

  const renderAudit = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="今日日志"
          value={analyticsData?.audit?.todayLogs || 0}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          change={{ value: 12, type: 'increase', label: '比昨日' }}
        />
        <MetricsCard
          title="异常记录"
          value={analyticsData?.audit?.abnormalLogs || 0}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          status={(analyticsData?.audit?.abnormalLogs || 0) > 50 ? 'warning' : 'success'}
        />
        <MetricsCard
          title="严重警报"
          value={analyticsData?.audit?.criticalAlerts || 0}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          status={(analyticsData?.audit?.criticalAlerts || 0) > 0 ? 'error' : 'success'}
        />
        <MetricsCard
          title="总记录数"
          value={analyticsData?.audit?.totalLogs || 0}
          icon={<FileText className="h-5 w-5 text-gray-600" />}
        />
      </div>
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          审计日志管理与监控功能 - 整合自原有审计页面功能
        </div>
      </Card>
    </motion.div>
  )

  const renderCompliance = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="待审核KYC"
          value={analyticsData?.compliance?.pendingKYC || 0}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          status={(analyticsData?.compliance?.pendingKYC || 0) > 50 ? 'warning' : 'success'}
        />
        <MetricsCard
          title="合规率"
          value={`${analyticsData?.compliance?.complianceRate || 0}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          status={(analyticsData?.compliance?.complianceRate || 0) >= 95 ? 'success' : 'warning'}
        />
        <MetricsCard
          title="高风险用户"
          value={analyticsData?.compliance?.highRiskUsers || 0}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          status="error"
        />
        <MetricsCard
          title="平均审核时间"
          value={`${analyticsData?.compliance?.averageReviewTime || 0}天`}
          icon={<UserCheck className="h-5 w-5 text-blue-600" />}
          status={(analyticsData?.compliance?.averageReviewTime || 0) <= 3 ? 'success' : 'warning'}
        />
      </div>
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          KYC审核与合规监控功能 - 整合自原有合规页面功能
        </div>
      </Card>
    </motion.div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'commissions':
        return renderCommissions()
      case 'reports':
        return renderReports()
      case 'notifications':
        return renderNotifications()
      case 'audit':
        return renderAudit()
      case 'compliance':
        return renderCompliance()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">分析中心</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            过滤器
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <FilterPanel config={filterConfig} />
      
      <TabContainer 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Separator />

      {renderTabContent()}
    </div>
  )
}