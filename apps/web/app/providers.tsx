'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { useState, ReactNode, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { wagmiConfig } from '../lib/wagmi-config';
import { usePerformanceOptimization, trackWebVitals, performanceMonitor } from '../lib/web3-optimizer';

import '@rainbow-me/rainbowkit/styles.css';


// React Query配置
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 数据缓存时间
        staleTime: 60 * 1000, // 1分钟
        // 浏览器失焦后重新获取数据的时间
        refetchOnWindowFocus: false,
        // 重试次数
        retry: (failureCount, error) => {
          // 401错误不重试
          if (error instanceof Error && error.message.includes('401')) {
            return false;
          }
          // 其他错误最多重试2次
          return failureCount < 2;
        },
        // 重试延迟
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Mutation重试次数
        retry: 1,
      },
    },
  });

interface ProvidersProps {
  children: ReactNode;
  cookies?: string | null;
}

export function Providers({ children, cookies }: ProvidersProps) {
  // 确保QueryClient只创建一次
  const [queryClient] = useState(() => createQueryClient());
  const [mounted, setMounted] = useState(false);

  // 性能优化
  const cleanup = usePerformanceOptimization();

  // 解决SSR水合问题
  useEffect(() => {
    setMounted(true);
    
    // 启动性能监控
    performanceMonitor.startMeasure('app_initialization');
    trackWebVitals();
    
    // 组件卸载时清理
    return () => {
      if (cleanup) cleanup();
      performanceMonitor.endMeasure('app_initialization');
    };
  }, [cleanup]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#2563eb',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          appInfo={{
            appName: 'QA Fixed Income Platform',
            learnMoreUrl: 'https://qa-app.com/learn',
          }}
          // 避免SSR问题
          coolMode={mounted}
        >
          {children}

          {/* Toast通知 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* 开发环境显示React Query DevTools */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false}
            />
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}