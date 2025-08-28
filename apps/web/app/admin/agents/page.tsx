'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  Crown,
  Shield,
  Search,
  Eye,
  Edit,
  Ban,
  Unlock,
  Mail,
  Phone,
  Award,
  Target,
  Percent,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge
} from '@/components/ui'
import { AdminActionButtons, BatchActionButtons } from '../../../components/admin/AdminActionButtons'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface Agent {
  id: string
  email: string
  referralCode: string
  role: 'USER' | 'AGENT' | 'ADMIN'
  isActive: boolean
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  agentId: string | null // 上级代理
  createdAt: string
  // 代理数据
  agentData: {
    level: number // 代理级别 1-5
    commissionRate: number // 佣金比例 (基点)
    totalUsers: number // 下属用户数
    totalOrders: number // 下属总订单数
    totalVolume: number // 下属总交易量
    totalCommission: number // 总佣金收入
    monthlyCommission: number // 本月佣金收入
    performance: {
      newUsersThisMonth: number
      ordersThisMonth: number
      volumeThisMonth: number
    }
    hierarchy: {
      directAgents: number // 直属代理数
      totalAgents: number // 总代理数
      maxDepth: number // 最大层级深度
    }
  }
  // 关联数据
  parentAgent?: {
    id: string
    email: string
    referralCode: string
  }
  agentUsers: Array<{
    id: string
    email: string
    referralCode: string
    totalOrders: number
    totalVolume: number
  }>
}

const mockAgents: Agent[] = [
  {
    id: 'agt-001',
    email: 'agent1@example.com',
    referralCode: 'AGT001',
    role: 'AGENT',
    isActive: true,
    kycStatus: 'APPROVED',
    agentId: null, // 顶级代理
    createdAt: '2024-01-01T00:00:00Z',
    agentData: {
      level: 1,
      commissionRate: 300, // 3%
      totalUsers: 45,
      totalOrders: 128,
      totalVolume: 1250000,
      totalCommission: 37500,
      monthlyCommission: 5200,
      performance: {
        newUsersThisMonth: 8,
        ordersThisMonth: 23,
        volumeThisMonth: 180000
      },
      hierarchy: {
        directAgents: 3,
        totalAgents: 8,
        maxDepth: 3
      }
    },
    agentUsers: [
      { id: 'usr-001', email: 'user1@example.com', referralCode: 'QA001', totalOrders: 5, totalVolume: 50000 },
      { id: 'usr-002', email: 'user2@example.com', referralCode: 'QA002', totalOrders: 3, totalVolume: 30000 }
    ]
  },
  {
    id: 'agt-002',
    email: 'agent2@example.com',
    referralCode: 'AGT002',
    role: 'AGENT',
    isActive: true,
    kycStatus: 'APPROVED',
    agentId: 'agt-001', // 下属代理
    createdAt: '2024-01-15T00:00:00Z',
    agentData: {
      level: 2,
      commissionRate: 250, // 2.5%
      totalUsers: 23,
      totalOrders: 67,
      totalVolume: 680000,
      totalCommission: 17000,
      monthlyCommission: 2800,
      performance: {
        newUsersThisMonth: 4,
        ordersThisMonth: 12,
        volumeThisMonth: 95000
      },
      hierarchy: {
        directAgents: 2,
        totalAgents: 3,
        maxDepth: 2
      }
    },
    parentAgent: {
      id: 'agt-001',
      email: 'agent1@example.com',
      referralCode: 'AGT001'
    },
    agentUsers: [
      { id: 'usr-003', email: 'user3@example.com', referralCode: 'QA003', totalOrders: 4, totalVolume: 40000 }
    ]
  },
  {
    id: 'agt-003',
    email: 'agent3@example.com',
    referralCode: 'AGT003',
    role: 'AGENT',
    isActive: false,
    kycStatus: 'PENDING',
    agentId: null,
    createdAt: '2024-02-01T00:00:00Z',
    agentData: {
      level: 1,
      commissionRate: 200, // 2%
      totalUsers: 5,
      totalOrders: 8,
      totalVolume: 85000,
      totalCommission: 1700,
      monthlyCommission: 340,
      performance: {
        newUsersThisMonth: 1,
        ordersThisMonth: 2,
        volumeThisMonth: 15000
      },
      hierarchy: {
        directAgents: 0,
        totalAgents: 0,
        maxDepth: 1
      }
    },
    agentUsers: []
  }
]

const mockStats = {
  totalAgents: 25,
  activeAgents: 18,
  pendingApprovals: 3,
  topPerformers: 5,
  totalCommissionPaid: 125000,
  monthlyCommission: 18500,
  totalUsersUnderAgents: 342,
  avgCommissionRate: 2.8
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(mockAgents)
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [performanceFilter, setPerformanceFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // 过滤逻辑
  useEffect(() => {
    let filtered = agents

    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.parentAgent?.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(agent => agent.isActive && agent.kycStatus === 'APPROVED')
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(agent => !agent.isActive)
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(agent => agent.kycStatus === 'PENDING')
      }
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(agent => agent.agentData.level.toString() === levelFilter)
    }

    if (performanceFilter !== 'all') {
      if (performanceFilter === 'high') {
        filtered = filtered.filter(agent => agent.agentData.monthlyCommission >= 3000)
      } else if (performanceFilter === 'medium') {
        filtered = filtered.filter(agent => 
          agent.agentData.monthlyCommission >= 1000 && agent.agentData.monthlyCommission < 3000
        )
      } else if (performanceFilter === 'low') {
        filtered = filtered.filter(agent => agent.agentData.monthlyCommission < 1000)
      }
    }

    setFilteredAgents(filtered)
  }, [agents, searchTerm, statusFilter, levelFilter, performanceFilter])

  const handleAgentAction = async (action: string, agentId: string, data?: any) => {
    setIsLoading(true)
    try {
      console.log('Agent action:', { action, agentId, data })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (action === 'approve') {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, kycStatus: 'APPROVED' as const, isActive: true }
            : agent
        ))
      } else if (action === 'ban') {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, isActive: false }
            : agent
        ))
      } else if (action === 'unban') {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, isActive: true }
            : agent
        ))
      }

      alert(`代理 ${action} 操作成功`)
    } catch (error) {
      console.error('Agent action failed:', error)
      alert('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchAction = async (action: string, agentIds: string[], data?: any) => {
    setIsLoading(true)
    try {
      console.log('Batch agent action:', { action, agentIds, data })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (action === 'batchApprove') {
        setAgents(prev => prev.map(agent => 
          agentIds.includes(agent.id) 
            ? { ...agent, kycStatus: 'APPROVED' as const, isActive: true }
            : agent
        ))
      } else if (action === 'batchBan') {
        setAgents(prev => prev.map(agent => 
          agentIds.includes(agent.id) 
            ? { ...agent, isActive: false }
            : agent
        ))
      }

      setSelectedAgents([])
      alert(`批量${action}操作成功`)
    } catch (error) {
      console.error('Batch action failed:', error)
      alert('批量操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const exportAgents = () => {
    const csv = [
      'ID,邮箱,推荐码,级别,状态,佣金率,下属用户,总交易量,总佣金',
      ...filteredAgents.map(agent => [
        agent.id,
        agent.email,
        agent.referralCode,
        agent.agentData.level,
        agent.isActive ? '活跃' : '停用',
        (agent.agentData.commissionRate / 100).toFixed(2) + '%',
        agent.agentData.totalUsers,
        agent.agentData.totalVolume,
        agent.agentData.totalCommission
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agents-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (agent: Agent) => {
    if (!agent.isActive) {
      return <Badge variant="destructive">已停用</Badge>
    } else if (agent.kycStatus === 'APPROVED') {
      return <Badge variant="default">活跃</Badge>
    } else if (agent.kycStatus === 'PENDING') {
      return <Badge variant="outline">待审核</Badge>
    } else {
      return <Badge variant="destructive">已拒绝</Badge>
    }
  }

  const getLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-purple-100 text-purple-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-green-100 text-green-700',
      4: 'bg-yellow-100 text-yellow-700',
      5: 'bg-red-100 text-red-700'
    }
    
    return (
      <Badge className={`${colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-700'}`}>
        L{level}级代理
      </Badge>
    )
  }

  const getPerformanceBadge = (commission: number) => {
    if (commission >= 3000) {
      return <Badge className="bg-green-100 text-green-700">高绩效</Badge>
    } else if (commission >= 1000) {
      return <Badge className="bg-yellow-100 text-yellow-700">中等绩效</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-700">低绩效</Badge>
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">代理管理</h1>
              <p className="text-muted-foreground mt-2">
                管理代理账户，监控绩效表现，设置佣金体系
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportAgents}>
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                添加代理
              </Button>
            </div>
          </motion.div>

          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">总代理数</p>
                    <p className="text-2xl font-bold">{mockStats.totalAgents}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">活跃 {mockStats.activeAgents} 个</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">待审核</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockStats.pendingApprovals}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">需要处理</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">总佣金支出</p>
                    <p className="text-2xl font-bold">${mockStats.totalCommissionPaid.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-muted-foreground">本月: ${mockStats.monthlyCommission.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">代理用户数</p>
                    <p className="text-2xl font-bold">{mockStats.totalUsersUnderAgents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Percent className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">平均佣金率 {mockStats.avgCommissionRate}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 批量操作栏 */}
          {selectedAgents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <BatchActionButtons
                type="user"
                selectedIds={selectedAgents}
                onBatchAction={handleBatchAction}
                disabled={isLoading}
              />
            </motion.div>
          )}

          {/* 搜索和过滤 */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索邮箱、推荐码、上级代理..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">全部状态</option>
                  <option value="active">活跃</option>
                  <option value="inactive">停用</option>
                  <option value="pending">待审核</option>
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">全部级别</option>
                  <option value="1">L1级代理</option>
                  <option value="2">L2级代理</option>
                  <option value="3">L3级代理</option>
                  <option value="4">L4级代理</option>
                  <option value="5">L5级代理</option>
                </select>

                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">全部绩效</option>
                  <option value="high">高绩效 (≥$3K)</option>
                  <option value="medium">中等绩效 ($1K-$3K)</option>
                  <option value="low">低绩效 (&lt;$1K)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 代理列表 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>代理列表 ({filteredAgents.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedAgents.length === filteredAgents.length) {
                        setSelectedAgents([])
                      } else {
                        setSelectedAgents(filteredAgents.map(a => a.id))
                      }
                    }}
                  >
                    {selectedAgents.length === filteredAgents.length ? '取消全选' : '全选'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={() => {
                          setSelectedAgents(prev => 
                            prev.includes(agent.id)
                              ? prev.filter(id => id !== agent.id)
                              : [...prev, agent.id]
                          )
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm font-medium text-gray-900">
                                {agent.referralCode}
                              </span>
                              {getStatusBadge(agent)}
                              {getLevelBadge(agent.agentData.level)}
                              {getPerformanceBadge(agent.agentData.monthlyCommission)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">基本信息</p>
                                <p className="font-medium text-sm">{agent.email}</p>
                                <p className="text-xs text-gray-500">
                                  佣金率: {(agent.agentData.commissionRate / 100).toFixed(1)}%
                                </p>
                                {agent.parentAgent && (
                                  <p className="text-xs text-gray-500">
                                    上级: {agent.parentAgent.referralCode}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">团队规模</p>
                                <p className="font-medium text-sm">{agent.agentData.totalUsers} 用户</p>
                                <p className="text-xs text-gray-500">
                                  {agent.agentData.hierarchy.directAgents} 直属代理
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">业绩数据</p>
                                <p className="font-medium text-sm">${agent.agentData.totalVolume.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  {agent.agentData.totalOrders} 订单
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">佣金收入</p>
                                <p className="font-medium text-sm">${agent.agentData.monthlyCommission.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  总计: ${agent.agentData.totalCommission.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>注册时间: {new Date(agent.createdAt).toLocaleDateString()}</span>
                                <span>本月新增用户: {agent.agentData.performance.newUsersThisMonth}</span>
                                <span>本月订单: {agent.agentData.performance.ordersThisMonth}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                alert(`代理详情: ${agent.referralCode}\n级别: L${agent.agentData.level}\n下属用户: ${agent.agentData.totalUsers}\n本月佣金: $${agent.agentData.monthlyCommission}`)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                alert(`代理绩效: ${agent.referralCode}\n本月交易量: $${agent.agentData.performance.volumeThisMonth.toLocaleString()}\n新增用户: ${agent.agentData.performance.newUsersThisMonth}\n订单数: ${agent.agentData.performance.ordersThisMonth}`)
                              }}
                            >
                              <BarChart3 className="w-4 h-4 mr-1" />
                              绩效
                            </Button>
                            <AdminActionButtons
                              type="user"
                              itemId={agent.id}
                              status={agent.isActive ? 'active' : 'banned'}
                              onAction={handleAgentAction}
                              disabled={isLoading}
                              compact={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}