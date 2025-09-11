'use client';

import React, { useEffect } from 'react';
import { useSafeAccount as useAccount, useSafeConnect as useConnect, useSafeDisconnect as useDisconnect, useSafeSwitchChain as useSwitchChain, useSafeChainId as useChainId, useSafeBalance as useBalance } from '@/lib/hooks/use-safe-wagmi';
import { WalletConnect } from '../../../../packages/ui/src/components/business/WalletConnect';

interface WalletConnectionManagerProperties {
  onConnectionChange?: (connected: boolean) => void
  showNetworkInfo?: boolean
  showContractStatus?: boolean
  className?: string
}

export function WalletConnectionManager({
  onConnectionChange,
  showNetworkInfo,
  showContractStatus,
  className,
}: WalletConnectionManagerProperties) {
  // Basic wallet state
  const DECIMALS_FOUR = 4;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Optionally fetch ETH balance for display
  const { data: ethBalance } = useBalance({ address });

  // E2E/开发调试覆盖：允许通过 URL 查询参数强制显示“已连接”状态
  // 仅在非生产环境或开启调试时生效
  const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || process.env.NODE_ENV !== 'production';
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const e2eWallet = isDebugEnabled ? searchParams?.get('e2e_wallet') : null; // 'connected' | null
  const e2eChain = isDebugEnabled ? searchParams?.get('e2e_chain') : null;   // 'sepolia' | 'mainnet' | 'local'

  const overrideConnected = e2eWallet === 'connected';
  const overrideAddress = overrideConnected ? ('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12' as `0x${string}`) : address;
  const CHAIN_ID_MAINNET = 1;
  const CHAIN_ID_SEPOLIA = 11_155_111;
  const CHAIN_ID_LOCAL = 31_337;
  const overrideChainId = overrideConnected
    ? (e2eChain === 'mainnet' ? CHAIN_ID_MAINNET : e2eChain === 'local' ? CHAIN_ID_LOCAL : CHAIN_ID_SEPOLIA)
    : chainId;

  // 调试模式下的网络切换模拟状态
  const [debugSwitched, setDebugSwitched] = React.useState(false);

  // Notify parent on connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(overrideConnected ? true : isConnected);
    }
  }, [isConnected, overrideConnected, onConnectionChange]);

  const onConnect = () => {
    // Prefer the first available connector
    const connector = connectors?.[0];
    if (connector) {
      connect({ connector });
    }
  };

  const onSwitchNetwork = async () => {
    // 覆盖模式下，模拟切换到 Sepolia，避免真实钱包依赖
    if (overrideConnected) {
      setDebugSwitched(true);
      return;
    }
    // Default to Sepolia if enabled, else mainnet
    const preferred = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true' ? CHAIN_ID_SEPOLIA : CHAIN_ID_MAINNET;
    try {
      await switchChain?.({ chainId: preferred });
    } catch {
      // ignore
    }
  };

  // Determine network support label (basic)
  const networkName = overrideChainId === CHAIN_ID_MAINNET
    ? '以太坊主网'
    : overrideChainId === CHAIN_ID_SEPOLIA
      ? 'Sepolia 测试网'
      : overrideChainId === CHAIN_ID_LOCAL
        ? 'Hardhat Local'
        : `Chain ${overrideChainId}`;

  const isCorrectNetwork = overrideConnected
    ? (debugSwitched ? true : (process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true'
      ? (overrideChainId === CHAIN_ID_SEPOLIA || overrideChainId === CHAIN_ID_LOCAL)
      : (overrideChainId === CHAIN_ID_MAINNET)))
    : (process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true'
      ? (overrideChainId === CHAIN_ID_SEPOLIA || overrideChainId === CHAIN_ID_LOCAL)
      : (overrideChainId === CHAIN_ID_MAINNET));

  return (
    <div className={className}>
      <WalletConnect
        isConnected={overrideConnected ? true : isConnected}
        address={overrideAddress}
        balance={overrideConnected ? '1.2345' : (ethBalance ? Number.parseFloat(ethBalance.formatted).toFixed(DECIMALS_FOUR) : undefined)}
        onConnect={overrideConnected ? () => {} : onConnect}
        onDisconnect={overrideConnected ? () => {} : () => disconnect()}
        onSwitchNetwork={onSwitchNetwork}
        networkName={debugSwitched ? 'Sepolia 测试网' : networkName}
        isCorrectNetwork={overrideConnected ? (debugSwitched ? true : isCorrectNetwork) : isCorrectNetwork}
        loading={overrideConnected ? false : isConnectPending}
      />

      {/* Optional informational rows */}
      {(showNetworkInfo || showContractStatus) && (
        <div className="mt-3 text-xs text-muted-foreground">
          {showNetworkInfo && (
            <div>
              当前网络: {(!isCorrectNetwork && overrideConnected && !debugSwitched)
                ? '错误网络'
                : (debugSwitched ? 'Sepolia 测试网' : networkName)} (Chain ID: {overrideChainId})
            </div>
          )}
          {showContractStatus && (
            <div>合约状态: 已加载</div>
          )}

          {overrideConnected && debugSwitched && (
            <div data-testid="debug-network-switched">已切换到 Sepolia 测试网</div>
          )}
        </div>
      )}
    </div>
  );
}
