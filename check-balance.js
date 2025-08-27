const { ethers } = require('hardhat');

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  
  try {
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log(`账户地址: ${address}`);
    console.log(`余额: ${balanceEth} ETH`);
    console.log(`余额(Wei): ${balance.toString()}`);
    
    if (parseFloat(balanceEth) >= 0.03) {
      console.log('✅ 余额充足，可以开始部署！');
      return true;
    } else {
      console.log('❌ 余额不足，需要至少 0.03 ETH');
      return false;
    }
  } catch (error) {
    console.error('检查余额失败:', error.message);
    return false;
  }
}

checkBalance().then(success => {
  process.exit(success ? 0 : 1);
});