export interface WalletChallenge {
    message: string;
    nonce: string;
    timestamp: string;
    expiresAt: Date;
}
export declare class WalletSignatureService {
    private readonly logger;
    private readonly challenges;
    generateChallenge(address: string): WalletChallenge;
    verifySignature(address: string, signature: string, message: string): Promise<boolean>;
    private createMessage;
    private cleanupExpiredChallenges;
    getActiveChallengeCount(): number;
}
