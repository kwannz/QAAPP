import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get } = deployments;
  const { deployer, treasury, operator } = await getNamedAccounts();

  console.log(`Deploying Treasury to ${network.name} with account: ${deployer}`);

  // 获取USDT合约地址
  let usdtAddress: string;
  
  if (network.name === 'sepolia' || network.name === 'polygon-mumbai' || network.name === 'localhost') {
    // 测试网使用MockUSDT
    const mockUSDT = await get('MockUSDT');
    usdtAddress = mockUSDT.address;
  } else {
    // 主网使用真实USDT地址
    const usdtAddresses: { [key: string]: string } = {
      'ethereum': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'polygon': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      'arbitrum': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    };
    
    usdtAddress = usdtAddresses[network.name];
    if (!usdtAddress) {
      throw new Error(`No USDT address configured for network: ${network.name}`);
    }
  }

  // 准备初始化参数
  const admin = treasury || deployer;
  const operators = [operator || deployer];

  console.log(`Treasury admin: ${admin}`);
  console.log(`Treasury operators:`, operators);
  console.log(`USDT address: ${usdtAddress}`);

  const treasuryContract = await deploy('Treasury', {
    from: deployer,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [usdtAddress, admin, operators],
        },
      },
    },
    log: true,
    waitConfirmations: network.name === 'localhost' ? 1 : 2,
  });

  console.log(`Treasury deployed to: ${treasuryContract.address}`);

  // 设置QACard合约地址
  if (treasuryContract.newlyDeployed) {
    const qaCard = await get('QACard');
    const Treasury = await hre.ethers.getContractAt('Treasury', treasuryContract.address);
    
    console.log(`Setting QACard address: ${qaCard.address}`);
    const setQACardTx = await Treasury.setQACard(qaCard.address);
    await setQACardTx.wait();
    console.log('QACard address set in Treasury');

    // 设置Treasury地址到QACard (授予minting权限)
    const QACard = await hre.ethers.getContractAt('QACard', qaCard.address);
    const DEFAULT_ADMIN_ROLE = await QACard.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await QACard.MINTER_ROLE();
    
    console.log(`Granting MINTER_ROLE to Treasury: ${treasuryContract.address}`);
    const grantRoleTx = await QACard.grantRole(MINTER_ROLE, treasuryContract.address);
    await grantRoleTx.wait();
    console.log('MINTER_ROLE granted to Treasury');
  }

  // 验证合约 (如果不是本地网络)
  if (network.name !== 'localhost' && hre.network.config.chainId !== 31337) {
    try {
      // 注意：代理合约的验证比较复杂，这里只验证实现合约
      const implementationAddress = await deployments.getImplementationAddress('Treasury');
      await hre.run('verify:verify', {
        address: implementationAddress,
        constructorArguments: [],
      });
      console.log('Treasury implementation verified on Etherscan');
    } catch (error) {
      console.log('Treasury verification failed:', error);
    }
  }
};

export default func;
func.tags = ['Treasury'];
func.dependencies = ['MockUSDT', 'QACard'];
func.id = 'deploy_treasury';