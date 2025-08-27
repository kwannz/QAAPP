# 🚀 QA App 智能合约部署指南

## 📍 当前状态
- **合约代码**: ✅ 已完成 (175个测试100%通过)
- **部署脚本**: ✅ 已准备好
- **网络配置**: ✅ Sepolia测试网已配置
- **账户余额**: ❌ 需要0.03 ETH

## 🎯 部署目标账户
```
地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
当前余额: 0.00000000000000001 ETH
需要余额: 0.03 ETH
```

## 💰 获取测试网ETH

### 方式1: Sepolia Faucet (推荐)
1. 访问: https://sepoliafaucet.com/
2. 输入地址: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
3. 获取: 0.5 ETH (足够部署)

### 方式2: Alchemy Faucet
1. 访问: https://www.alchemy.com/faucets/ethereum-sepolia
2. 需要Alchemy账户
3. 每24小时可获取0.5 ETH

### 方式3: ChainLink Faucet
1. 访问: https://faucets.chain.link/sepolia
2. 需要测试网LINK代币
3. 也可获取测试ETH

## 🔍 检查余额命令
获得ETH后，运行以下命令检查余额：
```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

## 🚀 部署命令
余额充足后，运行部署：
```bash
npx hardhat deploy --network sepolia
```

## 📋 预期部署合约
1. **MockUSDT** - 测试USDT代币
2. **QACard** - NFT投资凭证合约
3. **Treasury** - 资金管理合约

## ⏱️ 预计部署时间
- 总时间: 5-10分钟
- Gas费用: ~0.02-0.03 ETH
- 网络确认: 2-5个区块

## ✅ 部署成功后
部署成功后，会自动：
1. 生成部署报告
2. 更新前后端合约地址配置
3. 创建测试网验证文档

## 🆘 如果遇到问题
- 余额不足: 重新获取测试ETH
- 网络错误: 检查RPC连接
- 部署失败: 查看错误日志

---
**准备好后，告诉我获得了测试网ETH，我立即开始部署！** 🚀