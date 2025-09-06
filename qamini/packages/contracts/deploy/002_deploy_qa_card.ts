import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(`Deploying QACard to ${network.name} with account: ${deployer}`);

  const qaCard = await deploy('QACard', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === 'localhost' ? 1 : 2,
  });

  console.log(`QACard deployed to: ${qaCard.address}`);

  // 验证合约 (如果不是本地网络)
  if (network.name !== 'localhost' && hre.network.config.chainId !== 31337) {
    try {
      await hre.run('verify:verify', {
        address: qaCard.address,
        constructorArguments: [],
      });
      console.log('QACard verified on Etherscan');
    } catch (error) {
      console.log('QACard verification failed:', error);
    }
  }
};

export default func;
func.tags = ['QACard'];
func.dependencies = ['MockUSDT'];
func.id = 'deploy_qa_card';