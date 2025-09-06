// 合约地址配置
export const CONTRACTS = {
  // 主网合约地址 (需要部署后更新)
  mainnet: {
    TREASURY: '0x0000000000000000000000000000000000000000',
    QA_CARD: '0x0000000000000000000000000000000000000000',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // 以太坊主网 USDT
  },

  // Polygon 主网
  polygon: {
    TREASURY: '0x0000000000000000000000000000000000000000',
    QA_CARD: '0x0000000000000000000000000000000000000000',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT
  },

  // Arbitrum 主网
  arbitrum: {
    TREASURY: '0x0000000000000000000000000000000000000000',
    QA_CARD: '0x0000000000000000000000000000000000000000',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum USDT
  },

  // 测试网络 - 从环境变量读取
  sepolia: {
    TREASURY: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_TESTNET || '0x0000000000000000000000000000000000000000',
    QA_CARD: process.env.NEXT_PUBLIC_QACARD_CONTRACT_TESTNET || '0x0000000000000000000000000000000000000000',
    USDT: process.env.NEXT_PUBLIC_USDT_CONTRACT_TESTNET || '0x0000000000000000000000000000000000000000',
  },

  // 本地开发网络
  localhost: {
    TREASURY: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_LOCALHOST || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    QA_CARD: process.env.NEXT_PUBLIC_QACARD_CONTRACT_LOCALHOST || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    USDT: process.env.NEXT_PUBLIC_USDT_CONTRACT_LOCALHOST || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
} as const;

// 根据链ID获取合约地址
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 1: { // 以太坊主网
      return CONTRACTS.mainnet;
    }
    case 137: { // Polygon 主网
      return CONTRACTS.polygon;
    }
    case 42_161: { // Arbitrum 主网
      return CONTRACTS.arbitrum;
    }
    case 11_155_111: { // Sepolia 测试网
      return CONTRACTS.sepolia;
    }
    case 31_337: { // 本地测试网络
      return CONTRACTS.localhost;
    }
    default: {
      return CONTRACTS.sepolia;
    } // 默认返回测试网
  }
}

// 产品类型枚举 (与智能合约保持一致)
export enum ProductType {
  SILVER = 0,   // 白银卡
  GOLD = 1,     // 黄金卡
  DIAMOND = 2,  // 钻石卡
  PLATINUM = 3  // 白金卡
}

// 产品配置 (与智能合约保持一致)
export const PRODUCT_CONFIG = {
  [ProductType.SILVER]: {
    name: 'QA Silver Card',
    minInvestment: 100, // 100 USDT (匹配合约)
    maxInvestment: 10_000, // 10000 USDT (匹配合约)
    apr: 12, // 12% APR
    duration: 30, // 30天 (匹配合约)
    color: 'from-gray-300 to-gray-500',
    icon: '🥈',
  },
  [ProductType.GOLD]: {
    name: 'QA Gold Card',
    minInvestment: 1000, // 1000 USDT
    maxInvestment: 50_000, // 50000 USDT
    apr: 15, // 15% APR
    duration: 60, // 60天 (匹配合约)
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
  },
  [ProductType.DIAMOND]: {
    name: 'QA Diamond Card',
    minInvestment: 5000, // 5000 USDT
    maxInvestment: 200_000, // 200000 USDT
    apr: 18, // 18% APR
    duration: 90, // 90天 (匹配合约)
    color: 'from-blue-400 to-blue-600',
    icon: '💎',
  },
  [ProductType.PLATINUM]: {
    name: 'QA Platinum Card',
    minInvestment: 10_000, // 10000 USDT
    maxInvestment: 500_000, // 500000 USDT
    apr: 20, // 20% APR
    duration: 365, // 365天
    color: 'from-purple-400 to-purple-600',
    icon: '👑',
  },
} as const;
