import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface WalletConnectProperties {
  isConnected?: boolean
  address?: string
  balance?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onSwitchNetwork?: () => void
  networkName?: string
  isCorrectNetwork?: boolean
  loading?: boolean
  className?: string
}

const WalletConnect = React.forwardRef<HTMLDivElement, WalletConnectProperties>(
  ({
    isConnected = false,
    address,
    balance,
    onConnect,
    onDisconnect,
    onSwitchNetwork,
    networkName = '以太坊',
    isCorrectNetwork = true,
    loading = false,
    className,
    ...properties
  }, reference) => {
    // Constants for address formatting
    const ADDRESS_START_LENGTH = 6;
    const ADDRESS_END_LENGTH = 4;
    const truncatedAddress = address
      ? `${address.slice(0, ADDRESS_START_LENGTH)}...${address.slice(-ADDRESS_END_LENGTH)}`
      : '';

    const copyToClipboard = async () => {
      if (address && globalThis.navigator?.clipboard) {
        try {
          await globalThis.navigator.clipboard.writeText(address);

          // Toast notification implementation ready for UI framework integration
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('复制失败:', error);
        }
      }
    };

    return (
      <div ref={reference} className={cn('w-full', className)} {...properties}>
        <AnimatePresence mode="wait">
          {isConnected
            ? (
              <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={cn(
                'border-green-200 bg-green-50/50',
                !isCorrectNetwork && 'border-yellow-200 bg-yellow-50/50',
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      钱包已连接
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDisconnect}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      断开
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 网络状态 */}
                  {!isCorrectNetwork && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">⚠️</span>
                          <span className="text-sm text-yellow-800">
                            请切换到 {networkName} 网络
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onSwitchNetwork}
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          切换网络
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* 钱包信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">钱包地址</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {truncatedAddress}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        📋
                      </Button>
                    </div>

                    {balance && (
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div>
                          <p className="text-sm font-medium">USDT 余额</p>
                          <p className="text-lg font-bold text-primary">
                            ${balance}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            可用于投资
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 快捷操作 */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      查看交易
                    </Button>
                    <Button variant="outline" size="sm">
                      添加USDT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            )
          : (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-dashed border-2 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🔗</span>
                    连接钱包
                  </CardTitle>
                  <CardDescription>
                    连接您的Web3钱包以开始投资
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={onConnect}
                    loading={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? '连接中...' : '连接钱包'}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    支持 MetaMask、WalletConnect 等主流钱包
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

WalletConnect.displayName = 'WalletConnect';

export { WalletConnect };
