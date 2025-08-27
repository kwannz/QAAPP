'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { Wallet, AlertCircle, CheckCircle, Loader2, ExternalLink, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Input,
  Alert,
  AlertDescription 
} from '@qa-app/ui'

import { useTreasury, useUSDT } from '../../lib/hooks/use-contracts'
import { apiClient } from '../../lib/api-client'
import { ProductType, PRODUCT_CONFIG } from '../../lib/contracts/addresses'

interface ProductPurchaseProps {
  productType: ProductType
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function ProductPurchase({ productType, onSuccess, onError }: ProductPurchaseProps) {
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<'USDT' | 'ETH'>('USDT')
  const [step, setStep] = useState<'input' | 'approve' | 'purchase' | 'success'>('input')
  
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const treasury = useTreasury()
  const usdt = useUSDT()
  
  const productConfig = PRODUCT_CONFIG[productType]
  
  // 检查网络是否支持
  const isSupportedNetwork = chainId && [1, 137, 42161, 11155111, 31337].includes(chainId)
  
  // 处理购买流程
  const handlePurchase = async () => {
    if (!amount || !address) return
    
    try {
      const amountNum = parseFloat(amount)
      
      // 1. 前端验证
      if (amountNum < productConfig.minInvestment) {
        toast.error(`最小投资金额为 ${productConfig.minInvestment} USDT`)
        return
      }
      
      if (amountNum > productConfig.maxInvestment) {
        toast.error(`最大投资金额为 ${productConfig.maxInvestment} USDT`)
        return
      }
      
      // 检查余额
      const balance = usdt.formatBalance()
      if (parseFloat(balance) < amountNum) {
        toast.error('USDT余额不足')
        return
      }

      // 2. 后端验证产品购买
      setStep('approve')
      toast.loading('验证购买信息...')
      
      const validation = await apiClient.post('/products/validate-purchase', {
        productType: productConfig.name,
        amount: amountNum
      })
      
      if (!validation.data.isValid) {
        toast.error(validation.data.errors.join(', '))
        setStep('input')
        return
      }

      // 3. 检查和处理USDT授权 (仅USDT支付需要)
      if (paymentType === 'USDT' && usdt.needsApproval(amount)) {
        toast.loading('请在钱包中确认USDT授权交易...')
        
        await usdt.approve(amount)
        
        // 等待授权确认
        if (usdt.isConfirming) {
          toast.loading('等待授权确认...')
        }
        
        if (usdt.isSuccess) {
          toast.success('USDT授权成功！')
          await usdt.refetchAllowance()
        } else {
          throw new Error('USDT授权失败')
        }
      }

      // 4. 创建后端订单
      setStep('purchase')
      toast.loading('创建投资订单...')
      
      const endpoint = paymentType === 'ETH' ? '/orders/eth' : '/orders'
      const orderPayload = paymentType === 'ETH' 
        ? {
            productId: productType.toString(),
            ethAmount: amountNum,
            walletAddress: address
          }
        : {
            productId: productType.toString(), 
            usdtAmount: amountNum,
            walletAddress: address
          }
      
      const orderResponse = await apiClient.post(endpoint, orderPayload)
      
      const orderId = orderResponse.data.id

      // 5. 执行智能合约购买
      toast.loading('请在钱包中确认购买交易...')
      
      if (paymentType === 'ETH') {
        // 使用ETH购买 - 需要实现treasury.purchaseProductWithETH方法
        await treasury.purchaseProductWithETH(productType, amountNum)
      } else {
        // 使用USDT购买
        await treasury.purchaseProduct(productType, amount)
      }
      
      // 等待交易确认
      if (treasury.isConfirming) {
        toast.loading('等待区块链交易确认...')
      }
      
      if (treasury.isSuccess) {
        // 6. 更新后端订单状态
        try {
          await apiClient.post('/orders/blockchain/confirm', {
            orderId: orderId,
            tokenId: 'pending' // 实际的tokenId需要从事件中获取
          })
        } catch (backendError) {
          console.warn('后端订单状态更新失败，但区块链交易成功:', backendError)
        }

        setStep('success')
        toast.success('购买成功！您的投资凭证NFT已发送到您的钱包')
        onSuccess?.()
        
        // 刷新数据
        usdt.refetchBalance()
        usdt.refetchAllowance()
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      
      // 如果有订单ID，标记订单失败
      try {
        // 这里需要从错误处理中获取orderId，简化处理
        // await apiClient.post('/orders/blockchain/fail', {
        //   orderId: orderId,
        //   errorMessage: error.message
        // })
      } catch (backendError) {
        console.warn('后端订单失败状态更新失败:', backendError)
      }

      const errorMessage = error?.message?.includes('User rejected') 
        ? '交易已被用户取消' 
        : error?.message || '购买失败，请重试'
      toast.error(errorMessage)
      onError?.(errorMessage)
      setStep('input')
    }
  }
  
  // 计算预期收益
  const calculateReturns = () => {
    if (!amount) return null
    
    const amountNum = parseFloat(amount)
    // 如果是ETH支付，转换为等值USDT (1 ETH = 2000 USDT)
    const principal = paymentType === 'ETH' ? amountNum * 2000 : amountNum
    const dailyRate = productConfig.apr / 100 / 365
    const totalDays = productConfig.duration
    const totalReturn = principal * dailyRate * totalDays
    const totalValue = principal + totalReturn
    
    return {
      principal,
      totalReturn,
      totalValue,
      dailyReturn: principal * dailyRate,
      originalAmount: amountNum,
      originalCurrency: paymentType
    }
  }
  
  const returns = calculateReturns()
  
  if (!isConnected) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            连接钱包
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            请连接您的钱包以购买 {productConfig.name}
          </p>
          
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => connect({ connector })}
                variant="outline"
                className="w-full"
              >
                连接 {connector.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!isSupportedNetwork) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">网络不支持</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              请切换到支持的网络：以太坊主网、Polygon、Arbitrum 或 Sepolia 测试网
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{productConfig.icon}</span>
          购买 {productConfig.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 产品信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">年化收益率</p>
            <p className="font-semibold text-green-600">{productConfig.apr}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">投资期限</p>
            <p className="font-semibold">{productConfig.duration} 天</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">最小投资</p>
            <p className="font-semibold">{productConfig.minInvestment.toLocaleString()} USDT</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">最大投资</p>
            <p className="font-semibold">{productConfig.maxInvestment.toLocaleString()} USDT</p>
          </div>
        </div>
        
        {/* 余额显示 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {paymentType} 余额
            </span>
            <span className="font-semibold">
              {paymentType === 'USDT' ? usdt.formatBalance() : '0.0000'} {paymentType}
            </span>
          </div>
        </div>
        
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* 支付类型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">支付方式</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentType === 'USDT' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('USDT')}
                  className="flex items-center gap-2"
                >
                  💎 USDT
                </Button>
                <Button
                  variant={paymentType === 'ETH' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('ETH')}
                  className="flex items-center gap-2"
                >
                  ⧫ ETH
                </Button>
              </div>
            </div>

            {/* 投资金额输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                投资金额 ({paymentType})
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${productConfig.minInvestment} - ${productConfig.maxInvestment}`}
                min={productConfig.minInvestment}
                max={productConfig.maxInvestment}
              />
              <div className="flex gap-2">
                {paymentType === 'ETH' ? (
                  // ETH预设金额
                  [0.1, 0.25, 0.5].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      {preset} ETH
                    </Button>
                  ))
                ) : (
                  // USDT预设金额
                  [
                    productConfig.minInvestment,
                    productConfig.minInvestment * 2,
                    productConfig.minInvestment * 5
                  ].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      {preset.toLocaleString()}
                    </Button>
                  ))
                )}
              </div>
            </div>
            
            {/* 收益计算 */}
            {returns && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  预期收益
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">投资本金</span>
                    <span className="font-medium">
                      {returns.originalAmount} {returns.originalCurrency}
                      {paymentType === 'ETH' && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (≈{returns.principal.toLocaleString()} USDT)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">预期收益</span>
                    <span className="font-medium text-green-600">+{returns.totalReturn.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">日均收益</span>
                    <span className="font-medium text-green-600">+{returns.dailyReturn.toFixed(2)} USDT</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>到期总值</span>
                    <span className="text-green-600">{returns.totalValue.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              onClick={handlePurchase}
              disabled={!amount || treasury.isPending}
              className="w-full"
              size="lg"
            >
              {treasury.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              立即购买
            </Button>
          </motion.div>
        )}
        
        {step === 'approve' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
            <div>
              <h4 className="font-semibold">授权USDT使用权限</h4>
              <p className="text-sm text-muted-foreground mt-1">
                请在钱包中确认授权交易，这将允许智能合约使用您的USDT进行投资
              </p>
            </div>
          </motion.div>
        )}
        
        {step === 'purchase' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
            <div>
              <h4 className="font-semibold">处理投资交易</h4>
              <p className="text-sm text-muted-foreground mt-1">
                请在钱包中确认投资交易，完成后您将收到投资凭证NFT
              </p>
            </div>
          </motion.div>
        )}
        
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h4 className="font-semibold text-green-600">购买成功！</h4>
              <p className="text-sm text-muted-foreground mt-1">
                您的投资凭证NFT已发送到钱包，可在个人仪表板查看详情
              </p>
            </div>
            <Button
              onClick={() => window.open(`https://etherscan.io/tx/${treasury.isSuccess}`, '_blank')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              查看交易
            </Button>
          </motion.div>
        )}
        
        {/* 风险提示 */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            投资有风险，请谨慎投资。本产品收益预期基于历史数据，实际收益可能有所不同。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}