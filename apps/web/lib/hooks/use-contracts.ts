'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { getContractAddresses, ProductType } from '../contracts/addresses'
import { QA_CARD_ABI, TREASURY_ABI, MOCK_USDT_ABI } from '../contracts/abis'

// 使用Treasury合约的Hook
export function useTreasury() {
  const { chainId, address, chain } = useAccount()
  const contracts = getContractAddresses(chainId || 1)
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // 获取产品信息
  const { data: goldProductInfo } = useReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.GOLD],
  })

  const { data: silverProductInfo } = useReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.SILVER],
  })

  const { data: diamondProductInfo } = useReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.DIAMOND],
  })

  const { data: platinumProductInfo } = useReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getProductInfo',
    args: [ProductType.PLATINUM],
  })

  // 使用USDT购买产品
  const purchaseProduct = async (productType: ProductType, amount: string) => {
    const amountWei = parseUnits(amount, 6) // USDT 6位小数
    
    if (!address || !chain) throw new Error('Wallet not connected')
    
    await writeContract({
      address: contracts.TREASURY as `0x${string}`,
      abi: TREASURY_ABI,
      functionName: 'purchaseProduct',
      args: [productType, amountWei],
      account: address,
      chain
    })
  }

  // 使用ETH购买产品
  const purchaseProductWithETH = async (productType: ProductType, ethAmount: string) => {
    const ethAmountWei = parseUnits(ethAmount, 18) // ETH 18位小数
    
    if (!address || !chain) throw new Error('Wallet not connected')
    
    await writeContract({
      address: contracts.TREASURY as `0x${string}`,
      abi: TREASURY_ABI,
      functionName: 'purchaseProductWithETH',
      args: [productType],
      account: address,
      chain,
      value: ethAmountWei // 发送ETH
    })
  }

  // 获取用户ETH存款
  const { data: userEthDeposits } = useReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'userEthDeposits',
    args: address ? [address] : undefined,
  })

  // 获取总ETH存款
  const { data: totalEthDeposits } = useReadContract({
    address: contracts.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'totalEthDeposits',
  })

  return {
    purchaseProduct,
    purchaseProductWithETH,
    userEthDeposits,
    totalEthDeposits,
    isPending,
    isConfirming,
    isSuccess,
    productInfo: {
      gold: goldProductInfo,
      silver: silverProductInfo,
      diamond: diamondProductInfo,
      platinum: platinumProductInfo,
    }
  }
}

// 使用QACard NFT合约的Hook
export function useQACard() {
  const { address, chainId, chain } = useAccount()
  const contracts = getContractAddresses(chainId || 1)
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // 获取用户持有指定类型NFT的数量
  const getBalanceOf = (tokenId: number) => {
    return useReadContract({
      address: contracts.QA_CARD as `0x${string}`,
      abi: QA_CARD_ABI,
      functionName: 'balanceOf',
      args: address ? [address, BigInt(tokenId)] : undefined,
    })
  }

  return {
    getBalanceOf,
    isPending,
    isConfirming,
    isSuccess,
  }
}

// 使用USDT代币合约的Hook
export function useUSDT() {
  const { address, chainId, chain } = useAccount()
  const contracts = getContractAddresses(chainId || 1)
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // 获取USDT余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contracts.USDT as `0x${string}`,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // 获取授权额度（MockUSDT 是简化版本，可能没有allowance）
  const allowance = BigInt(0) // 简化处理
  const refetchAllowance = () => {}

  // 授权USDT给Treasury合约
  const approve = async (amount: string) => {
    if (!address || !chain) throw new Error('Wallet not connected')
    
    const amountWei = parseUnits(amount, 6) // USDT 6位小数
    
    await writeContract({
      address: contracts.USDT as `0x${string}`,
      abi: MOCK_USDT_ABI,
      functionName: 'approve',
      args: [contracts.TREASURY as `0x${string}`, amountWei],
      account: address,
      chain
    })
  }

  // 检查是否需要授权
  const needsApproval = (amount: string) => {
    if (!allowance) return true
    const amountWei = parseUnits(amount, 6)
    return allowance < amountWei
  }

  // 格式化余额显示
  const formatBalance = () => {
    if (!balance) return '0'
    return formatUnits(balance, 6)
  }

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
  }
}