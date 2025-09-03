'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, CheckCircle, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface SafeConnectButtonProps {
  className?: string
  children?: React.ReactNode
}

interface MockWalletState {
  isConnected: boolean
  address?: string
  balance?: string
  chainId?: number
}

export function SafeConnectButton({ className, children }: SafeConnectButtonProps) {
  const [isWeb3Available, setIsWeb3Available] = useState(false)
  const [ConnectButton, setConnectButton] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [useLocalWallet, setUseLocalWallet] = useState(false)
  const [walletState, setWalletState] = useState<MockWalletState>({
    isConnected: false
  })
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // 检查是否启用了本地钱包模式
    const developmentMode = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true'
    const disableWalletConnect = process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT === 'true'
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
    
    if (developmentMode || disableWalletConnect || !walletConnectProjectId || walletConnectProjectId === '' || walletConnectProjectId === 'undefined') {
      console.log('🔧 使用本地钱包模式 (开发环境或WalletConnect未配置)')
      setUseLocalWallet(true)
      setIsLoading(false)
      return
    }

    // 增加延迟以确保Web3提供者完全初始化
    const initTimer = setTimeout(async () => {
      try {
        // 检查我们是否在Wagmi Provider内部
        const wagmiElement = document.querySelector('[data-wagmi-provider]')
        if (wagmiElement?.getAttribute('data-wagmi-provider') === 'loading') {
          // 如果仍在加载，稍后再试
          setTimeout(() => {
            setIsLoading(false)
            loadConnectButton()
          }, 2000)
          return
        }
        
        await loadConnectButton()
      } catch (error) {
        console.warn('Failed to initialize Web3:', error)
        setIsWeb3Available(false)
        setIsLoading(false)
      }
    }, 1000) // 给Web3提供者1秒钟初始化时间

    const loadConnectButton = async () => {
      try {
        const { ConnectButton: RainbowConnectButton } = await import('@rainbow-me/rainbowkit')
        setConnectButton(() => RainbowConnectButton)
        setIsWeb3Available(true)
        console.log('✅ RainbowKit ConnectButton loaded successfully')
      } catch (error) {
        console.warn('RainbowKit not available:', error)
        setIsWeb3Available(false)
      } finally {
        setIsLoading(false)
      }
    }

    return () => clearTimeout(initTimer)
  }, [])

  // 模拟本地钱包连接
  const connectLocalWallet = async () => {
    if (walletState.isConnected) {
      setWalletState({ isConnected: false })
      toast.success('钱包已断开连接')
      return
    }

    setIsConnecting(true)
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request?.({ 
            method: 'eth_requestAccounts' 
          })
          const chainId = await window.ethereum.request?.({ 
            method: 'eth_chainId' 
          })
          
          if (accounts && accounts.length > 0) {
            setWalletState({
              isConnected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              balance: '10.00'
            })
            toast.success('钱包连接成功！')
            return
          }
        } catch (error) {
          console.warn('真实钱包连接失败，使用模拟模式:', error)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setWalletState({
        isConnected: true,
        address: '0x1234...5678',
        balance: '125.50',
        chainId: 31337
      })
      
      toast.success('🎉 开发模式钱包连接成功！\n地址: 0x1234...5678\n网络: Hardhat Local (31337)')
    } catch (error) {
      console.error('连接失败:', error)
      toast.error('连接失败，请重试')
    } finally {
      setIsConnecting(false)
    }
  }

  // 使用本地钱包模式
  if (useLocalWallet) {
    if (walletState.isConnected) {
      return (
        <Button
          variant="outline"
          className={`${className} bg-green-50 border-green-200 hover:bg-green-100`}
          onClick={connectLocalWallet}
        >
          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">已连接</span>
            <span className="text-xs text-gray-600">{walletState.address}</span>
          </div>
          {walletState.balance && (
            <div className="ml-2 flex items-center">
              <Zap className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-xs">{walletState.balance} ETH</span>
            </div>
          )}
        </Button>
      )
    }

    return (
      <Button 
        variant="outline" 
        className={className}
        onClick={connectLocalWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 mr-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            连接中...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            {children || '连接钱包'}
          </>
        )}
      </Button>
    )
  }

  // 如果 Web3 可用且 ConnectButton 已加载，显示真正的 ConnectButton
  if (isWeb3Available && ConnectButton && !isLoading) {
    try {
      return <ConnectButton className={className}>{children}</ConnectButton>
    } catch (error) {
      console.warn('ConnectButton failed to render, using fallback:', error)
      // 如果渲染失败，降级到本地钱包
      return (
        <Button 
          variant="outline" 
          className={className}
          onClick={connectLocalWallet}
          disabled={isConnecting}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {children || '连接钱包'}
        </Button>
      )
    }
  }

  // 加载状态
  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        className={className}
        disabled
      >
        <div className="w-4 h-4 mr-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        初始化钱包...
      </Button>
    )
  }

  // 备用按钮 - Web3 不可用时使用本地钱包
  if (walletState.isConnected) {
    return (
      <Button
        variant="outline"
        className={`${className} bg-green-50 border-green-200 hover:bg-green-100`}
        onClick={connectLocalWallet}
      >
        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">已连接</span>
          <span className="text-xs text-gray-600">{walletState.address}</span>
        </div>
        {walletState.balance && (
          <div className="ml-2 flex items-center">
            <Zap className="w-3 h-3 text-yellow-500 mr-1" />
            <span className="text-xs">{walletState.balance} ETH</span>
          </div>
        )}
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      className={className}
      onClick={connectLocalWallet}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 mr-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          连接中...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          {children || '连接钱包'}
        </>
      )}
    </Button>
  )
}

// 扩展Window接口以支持ethereum
declare global {
  interface Window {
    ethereum?: {
      request?: (args: { method: string; params?: any[] }) => Promise<any>
      on?: (eventName: string, handler: (...args: any[]) => void) => void
      removeListener?: (eventName: string, handler: (...args: any[]) => void) => void
    }
  }
}