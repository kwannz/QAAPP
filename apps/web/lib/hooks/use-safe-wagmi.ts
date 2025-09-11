'use client';

/**
 * 安全的Wagmi hooks包装器
 * 提供fallback值以避免在WagmiProvider未初始化时出错
 */

import { useAccount, useBalance, useConnect, useDisconnect, useEnsName, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { useSafeWeb3 as _useSafeWeb3 } from '../ssr-safe-web3-provider';

// 模拟状态（仅在无 Provider 极端场景使用；正常情况下由 MockWagmiProvider 兜底）
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

// 是否启用 Web3（用于返回最小安全对象，但不改变 Hooks 调用顺序）
function isWeb3Active(): boolean {
  try {
    const element = document.querySelector('[data-wagmi-provider]');
    return Boolean(element);
  } catch {
    return false;
  }
}

// 安全的useChainId hook
export function useSafeChainId(): number | undefined {
  try {
    const chainId = useChainId();
    return chainId;
  } catch {
    return undefined;
  }
}

// 安全的useSwitchChain hook
export function useSafeSwitchChain() {
  try {
    return useSwitchChain();
  } catch {
    return { switchChain: () => {}, isPending: false } as any;
  }
}

// 安全的useAccount hook
export function useSafeAccount() {
  try {
    // 尝试调用 wagmi 的 useAccount，如果未注入 Provider 会抛错
    const account = useAccount();
    if (!isWeb3Active()) return { ...EMPTY_ACCOUNT, ...account } as any;
    return account as any;
  } catch {
    // 未提供 WagmiProvider 时，返回安全的空对象，避免 500 错误
    return { ...EMPTY_ACCOUNT } as any;
  }
}

// 安全的useBalance hook
export function useSafeBalance(config?: { address?: string }) {
  try {
    const result = useBalance({
      address: config?.address as any,
      query: {
        enabled: Boolean(config?.address),
        refetchInterval: 10_000,
      },
    } as any);
    if (!config?.address || !isWeb3Active()) {
      return { ...EMPTY_BALANCE, ...result } as any;
    }
    return result as any;
  } catch {
    return { ...EMPTY_BALANCE } as any;
  }
}

// 安全的useConnect hook
export function useSafeConnect() {
  try {
    const res = useConnect();
    if (!isWeb3Active()) return { ...EMPTY_CONNECT, ...res } as any;
    return res as any;
  } catch {
    return { ...EMPTY_CONNECT } as any;
  }
}

// 安全的useDisconnect hook
export function useSafeDisconnect() {
  try {
    const res = useDisconnect();
    if (!isWeb3Active()) return { ...EMPTY_DISCONNECT, ...res } as any;
    return res as any;
  } catch {
    return { ...EMPTY_DISCONNECT } as any;
  }
}

// 安全的useEnsName hook
export function useSafeEnsName(config?: { address?: string }) {
  try {
    const res = useEnsName(config as any);
    return res as any;
  } catch {
    return { data: undefined, isLoading: false, isError: false } as any;
  }
}

// 安全的useReadContract hook
export function useSafeReadContract(config?: any) {
  try {
    const res = useReadContract(config as any);
    return res as any;
  } catch {
    return { data: undefined, isLoading: false, isError: false } as any;
  }
}

// 安全的useWriteContract hook
export function useSafeWriteContract() {
  try {
    const res = useWriteContract();
    return res as any;
  } catch {
    return { writeContract: () => {}, isPending: false } as any;
  }
}

// 安全的useWaitForTransactionReceipt hook
export function useSafeWaitForTransactionReceipt(config?: { hash?: string }) {
  try {
    const res = useWaitForTransactionReceipt(config as any);
    return res as any;
  } catch {
    return { data: undefined, isLoading: false } as any;
  }
}
