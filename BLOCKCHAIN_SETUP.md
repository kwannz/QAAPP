# 区块链设置指南 - Sepolia + Hardhat

## 🚀 快速开始

### 本地开发环境

1. **启动本地区块链**
   ```bash
   npm run blockchain:start
   ```
   这将：
   - 启动 Hardhat 节点 (http://127.0.0.1:8545)
   - 自动部署所有智能合约
   - 创建 10 个测试账户，每个 10000 ETH
   - 显示合约地址和测试账户信息

2. **快速部署（如果节点已运行）**
   ```bash
   npm run blockchain:deploy:local
   ```

3. **启动前端**
   ```bash
   npm run dev
   ```

### Sepolia 测试网

1. **配置环境**
   ```bash
   cp .env.sepolia.example .env.sepolia
   # 填写以下信息：
   # - PRIVATE_KEY: 你的 Sepolia 测试网私钥
   # - SEPOLIA_RPC_URL: Infura/Alchemy RPC URL
   # - ETHERSCAN_API_KEY: 用于合约验证
   ```

2. **获取测试 ETH**
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com)
   - 为你的钱包地址申请测试 ETH

3. **部署到 Sepolia**
   ```bash
   npm run blockchain:deploy:sepolia
   ```

## 📋 合约地址

### 本地网络 (Chain ID: 31337)
- **MockUSDT**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **QACard**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Treasury**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

### Sepolia 测试网 (Chain ID: 11155111)
- 部署后更新到 `.env.sepolia` 文件

## 🔧 有用的命令

```bash
# 区块链操作
npm run blockchain:start         # 启动本地节点
npm run blockchain:stop          # 停止本地节点
npm run blockchain:restart       # 重启本地节点

# 部署
npm run blockchain:deploy:local    # 部署到本地
npm run blockchain:deploy:sepolia  # 部署到 Sepolia

# 测试
npm run blockchain:test:local     # 本地测试
npm run blockchain:test:sepolia   # Sepolia 测试

# 验证（仅 Sepolia）
npm run blockchain:verify:sepolia # 在 Etherscan 验证合约
```

## 💡 使用提示

### MetaMask 配置

**本地网络**
- 网络名称: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- 货币符号: `ETH`

**Sepolia 测试网**
- 网络名称: `Sepolia Testnet`
- RPC URL: `https://sepolia.infura.io/v3/YOUR-PROJECT-ID`
- Chain ID: `11155111`
- 货币符号: `ETH`
- 区块浏览器: `https://sepolia.etherscan.io`

### 测试账户（本地）

使用 Hardhat 默认测试账户，账户 #0：
- 地址: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- 私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

⚠️ **警告**: 测试私钥仅用于本地开发，绝不要在主网使用！

## 🔍 故障排除

### 常见问题

1. **端口 8545 被占用**
   ```bash
   npm run blockchain:stop  # 停止现有节点
   npm run blockchain:start # 重新启动
   ```

2. **合约编译失败**
   ```bash
   cd packages/contracts
   npx hardhat clean
   npx hardhat compile
   ```

3. **前端连接失败**
   - 确保 MetaMask 连接到正确的网络
   - 检查合约地址是否正确配置
   - 验证 RPC URL 可访问

4. **Sepolia 部署失败**
   - 检查钱包余额是否足够支付 gas
   - 验证 RPC URL 和 API 密钥
   - 确保私钥格式正确

## 📚 技术架构

### 智能合约
- **Treasury**: 资金管理和投资产品
- **QACard**: ERC1155 NFT 权益凭证
- **MockUSDT**: 测试用 USDT 代币

### 网络支持
- **本地**: Hardhat 内置网络，即时挖矿
- **测试**: Sepolia 官方测试网
- **升级**: 支持 UUPS 代理升级模式

### 集成点
- **前端**: Wagmi v2 + Viem
- **后端**: Ethers v6 + NestJS
- **测试**: Hardhat + Mocha