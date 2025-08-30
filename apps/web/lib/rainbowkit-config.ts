import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia, hardhat } from 'wagmi/chains';

// RainbowKit配置
export const rainbowkitConfig = getDefaultConfig({
  appName: 'QA Fixed Income Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: [
    // 开发环境优先使用本地链
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
    polygon,
    sepolia,
  ],
  ssr: true, // 启用服务端渲染支持
});

// 验证配置是否有效
export const isRainbowKitConfigured = () => {
  const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
  return projectId && projectId.length > 0 && projectId !== 'undefined';
};

// 开发模式配置
export const isDevelopmentMode = () => {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true' || 
         process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT === 'true' ||
         !isRainbowKitConfigured();
};