import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 开始部署智能合约...");
  
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  const networkName = (await ethers.provider.getNetwork()).name || "localhost";
  const deploymentInfo = {
    network: networkName,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  // 1. 部署模拟USDT代币（测试网用）
  console.log("\n📦 部署MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.waitForDeployment();
  const usdtAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT deployed to:", usdtAddress);
  
  deploymentInfo.contracts.MockUSDT = {
    address: usdtAddress,
    constructorArgs: []
  };

  // 2. 部署QACard NFT合约
  console.log("\n📦 部署QACard...");
  const QACard = await ethers.getContractFactory("QACard");
  const qaCard = await QACard.deploy();
  await qaCard.waitForDeployment();
  const qaCardAddress = await qaCard.getAddress();
  console.log("✅ QACard deployed to:", qaCardAddress);
  
  // 初始化QACard合约
  console.log("🔧 初始化QACard合约...");
  const initQACardTx = await qaCard.initialize(
    "https://api.qaapp.com/metadata/{id}.json",
    deployer.address
  );
  await initQACardTx.wait();
  console.log("✅ QACard初始化完成");
  
  deploymentInfo.contracts.QACard = {
    address: qaCardAddress,
    constructorArgs: [],
    initializeArgs: ["https://api.qaapp.com/metadata/{id}.json", deployer.address]
  };

  // 3. 部署Treasury合约
  console.log("\n📦 部署Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ Treasury deployed to:", treasuryAddress);
  
  // 初始化Treasury合约
  console.log("🔧 初始化Treasury合约...");
  const initTx = await treasury.initialize(
    usdtAddress,
    deployer.address,
    [deployer.address] // 操作员
  );
  await initTx.wait();
  console.log("✅ Treasury初始化完成");
  
  deploymentInfo.contracts.Treasury = {
    address: treasuryAddress,
    constructorArgs: [],
    initializeArgs: [usdtAddress, deployer.address, [deployer.address]]
  };

  // 4. 给Treasury合约MINTER_ROLE权限（用于铸造NFT）
  console.log("🔧 给Treasury合约授予MINTER权限...");
  const minterRole = await qaCard.MINTER_ROLE();
  const grantRoleTx = await qaCard.grantRole(minterRole, treasuryAddress);
  await grantRoleTx.wait();
  console.log("✅ Treasury MINTER权限设置完成");

  // 5. 设置Treasury的QACard地址
  console.log("🔧 设置Treasury的QACard地址...");
  const setQACardTx = await treasury.setQACard(qaCardAddress);
  await setQACardTx.wait();
  console.log("✅ Treasury QACard地址设置完成");

  // 6. 铸造一些测试USDT给部署者
  console.log("💰 铸造测试USDT...");
  const mintAmount = ethers.parseUnits("1000000", 6); // 100万 USDT
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("✅ 铸造了", ethers.formatUnits(mintAmount, 6), "USDT给", deployer.address);

  // 验证部署
  console.log("\n🔍 验证合约部署...");
  
  // 验证MockUSDT
  const usdtBalance = await mockUSDT.balanceOf(deployer.address);
  console.log("USDT余额:", ethers.formatUnits(usdtBalance, 6));
  
  // 验证产品配置
  const goldProduct = await treasury.getProductInfo(1); // GOLD = 1
  console.log("黄金卡产品信息:", {
    name: goldProduct.name,
    minInvestment: ethers.formatUnits(goldProduct.minInvestment, 6),
    maxInvestment: ethers.formatUnits(goldProduct.maxInvestment, 6),
    apr: goldProduct.apr.toString(),
    duration: goldProduct.duration.toString(),
    isActive: goldProduct.isActive
  });

  // 保存部署信息
  const deploymentsDir = join(__dirname, "../deployments");
  try {
    mkdirSync(deploymentsDir, { recursive: true });
  } catch (error) {
    // 目录可能已经存在
  }
  
  const deploymentFile = join(deploymentsDir, `${networkName}.json`);
  writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 部署信息已保存到:", deploymentFile);

  // 生成环境变量文件
  const envContent = `# Sepolia测试网合约地址
TREASURY_CONTRACT_TESTNET="${treasuryAddress}"
QACARD_CONTRACT_TESTNET="${qaCardAddress}"
USDT_CONTRACT_TESTNET="${usdtAddress}"

# 区块链配置
BLOCKCHAIN_CHAIN_ID=11155111
BLOCKCHAIN_RPC_URL="https://sepolia.infura.io/v3/YOUR-PROJECT-ID"
# BLOCKCHAIN_PRIVATE_KEY="YOUR-PRIVATE-KEY" # 仅用于后端服务
`;

  const envFile = join(__dirname, "../.env.testnet");
  writeFileSync(envFile, envContent);
  console.log("💾 环境变量已保存到:", envFile);

  console.log("\n🎉 部署完成!");
  console.log("=".repeat(50));
  console.log("📋 部署摘要:");
  console.log("  网络:", networkName);
  console.log("  MockUSDT:", usdtAddress);
  console.log("  QACard:", qaCardAddress);
  console.log("  Treasury:", treasuryAddress);
  console.log("=".repeat(50));
  console.log("\n📝 下一步:");
  console.log("1. 更新前端的合约地址配置");
  console.log("2. 更新后端的环境变量");
  console.log("3. 在区块链浏览器上验证合约");
  console.log("4. 测试产品购买流程");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });