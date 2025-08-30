'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole, KycStatus } from '@qa-app/shared'
import { tokenManager } from './token-manager'

export interface User {
  id: string
  email?: string
  role: UserRole
  kycStatus: KycStatus
  referralCode: string
  isActive: boolean
  wallets?: Array<{
    id: string
    address: string
    chainId: number
    isPrimary: boolean
    label?: string
  }>
  agent?: {
    id: string
    referralCode: string
  }
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  // 状态
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // 操作
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  
  // 钱包相关
  updateWallets: (wallets: User['wallets']) => void
  setPrimaryWallet: (walletId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 开发模式默认用户
const DEV_DEFAULT_USER: User = {
  id: 'dev-user-001',
  email: 'dev@qaapp.com',
  role: 'ADMIN' as UserRole,
  kycStatus: 'APPROVED' as KycStatus,
  referralCode: 'DEV001',
  isActive: true,
  wallets: [
    {
      id: 'wallet-001',
      address: '0x742d35Cc6486C45F9B9E9aA8E14D9a1e5BAF5F1A',
      chainId: 1,
      isPrimary: true,
      label: 'Development Wallet'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isDevelopmentMode = process.env.NODE_ENV === 'development'
  
  // 初始状态 - 开发模式下自动认证
  const [user, setUserState] = useState<User | null>(isDevelopmentMode ? DEV_DEFAULT_USER : null)
  const [accessToken, setAccessToken] = useState<string | null>(isDevelopmentMode ? 'dev-token-12345' : null)
  const [refreshToken, setRefreshToken] = useState<string | null>(isDevelopmentMode ? 'dev-refresh-token-12345' : null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isDevelopmentMode)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 从localStorage恢复状态（仅客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('qa-auth-storage')
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          if (parsedState.user) {
            setUserState(parsedState.user)
            setAccessToken(parsedState.accessToken)
            setRefreshToken(parsedState.refreshToken)
            setIsAuthenticated(parsedState.isAuthenticated || false)
            // 同步到token管理器
            tokenManager.setTokens(parsedState.accessToken, parsedState.refreshToken)
          }
        }
      } catch (error) {
        console.warn('Failed to restore auth state:', error)
      }
    }
  }, [])

  // 保存状态到localStorage
  const saveToStorage = (state: {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
  }) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('qa-auth-storage', JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save auth state:', error)
      }
    }
  }

  // 设置用户信息
  const setUser = (newUser: User) => {
    setUserState(newUser)
    setIsAuthenticated(true)
    saveToStorage({
      user: newUser,
      accessToken,
      refreshToken,
      isAuthenticated: true
    })
  }

  // 设置令牌
  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)
    setIsAuthenticated(true)
    // 同步到token管理器
    tokenManager.setTokens(newAccessToken, newRefreshToken)
    saveToStorage({
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      isAuthenticated: true
    })
  }

  // 清除认证信息
  const clearAuth = () => {
    setUserState(null)
    setAccessToken(null)
    setRefreshToken(null)
    setIsAuthenticated(false)
    setIsLoading(false)
    // 同步到token管理器
    tokenManager.clearTokens()
    saveToStorage({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    })
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  // 更新钱包信息
  const updateWallets = (wallets: User['wallets']) => {
    if (user) {
      const updatedUser = { ...user, wallets }
      setUserState(updatedUser)
      saveToStorage({
        user: updatedUser,
        accessToken,
        refreshToken,
        isAuthenticated
      })
    }
  }

  // 设置主钱包
  const setPrimaryWallet = (walletId: string) => {
    if (user?.wallets) {
      const updatedWallets = user.wallets.map(wallet => ({
        ...wallet,
        isPrimary: wallet.id === walletId,
      }))
      
      const updatedUser = { ...user, wallets: updatedWallets }
      setUserState(updatedUser)
      saveToStorage({
        user: updatedUser,
        accessToken,
        refreshToken,
        isAuthenticated
      })
    }
  }

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    clearAuth,
    setLoading,
    updateWallets,
    setPrimaryWallet,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthStore(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}