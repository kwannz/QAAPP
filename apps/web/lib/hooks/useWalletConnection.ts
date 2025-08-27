'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { isSupportedChain, getChainInfo, supportedChainIds } from '../wagmi-config'
import toast from 'react-hot-toast'

export interface WalletConnectionState {
  // 连接状态
  isConnected: boolean
  isConnecting: boolean
  address?: string
  
  // 网络信息
  chainId?: number
  networkName?: string
  isNetworkSupported: boolean
  
  // 余额信息
  ethBalance?: string
  isBalanceLoading: boolean
  
  // 错误状态
  error?: string
}

export interface WalletConnectionActions {
  // 连接操作
  openConnectModal: () => void
  openAccountModal: () => void
  openChainModal: () => void
  disconnect: () => void
  
  // 网络切换
  switchToChain: (chainId: number) => Promise<void>
  switchToSupportedChain: () => Promise<void>
  
  // 工具方法
  formatAddress: (addr?: string) => string
  getExplorerUrl: (txHash?: string) => string | null
  clearError: () => void
}

export function useWalletConnection(): [WalletConnectionState, WalletConnectionActions] {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending: isConnectPending, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchPending, error: switchError } = useSwitchChain()
  
  // RainbowKit modals
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()
  
  // 余额查询
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    query: {
      enabled: !!address && !!chainId,
      refetchInterval: 10000, // 每10秒刷新一次余额
    }
  })
  
  const [error, setError] = useState<string>()
  const [lastConnectedChain, setLastConnectedChain] = useState<number>()

  // 监听连接错误
  useEffect(() => {
    if (connectError) {
      setError(`连接失败: ${connectError.message}`)
      toast.error(`钱包连接失败: ${connectError.message}`)
    }
  }, [connectError])

  // 监听切链错误
  useEffect(() => {
    if (switchError) {
      setError(`网络切换失败: ${switchError.message}`)
      toast.error(`网络切换失败: ${switchError.message}`)
    }
  }, [switchError])

  // 监听网络变化
  useEffect(() => {
    if (chainId && isConnected) {
      const chainInfo = getChainInfo(chainId)
      if (chainInfo) {
        toast.success(`已连接到 ${chainInfo.name}`)
        setLastConnectedChain(chainId)
      } else if (!isSupportedChain(chainId)) {
        toast.error(`不支持的网络 (Chain ID: ${chainId})`)
      }
      // 清除之前的错误
      setError(undefined)
    }
  }, [chainId, isConnected])

  // 监听连接状态变化
  useEffect(() => {
    if (isConnected && address) {
      toast.success(`钱包已连接: ${formatAddress(address)}`)
      // 恢复到上次使用的链
      if (lastConnectedChain && chainId !== lastConnectedChain && isSupportedChain(lastConnectedChain)) {
        switchToChain(lastConnectedChain)
      }
    }
  }, [isConnected, address])

  // 格式化地址显示
  const formatAddress = useCallback((addr?: string): string => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  // 获取浏览器链接
  const getExplorerUrl = useCallback((txHash?: string): string | null => {
    if (!chainId) return null
    
    const chainInfo = getChainInfo(chainId)
    if (!chainInfo) return null
    
    const baseUrl = chainInfo.explorerUrl
    if (txHash) {
      return `${baseUrl}/tx/${txHash}`
    }
    return baseUrl
  }, [chainId])

  // 切换到指定链
  const switchToChain = useCallback(async (targetChainId: number) => {
    if (!switchChain) {
      setError('不支持网络切换')
      return
    }

    if (!isSupportedChain(targetChainId)) {
      setError(`不支持的网络 ID: ${targetChainId}`)
      return
    }

    try {
      setError(undefined)
      await switchChain({ chainId: targetChainId })
      toast.success(`正在切换到网络...`)
    } catch (err: any) {
      const errorMsg = err?.message || '网络切换失败'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    }
  }, [switchChain])

  // 切换到支持的链（自动选择最佳链）
  const switchToSupportedChain = useCallback(async () => {
    // 优先切换到 Sepolia 测试网（如果启用了测试网）
    const preferredChainId = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true' 
      ? 11155111 // Sepolia
      : 1 // Ethereum mainnet
    
    if (supportedChainIds.includes(preferredChainId)) {
      await switchToChain(preferredChainId)
    } else {
      // 回退到第一个支持的链
      await switchToChain(supportedChainIds[0])
    }
  }, [switchToChain])

  // 清除错误
  const clearError = useCallback(() => {
    setError(undefined)
  }, [])

  // 计算网络信息
  const networkName = chainId ? getChainInfo(chainId)?.name : undefined
  const isNetworkSupported = chainId ? isSupportedChain(chainId) : false

  // 状态对象
  const state: WalletConnectionState = {
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    address,
    chainId,
    networkName,
    isNetworkSupported,
    ethBalance: balanceData ? parseFloat(balanceData.formatted).toFixed(4) : undefined,
    isBalanceLoading,
    error,
  }

  // 操作对象
  const actions: WalletConnectionActions = {
    openConnectModal: openConnectModal || (() => {}),
    openAccountModal: openAccountModal || (() => {}),
    openChainModal: openChainModal || (() => {}),
    disconnect,
    switchToChain,
    switchToSupportedChain,
    formatAddress,
    getExplorerUrl,
    clearError,
  }

  return [state, actions]
}

// 简化版 Hook，只返回连接状态
export function useWalletStatus() {
  const [state] = useWalletConnection()
  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    address: state.address,
    chainId: state.chainId,
    isNetworkSupported: state.isNetworkSupported,
    ethBalance: state.ethBalance,
  }
}

// 网络状态 Hook
export function useNetworkStatus() {
  const [state, actions] = useWalletConnection()
  return {
    chainId: state.chainId,
    networkName: state.networkName,
    isNetworkSupported: state.isNetworkSupported,
    switchToChain: actions.switchToChain,
    switchToSupportedChain: actions.switchToSupportedChain,
    openChainModal: actions.openChainModal,
  }
}