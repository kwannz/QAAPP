"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const error_utils_1 = require("../common/utils/error.utils");
let BlockchainService = BlockchainService_1 = class BlockchainService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BlockchainService_1.name);
        this.provider = null;
        this.contracts = new Map();
        this.isBlockchainEnabled = true;
        this.connectionAttempted = false;
        this.initializeProvider();
        if (this.provider && this.isBlockchainEnabled) {
            this.loadContracts();
        }
    }
    async initializeProvider() {
        const rpcUrl = this.configService.get('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
        const environment = this.configService.get('NODE_ENV', 'development');
        if (environment === 'development' && rpcUrl === 'http://localhost:8545') {
            this.logger.warn(`⚠️  Blockchain node URL not configured. Running in development mode without blockchain features.`);
            this.isBlockchainEnabled = false;
            this.provider = null;
            this.connectionAttempted = true;
            return;
        }
        try {
            const chainId = this.configService.get('BLOCKCHAIN_CHAIN_ID');
            if (chainId && Number.isInteger(chainId)) {
                this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl, chainId);
            }
            else {
                this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const blockNumber = await this.provider.getBlockNumber();
            clearTimeout(timeoutId);
            this.logger.log(`✅ Blockchain connected successfully. Latest block: ${blockNumber}`);
            this.isBlockchainEnabled = true;
        }
        catch (error) {
            this.connectionAttempted = true;
            if (environment === 'development') {
                this.logger.warn(`⚠️  Blockchain node not available at ${rpcUrl}. Running in development mode without blockchain features.`);
            }
            else {
                this.logger.error('❌ Failed to connect to blockchain in production environment:', error);
            }
            this.isBlockchainEnabled = false;
            this.provider = null;
        }
    }
    isBlockchainAvailable() {
        return this.isBlockchainEnabled && this.provider !== null;
    }
    async loadContracts() {
        try {
            const treasuryAddress = this.configService.get('TREASURY_CONTRACT_ADDRESS');
            if (treasuryAddress) {
                const treasuryAbi = await this.loadContractABI('Treasury');
                if (treasuryAbi) {
                    const treasuryContract = new ethers_1.ethers.Contract(treasuryAddress, treasuryAbi, this.provider);
                    this.contracts.set('treasury', treasuryContract);
                    this.logger.log(`✅ Treasury contract loaded: ${treasuryAddress}`);
                }
            }
            const qaCardAddress = this.configService.get('QACARD_CONTRACT_ADDRESS');
            if (qaCardAddress) {
                const qaCardAbi = await this.loadContractABI('QACard');
                if (qaCardAbi) {
                    const qaCardContract = new ethers_1.ethers.Contract(qaCardAddress, qaCardAbi, this.provider);
                    this.contracts.set('qacard', qaCardContract);
                    this.logger.log(`✅ QACard contract loaded: ${qaCardAddress}`);
                }
            }
            const usdtAddress = this.configService.get('USDT_CONTRACT_ADDRESS');
            if (usdtAddress) {
                const usdtAbi = await this.loadContractABI('MockUSDT');
                if (usdtAbi) {
                    const usdtContract = new ethers_1.ethers.Contract(usdtAddress, usdtAbi, this.provider);
                    this.contracts.set('usdt', usdtContract);
                    this.logger.log(`✅ USDT contract loaded: ${usdtAddress}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to load contracts:', error);
        }
    }
    async loadContractABI(contractName) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Failed to load ABI for ${contractName}:`, error);
            return null;
        }
    }
    async getBlockNumber() {
        if (!this.isBlockchainAvailable()) {
            throw new Error('Blockchain not available');
        }
        try {
            return await this.provider.getBlockNumber();
        }
        catch (error) {
            this.logger.error('Failed to get block number:', error);
            throw error;
        }
    }
    async getTransactionReceipt(txHash) {
        if (!this.isBlockchainAvailable()) {
            throw new Error('Blockchain not available');
        }
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
                to: receipt.to ?? undefined,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get transaction receipt for ${txHash}:`, error);
            return null;
        }
    }
    async validateTransaction(txHash, expectedAmount, productSymbol) {
        try {
            const receipt = await this.getTransactionReceipt(txHash);
            if (!receipt || receipt.status !== 'success') {
                this.logger.warn(`Transaction ${txHash} failed or not found`);
                return false;
            }
            const transaction = await this.provider.getTransaction(txHash);
            if (!transaction) {
                this.logger.warn(`Transaction details not found for ${txHash}`);
                return false;
            }
            const treasuryAddress = this.configService.get('TREASURY_CONTRACT_ADDRESS');
            if (transaction.to?.toLowerCase() !== treasuryAddress?.toLowerCase()) {
                this.logger.warn(`Transaction ${txHash} not sent to Treasury contract`);
                return false;
            }
            const treasuryContract = this.contracts.get('treasury');
            if (treasuryContract) {
                try {
                    const parsedTransaction = treasuryContract.interface.parseTransaction({
                        data: transaction.data,
                        value: transaction.value,
                    });
                    if (parsedTransaction && parsedTransaction.name === 'purchaseProduct') {
                        const [productType, amount] = parsedTransaction.args;
                        const amountInUsdt = Number(ethers_1.ethers.formatUnits(amount, 6));
                        if (Math.abs(amountInUsdt - expectedAmount) < 0.01) {
                            this.logger.log(`Transaction ${txHash} validated successfully`);
                            return true;
                        }
                        else {
                            this.logger.warn(`Amount mismatch: expected ${expectedAmount}, got ${amountInUsdt}`);
                        }
                    }
                }
                catch (parseError) {
                    this.logger.warn(`Failed to parse transaction ${txHash}:`, parseError);
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error validating transaction ${txHash}:`, error);
            return false;
        }
    }
    async estimateGas(transaction) {
        if (!this.isBlockchainAvailable()) {
            throw new Error('Blockchain not available');
        }
        try {
            const gasEstimate = await this.provider.estimateGas(transaction);
            return gasEstimate.toString();
        }
        catch (error) {
            this.logger.error('Failed to estimate gas:', error);
            return '21000';
        }
    }
    async sendTransaction(transaction) {
        try {
            const privateKey = this.configService.get('BLOCKCHAIN_PRIVATE_KEY');
            if (!privateKey) {
                throw new Error('Private key not configured');
            }
            const wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
            const txResponse = await wallet.sendTransaction(transaction);
            this.logger.log(`Transaction sent: ${txResponse.hash}`);
            return {
                hash: txResponse.hash,
                status: 'pending'
            };
        }
        catch (error) {
            this.logger.error('Failed to send transaction:', error);
            throw error;
        }
    }
    getContract(contractName) {
        return this.contracts.get(contractName.toLowerCase()) || null;
    }
    async getBalance(address) {
        if (!this.isBlockchainAvailable()) {
            throw new Error('Blockchain not available');
        }
        try {
            const balance = await this.provider.getBalance(address);
            return ethers_1.ethers.formatEther(balance);
        }
        catch (error) {
            this.logger.error(`Failed to get balance for ${address}:`, error);
            return '0';
        }
    }
    async getUSDTBalance(address) {
        try {
            const usdtContract = this.contracts.get('usdt');
            if (!usdtContract) {
                throw new Error('USDT contract not loaded');
            }
            const balance = await usdtContract.balanceOf(address);
            return ethers_1.ethers.formatUnits(balance, 6);
        }
        catch (error) {
            this.logger.error(`Failed to get USDT balance for ${address}:`, error);
            return '0';
        }
    }
    async getNFTBalance(address, tokenId) {
        try {
            const qaCardContract = this.contracts.get('qacard');
            if (!qaCardContract) {
                throw new Error('QACard contract not loaded');
            }
            const balance = await qaCardContract.balanceOf(address, tokenId);
            return balance.toString();
        }
        catch (error) {
            this.logger.error(`Failed to get NFT balance for ${address}, token ${tokenId}:`, error);
            return '0';
        }
    }
    async startEventListening() {
        try {
            const treasuryContract = this.contracts.get('treasury');
            if (treasuryContract) {
                treasuryContract.on('ProductPurchased', (user, productType, amount, timestamp, event) => {
                    this.logger.log(`Product purchased: user=${user}, type=${productType}, amount=${amount}`);
                });
                treasuryContract.on('Withdrawal', (user, amount, timestamp, event) => {
                    this.logger.log(`Withdrawal: user=${user}, amount=${amount}`);
                });
                this.logger.log('✅ Event listening started for Treasury contract');
            }
            const qaCardContract = this.contracts.get('qacard');
            if (qaCardContract) {
                qaCardContract.on('TransferSingle', (operator, from, to, id, value, event) => {
                    this.logger.log(`NFT transferred: from=${from}, to=${to}, id=${id}, value=${value}`);
                });
                this.logger.log('✅ Event listening started for QACard contract');
            }
        }
        catch (error) {
            this.logger.error('Failed to start event listening:', error);
        }
    }
    async stopEventListening() {
        try {
            for (const contract of this.contracts.values()) {
                contract.removeAllListeners();
            }
            this.logger.log('✅ Event listening stopped');
        }
        catch (error) {
            this.logger.error('Failed to stop event listening:', error);
        }
    }
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
        }
        catch (error) {
            this.logger.error('Blockchain health check failed:', error);
            return {
                status: 'unhealthy',
                error: (0, error_utils_1.getErrorMessage)(error),
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map