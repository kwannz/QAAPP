import * as React from 'react';
export interface NFTCardProperties {
    type: 'silver' | 'gold' | 'diamond' | 'platinum';
    name: string;
    apr: number;
    lockDays: number;
    minAmount: number;
    maxAmount?: number;
    currentSupply: number;
    totalSupply?: number;
    isActive: boolean;
    onPurchase?: () => void;
    className?: string;
}
declare const NFTCard: React.ForwardRefExoticComponent<NFTCardProperties & React.RefAttributes<HTMLDivElement>>;
export { NFTCard };
