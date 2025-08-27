'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  AlertTriangle, 
  Eye, 
  Check, 
  X, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

// 类型定义
interface User {
  id: string
  email: string
  referralCode: string
  kycStatus: string
}

interface Withdrawal {
  id: string
  userId: string
  amount: number
  withdrawalType: 'EARNINGS' | 'PRINCIPAL' | 'COMMISSION'
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED'
  walletAddress: string
  chainId: number
  platformFee: number
  actualAmount: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  autoApproved: boolean
  createdAt: string
  requestedAt: string
  user: User
}

interface WithdrawalStats {
  total: number
  byStatus: {
    pending: number
    completed: number
    rejected: number
  }
  totalCompletedAmount: number
  riskLevelDistribution: Record<string, number>
  recent24h: number
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-gray-100 text-gray-800',
  CANCELED: 'bg-gray-100 text-gray-800',
}

const riskColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const typeLabels = {
  EARNINGS: '收益提现',
  PRINCIPAL: '本金提现',
  COMMISSION: '佣金提现',
}

export default function WithdrawalsManagementPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [stats, setStats] = useState<WithdrawalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: '',
    riskLevel: '',
    search: '',
    page: 1,
    limit: 20,
  })
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    withdrawal: Withdrawal | null
    action: 'approve' | 'reject' | 'review' | null
  }>({
    open: false,
    withdrawal: null,
    action: null,
  })
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // 模拟数据
  const mockWithdrawals: Withdrawal[] = [
    {
      id: 'wd_001',
      userId: 'user_001',
      amount: 5000,
      withdrawalType: 'EARNINGS',
      status: 'PENDING',
      walletAddress: '0x742d35Cc662C610E4612345E6A8a9E3DfFfF8c21',
      chainId: 1,
      platformFee: 25,
      actualAmount: 4975,
      riskScore: 15,
      riskLevel: 'LOW',
      autoApproved: false,
      createdAt: '2024-03-20T10:30:00Z',
      requestedAt: '2024-03-20T10:30:00Z',
      user: {
        id: 'user_001',
        email: 'user1@example.com',
        referralCode: 'REF001',
        kycStatus: 'APPROVED',
      },
    },
    {
      id: 'wd_002',
      userId: 'user_002',
      amount: 25000,
      withdrawalType: 'PRINCIPAL',
      status: 'REVIEWING',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c9c4dC4',
      chainId: 1,
      platformFee: 125,
      actualAmount: 24875,
      riskScore: 65,
      riskLevel: 'HIGH',
      autoApproved: false,
      createdAt: '2024-03-20T09:15:00Z',
      requestedAt: '2024-03-20T09:15:00Z',
      user: {
        id: 'user_002',
        email: 'user2@example.com',
        referralCode: 'REF002',
        kycStatus: 'APPROVED',
      },
    },
    {
      id: 'wd_003',
      userId: 'user_003',
      amount: 1200,
      withdrawalType: 'COMMISSION',
      status: 'APPROVED',
      walletAddress: '0x123456789abcdef123456789abcdef123456789a',
      chainId: 1,
      platformFee: 6,
      actualAmount: 1194,
      riskScore: 10,
      riskLevel: 'LOW',
      autoApproved: true,
      createdAt: '2024-03-20T08:00:00Z',
      requestedAt: '2024-03-20T08:00:00Z',
      user: {
        id: 'user_003',
        email: 'user3@example.com',
        referralCode: 'REF003',
        kycStatus: 'APPROVED',
      },
    },
  ]

  const mockStats: WithdrawalStats = {
    total: 156,
    byStatus: {
      pending: 12,
      completed: 128,
      rejected: 16,
    },
    totalCompletedAmount: 2456789.50,
    riskLevelDistribution: {
      low: 89,
      medium: 45,
      high: 18,
      critical: 4,
    },
    recent24h: 23,
  }

  useEffect(() => {
    loadWithdrawals()
    loadStats()
  }, [filters])

  const loadWithdrawals = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setWithdrawals(mockWithdrawals)
      setLoading(false)
    }, 500)
  }

  const loadStats = async () => {
    // 模拟API调用
    setTimeout(() => {
      setStats(mockStats)
    }, 300)
  }

  const handleReview = async (action: 'approve' | 'reject', withdrawal: Withdrawal) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('请填写拒绝原因')
      return
    }

    try {
      // 模拟API调用
      const updateData = {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewNotes,
        ...(action === 'reject' && { rejectionReason }),
      }

      console.log('Updating withdrawal:', withdrawal.id, updateData)
      
      // 更新本地状态
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawal.id 
          ? { ...w, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
          : w
      ))

      setReviewDialog({ open: false, withdrawal: null, action: null })
      setReviewNotes('')
      setRejectionReason('')
      
      alert(`提现申请已${action === 'approve' ? '批准' : '拒绝'}`)
    } catch (error) {
      console.error('Failed to update withdrawal:', error)
      alert('操作失败，请重试')
    }
  }

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedWithdrawals.length === 0) {
      alert('请选择要操作的提现申请')
      return
    }

    if (action === 'reject') {
      alert('批量拒绝需要分别处理每个申请')
      return
    }

    try {
      // 模拟批量操作API调用
      const updateData = {
        status: 'APPROVED',
        reviewNotes: '批量审批通过',
      }

      console.log('Batch updating withdrawals:', selectedWithdrawals, updateData)

      // 更新本地状态
      setWithdrawals(prev => prev.map(w => 
        selectedWithdrawals.includes(w.id)
          ? { ...w, status: 'APPROVED' }
          : w
      ))

      setSelectedWithdrawals([])
      alert(`已批准 ${selectedWithdrawals.length} 个提现申请`)
    } catch (error) {
      console.error('Failed to batch update withdrawals:', error)
      alert('批量操作失败，请重试')
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filters.status && withdrawal.status !== filters.status) return false
    if (filters.riskLevel && withdrawal.riskLevel !== filters.riskLevel) return false
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        withdrawal.user.email.toLowerCase().includes(searchTerm) ||
        withdrawal.walletAddress.toLowerCase().includes(searchTerm) ||
        withdrawal.id.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  return (
    <AdminGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面标题 */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">提现管理</h1>
              <p className="text-muted-foreground">
                管理和审核用户提现申请
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => loadWithdrawals()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    待处理申请
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.byStatus.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    需要人工审核
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    已完成提现
                  </CardTitle>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.byStatus.completed}</div>
                  <p className="text-xs text-muted-foreground">
                    成功处理数量
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    提现总额
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatAmount(stats.totalCompletedAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    累计完成金额
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    24小时申请
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recent24h}</div>
                  <p className="text-xs text-muted-foreground">
                    最近一天提交
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 筛选和搜索 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                筛选条件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="搜索邮箱、钱包地址或申请ID..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>状态</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部状态</SelectItem>
                      <SelectItem value="PENDING">待处理</SelectItem>
                      <SelectItem value="REVIEWING">审核中</SelectItem>
                      <SelectItem value="APPROVED">已批准</SelectItem>
                      <SelectItem value="REJECTED">已拒绝</SelectItem>
                      <SelectItem value="COMPLETED">已完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>风险等级</Label>
                  <Select
                    value={filters.riskLevel}
                    onValueChange={(value) => setFilters({ ...filters, riskLevel: value })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="全部风险" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部风险</SelectItem>
                      <SelectItem value="LOW">低风险</SelectItem>
                      <SelectItem value="MEDIUM">中风险</SelectItem>
                      <SelectItem value="HIGH">高风险</SelectItem>
                      <SelectItem value="CRITICAL">极高风险</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 批量操作 */}
          {selectedWithdrawals.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedWithdrawals.length} 个提现申请
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBatchAction('approve')}
                    >
                      批量批准
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedWithdrawals([])}
                    >
                      取消选择
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 提现申请列表 */}
          <Card>
            <CardHeader>
              <CardTitle>提现申请列表</CardTitle>
              <CardDescription>
                共 {filteredWithdrawals.length} 条记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedWithdrawals.includes(withdrawal.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedWithdrawals([...selectedWithdrawals, withdrawal.id])
                            } else {
                              setSelectedWithdrawals(selectedWithdrawals.filter(id => id !== withdrawal.id))
                            }
                          }}
                        />
                        <div>
                          <div className="font-medium">{withdrawal.user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {withdrawal.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColors[withdrawal.status]}>
                          {withdrawal.status}
                        </Badge>
                        <Badge className={riskColors[withdrawal.riskLevel]}>
                          {withdrawal.riskLevel}风险
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">提现类型</div>
                        <div>{typeLabels[withdrawal.withdrawalType]}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">申请金额</div>
                        <div className="font-medium">
                          {formatAmount(withdrawal.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">实际金额</div>
                        <div className="font-medium">
                          {formatAmount(withdrawal.actualAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">风险评分</div>
                        <div className="font-medium">
                          {withdrawal.riskScore}/100
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-muted-foreground">钱包地址</div>
                      <div className="font-mono break-all">
                        {withdrawal.walletAddress}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        申请时间: {formatDateTime(withdrawal.createdAt)}
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>提现申请详情</DialogTitle>
                              <DialogDescription>
                                申请ID: {withdrawal.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>用户信息</Label>
                                  <div className="space-y-1 text-sm">
                                    <div>邮箱: {withdrawal.user.email}</div>
                                    <div>推荐码: {withdrawal.user.referralCode}</div>
                                    <div>KYC状态: {withdrawal.user.kycStatus}</div>
                                  </div>
                                </div>
                                <div>
                                  <Label>提现信息</Label>
                                  <div className="space-y-1 text-sm">
                                    <div>类型: {typeLabels[withdrawal.withdrawalType]}</div>
                                    <div>申请金额: {formatAmount(withdrawal.amount)}</div>
                                    <div>手续费: {formatAmount(withdrawal.platformFee)}</div>
                                    <div>实际金额: {formatAmount(withdrawal.actualAmount)}</div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>风险评估</Label>
                                <div className="space-y-1 text-sm">
                                  <div>风险评分: {withdrawal.riskScore}/100</div>
                                  <div>风险等级: {withdrawal.riskLevel}</div>
                                  <div>自动批准: {withdrawal.autoApproved ? '是' : '否'}</div>
                                </div>
                              </div>
                              <div>
                                <Label>区块链信息</Label>
                                <div className="space-y-1 text-sm">
                                  <div>链ID: {withdrawal.chainId}</div>
                                  <div className="break-all">
                                    钱包地址: {withdrawal.walletAddress}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {(withdrawal.status === 'PENDING' || withdrawal.status === 'REVIEWING') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewDialog({
                                open: true,
                                withdrawal,
                                action: 'approve'
                              })}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              批准
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewDialog({
                                open: true,
                                withdrawal,
                                action: 'reject'
                              })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              拒绝
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredWithdrawals.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    没有找到符合条件的提现申请
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    加载中...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 审核对话框 */}
        <Dialog 
          open={reviewDialog.open} 
          onOpenChange={(open) => !open && setReviewDialog({ open: false, withdrawal: null, action: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approve' ? '批准提现申请' : '拒绝提现申请'}
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.withdrawal && (
                  <>
                    申请ID: {reviewDialog.withdrawal.id}<br />
                    金额: {formatAmount(reviewDialog.withdrawal.amount)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reviewNotes">审核备注</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="请输入审核备注..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
              {reviewDialog.action === 'reject' && (
                <div>
                  <Label htmlFor="rejectionReason">拒绝原因 *</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="请详细说明拒绝原因..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialog({ open: false, withdrawal: null, action: null })}
              >
                取消
              </Button>
              <Button
                onClick={() => reviewDialog.withdrawal && reviewDialog.action && 
                  handleReview(reviewDialog.action, reviewDialog.withdrawal)}
                variant={reviewDialog.action === 'approve' ? 'default' : 'destructive'}
              >
                {reviewDialog.action === 'approve' ? '确认批准' : '确认拒绝'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  )
}