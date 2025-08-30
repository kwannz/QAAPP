'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, CheckCircle, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface LocalWalletButtonProps {
  className?: string
  children?: React.ReactNode
}

// 模拟本地钱包状态
interface MockWalletState {
  isConnected: boolean
  address?: string
  balance?: string
  chainId?: number
}

export function LocalWalletButton({ className, children }: LocalWalletButtonProps) {
  const [walletState, setWalletState] = useState<MockWalletState>({
    isConnected: false
  })
  const [isConnecting, setIsConnecting] = useState(false)

  // 模拟连接钱包
  const connectWallet = async () => {
    if (walletState.isConnected) {
      // 断开连接
      setWalletState({ isConnected: false })
      toast.success('钱包已断开连接')
      return
    }

    setIsConnecting(true)
    try {
      // 检查是否有window.ethereum (MetaMask等)
      if (typeof window !== 'undefined' && window.ethereum) {
        // 尝试真实连接
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
              balance: '10.00' // 模拟余额
            })
            toast.success('钱包连接成功！')
            return
          }
        } catch (error) {
          console.warn('真实钱包连接失败，使用模拟模式:', error)
        }
      }

      // 模拟连接延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟连接成功
      setWalletState({
        isConnected: true,
        address: '0x1234...5678',
        balance: '125.50',
        chainId: 31337 // Hardhat本地网络
      })
      
      toast.success('🎉 开发模式钱包连接成功！\n地址: 0x1234...5678\n网络: Hardhat Local (31337)')
    } catch (error) {
      console.error('连接失败:', error)
      toast.error('连接失败，请重试')
    } finally {
      setIsConnecting(false)
    }
  }

  // 如果已连接，显示钱包信息按钮
  if (walletState.isConnected) {
    return (
      <Button
        variant="outline"
        className={`${className} bg-green-50 border-green-200 hover:bg-green-100`}
        onClick={connectWallet}
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

  // 连接按钮
  return (
    <Button 
      variant="outline" 
      className={className}
      onClick={connectWallet}
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