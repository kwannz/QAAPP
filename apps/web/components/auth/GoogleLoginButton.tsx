'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/lib/auth-context'
import { toast } from 'sonner'

// 声明 Google API 类型
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginButtonProps {
  className?: string
  disabled?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GoogleLoginButton({
  className,
  disabled,
  onSuccess,
  onError
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setTokens } = useAuthStore()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    
    try {
      // 使用 Google Identity Services API
      if (!window.google) {
        throw new Error('Google SDK 未加载')
      }

      // 初始化 Google OAuth
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: async (response: any) => {
          try {
            const backendResponse = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: response.credential }),
            })
            
            if (!backendResponse.ok) {
              const error = await backendResponse.json()
              throw new Error(error.message || 'Google登录失败')
            }

            const data = await backendResponse.json()
            
            // 更新认证状态
            setUser(data.user)
            setTokens(data.accessToken, data.refreshToken)
            
            toast.success('Google登录成功！')
            onSuccess?.()
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Google登录失败'
            toast.error(errorMessage)
            onError?.(errorMessage)
          } finally {
            setIsLoading(false)
          }
        }
      })

      // 显示 Google 登录弹窗
      window.google.accounts.id.prompt()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google登录失败'
      toast.error(errorMessage)
      onError?.(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className={`w-full ${className}`}
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>登录中...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>使用 Google 登录</span>
        </div>
      )}
    </Button>
  )
}