/**
 * 合约地址管理器
 * 支持动态配置、环境检测和部署状态管理
 */

'use client'

import React, { useState, useEffect } from 'react'
import { getContractAddresses, ProductType, PRODUCT_CONFIG } from './addresses'

export interface ContractDeploymentStatus {
  isDeployed: boolean
  deploymentTx?: string
  deployedAt?: string
  verified?: boolean
  blockNumber?: number
}

export interface ContractManagerState {
  addresses: ReturnType<typeof getContractAddresses>
  deploymentStatus: {
    treasury: ContractDeploymentStatus
    qaCard: ContractDeploymentStatus  
    usdt: ContractDeploymentStatus
  }
  chainId?: number
  isTestnet: boolean
  isSupported: boolean
}

class ContractManager {
  private state: ContractManagerState | null = null
  private listeners: Array<(state: ContractManagerState) => void> = []

  // 初始化合约管理器
  initialize(chainId?: number) {
    const addresses = getContractAddresses(chainId || 11155111)
    const isTestnet = this.isTestnetChain(chainId)
    const isSupported = this.isSupportedChain(chainId)

    this.state = {
      addresses,
      deploymentStatus: {
        treasury: this.checkDeploymentStatus(addresses.TREASURY),
        qaCard: this.checkDeploymentStatus(addresses.QA_CARD),
        usdt: this.checkDeploymentStatus(addresses.USDT)
      },
      chainId,
      isTestnet,
      isSupported
    }

    this.notifyListeners()
    return this.state
  }

  // 检查链是否为测试网
  private isTestnetChain(chainId?: number): boolean {
    const testnets = [11155111, 31337] // Sepolia, Localhost
    return testnets.includes(chainId || 0)
  }

  // 检查链是否支持
  private isSupportedChain(chainId?: number): boolean {
    const supportedChains = [1, 137, 42161, 11155111, 31337]
    return supportedChains.includes(chainId || 0)
  }

  // 检查合约部署状态
  private checkDeploymentStatus(address: string): ContractDeploymentStatus {
    const isZeroAddress = address === '0x0000000000000000000000000000000000000000'
    const isLocalhost = address.startsWith('0x') && address.length === 42 && !isZeroAddress
    
    return {
      isDeployed: !isZeroAddress,
      verified: this.state?.isTestnet ? false : undefined, // 测试网暂不验证
      deployedAt: isLocalhost ? new Date().toISOString() : undefined
    }
  }

  // 获取当前状态
  getState(): ContractManagerState | null {
    return this.state
  }

  // 检查所有合约是否已部署
  areContractsDeployed(): boolean {
    if (!this.state) return false
    
    return this.state.deploymentStatus.treasury.isDeployed &&
           this.state.deploymentStatus.qaCard.isDeployed &&
           this.state.deploymentStatus.usdt.isDeployed
  }

  // 获取未部署的合约列表
  getUndeployedContracts(): string[] {
    if (!this.state) return []
    
    const undeployed: string[] = []
    
    if (!this.state.deploymentStatus.treasury.isDeployed) {
      undeployed.push('Treasury')
    }
    if (!this.state.deploymentStatus.qaCard.isDeployed) {
      undeployed.push('QACard')
    }
    if (!this.state.deploymentStatus.usdt.isDeployed) {
      undeployed.push('USDT')
    }
    
    return undeployed
  }

  // 更新合约地址（部署后调用）
  updateContractAddress(contract: 'treasury' | 'qaCard' | 'usdt', address: string) {
    if (!this.state) return
    
    this.state.addresses = {
      ...this.state.addresses,
      [contract.toUpperCase()]: address
    }
    
    this.state.deploymentStatus[contract] = this.checkDeploymentStatus(address)
    this.notifyListeners()
  }

  // 添加状态监听器
  addListener(listener: (state: ContractManagerState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // 通知所有监听器
  private notifyListeners() {
    if (this.state) {
      this.listeners.forEach(listener => listener(this.state!))
    }
  }

  // 获取产品配置
  getProductConfig(productType: ProductType) {
    return PRODUCT_CONFIG[productType]
  }

  // 获取支持的链信息
  getSupportedChains() {
    return [
      { id: 1, name: 'Ethereum Mainnet', icon: '⧫', isTestnet: false },
      { id: 137, name: 'Polygon', icon: '⬟', isTestnet: false },
      { id: 42161, name: 'Arbitrum One', icon: '🔷', isTestnet: false },
      { id: 11155111, name: 'Sepolia Testnet', icon: '⚡', isTestnet: true },
      { id: 31337, name: 'Localhost', icon: '🏠', isTestnet: true }
    ]
  }

  // 生成部署报告
  generateDeploymentReport(): string {
    if (!this.state) return 'Contract manager not initialized'
    
    const { addresses, deploymentStatus, chainId, isTestnet } = this.state
    const chainName = this.getSupportedChains().find(c => c.id === chainId)?.name || 'Unknown'
    
    let report = `🔗 合约部署状态报告\n`
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    report += `网络: ${chainName} (${chainId})\n`
    report += `类型: ${isTestnet ? '测试网' : '主网'}\n`
    report += `时间: ${new Date().toLocaleString()}\n\n`
    
    report += `📋 合约地址:\n`
    report += `Treasury: ${addresses.TREASURY}\n`
    report += `QACard:   ${addresses.QA_CARD}\n`
    report += `USDT:     ${addresses.USDT}\n\n`
    
    report += `📊 部署状态:\n`
    report += `Treasury: ${deploymentStatus.treasury.isDeployed ? '✅' : '❌'} ${deploymentStatus.treasury.isDeployed ? 'Deployed' : 'Not Deployed'}\n`
    report += `QACard:   ${deploymentStatus.qaCard.isDeployed ? '✅' : '❌'} ${deploymentStatus.qaCard.isDeployed ? 'Deployed' : 'Not Deployed'}\n`
    report += `USDT:     ${deploymentStatus.usdt.isDeployed ? '✅' : '❌'} ${deploymentStatus.usdt.isDeployed ? 'Deployed' : 'Not Deployed'}\n\n`
    
    const allDeployed = this.areContractsDeployed()
    report += `🎯 总体状态: ${allDeployed ? '✅ 所有合约已部署' : '⚠️ 部分合约未部署'}\n`
    
    if (!allDeployed) {
      const undeployed = this.getUndeployedContracts()
      report += `未部署: ${undeployed.join(', ')}\n`
    }
    
    return report
  }
}

// 全局合约管理器实例
export const contractManager = new ContractManager()

// React Hook for contract manager
export function useContractManager() {
  const [state, setState] = useState<ContractManagerState | null>(contractManager.getState())
  
  useEffect(() => {
    const unsubscribe = contractManager.addListener(setState)
    return unsubscribe
  }, [])
  
  return {
    state,
    manager: contractManager,
    areContractsDeployed: contractManager.areContractsDeployed(),
    getUndeployedContracts: contractManager.getUndeployedContracts(),
    generateReport: contractManager.generateDeploymentReport
  }
}

