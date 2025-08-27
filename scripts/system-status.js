#!/usr/bin/env node
/**
 * QA App 系统状态检查脚本
 * 评估系统各组件的完成度和功能状态
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPIEndpoint(url, method = 'GET', data = null) {
  try {
    const fetch = await import('node-fetch').then(m => m.default);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkSmartContracts() {
  log('blue', '🔗 检查智能合约...');
  
  const contractFiles = [
    'packages/contracts/contracts/Treasury.sol',
    'packages/contracts/contracts/QACard.sol',
    'packages/contracts/contracts/MockUSDT.sol'
  ];

  let score = 0;
  let details = [];

  for (const file of contractFiles) {
    const exists = await checkFileExists(file);
    if (exists) {
      score += 1;
      details.push(`✅ ${file}`);
    } else {
      details.push(`❌ ${file} - 缺失`);
    }
  }

  // 检查编译状态
  try {
    const { stdout } = await execAsync('cd packages/contracts && npx hardhat compile --quiet');
    details.push('✅ 合约编译成功');
    score += 1;
  } catch (error) {
    details.push('❌ 合约编译失败');
  }

  // 检查ETH支付功能
  try {
    const { stdout } = await execAsync('cd packages/contracts && jq ".abi[] | select(.name == \\"purchaseProductWithETH\\")" artifacts/contracts/Treasury.sol/Treasury.json');
    if (stdout.trim()) {
      details.push('✅ ETH支付功能已实现');
      score += 1;
    } else {
      details.push('❌ ETH支付功能缺失');
    }
  } catch (error) {
    details.push('❌ 无法验证ETH支付功能');
  }

  return {
    category: '智能合约',
    score: Math.round((score / 5) * 100),
    details
  };
}

async function checkAPI() {
  log('blue', '🌐 检查API服务...');
  
  let score = 0;
  let details = [];

  // 检查健康状态
  const healthCheck = await testAPIEndpoint('http://localhost:3001/health');
  if (healthCheck.success) {
    details.push('✅ API服务运行正常');
    score += 2;
  } else {
    details.push('❌ API服务无响应');
  }

  // 检查USDT订单端点
  const usdtOrder = await testAPIEndpoint('http://localhost:3001/api/orders', 'POST', {
    productId: 'test-product',
    usdtAmount: 100
  });
  
  if (usdtOrder.success) {
    details.push('✅ USDT支付端点正常');
    score += 2;
  } else {
    details.push('❌ USDT支付端点失败');
  }

  // 检查ETH订单端点
  const ethOrder = await testAPIEndpoint('http://localhost:3001/api/orders/eth', 'POST', {
    productId: 'test-product',
    ethAmount: 0.1
  });
  
  if (ethOrder.success && ethOrder.data.metadata && ethOrder.data.metadata.paymentType === 'ETH') {
    details.push('✅ ETH支付端点正常');
    details.push(`✅ ETH转换: ${ethOrder.data.metadata.ethAmount} ETH → ${ethOrder.data.usdtAmount} USDT`);
    score += 3;
  } else {
    details.push('❌ ETH支付端点失败');
  }

  return {
    category: 'API服务',
    score: Math.round((score / 7) * 100),
    details
  };
}

async function checkFrontend() {
  log('blue', '🎨 检查前端应用...');
  
  let score = 0;
  let details = [];

  // 检查关键前端文件
  const frontendFiles = [
    'apps/web/components/products/ProductPurchase.tsx',
    'apps/web/lib/hooks/use-contracts.ts',
    'apps/web/lib/contracts/abis.ts',
    'apps/web/lib/wagmi-config.ts'
  ];

  for (const file of frontendFiles) {
    const exists = await checkFileExists(file);
    if (exists) {
      score += 1;
      details.push(`✅ ${file}`);
    } else {
      details.push(`❌ ${file} - 缺失`);
    }
  }

  // 检查ETH支付功能
  try {
    const hookContent = await fs.promises.readFile('apps/web/lib/hooks/use-contracts.ts', 'utf8');
    if (hookContent.includes('purchaseProductWithETH')) {
      details.push('✅ ETH支付Hook已实现');
      score += 1;
    } else {
      details.push('❌ ETH支付Hook缺失');
    }
  } catch (error) {
    details.push('❌ 无法检查ETH支付Hook');
  }

  // 检查ABI更新
  try {
    const abiContent = await fs.promises.readFile('apps/web/lib/contracts/abis.ts', 'utf8');
    if (abiContent.includes('purchaseProductWithETH')) {
      details.push('✅ Treasury ABI已更新');
      score += 1;
    } else {
      details.push('❌ Treasury ABI需要更新');
    }
  } catch (error) {
    details.push('❌ 无法检查ABI文件');
  }

  // 检查构建状态
  try {
    const buildCheck = await testAPIEndpoint('http://localhost:3000');
    if (buildCheck.success || buildCheck.status === 200) {
      details.push('✅ 前端应用运行正常');
      score += 2;
    } else {
      details.push('❌ 前端应用无法访问');
    }
  } catch (error) {
    details.push('❌ 前端应用检查失败');
  }

  return {
    category: '前端应用',
    score: Math.round((score / 8) * 100),
    details
  };
}

async function checkDatabase() {
  log('blue', '🗄️ 检查数据库配置...');
  
  let score = 0;
  let details = [];

  // 检查数据库文件
  const dbFiles = [
    'packages/database/prisma/schema.prisma',
    'packages/database/src/config.ts',
    'packages/database/src/index.ts'
  ];

  for (const file of dbFiles) {
    const exists = await checkFileExists(file);
    if (exists) {
      score += 1;
      details.push(`✅ ${file}`);
    } else {
      details.push(`❌ ${file} - 缺失`);
    }
  }

  // 检查配置验证
  try {
    const { stdout } = await execAsync('cd packages/database && node -e "const { validateDatabaseConfig } = require(\'./dist/src/config.js\'); console.log(validateDatabaseConfig() ? \'OK\' : \'FAIL\')"');
    if (stdout.trim().includes('OK')) {
      details.push('✅ 数据库配置验证通过');
      score += 2;
    } else {
      details.push('❌ 数据库配置验证失败');
    }
  } catch (error) {
    details.push('❌ 无法验证数据库配置');
  }

  return {
    category: '数据库',
    score: Math.round((score / 5) * 100),
    details
  };
}

async function checkDeployment() {
  log('blue', '🚀 检查部署状态...');
  
  let score = 0;
  let details = [];

  // 检查Sepolia连接
  try {
    const { stdout } = await execAsync('cd packages/contracts && npx hardhat --network sepolia run scripts/test-connection.ts');
    if (stdout.includes('RPC connection test successful')) {
      details.push('✅ Sepolia测试网连接正常');
      score += 2;
    } else {
      details.push('❌ Sepolia测试网连接失败');
    }
  } catch (error) {
    details.push('❌ 无法测试Sepolia连接');
  }

  // 检查部署脚本
  const deployFiles = [
    'packages/contracts/scripts/test-connection.ts',
    'packages/database/scripts/deploy-config.sh'
  ];

  for (const file of deployFiles) {
    const exists = await checkFileExists(file);
    if (exists) {
      score += 1;
      details.push(`✅ ${file}`);
    } else {
      details.push(`❌ ${file} - 缺失`);
    }
  }

  // 检查合约部署状态 (目前还未部署)
  details.push('⏳ 智能合约尚未部署到测试网');
  
  return {
    category: '部署准备',
    score: Math.round((score / 4) * 100),
    details
  };
}

async function generateReport(results) {
  log('magenta', '\n📊 QA App 系统状态报告');
  log('magenta', '=' .repeat(50));
  
  let totalScore = 0;
  let maxScore = 0;

  for (const result of results) {
    totalScore += result.score;
    maxScore += 100;
    
    const statusColor = result.score >= 80 ? 'green' : result.score >= 60 ? 'yellow' : 'red';
    log(statusColor, `\n${result.category}: ${result.score}%`);
    
    for (const detail of result.details) {
      console.log(`  ${detail}`);
    }
  }

  const overallScore = Math.round(totalScore / results.length);
  const statusColor = overallScore >= 80 ? 'green' : overallScore >= 60 ? 'yellow' : 'red';
  
  log('cyan', '\n' + '='.repeat(50));
  log(statusColor, `🎯 系统整体完成度: ${overallScore}%`);
  
  if (overallScore >= 80) {
    log('green', '✅ 系统状态良好，大部分功能正常运行');
  } else if (overallScore >= 60) {
    log('yellow', '⚠️ 系统基本可用，但需要完善部分功能');
  } else {
    log('red', '❌ 系统需要重要修复才能正常使用');
  }

  // 下一步建议
  log('blue', '\n📋 下一步建议:');
  if (overallScore < 100) {
    console.log('  • 获取Sepolia测试网ETH用于合约部署');
    console.log('  • 完成智能合约部署到测试网');
    console.log('  • 进行端到端的ETH支付流程测试');
    console.log('  • 配置生产环境数据库连接');
    console.log('  • 实施用户认证和授权系统');
  } else {
    console.log('  • 系统已基本完成，可以进行生产部署');
  }

  return overallScore;
}

async function main() {
  log('cyan', '🔍 开始系统状态检查...\n');

  const results = [];

  try {
    // 依次检查各组件
    results.push(await checkSmartContracts());
    results.push(await checkAPI());
    results.push(await checkFrontend());
    results.push(await checkDatabase());
    results.push(await checkDeployment());

    // 生成报告
    const overallScore = await generateReport(results);
    
    // 输出到文件
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore,
      components: results
    };
    
    await fs.promises.writeFile(
      'SYSTEM_STATUS_REPORT.json',
      JSON.stringify(reportData, null, 2)
    );
    
    log('blue', `\n📄 详细报告已保存到: SYSTEM_STATUS_REPORT.json`);
    
    process.exit(overallScore >= 60 ? 0 : 1);
    
  } catch (error) {
    log('red', `❌ 系统检查失败: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}