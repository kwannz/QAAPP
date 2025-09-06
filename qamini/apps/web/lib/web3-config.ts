// Web3配置文件
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, polygonMumbai, hardhat } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

// 支持的链配置 - 专注于开发和测试
export const chains = [
  {
    ...hardhat,
    name: 'Hardhat Local',
    id: 31_337,
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
      public: { http: ['http://127.0.0.1:8545'] },
    },
    blockExplorers: {
      default: {
        name: 'Local Explorer',
        url: 'http://localhost:8545',
      },
    },
    testnet: true,
  },
  {
    ...sepolia,
    name: 'Sepolia Testnet',
    testnet: true,
  },
] as const;

// 钱包连接器配置 - 简化版本，移除有问题的WalletConnect
export const connectors = [
  injected(),
  metaMask(),
];

// Wagmi配置
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
      || `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'demo'}`,
    ),
  },
});

// 合约地址配置 - 简化为核心网络
export const contractAddresses = {
  // 本地开发环境 (Hardhat)
  31_337: {
    Treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_LOCAL || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    QACard: process.env.NEXT_PUBLIC_QACARD_ADDRESS_LOCAL || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS_LOCAL || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },

  // Sepolia 测试网
  11_155_111: {
    Treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_SEPOLIA || '',
    QACard: process.env.NEXT_PUBLIC_QACARD_ADDRESS_SEPOLIA || '',
    USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA || '',
  },
} as const;

// 根据链ID获取合约地址
export const getContractAddress = (chainId: number, contractName: keyof typeof contractAddresses[31_337]) => {
  const addresses = contractAddresses[chainId as keyof typeof contractAddresses];
  return addresses?.[contractName] || '';
};

// 支持的代币配置 - 简化为核心代币
export const supportedTokens = {
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addresses: {
      11_155_111: process.env.NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA || '', // Sepolia 测试USDT
      31_337: process.env.NEXT_PUBLIC_USDT_ADDRESS_LOCAL || '0x5FbDB2315678afecb367f032d93F642f64180aa3', // 本地测试USDT
    },
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    addresses: {
      11_155_111: 'native', // Sepolia ETH
      31_337: 'native', // 本地 ETH
    },
  },
} as const;

// 默认链配置
export const defaultChain = process.env.NODE_ENV === 'development'
  ? chains[0] // 开发环境使用本地 Hardhat
  : chains[1]; // 测试环境使用 Sepolia

// 链配置映射 - 专注于开发和测试网络
export const chainConfig = {
  [hardhat.id]: {
    name: 'Hardhat Local',
    currency: 'ETH',
    explorerUrl: 'http://localhost:8545',
    rpcUrl: 'http://127.0.0.1:8545',
    testnet: true,
    faucetUrl: null, // 本地网络无需水龙头
  },
  [sepolia.id]: {
    name: 'Sepolia Testnet',
    currency: 'SepoliaETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
    testnet: true,
    faucetUrl: 'https://sepoliafaucet.com', // Sepolia 水龙头
  },
} as const;

export type SupportedChainId = keyof typeof contractAddresses
export type ContractName = keyof typeof contractAddresses[31_337]
