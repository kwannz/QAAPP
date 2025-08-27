export const testUsers = {
  validUser: {
    email: 'test.user@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    confirmPassword: 'AdminPassword123!'
  },
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    confirmPassword: '456'
  }
};

export const testWalletAddresses = {
  testAccount1: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  testAccount2: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  testAccount3: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
};

export const testQACards = [
  {
    id: 1,
    title: '测试QA卡片1',
    description: '这是一个用于测试的QA卡片',
    price: '0.1',
    category: 'technology',
    tags: ['测试', '技术', 'blockchain']
  },
  {
    id: 2,
    title: 'Test QA Card 2',
    description: 'Another test QA card for testing purposes',
    price: '0.05',
    category: 'finance',
    tags: ['test', 'finance', 'defi']
  }
];

export const apiEndpoints = {
  local: 'http://localhost:3001',
  dev: 'https://dev-api.qa-app.com',
  staging: 'https://staging-api.qa-app.com',
  production: 'https://api.qa-app.com'
};

export const blockchainConfig = {
  local: {
    chainId: 31337,
    rpcUrl: 'http://localhost:8545',
    name: 'Hardhat Local'
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    name: 'Sepolia Testnet'
  },
  mainnet: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    name: 'Ethereum Mainnet'
  }
};

export const contractAddresses = {
  local: {
    treasury: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    qaCard: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    usdt: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  },
  sepolia: {
    treasury: '0x...',
    qaCard: '0x...',
    usdt: '0x...'
  }
};

export const testTransactions = {
  purchase: {
    cardId: 1,
    amount: '0.1',
    gasLimit: '100000'
  },
  yield: {
    amount: '0.01',
    recipient: testWalletAddresses.testAccount2
  }
};

export const mockApiResponses = {
  userProfile: {
    id: 1,
    email: testUsers.validUser.email,
    username: 'testuser',
    walletAddress: testWalletAddresses.testAccount1,
    balance: '1.5',
    createdAt: '2024-01-01T00:00:00Z'
  },
  
  qaCardsList: {
    cards: testQACards,
    total: testQACards.length,
    page: 1,
    limit: 10
  },

  transactionHistory: {
    transactions: [
      {
        id: '0x123...',
        type: 'purchase',
        amount: '0.1',
        status: 'confirmed',
        timestamp: '2024-01-01T12:00:00Z'
      },
      {
        id: '0x456...',
        type: 'yield',
        amount: '0.01',
        status: 'pending',
        timestamp: '2024-01-01T13:00:00Z'
      }
    ]
  }
};

export const performanceBenchmarks = {
  pageLoad: {
    excellent: 1000, // < 1s
    good: 3000,      // < 3s
    poor: 5000       // < 5s
  },
  apiResponse: {
    excellent: 200,  // < 200ms
    good: 500,       // < 500ms
    poor: 1000       // < 1s
  },
  firstContentfulPaint: {
    excellent: 1800, // < 1.8s
    good: 3000,      // < 3s
    poor: 4500       // < 4.5s
  }
};

export const errorMessages = {
  validation: {
    emailRequired: '邮箱地址不能为空',
    emailInvalid: '请输入有效的邮箱地址',
    passwordRequired: '密码不能为空',
    passwordTooShort: '密码长度不能少于8位',
    passwordMismatch: '两次输入的密码不一致'
  },
  authentication: {
    loginFailed: '登录失败，请检查用户名和密码',
    unauthorized: '您没有权限访问此资源',
    sessionExpired: '登录已过期，请重新登录'
  },
  blockchain: {
    walletNotConnected: '请先连接钱包',
    insufficientBalance: '余额不足',
    transactionFailed: '交易失败',
    networkError: '网络连接错误'
  }
};

// 生成测试数据的辅助函数
export const generateTestData = {
  randomEmail: () => `test.${Date.now()}@example.com`,
  
  randomUser: () => ({
    email: generateTestData.randomEmail(),
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  }),

  randomQACard: () => ({
    title: `测试卡片 ${Math.random().toString(36).substr(2, 9)}`,
    description: `这是一个自动生成的测试卡片 ${Date.now()}`,
    price: (Math.random() * 0.5 + 0.01).toFixed(3),
    category: ['technology', 'finance', 'gaming', 'art'][Math.floor(Math.random() * 4)],
    tags: ['test', 'auto-generated', 'playwright']
  }),

  randomWalletAddress: () => {
    const hex = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    return hex;
  }
};