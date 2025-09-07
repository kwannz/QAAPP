'use client';

import { Wallet, CheckCircle, RefreshCw, Trash2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { formatUnits } from 'viem';
import { useSafeToast } from '../../lib/use-safe-toast';



import { useUSDT } from '../../lib/hooks/use-contracts';
import { useSafeAccount, useSafeConnect, useSafeDisconnect, useSafeBalance, useSafeEnsName } from '../../lib/hooks/use-safe-wagmi';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Alert, AlertDescription } from '@/components/ui';

export function WalletsSection() {
  const COPY_RESET_MS = 2000;
  const ADDRESS_PREFIX_LEN = 6;
  const ADDRESS_SUFFIX_LEN = 4;
  const ETH_DECIMALS = 18;
  const BALANCE_DECIMALS = 4;
  const toast = useSafeToast();
  const [isCopied, setIsCopied] = useState(false);
  const { address, isConnected, chainId, chain } = useSafeAccount();
  const { connect, connectors, isPending: isConnecting } = useSafeConnect();
  const { disconnect } = useSafeDisconnect();
  const usdt = useUSDT();
  const { data: ethBalance, refetch: refetchEthBalance } = useSafeBalance({ address });
  const { data: ensName } = useSafeEnsName({ address });

  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      toast.success('地址已复制到剪贴板');
      setTimeout(() => setIsCopied(false), COPY_RESET_MS);
    } catch {
      toast.error('复制失败');
    }
  };

  const refreshBalances = () => {
    refetchEthBalance();
    usdt.refetchBalance();
    toast.success('余额已刷新');
  };

  const getExplorerUrl = () => {
    if (!address || !chainId) return '#';

    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      42_161: 'https://arbiscan.io',
      11_155_111: 'https://sepolia.etherscan.io',
    };

    return `${explorers[chainId] || 'https://etherscan.io'}/address/${address}`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, ADDRESS_PREFIX_LEN)}...${addr.slice(-ADDRESS_SUFFIX_LEN)}`;
  };

  return (
    <div className="space-y-6">
      {isConnected ? (
        <div className="space-y-6">
          {/* 钱包信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  已连接钱包
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={refreshBalances}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => disconnect()}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">当前网络</p>
                  <p className="font-medium">{chain?.name || '未知网络'}</p>
                </div>
                <Badge variant={chain?.id === 1 ? 'default' : 'secondary'}>
                  Chain ID: {chainId}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">钱包地址</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{formatAddress(address)}</p>
                      {ensName && (
                        <Badge variant="outline">{ensName}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      {isCopied
? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )
: (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 资产余额 */}
          <Card>
            <CardHeader>
              <CardTitle>资产余额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">ETH</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">以太坊</p>
                      <p className="font-semibold">
                        {ethBalance ? Number.parseFloat(formatUnits(ethBalance.value, ETH_DECIMALS)).toFixed(BALANCE_DECIMALS) : '0.0000'} ETH
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">USDT</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">泰达币</p>
                      <p className="font-semibold">
                        {usdt.formatBalance()} USDT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              连接钱包
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              请选择一个钱包连接到QA投资平台，开始您的DeFi投资之旅
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={isConnecting}
                  variant="outline"
                  className="h-16 justify-start gap-3"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {connector.id === 'injected' ? '浏览器钱包' : '官方钱包'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                连接钱包后，您可以投资我们的固定收益产品并获得NFT投资凭证
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
