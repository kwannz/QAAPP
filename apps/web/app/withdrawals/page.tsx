'use client'

import { useState, useEffect } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wallet, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Info,
  Eye,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'

// 类型定义
interface UserBalance {
  earnings: number
  principal: number
  commission: number
}

interface Withdrawal {
  id: string
  amount: number
  withdrawalType: 'EARNINGS' | 'PRINCIPAL' | 'COMMISSION'
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED'
  walletAddress: string
  chainId: number
  platformFee: number
  actualAmount: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  createdAt: string
  rejectionReason?: string
  txHash?: string
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

const statusLabels = {
  PENDING: '待处理',
  REVIEWING: '审核中',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  FAILED: '处理失败',
  CANCELED: '已取消',
}

const typeLabels = {
  EARNINGS: '收益提现',
  PRINCIPAL: '本金提现',
  COMMISSION: '佣金提现',
}

export default function WithdrawalsPage() {
  const [balance, setBalance] = useState<UserBalance>({ earnings: 0, principal: 0, commission: 0 })
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'EARNINGS' | 'PRINCIPAL' | 'COMMISSION'>('EARNINGS')
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [chainId, setChainId] = useState('1')
  const [estimatedFee, setEstimatedFee] = useState(0)
  const [copied, setCopied] = useState(false)

  // 模拟数据
  const mockBalance: UserBalance = {
    earnings: 5234.56,
    principal: 12000.00,
    commission: 890.25,
  }

  const mockWithdrawals: Withdrawal[] = [
    {
      id: 'wd_001',
      amount: 1000,
      withdrawalType: 'EARNINGS',
      status: 'COMPLETED',
      walletAddress: '0x742d35Cc662C610E4612345E6A8a9E3DfFfF8c21',
      chainId: 1,
      platformFee: 5,
      actualAmount: 995,
      riskLevel: 'LOW',
      createdAt: '2024-03-20T10:30:00Z',
      txHash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456',
    },
    {
      id: 'wd_002',
      amount: 5000,
      withdrawalType: 'EARNINGS',
      status: 'REVIEWING',
      walletAddress: '0x742d35Cc662C610E4612345E6A8a9E3DfFfF8c21',
      chainId: 1,
      platformFee: 25,
      actualAmount: 4975,
      riskLevel: 'MEDIUM',
      createdAt: '2024-03-19T14:20:00Z',
    },
    {
      id: 'wd_003',
      amount: 500,
      withdrawalType: 'COMMISSION',
      status: 'REJECTED',
      walletAddress: '0x742d35Cc662C610E4612345E6A8a9E3DfFfF8c21',
      chainId: 1,
      platformFee: 2.5,
      actualAmount: 497.5,
      riskLevel: 'LOW',
      createdAt: '2024-03-18T09:15:00Z',
      rejectionReason: '钱包地址验证失败，请重新检查并提交',
    },
  ]

  useEffect(() => {
    loadBalance()
    loadWithdrawals()
  }, [])

  useEffect(() => {
    // 计算预估手续费
    if (amount) {
      const amountNum = parseFloat(amount)
      if (!isNaN(amountNum)) {
        const feeRates = {
          EARNINGS: 0.005, // 0.5%
          PRINCIPAL: 0.001, // 0.1%
          COMMISSION: 0.003, // 0.3%
        }
        const calculatedFee = amountNum * feeRates[selectedType]
        const minFee = 1
        const maxFee = 100
        setEstimatedFee(Math.max(minFee, Math.min(maxFee, calculatedFee)))
      } else {
        setEstimatedFee(0)
      }
    } else {
      setEstimatedFee(0)
    }
  }, [amount, selectedType])

  const loadBalance = async () => {
    // 模拟API调用
    setTimeout(() => {
      setBalance(mockBalance)
    }, 300)
  }

  const loadWithdrawals = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setWithdrawals(mockWithdrawals)
      setLoading(false)
    }, 500)
  }

  const handleCreateWithdrawal = async () => {
    if (!amount || !walletAddress) {
      alert('请填写所有必填字段')
      return
    }

    const amountNum = parseFloat(amount)
    const availableBalance = balance[selectedType.toLowerCase() as keyof UserBalance]

    if (amountNum <= 0) {
      alert('提现金额必须大于0')
      return
    }

    if (amountNum > availableBalance) {
      alert('提现金额不能超过可用余额')
      return
    }

    try {
      // 模拟API调用
      const newWithdrawal: Withdrawal = {
        id: `wd_${Date.now()}`,
        amount: amountNum,
        withdrawalType: selectedType,
        status: 'PENDING',
        walletAddress,
        chainId: parseInt(chainId),
        platformFee: estimatedFee,
        actualAmount: amountNum - estimatedFee,
        riskLevel: 'LOW',
        createdAt: new Date().toISOString(),
      }

      setWithdrawals([newWithdrawal, ...withdrawals])
      setCreateDialogOpen(false)
      setAmount('')
      setWalletAddress('')
      
      alert('提现申请已提交，请等待审核')
    } catch (error) {
      console.error('Failed to create withdrawal:', error)
      alert('提现申请失败，请重试')
    }
  }

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    try {
      // 模拟API调用
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId ? { ...w, status: 'CANCELED' } : w
      ))
      alert('提现申请已取消')
    } catch (error) {
      console.error('Failed to cancel withdrawal:', error)
      alert('取消失败，请重试')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const getAvailableBalance = () => {
    return balance[selectedType.toLowerCase() as keyof UserBalance]
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">资金提现</h1>
            <p className="text-muted-foreground">
              管理您的资金提现申请
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            申请提现
          </Button>
        </div>

        {/* 余额卡片 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                可提收益
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(balance.earnings)}</div>
              <p className="text-xs text-muted-foreground">
                累计收益可提现金额
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                可提本金
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(balance.principal)}</div>
              <p className="text-xs text-muted-foreground">
                投资到期可提现本金
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                可提佣金
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(balance.commission)}</div>
              <p className="text-xs text-muted-foreground">
                推荐佣金可提现金额
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 提现记录 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>提现记录</CardTitle>
              <CardDescription>
                您的所有提现申请记录
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadWithdrawals}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {typeLabels[withdrawal.withdrawalType]} - {formatAmount(withdrawal.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        申请ID: {withdrawal.id}
                      </div>
                    </div>
                    <Badge className={statusColors[withdrawal.status]}>
                      {statusLabels[withdrawal.status]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">申请金额</div>
                      <div className="font-medium">
                        {formatAmount(withdrawal.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">手续费</div>
                      <div className="font-medium">
                        {formatAmount(withdrawal.platformFee)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">实际到账</div>
                      <div className="font-medium">
                        {formatAmount(withdrawal.actualAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-muted-foreground">钱包地址</div>
                    <div className="font-mono break-all flex items-center gap-2">
                      {withdrawal.walletAddress}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(withdrawal.walletAddress)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  {withdrawal.rejectionReason && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>拒绝原因:</strong> {withdrawal.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {withdrawal.txHash && (
                    <div className="text-sm">
                      <div className="text-muted-foreground">交易哈希</div>
                      <div className="font-mono break-all flex items-center gap-2">
                        {withdrawal.txHash}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/tx/${withdrawal.txHash}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      申请时间: {formatDateTime(withdrawal.createdAt)}
                    </div>
                    <div className="flex space-x-2">
                      {(withdrawal.status === 'PENDING' || withdrawal.status === 'REVIEWING') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelWithdrawal(withdrawal.id)}
                        >
                          取消申请
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {withdrawals.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  暂无提现记录
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

      {/* 创建提现申请对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申请提现</DialogTitle>
            <DialogDescription>
              请填写提现信息，我们将在审核通过后处理您的提现申请
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="withdrawalType">提现类型</Label>
              <Select
                value={selectedType}
                onValueChange={(value: 'EARNINGS' | 'PRINCIPAL' | 'COMMISSION') => setSelectedType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EARNINGS">收益提现</SelectItem>
                  <SelectItem value="PRINCIPAL">本金提现</SelectItem>
                  <SelectItem value="COMMISSION">佣金提现</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground mt-1">
                可用余额: {formatAmount(getAvailableBalance())}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">提现金额 *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="请输入提现金额"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="walletAddress">钱包地址 *</Label>
              <Input
                id="walletAddress"
                placeholder="请输入您的钱包地址"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="chainId">区块链网络</Label>
              <Select value={chainId} onValueChange={setChainId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">以太坊主网</SelectItem>
                  <SelectItem value="56">BNB Smart Chain</SelectItem>
                  <SelectItem value="137">Polygon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {estimatedFee > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>预估手续费: {formatAmount(estimatedFee)}</div>
                    <div>实际到账: {formatAmount(parseFloat(amount) - estimatedFee)}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateWithdrawal}>
              提交申请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}