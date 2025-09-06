'use client';

/**
 * 安全的Wagmi hooks包装器
 * 提供fallback值以避免在WagmiProvider未初始化时出错
 */

import { useSafeWeb3 } from '../ssr-safe-web3-provider';

// 模拟的空账户状态
const EMPTY_ACCOUNT = {
  address: undefined,
  addresses: undefined,
  chain: undefined,
  chainId: undefined,
  connector: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  isReconnecting: false,
  status: 'disconnected' as const,
};

// 模拟的空余额状态
const EMPTY_BALANCE = {
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  refetch: async () => ({}) as any,
};

// 模拟的空连接状态
const EMPTY_CONNECT = {
  connect: () => {},
  connectAsync: async () => { throw new Error('Web3 not initialized'); },
  connectors: [],
  error: null,
  isError: false,
  isIdle: true,
  isPending: false,
  isSuccess: false,
  reset: () => {},
  status: 'idle' as const,
  variables: undefined,
};

// 模拟的空断开连接状态
const EMPTY_DISCONNECT = {
  disconnect: () => {},
  disconnectAsync: async () => { throw new Error('Web3 not initialized'); },
  error: null,
  isError: false,
  isIdle: true,
  isPending: false,
  isSuccess: false,
  reset: () => {},
  status: 'idle' as const,
  variables: undefined,
};

// 检查是否在Wagmi Provider内部
function isInWagmiProvider(): boolean {
  try {
    // 检查是否存在wagmi provider的标记
    const element = document.querySelector('[data-wagmi-provider]');
    return element?.getAttribute('data-wagmi-provider') !== 'mock';
  } catch {
    return false;
  }
}

// 安全的useAccount hook
export function useSafeAccount() {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider()) {
    return EMPTY_ACCOUNT;
  }

  try {
    // 动态导入并使用原始的useAccount
    const { useAccount } = require('wagmi');
    return useAccount();
  } catch (error) {
    console.warn('useAccount failed, falling back to empty state:', error);
    return EMPTY_ACCOUNT;
  }
}

// 安全的useBalance hook
export function useSafeBalance(config?: { address?: string }) {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider() || !config?.address) {
    return EMPTY_BALANCE;
  }

  try {
    const { useBalance } = require('wagmi');
    return useBalance(config);
  } catch (error) {
    console.warn('useBalance failed, falling back to empty state:', error);
    return EMPTY_BALANCE;
  }
}

// 安全的useConnect hook
export function useSafeConnect() {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider()) {
    return EMPTY_CONNECT;
  }

  try {
    const { useConnect } = require('wagmi');
    return useConnect();
  } catch (error) {
    console.warn('useConnect failed, falling back to empty state:', error);
    return EMPTY_CONNECT;
  }
}

// 安全的useDisconnect hook
export function useSafeDisconnect() {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider()) {
    return EMPTY_DISCONNECT;
  }

  try {
    const { useDisconnect } = require('wagmi');
    return useDisconnect();
  } catch (error) {
    console.warn('useDisconnect failed, falling back to empty state:', error);
    return EMPTY_DISCONNECT;
  }
}

// 安全的useEnsName hook
export function useSafeEnsName(config?: { address?: string }) {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider() || !config?.address) {
    return { data: undefined, error: null, isError: false, isLoading: false, isSuccess: false };
  }

  try {
    const { useEnsName } = require('wagmi');
    return useEnsName(config);
  } catch (error) {
    console.warn('useEnsName failed, falling back to empty state:', error);
    return { data: undefined, error: null, isError: false, isLoading: false, isSuccess: false };
  }
}

// 安全的useReadContract hook
export function useSafeReadContract(config?: any) {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider() || !config) {
    return { data: undefined, error: null, isError: false, isLoading: false, isSuccess: false };
  }

  try {
    const { useReadContract } = require('wagmi');
    return useReadContract(config);
  } catch (error) {
    console.warn('useReadContract failed, falling back to empty state:', error);
    return { data: undefined, error: null, isError: false, isLoading: false, isSuccess: false };
  }
}

// 安全的useWriteContract hook
export function useSafeWriteContract() {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider()) {
    return {
      writeContract: () => {},
      writeContractAsync: async () => { throw new Error('Web3 not initialized'); },
      data: undefined,
      error: null,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      reset: () => {},
      status: 'idle' as const,
      variables: undefined,
    };
  }

  try {
    const { useWriteContract } = require('wagmi');
    return useWriteContract();
  } catch (error) {
    console.warn('useWriteContract failed, falling back to empty state:', error);
    return {
      writeContract: () => {},
      writeContractAsync: async () => { throw new Error('Web3 not initialized'); },
      data: undefined,
      error: null,
      isError: false,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      reset: () => {},
      status: 'idle' as const,
      variables: undefined,
    };
  }
}

// 安全的useWaitForTransactionReceipt hook
export function useSafeWaitForTransactionReceipt(config?: { hash?: string }) {
  const { isWeb3Enabled } = useSafeWeb3();

  if (!isWeb3Enabled || !isInWagmiProvider() || !config?.hash) {
    return { isLoading: false, isSuccess: false, error: null };
  }

  try {
    const { useWaitForTransactionReceipt } = require('wagmi');
    return useWaitForTransactionReceipt(config);
  } catch (error) {
    console.warn('useWaitForTransactionReceipt failed, falling back to empty state:', error);
    return { isLoading: false, isSuccess: false, error: null };
  }
}
