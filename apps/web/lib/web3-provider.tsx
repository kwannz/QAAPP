'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './web3-config'
import { ReactNode, useState } from 'react'
import { ClientOnly } from '../components/ClientOnly'

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 禁用服务端查询，避免hydration问题
            staleTime: 60 * 1000, // 1分钟
            retry: (failureCount, error) => {
              // Web3相关错误不重试
              if (error?.message?.includes('user rejected') || 
                  error?.message?.includes('User denied')) {
                return false
              }
              return failureCount < 3
            },
          },
        },
      })
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}