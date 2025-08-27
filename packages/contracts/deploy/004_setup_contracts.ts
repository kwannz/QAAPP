import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { get } = deployments;

  console.log(`Setting up contracts on ${network.name}`);

  // 获取合约地址
  const treasuryDeployment = await get('Treasury');
  const qaCardDeployment = await get('QACard');
  
  console.log('='.repeat(50));
  console.log(`🎉 Deployment Complete on ${network.name.toUpperCase()}`);
  console.log('='.repeat(50));
  console.log(`Treasury: ${treasuryDeployment.address}`);
  console.log(`QACard: ${qaCardDeployment.address}`);
  
  if (network.name === 'sepolia' || network.name === 'polygon-mumbai' || network.name === 'localhost') {
    const mockUSDTDeployment = await get('MockUSDT');
    console.log(`MockUSDT: ${mockUSDTDeployment.address}`);
  }
  
  console.log('='.repeat(50));
  
  // 生成环境变量文件内容
  const envContent = `
# Smart Contract Addresses for ${network.name}
NEXT_PUBLIC_TREASURY_CONTRACT_${network.name.toUpperCase()}="${treasuryDeployment.address}"
NEXT_PUBLIC_QACARD_CONTRACT_${network.name.toUpperCase()}="${qaCardDeployment.address}"
${network.name === 'sepolia' || network.name === 'polygon-mumbai' || network.name === 'localhost' ? 
  `NEXT_PUBLIC_USDT_CONTRACT_${network.name.toUpperCase()}="${(await get('MockUSDT')).address}"` : ''}

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID_${network.name.toUpperCase()}="${hre.network.config.chainId}"
`;

  console.log('Environment variables to add to .env:');
  console.log(envContent);
};

export default func;
func.tags = ['Setup'];
func.dependencies = ['Treasury'];
func.runAtTheEnd = true;
func.id = 'setup_contracts';