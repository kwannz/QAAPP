'use client';

import { useState, useEffect } from 'react';
import { isBrowserEnvironment } from '../../lib/browser-polyfills';
import { Button } from '@/components/ui';
import { logger } from '@/lib/verbose-logger';

export function SafeConnectButton() {
  const [ConnectButton, setConnectButton] = useState<any>(null);
  const [isWagmiAvailable, setIsWagmiAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConnectButton = async () => {
      if (!isBrowserEnvironment()) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to detect if we're in a real WagmiProvider context (not mock)
        const _wagmiModule = await import('wagmi');
        const rainbowkitModule = await import('@rainbow-me/rainbowkit');
        
        // Check if we're in a real Wagmi context by examining the DOM
        const wagmiProvider = document.querySelector('[data-wagmi-provider]');
        const isRealWagmi = wagmiProvider?.getAttribute('data-wagmi-provider') === 'active';
        
        if (isRealWagmi) {
          // Only use real ConnectButton if we have active Wagmi context
          setConnectButton(() => rainbowkitModule.ConnectButton);
          setIsWagmiAvailable(true);
        } else {
          // We're in fallback mode - use mock button
          setIsWagmiAvailable(false);
        }
        setIsLoading(false);
      } catch {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('SafeConnectButton', 'WagmiProvider context not available, using fallback button');
        }
        setIsWagmiAvailable(false);
        setIsLoading(false);
      }
    };

    loadConnectButton();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-10 w-32 animate-pulse bg-muted rounded-lg" />
    );
  }

  // Fallback when Wagmi is not available
  if (!isWagmiAvailable || !ConnectButton) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          // Provide user feedback that Web3 is not available
          if (process.env.NODE_ENV === 'development') {
            logger.info('SafeConnectButton', 'Web3 wallet connection is not available in fallback mode');
          }
        }}
        title="Web3 功能暂不可用"
      >
        连接钱包
      </Button>
    );
  }

  // Render the actual ConnectButton when Wagmi context is available
  try {
    return <ConnectButton />;
  } catch (error) {
    logger.warn('SafeConnectButton', 'ConnectButton render error, falling back to safe button', { error });
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        title="Web3 连接错误"
      >
        连接钱包
      </Button>
    );
  }
}
