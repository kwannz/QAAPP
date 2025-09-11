'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { ClientOnly } from '../components/ClientOnly';
import { logger } from './verbose-logger';
import { MockWagmiProvider } from './wagmi-mock-provider';

import { isBrowserEnvironment, installBrowserPolyfills } from './browser-polyfills';

// RainbowKit styles are loaded via Next.js app configuration
// Removed dynamic import to fix TypeScript compilation issues

// Time and retry constants
const MS_PER_SEC = 1000;
const SECONDS_PER_MINUTE = 60;
const MAX_RETRIES_BACKGROUND = 3;

// 创建一个安全的Web3上下文
interface SafeWeb3Context {
  isWeb3Enabled: boolean
  isConnected: boolean
  address?: string
  chainId?: number
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const defaultWeb3Context: SafeWeb3Context = {
  isWeb3Enabled: false,
  isConnected: false,
  address: undefined,
  chainId: undefined,
  connect: async () => {
    // Web3 not initialized - connect disabled
  },
  disconnect: async () => {
    // Web3 not initialized - disconnect disabled
  },
};

const Web3Context = createContext<SafeWeb3Context>(defaultWeb3Context);

export const useSafeWeb3 = () => useContext(Web3Context);

// Simple wrapper for fallback mode - now using proper MockWagmiProvider
function SimpleFallbackWrapper({ children }: { children: ReactNode }) {
  return (
    <MockWagmiProvider>
      {children}
    </MockWagmiProvider>
  );
}

// 安全的Wagmi提供者包装器
function SafeWagmiWrapper({ children, wagmiConfig }: { children: ReactNode, wagmiConfig?: any }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [WagmiProvider, setWagmiProvider] = useState<any>(null);
  const [RainbowKitProvider, setRainbowKitProvider] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useWagmi, setUseWagmi] = useState(false);

  useEffect(() => {
    // 确保浏览器 polyfills 已安装
    installBrowserPolyfills();

    // 只在浏览器环境且有配置时初始化
    if (!isBrowserEnvironment() || !wagmiConfig) {
      setIsInitialized(true);
      return;
    }

    const loadWagmi = async () => {
      try {
        // 确保配置存在再加载组件
        if (!wagmiConfig) {
          throw new Error('No wagmi config available');
        }

        // 动态导入以避免SSR问题
        const [wagmiModule, rainbowkitModule] = await Promise.all([
          import('wagmi'),
          import('@rainbow-me/rainbowkit'),
        ]);

        const { WagmiProvider: WagmiComp } = wagmiModule;
        const { RainbowKitProvider: RainbowComp, lightTheme, darkTheme } = rainbowkitModule;

        // 验证组件已正确加载
        if (!WagmiComp || !RainbowComp) {
          throw new Error('Failed to load Wagmi/RainbowKit components');
        }

        setWagmiProvider(() => WagmiComp);
        const RainbowKitProviderWrapper = (properties: any) => (
          <RainbowComp
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
            {...properties}
          />
        );
        RainbowKitProviderWrapper.displayName = 'RainbowKitProviderWrapper';
        setRainbowKitProvider(() => RainbowKitProviderWrapper);

        setUseWagmi(true);
        setIsInitialized(true);
        logger.info('Web3Provider', 'Wagmi/RainbowKit components loaded successfully');
      } catch (error) {
        logger.warn('Web3Provider', 'Failed to load Wagmi/RainbowKit components, using fallback mode', { error });
        setLoadError(error instanceof Error ? error.message : 'Unknown error');
        setUseWagmi(false);
        setIsInitialized(true);
      }
    };

    loadWagmi();
  }, [wagmiConfig]);

  // Loading state - render children so SSR/initial paint keeps server hints
  if (!isInitialized) {
    return (
      <SimpleFallbackWrapper>
        <div data-wagmi-provider="loading">
          {children}
        </div>
      </SimpleFallbackWrapper>
    );
  }

  // Success state - provide real Wagmi context
  if (useWagmi && WagmiProvider && RainbowKitProvider && wagmiConfig) {
    try {
      return (
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider>
            <div data-wagmi-provider="active">
              {children}
            </div>
          </RainbowKitProvider>
        </WagmiProvider>
      );
    } catch (error) {
      logger.error('Web3Provider', 'Runtime error in Wagmi provider, falling back to mock context', { error });
      // Fall through to mock context
    }
  }

  // Fallback state - use mock context to prevent hook violations
  const fallbackReason = loadError || 'Web3配置未启用';
  
  // Use a simple deduplication for SSR provider to avoid creating another warning manager
  const _logKey = `fallback-${fallbackReason}`;
  const hasLogged = typeof window !== 'undefined' ? (window as any).__web3_fallback_logged : false;
  
  if (!hasLogged) {
    if (loadError?.includes('项目ID') || loadError?.includes('project')) {
      if (process.env.NODE_ENV === 'development') {
        logger.info('Web3Provider', 'WalletConnect项目ID配置问题 - 请在.env文件中设置正确的NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID或访问 https://cloud.reown.com 创建项目');
      }
    } else if (process.env.NODE_ENV === 'development') {
      logger.info('Web3Provider', '使用Mock Web3上下文 - 钱包功能已禁用');
    }
    
    if (typeof window !== 'undefined') {
      (window as any).__web3_fallback_logged = true;
    }
  }
  
  return (
    <SimpleFallbackWrapper>
      <div data-wagmi-provider="fallback" title={fallbackReason}>
        {children}
      </div>
    </SimpleFallbackWrapper>
  );
}

interface SafeWeb3ProviderProperties {
  children: ReactNode
}

// 客户端Web3提供者
function ClientWeb3Provider({ children }: SafeWeb3ProviderProperties) {
  const [web3State, setWeb3State] = useState<SafeWeb3Context>(defaultWeb3Context);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: SECONDS_PER_MINUTE * MS_PER_SEC,
            retry: (failureCount, error) => {
              if (error?.message?.includes('user rejected') ||
                  error?.message?.includes('User denied')) {
                return false;
              }
              return failureCount < MAX_RETRIES_BACKGROUND;
            },
          },
        },
      }),
  );

  useEffect(() => {
    const initializeWeb3 = async () => {
      // 确保 polyfills 已安装
      installBrowserPolyfills();

      // 只在浏览器环境中初始化
      if (!isBrowserEnvironment()) {
        return;
      }

      try {
        // 动态导入Web3配置
        const { createWagmiConfig } = await import('./wagmi-config');

        // 使用工厂函数创建配置
        const config = createWagmiConfig();

        if (config) {
          setWagmiConfig(config);

          // 更新状态以启用Web3功能
          setWeb3State({
            isWeb3Enabled: true,
            isConnected: false,
            connect: async () => {
              // Connect wallet functionality handled by Wagmi
            },
            disconnect: async () => {
              // Disconnect wallet functionality handled by Wagmi
            },
          });
        } else {
          // 配置创建失败，但应用仍然可以工作
          logger.warn('Web3Provider', 'Web3 config creation failed, running in fallback mode');
        }

        // Web3 initialized successfully with proper Wagmi provider
      } catch (error) {
        // Failed to initialize Web3 - application continues with fallback state
        logger.warn('Web3Provider', 'Web3 initialization failed', { error });

        // 保持默认状态，应用仍然可以工作
      }
    };

    initializeWeb3();
  }, []);

  return (
    <Web3Context.Provider value={web3State}>
      <QueryClientProvider client={queryClient}>
        <SafeWagmiWrapper wagmiConfig={wagmiConfig}>
          {children}
        </SafeWagmiWrapper>
      </QueryClientProvider>
    </Web3Context.Provider>
  );
}

// SSR安全的Web3提供者
export function SSRSafeWeb3Provider({ children }: SafeWeb3ProviderProperties) {
  return (
    <ClientOnly fallback={
      // Include children in SSR fallback so page-level SSR prompts render
      <div data-wagmi-provider="ssr-fallback">
        {children}
      </div>
    }
    >
      <ClientWeb3Provider>
        {children}
      </ClientWeb3Provider>
    </ClientOnly>
  );
}
