import { UserRole, KycStatus, OrderStatus, PositionStatus, CommissionType, CommissionStatus } from '@prisma/client';
export declare function validateUserRole(role: string): role is UserRole;
export declare function validateKycStatus(status: string): status is KycStatus;
export declare function validateOrderStatus(status: string): status is OrderStatus;
export declare function validateUsdtAmount(amount: number): boolean;
export declare function validatePositionStatus(status: string): status is PositionStatus;
export declare function validateCommissionType(type: string): type is CommissionType;
export declare function validateCommissionStatus(status: string): status is CommissionStatus;
export declare function validateCommissionRate(rateBps: number): boolean;
export declare function validateEmail(email: string): boolean;
export declare function validatePassword(password: string): boolean;
export declare function validateWalletAddress(address: string): boolean;
export declare function validateTxHash(txHash: string): boolean;
export declare function validateReferralCode(code: string): boolean;
export declare function validateChainId(chainId: number): boolean;
export declare function validateDateRange(startDate: Date, endDate: Date): boolean;
export declare function validateLockDays(days: number): boolean;
export declare function validateAprBps(aprBps: number): boolean;
export declare function validateProductSymbol(symbol: string): boolean;
export declare function validateNftTokenId(tokenId: number): boolean;
export declare function validateSupply(current: number, total?: number): boolean;
export declare function validateJsonData(data: any): boolean;
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare function createValidationResult(isValid: boolean, errors?: string[]): ValidationResult;
export declare function combineValidationResults(...results: ValidationResult[]): ValidationResult;
export declare function validateUserData(data: {
    email?: string;
    password?: string;
    role?: string;
    referralCode?: string;
    kycStatus?: string;
}): ValidationResult;
export declare function validateOrderData(data: {
    usdtAmount?: number;
    status?: string;
    txHash?: string;
}): ValidationResult;
export declare function validateProductData(data: {
    symbol?: string;
    minAmount?: number;
    maxAmount?: number;
    aprBps?: number;
    lockDays?: number;
    nftTokenId?: number;
    totalSupply?: number;
    currentSupply?: number;
}): ValidationResult;
