const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 开始部署智能合约...');
  
  const [deployer] = await ethers.getSigners();
  console.log('📝 部署账户:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 账户余额:', ethers.formatEther(balance), 'ETH');

  // 1. 部署 MockUSDT
  console.log('\n📦 部署 MockUSDT...');
  const MockUSDT = await ethers.getContractFactory('MockUSDT');
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log('✅ MockUSDT 部署完成:', usdtAddress);

  // 2. 部署 QACard
  console.log('\n📦 部署 QACard...');
  const QACard = await ethers.getContractFactory('QACard');
  const qaCard = await upgrades.deployProxy(QACard, [
    'https://api.qa-app.com/nft/{id}.json', // 基础 URI
    deployer.address // 管理员地址
  ], { 
    initializer: 'initialize',
    kind: 'uups' 
  });
  await qaCard.waitForDeployment();
  const qaCardAddress = await qaCard.getAddress();
  console.log('✅ QACard 部署完成:', qaCardAddress);

  // 3. 部署 Treasury
  console.log('\n📦 部署 Treasury...');
  const Treasury = await ethers.getContractFactory('Treasury');
  const treasury = await upgrades.deployProxy(Treasury, [
    usdtAddress,
    deployer.address, // 管理员地址
    [deployer.address] // 操作员地址数组
  ], { 
    initializer: 'initialize',
    kind: 'uups' 
  });
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log('✅ Treasury 部署完成:', treasuryAddress);

  // 4. 配置权限
  console.log('\n🔧 配置合约权限...');
  const MINTER_ROLE = await qaCard.MINTER_ROLE();
  await qaCard.grantRole(MINTER_ROLE, treasuryAddress);
  console.log('✅ 已授予 Treasury 铸造权限');

  // 5. 保存部署信息
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MockUSDT: usdtAddress,
      QACard: qaCardAddress,
      Treasury: treasuryAddress,
    }
  };

  const deploymentsDir = './deployments/' + (await ethers.provider.getNetwork()).name;
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${deploymentsDir}/deployment-info.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n🎉 部署完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 合约地址:');
  console.log('• MockUSDT:', usdtAddress);
  console.log('• QACard:', qaCardAddress);
  console.log('• Treasury:', treasuryAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});