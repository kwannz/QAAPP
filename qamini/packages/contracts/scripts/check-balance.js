const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log('📝 检查账户:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log('💰 余额:', balanceInEth, 'ETH');
  
  const minRequired = '0.1';
  if (parseFloat(balanceInEth) < parseFloat(minRequired)) {
    console.log('⚠️  余额不足，建议至少拥有', minRequired, 'ETH 进行部署');
    process.exit(1);
  } else {
    console.log('✅ 余额充足，可以进行部署');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});