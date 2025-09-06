import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true // 启用新的代码生成器，支持更复杂的优化
    }
  },
  
  networks: {
    // ========== 开发网络 ==========
    // 本地 Hardhat 网络
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      timeout: 60000,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
    },
    
    // 本地 Hardhat 节点（内置）
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: '10000000000000000000000', // 10000 ETH
      },
      forking: process.env.FORK_MAINNET === 'true' ? {
        url: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/demo',
        blockNumber: parseInt(process.env.FORK_BLOCK_NUMBER || '0') || undefined,
      } : undefined,
    },
    
    // ========== 以太坊测试网 ==========
    // Sepolia 测试网 (主要测试网络)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 'auto',
      gasMultiplier: 1.2,
      timeout: 60000,
      confirmations: 2,
    },
  },
  
  // Etherscan API配置，用于合约验证
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'sepolia',
        chainId: 11155111,
        urls: {
          apiURL: 'https://api-sepolia.etherscan.io/api',
          browserURL: 'https://sepolia.etherscan.io'
        }
      }
    ]
  },
  
  // Gas reporter配置
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: 'USD',
    gasPrice: 21,
    coinmarketcap: process.env.CMC_API_KEY
  },
  
  // 合约大小检查
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  
  // 默认网络
  defaultNetwork: 'hardhat',
  
  // 路径配置
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  
  // Mocha测试配置
  mocha: {
    timeout: 20000
  }
};

export default config;