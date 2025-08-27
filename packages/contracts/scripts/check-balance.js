const { ethers } = require('hardhat');

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  const balanceEth = ethers.formatEther(balance);
  
  console.log('==============================');
  console.log('🔍 Sepolia 测试网账户检查');
  console.log('==============================');
  console.log(`账户地址: ${address}`);
  console.log(`当前余额: ${balanceEth} ETH`);
  console.log(`需要余额: 0.03 ETH`);
  
  if (parseFloat(balanceEth) >= 0.03) {
    console.log('✅ 余额充足，可以开始部署合约！');
  } else {
    console.log('❌ 余额不足，请先获取测试网ETH');
    console.log('📝 获取测试网ETH地址:');
    console.log('   - https://sepoliafaucet.com/');
    console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia');
  }
  console.log('==============================');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});