'use client';

import { useWalletConnection } from './useWalletConnection';
import type { WalletConnectionState, WalletConnectionActions } from './useWalletConnection';

export type { WalletConnectionState, WalletConnectionActions };

// 安全封装：保持 Hook 调用顺序稳定，直接复用底层连接 Hook
export function useSafeWalletConnection(): [WalletConnectionState, WalletConnectionActions] {
  return useWalletConnection();
}

// 简化版 Hook：仅返回连接状态
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

// 网络状态 Hook：转发核心动作
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
