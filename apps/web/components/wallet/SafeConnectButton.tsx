'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { LocalWalletButton } from './LocalWalletButton'

interface SafeConnectButtonProps {
  className?: string
  children?: React.ReactNode
}

export function SafeConnectButton({ className, children }: SafeConnectButtonProps) {
  const [isWeb3Available, setIsWeb3Available] = useState(false)
  const [ConnectButton, setConnectButton] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [useLocalWallet, setUseLocalWallet] = useState(false)

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

  // 使用本地钱包模式
  if (useLocalWallet) {
    return <LocalWalletButton className={className}>{children}</LocalWalletButton>
  }

  // 如果 Web3 可用且 ConnectButton 已加载，显示真正的 ConnectButton
  if (isWeb3Available && ConnectButton && !isLoading) {
    try {
      return <ConnectButton className={className}>{children}</ConnectButton>
    } catch (error) {
      console.warn('ConnectButton failed to render, using fallback:', error)
      // 如果渲染失败，降级到本地钱包
      return <LocalWalletButton className={className}>{children}</LocalWalletButton>
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
  return <LocalWalletButton className={className}>{children}</LocalWalletButton>
}