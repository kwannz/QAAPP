'use client'

import React, { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, ExternalLink, AlertTriangle, CheckCircle, XCircle, Zap, Copy } from 'lucide-react'
import { useWalletConnection, useNetworkStatus } from '@/lib/hooks/useWalletConnection'
import { web3ConnectionManager } from '@/lib/web3/connection-manager'
import toast from 'react-hot-toast'

interface WalletConnectionManagerProps {
  onConnectionChange?: (isConnected: boolean, chainId?: number) => void
  showNetworkInfo?: boolean
  showContractStatus?: boolean
  compact?: boolean
  className?: string
}

export function WalletConnectionManager({
  onConnectionChange,
  showNetworkInfo = true,
  showContractStatus = true,
  compact = false,
  className = ''
}: WalletConnectionManagerProps) {
  const [walletState, walletActions] = useWalletConnection()
  const networkStatus = useNetworkStatus()
  
  const [contractDeployment, setContractDeployment] = useState<Record<string, boolean>>({})
  const [checkingContracts, setCheckingContracts] = useState(false)

  // 连接状态变化回调
  useEffect(() => {
    onConnectionChange?.(walletState.isConnected, walletState.chainId)
  }, [walletState.isConnected, walletState.chainId, onConnectionChange])

  // 检查合约部署状态
  useEffect(() => {
    if (walletState.chainId && walletState.isNetworkSupported) {
      setCheckingContracts(true)
      web3ConnectionManager
        .checkContractDeployment(walletState.chainId)
        .then(setContractDeployment)
        .finally(() => setCheckingContracts(false))
    }
  }, [walletState.chainId, walletState.isNetworkSupported])

  // 复制地址
  const copyAddress = async () => {
    if (walletState.address) {
      await navigator.clipboard.writeText(walletState.address)
      toast.success('地址已复制到剪贴板')
    }
  }

  // 紧凑模式只显示连接按钮
  if (compact) {
    return (
      <div className={className}>
        <ConnectButton
          chainStatus="icon"
          accountStatus="address"
          showBalance={false}
        />
      </div>
    )
  }

  // 渲染连接状态
  const renderConnectionStatus = () => {
    if (!walletState.isConnected) {
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              钱包连接
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  请连接钱包以使用平台功能
                </AlertDescription>
              </Alert>
              <ConnectButton />
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            钱包已连接
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* 地址信息 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">钱包地址:</span>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="font-mono text-xs">
                {walletActions.formatAddress(walletState.address)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 余额信息 */}
          {walletState.ethBalance && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">ETH 余额:</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="font-medium">{walletState.ethBalance} ETH</span>
                {walletState.isBalanceLoading && (
                  <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <ConnectButton />
          </div>

          {/* 错误提示 */}
          {walletState.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {walletState.error}
                <Button
                  variant="link"
                  size="sm"
                  onClick={walletActions.clearError}
                  className="h-auto p-0 ml-2 text-xs underline"
                >
                  清除错误
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  // 渲染网络状态
  const renderNetworkStatus = () => {
    if (!showNetworkInfo || !walletState.chainId) return null

    const networkInfo = web3ConnectionManager.getNetworkInfo(walletState.chainId)
    const isSupported = walletState.isNetworkSupported

    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-lg">🌐</span>
            网络状态
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">当前网络:</span>
            <div className="flex items-center gap-1">
              {isSupported ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={isSupported ? 'text-green-700' : 'text-red-700'}>
                {walletState.networkName || `未知链 (${walletState.chainId})`}
              </span>
            </div>
          </div>
          
          {!isSupported && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                当前网络不受支持。请切换到支持的网络。
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={networkStatus.switchToSupportedChain}
                    className="text-xs"
                  >
                    切换到推荐网络
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isSupported && networkInfo && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">区块浏览器:</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => window.open(networkInfo.blockExplorerUrls[0], '_blank')}
                className="h-auto p-0 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                查看浏览器
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 渲染合约状态
  const renderContractStatus = () => {
    if (!showContractStatus || !walletState.chainId || !walletState.isNetworkSupported) return null

    const deployedCount = Object.values(contractDeployment).filter(Boolean).length
    const totalCount = Object.keys(contractDeployment).length
    const allDeployed = deployedCount === totalCount && totalCount > 0

    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            📄 合约状态
            {checkingContracts && (
              <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {totalCount === 0 ? (
            <div className="text-sm text-gray-500">未检测到合约配置</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(contractDeployment).map(([contractName, isDeployed]) => (
                <div key={contractName} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{contractName}:</span>
                  <div className="flex items-center gap-1">
                    {isDeployed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700">已部署</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700">未部署</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!allDeployed && totalCount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                部分合约尚未部署，某些功能可能无法正常使用。
              </AlertDescription>
            </Alert>
          )}

          {allDeployed && walletState.chainId === 11155111 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                所有合约已部署到 Sepolia 测试网，可以开始测试功能。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {renderConnectionStatus()}
      {renderNetworkStatus()}
      {renderContractStatus()}
    </div>
  )
}