'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  UserCheck,
  AlertTriangle,
  Key,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Lock
} from 'lucide-react'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'
import { TabContainer } from '../../../components/common/TabContainer'
import { FilterPanel } from '../../../components/common/FilterPanel'
import { MetricsCard } from '../../../components/common/MetricsCard'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface ComplianceStats {
  pendingKYC: number
  approvedKYC: number
  rejectedKYC: number
  highRiskUsers: number
  complianceRate: number
  averageReviewTime: number
}

// 模拟数据
const mockStats: ComplianceStats = {
  pendingKYC: 23,
  approvedKYC: 1847,
  rejectedKYC: 156,
  highRiskUsers: 45,
  complianceRate: 94.2,
  averageReviewTime: 2.5
}

export default function AdminComplianceCenter() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<ComplianceStats>(mockStats)

  const tabs = [
    {
      id: 'overview',
      label: '概览',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: 'kyc',
      label: 'KYC审核',
      icon: <UserCheck className="h-4 w-4" />,
      badge: stats.pendingKYC.toString()
    },
    {
      id: 'risk',
      label: '风险评估',
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: stats.highRiskUsers.toString()
    },
    {
      id: 'permissions',
      label: '权限管理',
      icon: <Key className="h-4 w-4" />
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="待审核KYC"
          value={stats.pendingKYC}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          status={stats.pendingKYC > 50 ? 'warning' : 'success'}
        />
        <MetricsCard
          title="合规率"
          value={`${stats.complianceRate}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          status={stats.complianceRate >= 95 ? 'success' : 'warning'}
          change={{ value: 2.1, type: 'increase', label: '本月' }}
        />
        <MetricsCard
          title="高风险用户"
          value={stats.highRiskUsers}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          status="error"
        />
        <MetricsCard
          title="平均审核时间"
          value={`${stats.averageReviewTime}天`}
          icon={<UserCheck className="h-5 w-5 text-blue-600" />}
          status={stats.averageReviewTime <= 3 ? 'success' : 'warning'}
        />
      </div>

      {/* 合规检查清单 */}
      <Card>
        <CardHeader>
          <CardTitle>合规检查清单</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { item: 'KYC审核流程', status: true, description: '所有用户完成身份验证' },
            { item: '风险评估系统', status: true, description: '自动化风险评估运行正常' },
            { item: '反洗钱监控', status: true, description: 'AML规则正常运行' },
            { item: '数据保护合规', status: false, description: 'GDPR合规性检查需要更新' }
          ].map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {check.status ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{check.item}</p>
                  <p className="text-sm text-gray-600">{check.description}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                check.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {check.status ? '合规' : '需要处理'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'kyc':
        return (
          <div className="text-center py-8">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">KYC审核队列</h3>
            <p className="text-gray-600">KYC申请审核功能</p>
          </div>
        )
      case 'risk':
        return (
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">风险评估</h3>
            <p className="text-gray-600">用户风险评估和监控功能</p>
          </div>
        )
      case 'permissions':
        return (
          <div className="text-center py-8">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">权限管理</h3>
            <p className="text-gray-600">用户权限和角色管理功能</p>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">合规中心</h1>
            <p className="text-gray-600">KYC审核、风险评估、权限管理和合规监控</p>
          </div>

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