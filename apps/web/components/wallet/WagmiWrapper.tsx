'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

// Simplified wallet data interface
export interface WagmiData {
  address?: string;
  isConnected: boolean;
  connector?: any;
  balance?: any;
  ensName?: string;
  connectors: any[];
  connectError?: Error | null;
  connect: (parameters: any) => void;
  disconnect: () => void;
}

// Default fallback data
const defaultWagmiData: WagmiData = {
  address: undefined,
  isConnected: false,
  connector: undefined,
  balance: undefined,
  ensName: undefined,
  connectors: [],
  connectError: null,
  connect: () => {},
  disconnect: () => {},
};

// Context for sharing wagmi data
const WagmiDataContext = createContext<WagmiData>(defaultWagmiData);

// Hook to use wagmi data safely
export const useWagmiData = () => useContext(WagmiDataContext);

// Safe wrapper that provides default wagmi data
export function SafeWagmiProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiDataContext.Provider value={defaultWagmiData}>
      {children}
    </WagmiDataContext.Provider>
  );
}