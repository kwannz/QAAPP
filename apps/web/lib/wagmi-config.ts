import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains'
import { http } from 'viem'

// 获取环境变量，使用默认的项目ID避免SSR错误
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '2f5aa3f7c1c0a3e8f9f8c5e3d2a1b3c4'

// 根据环境决定支持的链
const isTestnetEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true'

// 自定义链配置
const chains = isTestnetEnabled 
  ? [sepolia, mainnet, polygon, arbitrum] as const
  : [mainnet, polygon, arbitrum] as const

// Wagmi 配置 - 修复SSR问题
export const wagmiConfig = getDefaultConfig({
  appName: 'QA Fixed Income Platform',
  projectId,
  chains,
  ssr: true,
  // 使用HTTP传输提高稳定性
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || mainnet.rpcUrls.default.http[0]),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || polygon.rpcUrls.default.http[0]),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || arbitrum.rpcUrls.default.http[0]),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0]),
  },
})

// 链配置映射
export const chainConfig = {
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
}

// 支持的链ID列表
export const supportedChainIds = Object.keys(chainConfig).map(Number)

// 检查链是否支持
export const isSupportedChain = (chainId?: number): boolean => {
  return chainId ? supportedChainIds.includes(chainId) : false
}

// 获取链信息
export const getChainInfo = (chainId?: number) => {
  if (!chainId || !chainConfig[chainId]) {
    return null
  }
  return chainConfig[chainId]
}

// USDT合约ABI（简化版）
export const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
] as const