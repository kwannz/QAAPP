import * as React from "react";
export interface WalletConnectProps {
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
declare const WalletConnect: React.ForwardRefExoticComponent<WalletConnectProps & React.RefAttributes<HTMLDivElement>>;
export { WalletConnect };
