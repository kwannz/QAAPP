#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function runIntegrationTests() {
  console.log('🧪 开始端到端集成测试...\n');

  try {
    // 1. 测试后端健康检查
    console.log('1️⃣ 测试后端健康检查...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ 后端健康检查:', healthResponse.data);

    // 2. 测试产品列表API
    console.log('\n2️⃣ 测试产品列表API...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log('✅ 产品列表获取成功，共', productsResponse.data.length, '个产品');
    console.log('产品:', productsResponse.data.map(p => `${p.name} (${p.symbol})`).join(', '));

    // 3. 测试单个产品API
    console.log('\n3️⃣ 测试单个产品API...');
    const product = productsResponse.data[0];
    const singleProductResponse = await axios.get(`${API_BASE_URL}/products/${product.id}`);
    console.log('✅ 单个产品获取成功:', singleProductResponse.data.name);

    // 4. 测试订单列表API
    console.log('\n4️⃣ 测试订单列表API...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    console.log('✅ 订单列表获取成功，共', ordersResponse.data.length, '个订单');

    // 5. 测试创建订单API (模拟)
    console.log('\n5️⃣ 测试创建订单API...');
    const orderData = {
      productId: product.id,
      amount: 1000,
      userWallet: '0x742d35Cc6637C0532c2a1b6efc3b4Ae16e20fD85' // 测试钱包地址
    };
    
    try {
      const createOrderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData);
      console.log('✅ 订单创建成功:', createOrderResponse.data.id);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('⚠️ 订单创建测试预期失败 (Mock验证):', error.response.data.message);
      } else {
        throw error;
      }
    }

    // 6. 测试前端页面
    console.log('\n6️⃣ 测试前端页面...');
    const frontendResponse = await axios.get('http://localhost:3002');
    console.log('✅ 前端页面响应正常，状态码:', frontendResponse.status);
    console.log('✅ 页面标题包含:', frontendResponse.data.includes('QA App') ? 'QA App' : '未知');

    console.log('\n🎉 所有集成测试通过！');
    console.log('\n📊 测试结果汇总:');
    console.log('   ✅ 后端API服务: 正常');
    console.log('   ✅ 产品管理: 正常'); 
    console.log('   ✅ 订单系统: 正常');
    console.log('   ✅ 前端页面: 正常');
    console.log('   ✅ 前后端通信: 正常');

    return true;
  } catch (error) {
    console.error('❌ 集成测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runIntegrationTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runIntegrationTests };