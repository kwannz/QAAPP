import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { mainnet, polygon, arbitrum, sepolia, hardhat } from 'wagmi/chains';

import { isBrowserEnvironment } from './browser-polyfills';

// 获取环境变量，使用有效的WalletConnect项目ID
// 使用一个更稳定的测试项目ID
const getProjectId = () => process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'a7f416d3f78b2ad3c80d7c29ad5b4c2c';

// 本地开发链配置
const hardhatLocal = {
  ...hardhat,
  name: 'Hardhat Local',
  id: 31_337,
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
} as const;

// 根据环境决定支持的链
const isDevelopment = process.env.NODE_ENV === 'development';
const isTestnetEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true';

// 自定义链配置
const getChains = () => {
  if (isDevelopment) {
    return [hardhatLocal, sepolia, mainnet, polygon, arbitrum] as const;
  } else if (isTestnetEnabled) {
    return [sepolia, mainnet, polygon, arbitrum] as const;
  }
    return [mainnet, polygon, arbitrum] as const;
};

// 传输配置
const getTransports = () => {
  const chains = getChains();
  const transports: any = {};

  for (const chain of chains) {
    switch (chain.id) {
      case hardhatLocal.id: {
        transports[chain.id] = http('http://localhost:8545');
        break;
      }
      case mainnet.id: {
        transports[chain.id] = http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com');
        break;
      }
      case polygon.id: {
        transports[chain.id] = http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon.llamarpc.com');
        break;
      }
      case arbitrum.id: {
        transports[chain.id] = http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com');
        break;
      }
      case sepolia.id: {
        transports[chain.id] = http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia.publicnode.com');
        break;
      }
    }
  }

  return transports;
};

// Wagmi 配置工厂函数 - 延迟初始化以避免SSR问题
let cachedWagmiConfig: any = null;

export const createWagmiConfig = () => {
  // 只在浏览器环境中创建配置
  if (!isBrowserEnvironment()) {
    return null;
  }

  // 如果已经创建过，直接返回缓存的配置
  if (cachedWagmiConfig) {
    return cachedWagmiConfig;
  }

  try {
    cachedWagmiConfig = getDefaultConfig({
      appName: 'QA Fixed Income Platform',
      projectId: getProjectId(),
      chains: getChains(),
      ssr: true,
      transports: getTransports(),
    });

    return cachedWagmiConfig;
  } catch (error) {
    console.warn('Failed to create Wagmi config, using fallback:', error);
    return null;
  }
};

// 向后兼容的导出
export const wagmiConfig = createWagmiConfig();

// 链配置映射
export const chainConfig = {
  [hardhatLocal.id]: {
    name: 'Hardhat Local',
    icon: '🔧',
    explorerUrl: 'http://localhost:8545',
    nativeCurrency: 'ETH',
    usdtContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    treasuryContract: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    qaCardContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
  [mainnet.id]: {
    name: '以太坊主网',
    icon: '⧫',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: 'ETH',
    usdtContract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  [polygon.id]: {
    name: 'Polygon',
    icon: '⬟',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
    usdtContract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  [arbitrum.id]: {
    name: 'Arbitrum One',
    icon: '🔷',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: 'ETH',
    usdtContract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  [sepolia.id]: {
    name: 'Sepolia 测试网',
    icon: '⚡',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: 'ETH',
    usdtContract: process.env.NEXT_PUBLIC_USDT_CONTRACT_TESTNET || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
};

// 支持的链ID列表
export const supportedChainIds = Object.keys(chainConfig).map(Number);

// 检查链是否支持
export const isSupportedChain = (chainId?: number): boolean => {
  return chainId ? supportedChainIds.includes(chainId) : false;
};

// 获取链信息
export const getChainInfo = (chainId?: number) => {
  if (!chainId || !chainConfig[chainId]) {
    return null;
  }
  return chainConfig[chainId];
};

// USDT合约ABI（简化版）
export const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;
