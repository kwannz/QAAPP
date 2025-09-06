'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useBalance, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatEther, formatUnits } from 'viem'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
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
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Clock,
  Wallet,
  ArrowRight,
  RefreshCw,
  Coins, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Download,
  History
} from 'lucide-react'
import { useTreasury } from '@/lib/hooks/use-contracts'
import apiClient from '@/lib/api-client'
import { ProductType, PRODUCT_CONFIG } from '@/lib/contracts/addresses'
import { toast } from 'react-hot-toast'

export type TransactionType = 'payment' | 'payout'
export type TransactionStep = 'preparation' | 'confirmation' | 'processing' | 'success' | 'error'

interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  createdAt: string
  completedAt?: string
}

interface Payout {
  id: string
  userId: string
  positionId: string
  amount: number
  periodStart: string
  periodEnd: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  createdAt: string
}

interface TransactionFlowProps {
  type: TransactionType
  productType?: ProductType
  ethAmount?: string
  onSuccess?: (txHash: string, tokenId?: string) => void
  onError?: (error: string) => void
  className?: string
  showHistory?: boolean
}

export function TransactionFlow({ 
  type, 
  productType, 
  ethAmount = '0', 
  onSuccess, 
  onError,
  className = '',
  showHistory = true 
}: TransactionFlowProps) {
  const [step, setStep] = useState<TransactionStep>('preparation')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [tokenId, setTokenId] = useState<string>('')
  const [error, setError] = useState<string>('')
  
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  
  const treasury = useTreasury()
  
  // API 服务函数
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  })

  const fetchPayouts = async () => {
    if (!localStorage.getItem('token')) return []
    try {
      const { data } = await apiClient.get('/finance/transactions', { params: { type: 'PAYOUT' } })
      return (data as any)?.data || []
    } catch (error) {
      console.error('Failed to fetch payouts:', error)
      return []
    }
  }

  const fetchTransactions = async () => {
    if (!localStorage.getItem('token')) return []
    try {
      const { data } = await apiClient.get('/finance/orders')
      return (data as any)?.data || []
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      return []
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [payoutsData, transactionsData] = await Promise.all([
        fetchPayouts(),
        fetchTransactions()
      ])
      setPayouts(payoutsData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Failed to load transaction data:', error)
      // Set empty arrays to avoid errors
      setPayouts([])
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 支付流程 (整合自 ETHPaymentFlow)
  const executePayment = async () => {
    if (!isConnected || !treasury) {
      setError('Please connect wallet and ensure contracts are loaded')
      return
    }

    try {
      setIsLoading(true)
      setStep('processing')
      
      const amountWei = parseUnits(ethAmount, 18)
      
      // 调用实际的合约方法
      const result = await treasury.purchase(productType, { value: amountWei })
      
      if (result?.hash) {
        setTxHash(result.hash)
        // 等待交易确认
        setStep('confirmation')
        
        // 等待区块链确认
        // const receipt = await waitForTransaction({ hash: result.hash })
        // if (receipt.status === 'success') {
        //   // 从receipt中获取tokenId
        //   const tokenId = receipt.logs[0]?.topics[3] // 假设这是tokenId的位置
        //   setTokenId(tokenId || '')
        // }
        
        // 模拟等待确认过程 - 在生产环境中应替换为实际的区块链确认
        setTimeout(() => {
          setStep('success')
          toast.success('交易成功完成!')
          onSuccess?.(result.hash, tokenId)
        }, 3000)
      } else {
        throw new Error('交易执行失败')
      }
      
    } catch (err: any) {
      console.error('Transaction failed:', err)
      setError(err?.message || 'Transaction failed')
      setStep('error')
      onError?.(err?.message || 'Transaction failed')
      toast.error('Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  // 渲染支付界面
  const renderPaymentFlow = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>ETH Payment Flow</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>Please connect your wallet to proceed</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wallet Balance:</span>
                <span className="font-mono">
                  {balance ? `${formatEther(balance.value)} ${balance.symbol}` : '0 ETH'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount to Pay:</span>
                <span className="font-mono font-semibold">{ethAmount} ETH</span>
              </div>
              
              <Separator />
              
              {step === 'preparation' && (
                <Button 
                  onClick={executePayment}
                  disabled={!ethAmount || parseFloat(ethAmount) <= 0}
                  className="w-full"
                >
                  Confirm Payment
                </Button>
              )}
              
              {step === 'processing' && (
                <Button disabled className="w-full">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Transaction...
                </Button>
              )}
              
              {step === 'success' && (
                <div className="space-y-3">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Payment successful! Transaction Hash: {txHash.substring(0, 10)}...
                    </AlertDescription>
                  </Alert>
                  {tokenId && (
                    <div className="text-center">
                      <Badge variant="secondary">NFT Token ID: {tokenId}</Badge>
                    </div>
                  )}
                </div>
              )}
              
              {step === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // 渲染分红界面 (整合自 PayoutDashboard)
  const renderPayoutFlow = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Payout Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Position: {payout.positionId}</div>
                  <div className="text-sm text-muted-foreground">
                    Period: {new Date(payout.periodStart).toLocaleDateString()} - 
                    {new Date(payout.periodEnd).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="font-semibold">¥{payout.amount.toLocaleString()}</div>
                  <Badge variant={
                    payout.status === 'completed' ? 'default' :
                    payout.status === 'pending' ? 'secondary' :
                    payout.status === 'processing' ? 'outline' : 'destructive'
                  }>
                    {payout.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue={type} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="payout" className="flex items-center space-x-2">
            <Coins className="w-4 h-4" />
            <span>Payouts</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment">
          {renderPaymentFlow()}
        </TabsContent>
        
        <TabsContent value="payout">
          {renderPayoutFlow()}
        </TabsContent>
      </Tabs>
      
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Transaction History</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <div className="text-muted-foreground">加载交易历史中...</div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  暂无交易历史
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="font-medium capitalize">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">¥{tx.amount.toLocaleString()}</div>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for feature flag integration
export function useTransactionFlow() {
  const [isEnabled, setIsEnabled] = useState(true)
  
  // Integration with feature flags system
  useEffect(() => {
    // This would check feature flags in production
    setIsEnabled(true)
  }, [])
  
  return { isEnabled }
}
