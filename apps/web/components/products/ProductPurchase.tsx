'use client';

import { Wallet, Info, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

import { ETHPaymentFlow } from '@/components/payments/ETHPaymentFlow';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Alert,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
 WalletConnectionManager } from '@/components/ui';
// import { apiClient } from '@/lib/api-client';
import type { ProductType } from '@/lib/contracts/addresses';
import { PRODUCT_CONFIG } from '@/lib/contracts/addresses';
import { contractManager, useContractManager } from '@/lib/contracts/contract-manager';

interface EnhancedProductPurchaseProperties {
  productType: ProductType
  onSuccess?: (txHash?: string, tokenId?: string) => void
  onError?: (error: string) => void
  className?: string
}

type PurchaseStep = 'selection' | 'wallet' | 'payment' | 'processing' | 'success'

export function ProductPurchase({
  productType,
  onSuccess,
  onError,
  className = '',
}: EnhancedProductPurchaseProperties) {
  const { isConnected, chainId } = useAccount();

  const { state: contractState, areContractsDeployed } = useContractManager();

  const [step, setStep] = useState<PurchaseStep>('selection');
  const [paymentType, setPaymentType] = useState<'USDT' | 'ETH'>('USDT');
  const [amount, setAmount] = useState('');
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const productConfig = PRODUCT_CONFIG[productType];
  const USD_PER_ETH = 2000;
  const DAYS_PER_YEAR = 365;
  const PERCENT_SCALE = 100;
  const DECIMALS_TWO = 2;
  const ONE_SECOND_MS = 1000;
  // eslint-disable-next-line no-magic-numbers
  const ETH_QUICK_AMOUNTS = [0.05, 0.1, 0.25] as const;
  const MULTIPLIER_DOUBLE = 2;
  const MULTIPLIER_FIVE = 5;

  // 初始化合约管理器
  useEffect(() => {
    if (chainId) {
      contractManager.initialize(chainId);
    }
  }, [chainId]);

  // 检查网络是否支持
  const isSupportedNetwork = contractState?.isSupported ?? false;

  // 计算预期收益
  const calculateReturns = () => {
    if (!amount) return null;

    const amountNumber = Number.parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) return null;

    const principal = paymentType === 'ETH' ? amountNumber * USD_PER_ETH : amountNumber;
    const dailyRate = (productConfig.apr / PERCENT_SCALE) / DAYS_PER_YEAR;
    const totalReturn = principal * dailyRate * productConfig.duration;

    return {
      principal,
      totalReturn,
      totalValue: principal + totalReturn,
      dailyReturn: principal * dailyRate,
      originalAmount: amountNumber,
      originalCurrency: paymentType,
    };
  };

  // 验证投资金额
  const validateAmount = () => {
    const amountNumber = Number.parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return { isValid: false, error: '请输入有效的投资金额' };
    }

    const equivalentUSDT = paymentType === 'ETH' ? amountNumber * USD_PER_ETH : amountNumber;

    if (equivalentUSDT < productConfig.minInvestment) {
      return {
        isValid: false,
        error: `最小投资金额为 ${productConfig.minInvestment} USDT`,
      };
    }

    if (equivalentUSDT > productConfig.maxInvestment) {
      return {
        isValid: false,
        error: `最大投资金额为 ${productConfig.maxInvestment} USDT`,
      };
    }

    return { isValid: true };
  };

  // 处理步骤切换
  const handleStepChange = (newStep: PurchaseStep) => {
    setStep(newStep);
  };

  // 处理支付成功
  const handlePaymentSuccess = (txHash: string, tokenId?: string) => {
    setStep('success');
    setIsProcessing(false);
    toast.success('投资成功！', {
      description: '您的投资凭证NFT已发送到钱包',
    });
    onSuccess?.(txHash, tokenId);
  };

  // 处理支付错误
  const handlePaymentError = (error: string) => {
    setIsProcessing(false);
    toast.error('投资失败', {
      description: error,
    });
    onError?.(error);
  };

  // 开始支付流程
  const startPaymentFlow = () => {
    const validation = validateAmount();
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (!areContractsDeployed) {
      toast.error('合约尚未部署', {
        description: '请等待合约部署完成或切换到支持的网络',
      });
      return;
    }

    setIsProcessing(true);
    setShowPaymentFlow(true);
  };

  // 渲染金额选择阶段
  const renderAmountSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{productConfig.icon}</span>
            投资 {productConfig.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 产品信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">年化收益率</span>
              <p className="font-semibold text-green-600">{productConfig.apr}%</p>
            </div>
            <div>
              <span className="text-gray-500">投资期限</span>
              <p className="font-semibold">{productConfig.duration}天</p>
            </div>
            <div>
              <span className="text-gray-500">最小投资</span>
              <p className="font-semibold">{productConfig.minInvestment.toLocaleString()} USDT</p>
            </div>
            <div>
              <span className="text-gray-500">最大投资</span>
              <p className="font-semibold">{productConfig.maxInvestment.toLocaleString()} USDT</p>
            </div>
          </div>

          {/* 支付方式选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">支付方式</label>
            <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as 'USDT' | 'ETH')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="USDT">💎 USDT</TabsTrigger>
                <TabsTrigger value="ETH">⧫ ETH</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 金额输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              投资金额 ({paymentType})
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${productConfig.minInvestment} - ${productConfig.maxInvestment}`}
              min={paymentType === 'ETH' ? productConfig.minInvestment / USD_PER_ETH : productConfig.minInvestment}
              max={paymentType === 'ETH' ? productConfig.maxInvestment / USD_PER_ETH : productConfig.maxInvestment}
              step={paymentType === 'ETH' ? '0.001' : '1'}
            />

            {/* 快速金额按钮 */}
            <div className="flex gap-2">
              {paymentType === 'ETH'
                ? ETH_QUICK_AMOUNTS.map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amount.toString())}
                    >
                      {amount} ETH
                    </Button>
                  ))
                : [
                    productConfig.minInvestment,
                    productConfig.minInvestment * MULTIPLIER_DOUBLE,
                    productConfig.minInvestment * MULTIPLIER_FIVE,
                  ].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amount.toString())}
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))
              }
            </div>
          </div>

          {/* 预期收益显示 */}
          {calculateReturns() && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                预期收益
              </h4>
              <div className="space-y-2 text-sm">
                {(() => {
                  const returns = calculateReturns();
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">投资本金</span>
                        <span className="font-medium">
                          {returns.originalAmount} {returns.originalCurrency}
                          {paymentType === 'ETH' && (
                            <span className="text-xs text-gray-500 ml-1">
                              (≈{returns.principal.toLocaleString()} USDT)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">预期收益</span>
                        <span className="font-medium text-green-600">
                          +{returns.totalReturn.toFixed(DECIMALS_TWO)} USDT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">日均收益</span>
                        <span className="font-medium text-green-600">
                          +{returns.dailyReturn.toFixed(DECIMALS_TWO)} USDT
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>到期总值</span>
                        <span className="text-green-600">
                          {returns.totalValue.toFixed(DECIMALS_TWO)} USDT
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            {isConnected
? isSupportedNetwork
? areContractsDeployed
? (
              <Button
                onClick={startPaymentFlow}
                disabled={!amount || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing
? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                )
: (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    确认投资
                  </>
                )}
              </Button>
            )
: (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  智能合约尚未部署。请等待部署完成或切换网络。
                </AlertDescription>
              </Alert>
            )
: (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  当前网络不受支持。请切换到支持的网络后继续。
                </AlertDescription>
              </Alert>
            )
: (
              <Button onClick={() => handleStepChange('wallet')} className="w-full" size="lg">
                <Wallet className="w-4 h-4 mr-2" />
                连接钱包
              </Button>
            )}
          </div>

          {/* 风险提示 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              投资有风险，请谨慎投资。本产品收益预期基于历史数据，实际收益可能有所不同。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  // 渲染钱包连接阶段
  const renderWalletConnection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">连接钱包</h3>
        <p className="text-gray-600 mb-4">请连接您的钱包以继续投资</p>
      </div>

      <WalletConnectionManager
        onConnectionChange={(connected) => {
          if (connected) {
            setTimeout(() => handleStepChange('selection'), ONE_SECOND_MS);
          }
        }}
        showNetworkInfo
        showContractStatus
      />

      <Button
        variant="outline"
        onClick={() => handleStepChange('selection')}
        className="w-full"
      >
        返回投资页面
      </Button>
    </div>
  );

  // 渲染成功页面
  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-700 mb-2">投资成功！</h3>
        <p className="text-gray-600">您的投资凭证NFT已发送到钱包</p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          您可以在个人仪表板查看投资详情和收益情况。
        </AlertDescription>
      </Alert>

      <Button
        onClick={() => {
          setStep('selection');
          setAmount('');
          setIsProcessing(false);
        }}
        className="w-full"
      >
        继续投资
      </Button>
    </div>
  );

  // 主渲染函数
  const renderCurrentStep = () => {
    switch (step) {
      case 'selection': {
        return renderAmountSelection();
      }
      case 'wallet': {
        return renderWalletConnection();
      }
      case 'success': {
        return renderSuccess();
      }
      default: {
        return renderAmountSelection();
      }
    }
  };

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {renderCurrentStep()}

      {/* ETH支付流程对话框 */}
      <Dialog open={showPaymentFlow} onOpenChange={setShowPaymentFlow}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ETH 支付</DialogTitle>
          </DialogHeader>
          <ETHPaymentFlow
            productType={productType}
            ethAmount={amount}
            onSuccess={(txHash, tokenId) => {
              setShowPaymentFlow(false);
              handlePaymentSuccess(txHash, tokenId);
            }}
            onError={(error) => {
              setShowPaymentFlow(false);
              handlePaymentError(error);
            }}
            onCancel={() => {
              setShowPaymentFlow(false);
              setIsProcessing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
