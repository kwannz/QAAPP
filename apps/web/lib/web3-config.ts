// Web3配置文件
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai, hardhat } from 'wagmi/chains'
import { injected, walletConnect, metaMask } from 'wagmi/connectors'

// 项目信息
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// 支持的链配置
export const chains = [
  {
    ...hardhat,
    name: 'Hardhat Local',
    id: 31337,
    rpcUrls: {
      default: { http: ['http://localhost:8545'] },
      public: { http: ['http://localhost:8545'] },
    },
  },
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
] as const

// 钱包连接器配置
export const connectors = [
  injected(),
  metaMask(),
  walletConnect({
    projectId,
    metadata: {
      name: 'QA投资平台',
      description: 'QA Investment Platform - 去中心化投资理财平台',
      url: 'https://qa-app.com',
      icons: ['https://qa-app.com/logo.png'],
    },
  }),
]

// Wagmi配置
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [hardhat.id]: http('http://localhost:8545'),
    [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo'}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || 'demo'}`),
    [polygon.id]: http('https://polygon-rpc.com'),
    [polygonMumbai.id]: http('https://rpc-mumbai.maticvigil.com'),
  },
})

// 合约地址配置
export const contractAddresses = {
  // 本地开发环境
  31337: {
    Treasury: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    QACard: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    USDT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  // Sepolia测试网
  11155111: {
    Treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_SEPOLIA || '',
    QACard: process.env.NEXT_PUBLIC_QACARD_ADDRESS_SEPOLIA || '',
    USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA || '',
  },
  // Polygon主网
  137: {
    Treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_POLYGON || '',
    QACard: process.env.NEXT_PUBLIC_QACARD_ADDRESS_POLYGON || '',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // 官方USDT合约
  },
  // Ethereum主网
  1: {
    Treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_ETHEREUM || '',
    QACard: process.env.NEXT_PUBLIC_QACARD_ADDRESS_ETHEREUM || '',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // 官方USDT合约
  },
} as const

// 根据链ID获取合约地址
export const getContractAddress = (chainId: number, contractName: keyof typeof contractAddresses[31337]) => {
  const addresses = contractAddresses[chainId as keyof typeof contractAddresses]
  return addresses?.[contractName] || ''
}

// 支持的代币配置
export const supportedTokens = {
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      11155111: '0x...', // Sepolia测试USDT
      31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // 本地测试USDT
    },
  },
} as const

// 默认链配置
export const defaultChain = process.env.NODE_ENV === 'development' 
  ? chains[0] // 开发环境使用本地Hardhat
  : sepolia   // 测试环境使用Sepolia

// 链配置映射
export const chainConfig = {
  [hardhat.id]: {
    name: 'Hardhat Local',
    currency: 'ETH',
    explorerUrl: 'http://localhost:8545',
    rpcUrl: 'http://localhost:8545',
    testnet: true,
  },
  [mainnet.id]: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    testnet: false,
  },
  [sepolia.id]: {
    name: 'Sepolia Testnet',
    currency: 'SepoliaETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
    testnet: true,
  },
  [polygon.id]: {
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
    testnet: false,
  },
  [polygonMumbai.id]: {
    name: 'Polygon Mumbai',
    currency: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    testnet: true,
  },
} as const

export type SupportedChainId = keyof typeof contractAddresses
export type ContractName = keyof typeof contractAddresses[31337]