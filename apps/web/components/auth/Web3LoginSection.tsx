'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useSignMessage } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui'
import { authApi } from '../../lib/api-client'
import { useAuthStore } from '../../lib/auth-store'

interface Web3LoginSectionProps {
  isRegister?: boolean
  referralCode?: string
}

export function Web3LoginSection({ isRegister = false, referralCode }: Web3LoginSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
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
          <ConnectButton />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          连接钱包后即可使用Web3{isRegister ? '注册' : '登录'}
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