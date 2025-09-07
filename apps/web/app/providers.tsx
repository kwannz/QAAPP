'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { SSRSafeToaster } from '../components/SSRSafeToaster';
import { WebSocketProvider, WebSocketStatusIndicator } from '../components/providers/WebSocketProvider';
import { AuthProvider } from '../lib/auth-context';
import { SSRSafeWeb3Provider } from '../lib/ssr-safe-web3-provider';


// React Query配置
const MS_PER_SEC = 1000;
const SEC_PER_MIN = 60;
const ONE_MINUTE_MS = SEC_PER_MIN * MS_PER_SEC;
const RETRY_BASE = 2;
const MAX_RETRY_DELAY_MS = 30_000;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 数据缓存时间
        staleTime: ONE_MINUTE_MS, // 1分钟
        // 浏览器失焦后重新获取数据的时间
        refetchOnWindowFocus: false,

        // 重试次数
        retry: (failureCount, error) => {
          // 401错误不重试
          if (error instanceof Error && error.message.includes('401')) {
            return false;
          }

          // 其他错误最多重试2次
          return failureCount < RETRY_BASE;
        },

        // 重试延迟
        retryDelay: attemptIndex => Math.min(MS_PER_SEC * (RETRY_BASE ** attemptIndex), MAX_RETRY_DELAY_MS),
      },
      mutations: {
        // Mutation重试次数
        retry: 1,
      },
    },
  });

interface ProvidersProperties {
  children: ReactNode;
  cookies?: string | null;
}

export function Providers({ children, cookies: _cookies }: ProvidersProperties) {
  // 确保QueryClient只创建一次
  const [queryClient] = useState(() => createQueryClient());
  const [_mounted, _setMounted] = useState(false);

  // 解决SSR水合问题
  useEffect(() => {
    _setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SSRSafeWeb3Provider>
          <WebSocketProvider>
            {children}

          {/* Toast通知 - SSR安全 */}
          <SSRSafeToaster />

          {/* WebSocket 状态指示器 - 仅开发环境 */}
          <WebSocketStatusIndicator />

          {/* 开发环境显示React Query DevTools */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools
              initialIsOpen={false}
            />
          )}
          </WebSocketProvider>
        </SSRSafeWeb3Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
