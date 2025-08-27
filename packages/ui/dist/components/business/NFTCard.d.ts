import * as React from "react";
export interface NFTCardProps {
    type: "silver" | "gold" | "diamond" | "platinum";
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
declare const NFTCard: React.ForwardRefExoticComponent<NFTCardProps & React.RefAttributes<HTMLDivElement>>;
export { NFTCard };
