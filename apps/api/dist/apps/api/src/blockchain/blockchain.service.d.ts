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
export declare class BlockchainService {
    private readonly configService;
    private readonly logger;
    private provider;
    private contracts;
    private isBlockchainEnabled;
    private connectionAttempted;
    constructor(configService: ConfigService);
    private initializeProvider;
    isBlockchainAvailable(): boolean;
    private loadContracts;
    private loadContractABI;
    getBlockNumber(): Promise<number>;
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
    validateTransaction(txHash: string, expectedAmount: number, productSymbol: string): Promise<boolean>;
    estimateGas(transaction: any): Promise<string>;
    sendTransaction(transaction: any): Promise<{
        hash: string;
        status: string;
    }>;
    getContract(contractName: string): ethers.Contract | null;
    getBalance(address: string): Promise<string>;
    getUSDTBalance(address: string): Promise<string>;
    getNFTBalance(address: string, tokenId: number): Promise<string>;
    startEventListening(): Promise<void>;
    stopEventListening(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        blockNumber: number;
        contracts: {
            treasury: string;
            qaCard: string;
            usdt: string;
        };
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        error: string;
        timestamp: string;
        blockNumber?: undefined;
        contracts?: undefined;
    }>;
}
export {};
