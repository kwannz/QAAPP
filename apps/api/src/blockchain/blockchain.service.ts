import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

interface TransactionReceipt {
  transactionHash: string;
  status: string;
  blockNumber: number;
  gasUsed: string;
  from?: string;
  to?: string;
  value?: string;
}

interface ContractConfig {
  address: string;
  abi: any[];
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeProvider();
    this.loadContracts();
  }

  /**
   * 初始化以太坊提供者
   */
  private initializeProvider() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // 测试连接
    this.provider.getBlockNumber()
      .then(blockNumber => {
        this.logger.log(`✅ Blockchain connected successfully. Latest block: ${blockNumber}`);
      })
      .catch(error => {
        this.logger.error('❌ Failed to connect to blockchain:', error);
      });
  }

  /**
   * 加载智能合约
   */
  private async loadContracts() {
    try {
      // Treasury合约配置
      const treasuryAddress = this.configService.get<string>('TREASURY_CONTRACT_ADDRESS');
      if (treasuryAddress) {
        const treasuryAbi = await this.loadContractABI('Treasury');
        if (treasuryAbi) {
          const treasuryContract = new ethers.Contract(treasuryAddress, treasuryAbi, this.provider);
          this.contracts.set('treasury', treasuryContract);
          this.logger.log(`✅ Treasury contract loaded: ${treasuryAddress}`);
        }
      }

      // QACard合约配置  
      const qaCardAddress = this.configService.get<string>('QACARD_CONTRACT_ADDRESS');
      if (qaCardAddress) {
        const qaCardAbi = await this.loadContractABI('QACard');
        if (qaCardAbi) {
          const qaCardContract = new ethers.Contract(qaCardAddress, qaCardAbi, this.provider);
          this.contracts.set('qacard', qaCardContract);
          this.logger.log(`✅ QACard contract loaded: ${qaCardAddress}`);
        }
      }

      // USDT合约配置
      const usdtAddress = this.configService.get<string>('USDT_CONTRACT_ADDRESS');
      if (usdtAddress) {
        const usdtAbi = await this.loadContractABI('MockUSDT');
        if (usdtAbi) {
          const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, this.provider);
          this.contracts.set('usdt', usdtContract);
          this.logger.log(`✅ USDT contract loaded: ${usdtAddress}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to load contracts:', error);
    }
  }

  /**
   * 加载合约ABI
   */
  private async loadContractABI(contractName: string): Promise<any[] | null> {
    try {
      // 在实际环境中，这里应该从文件系统或配置中加载ABI
      // 这里提供基础的ERC20和我们合约的ABI结构
      const abis = {
        'MockUSDT': [
          'function transfer(address to, uint256 amount) public returns (bool)',
          'function transferFrom(address from, address to, uint256 amount) public returns (bool)',
          'function balanceOf(address account) public view returns (uint256)',
          'function approve(address spender, uint256 amount) public returns (bool)',
          'function allowance(address owner, address spender) public view returns (uint256)',
          'function totalSupply() public view returns (uint256)',
          'function decimals() public view returns (uint8)',
          'event Transfer(address indexed from, address indexed to, uint256 value)',
          'event Approval(address indexed owner, address indexed spender, uint256 value)'
        ],
        'Treasury': [
          'function purchaseProduct(uint8 productType, uint256 amount) public',
          'function getProductInfo(uint8 productType) public view returns (string memory name, uint256 minInvestment, uint256 maxInvestment, uint16 apr, uint16 duration, bool isActive)',
          'function getUserInvestments(address user) public view returns (uint256[] memory)',
          'function withdraw(uint256 amount) public',
          'function pause() public',
          'function unpause() public',
          'event ProductPurchased(address indexed user, uint8 productType, uint256 amount, uint256 timestamp)',
          'event Withdrawal(address indexed user, uint256 amount, uint256 timestamp)'
        ],
        'QACard': [
          'function mint(address to, uint256 id, uint256 amount, bytes memory data) public',
          'function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public',
          'function balanceOf(address account, uint256 id) public view returns (uint256)',
          'function balanceOfBatch(address[] memory accounts, uint256[] memory ids) public view returns (uint256[] memory)',
          'function setURI(string memory newuri) public',
          'function uri(uint256 id) public view returns (string memory)',
          'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
          'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)'
        ]
      };

      return abis[contractName] || null;
    } catch (error) {
      this.logger.error(`Failed to load ABI for ${contractName}:`, error);
      return null;
    }
  }

  /**
   * 获取当前区块号
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      this.logger.error('Failed to get block number:', error);
      throw error;
    }
  }

  /**
   * 获取交易收据
   */
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return null;
      }

      return {
        transactionHash: receipt.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
        to: receipt.to,
        // value: receipt.value?.toString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get transaction receipt for ${txHash}:`, error);
      return null;
    }
  }

  /**
   * 验证交易
   */
  async validateTransaction(txHash: string, expectedAmount: number, productSymbol: string): Promise<boolean> {
    try {
      const receipt = await this.getTransactionReceipt(txHash);
      
      if (!receipt || receipt.status !== 'success') {
        this.logger.warn(`Transaction ${txHash} failed or not found`);
        return false;
      }

      // 获取交易详情
      const transaction = await this.provider.getTransaction(txHash);
      if (!transaction) {
        this.logger.warn(`Transaction details not found for ${txHash}`);
        return false;
      }

      // 验证交易是否发送到正确的合约地址
      const treasuryAddress = this.configService.get<string>('TREASURY_CONTRACT_ADDRESS');
      if (transaction.to?.toLowerCase() !== treasuryAddress?.toLowerCase()) {
        this.logger.warn(`Transaction ${txHash} not sent to Treasury contract`);
        return false;
      }

      // 解析交易数据以验证金额和产品类型
      // 这里需要根据实际的合约方法来解析
      const treasuryContract = this.contracts.get('treasury');
      if (treasuryContract) {
        try {
          // 解析交易输入数据
          const parsedTransaction = treasuryContract.interface.parseTransaction({
            data: transaction.data,
            value: transaction.value,
          });

          if (parsedTransaction && parsedTransaction.name === 'purchaseProduct') {
            const [productType, amount] = parsedTransaction.args;
            const amountInUsdt = Number(ethers.formatUnits(amount, 6)); // USDT has 6 decimals

            // 验证金额是否匹配
            if (Math.abs(amountInUsdt - expectedAmount) < 0.01) { // 允许小数点精度误差
              this.logger.log(`Transaction ${txHash} validated successfully`);
              return true;
            } else {
              this.logger.warn(`Amount mismatch: expected ${expectedAmount}, got ${amountInUsdt}`);
            }
          }
        } catch (parseError) {
          this.logger.warn(`Failed to parse transaction ${txHash}:`, parseError);
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`Error validating transaction ${txHash}:`, error);
      return false;
    }
  }

  /**
   * 估算Gas费用
   */
  async estimateGas(transaction: any): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      this.logger.error('Failed to estimate gas:', error);
      return '21000'; // 返回默认值
    }
  }

  /**
   * 发送交易（管理员功能）
   */
  async sendTransaction(transaction: any): Promise<{ hash: string; status: string }> {
    try {
      // 这里需要配置私钥来发送交易
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const txResponse = await wallet.sendTransaction(transaction);

      this.logger.log(`Transaction sent: ${txResponse.hash}`);

      return {
        hash: txResponse.hash,
        status: 'pending'
      };
    } catch (error) {
      this.logger.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * 获取合约实例
   */
  getContract(contractName: string): ethers.Contract | null {
    return this.contracts.get(contractName.toLowerCase()) || null;
  }

  /**
   * 获取账户余额
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}:`, error);
      return '0';
    }
  }

  /**
   * 获取USDT余额
   */
  async getUSDTBalance(address: string): Promise<string> {
    try {
      const usdtContract = this.contracts.get('usdt');
      if (!usdtContract) {
        throw new Error('USDT contract not loaded');
      }

      const balance = await usdtContract.balanceOf(address);
      return ethers.formatUnits(balance, 6); // USDT has 6 decimals
    } catch (error) {
      this.logger.error(`Failed to get USDT balance for ${address}:`, error);
      return '0';
    }
  }

  /**
   * 获取NFT余额
   */
  async getNFTBalance(address: string, tokenId: number): Promise<string> {
    try {
      const qaCardContract = this.contracts.get('qacard');
      if (!qaCardContract) {
        throw new Error('QACard contract not loaded');
      }

      const balance = await qaCardContract.balanceOf(address, tokenId);
      return balance.toString();
    } catch (error) {
      this.logger.error(`Failed to get NFT balance for ${address}, token ${tokenId}:`, error);
      return '0';
    }
  }

  /**
   * 监听合约事件
   */
  async startEventListening() {
    try {
      const treasuryContract = this.contracts.get('treasury');
      if (treasuryContract) {
        // 监听产品购买事件
        treasuryContract.on('ProductPurchased', (user, productType, amount, timestamp, event) => {
          this.logger.log(`Product purchased: user=${user}, type=${productType}, amount=${amount}`);
          // 这里可以触发业务逻辑，如发送通知、更新数据库等
        });

        // 监听提取事件
        treasuryContract.on('Withdrawal', (user, amount, timestamp, event) => {
          this.logger.log(`Withdrawal: user=${user}, amount=${amount}`);
        });

        this.logger.log('✅ Event listening started for Treasury contract');
      }

      const qaCardContract = this.contracts.get('qacard');
      if (qaCardContract) {
        // 监听NFT转移事件
        qaCardContract.on('TransferSingle', (operator, from, to, id, value, event) => {
          this.logger.log(`NFT transferred: from=${from}, to=${to}, id=${id}, value=${value}`);
        });

        this.logger.log('✅ Event listening started for QACard contract');
      }
    } catch (error) {
      this.logger.error('Failed to start event listening:', error);
    }
  }

  /**
   * 停止事件监听
   */
  async stopEventListening() {
    try {
      for (const contract of this.contracts.values()) {
        contract.removeAllListeners();
      }
      this.logger.log('✅ Event listening stopped');
    } catch (error) {
      this.logger.error('Failed to stop event listening:', error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const blockNumber = await this.getBlockNumber();
      const treasuryContract = this.contracts.get('treasury');
      const qaCardContract = this.contracts.get('qacard');
      const usdtContract = this.contracts.get('usdt');

      return {
        status: 'healthy',
        blockNumber,
        contracts: {
          treasury: treasuryContract ? 'loaded' : 'not loaded',
          qaCard: qaCardContract ? 'loaded' : 'not loaded',
          usdt: usdtContract ? 'loaded' : 'not loaded',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Blockchain health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}