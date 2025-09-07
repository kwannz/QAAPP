'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';
import { useSafeToast } from '../use-safe-toast';
import { logger } from '../verbose-logger';

import { web3ConnectionManager } from '../web3/connection-manager';

import { useWalletStatus } from './useWalletConnection';

// Chain and unit constants
const CHAIN_ID_MAINNET = 1;
const CHAIN_ID_POLYGON = 137;
const CHAIN_ID_ARBITRUM = 42_161; // arbitrum one
const CHAIN_ID_SEPOLIA = 11_155_111;
const DECIMALS_USDT = 6;
const DECIMALS_ETH = 18;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

// Treasury合约ABI (简化版)
export const TREASURY_ABI = [
  // 查询方法
  {
    name: 'getProducts',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{
      type: 'tuple[]',
      components: [
        { name: 'name', type: 'string' },
        { name: 'apy', type: 'uint256' },
        { name: 'duration', type: 'uint256' },
        { name: 'minInvestment', type: 'uint256' },
        { name: 'maxInvestment', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
      ],
    }],
  },
  {
    name: 'getUserPositions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{
      type: 'tuple[]',
      components: [
        { name: 'productId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'startTime', type: 'uint256' },
        { name: 'maturityTime', type: 'uint256' },
        { name: 'claimed', type: 'bool' },
      ],
    }],
  },
  {
    name: 'getUserReferralInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'referrer', type: 'address' },
        { name: 'totalReferredUsers', type: 'uint256' },
        { name: 'commissionEarned', type: 'uint256' },
        { name: 'totalCommissionClaimed', type: 'uint256' },
      ],
    }],
  },
  {
    name: 'getCurrentPriceInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'rate', type: 'uint256' },
        { name: 'lastUpdated', type: 'uint256' },
        { name: 'isValid', type: 'bool' },
      ],
    }],
  },
  {
    name: 'getPeriodRewardInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'periodId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'totalReward', type: 'uint256' },
        { name: 'totalInvestments', type: 'uint256' },
        { name: 'startTime', type: 'uint256' },
        { name: 'claimed', type: 'bool' },
      ],
    }],
  },

  // 写入方法
  {
    name: 'purchaseProduct',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  {
    name: 'purchaseProductWithReferral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'referrer', type: 'address' },
    ],
  },
  {
    name: 'purchaseProductWithETH',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'productId', type: 'uint256' },
    ],
  },
  {
    name: 'setReferrer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'referrer', type: 'address' },
    ],
  },
  {
    name: 'claimReferralCommission',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
  },
  {
    name: 'claimPeriodReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'periodId', type: 'uint256' },
    ],
  },

  // 事件
  {
    name: 'ProductPurchased',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'productId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    name: 'ReferralSet',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'referrer', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    name: 'ReferralCommissionPaid',
    type: 'event',
    inputs: [
      { name: 'referrer', type: 'address', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'commission', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
] as const;

export interface Product {
  name: string
  apy: bigint
  duration: bigint
  minInvestment: bigint
  maxInvestment: bigint
  isActive: boolean
}

export interface Position {
  productId: bigint
  amount: bigint
  startTime: bigint
  maturityTime: bigint
  claimed: boolean
}

export interface ReferralInfo {
  referrer: Address
  totalReferredUsers: bigint
  commissionEarned: bigint
  totalCommissionClaimed: bigint
}

export interface PriceInfo {
  rate: bigint
  lastUpdated: bigint
  isValid: boolean
}

export interface PeriodRewardInfo {
  totalReward: bigint
  totalInvestments: bigint
  startTime: bigint
  claimed: boolean
}

export function useTreasuryContract() {
  const toast = useSafeToast();
  const { isConnected, address, chainId, isNetworkSupported } = useWalletStatus();
  const [contractAddress, setContractAddress] = useState<Address>();
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

  // 获取交易状态
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // 设置合约地址
  useEffect(() => {
    if (chainId && isNetworkSupported) {
      const addr = web3ConnectionManager.getContractAddress(chainId, 'treasury');
      if (addr && addr !== '0x0000000000000000000000000000000000000000') {
        setContractAddress(addr as Address);
      }
    }
  }, [chainId, isNetworkSupported]);

  // 获取链对象的辅助函数
  const getChainObject = useCallback(() => {
    switch (chainId) {
      case CHAIN_ID_MAINNET: { return mainnet;
      }
      case CHAIN_ID_POLYGON: { return polygon;
      }
      case CHAIN_ID_ARBITRUM: { return arbitrum;
      }
      case CHAIN_ID_SEPOLIA: { return sepolia;
      }
      default: { return sepolia;
      } // 默认使用sepolia
    }
  }, [chainId]);

  // 读取产品列表
  const { data: products, isLoading: isProductsLoading, refetch: refetchProducts } = useReadContract({
    address: contractAddress,
    abi: TREASURY_ABI,
    functionName: 'getProducts',
    query: {
      enabled: Boolean(contractAddress) && isNetworkSupported,
    },
  }) as { data: Product[] | undefined, isLoading: boolean, refetch: () => void };

  // 读取用户持仓
  const { data: positions, isLoading: isPositionsLoading, refetch: refetchPositions } = useReadContract({
    address: contractAddress,
    abi: TREASURY_ABI,
    functionName: 'getUserPositions',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(contractAddress) && Boolean(address) && isNetworkSupported,
    },
  }) as { data: Position[] | undefined, isLoading: boolean, refetch: () => void };

  // 读取推荐信息
  const { data: referralInfo, isLoading: isReferralLoading, refetch: refetchReferral } = useReadContract({
    address: contractAddress,
    abi: TREASURY_ABI,
    functionName: 'getUserReferralInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(contractAddress) && Boolean(address) && isNetworkSupported,
    },
  }) as { data: ReferralInfo | undefined, isLoading: boolean, refetch: () => void };

  // 读取价格信息
  const { data: priceInfo, isLoading: isPriceLoading, refetch: refetchPrice } = useReadContract({
    address: contractAddress,
    abi: TREASURY_ABI,
    functionName: 'getCurrentPriceInfo',
    query: {
      enabled: Boolean(contractAddress) && isNetworkSupported,
      refetchInterval: 30_000, // 每30秒刷新价格
    },
  }) as { data: PriceInfo | undefined, isLoading: boolean, refetch: () => void };

  // 购买产品 (USDT)
  const purchaseWithUSDT = useCallback(async (productId: number, amount: string) => {
    if (!contractAddress) {
      toast.error('合约地址未配置');
      return;
    }

    try {
      const amountInWei = parseUnits(amount, DECIMALS_USDT); // USDT是6位小数
      await writeContract({
        address: contractAddress,
        abi: TREASURY_ABI,
        functionName: 'purchaseProduct',
        args: [BigInt(productId), amountInWei],
        chain: getChainObject(),
        account: address as Address,
      });
      toast.success('交易已提交，等待确认...');
    } catch (error: any) {
      logger.error('TreasuryContract', 'Purchase failed', { error });
      toast.error(`购买失败: ${error.message}`);
      throw error;
    }
  }, [contractAddress, writeContract, address, getChainObject, toast]);

  // 购买产品带推荐人 (USDT)
  const purchaseWithReferral = useCallback(async (productId: number, amount: string, referrer: Address) => {
    if (!contractAddress) {
      toast.error('合约地址未配置');
      return;
    }

    try {
      const amountInWei = parseUnits(amount, DECIMALS_USDT);
      await writeContract({
        address: contractAddress,
        abi: TREASURY_ABI,
        functionName: 'purchaseProductWithReferral',
        args: [BigInt(productId), amountInWei, referrer],
        chain: getChainObject(),
        account: address as Address,
      });
      toast.success('交易已提交，等待确认...');
    } catch (error: any) {
      logger.error('TreasuryContract', 'Purchase with referral failed', { error });
      toast.error(`购买失败: ${error.message}`);
      throw error;
    }
  }, [contractAddress, writeContract, address, getChainObject, toast]);

  // 购买产品 (ETH)
  const purchaseWithETH = useCallback(async (productId: number, ethAmount: string) => {
    if (!contractAddress) {
      toast.error('合约地址未配置');
      return;
    }

    try {
      const amountInWei = parseUnits(ethAmount, DECIMALS_ETH);
      await writeContract({
        address: contractAddress,
        abi: TREASURY_ABI,
        functionName: 'purchaseProductWithETH',
        args: [BigInt(productId)],
        value: amountInWei,
        chain: getChainObject(),
        account: address as Address,
      });
      toast.success('交易已提交，等待确认...');
    } catch (error: any) {
      logger.error('TreasuryContract', 'ETH purchase failed', { error });
      toast.error(`ETH购买失败: ${error.message}`);
      throw error;
    }
  }, [contractAddress, writeContract, address, getChainObject, toast]);

  // 设置推荐人
  const setReferrer = useCallback(async (referrer: Address) => {
    if (!contractAddress) {
      toast.error('合约地址未配置');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: TREASURY_ABI,
        functionName: 'setReferrer',
        args: [referrer],
        chain: getChainObject(),
        account: address as Address,
      });
      toast.success('推荐人设置已提交，等待确认...');
    } catch (error: any) {
      logger.error('TreasuryContract', 'Set referrer failed', { error });
      toast.error(`设置推荐人失败: ${error.message}`);
      throw error;
    }
  }, [contractAddress, writeContract, address, getChainObject, toast]);

  // 领取推荐佣金
  const claimReferralCommission = useCallback(async () => {
    if (!contractAddress) {
      toast.error('合约地址未配置');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: TREASURY_ABI,
        functionName: 'claimReferralCommission',
        chain: getChainObject(),
        account: address as Address,
      });
      toast.success('佣金领取已提交，等待确认...');
    } catch (error: any) {
      logger.error('TreasuryContract', 'Claim referral commission failed', { error });
      toast.error(`领取佣金失败: ${error.message}`);
      throw error;
    }
  }, [contractAddress, writeContract, address, getChainObject, toast]);

  // 领取周期奖励
  const claimPeriodReward = useCallback(async (periodId: number) => {
    if (!contractAddress) {
      toast.error('合约地址未配置');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: TREASURY_ABI,
        functionName: 'claimPeriodReward',
        args: [BigInt(periodId)],
        chain: getChainObject(),
        account: address as Address,
      });
      toast.success('周期奖励领取已提交，等待确认...');
    } catch (error: any) {
      logger.error('TreasuryContract', 'Claim period reward failed', { error });
      toast.error(`领取周期奖励失败: ${error.message}`);
      throw error;
    }
  }, [contractAddress, writeContract, address, getChainObject, toast]);

  // 刷新所有数据
  const refreshData = useCallback(() => {
    refetchProducts();
    refetchPositions();
    refetchReferral();
    refetchPrice();
  }, [refetchProducts, refetchPositions, refetchReferral, refetchPrice]);

  // 监听交易确认
  useEffect(() => {
    if (isSuccess) {
      toast.success('交易已确认！');
      refreshData();
    }
  }, [isSuccess, refreshData, toast]);

  // 格式化工具函数
  const formatUSDT = useCallback((amount: bigint) => {
    return formatUnits(amount, DECIMALS_USDT);
  }, []);

  const DECIMALS_PERCENT = 2;
  const formatAPY = useCallback((apy: bigint) => {
    return formatUnits(apy, DECIMALS_PERCENT); // APY以百分比形式存储，如1200表示12.00%
  }, []);

  const formatDuration = useCallback((duration: bigint) => {
    const days = Number(duration) / SECONDS_PER_DAY;
    return `${days} 天`;
  }, []);

  return {
    // 状态
    isContractReady: Boolean(contractAddress) && isNetworkSupported,
    contractAddress,
    isConnected,

    // 读取数据
    products: products || [],
    positions: positions || [],
    referralInfo,
    priceInfo,

    // 加载状态
    isProductsLoading,
    isPositionsLoading,
    isReferralLoading,
    isPriceLoading,
    isWritePending,
    isConfirming,

    // 操作方法
    purchaseWithUSDT,
    purchaseWithReferral,
    purchaseWithETH,
    setReferrer,
    claimReferralCommission,
    claimPeriodReward,
    refreshData,

    // 工具方法
    formatUSDT,
    formatAPY,
    formatDuration,

    // 交易状态
    lastTxHash: hash,
    isSuccess,
  };
}
