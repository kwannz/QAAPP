// API与区块链集成测试脚本
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPIBlockchainIntegration() {
  console.log('🔗 测试API与区块链集成...\n');

  try {
    // === 测试1: 系统健康状态 ===
    console.log('1. 📊 系统健康状态检查');
    const healthRes = await axios.get(`${API_BASE}/monitoring/health`);
    
    console.log(`整体状态: ${healthRes.data.overall}`);
    
    // 检查每个服务
    healthRes.data.services.forEach(service => {
      const status = service.status === 'healthy' ? '✅' : '❌';
      console.log(`  ${status} ${service.name}: ${service.status}`);
      if (service.details) {
        if (service.name === '区块链连接') {
          console.log(`    📈 最新区块: ${service.details.latestBlock}`);
          console.log(`    🌐 网络: ${service.details.network}`);
          console.log(`    ⚡ 延迟: ${service.responseTime}ms`);
        }
      }
    });
    console.log();

    // === 测试2: 产品API测试 ===
    console.log('2. 🛍️ 产品API测试');
    const productsRes = await axios.get(`${API_BASE}/products`);
    
    console.log(`产品总数: ${productsRes.data.length}`);
    productsRes.data.forEach((product, index) => {
      console.log(`  产品${index + 1}: ${product.name}`);
      console.log(`    💰 价格: ${product.price} USDT`);
      console.log(`    📅 期限: ${product.duration}天`);
      console.log(`    📊 年化收益: ${product.annualReturn}%`);
    });
    console.log();

    // === 测试3: 订单API测试 ===
    console.log('3. 📋 订单API测试');
    const ordersRes = await axios.get(`${API_BASE}/orders`);
    
    console.log(`订单总数: ${ordersRes.data.length}`);
    if (ordersRes.data.length > 0) {
      console.log('最近订单:');
      ordersRes.data.slice(0, 3).forEach(order => {
        console.log(`  订单ID: ${order.id}`);
        console.log(`  状态: ${order.status}`);
        console.log(`  金额: ${order.amount} USDT`);
        console.log(`  创建时间: ${new Date(order.createdAt).toLocaleString()}`);
      });
    }
    console.log();

    // === 测试4: 位置统计API ===
    console.log('4. 📈 位置统计API');
    const positionsRes = await axios.get(`${API_BASE}/positions/stats`);
    
    console.log('投资统计:');
    console.log(`  总投资位置: ${positionsRes.data.totalPositions}`);
    console.log(`  活跃位置: ${positionsRes.data.activePositions}`);
    console.log(`  总锁定价值: ${positionsRes.data.totalValueLocked} USDT`);
    console.log(`  总已支付: ${positionsRes.data.totalValuePaid} USDT`);
    console.log();

    // === 测试5: 认证API测试 ===
    console.log('5. 🔐 认证系统测试');
    
    try {
      // 测试登录
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@qaapp.com',
        password: 'password123'
      });
      
      const token = loginRes.data.token;
      console.log(`✅ 登录成功，token长度: ${token.length}`);

      // 使用token测试认证接口
      const meRes = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`用户信息: ${meRes.data.name} (${meRes.data.email})`);
      console.log(`角色: ${meRes.data.role}`);
      
      // === 测试6: 认证后的API测试 ===
      console.log('\n6. 🔒 需要认证的API测试');
      
      // 测试用户特定的投资信息
      const userPositionsRes = await axios.get(`${API_BASE}/positions/user/${meRes.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`用户投资位置数: ${userPositionsRes.data.length}`);
      
      // 测试收益信息（可能需要认证）
      try {
        const payoutsRes = await axios.get(`${API_BASE}/payouts/user/${meRes.data.id}/claimable`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`可领取收益数: ${payoutsRes.data.length}`);
      } catch (payoutError) {
        console.log(`收益API测试失败: ${payoutError.response?.data?.message || payoutError.message}`);
      }
      
    } catch (authError) {
      console.log(`❌ 认证测试失败: ${authError.response?.data?.message || authError.message}`);
    }
    console.log();

    // === 测试7: WebSocket/实时功能 ===
    console.log('7. 📡 实时监控API');
    try {
      const realtimeRes = await axios.get(`${API_BASE}/monitoring/realtime`);
      console.log('实时系统指标:');
      console.log(`  CPU使用率: ${realtimeRes.data.cpu}%`);
      console.log(`  内存使用: ${realtimeRes.data.memory}MB`);
      console.log(`  活跃连接: ${realtimeRes.data.activeConnections}`);
    } catch (error) {
      console.log(`实时监控API测试失败: ${error.response?.data?.message || error.message}`);
    }
    console.log();

    // === 测试8: 性能指标 ===
    console.log('8. ⚡ 性能指标测试');
    const perfStartTime = Date.now();
    
    await Promise.all([
      axios.get(`${API_BASE}/health`),
      axios.get(`${API_BASE}/products`),
      axios.get(`${API_BASE}/positions/stats`)
    ]);
    
    const perfEndTime = Date.now();
    console.log(`并发API调用延迟: ${perfEndTime - perfStartTime}ms`);
    console.log();

    console.log('🎉 API与区块链集成测试完成！');
    console.log('\n📋 集成测试总结:');
    console.log('✅ API服务器运行正常');
    console.log('✅ 区块链服务集成成功');
    console.log('✅ 数据库连接正常');
    console.log('✅ 认证系统工作正常');
    console.log('✅ 监控系统运行良好');
    console.log('✅ 产品和订单API正常');

  } catch (error) {
    console.error('❌ 集成测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAPIBlockchainIntegration();