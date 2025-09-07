'use client';

import { useState, useEffect, useCallback } from 'react';
import { isSupportedChain, getChainInfo, supportedChainIds } from '../wagmi-config';
import { useSafeToast } from '../use-safe-toast';
import { useSafeAccount, useSafeBalance, useSafeConnect, useSafeChainId, useSafeSwitchChain } from './use-safe-wagmi';


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

export function useWalletConnection(): [WalletConnectionState, WalletConnectionActions] {
  const toast = useSafeToast();

  // 顶层稳定获取账户与链状态（使用安全封装）
  const account = useSafeAccount();
  const { address, isConnected, isConnecting } = account as any;
  const chainId = useSafeChainId();
  const { switchChain, isPending: _isSwitchPending, error: switchError } = useSafeSwitchChain() as any;

  // 连接/断开（安全封装）
  const connectHook = useSafeConnect() as any;
  const isConnectPending = connectHook.isPending || false;
  const connectError = connectHook.error || null;

  // 余额（安全封装）
  const balanceHook = useSafeBalance({ address });
  const balanceData = (balanceHook as any)?.data;
  const isBalanceLoading = (balanceHook as any)?.isLoading || false;
  // const refetchBalance = (balanceHook as any)?.refetch || (async () => {});

  const [error, setError] = useState<string>();
  const [lastConnectedChain, setLastConnectedChain] = useState<number>();

  // 监听连接错误
  useEffect(() => {
    if (connectError) {
      setError(`连接失败: ${connectError.message}`);
      toast.error(`钱包连接失败: ${connectError.message}`);
    }
  }, [connectError, toast]);

  // 监听切链错误
  useEffect(() => {
    if (switchError) {
      setError(`网络切换失败: ${switchError.message}`);
      toast.error(`网络切换失败: ${switchError.message}`);
    }
  }, [switchError, toast]);

  // 监听网络变化
  useEffect(() => {
    if (chainId && isConnected) {
      const chainInfo = getChainInfo(chainId);
      if (chainInfo) {
        toast.success(`已连接到 ${chainInfo.name}`);
        setLastConnectedChain(chainId);
      } else if (!isSupportedChain(chainId)) {
        toast.error(`不支持的网络 (Chain ID: ${chainId})`);
      }

      // 清除之前的错误
      setError(undefined);
    }
  }, [chainId, isConnected, toast]);

  // 监听连接状态变化（放在依赖定义之后，避免 TS 报错）

  // 格式化地址显示
  const ADDRESS_PREFIX_LEN = 6;
  const ADDRESS_SUFFIX_LEN = 4;
  const formatAddress = useCallback((addr?: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, ADDRESS_PREFIX_LEN)}...${addr.slice(-ADDRESS_SUFFIX_LEN)}`;
  }, []);

  // 获取浏览器链接
  const getExplorerUrl = useCallback((txHash?: string): string | null => {
    if (!chainId) return null;

    const chainInfo = getChainInfo(chainId);
    if (!chainInfo) return null;

    const baseUrl = chainInfo.explorerUrl;
    if (txHash) {
      return `${baseUrl}/tx/${txHash}`;
    }
    return baseUrl;
  }, [chainId]);

  // 切换到指定链
  const switchToChain = useCallback(async (targetChainId: number) => {
    if (!switchChain) {
      setError('不支持网络切换');
      return;
    }

    if (!isSupportedChain(targetChainId)) {
      setError(`不支持的网络 ID: ${targetChainId}`);
      return;
    }

    try {
      setError(undefined);
      await switchChain({ chainId: targetChainId });
      toast.success('正在切换到网络...');
    } catch (error_: any) {
      const errorMessage = error_?.message || '网络切换失败';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error_;
    }
  }, [switchChain, toast]);

  // 切换到支持的链（自动选择最佳链）
  const switchToSupportedChain = useCallback(async () => {
    // 优先切换到 Sepolia 测试网（如果启用了测试网）
    const CHAIN_ID_SEPOLIA_NUM = 11_155_111; // Sepolia
    const CHAIN_ID_MAINNET = 1; // Ethereum mainnet
    const preferredChainId = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true'
      ? CHAIN_ID_SEPOLIA_NUM
      : CHAIN_ID_MAINNET;

    if (supportedChainIds.includes(preferredChainId)) {
      await switchToChain(preferredChainId);
    } else {
      // 回退到第一个支持的链
      await switchToChain(supportedChainIds[0]);
    }
  }, [switchToChain]);

  // 监听连接状态变化（在依赖定义之后）
  useEffect(() => {
    if (isConnected && address) {
      toast.success(`钱包已连接: ${formatAddress(address)}`);

      // 恢复到上次使用的链
      if (lastConnectedChain && chainId !== lastConnectedChain && isSupportedChain(lastConnectedChain)) {
        switchToChain(lastConnectedChain);
      }
    }
  }, [isConnected, address, toast, lastConnectedChain, chainId, switchToChain, formatAddress]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // 计算网络信息
  const networkName = chainId ? getChainInfo(chainId)?.name : undefined;
  const isNetworkSupported = chainId ? isSupportedChain(chainId) : false;

  // 状态对象
  const DECIMALS_FOUR = 4;
  const state: WalletConnectionState = {
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    address,
    chainId,
    networkName,
    isNetworkSupported,
    ethBalance: balanceData ? Number.parseFloat(balanceData.formatted).toFixed(DECIMALS_FOUR) : undefined,
    isBalanceLoading,
    error,
  };

  // 操作对象
  const actions: WalletConnectionActions = {
    openConnectModal: () => {},
    openAccountModal: () => {},
    openChainModal: () => {},
    disconnect: (connectHook.disconnect as any) || (() => {}),
    switchToChain,
    switchToSupportedChain,
    formatAddress,
    getExplorerUrl,
    clearError,
  };

  return [state, actions];
}

// 简化版 Hook，只返回连接状态
export function useWalletStatus() {
  const [state] = useWalletConnection();
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
export function useNetworkStatus() {
  const [state, actions] = useWalletConnection();
  return {
    chainId: state.chainId,
    networkName: state.networkName,
    isNetworkSupported: state.isNetworkSupported,
    switchToChain: actions.switchToChain,
    switchToSupportedChain: actions.switchToSupportedChain,
    openChainModal: actions.openChainModal,
  };
}
