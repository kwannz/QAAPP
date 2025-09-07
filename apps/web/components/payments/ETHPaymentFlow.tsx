'use client';

import { Loader2, CheckCircle, AlertTriangle, ExternalLink, Clock, Wallet, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { parseUnits, formatEther } from 'viem';
import { useAccount, useBalance, useWaitForTransactionReceipt } from 'wagmi';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Badge,
  Separator,
} from '@/components/ui';
import type { ProductType } from '@/lib/contracts/addresses';
import { PRODUCT_CONFIG } from '@/lib/contracts/addresses';
import { useTreasury } from '@/lib/hooks/use-contracts';


export type PaymentStep = 'preparation' | 'confirmation' | 'processing' | 'success' | 'error'

interface ETHPaymentFlowProperties {
  productType: ProductType
  ethAmount: string
  onSuccess?: (txHash: string, tokenId?: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

interface PaymentState {
  step: PaymentStep
  txHash?: string
  tokenId?: string
  error?: string
  estimatedGas?: bigint
  gasPrice?: bigint
}

export function ETHPaymentFlow({
  productType,
  ethAmount,
  onSuccess,
  onError,
  onCancel,
}: ETHPaymentFlowProperties) {
  const { address, isConnected, chainId } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const treasury = useTreasury();

  const [paymentState, setPaymentState] = useState<PaymentState>({
    step: 'preparation',
  });

  // 等待交易确认
  const { data: receipt, isLoading: _isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: paymentState.txHash as `0x${string}` | undefined,
  });

  // 产品配置
  const productConfig = PRODUCT_CONFIG[productType];

  // 计算相关数值
  const DECIMALS_ETH = 18;
  const USD_PER_ETH = 2000;
  const DAYS_PER_YEAR = 365;
  const DECIMALS_TWO = 2;
  const PERCENT_SCALE = 100;
  const CHAIN_ID_SEPOLIA = 11_155_111;
  const ethAmountWei = parseUnits(ethAmount, DECIMALS_ETH);
  const equivalentUSDT = Number.parseFloat(ethAmount) * USD_PER_ETH; // 1 ETH = 2000 USDT
  const hasEnoughBalance = ethBalance ? ethBalance.value >= ethAmountWei : false;
  // eslint-disable-next-line no-magic-numbers
  const ESTIMATED_GAS_UNITS = BigInt(200_000);
  // eslint-disable-next-line no-magic-numbers
  const GAS_PRICE_20_GWEI = BigInt(20_000_000_000);
  const estimatedGas = ESTIMATED_GAS_UNITS; // 估计的gas消耗
  const estimatedGasCost = ethBalance ? (estimatedGas * GAS_PRICE_20_GWEI) : BigInt(0); // 20 gwei估算
  const totalRequired = ethAmountWei + estimatedGasCost;

  // 监听交易状态变化
  useEffect(() => {
    if (isSuccess && receipt) {
      setPaymentState(previous => ({
        ...previous,
        step: 'success',
      }));

      toast.success('支付成功！', {
        description: '您的投资凭证NFT已发送到钱包',
      });

      onSuccess?.(receipt.transactionHash, 'pending'); // tokenId待从事件中解析
    } else if (isError) {
      setPaymentState(previous => ({
        ...previous,
        step: 'error',
        error: '交易执行失败',
      }));

      toast.error('支付失败', {
        description: '交易未能成功执行，请重试',
      });

      onError?.('交易执行失败');
    }
  }, [isSuccess, isError, receipt, onSuccess, onError]);

  // 执行ETH支付
  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('ETH余额不足');
      return;
    }

    try {
      setPaymentState(previous => ({ ...previous, step: 'confirmation' }));

      toast.info('请在钱包中确认交易', {
        description: `投资金额: ${ethAmount} ETH (≈${equivalentUSDT} USDT)`,
      });

      // 调用智能合约
      await treasury.purchaseProductWithETH(productType, ethAmount);

      if (treasury.hash) {
        setPaymentState(previous => ({
          ...previous,
          step: 'processing',
          txHash: treasury.hash,
        }));

        toast.loading('交易处理中...', {
          description: '等待区块链确认交易',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message?.includes('User rejected')
        ? '用户取消了交易'
        : error?.message || '支付失败';

      setPaymentState(previous => ({
        ...previous,
        step: 'error',
        error: errorMessage,
      }));

      toast.error('支付失败', {
        description: errorMessage,
      });

      onError?.(errorMessage);
    }
  };

  // 重置支付状态
  const resetPayment = () => {
    setPaymentState({ step: 'preparation' });
  };

  // 渲染支付准备阶段
  const renderPreparation = () => (
    <div className="space-y-4">
      {/* 支付详情 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {productConfig.icon} {productConfig.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">投资金额</span>
              <p className="font-semibold">{ethAmount} ETH</p>
            </div>
            <div>
              <span className="text-gray-500">等值USDT</span>
              <p className="font-semibold">{equivalentUSDT.toLocaleString()} USDT</p>
            </div>
            <div>
              <span className="text-gray-500">年化收益</span>
              <p className="font-semibold text-green-600">{productConfig.apr}%</p>
            </div>
            <div>
              <span className="text-gray-500">投资期限</span>
              <p className="font-semibold">{productConfig.duration}天</p>
            </div>
          </div>

          <Separator />

          {/* 预期收益计算 */}
          <div className="bg-gradient-to-r from-green-50 to-orange-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">预期收益</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>投资本金:</span>
                <span>{equivalentUSDT.toLocaleString()} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>预期收益:</span>
                <span className="text-green-600">
                  +{(
                    (equivalentUSDT * productConfig.apr) / PERCENT_SCALE * (productConfig.duration / DAYS_PER_YEAR)
                  ).toFixed(DECIMALS_TWO)} USDT
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>到期总值:</span>
                <span className="text-green-600">
                  {(
                    equivalentUSDT +
                    (equivalentUSDT * productConfig.apr) / PERCENT_SCALE * (productConfig.duration / DAYS_PER_YEAR)
                  ).toFixed(DECIMALS_TWO)} USDT
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 余额检查 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">钱包余额检查</span>
            <Badge variant={hasEnoughBalance ? 'default' : 'destructive'}>
              {hasEnoughBalance ? '充足' : '不足'}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">当前ETH余额:</span>
              <span>{ethBalance ? formatEther(ethBalance.value) : '0'} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">需要支付:</span>
              <span>{ethAmount} ETH</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>预计Gas费:</span>
              <span>~{formatEther(estimatedGasCost)} ETH</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>总计需要:</span>
              <span className={hasEnoughBalance ? '' : 'text-red-600'}>
                {formatEther(totalRequired)} ETH
              </span>
            </div>
          </div>

          {!hasEnoughBalance && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                余额不足。请确保钱包有足够的ETH支付投资金额和Gas费用。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          onClick={handlePayment}
          disabled={!hasEnoughBalance || treasury.isPending}
          className="flex-1"
        >
          {treasury.isPending
? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )
: (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          确认支付
        </Button>
      </div>
    </div>
  );

  // 渲染确认阶段
  const renderConfirmation = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">等待钱包确认</h3>
        <p className="text-gray-600">请在钱包中确认交易详情</p>
      </div>
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          请检查钱包弹窗并确认交易。确保Gas费设置合理以避免交易失败。
        </AlertDescription>
      </Alert>
    </div>
  );

  // 渲染处理阶段
  const renderProcessing = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
        <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">交易处理中</h3>
        <p className="text-gray-600">等待区块链网络确认交易</p>
      </div>

      {paymentState.txHash && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">交易哈希:</div>
          <div className="font-mono text-xs break-all">{paymentState.txHash}</div>
          {chainId === CHAIN_ID_SEPOLIA && (
            <Button
              variant="link"
              size="sm"
              onClick={() => window.open(`https://sepolia.etherscan.io/tx/${paymentState.txHash}`, '_blank')}
              className="mt-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              在区块浏览器查看
            </Button>
          )}
        </div>
      )}

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          交易正在处理中，通常需要1-3分钟。请不要关闭页面。
        </AlertDescription>
      </Alert>
    </div>
  );

  // 渲染成功阶段
  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-700">支付成功！</h3>
        <p className="text-gray-600">您的投资凭证NFT已发送到钱包</p>
      </div>

      {receipt && (
        <div className="bg-green-50 p-4 rounded-lg space-y-2">
          <div className="text-sm text-gray-700">
            <div>交易哈希: <span className="font-mono text-xs">{receipt.transactionHash}</span></div>
            <div>区块高度: {receipt.blockNumber?.toString()}</div>
            <div>Gas使用: {receipt.gasUsed?.toString()}</div>
          </div>

          {chainId === CHAIN_ID_SEPOLIA && (
            <Button
              variant="link"
              size="sm"
              onClick={() => window.open(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`, '_blank')}
          >
              <ExternalLink className="w-4 h-4 mr-1" />
              在区块浏览器查看
            </Button>
          )}
        </div>
      )}

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          投资已成功！您可以在个人仪表板查看投资详情和收益情况。
        </AlertDescription>
      </Alert>
    </div>
  );

  // 渲染错误阶段
  const renderError = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-700">支付失败</h3>
        <p className="text-gray-600">{paymentState.error || '发生未知错误'}</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {paymentState.error === '用户取消了交易'
            ? '您取消了交易。如需继续投资，请重新发起支付。'
            : '交易执行失败。请检查网络连接和钱包设置后重试。'
          }
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          关闭
        </Button>
        <Button onClick={resetPayment} className="flex-1">
          重新支付
        </Button>
      </div>
    </div>
  );

  // 主渲染逻辑
  const renderCurrentStep = () => {
    switch (paymentState.step) {
      case 'preparation': {
        return renderPreparation();
      }
      case 'confirmation': {
        return renderConfirmation();
      }
      case 'processing': {
        return renderProcessing();
      }
      case 'success': {
        return renderSuccess();
      }
      case 'error': {
        return renderError();
      }
      default: {
        return renderPreparation();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* 进度指示器 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {(['preparation', 'confirmation', 'processing', 'success'] as PaymentStep[]).map((step, index, steps) => {
            const isActive = step === paymentState.step;
            const isCompleted = ['confirmation', 'processing', 'success'].indexOf(paymentState.step) > index - 1;
            const isError = paymentState.step === 'error';

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    isError && index > 0
? 'bg-red-100 border-red-300 text-red-600'
                    : (isCompleted || isActive
? 'bg-orange-100 border-orange-500 text-orange-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400')
                  }`}
                >
                  {isCompleted && !isActive && paymentState.step !== 'error'
? (
                    <CheckCircle className="w-4 h-4" />
                  )
: (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isCompleted && !isError ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center text-sm text-gray-600">
          {paymentState.step === 'preparation' && '准备支付'}
          {paymentState.step === 'confirmation' && '钱包确认'}
          {paymentState.step === 'processing' && '处理中'}
          {paymentState.step === 'success' && '支付成功'}
          {paymentState.step === 'error' && '支付失败'}
        </div>
      </div>

      {/* 当前步骤内容 */}
      {renderCurrentStep()}
    </div>
  );
}
