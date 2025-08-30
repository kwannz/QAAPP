'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSafeAccount } from '../../lib/hooks/use-safe-wagmi'
// import { ConnectButton } from '@rainbow-me/rainbowkit' // 暂时禁用避免WagmiProvider错误
import toast from 'react-hot-toast'

import { Button } from '@/components/ui'
import { authApi } from '../../lib/api-client'
import { useAuthStore } from '../../lib/auth-context'

interface Web3LoginSectionProps {
  isRegister?: boolean
  referralCode?: string
}

export function Web3LoginSection({ isRegister = false, referralCode }: Web3LoginSectionProps) {
  // Web3 功能已恢复
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useSafeAccount()
  // 安全的签名函数 - 暂时使用模拟签名
  const signMessageAsync = async (config: any) => {
    try {
      // 检查是否可以访问wagmi
      if (!isConnected || !address) {
        throw new Error('请先连接钱包')
      }
      
      // 模拟签名功能（在实际环境中，这里应该调用真正的签名）
      const message = config.message
      const mockSignature = `0x${Date.now().toString(16).padEnd(130, '0')}`
      
      console.log('模拟签名消息:', message)
      console.log('模拟签名结果:', mockSignature)
      return mockSignature
    } catch (error) {
      throw new Error('钱包签名失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()

  const handleWeb3Auth = async () => {
    if (!address || !isConnected) {
      toast.error('请先连接钱包')
      return
    }

    setIsLoading(true)
    try {
      // 1. 获取签名挑战
      const challengeResponse = await authApi.getWeb3Challenge(address)
      const { challenge } = challengeResponse.data

      // 2. 请求用户签名
      const signature = await signMessageAsync({ 
        message: challenge,
        account: address as `0x${string}`
      })

      // 3. 提交认证请求
      const authRequest = {
        address,
        signature,
        ...(referralCode && { referralCode }),
      }

      const response = isRegister 
        ? await authApi.web3Register(authRequest)
        : await authApi.web3Login(authRequest)

      const { user, accessToken, refreshToken } = response.data

      setUser(user)
      setTokens(accessToken, refreshToken)

      toast.success(isRegister ? '注册成功！' : '登录成功！')

      // 跳转
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
      router.push(redirectUrl)

    } catch (error: any) {
      console.error('Web3 auth error:', error)
      
      if (error.response?.status === 409) {
        if (isRegister) {
          toast.error('该钱包地址已被注册，请直接登录')
        } else {
          toast.error('该钱包地址未注册，请先注册')
        }
      } else if (error.response?.status === 400) {
        toast.error('签名验证失败，请重试')
      } else {
        toast.error(error.response?.data?.message || `${isRegister ? '注册' : '登录'}失败`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <div className="text-center">
          <Button variant="outline" disabled className="w-full">
            连接钱包 (开发中)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Web3功能正在开发中，请使用邮箱{isRegister ? '注册' : '登录'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleWeb3Auth}
        loading={isLoading}
        variant="outline"
        className="w-full"
        size="lg"
      >
        <span className="mr-2">🔗</span>
        {isRegister ? 'Web3注册' : 'Web3登录'}
      </Button>
      
      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
        <span>已连接:</span>
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>
    </div>
  )
}