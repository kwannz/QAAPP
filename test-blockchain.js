// 简单的区块链连接测试脚本
const axios = require('axios');

async function testBlockchainIntegration() {
  console.log('🔍 测试区块链集成...\n');

  try {
    // 测试1: 健康检查
    console.log('1. 检查系统健康状态...');
    const healthResponse = await axios.get('http://localhost:3001/api/monitoring/health');
    
    const blockchainHealth = healthResponse.data.services.find(s => s.name === '区块链连接');
    console.log('✅ 区块链连接状态:', blockchainHealth.status);
    console.log('📊 区块链详情:', blockchainHealth.details);
    console.log();

    // 测试2: 测试API端点
    console.log('2. 测试API端点...');
    
    // 测试位置API
    const positionsResponse = await axios.get('http://localhost:3001/api/positions/stats');
    console.log('✅ 位置统计API:', positionsResponse.status === 200 ? '正常' : '异常');
    
    // 测试收益分发API
    const payoutsResponse = await axios.get('http://localhost:3001/api/yield-distribution/stats');
    console.log('✅ 收益分发API:', payoutsResponse.status === 200 ? '正常' : '异常');
    
    console.log();

    // 测试3: 验证合约地址配置
    console.log('3. 验证合约配置...');
    console.log('📋 TREASURY_CONTRACT_ADDRESS:', process.env.TREASURY_CONTRACT_ADDRESS);
    console.log('📋 QACARD_CONTRACT_ADDRESS:', process.env.QACARD_CONTRACT_ADDRESS);
    console.log('📋 USDT_CONTRACT_ADDRESS:', process.env.USDT_CONTRACT_ADDRESS);
    console.log();

    console.log('🎉 区块链集成测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testBlockchainIntegration();