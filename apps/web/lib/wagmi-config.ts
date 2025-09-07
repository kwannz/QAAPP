import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { mainnet, polygon, arbitrum, sepolia, hardhat } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { isBrowserEnvironment } from './browser-polyfills';
import { logger } from './verbose-logger';

// 警告消息去重管理器
class WarningManager {
  private warnedMessages = new Set<string>();
  
  warn(message: string, ...args: any[]) {
    const key = message + JSON.stringify(args);
    if (!this.warnedMessages.has(key)) {
      this.warnedMessages.add(key);
      logger.warn('WagmiConfig', message, { args });
    }
  }
  
  info(message: string, ...args: any[]) {
    const key = message + JSON.stringify(args);
    if (!this.warnedMessages.has(key)) {
      this.warnedMessages.add(key);
      logger.info('WagmiConfig', message, { args });
    }
  }
  
  clear() {
    this.warnedMessages.clear();
  }
}

const warningManager = new WarningManager();

// 缓存项目ID验证结果
let cachedProjectId: string | null | undefined = undefined;

// 获取环境变量，使用有效的WalletConnect项目ID (带缓存和去重警告)
const getProjectId = () => {
  // 返回缓存结果以避免重复验证
  if (cachedProjectId !== undefined) {
    return cachedProjectId;
  }
  
  const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
  
  // 检查是否是默认的占位符值
  if (!projectId || projectId === 'YOUR_PROJECT_ID_HERE') {
    warningManager.warn('⚠️ WalletConnect项目ID未配置或使用默认占位符');
    warningManager.warn('请在.env文件中设置NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
    warningManager.warn('或在 https://cloud.reown.com 创建项目并获取项目ID');
    cachedProjectId = null;
    return null;
  }
  
  // 基本验证项目ID格式（应该是32个字符的十六进制字符串）
  if (!/^[a-f0-9]{32}$/.test(projectId)) {
    warningManager.warn('⚠️ WalletConnect项目ID格式无效，应为32位十六进制字符串');
    warningManager.warn('当前项目ID:', projectId);
    cachedProjectId = null;
    return null;
  }
  
  cachedProjectId = projectId;
  return projectId;
};

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

  // 检查WalletConnect是否被禁用
  const walletConnectDisabled = process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT === 'true';

  const projectId = getProjectId();

  try {
    const chains = getChains();
    const transports = getTransports();

    if (walletConnectDisabled || !projectId) {
      // 当 WalletConnect 被禁用或未配置时，回退到仅注入式连接器（如 MetaMask）
      warningManager.info('🔌 使用注入式钱包连接（MetaMask等），无需 WalletConnect 项目ID');
      cachedWagmiConfig = createConfig({
        chains,
        transports,
        connectors: [injected()],
        ssr: true,
      } as any);
      return cachedWagmiConfig;
    }

    // 正常路径：启用 RainbowKit 默认配置（需要 WalletConnect 项目ID）
    cachedWagmiConfig = getDefaultConfig({
      appName: 'QA Fixed Income Platform',
      projectId,
      chains,
      ssr: true,
      transports,
    });

    warningManager.info('✅ Wagmi配置创建成功，Web3功能已启用');
    return cachedWagmiConfig;
  } catch (error) {
    warningManager.warn('❌ 创建Wagmi配置失败，启用Mock模式:', error);
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
