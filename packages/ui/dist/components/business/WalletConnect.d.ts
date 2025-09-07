import * as React from 'react';
export interface WalletConnectProperties {
    isConnected?: boolean;
    address?: string;
    balance?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSwitchNetwork?: () => void;
    networkName?: string;
    isCorrectNetwork?: boolean;
    loading?: boolean;
    className?: string;
}
declare const WalletConnect: React.ForwardRefExoticComponent<WalletConnectProperties & React.RefAttributes<HTMLDivElement>>;
export { WalletConnect };
