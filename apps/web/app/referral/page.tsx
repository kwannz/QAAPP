'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Input, 
  Label, 
  Badge, 
  Alert, 
  AlertDescription, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Separator 
} from '@/components/ui'
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Copy, 
  Share2, 
  DollarSign,
  CheckCircle,
  Clock,
  Star,
  Award,
  Link2,
  UserPlus,
  Wallet,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { WalletConnectionManager } from '@/components/ui'
import { useTreasuryContract } from '@/lib/hooks/useTreasuryContract'
import { useWalletStatus } from '@/lib/hooks/useWalletConnection'
import { Address } from 'viem'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const { isConnected, address } = useWalletStatus()
  const { 
    referralInfo, 
    isReferralLoading,
    formatUSDT,
    setReferrer,
    claimReferralCommission,
    isWritePending,
    isConfirming,
    refreshData,
    isContractReady
  } = useTreasuryContract()

  const [newReferrer, setNewReferrer] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // 生成推荐链接
  const generateReferralLink = () => {
    if (!address) return ''
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/invest?ref=${address}`
  }

  // 复制推荐链接
  const copyReferralLink = async () => {
    const referralLink = generateReferralLink()
    if (!referralLink) {
      toast.error('请先连接钱包')
      return
    }
    
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('推荐链接已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败，请手动复制')
    }
  }

  // 分享推荐链接
  const shareReferralLink = async () => {
    const referralLink = generateReferralLink()
    if (!referralLink) {
      toast.error('请先连接钱包')
      return
    }

    const text = `加入QA App Web3固定收益平台！通过我的推荐链接注册，我们都能获得奖励！`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QA App 推荐',
          text: text,
          url: referralLink,
        })
      } catch (error) {
        // 用户取消分享
      }
    } else {
      // 备用方案：复制到剪贴板
      try {
        await navigator.clipboard.writeText(`${text} ${referralLink}`)
        setCopied(true)
        toast.success('分享内容已复制到剪贴板')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('分享失败')
      }
    }
  }

  // 设置推荐人
  const handleSetReferrer = async () => {
    if (!newReferrer) {
      toast.error('请输入推荐人地址')
      return
    }

    if (newReferrer.toLowerCase() === address?.toLowerCase()) {
      toast.error('不能设置自己为推荐人')
      return
    }

    try {
      await setReferrer(newReferrer as Address)
      setNewReferrer('')
      toast.success('推荐人设置成功！')
    } catch (error) {
      // 错误已在hook中处理
    }
  }

  // 领取推荐佣金
  const handleClaimCommission = async () => {
    if (!referralInfo?.commissionEarned || referralInfo.commissionEarned === 0n) {
      toast.error('没有可领取的佣金')
      return
    }

    try {
      await claimReferralCommission()
    } catch (error) {
      // 错误已在hook中处理
    }
  }

  // 渲染连接状态
  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              连接钱包
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                请连接钱包以查看推荐信息和管理推荐奖励
              </AlertDescription>
            </Alert>
            <WalletConnectionManager compact />
          </CardContent>
        </Card>
      )
    }

    return null
  }

  // 渲染统计卡片
  const renderStatsCards = () => {
    if (!isConnected || !referralInfo) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    const totalReferrals = Number(referralInfo.totalReferredUsers)
    const commissionEarned = parseFloat(formatUSDT(referralInfo.commissionEarned))
    const totalCommissionClaimed = parseFloat(formatUSDT(referralInfo.totalCommissionClaimed))
    const pendingCommission = commissionEarned

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">推荐用户数</p>
                <p className="text-2xl font-bold">{totalReferrals}</p>
                <p className="text-xs text-gray-500 mt-1">
                  总推荐人数
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待领取佣金</p>
                <p className="text-2xl font-bold text-green-600">
                  {pendingCommission.toFixed(2)} USDT
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  可立即提取
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">累计收益</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalCommissionClaimed.toFixed(2)} USDT
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  已领取佣金
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">佣金率</p>
                <p className="text-2xl font-bold text-purple-600">5.0%</p>
                <p className="text-xs text-gray-500 mt-1">
                  推荐奖励比例
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 渲染推荐链接
  const renderReferralLink = () => {
    if (!isConnected) return null

    const referralLink = generateReferralLink()

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            我的推荐链接
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                {referralLink}
              </div>
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="flex items-center gap-2 shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    复制
                  </>
                )}
              </Button>
              <Button
                onClick={shareReferralLink}
                className="flex items-center gap-2 shrink-0"
              >
                <Share2 className="h-4 w-4" />
                分享
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">推荐奖励</span>
                </div>
                <p className="text-sm text-blue-700">
                  成功推荐好友投资，您将获得其投资金额 <strong>5%</strong> 的推荐奖励
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">即时到账</span>
                </div>
                <p className="text-sm text-green-700">
                  推荐奖励实时计算，可随时领取到您的钱包地址
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染推荐人设置
  const renderReferrerSetting = () => {
    if (!isConnected) return null

    const hasReferrer = referralInfo?.referrer && referralInfo.referrer !== '0x0000000000000000000000000000000000000000'

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {hasReferrer ? '我的推荐人' : '设置推荐人'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasReferrer ? (
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  您已成功设置推荐人
                </AlertDescription>
              </Alert>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm text-gray-600">推荐人地址:</Label>
                <div className="font-mono text-sm mt-1 break-all">
                  {referralInfo.referrer}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  设置推荐人可以让推荐您的用户获得佣金奖励，建立互利关系
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="referrer-address">推荐人钱包地址</Label>
                <div className="flex gap-2">
                  <Input
                    id="referrer-address"
                    placeholder="0x..."
                    value={newReferrer}
                    onChange={(e) => setNewReferrer(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSetReferrer}
                    disabled={!newReferrer || isWritePending || isConfirming}
                    className="shrink-0"
                  >
                    {isWritePending || isConfirming ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        设置中...
                      </div>
                    ) : (
                      '设置推荐人'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 渲染佣金管理
  const renderCommissionManagement = () => {
    if (!isConnected || !referralInfo) return null

    const pendingCommission = parseFloat(formatUSDT(referralInfo.commissionEarned))

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            佣金管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">待领取佣金</div>
                <div className="text-2xl font-bold text-green-600">
                  {pendingCommission.toFixed(2)} USDT
                </div>
              </div>
              <Button
                onClick={handleClaimCommission}
                disabled={pendingCommission <= 0 || isWritePending || isConfirming}
                className="flex items-center gap-2"
              >
                {isWritePending || isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    领取中...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    领取佣金
                  </>
                )}
              </Button>
            </div>

            {pendingCommission <= 0 && (
              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  暂无可领取佣金。成功推荐用户投资后，您将自动获得 5% 的推荐奖励。
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染佣金规则
  const renderCommissionRules = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="h-5 w-5" />
        佣金规则
      </h3>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">直推佣金</h4>
                <p className="text-gray-600 text-sm mt-1">
                  用户通过您的链接投资时，您立即获得佣金
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">5%</div>
                <div className="text-sm text-gray-500">佣金比例</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  佣金特点
                </h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• 实时计算，无延迟</li>
                  <li>• 随时可以提取</li>
                  <li>• 直接转入钱包</li>
                  <li>• 无最低提取限制</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  计算方式
                </h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• 基于投资本金计算</li>
                  <li>• 支持USDT和ETH投资</li>
                  <li>• 多次投资多次奖励</li>
                  <li>• 透明化链上记录</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <Star className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>推荐奖励说明：</strong>
          所有推荐佣金均基于智能合约自动执行，透明可靠。
          被推荐用户投资确认后，佣金立即计入您的账户余额。
        </AlertDescription>
      </Alert>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">推荐中心</h1>
                <p className="text-gray-600 mt-1">邀请好友加入，共享收益奖励</p>
              </div>
              <Button
                onClick={() => {
                  refreshData()
                  toast.success('数据已刷新')
                }}
                variant="outline"
                size="sm"
                disabled={loading || isReferralLoading}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                刷新数据
              </Button>
            </div>

            {renderConnectionStatus()}
            {renderStatsCards()}
            {renderReferralLink()}
            {renderReferrerSetting()}
            {renderCommissionManagement()}

            <Tabs defaultValue="rules" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="rules" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  奖励规则
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rules" className="mt-6">
                {renderCommissionRules()}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}