'use client';

import { createContext, useContext, useCallback } from 'react';

// 动态导入 toast 以避免 SSR 问题
const getToast = () => {
  if (typeof window !== 'undefined') {
    return import('react-hot-toast').then(module => module.default);
  }
  return null;
};

export interface Web3ConnectionConfig {

  // RPC配置
  rpcUrls: Record<number, string[]>

  // 合约地址
  contracts: Record<number, {
    treasury?: string
    qaCard?: string
    mockUSDT?: string
  }>

  // 网络配置
  networks: Record<number, {
    name: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    blockExplorerUrls: string[]
    iconUrl?: string
  }>
}

// 默认配置
export const defaultWeb3Config: Web3ConnectionConfig = {
  rpcUrls: {
    1: ['https://eth-mainnet.alchemyapi.io/v2/demo'],
    137: ['https://polygon-rpc.com'],
    42_161: ['https://arb1.arbitrum.io/rpc'],
    11_155_111: ['https://sepolia.infura.io/v3/demo'],
  },
  contracts: {
    1: {
      treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_MAINNET,
      qaCard: process.env.NEXT_PUBLIC_QACARD_CONTRACT_MAINNET,
    },
    137: {
      treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_POLYGON,
      qaCard: process.env.NEXT_PUBLIC_QACARD_CONTRACT_POLYGON,
    },
    42_161: {
      treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ARBITRUM,
      qaCard: process.env.NEXT_PUBLIC_QACARD_CONTRACT_ARBITRUM,
    },
    11_155_111: {
      treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_SEPOLIA,
      qaCard: process.env.NEXT_PUBLIC_QACARD_CONTRACT_SEPOLIA,
      mockUSDT: process.env.NEXT_PUBLIC_USDT_CONTRACT_SEPOLIA,
    },
    31_337: {
      treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_LOCALHOST,
      qaCard: process.env.NEXT_PUBLIC_QACARD_CONTRACT_LOCALHOST,
      mockUSDT: process.env.NEXT_PUBLIC_USDT_CONTRACT_LOCALHOST,
    },
  },
  networks: {
    1: {
      name: 'Ethereum Mainnet',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      blockExplorerUrls: ['https://etherscan.io'],
      iconUrl: '/icons/ethereum.svg',
    },
    137: {
      name: 'Polygon',
      nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
      blockExplorerUrls: ['https://polygonscan.com'],
      iconUrl: '/icons/polygon.svg',
    },
    42_161: {
      name: 'Arbitrum One',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      blockExplorerUrls: ['https://arbiscan.io'],
      iconUrl: '/icons/arbitrum.svg',
    },
    11_155_111: {
      name: 'Sepolia Testnet',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
      iconUrl: '/icons/ethereum.svg',
    },
    31_337: {
      name: 'Localhost',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      blockExplorerUrls: ['http://localhost:8545'],
      iconUrl: '/icons/ethereum.svg',
    },
  },
};

export class Web3ConnectionManager {
  private config: Web3ConnectionConfig;
  private listeners: Set<(state: Web3ConnectionState) => void> = new Set();

  constructor(config: Web3ConnectionConfig = defaultWeb3Config) {
    this.config = config;
  }

  // 获取网络信息
  getNetworkInfo(chainId: number) {
    return this.config.networks[chainId];
  }

  // 获取合约地址
  getContractAddress(chainId: number, contractName: keyof Web3ConnectionConfig['contracts'][number]) {
    return this.config.contracts[chainId]?.[contractName];
  }

  // 检查网络是否支持
  isSupportedNetwork(chainId: number): boolean {
    return chainId in this.config.networks;
  }

  // 获取支持的网络列表
  getSupportedNetworks() {
    return Object.keys(this.config.networks).map(Number);
  }

  // 添加网络到钱包
  async addNetworkToWallet(chainId: number): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      const toast = await getToast();
      if (toast) {
        toast.error('请安装MetaMask或其他Web3钱包');
      }
      return false;
    }

    const networkInfo = this.getNetworkInfo(chainId);
    if (!networkInfo) {
      const toast = await getToast();
      if (toast) {
        toast.error(`不支持的网络 ID: ${chainId}`);
      }
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: networkInfo.name,
            nativeCurrency: networkInfo.nativeCurrency,
            rpcUrls: this.config.rpcUrls[chainId] || [],
            blockExplorerUrls: networkInfo.blockExplorerUrls,
            iconUrls: networkInfo.iconUrl ? [networkInfo.iconUrl] : undefined,
          },
        ],
      });

      const toast = await getToast();
      if (toast) {
        toast.success(`已添加 ${networkInfo.name} 到钱包`);
      }
      return true;
    } catch (error: any) {
      console.error('Failed to add network:', error);
      const toast = await getToast();
      if (toast) {
        toast.error(`添加网络失败: ${error.message}`);
      }
      return false;
    }
  }

  // 切换网络
  async switchNetwork(chainId: number): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      const toast = await getToast();
      if (toast) {
        toast.error('请安装MetaMask或其他Web3钱包');
      }
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      const networkInfo = this.getNetworkInfo(chainId);
      if (networkInfo) {
        const toast = await getToast();
        if (toast) {
          toast.success(`已切换到 ${networkInfo.name}`);
        }
      }
      return true;
    } catch (error: any) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        return this.addNetworkToWallet(chainId);
      }

      console.error('Failed to switch network:', error);
      const toast = await getToast();
      if (toast) {
        toast.error(`网络切换失败: ${error.message}`);
      }
      return false;
    }
  }

  // 检查合约是否已部署
  async checkContractDeployment(chainId: number): Promise<Record<string, boolean>> {
    const contracts = this.config.contracts[chainId];
    const result: Record<string, boolean> = {};

    if (!contracts) return result;

    // 这里可以添加实际的合约部署检查逻辑
    // 现在简单检查地址是否存在
    for (const [name, address] of Object.entries(contracts)) {
      result[name] = Boolean(address && address !== '0x0000000000000000000000000000000000000000');
    }

    return result;
  }

  // 获取推荐的网络
  getRecommendedNetwork(): number {
    // 根据环境返回推荐的网络
    if (process.env.NODE_ENV === 'development') {
      return 31_337; // Localhost
    }
    if (process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true') {
      return 11_155_111; // Sepolia
    }
    return 1; // Mainnet
  }

  // 格式化地址
  formatAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
  }

  // 生成区块浏览器链接
  getExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string | null {
    const networkInfo = this.getNetworkInfo(chainId);
    if (!networkInfo?.blockExplorerUrls[0]) return null;

    const baseUrl = networkInfo.blockExplorerUrls[0];
    return `${baseUrl}/${type}/${hash}`;
  }
}

// 全局连接状态
interface Web3ConnectionState {
  isConnected: boolean
  address?: string
  chainId?: number
  isCorrectNetwork: boolean
  supportedNetworks: number[]
}

// 创建全局实例
export const web3ConnectionManager = new Web3ConnectionManager();

// Context for React components
const Web3ConnectionContext = createContext<Web3ConnectionManager | null>(null);

export function useWeb3ConnectionManager(): Web3ConnectionManager {
  const manager = useContext(Web3ConnectionContext);
  if (!manager) {
    // 返回全局实例作为回退
    return web3ConnectionManager;
  }
  return manager;
}

// Types are now declared in types/global.d.ts

export type { Web3ConnectionState };
