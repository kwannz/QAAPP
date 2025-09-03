'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect, createContext, useContext } from 'react'
import { ClientOnly } from '../components/ClientOnly'

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css'

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
}

const Web3Context = createContext<SafeWeb3Context>(defaultWeb3Context)

export const useSafeWeb3 = () => useContext(Web3Context)

// 安全的Wagmi提供者包装器
function SafeWagmiWrapper({ children, wagmiConfig }: { children: ReactNode, wagmiConfig?: any }) {
  if (!wagmiConfig) {
    // 如果没有Wagmi配置，提供模拟的Wagmi context以避免错误
    return (
      <div data-wagmi-provider="mock">
        {children}
      </div>
    )
  }
  
  // 动态加载Wagmi组件
  const [WagmiProvider, setWagmiProvider] = useState<any>(null)
  const [RainbowKitProvider, setRainbowKitProvider] = useState<any>(null)
  
  useEffect(() => {
    const loadWagmi = async () => {
      try {
        const { WagmiProvider: WagmiComp } = await import('wagmi')
        const { RainbowKitProvider: RainbowComp, lightTheme, darkTheme } = await import('@rainbow-me/rainbowkit')
        
        setWagmiProvider(() => WagmiComp)
        setRainbowKitProvider(() => (props: any) => (
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
            {...props}
          />
        ))
      } catch (error) {
        // Failed to load Wagmi components - fallback to loading state
      }
    }
    
    loadWagmi()
  }, [])
  
  if (!WagmiProvider || !RainbowKitProvider) {
    return (
      <div data-wagmi-provider="loading">
        {children}
      </div>
    )
  }
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  )
}

interface SafeWeb3ProviderProps {
  children: ReactNode
}

// 客户端Web3提供者
function ClientWeb3Provider({ children }: SafeWeb3ProviderProps) {
  const [web3State, setWeb3State] = useState<SafeWeb3Context>(defaultWeb3Context)
  const [wagmiConfig, setWagmiConfig] = useState<any>(null)
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
    const initializeWeb3 = async () => {
      try {
        // 动态导入Web3配置
        const { wagmiConfig: config } = await import('./wagmi-config')
        
        setWagmiConfig(config)
        
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
        })
        
        // Web3 initialized successfully with proper Wagmi provider
      } catch (error) {
        // Failed to initialize Web3 - application continues with fallback state
        // 保持默认状态，应用仍然可以工作
      }
    }

    initializeWeb3()
  }, [])

  return (
    <Web3Context.Provider value={web3State}>
      <QueryClientProvider client={queryClient}>
        <SafeWagmiWrapper wagmiConfig={wagmiConfig}>
          {children}
        </SafeWagmiWrapper>
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