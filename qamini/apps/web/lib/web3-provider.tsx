'use client';

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';

import { ClientOnly } from '../components/ClientOnly';

// RainbowKit CSS imports
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProviderProperties {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProperties) {
  const [wagmiConfig, setWagmiConfig] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分钟
            retry: (failureCount, error) => {
              // Web3相关错误不重试
              if (error?.message?.includes('user rejected')
                  || error?.message?.includes('User denied')) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      }),
  );

  useEffect(() => {
    // 动态加载RainbowKit配置，避免SSR问题
    const loadWeb3Config = async () => {
      try {
        const { wagmiConfig: config } = await import('./wagmi-config');
        setWagmiConfig(config);
      } catch (error) {
        console.warn('Failed to load Web3 config:', error);
        setLoadingError(true);
      }
    };

    loadWeb3Config();
  }, []);

  // 总是提供QueryClient，Web3功能是可选的
  if (!wagmiConfig || loadingError) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: '#3b82f6',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            }),
            darkMode: darkTheme({
              accentColor: '#3b82f6',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            }),
          }}
          appInfo={{
            appName: 'QA Fixed Income Platform',
            learnMoreUrl: 'https://qa-app.com',
          }}
        >
          <ClientOnly>
            {children}
          </ClientOnly>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
