import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ethers } from 'ethers';
import { getErrorMessage, getErrorStack } from '../common/utils/error.utils';

// 智能合约ABI (只包含需要的方法)
const TREASURY_ABI = [
  'function getBalance() view returns (uint256)',
  'function getProductInfo(uint8 productType) view returns (tuple(string name, uint256 minInvestment, uint256 maxInvestment, uint256 apr, uint256 duration, bool isActive))',
  'function purchaseProduct(uint8 productType, uint256 amount)',
  'event ProductPurchased(address indexed user, uint8 productType, uint256 amount, uint256 tokenId)'
];

const QA_CARD_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function mintCard(address to, uint8 productType, uint256 amount, uint256 apr, uint256 duration) returns (uint256)'
];

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  private provider!: ethers.Provider;
  private treasuryContract!: ethers.Contract;
  private qaCardContract!: ethers.Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly blockchainService: BlockchainService
  ) {
    this.initializeContracts();
  }

  private initializeContracts() {
    // 初始化Provider (使用本地测试网络)
    const rpcUrl = this.configService.get('BLOCKCHAIN_RPC_URL') || 'http://127.0.0.1:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // 合约地址 (从环境变量获取，回退到本地部署地址)
    const treasuryAddress = this.configService.get('TREASURY_CONTRACT_TESTNET') || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    const qaCardAddress = this.configService.get('QACARD_CONTRACT_TESTNET') || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

    // 初始化合约实例
    this.treasuryContract = new ethers.Contract(treasuryAddress, TREASURY_ABI, this.provider);
    this.qaCardContract = new ethers.Contract(qaCardAddress, QA_CARD_ABI, this.provider);
  }

  async getTreasuryBalance(): Promise<string> {
    try {
      const balance = await this.treasuryContract.getBalance();
      return ethers.formatUnits(balance, 6); // USDT 6位小数
    } catch (error: unknown) {
      this.logger.error('获取Treasury余额失败', { error: getErrorMessage(error), stack: getErrorStack(error) });
      return '0';
    }
  }

  async getProductInfo(productType: number) {
    try {
      const productInfo = await this.treasuryContract.getProductInfo(productType);
      return {
        name: productInfo.name,
        apr: productInfo.apr.toString(),
        minInvestment: ethers.formatUnits(productInfo.minInvestment, 6),
        maxInvestment: ethers.formatUnits(productInfo.maxInvestment, 6),
        duration: productInfo.duration.toString(),
        isActive: productInfo.isActive
      };
    } catch (error: unknown) {
      this.logger.error('获取产品信息失败', { error: getErrorMessage(error), stack: getErrorStack(error) });
      // 返回默认值
      const products = [
        { name: 'QA Silver Card', apr: '1200', minInvestment: '100', maxInvestment: '10000', duration: '30', isActive: true },
        { name: 'QA Gold Card', apr: '1500', minInvestment: '1000', maxInvestment: '50000', duration: '60', isActive: true },
        { name: 'QA Diamond Card', apr: '1800', minInvestment: '5000', maxInvestment: '200000', duration: '90', isActive: true },
        { name: 'QA Platinum Card', apr: '2000', minInvestment: '10000', maxInvestment: '500000', duration: '365', isActive: true }
      ];
      return products[productType] || products[0];
    }
  }

  async getUserNFTBalance(userAddress: string, tokenId: number): Promise<string> {
    try {
      const balance = await this.qaCardContract.balanceOf(userAddress, tokenId);
      return balance.toString();
    } catch (error: unknown) {
      this.logger.error('获取NFT余额失败', { error: getErrorMessage(error), stack: getErrorStack(error) });
      return '0';
    }
  }

  async getUserNFTs(userAddress: string) {
    try {
      const nfts = [];
      // 检查用户持有的各种类型NFT
      for (let tokenId = 1; tokenId <= 4; tokenId++) {
        const balance = await this.getUserNFTBalance(userAddress, tokenId);
        if (parseInt(balance) > 0) {
          nfts.push({
            tokenId,
            productType: tokenId - 1, // tokenId 1-4 对应 productType 0-3
            balance,
            mintedAt: new Date() // 实际应该从区块链事件获取
          });
        }
      }
      return nfts;
    } catch (error: unknown) {
      this.logger.error('获取用户NFT失败', { error: getErrorMessage(error), stack: getErrorStack(error) });
      return [];
    }
  }

  // 监听合约事件
  async listenToProductPurchaseEvents(callback: (event: any) => void) {
    try {
      this.treasuryContract.on('ProductPurchased', (user, productType, amount, tokenId, event) => {
        callback({
          user,
          productType: productType.toString(),
          amount: ethers.formatUnits(amount, 6),
          tokenId: tokenId.toString(),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });
    } catch (error: unknown) {
      this.logger.error('监听合约事件失败', { error: getErrorMessage(error), stack: getErrorStack(error) });
    }
  }
}