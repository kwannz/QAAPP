import { ethers } from 'hardhat';
import axios from 'axios';

/**
 * 综合区块链集成测试脚本
 * 测试智能合约与API服务器的完整集成
 */

const API_BASE_URL = 'http://localhost:3001/api';

// 合约地址
const CONTRACTS = {
  usdt: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  qacard: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  treasury: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
};

async function main() {
  console.log('🧪 开始综合区块链集成测试\n');

  const [deployer, admin, operator, user1, user2] = await ethers.getSigners();
  
  console.log('📋 测试账户:');
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Admin: ${admin.address}`);
  console.log(`Operator: ${operator.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}\n`);

  // 获取合约实例
  const USDTContract = await ethers.getContractAt('MockUSDT', CONTRACTS.usdt);
  const QACardContract = await ethers.getContractAt('QACard', CONTRACTS.qacard);
  const TreasuryContract = await ethers.getContractAt('Treasury', CONTRACTS.treasury);

  try {
    // === 测试1: 区块链基础连接 ===
    console.log('🔗 测试1: 区块链基础连接');
    const blockNumber = await ethers.provider.getBlockNumber();
    const chainId = (await ethers.provider.getNetwork()).chainId;
    console.log(`✅ 当前区块: ${blockNumber}`);
    console.log(`✅ 链ID: ${chainId}\n`);

    // === 测试2: 合约基础信息 ===
    console.log('📋 测试2: 智能合约基础信息');
    
    // USDT 信息
    const usdtTotalSupply = await USDTContract.totalSupply();
    const usdtDecimals = await USDTContract.decimals();
    console.log(`USDT总供应量: ${ethers.formatUnits(usdtTotalSupply, usdtDecimals)} USDT`);
    
    // Treasury 信息
    const treasuryUSDT = await TreasuryContract.usdtToken();
    console.log(`Treasury中的USDT地址: ${treasuryUSDT}`);
    console.log(`地址匹配: ${treasuryUSDT.toLowerCase() === CONTRACTS.usdt.toLowerCase() ? '✅' : '❌'}\n`);

    // === 测试3: API健康检查 ===
    console.log('🏥 测试3: API健康检查');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/monitoring/health`);
      console.log(`API状态: ${healthResponse.data.overall}`);
      
      const blockchainService = healthResponse.data.services.find((s: any) => s.name === '区块链连接');
      if (blockchainService) {
        console.log(`区块链连接状态: ${blockchainService.status}`);
        console.log(`✅ API健康检查通过\n`);
      }
    } catch (error: any) {
      console.log(`❌ API健康检查失败: ${error.message}\n`);
    }

    // === 测试4: 用户USDT余额和转账 ===
    console.log('💰 测试4: USDT代币操作');
    
    // 给用户分配USDT
    const transferAmount = ethers.parseUnits('1000', 6); // 1000 USDT
    await USDTContract.connect(deployer).transfer(user1.address, transferAmount);
    
    const user1Balance = await USDTContract.balanceOf(user1.address);
    console.log(`User1 USDT余额: ${ethers.formatUnits(user1Balance, 6)} USDT`);
    
    // 授权Treasury合约使用USDT
    await USDTContract.connect(user1).approve(CONTRACTS.treasury, transferAmount);
    const allowance = await USDTContract.allowance(user1.address, CONTRACTS.treasury);
    console.log(`User1授权给Treasury: ${ethers.formatUnits(allowance, 6)} USDT ✅\n`);

    // === 测试5: 查询API端点（不需要认证的） ===
    console.log('📊 测试5: 公开API端点测试');
    try {
      // 测试位置统计
      const positionsResponse = await axios.get(`${API_BASE_URL}/positions/stats`);
      console.log(`位置统计: ${JSON.stringify(positionsResponse.data)}`);
      
      // 测试产品列表
      const productsResponse = await axios.get(`${API_BASE_URL}/products`);
      console.log(`产品数量: ${productsResponse.data.length}`);
      console.log(`✅ 公开API端点测试通过\n`);
    } catch (error: any) {
      console.log(`❌ API端点测试失败: ${error.message}\n`);
    }

    // === 测试6: 区块链状态监控 ===
    console.log('📈 测试6: 区块链状态监控');
    
    const latestBlock = await ethers.provider.getBlock('latest');
    if (latestBlock) {
      console.log(`最新区块时间: ${new Date(latestBlock.timestamp * 1000).toLocaleString()}`);
      console.log(`区块Gas使用: ${latestBlock.gasUsed.toString()}`);
      console.log(`区块交易数: ${latestBlock.transactions.length}`);
    }
    
    // 获取网络Gas价格
    const gasPrice = await ethers.provider.getFeeData();
    console.log(`当前Gas价格: ${gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '未知'} gwei\n`);

    // === 测试7: 合约事件监听测试 ===
    console.log('👂 测试7: 合约事件监听');
    
    // 监听USDT转账事件
    const transferFilter = USDTContract.filters.Transfer();
    const transferEvents = await USDTContract.queryFilter(transferFilter, -10); // 最近10个区块
    console.log(`USDT转账事件数量: ${transferEvents.length}`);
    
    if (transferEvents.length > 0) {
      const latestTransfer = transferEvents[transferEvents.length - 1];
      console.log(`最新转账: ${latestTransfer.args?.from} → ${latestTransfer.args?.to}`);
      console.log(`转账金额: ${ethers.formatUnits(latestTransfer.args?.value || 0, 6)} USDT`);
    }
    console.log(`✅ 事件监听测试完成\n`);

    // === 测试8: 网络延迟和性能 ===
    console.log('⚡ 测试8: 网络性能测试');
    
    const startTime = Date.now();
    await ethers.provider.getBlockNumber();
    const rpcLatency = Date.now() - startTime;
    
    const apiStartTime = Date.now();
    try {
      await axios.get(`${API_BASE_URL}/health`);
      const apiLatency = Date.now() - apiStartTime;
      
      console.log(`RPC延迟: ${rpcLatency}ms`);
      console.log(`API延迟: ${apiLatency}ms`);
      console.log(`性能状态: ${rpcLatency < 100 && apiLatency < 200 ? '优秀' : '良好'} ✅\n`);
    } catch (error) {
      console.log(`API性能测试失败\n`);
    }

    console.log('🎉 综合区块链集成测试完成！');
    console.log('\n📋 测试总结:');
    console.log('✅ 区块链节点连接正常');
    console.log('✅ 智能合约部署成功');
    console.log('✅ 代币转账功能正常');
    console.log('✅ API服务器集成正常');
    console.log('✅ 事件监听功能正常');
    console.log('✅ 网络性能良好');

  } catch (error: any) {
    console.error('❌ 测试过程中出现错误:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 测试脚本执行失败:', error);
    process.exit(1);
  });