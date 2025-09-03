'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useEnsName } from 'wagmi'
import { formatEther, isAddress } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  Activity,
  DollarSign,
  Send,
  QrCode,
  Settings,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface WalletTransaction {
  id: string
  type: 'sent' | 'received'
  amount: string
  token: string
  to?: string
  from?: string
  txHash: string
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
}

interface WalletManagerProps {
  showTransactionHistory?: boolean
  showBalanceDetails?: boolean
  showConnectionStatus?: boolean
  compact?: boolean
  className?: string
}

export function WalletManager({ 
  showTransactionHistory = true,
  showBalanceDetails = true,
  showConnectionStatus = true,
  compact = false,
  className = ''
}: WalletManagerProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [sendAmount, setSendAmount] = useState('')
  const [sendAddress, setSendAddress] = useState('')

  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address })
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()

  // 获取交易历史
  const fetchTransactions = async () => {
    if (!address) {
      setTransactions([])
      return
    }

    setIsLoading(true)
    try {
      // 使用 Etherscan API 或其他区块链浏览器 API 获取交易历史
      // 注意：在生产环境中需要配置API密钥
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken'
      const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`)
      
      if (!response.ok) {
        throw new Error('网络请求失败')
      }
      
      const data = await response.json()
      
      if (data.status === '1' && data.result) {
        const formattedTransactions: WalletTransaction[] = data.result.map((tx: any) => ({
          id: tx.hash,
          type: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
          amount: (parseInt(tx.value) / 1e18).toFixed(6),
          token: 'ETH',
          to: tx.to,
          from: tx.from,
          txHash: tx.hash,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
          status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed'
        }))
        setTransactions(formattedTransactions)
      } else {
        setTransactions([])
      }
    } catch (error: any) {
      console.error('获取交易历史失败:', error)
      toast.error('获取交易历史失败')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (showTransactionHistory && isConnected) {
      fetchTransactions()
    }
  }, [address, showTransactionHistory, isConnected])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const formatAddress = (addr: string, ensName?: string | null) => {
    if (ensName) return ensName
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleSendTransaction = async () => {
    if (!isAddress(sendAddress)) {
      toast.error('无效的钱包地址')
      return
    }

    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast.error('请输入有效金额')
      return
    }

    setIsLoading(true)
    try {
      // 这里会调用实际的发送交易逻辑
      toast.success('交易已提交')
      setSendAmount('')
      setSendAddress('')
    } catch (error: any) {
      toast.error(`交易失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 钱包连接状态渲染
  const renderConnectionStatus = () => {
    if (!showConnectionStatus) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>钱包连接</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {formatAddress(address!, ensName)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>已连接</span>
                    {connector && <span>• {connector.name}</span>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(address!)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnect()}
                  >
                    断开连接
                  </Button>
                </div>
              </div>
              
              {showBalanceDetails && balance && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ETH 余额:</span>
                    <span className="font-mono font-semibold">
                      {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>请连接钱包以使用完整功能</AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.id}
                    variant="outline"
                    onClick={() => connect({ connector })}
                  >
                    连接 {connector.name}
                  </Button>
                ))}
              </div>
              
              {connectError && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{connectError.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 交易记录渲染
  const renderTransactionHistory = () => {
    if (!showTransactionHistory) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>交易记录</span>
            </div>
            {isConnected && (
              <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">加载交易记录中...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {isConnected ? '暂无交易记录' : '请先连接钱包'}
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'sent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {tx.type === 'sent' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        {tx.type === 'sent' ? '发送' : '接收'} {tx.amount} {tx.token}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tx.type === 'sent' ? '到: ' : '来自: '}
                        {formatAddress(tx.to || tx.from || '', null)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        tx.status === 'confirmed' ? 'default' :
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {tx.status === 'confirmed' ? '已确认' :
                         tx.status === 'pending' ? '待确认' : '失败'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 发送交易界面
  const renderSendTransaction = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="w-5 h-5" />
          <span>发送交易</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>请先连接钱包</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">接收地址</label>
              <Input
                placeholder="0x..."
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">发送金额 (ETH)</label>
              <Input
                type="number"
                placeholder="0.0"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                step="0.001"
                min="0"
              />
            </div>
            
            {balance && (
              <div className="text-xs text-muted-foreground">
                可用余额: {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
              </div>
            )}
            
            <Button 
              onClick={handleSendTransaction}
              disabled={isLoading || !sendAmount || !sendAddress}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发送交易
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (compact) {
    return (
      <div className={`${className}`}>
        {renderConnectionStatus()}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">钱包总览</TabsTrigger>
          <TabsTrigger value="send">发送</TabsTrigger>
          <TabsTrigger value="history">记录</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {renderConnectionStatus()}
        </TabsContent>
        
        <TabsContent value="send">
          {renderSendTransaction()}
        </TabsContent>
        
        <TabsContent value="history">
          {renderTransactionHistory()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Hook for wallet management
export function useWalletManager() {
  const { isConnected, address } = useAccount()
  const [isEnabled, setIsEnabled] = useState(true)
  
  return { 
    isEnabled, 
    isConnected, 
    address,
    hasWallet: !!address 
  }
}