import { ethers } from 'hardhat';

async function main() {
  const [deployer, admin, operator] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  console.log('Admin:', admin.address);
  console.log('Operator:', operator.address);

  // 合约地址 (来自部署输出)
  const treasuryAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
  const qaCardAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

  // 获取合约实例
  const Treasury = await ethers.getContractAt('Treasury', treasuryAddress);
  const QACard = await ethers.getContractAt('QACard', qaCardAddress);

  try {
    // 1. 设置QACard地址到Treasury
    console.log('Setting QACard address in Treasury...');
    const qaCardCurrent = await Treasury.qaCard();
    
    if (qaCardCurrent === '0x0000000000000000000000000000000000000000') {
      const setQACardTx = await Treasury.connect(admin).setQACard(qaCardAddress);
      await setQACardTx.wait();
      console.log('✅ QACard address set in Treasury');
    } else {
      console.log('✅ QACard already set in Treasury:', qaCardCurrent);
    }

    // 2. 设置Treasury地址到QACard (授予minting权限)
    const MINTER_ROLE = await QACard.MINTER_ROLE();
    const hasMinterRole = await QACard.hasRole(MINTER_ROLE, treasuryAddress);
    
    if (!hasMinterRole) {
      console.log('Granting MINTER_ROLE to Treasury...');
      const grantRoleTx = await QACard.connect(deployer).grantRole(MINTER_ROLE, treasuryAddress);
      await grantRoleTx.wait();
      console.log('✅ MINTER_ROLE granted to Treasury');
    } else {
      console.log('✅ Treasury already has MINTER_ROLE');
    }

    console.log('\n🎉 Deployment fix completed successfully!');
    console.log('Contracts:');
    console.log(`- MockUSDT: 0x5FbDB2315678afecb367f032d93F642f64180aa3`);
    console.log(`- QACard: ${qaCardAddress}`);
    console.log(`- Treasury: ${treasuryAddress}`);

  } catch (error) {
    console.error('❌ Error during deployment fix:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });