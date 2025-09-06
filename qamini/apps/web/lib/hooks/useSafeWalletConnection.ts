'use client';

import { useState, useCallback } from 'react';

export interface WalletConnectionState {

  // 连接状态
  isConnected: boolean
  isConnecting: boolean
  address?: string

  // 网络信息
  chainId?: number
  networkName?: string
  isNetworkSupported: boolean

  // 余额信息
  ethBalance?: string
  isBalanceLoading: boolean

  // 错误状态
  error?: string
}

export interface WalletConnectionActions {

  // 连接操作
  openConnectModal: () => void
  openAccountModal: () => void
  openChainModal: () => void
  disconnect: () => void

  // 网络切换
  switchToChain: (chainId: number) => Promise<void>
  switchToSupportedChain: () => Promise<void>

  // 工具方法
  formatAddress: (addr?: string) => string
  getExplorerUrl: (txHash?: string) => string | null
  clearError: () => void
}

// SSR安全的默认状态
const defaultState: WalletConnectionState = {
  isConnected: false,
  isConnecting: false,
  address: undefined,
  chainId: undefined,
  networkName: undefined,
  isNetworkSupported: false,
  ethBalance: undefined,
  isBalanceLoading: false,
  error: undefined,
};

// SSR安全的默认操作
const createDefaultActions = (setError: (error?: string) => void): WalletConnectionActions => ({
  openConnectModal: () => {
    console.warn('钱包连接功能暂时禁用 - Web3 未初始化');
    setError('钱包连接功能暂时禁用');
  },
  openAccountModal: () => {
    console.warn('账户管理功能暂时禁用 - Web3 未初始化');
  },
  openChainModal: () => {
    console.warn('网络选择功能暂时禁用 - Web3 未初始化');
  },
  disconnect: () => {
    console.warn('断开连接功能暂时禁用 - Web3 未初始化');
  },
  switchToChain: async () => {
    console.warn('网络切换功能暂时禁用 - Web3 未初始化');
    setError('网络切换功能暂时禁用');
  },
  switchToSupportedChain: async () => {
    console.warn('网络切换功能暂时禁用 - Web3 未初始化');
    setError('网络切换功能暂时禁用');
  },
  formatAddress: (addr?: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  },
  getExplorerUrl: () => null,
  clearError: () => setError(undefined),
});

export function useSafeWalletConnection(): [WalletConnectionState, WalletConnectionActions] {
  const [error, setError] = useState<string>();

  // 检查是否在浏览器环境
  const isBrowser = typeof window !== 'undefined';

  // 在服务器端或Web3未初始化时使用安全默认值
  if (!isBrowser) {
    return [
      defaultState,
      createDefaultActions(setError),
    ];
  }

  // 浏览器端尝试使用实际的钱包连接
  try {
    // 动态导入实际的钱包连接hook
    // 如果import失败，回退到默认状态
    const { useWalletConnection } = require('./useWalletConnection');
    return useWalletConnection();
  } catch (error_) {
    console.warn('WalletConnection hook not available, using safe defaults:', error_);
    return [
      { ...defaultState, error },
      createDefaultActions(setError),
    ];
  }
}

// 简化版 Hook，只返回连接状态
export function useSafeWalletStatus() {
  const [state] = useSafeWalletConnection();
  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    address: state.address,
    chainId: state.chainId,
    isNetworkSupported: state.isNetworkSupported,
    ethBalance: state.ethBalance,
  };
}

// 网络状态 Hook
export function useSafeNetworkStatus() {
  const [state, actions] = useSafeWalletConnection();
  return {
    chainId: state.chainId,
    networkName: state.networkName,
    isNetworkSupported: state.isNetworkSupported,
    switchToChain: actions.switchToChain,
    switchToSupportedChain: actions.switchToSupportedChain,
    openChainModal: actions.openChainModal,
  };
}
