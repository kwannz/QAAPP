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
var ContractService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const blockchain_service_1 = require("./blockchain.service");
const ethers_1 = require("ethers");
const error_utils_1 = require("../common/utils/error.utils");
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
let ContractService = ContractService_1 = class ContractService {
    constructor(configService, blockchainService) {
        this.configService = configService;
        this.blockchainService = blockchainService;
        this.logger = new common_1.Logger(ContractService_1.name);
        this.initializeContracts();
    }
    initializeContracts() {
        const rpcUrl = this.configService.get('BLOCKCHAIN_RPC_URL') || 'http://127.0.0.1:8545';
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const treasuryAddress = this.configService.get('TREASURY_CONTRACT_TESTNET') || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
        const qaCardAddress = this.configService.get('QACARD_CONTRACT_TESTNET') || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
        this.treasuryContract = new ethers_1.ethers.Contract(treasuryAddress, TREASURY_ABI, this.provider);
        this.qaCardContract = new ethers_1.ethers.Contract(qaCardAddress, QA_CARD_ABI, this.provider);
    }
    async getTreasuryBalance() {
        try {
            const balance = await this.treasuryContract.getBalance();
            return ethers_1.ethers.formatUnits(balance, 6);
        }
        catch (error) {
            this.logger.error('获取Treasury余额失败', { error: (0, error_utils_1.getErrorMessage)(error), stack: (0, error_utils_1.getErrorStack)(error) });
            return '0';
        }
    }
    async getProductInfo(productType) {
        try {
            const productInfo = await this.treasuryContract.getProductInfo(productType);
            return {
                name: productInfo.name,
                apr: productInfo.apr.toString(),
                minInvestment: ethers_1.ethers.formatUnits(productInfo.minInvestment, 6),
                maxInvestment: ethers_1.ethers.formatUnits(productInfo.maxInvestment, 6),
                duration: productInfo.duration.toString(),
                isActive: productInfo.isActive
            };
        }
        catch (error) {
            this.logger.error('获取产品信息失败', { error: (0, error_utils_1.getErrorMessage)(error), stack: (0, error_utils_1.getErrorStack)(error) });
            const products = [
                { name: 'QA Silver Card', apr: '1200', minInvestment: '100', maxInvestment: '10000', duration: '30', isActive: true },
                { name: 'QA Gold Card', apr: '1500', minInvestment: '1000', maxInvestment: '50000', duration: '60', isActive: true },
                { name: 'QA Diamond Card', apr: '1800', minInvestment: '5000', maxInvestment: '200000', duration: '90', isActive: true },
                { name: 'QA Platinum Card', apr: '2000', minInvestment: '10000', maxInvestment: '500000', duration: '365', isActive: true }
            ];
            return products[productType] || products[0];
        }
    }
    async getUserNFTBalance(userAddress, tokenId) {
        try {
            const balance = await this.qaCardContract.balanceOf(userAddress, tokenId);
            return balance.toString();
        }
        catch (error) {
            this.logger.error('获取NFT余额失败', { error: (0, error_utils_1.getErrorMessage)(error), stack: (0, error_utils_1.getErrorStack)(error) });
            return '0';
        }
    }
    async getUserNFTs(userAddress) {
        try {
            const nfts = [];
            for (let tokenId = 1; tokenId <= 4; tokenId++) {
                const balance = await this.getUserNFTBalance(userAddress, tokenId);
                if (parseInt(balance) > 0) {
                    nfts.push({
                        tokenId,
                        productType: tokenId - 1,
                        balance,
                        mintedAt: new Date()
                    });
                }
            }
            return nfts;
        }
        catch (error) {
            this.logger.error('获取用户NFT失败', { error: (0, error_utils_1.getErrorMessage)(error), stack: (0, error_utils_1.getErrorStack)(error) });
            return [];
        }
    }
    async listenToProductPurchaseEvents(callback) {
        try {
            this.treasuryContract.on('ProductPurchased', (user, productType, amount, tokenId, event) => {
                callback({
                    user,
                    productType: productType.toString(),
                    amount: ethers_1.ethers.formatUnits(amount, 6),
                    tokenId: tokenId.toString(),
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber
                });
            });
        }
        catch (error) {
            this.logger.error('监听合约事件失败', { error: (0, error_utils_1.getErrorMessage)(error), stack: (0, error_utils_1.getErrorStack)(error) });
        }
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = ContractService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        blockchain_service_1.BlockchainService])
], ContractService);
//# sourceMappingURL=contract.service.js.map