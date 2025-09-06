import { ethers } from 'hardhat'

async function main() {
  try {
    console.log('🔗 Testing Sepolia RPC connection...')
    
    // 获取provider
    const provider = ethers.provider
    const network = await provider.getNetwork()
    
    console.log(`✅ Network: ${network.name} (Chain ID: ${network.chainId})`)
    
    // 测试获取最新区块
    const blockNumber = await provider.getBlockNumber()
    console.log(`✅ Latest block: ${blockNumber}`)
    
    // 测试获取账户列表
    const signers = await ethers.getSigners()
    if (signers.length > 0) {
      const address = await signers[0].getAddress()
      const balance = await provider.getBalance(address)
      console.log(`✅ Deployer address: ${address}`)
      console.log(`✅ ETH Balance: ${ethers.formatEther(balance)} ETH`)
    }
    
    console.log('🎉 RPC connection test successful!')
    
  } catch (error: any) {
    console.error('❌ RPC connection failed:')
    console.error(error.message)
    process.exit(1)
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}