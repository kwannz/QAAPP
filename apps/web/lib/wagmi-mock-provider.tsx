'use client';

import { createContext, useContext, type ReactNode } from 'react';

// Mock Wagmi config structure
const mockWagmiConfig = {
  chains: [],
  connectors: [],
  transports: {},
  state: {
    connections: new Map(),
    chainId: undefined,
    status: 'disconnected' as const,
  },
};

// Mock Wagmi Context
const WagmiMockContext = createContext(mockWagmiConfig);

// Mock useConfig hook that prevents "useConfig must be used within WagmiProvider" errors
export const useConfig = () => {
  return useContext(WagmiMockContext);
};

// Mock useAccount hook
export const useAccount = () => ({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  chain: undefined,
  chainId: undefined,
  connector: undefined,
});

// Mock useChainId hook
export const useChainId = () => undefined;

// Mock useConnect hook
export const useConnect = () => ({
  connect: () => Promise.reject(new Error('Web3 not available in fallback mode')),
  connectors: [],
  error: null,
  isLoading: false,
  pendingConnector: undefined,
});

// Mock useDisconnect hook
export const useDisconnect = () => ({
  disconnect: () => Promise.resolve(),
  isLoading: false,
});

// Mock WagmiProvider component for fallback
export function MockWagmiProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiMockContext.Provider value={mockWagmiConfig}>
      <div data-wagmi-provider="mock-fallback">
        {children}
      </div>
    </WagmiMockContext.Provider>
  );
}

// Export mock functions for potential use
export const mockWagmiHooks = {
  useConfig,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
};