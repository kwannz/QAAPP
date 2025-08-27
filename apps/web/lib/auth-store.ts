import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole, KycStatus } from '@qa-app/shared'

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

export interface AuthState {
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

// 开发模式默认用户
const DEV_DEFAULT_USER: User = {
  id: 'dev-user-001',
  email: 'dev@qaapp.com',
  role: 'USER' as UserRole,
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

// 检查是否为开发模式
const isDevelopmentMode = process.env.NODE_ENV === 'development'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态 - 开发模式下自动认证
      user: isDevelopmentMode ? DEV_DEFAULT_USER : null,
      accessToken: isDevelopmentMode ? 'dev-token-12345' : null,
      refreshToken: isDevelopmentMode ? 'dev-refresh-token-12345' : null,
      isAuthenticated: isDevelopmentMode,
      isLoading: false,

      // 设置用户信息
      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true 
        })
      },

      // 设置令牌
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ 
          accessToken, 
          refreshToken,
          isAuthenticated: true 
        })
      },

      // 清除认证信息
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // 更新钱包信息
      updateWallets: (wallets: User['wallets']) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              wallets,
            }
          })
        }
      },

      // 设置主钱包
      setPrimaryWallet: (walletId: string) => {
        const currentUser = get().user
        if (currentUser?.wallets) {
          const updatedWallets = currentUser.wallets.map(wallet => ({
            ...wallet,
            isPrimary: wallet.id === walletId,
          }))
          
          set({
            user: {
              ...currentUser,
              wallets: updatedWallets,
            }
          })
        }
      },
    }),
    {
      name: 'qa-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)