'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

interface SafeConnectButtonProps {
  className?: string
  children?: React.ReactNode
}

export function SafeConnectButton({ className, children }: SafeConnectButtonProps) {
  const [isWeb3Available, setIsWeb3Available] = useState(false)
  const [ConnectButton, setConnectButton] = useState<any>(null)

  useEffect(() => {
    // 尝试动态加载 RainbowKit ConnectButton
    const loadConnectButton = async () => {
      try {
        const { ConnectButton: RainbowConnectButton } = await import('@rainbow-me/rainbowkit')
        setConnectButton(() => RainbowConnectButton)
        setIsWeb3Available(true)
      } catch (error) {
        console.warn('RainbowKit not available, using fallback button:', error)
        setIsWeb3Available(false)
      }
    }

    loadConnectButton()
  }, [])

  // 如果 Web3 可用且 ConnectButton 已加载，显示真正的 ConnectButton
  if (isWeb3Available && ConnectButton) {
    try {
      return <ConnectButton className={className}>{children}</ConnectButton>
    } catch (error) {
      console.warn('ConnectButton failed to render, using fallback:', error)
      // 如果渲染失败，降级到备用按钮
    }
  }

  // 备用按钮 - Web3 不可用或 ConnectButton 无法渲染时使用
  return (
    <Button 
      variant="outline" 
      className={className}
      onClick={() => {
        console.warn('钱包连接功能暂时禁用 - Web3 未完全初始化')
        // TODO: 可以显示一个提示模态框
      }}
      disabled
    >
      <Wallet className="w-4 h-4 mr-2" />
      连接钱包 (暂时禁用)
    </Button>
  )
}