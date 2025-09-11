'use client';

import type { UserRole, KycStatus } from '@qa-app/shared';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { tokenManager } from './token-manager';
import { logger } from './verbose-logger';

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
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean }>
  logout: () => void
  register: (userData: { email: string; password: string; name?: string }) => Promise<{ success: boolean }>

  // 钱包相关
  updateWallets: (wallets: User['wallets']) => void
  setPrimaryWallet: (walletId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 开发模式默认用户
const _DEV_DEFAULT_USER: User = {
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
      label: 'Development Wallet',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AuthProviderProperties {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProperties) {
  // 初始状态 - 始终从localStorage恢复或为空
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Start in loading state to allow auth restoration before route guards run
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 从localStorage恢复状态（仅客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('qa-auth-storage');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          if (parsedState.user) {
            setUserState(parsedState.user);
            setAccessToken(parsedState.accessToken);
            setRefreshToken(parsedState.refreshToken);
            setIsAuthenticated(parsedState.isAuthenticated || false);

            // 同步到token管理器
            tokenManager.setTokens(parsedState.accessToken, parsedState.refreshToken);
          }
        }
      } catch (error) {
        logger.warn('AuthContext', 'Failed to restore auth state', { error });
      } finally {
        // Hydration complete; allow route guards to run
        setIsLoading(false);
      }
    } else {
      // On server, we are not loading
      setIsLoading(false);
    }
  }, []);

  // 保存状态到localStorage
  const saveToStorage = (state: {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
  }) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('qa-auth-storage', JSON.stringify(state));
      } catch (error) {
        logger.warn('AuthContext', 'Failed to save auth state', { error });
      }
    }
  };

  // 设置用户信息
  const setUser = (newUser: User) => {
    setUserState(newUser);
    setIsAuthenticated(true);
    saveToStorage({
      user: newUser,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  };

  // 设置令牌
  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setIsAuthenticated(true);

    // 同步到token管理器
    tokenManager.setTokens(newAccessToken, newRefreshToken);
    saveToStorage({
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      isAuthenticated: true,
    });
  };

  // 清除认证信息
  const clearAuth = () => {
    setUserState(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setIsLoading(false);

    // 同步到token管理器
    tokenManager.clearTokens();
    saveToStorage({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  };

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  // 更新钱包信息
  const updateWallets = (wallets: User['wallets']) => {
    if (user) {
      const updatedUser = { ...user, wallets };
      setUserState(updatedUser);
      saveToStorage({
        user: updatedUser,
        accessToken,
        refreshToken,
        isAuthenticated,
      });
    }
  };

  // 设置主钱包
  const setPrimaryWallet = (walletId: string) => {
    if (user?.wallets) {
      const updatedWallets = user.wallets.map(wallet => ({
        ...wallet,
        isPrimary: wallet.id === walletId,
      }));

      const updatedUser = { ...user, wallets: updatedWallets };
      setUserState(updatedUser);
      saveToStorage({
        user: updatedUser,
        accessToken,
        refreshToken,
        isAuthenticated,
      });
    }
  };

  // 登录方法
  const login = async (credentials: { email: string; password: string }): Promise<{ success: boolean }> => {
    setLoading(true);
    try {
      // 导入apiClient（避免循环依赖）
      const { authApi } = await import('./api-client');
      
      // 调用实际的API
      const response = await authApi.login(credentials);
      
      if (response.data?.success && response.data?.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // 设置用户状态
        const userData: User = {
          id: user.id,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          referralCode: user.referralCode || '',
          isActive: true,
          wallets: user.walletAddress ? [{
            id: 'wallet-001',
            address: user.walletAddress,
            chainId: 1,
            isPrimary: true,
            label: 'Primary Wallet',
          }] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUserState(userData);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setIsAuthenticated(true);

        // 同步到token管理器
        tokenManager.setTokens(accessToken, refreshToken);

        saveToStorage({
          user: userData,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        return { success: true };
      }
      
      throw new Error('Login failed: Invalid response');
    } catch (error: any) {
      logger.error('AuthContext', 'Login failed', { error });
      // 重新抛出错误，让UI处理
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 注销方法
  const logout = () => {
    clearAuth();
  };

  // 注册方法
  const register = async (
    userData: { email: string; password: string; name?: string; referralCode?: string }
  ): Promise<{ success: boolean }> => {
    setLoading(true);
    try {
      // 导入apiClient（避免循环依赖）
      const { authApi } = await import('./api-client');
      
      // 调用实际的API
      const response = await authApi.register({
        email: userData.email,
        password: userData.password,
        referralCode: userData.referralCode,
      });
      
      if (response.data?.success && response.data?.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // 设置用户状态
        const newUser: User = {
          id: user.id,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          referralCode: user.referralCode || '',
          isActive: true,
          wallets: user.walletAddress ? [{
            id: 'wallet-001',
            address: user.walletAddress,
            chainId: 1,
            isPrimary: true,
            label: 'Primary Wallet',
          }] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUserState(newUser);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setIsAuthenticated(true);

        // 同步到token管理器
        tokenManager.setTokens(accessToken, refreshToken);

        saveToStorage({
          user: newUser,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        return { success: true };
      }
      
      throw new Error('Registration failed: Invalid response');
    } catch (error: any) {
      logger.error('AuthContext', 'Registration failed', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
    login,
    logout,
    register,
    updateWallets,
    setPrimaryWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthStore(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
}

// Export alias for backward compatibility
export const useAuth = useAuthStore;
