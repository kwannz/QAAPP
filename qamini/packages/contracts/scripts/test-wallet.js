const { ethers } = require('hardhat');

async function main() {
  // 您提供的测试钱包私钥
  const testPrivateKey = '0x0f62bf7e98cf01764867cd995f225b340da5cee961f8b3244eeffba8317741fa';
  
  try {
    console.log('\n🔧 配置测试钱包...');
    
    // 创建测试钱包
    const testWallet = new ethers.Wallet(testPrivateKey);
    console.log(`📍 测试钱包地址: ${testWallet.address}`);
    
    // 连接到本地网络
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const connectedWallet = testWallet.connect(provider);
    
    // 获取网络信息
    const network = await provider.getNetwork();
    console.log(`🌐 网络 ID: ${network.chainId}`);
    console.log(`🌐 网络名称: ${network.name}`);
    
    // 检查余额
    const balance = await provider.getBalance(testWallet.address);
    console.log(`💰 当前余额: ${ethers.formatEther(balance)} ETH`);
    
    // 如果余额为0，从默认账户转账
    if (balance === 0n) {
      console.log('\n💸 余额为0，从默认账户转账...');
      
      // 获取默认账户（第一个Hardhat账户）
      const [deployer] = await ethers.getSigners();
      console.log(`📤 从账户转账: ${deployer.address}`);
      
      // 转账10 ETH
      const tx = await deployer.sendTransaction({
        to: testWallet.address,
        value: ethers.parseEther('10.0')
      });
      
      console.log(`📋 交易哈希: ${tx.hash}`);
      await tx.wait();
      
      // 检查新余额
      const newBalance = await provider.getBalance(testWallet.address);
      console.log(`✅ 转账完成，新余额: ${ethers.formatEther(newBalance)} ETH`);
    }
    
    // 检查是否有已部署的合约
    try {
      const chainId = network.chainId;
      console.log('\n📋 检查已部署的合约...');
      
      // 尝试获取合约地址（如果存在部署文件）
      const fs = require('fs');
      const path = require('path');
      const deploymentPath = path.join(__dirname, '../deployments/localhost');
      
      if (fs.existsSync(deploymentPath)) {
        const files = fs.readdirSync(deploymentPath);
        console.log('📂 找到的合约文件:', files);
        
        // 检查QACard合约
        const qaCardFile = path.join(deploymentPath, 'QACard.json');
        if (fs.existsSync(qaCardFile)) {
          const qaCardData = JSON.parse(fs.readFileSync(qaCardFile, 'utf8'));
          console.log(`🎴 QACard合约地址: ${qaCardData.address}`);
          
          // 测试与合约的连接
          const qaCard = new ethers.Contract(qaCardData.address, qaCardData.abi, connectedWallet);
          const name = await qaCard.name();
          const symbol = await qaCard.symbol();
          console.log(`🎴 合约名称: ${name}`);
          console.log(`🎴 合约符号: ${symbol}`);
        }
      } else {
        console.log('📂 还没有部署文件，等待合约部署完成');
      }
    } catch (error) {
      console.log('⚠️ 合约检查失败:', error.message);
    }
    
    console.log('\n✅ 测试钱包配置完成！');
    console.log('\n📋 总结:');
    console.log(`   地址: ${testWallet.address}`);
    console.log(`   余额: ${ethers.formatEther(await provider.getBalance(testWallet.address))} ETH`);
    console.log(`   网络: ${network.name} (${network.chainId})`);
    
  } catch (error) {
    console.error('❌ 配置测试钱包时出错:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });