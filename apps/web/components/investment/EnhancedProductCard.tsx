'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Zap, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  Users,
  Gift
} from 'lucide-react'
import { useTreasuryContract, type Product } from '@/lib/hooks/useTreasuryContract'
import { useWalletStatus } from '@/lib/hooks/useWalletConnection'
import { Address } from 'viem'
import toast from 'react-hot-toast'

interface EnhancedProductCardProps {
  product: Product
  productId: number
  onPurchaseSuccess?: () => void
  showReferralOptions?: boolean
  referrerAddress?: Address
}

export function EnhancedProductCard({
  product,
  productId,
  onPurchaseSuccess,
  showReferralOptions = false,
  referrerAddress
}: EnhancedProductCardProps) {
  const { isConnected, address, ethBalance, isNetworkSupported } = useWalletStatus()
  const {
    purchaseWithUSDT,
    purchaseWithReferral,
    purchaseWithETH,
    isWritePending,
    isConfirming,
    formatUSDT,
    formatAPY,
    formatDuration,
    priceInfo,
    isContractReady
  } = useTreasuryContract()

  const [investmentAmount, setInvestmentAmount] = useState('')
  const [useETH, setUseETH] = useState(false)
  const [ethAmount, setEthAmount] = useState('')
  const [useReferrer, setUseReferrer] = useState(false)
  const [referrer, setReferrer] = useState(referrerAddress || '')
  const [showCalculator, setShowCalculator] = useState(false)

  // 计算投资回报
  const calculateReturns = () => {
    if (!investmentAmount || isNaN(Number(investmentAmount))) return null
    
    const principal = Number(investmentAmount)
    const apy = Number(formatAPY(product.apy))
    const duration = Number(product.duration)
    const durationInYears = duration / (365 * 24 * 60 * 60)
    
    const returns = principal * (apy / 100) * durationInYears
    const total = principal + returns
    
    return {
      principal,
      returns,
      total,
      apy,
      duration: duration / (24 * 60 * 60) // 转换为天
    }
  }

  // ETH价格计算
  const calculateETHAmount = () => {
    if (!investmentAmount || !priceInfo?.isValid) return ''
    
    const usdtAmount = Number(investmentAmount)
    const ethPriceInUSDT = Number(formatUSDT(priceInfo.rate))
    const requiredETH = usdtAmount / ethPriceInUSDT
    
    return requiredETH.toFixed(6)
  }

  // 更新ETH金额
  useEffect(() => {
    if (useETH && investmentAmount && priceInfo?.isValid) {
      setEthAmount(calculateETHAmount())
    }
  }, [investmentAmount, useETH, priceInfo])

  // 处理投资
  const handleInvest = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包')
      return
    }

    if (!isNetworkSupported) {
      toast.error('当前网络不受支持')
      return
    }

    if (!isContractReady) {
      toast.error('合约未就绪')
      return
    }

    if (!investmentAmount || isNaN(Number(investmentAmount))) {
      toast.error('请输入有效的投资金额')
      return
    }

    const amount = Number(investmentAmount)
    const minInvestment = Number(formatUSDT(product.minInvestment))
    const maxInvestment = Number(formatUSDT(product.maxInvestment))

    if (amount < minInvestment || amount > maxInvestment) {
      toast.error(`投资金额必须在 ${minInvestment} - ${maxInvestment} USDT 之间`)
      return
    }

    try {
      if (useETH) {
        // ETH支付
        if (!ethAmount) {
          toast.error('ETH金额计算错误')
          return
        }
        await purchaseWithETH(productId, ethAmount)
      } else {
        // USDT支付
        if (useReferrer && referrer) {
          await purchaseWithReferral(productId, investmentAmount, referrer as Address)
        } else {
          await purchaseWithUSDT(productId, investmentAmount)
        }
      }

      // 成功后重置表单
      setInvestmentAmount('')
      setEthAmount('')
      onPurchaseSuccess?.()
    } catch (error) {
      // 错误已在hook中处理
    }
  }

  const returns = calculateReturns()
  const isLoading = isWritePending || isConfirming

  if (!product.isActive) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant="secondary">暂停销售</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            该产品暂时不可投资
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            {product.name}
          </CardTitle>
          <Badge variant="default">活跃</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 产品信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-gray-600">年化收益</div>
              <div className="font-semibold text-green-600">
                {formatAPY(product.apy)}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <div>
              <div className="text-gray-600">投资期限</div>
              <div className="font-semibold">{formatDuration(product.duration)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-500" />
            <div>
              <div className="text-gray-600">最小投资</div>
              <div className="font-semibold">{formatUSDT(product.minInvestment)} USDT</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-gray-600">最大投资</div>
              <div className="font-semibold">{formatUSDT(product.maxInvestment)} USDT</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 投资金额输入 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`amount-${productId}`}>投资金额 (USDT)</Label>
            <Input
              id={`amount-${productId}`}
              type="number"
              placeholder="请输入投资金额"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              min={formatUSDT(product.minInvestment)}
              max={formatUSDT(product.maxInvestment)}
            />
          </div>

          {/* ETH支付选项 */}
          {priceInfo?.isValid && (
            <div className="flex items-center space-x-2">
              <Switch
                id={`eth-pay-${productId}`}
                checked={useETH}
                onCheckedChange={setUseETH}
              />
              <Label htmlFor={`eth-pay-${productId}`} className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                使用 ETH 支付
              </Label>
            </div>
          )}

          {useETH && priceInfo?.isValid && (
            <div>
              <Label>所需 ETH 数量</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={ethAmount}
                  readOnly
                  className="bg-gray-50"
                />
                <Badge variant="outline">
                  1 ETH = {formatUSDT(priceInfo.rate)} USDT
                </Badge>
              </div>
            </div>
          )}

          {/* 推荐人选项 */}
          {showReferralOptions && !useETH && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`referrer-${productId}`}
                  checked={useReferrer}
                  onCheckedChange={setUseReferrer}
                />
                <Label htmlFor={`referrer-${productId}`} className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  使用推荐人 (获得额外奖励)
                </Label>
              </div>
              
              {useReferrer && (
                <div>
                  <Label>推荐人地址</Label>
                  <Input
                    placeholder="0x..."
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                  />
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    推荐人将获得 5% 佣金奖励
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 收益计算器 */}
        {returns && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <Label>收益预计</Label>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-orange-50 p-4 rounded-lg border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-600">本金</div>
                  <div className="font-semibold">{returns.principal.toFixed(2)} USDT</div>
                </div>
                <div>
                  <div className="text-gray-600">预计收益</div>
                  <div className="font-semibold text-green-600">
                    {returns.returns.toFixed(2)} USDT
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-600">到期总额</div>
                  <div className="font-bold text-lg text-orange-600">
                    {returns.total.toFixed(2)} USDT
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 余额检查 */}
        {useETH && ethBalance && (
          <div className="text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">钱包 ETH 余额:</span>
              <span className="font-mono">{ethBalance} ETH</span>
            </div>
            {ethAmount && Number(ethAmount) > Number(ethBalance) && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  ETH 余额不足
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* 网络检查 */}
        {!isNetworkSupported && isConnected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              当前网络不受支持，请切换到支持的网络
            </AlertDescription>
          </Alert>
        )}

        {/* 投资按钮 */}
        <Button 
          onClick={handleInvest}
          disabled={
            !isConnected || 
            !isNetworkSupported || 
            !isContractReady ||
            !investmentAmount || 
            isLoading ||
            (useETH && ethAmount && Number(ethAmount) > Number(ethBalance || '0'))
          }
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isConfirming ? '确认中...' : '提交中...'}
            </div>
          ) : !isConnected ? (
            '请连接钱包'
          ) : !isNetworkSupported ? (
            '网络不支持'
          ) : !isContractReady ? (
            '合约未就绪'
          ) : (
            <div className="flex items-center gap-2">
              {useETH ? <Zap className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
              立即投资 {useETH ? 'ETH' : 'USDT'}
            </div>
          )}
        </Button>

        {/* 状态提示 */}
        {isLoading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              交易正在处理中，请耐心等待区块链确认...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}