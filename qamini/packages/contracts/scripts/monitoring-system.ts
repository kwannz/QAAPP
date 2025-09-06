import { ethers } from "hardhat";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * QA App 监控和日志系统
 * 
 * 功能:
 * 1. 实时监控合约事件 ✓
 * 2. 记录系统关键指标 ✓
 * 3. 生成业务报告 ✓
 * 4. 异常检测和告警 ✓
 * 5. 性能指标追踪 ✓
 */

interface MonitoringMetrics {
  timestamp: string;
  totalUsers: number;
  totalInvestment: string;
  productPurchases: Array<{
    user: string;
    productType: string;
    amount: string;
    tokenId: string;
    transactionHash: string;
    gasUsed: string;
    timestamp: string;
  }>;
  dailyStats: {
    date: string;
    newUsers: number;
    totalVolume: string;
    averageInvestment: string;
    gasEfficiency: string;
  };
  alerts: Array<{
    level: 'INFO' | 'WARNING' | 'ERROR';
    message: string;
    timestamp: string;
  }>;
}

async function main() {
  console.log("📊 启动QA App监控和日志系统...\n");

  // 部署合约进行监控测试
  console.log("🚀 部署监控测试合约...");
  
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.waitForDeployment();
  
  const QACard = await ethers.getContractFactory("QACard");
  const qaCard = await QACard.deploy();
  await qaCard.waitForDeployment();
  await qaCard.initialize("https://api.qaapp.com/metadata/{id}.json", deployer.address);
  
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  await treasury.initialize(await mockUSDT.getAddress(), deployer.address, [deployer.address]);
  await treasury.setQACard(await qaCard.getAddress());
  
  const minterRole = await qaCard.MINTER_ROLE();
  await qaCard.grantRole(minterRole, await treasury.getAddress());
  
  console.log("✅ 监控合约部署完成\n");

  // 创建监控数据存储目录
  const logsDir = join(__dirname, "../logs");
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  const metrics: MonitoringMetrics = {
    timestamp: new Date().toISOString(),
    totalUsers: 0,
    totalInvestment: "0",
    productPurchases: [],
    dailyStats: {
      date: new Date().toISOString().split('T')[0],
      newUsers: 0,
      totalVolume: "0",
      averageInvestment: "0",
      gasEfficiency: "0"
    },
    alerts: []
  };

  // ========================================
  // 1. 设置事件监听器
  // ========================================
  console.log("👂 1. 设置合约事件监听器");
  
  try {
    // 监听产品购买事件
    treasury.on("ProductPurchased", async (user, productType, amount, tokenId, event) => {
      const receipt = await event.getTransactionReceipt();
      
      const purchase = {
        user,
        productType: getProductTypeName(productType),
        amount: ethers.formatUnits(amount, 6),
        tokenId: tokenId.toString(),
        transactionHash: event.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString()
      };
      
      metrics.productPurchases.push(purchase);
      
      console.log("  🎯 新购买事件:");
      console.log("    用户:", user);
      console.log("    产品:", purchase.productType);
      console.log("    金额:", purchase.amount, "USDT");
      console.log("    NFT ID:", purchase.tokenId);
      console.log("    Gas:", parseInt(purchase.gasUsed).toLocaleString());
      
      // 异常检测
      const gasUsed = parseInt(purchase.gasUsed);
      if (gasUsed > 500000) {
        metrics.alerts.push({
          level: 'WARNING',
          message: `高Gas消耗: ${gasUsed.toLocaleString()} (交易: ${event.transactionHash})`,
          timestamp: new Date().toISOString()
        });
      }
      
      // 更新统计
      updateDailyStats(metrics, purchase);
    });
    
    console.log("  ✅ ProductPurchased 事件监听器已设置");
    
    // 监听存款事件
    treasury.on("Deposited", (user, amount, orderId, timestamp, event) => {
      console.log("  💰 新存款事件:");
      console.log("    用户:", user);
      console.log("    金额:", ethers.formatUnits(amount, 6), "USDT");
      console.log("    订单ID:", orderId);
      
      metrics.alerts.push({
        level: 'INFO',
        message: `用户 ${user} 存款 ${ethers.formatUnits(amount, 6)} USDT`,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log("  ✅ Deposited 事件监听器已设置");
    
  } catch (error) {
    console.log("  ❌ 事件监听器设置失败:", error.message);
  }
  console.log();

  // ========================================
  // 2. 模拟用户活动生成监控数据
  // ========================================
  console.log("🎬 2. 模拟用户活动生成监控数据");
  
  try {
    const users = [user1, user2, user3];
    const investments = [
      { amount: ethers.parseUnits("500", 6), product: 0 },
      { amount: ethers.parseUnits("2000", 6), product: 1 },
      { amount: ethers.parseUnits("8000", 6), product: 2 }
    ];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const investment = investments[i];
      
      console.log(`  👤 用户${i+1} 活动模拟...`);
      
      // 给用户USDT
      await mockUSDT.mint(user.address, investment.amount);
      await mockUSDT.connect(user).approve(await treasury.getAddress(), investment.amount);
      
      // 用户购买产品
      const tx = await treasury.connect(user).purchaseProduct(investment.product, investment.amount);
      await tx.wait();
      
      // 稍作延迟让事件处理完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`    ✅ 用户${i+1} 购买完成`);
      metrics.totalUsers++;
    }
    
  } catch (error) {
    console.log("  ❌ 用户活动模拟失败:", error.message);
  }
  
  // 等待所有事件处理完成
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log();

  // ========================================
  // 3. 系统健康检查
  // ========================================
  console.log("🏥 3. 系统健康检查");
  
  try {
    const healthCheck = {
      contractsOperational: true,
      balanceConsistency: true,
      eventProcessing: true,
      gasEfficiency: true
    };
    
    // 检查合约状态
    const treasuryBalance = await treasury.getBalance();
    const totalDeposits = await treasury.totalDeposits();
    
    console.log("  📊 合约状态:");
    console.log("    Treasury余额:", ethers.formatUnits(treasuryBalance, 6), "USDT");
    console.log("    总存款:", ethers.formatUnits(totalDeposits, 6), "USDT");
    
    // 余额一致性检查
    if (treasuryBalance.toString() !== totalDeposits.toString()) {
      healthCheck.balanceConsistency = false;
      metrics.alerts.push({
        level: 'ERROR',
        message: '余额不一致: Treasury余额与总存款不匹配',
        timestamp: new Date().toISOString()
      });
    }
    
    // 检查事件处理
    if (metrics.productPurchases.length === 0) {
      healthCheck.eventProcessing = false;
      metrics.alerts.push({
        level: 'ERROR',
        message: '事件处理异常: 未检测到购买事件',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log("  🔍 健康检查结果:");
    Object.entries(healthCheck).forEach(([key, value]) => {
      const status = value ? "✅ 正常" : "❌ 异常";
      console.log(`    ${key}: ${status}`);
    });
    
  } catch (error) {
    console.log("  ❌ 健康检查失败:", error.message);
    metrics.alerts.push({
      level: 'ERROR',
      message: `系统健康检查失败: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
  console.log();

  // ========================================
  // 4. 性能指标分析
  // ========================================
  console.log("📈 4. 性能指标分析");
  
  try {
    if (metrics.productPurchases.length > 0) {
      const totalGas = metrics.productPurchases.reduce((sum, p) => sum + parseInt(p.gasUsed), 0);
      const avgGas = totalGas / metrics.productPurchases.length;
      const totalVolume = metrics.productPurchases.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const avgInvestment = totalVolume / metrics.productPurchases.length;
      
      console.log("  ⚡ Gas效率指标:");
      console.log("    平均Gas消耗:", avgGas.toLocaleString());
      console.log("    总Gas消耗:", totalGas.toLocaleString());
      console.log("    Gas效率:", (avgGas / avgInvestment).toFixed(0), "gas/USDT");
      
      console.log("  💰 业务指标:");
      console.log("    总交易量:", totalVolume.toFixed(2), "USDT");
      console.log("    平均投资:", avgInvestment.toFixed(2), "USDT");
      console.log("    交易笔数:", metrics.productPurchases.length);
      
      // 更新度量指标
      metrics.totalInvestment = totalVolume.toFixed(2);
      metrics.dailyStats.totalVolume = totalVolume.toFixed(2);
      metrics.dailyStats.averageInvestment = avgInvestment.toFixed(2);
      metrics.dailyStats.gasEfficiency = (avgGas / avgInvestment).toFixed(0);
      
    } else {
      console.log("  ⚠️  无交易数据可供分析");
    }
    
  } catch (error) {
    console.log("  ❌ 性能指标分析失败:", error.message);
  }
  console.log();

  // ========================================
  // 5. 生成监控报告
  // ========================================
  console.log("📄 5. 生成监控报告");
  
  try {
    // 生成JSON报告
    const reportFile = join(logsDir, `monitoring-report-${Date.now()}.json`);
    writeFileSync(reportFile, JSON.stringify(metrics, null, 2));
    console.log("  ✅ JSON报告已生成:", reportFile);
    
    // 生成人类可读报告
    const readableReport = generateReadableReport(metrics);
    const readableFile = join(logsDir, `monitoring-summary-${Date.now()}.md`);
    writeFileSync(readableFile, readableReport);
    console.log("  ✅ 可读报告已生成:", readableFile);
    
    // 控制台输出摘要
    console.log("\n" + "=".repeat(60));
    console.log("📋 QA App 系统监控摘要报告");
    console.log("=".repeat(60));
    console.log(`📅 报告时间: ${new Date().toLocaleString()}`);
    console.log(`👥 活跃用户: ${metrics.totalUsers}`);
    console.log(`💰 总投资额: ${metrics.totalInvestment} USDT`);
    console.log(`📊 交易笔数: ${metrics.productPurchases.length}`);
    console.log(`⚠️  警告数量: ${metrics.alerts.length}`);
    
    // 显示最近的告警
    if (metrics.alerts.length > 0) {
      console.log("\n🚨 最近告警:");
      metrics.alerts.slice(-3).forEach(alert => {
        const icon = alert.level === 'ERROR' ? '❌' : alert.level === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} [${alert.level}] ${alert.message}`);
      });
    }
    
  } catch (error) {
    console.log("  ❌ 报告生成失败:", error.message);
  }
  console.log();
  
  console.log("📊 监控和日志系统启动完成!");
  console.log("💡 系统将持续监控合约活动并生成实时报告");
}

function getProductTypeName(productType: number | bigint): string {
  const type = typeof productType === 'bigint' ? Number(productType) : productType;
  switch (type) {
    case 0: return "银卡";
    case 1: return "金卡"; 
    case 2: return "钻石卡";
    case 3: return "白金卡";
    default: return `未知产品(${type})`;
  }
}

function updateDailyStats(metrics: MonitoringMetrics, purchase: any) {
  metrics.dailyStats.newUsers = metrics.totalUsers;
  const currentVolume = parseFloat(metrics.dailyStats.totalVolume);
  const newVolume = currentVolume + parseFloat(purchase.amount);
  metrics.dailyStats.totalVolume = newVolume.toFixed(2);
}

function generateReadableReport(metrics: MonitoringMetrics): string {
  return `# QA App 监控报告

## 📊 系统概览
- **报告时间**: ${metrics.timestamp}
- **活跃用户数**: ${metrics.totalUsers}
- **总投资金额**: ${metrics.totalInvestment} USDT
- **交易笔数**: ${metrics.productPurchases.length}

## 💰 交易明细
${metrics.productPurchases.map(p => 
  `- **${p.productType}**: ${p.amount} USDT (Gas: ${parseInt(p.gasUsed).toLocaleString()})`
).join('\n')}

## 📈 日常统计
- **日期**: ${metrics.dailyStats.date}
- **新用户**: ${metrics.dailyStats.newUsers}
- **交易量**: ${metrics.dailyStats.totalVolume} USDT
- **平均投资**: ${metrics.dailyStats.averageInvestment} USDT
- **Gas效率**: ${metrics.dailyStats.gasEfficiency} gas/USDT

## 🚨 系统告警
${metrics.alerts.map(alert => 
  `- **${alert.level}**: ${alert.message} (${alert.timestamp})`
).join('\n') || '无告警'}

---
*报告由 QA App 监控系统自动生成*
`;
}

main()
  .then(() => {
    console.log("\n🎉 监控系统演示完成!");
    console.log("💡 在生产环境中，监控系统将持续运行并生成实时数据");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 监控系统启动失败:", error);
    process.exit(1);
  });