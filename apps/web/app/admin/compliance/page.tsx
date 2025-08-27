'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileCheck,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Clock,
  Settings,
  BookOpen,
  Users,
  Award,
  Target,
  Activity,
  FileText,
  Play,
  Pause,
  BarChart3,
  Shield,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface ComplianceStandard {
  id: string
  name: string
  code: string
  version: string
  category: 'financial' | 'security' | 'privacy' | 'operational' | 'regulatory'
  description: string
  isActive: boolean
  lastUpdated: string
  requirements: number
  completedRequirements: number
  complianceScore: number
  nextAuditDate: string
  responsibleTeam: string
}

interface ComplianceCheck {
  id: string
  standardId: string
  standardName: string
  checkName: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending' | 'not_applicable'
  severity: 'low' | 'medium' | 'high' | 'critical'
  lastChecked: string
  nextCheckDue: string
  evidence?: string[]
  issues?: string[]
  remediation?: string
  assignee: string
}

interface ComplianceReport {
  id: string
  name: string
  type: 'periodic' | 'audit' | 'incident' | 'certification'
  generatedAt: string
  period: string
  status: 'draft' | 'under_review' | 'approved' | 'submitted'
  overallScore: number
  standardsCovered: number
  issuesFound: number
  recommendations: number
  submittedBy: string
  approvedBy?: string
}

interface ComplianceTraining {
  id: string
  title: string
  category: string
  description: string
  requiredFor: string[]
  completionRate: number
  totalParticipants: number
  completedParticipants: number
  lastUpdated: string
  isRequired: boolean
  expirationMonths?: number
}

// 模拟合规标准数据
const mockStandards: ComplianceStandard[] = [
  {
    id: 'std-001',
    name: 'ISO 27001 信息安全管理',
    code: 'ISO27001',
    version: '2013',
    category: 'security',
    description: '信息安全管理体系国际标准，确保信息安全的机密性、完整性和可用性',
    isActive: true,
    lastUpdated: '2024-01-15T10:00:00Z',
    requirements: 114,
    completedRequirements: 98,
    complianceScore: 86,
    nextAuditDate: '2024-03-15T00:00:00Z',
    responsibleTeam: '信息安全团队'
  },
  {
    id: 'std-002',
    name: 'GDPR 通用数据保护条例',
    code: 'GDPR',
    version: '2018',
    category: 'privacy',
    description: '欧盟通用数据保护条例，保护个人数据和隐私权',
    isActive: true,
    lastUpdated: '2024-01-20T14:30:00Z',
    requirements: 47,
    completedRequirements: 42,
    complianceScore: 89,
    nextAuditDate: '2024-04-20T00:00:00Z',
    responsibleTeam: '法务合规团队'
  },
  {
    id: 'std-003',
    name: 'SOX 萨班斯-奥克斯利法案',
    code: 'SOX',
    version: '2002',
    category: 'financial',
    description: '美国企业财务报告准确性和内部控制要求',
    isActive: true,
    lastUpdated: '2024-01-10T09:15:00Z',
    requirements: 32,
    completedRequirements: 28,
    complianceScore: 87,
    nextAuditDate: '2024-02-28T00:00:00Z',
    responsibleTeam: '财务审计团队'
  },
  {
    id: 'std-004',
    name: 'PCI DSS 支付卡行业标准',
    code: 'PCI-DSS',
    version: '4.0',
    category: 'financial',
    description: '支付卡行业数据安全标准，保护持卡人数据',
    isActive: true,
    lastUpdated: '2024-01-25T16:45:00Z',
    requirements: 78,
    completedRequirements: 65,
    complianceScore: 83,
    nextAuditDate: '2024-05-15T00:00:00Z',
    responsibleTeam: '支付安全团队'
  }
]

// 模拟合规检查数据
const mockChecks: ComplianceCheck[] = [
  {
    id: 'check-001',
    standardId: 'std-001',
    standardName: 'ISO 27001',
    checkName: '访问控制策略',
    requirement: 'A.9.1.1 - 建立访问控制策略',
    status: 'compliant',
    severity: 'high',
    lastChecked: '2024-01-26T10:30:00Z',
    nextCheckDue: '2024-02-26T10:30:00Z',
    evidence: ['访问控制策略文档', '权限审计报告'],
    assignee: '安全管理员'
  },
  {
    id: 'check-002',
    standardId: 'std-002',
    standardName: 'GDPR',
    checkName: '数据处理记录',
    requirement: 'Article 30 - 维护处理活动记录',
    status: 'partial',
    severity: 'medium',
    lastChecked: '2024-01-25T14:15:00Z',
    nextCheckDue: '2024-02-15T14:15:00Z',
    issues: ['部分数据处理活动缺乏记录'],
    remediation: '完善数据处理记录表，补充缺失信息',
    assignee: '数据保护专员'
  },
  {
    id: 'check-003',
    standardId: 'std-003',
    standardName: 'SOX',
    checkName: '财务内控测试',
    requirement: 'Section 404 - 内部控制有效性评估',
    status: 'non_compliant',
    severity: 'critical',
    lastChecked: '2024-01-24T11:00:00Z',
    nextCheckDue: '2024-01-31T11:00:00Z',
    issues: ['关键控制点测试失败', '内控文档过期'],
    remediation: '更新内控文档，重新执行控制点测试',
    assignee: '内控专员'
  }
]

// 模拟合规报告数据
const mockReports: ComplianceReport[] = [
  {
    id: 'report-001',
    name: '2024年Q1合规评估报告',
    type: 'periodic',
    generatedAt: '2024-01-27T09:00:00Z',
    period: '2024-Q1',
    status: 'under_review',
    overallScore: 85,
    standardsCovered: 4,
    issuesFound: 12,
    recommendations: 8,
    submittedBy: '合规经理'
  },
  {
    id: 'report-002',
    name: 'ISO 27001年度审计报告',
    type: 'audit',
    generatedAt: '2024-01-15T15:30:00Z',
    period: '2023年度',
    status: 'approved',
    overallScore: 88,
    standardsCovered: 1,
    issuesFound: 5,
    recommendations: 3,
    submittedBy: '安全经理',
    approvedBy: '合规总监'
  }
]

// 模拟合规培训数据
const mockTrainings: ComplianceTraining[] = [
  {
    id: 'training-001',
    title: '信息安全意识培训',
    category: '信息安全',
    description: '员工信息安全基础知识和最佳实践培训',
    requiredFor: ['全体员工'],
    completionRate: 87,
    totalParticipants: 150,
    completedParticipants: 131,
    lastUpdated: '2024-01-20T10:00:00Z',
    isRequired: true,
    expirationMonths: 12
  },
  {
    id: 'training-002',
    title: 'GDPR数据保护培训',
    category: '数据保护',
    description: '通用数据保护条例要求和数据处理规范培训',
    requiredFor: ['技术人员', '客服人员'],
    completionRate: 92,
    totalParticipants: 45,
    completedParticipants: 42,
    lastUpdated: '2024-01-18T14:30:00Z',
    isRequired: true,
    expirationMonths: 24
  },
  {
    id: 'training-003',
    title: '财务合规培训',
    category: '财务合规',
    description: 'SOX法案要求和财务内控流程培训',
    requiredFor: ['财务人员', '管理层'],
    completionRate: 95,
    totalParticipants: 20,
    completedParticipants: 19,
    lastUpdated: '2024-01-12T16:00:00Z',
    isRequired: true,
    expirationMonths: 12
  }
]

export default function CompliancePage() {
  const [standards, setStandards] = useState<ComplianceStandard[]>(mockStandards)
  const [checks, setChecks] = useState<ComplianceCheck[]>(mockChecks)
  const [reports, setReports] = useState<ComplianceReport[]>(mockReports)
  const [trainings, setTrainings] = useState<ComplianceTraining[]>(mockTrainings)
  const [activeTab, setActiveTab] = useState<'standards' | 'checks' | 'reports' | 'training'>('standards')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 获取分类样式
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-100 text-green-800'
      case 'security':
        return 'bg-red-100 text-red-800'
      case 'privacy':
        return 'bg-blue-100 text-blue-800'
      case 'operational':
        return 'bg-orange-100 text-orange-800'
      case 'regulatory':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800'
      case 'non_compliant':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'not_applicable':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取严重程度样式
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExportReport = () => {
    alert('导出合规报告功能开发中')
  }

  const handleComplianceCheck = () => {
    alert('合规检查执行功能开发中')
  }

  const handleGenerateReport = () => {
    alert('生成合规报告功能开发中')
  }

  const handleManageStandards = () => {
    alert('合规标准管理功能开发中')
  }

  const handleTrainingManagement = () => {
    alert('合规培训管理功能开发中')
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  const totalRequirements = standards.reduce((sum, s) => sum + s.requirements, 0)
  const completedRequirements = standards.reduce((sum, s) => sum + s.completedRequirements, 0)
  const avgComplianceScore = standards.reduce((sum, s) => sum + s.complianceScore, 0) / standards.length || 0
  const nonCompliantChecks = checks.filter(c => c.status === 'non_compliant').length
  const pendingChecks = checks.filter(c => c.status === 'pending').length
  const avgTrainingCompletion = trainings.reduce((sum, t) => sum + t.completionRate, 0) / trainings.length || 0

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileCheck className="w-8 h-8 mr-3" />
                合规管理
              </h1>
              <p className="text-gray-600 mt-2">
                合规标准管理、检查执行和培训监控
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleComplianceCheck}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                合规检查
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateReport}
              >
                <FileText className="w-4 h-4 mr-2" />
                生成报告
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportReport}
              >
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>
            </div>
          </motion.div>

          {/* 合规概览卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">合规评分</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(avgComplianceScore)}%
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">要求完成率</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round((completedRequirements / totalRequirements) * 100)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">不合规项目</p>
                    <p className="text-2xl font-bold text-red-600">
                      {nonCompliantChecks}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">培训完成率</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(avgTrainingCompletion)}%
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 标签切换 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex space-x-1 bg-gray-100 rounded-lg p-1"
          >
            <button
              onClick={() => setActiveTab('standards')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'standards'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              合规标准
            </button>
            <button
              onClick={() => setActiveTab('checks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'checks'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              合规检查
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              合规报告
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'training'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              合规培训
            </button>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {activeTab === 'standards' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManageStandards}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  合规标准管理
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  标准更新检查
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  合规趋势分析
                </Button>
              </>
            )}
            {activeTab === 'checks' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  批量合规检查
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  问题追踪管理
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  检查计划配置
                </Button>
              </>
            )}
            {activeTab === 'reports' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  自动报告生成
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  报告审批流程
                </Button>
              </>
            )}
            {activeTab === 'training' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTrainingManagement}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  培训管理
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  参与者管理
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Award className="w-4 h-4 mr-2" />
                  证书管理
                </Button>
              </>
            )}
          </motion.div>

          {/* 搜索和筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={
                  activeTab === 'standards' ? "搜索合规标准名称、代码..." :
                  activeTab === 'checks' ? "搜索检查项目、要求..." :
                  activeTab === 'reports' ? "搜索报告名称、类型..." :
                  "搜索培训标题、类别..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {(activeTab === 'standards' || activeTab === 'training') && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部分类</option>
                  {activeTab === 'standards' && (
                    <>
                      <option value="financial">财务</option>
                      <option value="security">安全</option>
                      <option value="privacy">隐私</option>
                      <option value="operational">运营</option>
                      <option value="regulatory">监管</option>
                    </>
                  )}
                  {activeTab === 'training' && (
                    <>
                      <option value="信息安全">信息安全</option>
                      <option value="数据保护">数据保护</option>
                      <option value="财务合规">财务合规</option>
                    </>
                  )}
                </select>
              )}

              {(activeTab === 'checks' || activeTab === 'reports') && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部状态</option>
                  {activeTab === 'checks' && (
                    <>
                      <option value="compliant">合规</option>
                      <option value="non_compliant">不合规</option>
                      <option value="partial">部分合规</option>
                      <option value="pending">待检查</option>
                    </>
                  )}
                  {activeTab === 'reports' && (
                    <>
                      <option value="draft">草稿</option>
                      <option value="under_review">审核中</option>
                      <option value="approved">已批准</option>
                      <option value="submitted">已提交</option>
                    </>
                  )}
                </select>
              )}
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* 内容区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {activeTab === 'standards' && (
              <Card>
                <CardHeader>
                  <CardTitle>合规标准 ({standards.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {standards
                      .filter(standard => 
                        (searchQuery === '' || 
                         standard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         standard.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterCategory === 'all' || standard.category === filterCategory)
                      )
                      .map((standard) => (
                        <div
                          key={standard.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyle(standard.category)}`}>
                              <Shield className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {standard.name}
                                </h3>
                                <Badge className={getCategoryStyle(standard.category)}>
                                  {standard.category === 'financial' && '财务'}
                                  {standard.category === 'security' && '安全'}
                                  {standard.category === 'privacy' && '隐私'}
                                  {standard.category === 'operational' && '运营'}
                                  {standard.category === 'regulatory' && '监管'}
                                </Badge>
                                <Badge variant={standard.isActive ? 'default' : 'secondary'}>
                                  {standard.isActive ? '活跃' : '停用'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>代码: {standard.code}</span>
                                <span>版本: {standard.version}</span>
                                <span>合规评分: <span className="font-bold">{standard.complianceScore}%</span></span>
                                <span>完成: {standard.completedRequirements}/{standard.requirements}</span>
                              </div>

                              <p className="text-sm text-gray-500 mb-1 line-clamp-1">
                                {standard.description}
                              </p>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>负责团队: {standard.responsibleTeam}</span>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>下次审计: {new Date(standard.nextAuditDate).toLocaleDateString('zh-CN')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(standard)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'checks' && (
              <Card>
                <CardHeader>
                  <CardTitle>合规检查 ({checks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checks
                      .filter(check => 
                        (searchQuery === '' || 
                         check.checkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         check.requirement.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterStatus === 'all' || check.status === filterStatus)
                      )
                      .map((check) => (
                        <div
                          key={check.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusStyle(check.status)}`}>
                              {check.status === 'compliant' ? <CheckCircle className="w-5 h-5" /> :
                               check.status === 'non_compliant' ? <XCircle className="w-5 h-5" /> :
                               <AlertTriangle className="w-5 h-5" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {check.checkName}
                                </h3>
                                <Badge variant="outline">
                                  {check.standardName}
                                </Badge>
                                <Badge className={getStatusStyle(check.status)}>
                                  {check.status === 'compliant' && '合规'}
                                  {check.status === 'non_compliant' && '不合规'}
                                  {check.status === 'partial' && '部分合规'}
                                  {check.status === 'pending' && '待检查'}
                                  {check.status === 'not_applicable' && '不适用'}
                                </Badge>
                                <Badge className={getSeverityStyle(check.severity)}>
                                  {check.severity === 'low' && '低'}
                                  {check.severity === 'medium' && '中'}
                                  {check.severity === 'high' && '高'}
                                  {check.severity === 'critical' && '严重'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>要求: {check.requirement}</span>
                                <span>负责人: {check.assignee}</span>
                              </div>

                              {check.issues && check.issues.length > 0 && (
                                <div className="text-sm text-red-600 mb-1">
                                  问题: {check.issues.join(', ')}
                                </div>
                              )}

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>最后检查: {new Date(check.lastChecked).toLocaleString('zh-CN')}</span>
                                <span className="ml-4">下次检查: {new Date(check.nextCheckDue).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(check)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'reports' && (
              <Card>
                <CardHeader>
                  <CardTitle>合规报告 ({reports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports
                      .filter(report => 
                        (searchQuery === '' || 
                         report.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterStatus === 'all' || report.status === filterStatus)
                      )
                      .map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {report.name}
                                </h3>
                                <Badge variant="outline">
                                  {report.type === 'periodic' && '定期'}
                                  {report.type === 'audit' && '审计'}
                                  {report.type === 'incident' && '事件'}
                                  {report.type === 'certification' && '认证'}
                                </Badge>
                                <Badge className={getStatusStyle(report.status)}>
                                  {report.status === 'draft' && '草稿'}
                                  {report.status === 'under_review' && '审核中'}
                                  {report.status === 'approved' && '已批准'}
                                  {report.status === 'submitted' && '已提交'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>期间: {report.period}</span>
                                <span>评分: <span className="font-bold">{report.overallScore}%</span></span>
                                <span>覆盖标准: {report.standardsCovered}</span>
                                <span>问题: {report.issuesFound}</span>
                                <span>建议: {report.recommendations}</span>
                              </div>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>提交人: {report.submittedBy}</span>
                                {report.approvedBy && (
                                  <span>批准人: {report.approvedBy}</span>
                                )}
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>生成时间: {new Date(report.generatedAt).toLocaleString('zh-CN')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(report)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'training' && (
              <Card>
                <CardHeader>
                  <CardTitle>合规培训 ({trainings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainings
                      .filter(training => 
                        (searchQuery === '' || 
                         training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterCategory === 'all' || training.category === filterCategory)
                      )
                      .map((training) => (
                        <div
                          key={training.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {training.title}
                                </h3>
                                <Badge variant="outline">
                                  {training.category}
                                </Badge>
                                {training.isRequired && (
                                  <Badge variant="default">必修</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                {training.description}
                              </p>

                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>完成率: <span className="font-bold">{training.completionRate}%</span></span>
                                <span>完成人数: {training.completedParticipants}/{training.totalParticipants}</span>
                                <span>适用于: {training.requiredFor.join(', ')}</span>
                              </div>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {training.expirationMonths && (
                                  <span>有效期: {training.expirationMonths}个月</span>
                                )}
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>更新时间: {new Date(training.lastUpdated).toLocaleString('zh-CN')}</span>
                                </div>
                              </div>

                              {/* 进度条 */}
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      training.completionRate >= 90 ? 'bg-green-500' :
                                      training.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${training.completionRate}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(training)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* 详情弹窗 */}
          {showDetailModal && selectedItem && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {activeTab === 'standards' ? '合规标准详情' :
                       activeTab === 'checks' ? '合规检查详情' :
                       activeTab === 'reports' ? '合规报告详情' : '培训详情'}
                    </h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {/* 这里可以根据不同的activeTab显示不同的详情内容 */}
                  {activeTab === 'standards' && selectedItem && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-600 block">标准名称:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">标准代码:</span>
                        <span className="font-mono text-sm">{selectedItem.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">版本:</span>
                        <span className="font-medium">{selectedItem.version}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">描述:</span>
                        <span className="font-medium">{selectedItem.description}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">合规评分:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedItem.complianceScore >= 90 ? 'bg-green-500' :
                                selectedItem.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedItem.complianceScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{selectedItem.complianceScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}