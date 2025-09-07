import * as React from 'react';
export interface DashboardPosition {
    id: string;
    productName: string;
    productType: 'silver' | 'gold' | 'diamond';
    principal: number;
    currentValue: number;
    apr: number;
    startDate: string;
    endDate: string;
    nextPayoutAt?: string;
    nextPayoutAmount?: number;
    status: 'active' | 'redeeming' | 'closed' | 'defaulted';
}
export interface DashboardInvestmentStats {
    totalInvested: number;
    currentValue: number;
    totalEarnings: number;
    claimableRewards: number;
    activePositions: number;
}
export interface InvestmentDashboardProperties {
    stats: DashboardInvestmentStats;
    positions: DashboardPosition[];
    onClaimRewards?: () => void;
    onViewPosition?: (positionId: string) => void;
    className?: string;
}
declare const InvestmentDashboard: React.ForwardRefExoticComponent<InvestmentDashboardProperties & React.RefAttributes<HTMLDivElement>>;
export { InvestmentDashboard };
