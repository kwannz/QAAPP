import { ethers } from 'hardhat';

/**
 * 智能合约交互功能测试
 * 测试Treasury购买产品和QACard NFT铸造功能
 */

const CONTRACTS = {
  usdt: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  qacard: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  treasury: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
};

async function main() {
  console.log('🔧 开始智能合约交互功能测试\n');

  const [deployer, admin, operator, user1] = await ethers.getSigners();

  // 获取合约实例
  const USDTContract = await ethers.getContractAt('MockUSDT', CONTRACTS.usdt);
  const QACardContract = await ethers.getContractAt('QACard', CONTRACTS.qacard);
  const TreasuryContract = await ethers.getContractAt('Treasury', CONTRACTS.treasury);

  try {
    // === 测试1: 检查合约权限设置 ===
    console.log('🔐 测试1: 检查合约权限');
    
    // 检查Treasury是否设置了QACard地址
    const treasuryQACard = await TreasuryContract.qaCard();
    console.log(`Treasury中的QACard地址: ${treasuryQACard}`);
    console.log(`QACard地址匹配: ${treasuryQACard.toLowerCase() === CONTRACTS.qacard.toLowerCase() ? '✅' : '❌'}`);

    // 检查QACard的MINTER_ROLE
    const MINTER_ROLE = await QACardContract.MINTER_ROLE();
    const hasMinterRole = await QACardContract.hasRole(MINTER_ROLE, CONTRACTS.treasury);
    console.log(`Treasury是否有MINTER权限: ${hasMinterRole ? '✅' : '❌'}`);

    if (!hasMinterRole) {
      console.log('⚠️ 尝试授予MINTER权限给Treasury...');
      try {
        const grantRoleTx = await QACardContract.connect(deployer).grantRole(MINTER_ROLE, CONTRACTS.treasury);
        await grantRoleTx.wait();
        console.log('✅ MINTER权限授予成功');
      } catch (error: any) {
        console.log(`❌ MINTER权限授予失败: ${error.message}`);
      }
    }
    console.log();

    // === 测试2: USDT代币准备 ===
    console.log('💰 测试2: USDT代币准备');
    
    // 确保用户有足够的USDT
    const transferAmount = ethers.parseUnits('5000', 6); // 5000 USDT
    await USDTContract.connect(deployer).transfer(user1.address, transferAmount);
    
    const user1Balance = await USDTContract.balanceOf(user1.address);
    console.log(`User1 USDT余额: ${ethers.formatUnits(user1Balance, 6)} USDT`);

    // 授权Treasury使用USDT
    await USDTContract.connect(user1).approve(CONTRACTS.treasury, transferAmount);
    console.log(`✅ User1已授权Treasury使用USDT\n`);

    // === 测试3: 查询产品信息 ===
    console.log('📋 测试3: 查询Treasury产品信息');
    
    try {
      // 尝试查询不同产品类型
      for (let productType = 0; productType < 3; productType++) {
        try {
          const productInfo = await TreasuryContract.getProductInfo(productType);
          console.log(`产品${productType}:`, {
            name: productInfo.name,
            minInvestment: ethers.formatUnits(productInfo.minInvestment, 6),
            maxInvestment: ethers.formatUnits(productInfo.maxInvestment, 6),
            apr: productInfo.apr.toString(),
            duration: productInfo.duration.toString(),
            isActive: productInfo.isActive
          });
        } catch (error: any) {
          console.log(`产品${productType}: 不可用`);
        }
      }
    } catch (error: any) {
      console.log(`❌ 查询产品信息失败: ${error.message}`);
    }
    console.log();

    // === 测试4: 尝试购买产品 ===
    console.log('🛒 测试4: 尝试购买产品');
    
    try {
      const productType = 0; // 尝试购买第一个产品
      const investmentAmount = ethers.parseUnits('1000', 6); // 1000 USDT
      
      console.log(`尝试购买产品类型: ${productType}`);
      console.log(`投资金额: ${ethers.formatUnits(investmentAmount, 6)} USDT`);

      // 购买前的余额
      const beforeBalance = await USDTContract.balanceOf(user1.address);
      const treasuryBeforeBalance = await USDTContract.balanceOf(CONTRACTS.treasury);
      
      console.log(`购买前用户余额: ${ethers.formatUnits(beforeBalance, 6)} USDT`);
      console.log(`购买前Treasury余额: ${ethers.formatUnits(treasuryBeforeBalance, 6)} USDT`);

      // 执行购买
      const purchaseTx = await TreasuryContract.connect(user1).purchaseProduct(productType, investmentAmount);
      const receipt = await purchaseTx.wait();
      
      // 购买后的余额
      const afterBalance = await USDTContract.balanceOf(user1.address);
      const treasuryAfterBalance = await USDTContract.balanceOf(CONTRACTS.treasury);
      
      console.log(`购买后用户余额: ${ethers.formatUnits(afterBalance, 6)} USDT`);
      console.log(`购买后Treasury余额: ${ethers.formatUnits(treasuryAfterBalance, 6)} USDT`);
      console.log(`Gas使用: ${receipt?.gasUsed.toString()}`);
      console.log('✅ 产品购买成功');

      // 查询购买事件
      const events = receipt?.logs;
      if (events && events.length > 0) {
        console.log(`触发事件数量: ${events.length}`);
      }

    } catch (error: any) {
      console.log(`❌ 产品购买失败: ${error.message}`);
    }
    console.log();

    // === 测试5: NFT铸造测试 ===
    console.log('🎨 测试5: QACard NFT铸造测试');
    
    try {
      const tokenId = 1;
      const amount = 1;
      const data = '0x';

      // 铸造前查询余额
      const beforeNFTBalance = await QACardContract.balanceOf(user1.address, tokenId);
      console.log(`铸造前NFT余额: ${beforeNFTBalance.toString()}`);

      // 尝试直接铸造 (如果有权限)
      try {
        const mintTx = await QACardContract.connect(deployer).mint(user1.address, tokenId, amount, data);
        const mintReceipt = await mintTx.wait();
        
        const afterNFTBalance = await QACardContract.balanceOf(user1.address, tokenId);
        console.log(`铸造后NFT余额: ${afterNFTBalance.toString()}`);
        console.log(`NFT铸造Gas使用: ${mintReceipt?.gasUsed.toString()}`);
        console.log('✅ NFT铸造成功');
        
      } catch (mintError: any) {
        console.log(`❌ NFT铸造失败: ${mintError.message}`);
      }

    } catch (error: any) {
      console.log(`❌ NFT测试失败: ${error.message}`);
    }
    console.log();

    // === 测试6: 查询用户投资信息 ===
    console.log('📊 测试6: 查询用户投资信息');
    
    try {
      const userInvestments = await TreasuryContract.getUserInvestments(user1.address);
      console.log(`用户投资记录数量: ${userInvestments.length}`);
      
      const userDeposits = await TreasuryContract.getUserDeposits(user1.address);
      console.log(`用户存款信息:`, {
        totalAmount: ethers.formatUnits(userDeposits.totalAmount, 6),
        lastDepositTime: new Date(Number(userDeposits.lastDepositTime) * 1000).toLocaleString()
      });

      console.log('✅ 用户投资信息查询成功');
    } catch (error: any) {
      console.log(`❌ 查询用户投资信息失败: ${error.message}`);
    }
    console.log();

    // === 测试7: 事件查询 ===
    console.log('📈 测试7: 智能合约事件查询');
    
    try {
      // 查询产品购买事件
      const purchaseFilter = TreasuryContract.filters.ProductPurchased();
      const purchaseEvents = await TreasuryContract.queryFilter(purchaseFilter, -50);
      console.log(`产品购买事件数量: ${purchaseEvents.length}`);

      // 查询NFT转账事件
      const transferFilter = QACardContract.filters.TransferSingle();
      const transferEvents = await QACardContract.queryFilter(transferFilter, -50);
      console.log(`NFT转账事件数量: ${transferEvents.length}`);

      console.log('✅ 事件查询成功');
    } catch (error: any) {
      console.log(`❌ 事件查询失败: ${error.message}`);
    }

    console.log('\n🎉 智能合约交互功能测试完成！');

  } catch (error: any) {
    console.error('❌ 测试过程中出现错误:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 测试脚本执行失败:', error);
    process.exit(1);
  });