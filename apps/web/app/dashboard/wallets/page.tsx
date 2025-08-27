'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useEnsName } from 'wagmi'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription
} from '@qa-app/ui'

import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useUSDT } from '../../../lib/hooks/use-contracts'
import { getContractAddresses } from '../../../lib/contracts/addresses'

export default function WalletsPage() {
  const [isCopied, setIsCopied] = useState(false)
  
  const { address, isConnected, chainId, chain } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const usdt = useUSDT()
  
  // 获取ETH余额
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
  })
  
  // 获取ENS名称
  const { data: ensName } = useEnsName({
    address: address,
  })
  
  const contracts = getContractAddresses(chainId || 1)
  
  // 复制地址到剪贴板
  const copyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setIsCopied(true)
      toast.success('地址已复制到剪贴板')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }
  
  // 刷新余额
  const refreshBalances = () => {
    refetchEthBalance()
    usdt.refetchBalance()
    toast.success('余额已刷新')
  }
  
  // 获取区块链浏览器链接
  const getExplorerUrl = () => {
    if (!address || !chainId) return '#'
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
      11155111: 'https://sepolia.etherscan.io',
    }
    
    return `${explorers[chainId] || 'https://etherscan.io'}/address/${address}`
  }
  
  // 格式化地址显示
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  return (
    <ProtectedRoute requireWallet={false}>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* 页面标题 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl font-bold mb-2">钱包管理</h1>
                <p className="text-muted-foreground">
                  管理您的Web3钱包连接，查看资产余额和交易记录
                </p>
              </motion.div>
              
              {!isConnected ? (
                /* 未连接状态 */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-6 h-6" />
                        连接钱包
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-muted-foreground">
                        请选择一个钱包连接到QA投资平台，开始您的DeFi投资之旅
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connectors.map((connector) => (
                          <Button
                            key={connector.id}
                            onClick={() => connect({ connector })}
                            disabled={isConnecting}
                            variant="outline"
                            className="h-16 justify-start gap-3"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{connector.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {connector.id === 'injected' ? '浏览器钱包' : '官方钱包'}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          连接钱包后，您可以投资我们的固定收益产品并获得NFT投资凭证
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* 已连接状态 */
                <div className="space-y-6">
                  {/* 钱包信息 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            已连接钱包
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={refreshBalances}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => disconnect()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 网络信息 */}
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">当前网络</p>
                            <p className="font-medium">{chain?.name || '未知网络'}</p>
                          </div>
                          <Badge variant={chain?.id === 1 ? "default" : "secondary"}>
                            Chain ID: {chainId}
                          </Badge>
                        </div>
                        
                        {/* 地址信息 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">钱包地址</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm">{formatAddress(address!)}</p>
                                {ensName && (
                                  <Badge variant="outline">{ensName}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyAddress}
                              >
                                {isCopied ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(getExplorerUrl(), '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* 资产余额 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>资产余额</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* ETH余额 */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">ETH</span>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">以太坊</p>
                                <p className="font-semibold">
                                  {ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0.0000'} ETH
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* USDT余额 */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">USDT</span>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">泰达币</p>
                                <p className="font-semibold">
                                  {usdt.formatBalance()} USDT
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 合约地址信息 */}
                        <div className="mt-6 pt-4 border-t space-y-2">
                          <h4 className="font-medium text-sm">合约地址</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground">Treasury合约</p>
                              <p className="font-mono">{formatAddress(contracts.TREASURY)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">QACard NFT</p>
                              <p className="font-mono">{formatAddress(contracts.QA_CARD)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* 快捷操作 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>快捷操作</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button
                            variant="outline"
                            className="h-16 flex-col gap-1"
                            onClick={() => window.location.href = '/products'}
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-sm">投资产品</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="h-16 flex-col gap-1"
                            onClick={() => window.location.href = '/dashboard'}
                          >
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm">查看资产</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="h-16 flex-col gap-1"
                            onClick={() => window.open(getExplorerUrl(), '_blank')}
                          >
                            <ExternalLink className="w-5 h-5" />
                            <span className="text-sm">区块链浏览器</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* 安全提示 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>安全提示：</strong> 请妥善保管您的私钥和助记词，不要泄露给任何人。
                        我们永远不会要求您提供私钥或助记词。
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}