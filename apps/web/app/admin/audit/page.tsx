'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  User,
  Activity,
  AlertTriangle,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'
import { TabContainer } from '../../../components/common/TabContainer'
import { AuditTable } from '../../../components/common/AuditTable'
import { FilterPanel } from '../../../components/common/FilterPanel'
import { MetricsCard } from '../../../components/common/MetricsCard'

interface AuditStats {
  totalLogs: number
  todayLogs: number
  abnormalLogs: number
  criticalAlerts: number
  systemEvents: number
  userActions: number
  securityEvents: number
}

interface AuditLog {
  id: string
  timestamp: string
  user?: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'warning'
  ip?: string
  userAgent?: string
  details?: any
  type?: 'system' | 'user' | 'admin' | 'security'
}

// 模拟数据
const mockStats: AuditStats = {
  totalLogs: 25847,
  todayLogs: 1243,
  abnormalLogs: 23,
  criticalAlerts: 3,
  systemEvents: 15623,
  userActions: 8934,
  securityEvents: 1290
}

const mockLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-03-15T10:30:00Z',
    user: 'admin@qa-app.com',
    action: '用户登录',
    resource: 'auth/login',
    result: 'success',
    ip: '192.168.1.100',
    type: 'user'
  },
  {
    id: '2',
    timestamp: '2024-03-15T10:25:00Z',
    action: '系统启动',
    resource: 'system/startup',
    result: 'success',
    type: 'system'
  },
  {
    id: '3',
    timestamp: '2024-03-15T10:20:00Z',
    user: 'user123@example.com',
    action: '密码重置尝试',
    resource: 'auth/reset-password',
    result: 'failure',
    ip: '203.0.113.42',
    type: 'security'
  }
]

export default function AdminAuditCenter() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<AuditStats>(mockStats)
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs)
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(mockLogs)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    type: 'all',
    result: 'all',
    dateRange: 'today'
  })

  const tabs = [
    {
      id: 'overview',
      label: '概览',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: 'system',
      label: '系统审计',
      icon: <Shield className="h-4 w-4" />,
      badge: stats.systemEvents.toString()
    },
    {
      id: 'user',
      label: '用户审计',
      icon: <User className="h-4 w-4" />,
      badge: stats.userActions.toString()
    },
    {
      id: 'security',
      label: '安全审计',
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: stats.securityEvents.toString()
    },
    {
      id: 'reports',
      label: '报告',
      icon: <FileText className="h-4 w-4" />
    }
  ]

  const auditFilters = [
    {
      id: 'type',
      label: '日志类型',
      type: 'select' as const,
      options: [
        { value: 'system', label: '系统日志', count: stats.systemEvents },
        { value: 'user', label: '用户日志', count: stats.userActions },
        { value: 'security', label: '安全日志', count: stats.securityEvents },
        { value: 'admin', label: '管理员日志', count: 156 }
      ]
    },
    {
      id: 'result',
      label: '执行结果',
      type: 'select' as const,
      options: [
        { value: 'success', label: '成功', count: 23456 },
        { value: 'failure', label: '失败', count: 234 },
        { value: 'warning', label: '警告', count: 157 }
      ]
    },
    {
      id: 'dateRange',
      label: '时间范围',
      type: 'daterange' as const
    }
  ]

  useEffect(() => {
    // 根据筛选条件过滤日志
    let filtered = logs

    if (filterValues.type && filterValues.type !== 'all') {
      filtered = filtered.filter(log => log.type === filterValues.type)
    }

    if (filterValues.result && filterValues.result !== 'all') {
      filtered = filtered.filter(log => log.result === filterValues.result)
    }

    setFilteredLogs(filtered)
  }, [logs, filterValues])

  const handleMarkAbnormal = (logIds: string[]) => {
    console.log('标记异常日志:', logIds)
    // 这里添加实际的API调用
  }

  const handleViewDetails = (log: AuditLog) => {
    console.log('查看日志详情:', log)
    // 这里打开详情模态框
  }

  const handleExport = () => {
    console.log('导出审计报告')
    // 这里添加导出功能
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="今日日志"
          value={stats.todayLogs}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          change={{ value: 12, type: 'increase', label: '比昨日' }}
        />
        <MetricsCard
          title="异常记录"
          value={stats.abnormalLogs}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          status={stats.abnormalLogs > 50 ? 'warning' : 'success'}
          change={{ value: -5, type: 'decrease', label: '比昨日' }}
        />
        <MetricsCard
          title="严重警报"
          value={stats.criticalAlerts}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          status={stats.criticalAlerts > 0 ? 'error' : 'success'}
        />
        <MetricsCard
          title="总记录数"
          value={stats.totalLogs}
          icon={<FileText className="h-5 w-5 text-gray-600" />}
          change={{ value: 8, type: 'increase', label: '本周' }}
        />
      </div>

      {/* 最近日志 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">最近审计日志</h3>
        <AuditTable
          logs={filteredLogs.slice(0, 10)}
          type="general"
          onViewDetails={handleViewDetails}
          onMarkAbnormal={handleMarkAbnormal}
        />
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'system':
        return (
          <AuditTable
            logs={filteredLogs.filter(log => log.type === 'system')}
            type="system"
            onViewDetails={handleViewDetails}
            onMarkAbnormal={handleMarkAbnormal}
          />
        )
      case 'user':
        return (
          <AuditTable
            logs={filteredLogs.filter(log => log.type === 'user')}
            type="user"
            onViewDetails={handleViewDetails}
            onMarkAbnormal={handleMarkAbnormal}
          />
        )
      case 'security':
        return (
          <AuditTable
            logs={filteredLogs.filter(log => log.type === 'security')}
            type="security"
            onViewDetails={handleViewDetails}
            onMarkAbnormal={handleMarkAbnormal}
          />
        )
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">审计报告生成</h3>
              <p className="text-gray-600 mb-4">生成和下载审计报告</p>
              <button 
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                生成完整报告
              </button>
            </div>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面头部 */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">审计中心</h1>
            <p className="text-gray-600">系统审计日志、用户活动记录和安全事件监控</p>
          </div>

          {/* 筛选器 */}
          <FilterPanel
            filters={auditFilters}
            values={filterValues}
            onChange={setFilterValues}
            searchPlaceholder="搜索日志内容、用户或IP地址..."
            onExport={handleExport}
          />

          {/* 标签页内容 */}
          <TabContainer
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {renderTabContent()}
          </TabContainer>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}