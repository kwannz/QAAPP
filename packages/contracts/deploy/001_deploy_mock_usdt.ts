import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // 只在测试网络部署MockUSDT
  if (network.name === 'sepolia' || network.name === 'polygon-mumbai' || network.name === 'localhost') {
    console.log(`Deploying MockUSDT to ${network.name} with account: ${deployer}`);

    const mockUSDT = await deploy('MockUSDT', {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.name === 'localhost' ? 1 : 2,
    });

    console.log(`MockUSDT deployed to: ${mockUSDT.address}`);

    // 验证合约 (如果不是本地网络)
    if (network.name !== 'localhost' && hre.network.config.chainId !== 31337) {
      try {
        await hre.run('verify:verify', {
          address: mockUSDT.address,
          constructorArguments: [],
        });
        console.log('MockUSDT verified on Etherscan');
      } catch (error) {
        console.log('MockUSDT verification failed:', error);
      }
    }
  } else {
    console.log(`Skipping MockUSDT deployment on ${network.name} (mainnet)`);
  }
};

export default func;
func.tags = ['MockUSDT'];
func.id = 'deploy_mock_usdt';