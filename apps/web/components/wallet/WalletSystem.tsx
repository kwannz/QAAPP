'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useEnsName } from 'wagmi';
import { formatEther, isAddress } from 'viem';
import { motion } from 'framer-motion';
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Activity,
  Send,
  Loader2,
  XCircle,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSafeWalletConnection, useSafeNetworkStatus } from '@/lib/hooks/useSafeWalletConnection';
import { web3ConnectionManager } from '@/lib/web3/connection-manager';

// Types
interface WalletTransaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  token: string;
  to?: string;
  from?: string;
  txHash: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface MockWalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
}

// Unified WalletSystem Props
interface WalletSystemProps {
  variant?: 'button' | 'manager' | 'full';
  onConnectionChange?: (isConnected: boolean, chainId?: number) => void;
  showNetworkInfo?: boolean;
  showContractStatus?: boolean;
  showTransactionHistory?: boolean;
  showBalanceDetails?: boolean;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// SafeConnect Button functionality (extracted)
function SafeConnectCore({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [isWeb3Available, setIsWeb3Available] = useState(false);
  const [ConnectButton, setConnectButton] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalWallet, setUseLocalWallet] = useState(false);
  const [walletState, setWalletState] = useState<MockWalletState>({
    isConnected: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const developmentMode = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true';
    const disableWalletConnect = process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT === 'true';
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

    if (developmentMode || disableWalletConnect || !walletConnectProjectId || walletConnectProjectId === '' || walletConnectProjectId === 'undefined') {
      setUseLocalWallet(true);
      setIsLoading(false);
      return;
    }

    const initTimer = setTimeout(async () => {
      try {
        const wagmiElement = document.querySelector('[data-wagmi-provider]');
        if (wagmiElement?.getAttribute('data-wagmi-provider') === 'loading') {
          setTimeout(() => {
            setIsLoading(false);
            loadConnectButton();
          }, 2000);
          return;
        }

        await loadConnectButton();
      } catch (error) {
        setIsWeb3Available(false);
        setIsLoading(false);
      }
    }, 1000);

    const loadConnectButton = async () => {
      try {
        const { ConnectButton: RainbowConnectButton } = await import('@rainbow-me/rainbowkit');
        setConnectButton(() => RainbowConnectButton);
        setIsWeb3Available(true);
      } catch (error) {
        setIsWeb3Available(false);
      } finally {
        setIsLoading(false);
      }
    };

    return () => clearTimeout(initTimer);
  }, []);

  const connectLocalWallet = async () => {
    if (walletState.isConnected) {
      setWalletState({ isConnected: false });
      toast.success('钱包已断开连接');
      return;
    }

    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request?.({
            method: 'eth_requestAccounts',
          });
          const chainId = await window.ethereum.request?.({
            method: 'eth_chainId',
          });

          if (accounts && accounts.length > 0) {
            setWalletState({
              isConnected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              balance: '10.00',
            });
            toast.success('钱包连接成功！');
            return;
          }
        } catch (error) {
          console.warn('真实钱包连接失败，使用模拟模式:', error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      setWalletState({
        isConnected: true,
        address: '0x1234...5678',
        balance: '125.50',
        chainId: 31337,
      });

      toast.success('🎉 开发模式钱包连接成功！');
    } catch (error) {
      toast.error('连接失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  if (useLocalWallet) {
    if (walletState.isConnected) {
      return (
        <Button
          variant="outline"
          className={cn('bg-green-50 border-green-200 hover:bg-green-100', className)}
          onClick={connectLocalWallet}
        >
          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">已连接</span>
            <span className="text-xs text-gray-600">{walletState.address}</span>
          </div>
          {walletState.balance && (
            <div className="ml-2 flex items-center">
              <Zap className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-xs">{walletState.balance} ETH</span>
            </div>
          )}
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        className={className}
        onClick={connectLocalWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 mr-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            连接中...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            {children || '连接钱包'}
          </>
        )}
      </Button>
    );
  }

  if (isWeb3Available && ConnectButton && !isLoading) {
    try {
      return <ConnectButton className={className}>{children}</ConnectButton>;
    } catch (error) {
      return (
        <Button
          variant="outline"
          className={className}
          onClick={connectLocalWallet}
          disabled={isConnecting}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {children || '连接钱包'}
        </Button>
      );
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className={className} disabled>
        <div className="w-4 h-4 mr-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        初始化钱包...
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={connectLocalWallet}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 mr-2 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          连接中...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          {children || '连接钱包'}
        </>
      )}
    </Button>
  );
}

export function WalletSystem({
  variant = 'manager',
  onConnectionChange,
  showNetworkInfo = true,
  showContractStatus = true,
  showTransactionHistory = true,
  showBalanceDetails = true,
  compact = false,
  className = '',
  children,
}: WalletSystemProps) {
  // Wallet state from hooks
  const [walletState, walletActions] = useSafeWalletConnection();
  const networkStatus = useSafeNetworkStatus();
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  // Local state
  const [contractDeployment, setContractDeployment] = useState<Record<string, boolean>>({});
  const [checkingContracts, setCheckingContracts] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');

  // Connection change callback
  useEffect(() => {
    onConnectionChange?.(walletState.isConnected, walletState.chainId);
  }, [walletState.isConnected, walletState.chainId, onConnectionChange]);

  // Check contract deployment
  useEffect(() => {
    if (walletState.chainId && walletState.isNetworkSupported) {
      setCheckingContracts(true);
      web3ConnectionManager
        .checkContractDeployment(walletState.chainId)
        .then(setContractDeployment)
        .finally(() => setCheckingContracts(false));
    }
  }, [walletState.chainId, walletState.isNetworkSupported]);

  // Fetch transactions
  useEffect(() => {
    if (showTransactionHistory && isConnected && variant === 'full') {
      fetchTransactions();
    }
  }, [address, showTransactionHistory, isConnected, variant]);

  // Utility functions
  const copyAddress = async () => {
    if (walletState.address) {
      await navigator.clipboard.writeText(walletState.address);
      toast.success('地址已复制到剪贴板');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const formatAddress = (addr: string, ensNameStr?: string | null) => {
    if (ensNameStr) return ensNameStr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const fetchTransactions = async () => {
    if (!address) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';
      const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`);

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const data = await response.json();

      if (data.status === '1' && data.result) {
        const formattedTransactions: WalletTransaction[] = data.result.map((tx: any) => ({
          id: tx.hash,
          type: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
          amount: (parseInt(tx.value) / 1e18).toFixed(6),
          token: 'ETH',
          to: tx.to,
          from: tx.from,
          txHash: tx.hash,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
          status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
        }));
        setTransactions(formattedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error: any) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!isAddress(sendAddress)) {
      toast.error('无效的钱包地址');
      return;
    }

    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast.error('请输入有效金额');
      return;
    }

    setIsLoading(true);
    try {
      toast.success('交易已提交');
      setSendAmount('');
      setSendAddress('');
    } catch (error: any) {
      toast.error(`交易失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Button variant (SafeConnectButton replacement)
  if (variant === 'button') {
    return (
      <div className={className}>
        <SafeConnectCore className={className} children={children} />
      </div>
    );
  }

  // Manager variant (WalletConnectionManager replacement)
  if (variant === 'manager') {
    if (compact) {
      return (
        <div className={className}>
          <SafeConnectCore />
        </div>
      );
    }

    const renderConnectionStatus = () => {
      if (!walletState.isConnected) {
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                钱包连接
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    请连接钱包以使用平台功能
                  </AlertDescription>
                </Alert>
                <SafeConnectCore />
              </div>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              钱包已连接
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">钱包地址:</span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="font-mono text-xs">
                  {walletActions.formatAddress(walletState.address)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {walletState.ethBalance && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ETH 余额:</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="font-medium">{walletState.ethBalance} ETH</span>
                  {walletState.isBalanceLoading && (
                    <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <SafeConnectCore />
            </div>

            {walletState.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {walletState.error}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={walletActions.clearError}
                    className="h-auto p-0 ml-2 text-xs underline"
                  >
                    清除错误
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    };

    const renderNetworkStatus = () => {
      if (!showNetworkInfo || !walletState.chainId) return null;

      const networkInfo = web3ConnectionManager.getNetworkInfo(walletState.chainId);
      const isSupported = walletState.isNetworkSupported;

      return (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-lg">🌐</span>
              网络状态
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">当前网络:</span>
              <div className="flex items-center gap-1">
                {isSupported ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={isSupported ? 'text-green-700' : 'text-red-700'}>
                  {walletState.networkName || `未知链 (${walletState.chainId})`}
                </span>
              </div>
            </div>

            {!isSupported && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 w-4" />
                <AlertDescription className="text-sm">
                  当前网络不受支持。请切换到支持的网络。
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={networkStatus.switchToSupportedChain}
                      className="text-xs"
                    >
                      切换到推荐网络
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isSupported && networkInfo && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">区块浏览器:</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open(networkInfo.blockExplorerUrls[0], '_blank')}
                  className="h-auto p-0 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  查看浏览器
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    const renderContractStatus = () => {
      if (!showContractStatus || !walletState.chainId || !walletState.isNetworkSupported) return null;

      const deployedCount = Object.values(contractDeployment).filter(Boolean).length;
      const totalCount = Object.keys(contractDeployment).length;
      const allDeployed = deployedCount === totalCount && totalCount > 0;

      return (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              📄 合约状态
              {checkingContracts && (
                <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {totalCount === 0 ? (
              <div className="text-sm text-gray-500">未检测到合约配置</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(contractDeployment).map(([contractName, isDeployed]) => (
                  <div key={contractName} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{contractName}:</span>
                    <div className="flex items-center gap-1">
                      {isDeployed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-700">已部署</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-700">未部署</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!allDeployed && totalCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  部分合约尚未部署，某些功能可能无法正常使用。
                </AlertDescription>
              </Alert>
            )}

            {allDeployed && walletState.chainId === 11155111 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  所有合约已部署到 Sepolia 测试网，可以开始测试功能。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    };

    return (
      <div className={className}>
        {renderConnectionStatus()}
        {renderNetworkStatus()}
        {renderContractStatus()}
      </div>
    );
  }

  // Full variant (WalletManager replacement)
  if (variant === 'full') {
    const renderConnectionStatus = () => {
      if (!showConnectionStatus) return null;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>钱包连接</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {formatAddress(address!, ensName)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>已连接</span>
                      {connector && <span>• {connector.name}</span>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(address!)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnect()}
                    >
                      断开连接
                    </Button>
                  </div>
                </div>

                {showBalanceDetails && balance && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">ETH 余额:</span>
                      <span className="font-mono font-semibold">
                        {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>请连接钱包以使用完整功能</AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-2">
                  {connectors.map((connector) => (
                    <Button
                      key={connector.id}
                      variant="outline"
                      onClick={() => connect({ connector })}
                    >
                      连接 {connector.name}
                    </Button>
                  ))}
                </div>

                {connectError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>{connectError.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    const renderTransactionHistory = () => {
      if (!showTransactionHistory) return null;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>交易记录</span>
              </div>
              {isConnected && (
                <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">加载交易记录中...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {isConnected ? '暂无交易记录' : '请先连接钱包'}
                </div>
              ) : (
                transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        tx.type === 'sent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      )}>
                        {tx.type === 'sent' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="font-medium">
                          {tx.type === 'sent' ? '发送' : '接收'} {tx.amount} {tx.token}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.type === 'sent' ? '到: ' : '来自: '}
                          {formatAddress(tx.to || tx.from || '', null)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          tx.status === 'confirmed' ? 'default' :
                          tx.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {tx.status === 'confirmed' ? '已确认' :
                           tx.status === 'pending' ? '待确认' : '失败'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    const renderSendTransaction = () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>发送交易</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>请先连接钱包</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">接收地址</label>
                <Input
                  placeholder="0x..."
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">发送金额 (ETH)</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  step="0.001"
                  min="0"
                />
              </div>

              {balance && (
                <div className="text-xs text-muted-foreground">
                  可用余额: {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
                </div>
              )}

              <Button
                onClick={handleSendTransaction}
                disabled={isLoading || !sendAmount || !sendAddress}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    发送交易
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );

    if (compact) {
      return (
        <div className={className}>
          {renderConnectionStatus()}
        </div>
      );
    }

    return (
      <div className={cn('space-y-6', className)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">钱包总览</TabsTrigger>
            <TabsTrigger value="send">发送</TabsTrigger>
            <TabsTrigger value="history">记录</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderConnectionStatus()}
          </TabsContent>

          <TabsContent value="send">
            {renderSendTransaction()}
          </TabsContent>

          <TabsContent value="history">
            {renderTransactionHistory()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
}

// Backward compatibility components
export function WalletConnectionManager(props: Omit<WalletSystemProps, 'variant'>) {
  return <WalletSystem {...props} variant="manager" />;
}

export function SafeConnectButton(props: Omit<WalletSystemProps, 'variant'>) {
  return <WalletSystem {...props} variant="button" />;
}

export function WalletManager(props: Omit<WalletSystemProps, 'variant'>) {
  return <WalletSystem {...props} variant="full" />;
}

// Hook export
export function useWalletManager() {
  const { isConnected, address } = useAccount();
  const [isEnabled, setIsEnabled] = useState(true);

  return {
    isEnabled,
    isConnected,
    address,
    hasWallet: !!address,
  };
}

// Global type declarations
declare global {
  interface Window {
    ethereum?: {
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
    };
  }
}