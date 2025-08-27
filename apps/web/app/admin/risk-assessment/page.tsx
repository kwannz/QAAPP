'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Search,
  Filter,
  Download,
  Calendar,
  AlertTriangle,
  Eye,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Zap,
  Lock,
  Globe,
  User,
  Database,
  Settings,
  BarChart3,
  FileText,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface RiskItem {
  id: string
  title: string
  category: 'security' | 'financial' | 'operational' | 'compliance' | 'technical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  impact: number
  riskScore: number
  status: 'active' | 'mitigated' | 'under_review' | 'resolved'
  description: string
  detectedAt: string
  lastAssessment: string
  affectedSystems: string[]
  mitigationPlan?: string
  responsiblePerson: string
  dueDate?: string
}

interface RiskTrend {
  date: string
  totalRisks: number
  criticalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  riskScore: number
}

interface RiskScenario {
  id: string
  name: string
  description: string
  category: string
  simulationStatus: 'idle' | 'running' | 'completed' | 'failed'
  lastRun: string | null
  results: {
    impactScore: number
    responseTime: number
    systemsAffected: number
    recoveryTime: number
  } | null
}

// 模拟风险项目数据
const mockRiskItems: RiskItem[] = [
  {
    id: 'risk-001',
    title: 'API接口未授权访问漏洞',
    category: 'security',
    severity: 'critical',
    probability: 85,
    impact: 95,
    riskScore: 90,
    status: 'active',
    description: '发现多个API端点缺乏适当的身份验证和授权检查，可能导致敏感数据泄露',
    detectedAt: '2024-01-27T10:30:00Z',
    lastAssessment: '2024-01-27T14:00:00Z',
    affectedSystems: ['用户API', '交易API', '管理API'],
    mitigationPlan: '立即实施OAuth 2.0认证，加强API权限控制',
    responsiblePerson: '安全团队',
    dueDate: '2024-01-28T23:59:59Z'
  },
  {
    id: 'risk-002',
    title: '大额交易异常模式检测',
    category: 'financial',
    severity: 'high',
    probability: 70,
    impact: 85,
    riskScore: 78,
    status: 'under_review',
    description: '检测到多笔大额交易存在异常模式，可能涉及洗钱或欺诈行为',
    detectedAt: '2024-01-27T08:15:00Z',
    lastAssessment: '2024-01-27T13:30:00Z',
    affectedSystems: ['交易系统', '风控系统'],
    mitigationPlan: '加强交易监控规则，设置更严格的大额交易审核流程',
    responsiblePerson: '风控团队',
    dueDate: '2024-01-29T18:00:00Z'
  },
  {
    id: 'risk-003',
    title: '数据库性能下降',
    category: 'operational',
    severity: 'medium',
    probability: 60,
    impact: 70,
    riskScore: 65,
    status: 'mitigated',
    description: '主数据库响应时间持续增长，可能影响系统整体性能',
    detectedAt: '2024-01-26T16:45:00Z',
    lastAssessment: '2024-01-27T09:00:00Z',
    affectedSystems: ['数据库集群', 'API服务'],
    mitigationPlan: '已优化查询索引，增加数据库缓存',
    responsiblePerson: '运维团队'
  },
  {
    id: 'risk-004',
    title: 'KYC合规检查不完整',
    category: 'compliance',
    severity: 'high',
    probability: 75,
    impact: 80,
    riskScore: 78,
    status: 'active',
    description: '部分用户KYC资料审核流程不完整，存在合规风险',
    detectedAt: '2024-01-25T11:20:00Z',
    lastAssessment: '2024-01-27T12:00:00Z',
    affectedSystems: ['用户管理系统', 'KYC审核系统'],
    mitigationPlan: '完善KYC审核流程，加强合规检查',
    responsiblePerson: '合规团队',
    dueDate: '2024-02-01T17:00:00Z'
  },
  {
    id: 'risk-005',
    title: '第三方依赖安全漏洞',
    category: 'technical',
    severity: 'medium',
    probability: 50,
    impact: 60,
    riskScore: 55,
    status: 'resolved',
    description: '使用的第三方库存在已知安全漏洞',
    detectedAt: '2024-01-24T14:30:00Z',
    lastAssessment: '2024-01-26T10:15:00Z',
    affectedSystems: ['前端应用', '后端服务'],
    mitigationPlan: '已更新到最新版本，修复安全漏洞',
    responsiblePerson: '开发团队'
  }
]

// 模拟风险趋势数据
const mockRiskTrends: RiskTrend[] = [
  { date: '2024-01-21', totalRisks: 12, criticalRisks: 1, highRisks: 3, mediumRisks: 5, lowRisks: 3, riskScore: 65 },
  { date: '2024-01-22', totalRisks: 15, criticalRisks: 2, highRisks: 4, mediumRisks: 6, lowRisks: 3, riskScore: 72 },
  { date: '2024-01-23', totalRisks: 13, criticalRisks: 1, highRisks: 4, mediumRisks: 5, lowRisks: 3, riskScore: 68 },
  { date: '2024-01-24', totalRisks: 16, criticalRisks: 2, highRisks: 5, mediumRisks: 6, lowRisks: 3, riskScore: 75 },
  { date: '2024-01-25', totalRisks: 14, criticalRisks: 1, highRisks: 4, mediumRisks: 6, lowRisks: 3, riskScore: 70 },
  { date: '2024-01-26', totalRisks: 11, criticalRisks: 1, highRisks: 3, mediumRisks: 4, lowRisks: 3, riskScore: 62 },
  { date: '2024-01-27', totalRisks: 13, criticalRisks: 2, highRisks: 3, mediumRisks: 5, lowRisks: 3, riskScore: 68 }
]

// 模拟风险场景数据
const mockScenarios: RiskScenario[] = [
  {
    id: 'scenario-001',
    name: 'API服务中断场景',
    description: '模拟主要API服务完全中断的影响和恢复过程',
    category: '运营连续性',
    simulationStatus: 'completed',
    lastRun: '2024-01-26T15:30:00Z',
    results: {
      impactScore: 85,
      responseTime: 5,
      systemsAffected: 8,
      recoveryTime: 45
    }
  },
  {
    id: 'scenario-002',
    name: '数据泄露应急响应',
    description: '模拟大规模用户数据泄露事件的响应流程',
    category: '信息安全',
    simulationStatus: 'idle',
    lastRun: '2024-01-20T10:00:00Z',
    results: {
      impactScore: 95,
      responseTime: 12,
      systemsAffected: 15,
      recoveryTime: 120
    }
  },
  {
    id: 'scenario-003',
    name: '大额提现攻击',
    description: '模拟恶意用户尝试大额提现攻击的防护效果',
    category: '财务安全',
    simulationStatus: 'running',
    lastRun: '2024-01-27T14:00:00Z',
    results: null
  }
]

export default function RiskAssessmentPage() {
  const [riskItems, setRiskItems] = useState<RiskItem[]>(mockRiskItems)
  const [riskTrends] = useState<RiskTrend[]>(mockRiskTrends)
  const [scenarios, setScenarios] = useState<RiskScenario[]>(mockScenarios)
  const [activeTab, setActiveTab] = useState<'risks' | 'trends' | 'scenarios'>('risks')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
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

  // 获取严重程度样式
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 获取分类样式
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-red-100 text-red-800'
      case 'financial':
        return 'bg-green-100 text-green-800'
      case 'operational':
        return 'bg-blue-100 text-blue-800'
      case 'compliance':
        return 'bg-purple-100 text-purple-800'
      case 'technical':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'mitigated':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'idle':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'financial':
        return <Activity className="w-4 h-4" />
      case 'operational':
        return <Settings className="w-4 h-4" />
      case 'compliance':
        return <FileText className="w-4 h-4" />
      case 'technical':
        return <Database className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
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
    alert('导出风险报告功能开发中')
  }

  const handleRiskScan = () => {
    alert('风险扫描执行功能开发中')
  }

  const handleRiskAnalysis = () => {
    alert('风险趋势分析功能开发中')
  }

  const handleMitigationPlan = () => {
    alert('风险缓解计划功能开发中')
  }

  const handleRiskMonitoring = () => {
    alert('风险监控配置功能开发中')
  }

  const handleScenarioSimulation = (scenarioId: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, simulationStatus: 'running' } : s
    ))
    
    setTimeout(() => {
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId ? { 
          ...s, 
          simulationStatus: 'completed',
          lastRun: new Date().toISOString(),
          results: {
            impactScore: Math.floor(Math.random() * 40) + 60,
            responseTime: Math.floor(Math.random() * 10) + 3,
            systemsAffected: Math.floor(Math.random() * 10) + 5,
            recoveryTime: Math.floor(Math.random() * 60) + 30
          }
        } : s
      ))
    }, 3000)
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

  const criticalRisks = riskItems.filter(r => r.severity === 'critical').length
  const highRisks = riskItems.filter(r => r.severity === 'high').length
  const activeRisks = riskItems.filter(r => r.status === 'active').length
  const avgRiskScore = riskItems.reduce((sum, r) => sum + r.riskScore, 0) / riskItems.length || 0
  const latestTrend = riskTrends[riskTrends.length - 1]
  const previousTrend = riskTrends[riskTrends.length - 2]

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
                <Shield className="w-8 h-8 mr-3" />
                风险评估
              </h1>
              <p className="text-gray-600 mt-2">
                风险识别、评估和管理监控
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
                onClick={handleRiskScan}
              >
                <Target className="w-4 h-4 mr-2" />
                风险扫描
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRiskAnalysis}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                趋势分析
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportReport}
              >
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </motion.div>

          {/* 风险概览卡片 */}
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
                    <p className="text-sm text-gray-600">严重风险</p>
                    <p className="text-2xl font-bold text-red-600">
                      {criticalRisks}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">高风险</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {highRisks}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">活跃风险</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {activeRisks}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">风险评分</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(avgRiskScore)}
                      </p>
                      {latestTrend && previousTrend && (
                        latestTrend.riskScore > previousTrend.riskScore ? 
                        <TrendingUp className="w-4 h-4 text-red-600" /> :
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
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
              onClick={() => setActiveTab('risks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'risks'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              风险项目
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trends'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              趋势分析
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scenarios'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              场景模拟
            </button>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {activeTab === 'risks' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMitigationPlan}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  风险缓解计划
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRiskMonitoring}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  风险监控配置
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  风险预警设置
                </Button>
              </>
            )}
            {activeTab === 'trends' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  风险趋势分析
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  风险预测模型
                </Button>
              </>
            )}
            {activeTab === 'scenarios' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  风险场景模拟
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  风险应对演练
                </Button>
              </>
            )}
          </motion.div>

          {/* 搜索和筛选 */}
          {activeTab === 'risks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索风险项目标题、描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部分类</option>
                  <option value="security">安全</option>
                  <option value="financial">财务</option>
                  <option value="operational">运营</option>
                  <option value="compliance">合规</option>
                  <option value="technical">技术</option>
                </select>
                
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部严重程度</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">严重</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部状态</option>
                  <option value="active">活跃</option>
                  <option value="under_review">审核中</option>
                  <option value="mitigated">已缓解</option>
                  <option value="resolved">已解决</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  高级筛选
                </Button>
              </div>
            </motion.div>
          )}

          {/* 内容区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {activeTab === 'risks' && (
              <Card>
                <CardHeader>
                  <CardTitle>风险项目 ({riskItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskItems
                      .filter(risk => 
                        (searchQuery === '' || 
                         risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterCategory === 'all' || risk.category === filterCategory) &&
                        (filterSeverity === 'all' || risk.severity === filterSeverity) &&
                        (filterStatus === 'all' || risk.status === filterStatus)
                      )
                      .map((risk) => (
                        <div
                          key={risk.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyle(risk.category)}`}>
                              {getCategoryIcon(risk.category)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {risk.title}
                                </h3>
                                <Badge className={getCategoryStyle(risk.category)}>
                                  {risk.category === 'security' && '安全'}
                                  {risk.category === 'financial' && '财务'}
                                  {risk.category === 'operational' && '运营'}
                                  {risk.category === 'compliance' && '合规'}
                                  {risk.category === 'technical' && '技术'}
                                </Badge>
                                <Badge className={getSeverityStyle(risk.severity)}>
                                  {risk.severity === 'low' && '低'}
                                  {risk.severity === 'medium' && '中'}
                                  {risk.severity === 'high' && '高'}
                                  {risk.severity === 'critical' && '严重'}
                                </Badge>
                                <Badge className={getStatusStyle(risk.status)}>
                                  {risk.status === 'active' && '活跃'}
                                  {risk.status === 'under_review' && '审核中'}
                                  {risk.status === 'mitigated' && '已缓解'}
                                  {risk.status === 'resolved' && '已解决'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>风险评分: <span className="font-bold">{risk.riskScore}</span></span>
                                <span>概率: {risk.probability}%</span>
                                <span>影响: {risk.impact}%</span>
                                <span>负责人: {risk.responsiblePerson}</span>
                              </div>

                              <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                                {risk.description}
                              </p>

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>检测时间: {new Date(risk.detectedAt).toLocaleString('zh-CN')}</span>
                                {risk.dueDate && (
                                  <span className="ml-4">截止时间: {new Date(risk.dueDate).toLocaleString('zh-CN')}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(risk)}
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

            {activeTab === 'trends' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>风险趋势图表</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">风险趋势图表</p>
                        <p className="text-sm text-gray-500">显示过去7天的风险变化趋势</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>风险分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {latestTrend && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">严重风险</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${(latestTrend.criticalRisks / latestTrend.totalRisks) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold">{latestTrend.criticalRisks}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">高风险</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{ width: `${(latestTrend.highRisks / latestTrend.totalRisks) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold">{latestTrend.highRisks}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">中风险</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full"
                                  style={{ width: `${(latestTrend.mediumRisks / latestTrend.totalRisks) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold">{latestTrend.mediumRisks}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">低风险</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(latestTrend.lowRisks / latestTrend.totalRisks) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold">{latestTrend.lowRisks}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'scenarios' && (
              <Card>
                <CardHeader>
                  <CardTitle>风险场景模拟 ({scenarios.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {scenario.name}
                              </h3>
                              <Badge variant="outline">
                                {scenario.category}
                              </Badge>
                              <Badge className={getStatusStyle(scenario.simulationStatus)}>
                                {scenario.simulationStatus === 'idle' && '空闲'}
                                {scenario.simulationStatus === 'running' && '运行中'}
                                {scenario.simulationStatus === 'completed' && '已完成'}
                                {scenario.simulationStatus === 'failed' && '失败'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {scenario.description}
                            </p>

                            {scenario.results && (
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>影响评分: {scenario.results.impactScore}</span>
                                <span>响应时间: {scenario.results.responseTime}分钟</span>
                                <span>受影响系统: {scenario.results.systemsAffected}</span>
                                <span>恢复时间: {scenario.results.recoveryTime}分钟</span>
                              </div>
                            )}

                            {scenario.lastRun && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>最后运行: {new Date(scenario.lastRun).toLocaleString('zh-CN')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScenarioSimulation(scenario.id)}
                            disabled={scenario.simulationStatus === 'running'}
                          >
                            {scenario.simulationStatus === 'running' ? (
                              <Pause className="w-4 h-4 mr-1" />
                            ) : (
                              <Play className="w-4 h-4 mr-1" />
                            )}
                            {scenario.simulationStatus === 'running' ? '运行中' : '开始模拟'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(scenario)}
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
                      {activeTab === 'risks' ? '风险项目详情' : '场景模拟详情'}
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
                  {activeTab === 'risks' && selectedItem && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 block">风险标题:</span>
                              <span className="font-medium">{selectedItem.title}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">风险描述:</span>
                              <span className="font-medium">{selectedItem.description}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">风险分类:</span>
                              <Badge className={getCategoryStyle(selectedItem.category)}>
                                {selectedItem.category === 'security' && '安全'}
                                {selectedItem.category === 'financial' && '财务'}
                                {selectedItem.category === 'operational' && '运营'}
                                {selectedItem.category === 'compliance' && '合规'}
                                {selectedItem.category === 'technical' && '技术'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-600 block">严重程度:</span>
                              <Badge className={getSeverityStyle(selectedItem.severity)}>
                                {selectedItem.severity === 'low' && '低'}
                                {selectedItem.severity === 'medium' && '中'}
                                {selectedItem.severity === 'high' && '高'}
                                {selectedItem.severity === 'critical' && '严重'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-600 block">当前状态:</span>
                              <Badge className={getStatusStyle(selectedItem.status)}>
                                {selectedItem.status === 'active' && '活跃'}
                                {selectedItem.status === 'under_review' && '审核中'}
                                {selectedItem.status === 'mitigated' && '已缓解'}
                                {selectedItem.status === 'resolved' && '已解决'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">风险评估</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 block">发生概率:</span>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{ width: `${selectedItem.probability}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold">{selectedItem.probability}%</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 block">影响程度:</span>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{ width: `${selectedItem.impact}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold">{selectedItem.impact}%</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 block">风险评分:</span>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      selectedItem.riskScore >= 80 ? 'bg-red-500' :
                                      selectedItem.riskScore >= 60 ? 'bg-orange-500' :
                                      selectedItem.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${selectedItem.riskScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold">{selectedItem.riskScore}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 block">负责人:</span>
                              <span className="font-medium">{selectedItem.responsiblePerson}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">受影响系统</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.affectedSystems.map((system: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedItem.mitigationPlan && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">缓解计划</h3>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">{selectedItem.mitigationPlan}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold mb-4">时间线</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-24">检测时间:</span>
                            <span>{new Date(selectedItem.detectedAt).toLocaleString('zh-CN')}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-24">最后评估:</span>
                            <span>{new Date(selectedItem.lastAssessment).toLocaleString('zh-CN')}</span>
                          </div>
                          {selectedItem.dueDate && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 w-24">截止时间:</span>
                              <span>{new Date(selectedItem.dueDate).toLocaleString('zh-CN')}</span>
                            </div>
                          )}
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