'use client';

import { parseUnits, formatUnits } from 'viem';

import { QA_CARD_ABI, TREASURY_ABI, MOCK_USDT_ABI } from '../contracts/abis';
import { getContractAddresses, ProductType } from '../contracts/addresses';

import { useSafeAccount, useSafeReadContract, useSafeWriteContract, useSafeWaitForTransactionReceipt } from './use-safe-wagmi';

// Decimal constants
const DECIMALS_USDT = 6;
const DECIMALS_ETH = 18;

// 使用Treasury合约的Hook
export function useTreasury() {
  const { chainId, address, chain } = useSafeAccount();
  const contracts = getContractAddresses(chainId || 1);
  const { writeContract, data: hash, isPending } = useSafeWriteContract();
  const { isLoading: isConfirming, isSuccess } = useSafeWaitForTransactionReceipt({ hash });

  // 获取产品信息
  const { data: goldProductInfo } = useSafeReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.GOLD],
  });

  const { data: silverProductInfo } = useSafeReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.SILVER],
  });

  const { data: diamondProductInfo } = useSafeReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.DIAMOND],
  });

  const { data: platinumProductInfo } = useSafeReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.PLATINUM],
  });

  // 使用USDT购买产品
  const purchaseProduct = async (productType: ProductType, amount: string) => {
    const amountWei = parseUnits(amount, DECIMALS_USDT); // USDT 6位小数

    if (!address || !chain) throw new Error('Wallet not connected');

    await writeContract({
      address: contracts.TREASURY as `0x${string}`,
      abi: TREASURY_ABI,
      functionName: 'purchaseProduct',
      args: [productType, amountWei],
      account: address,
      chain,
    });
  };

  // 使用ETH购买产品
  const purchaseProductWithETH = async (productType: ProductType, ethAmount: string) => {
    const ethAmountWei = parseUnits(ethAmount, DECIMALS_ETH); // ETH 18位小数

    if (!address || !chain) throw new Error('Wallet not connected');

    await writeContract({
      address: contracts.TREASURY as `0x${string}`,
      abi: TREASURY_ABI,
      functionName: 'purchaseProductWithETH',
      args: [productType],
      account: address,
      chain,
      value: ethAmountWei, // 发送ETH
    });
  };

  // 获取用户ETH存款
  const { data: userEthDeposits } = useSafeReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'userEthDeposits',
    args: address ? [address] : undefined,
  });

  // 获取总ETH存款
  const { data: totalEthDeposits } = useSafeReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'totalEthDeposits',
  });

  return {
    purchaseProduct,
    purchaseProductWithETH,
    userEthDeposits,
    totalEthDeposits,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    productInfo: {
      gold: goldProductInfo,
      silver: silverProductInfo,
      diamond: diamondProductInfo,
      platinum: platinumProductInfo,
    },
  };
}

// 使用QACard NFT合约的Hook
export function useQACard() {
  const { address, chainId, chain } = useSafeAccount();
  const contracts = getContractAddresses(chainId || 1);
  const { writeContract, data: hash, isPending } = useSafeWriteContract();
  const { isLoading: isConfirming, isSuccess } = useSafeWaitForTransactionReceipt({ hash });

  // 读取类 Hook 请使用导出的专用 Hook（参见下方 useQACardInfo/useQACardPendingReward）

  // 提取奖励
  const claimReward = async (tokenId: bigint) => {
    if (!address || !chain) throw new Error('Wallet not connected');

    await writeContract({
      address: contracts.QA_CARD as `0x${string}`,
      abi: QA_CARD_ABI,
      functionName: 'claimReward',
      args: [tokenId],
      account: address,
      chain,
    });
  };

  // 获取用户余额
  const { data: balance } = useSafeReadContract({
    address: contracts.QA_CARD as `0x${string}`,
    abi: QA_CARD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  return {
    claimReward,
    balance,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// 专用读取 Hook：卡片信息
export function useQACardInfo(tokenId: bigint) {
  const { chainId } = useSafeAccount();
  const contracts = getContractAddresses(chainId || 1);
  return useSafeReadContract({
    address: contracts.QA_CARD as `0x${string}`,
    abi: QA_CARD_ABI,
    functionName: 'getCardInfo',
    args: [tokenId],
  });
}

// 专用读取 Hook：待提取奖励
export function useQACardPendingReward(tokenId: bigint) {
  const { chainId } = useSafeAccount();
  const contracts = getContractAddresses(chainId || 1);
  return useSafeReadContract({
    address: contracts.QA_CARD as `0x${string}`,
    abi: QA_CARD_ABI,
    functionName: 'getPendingReward',
    args: [tokenId],
  });
}

// 使用USDT代币合约的Hook
export function useUSDT() {
  const { address, chainId, chain } = useSafeAccount();
  const contracts = getContractAddresses(chainId || 1);
  const { writeContract, data: hash, isPending } = useSafeWriteContract();
  const { isLoading: isConfirming, isSuccess } = useSafeWaitForTransactionReceipt({ hash });

  // 获取USDT余额
  const { data: balance, refetch: refetchBalance } = useSafeReadContract({
    address: contracts.USDT as `0x${string}`,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // 获取授权额度（MockUSDT 是简化版本，可能没有allowance）
  const allowance = BigInt(0); // 简化处理
  const refetchAllowance = () => {};

  // 授权USDT给Treasury合约
  const approve = async (amount: string) => {
    if (!address || !chain) throw new Error('Wallet not connected');

    const amountWei = parseUnits(amount, DECIMALS_USDT); // USDT 6位小数

    await writeContract({
      address: contracts.USDT as `0x${string}`,
      abi: MOCK_USDT_ABI,
      functionName: 'approve',
      args: [contracts.TREASURY as `0x${string}`, amountWei],
      account: address,
      chain,
    });
  };

  // 检查是否需要授权
  const needsApproval = (amount: string) => {
    if (!allowance) return true;
    const amountWei = parseUnits(amount, DECIMALS_USDT);
    return allowance < amountWei;
  };

  // 格式化余额显示
  const formatBalance = () => {
    if (!balance) return '0';
    return formatUnits(balance, DECIMALS_USDT);
  };

  return {
    balance,
    allowance,
    approve,
    needsApproval,
    formatBalance,
    refetchBalance,
    refetchAllowance,
    isPending,
    isConfirming,
    isSuccess,
  };
}
