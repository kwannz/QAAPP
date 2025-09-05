import { ethers } from "hardhat";

async function main() {
  console.log("🔍 简单合约验证测试...");
  
  // 重新部署合约进行测试
  const [deployer, user1] = await ethers.getSigners();
  console.log("部署者:", deployer.address);
  console.log("用户1:", user1.address);
  
  // 部署 MockUSDT
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.waitForDeployment();
  const usdtAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT deployed to:", usdtAddress);
  
  // 部署 QACard
  const QACard = await ethers.getContractFactory("QACard");
  const qaCard = await QACard.deploy();
  await qaCard.waitForDeployment();
  const qaCardAddress = await qaCard.getAddress();
  await qaCard.initialize("https://api.qaapp.com/metadata/{id}.json", deployer.address);
  console.log("✅ QACard deployed to:", qaCardAddress);
  
  // 部署 Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  await treasury.initialize(usdtAddress, deployer.address, [deployer.address]);
  await treasury.setQACard(qaCardAddress);
  console.log("✅ Treasury deployed to:", treasuryAddress);
  
  // 给Treasury授予minter权限
  const minterRole = await qaCard.MINTER_ROLE();
  await qaCard.grantRole(minterRole, treasuryAddress);
  console.log("✅ Treasury granted MINTER role");
  
  // 测试Treasury方法
  try {
    const balance = await treasury.getBalance();
    console.log("✅ Treasury余额:", ethers.formatUnits(balance, 6), "USDT");
    
    const silverProduct = await treasury.getProductInfo(0);
    console.log("✅ 银卡产品:", silverProduct.name);
    
  } catch (error) {
    console.log("❌ Treasury测试失败:", error.message);
  }
  
  // 测试完整购买流程
  try {
    // 1. 给用户1铸造USDT
    const testAmount = ethers.parseUnits("1000", 6);
    await mockUSDT.mint(user1.address, testAmount);
    console.log("✅ 用户1获得USDT:", ethers.formatUnits(testAmount, 6));
    
    // 2. 用户1授权USDT
    const investAmount = ethers.parseUnits("500", 6);
    await mockUSDT.connect(user1).approve(treasuryAddress, investAmount);
    console.log("✅ 用户1授权USDT:", ethers.formatUnits(investAmount, 6));
    
    // 3. 用户1购买产品
    const tx = await treasury.connect(user1).purchaseProduct(0, investAmount);
    const receipt = await tx.wait();
    console.log("✅ 购买成功! Gas used:", receipt.gasUsed.toString());
    
    // 4. 验证结果
    const newBalance = await treasury.getBalance();
    console.log("✅ Treasury新余额:", ethers.formatUnits(newBalance, 6), "USDT");
    
    // 5. 检查用户NFT
    const nftBalance = await qaCard.balanceOf(user1.address, 1); // Silver card token ID
    console.log("✅ 用户1 NFT余额:", nftBalance.toString());
    
  } catch (error) {
    console.log("❌ 购买流程失败:", error);
  }
  
  console.log("🎉 简单测试完成!");
}

main().catch(console.error);