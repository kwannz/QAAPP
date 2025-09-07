import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
export declare class ContractService {
    private readonly configService;
    private readonly blockchainService;
    private readonly logger;
    private provider;
    private treasuryContract;
    private qaCardContract;
    constructor(configService: ConfigService, blockchainService: BlockchainService);
    private initializeContracts;
    getTreasuryBalance(): Promise<string>;
    getProductInfo(productType: number): Promise<{
        name: any;
        apr: any;
        minInvestment: string;
        maxInvestment: string;
        duration: any;
        isActive: any;
    }>;
    getUserNFTBalance(userAddress: string, tokenId: number): Promise<string>;
    getUserNFTs(userAddress: string): Promise<{
        tokenId: number;
        productType: number;
        balance: string;
        mintedAt: Date;
    }[]>;
    listenToProductPurchaseEvents(callback: (event: any) => void): Promise<void>;
}
