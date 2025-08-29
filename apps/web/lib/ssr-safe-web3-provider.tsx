'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect, createContext, useContext } from 'react'
import { ClientOnly } from '../components/ClientOnly'

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
    console.warn('Web3 not initialized - connect disabled')
  },
  disconnect: async () => {
    console.warn('Web3 not initialized - disconnect disabled')
  },
}

const Web3Context = createContext<SafeWeb3Context>(defaultWeb3Context)

export const useSafeWeb3 = () => useContext(Web3Context)

interface SafeWeb3ProviderProps {
  children: ReactNode
}

// 客户端Web3提供者
function ClientWeb3Provider({ children }: SafeWeb3ProviderProps) {
  const [web3State, setWeb3State] = useState<SafeWeb3Context>(defaultWeb3Context)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
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

  useEffect(() => {
    let wagmiConfig: any = null
    
    const initializeWeb3 = async () => {
      try {
        // 动态导入Web3配置
        const { wagmiConfig: config } = await import('./wagmi-config')
        const { WagmiProvider } = await import('wagmi')
        
        wagmiConfig = config
        
        // 更新状态以启用Web3功能
        setWeb3State({
          isWeb3Enabled: true,
          isConnected: false,
          connect: async () => {
            console.log('Connect wallet functionality would be implemented here')
          },
          disconnect: async () => {
            console.log('Disconnect wallet functionality would be implemented here')
          },
        })
        
        console.log('Web3 initialized successfully (basic mode)')
      } catch (error) {
        console.warn('Failed to initialize Web3:', error)
        // 保持默认状态，应用仍然可以工作
      }
    }

    initializeWeb3()
  }, [])

  return (
    <Web3Context.Provider value={web3State}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Web3Context.Provider>
  )
}

// SSR安全的Web3提供者
export function SSRSafeWeb3Provider({ children }: SafeWeb3ProviderProps) {
  return (
    <ClientOnly fallback={
      <Web3Context.Provider value={defaultWeb3Context}>
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      </Web3Context.Provider>
    }>
      <ClientWeb3Provider>
        {children}
      </ClientWeb3Provider>
    </ClientOnly>
  )
}