'use client';

import React from 'react';
import { Button } from '@/components/ui';

// 临时的简化钱包组件，避免 wagmi 导入问题
export interface WalletSystemProperties {
  variant?: 'button' | 'manager' | 'full';
  onConnectionChange?: (isConnected: boolean, chainId?: number) => void;
  showNetworkInfo?: boolean;
  showContractStatus?: boolean;
  showTransactionHistory?: boolean;
  showBalanceDetails?: boolean;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function WalletSystem({
  variant = 'manager',
  className = '',
  children,
}: WalletSystemProperties) {
  if (variant === 'button') {
    return (
      <Button variant="outline" className={className} disabled>
        {children || '连接钱包 (暂时禁用)'}
      </Button>
    );
  }

  return (
    <div className={className}>
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">
          钱包功能正在维护中，请稍后再试。
        </p>
      </div>
    </div>
  );
}

// 向后兼容的导出
export function WalletConnectionManager(properties: Omit<WalletSystemProperties, 'variant'>) {
  return <WalletSystem {...properties} variant="manager" />;
}

export function SafeConnectButton(properties: Omit<WalletSystemProperties, 'variant'>) {
  return <WalletSystem {...properties} variant="button" />;
}

export function WalletManager(properties: Omit<WalletSystemProperties, 'variant'>) {
  return <WalletSystem {...properties} variant="full" />;
}

export function useWalletManager() {
  return {
    isEnabled: false,
    isConnected: false,
    address: undefined,
    hasWallet: false,
  };
}