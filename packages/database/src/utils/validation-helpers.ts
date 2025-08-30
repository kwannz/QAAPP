// 定义枚举值常量（SQLite不支持enum）
const UserRole = {
  USER: 'USER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN'
};

const KycStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

const OrderStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED'
};

const PositionStatus = {
  ACTIVE: 'ACTIVE',
  REDEEMING: 'REDEEMING',
  CLOSED: 'CLOSED',
  DEFAULTED: 'DEFAULTED'
};

const CommissionType = {
  REFERRAL: 'REFERRAL',
  AGENT: 'AGENT'
};

const CommissionStatus = {
  PENDING: 'PENDING',
  READY: 'READY',
  PAID: 'PAID',
  FAILED: 'FAILED'
};

// 用户验证
export function validateUserRole(role: string): boolean {
  return Object.values(UserRole).includes(role);
}

export function validateKycStatus(status: string): boolean {
  return Object.values(KycStatus).includes(status);
}

// 订单验证
export function validateOrderStatus(status: string): boolean {
  return Object.values(OrderStatus).includes(status);
}

export function validateUsdtAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
}

// 仓位验证
export function validatePositionStatus(status: string): boolean {
  return Object.values(PositionStatus).includes(status);
}

// 佣金验证
export function validateCommissionType(type: string): boolean {
  return Object.values(CommissionType).includes(type);
}

export function validateCommissionStatus(status: string): boolean {
  return Object.values(CommissionStatus).includes(status);
}

export function validateCommissionRate(rateBps: number): boolean {
  return rateBps >= 0 && rateBps <= 10000 && Number.isInteger(rateBps);
}

// 通用验证
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // 密码必须至少8位，包含大小写字母、数字和特殊字符
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateWalletAddress(address: string): boolean {
  // 以太坊地址验证（以0x开头的42位十六进制字符串）
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

export function validateTxHash(txHash: string): boolean {
  // 交易哈希验证（以0x开头的66位十六进制字符串）
  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  return txHashRegex.test(txHash);
}

export function validateReferralCode(code: string): boolean {
  // 推荐码：6-12位大写字母和数字
  const referralCodeRegex = /^[A-Z0-9]{6,12}$/;
  return referralCodeRegex.test(code);
}

export function validateChainId(chainId: number): boolean {
  // 支持的链ID列表
  const supportedChains = [1, 137, 42161, 80001, 421613]; // Ethereum, Polygon, Arbitrum等
  return supportedChains.includes(chainId);
}

// 日期验证
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

export function validateLockDays(days: number): boolean {
  return days > 0 && days <= 365 && Number.isInteger(days);
}

export function validateAprBps(aprBps: number): boolean {
  // APR基点：0-10000（0%-100%）
  return aprBps >= 0 && aprBps <= 10000 && Number.isInteger(aprBps);
}

// 产品验证
export function validateProductSymbol(symbol: string): boolean {
  // 产品符号：3-10位大写字母
  const symbolRegex = /^[A-Z]{3,10}$/;
  return symbolRegex.test(symbol);
}

export function validateNftTokenId(tokenId: number): boolean {
  return tokenId > 0 && tokenId <= 1000000 && Number.isInteger(tokenId);
}

export function validateSupply(current: number, total?: number): boolean {
  if (total && current > total) {
    return false;
  }
  return current >= 0 && Number.isInteger(current);
}

// JSON数据验证
export function validateJsonData(data: any): boolean {
  try {
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
}

// 批量验证辅助函数
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function createValidationResult(isValid: boolean, errors: string[] = []): ValidationResult {
  return { isValid, errors };
}

export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const errors: string[] = [];
  let isValid = true;

  for (const result of results) {
    if (!result.isValid) {
      isValid = false;
      errors.push(...result.errors);
    }
  }

  return { isValid, errors };
}

// 用户数据验证
export function validateUserData(data: {
  email?: string;
  password?: string;
  role?: string;
  referralCode?: string;
  kycStatus?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (data.email && !validateEmail(data.email)) {
    errors.push('邮箱格式无效');
  }

  if (data.password && !validatePassword(data.password)) {
    errors.push('密码必须至少8位，包含大小写字母、数字和特殊字符');
  }

  if (data.role && !validateUserRole(data.role)) {
    errors.push('用户角色无效');
  }

  if (data.referralCode && !validateReferralCode(data.referralCode)) {
    errors.push('推荐码格式无效（6-12位大写字母和数字）');
  }

  if (data.kycStatus && !validateKycStatus(data.kycStatus)) {
    errors.push('KYC状态无效');
  }

  return createValidationResult(errors.length === 0, errors);
}

// 订单数据验证
export function validateOrderData(data: {
  usdtAmount?: number;
  status?: string;
  txHash?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (data.usdtAmount && !validateUsdtAmount(data.usdtAmount)) {
    errors.push('USDT金额无效（必须大于0且小于等于1,000,000）');
  }

  if (data.status && !validateOrderStatus(data.status)) {
    errors.push('订单状态无效');
  }

  if (data.txHash && !validateTxHash(data.txHash)) {
    errors.push('交易哈希格式无效');
  }

  return createValidationResult(errors.length === 0, errors);
}

// 产品数据验证
export function validateProductData(data: {
  symbol?: string;
  minAmount?: number;
  maxAmount?: number;
  aprBps?: number;
  lockDays?: number;
  nftTokenId?: number;
  totalSupply?: number;
  currentSupply?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (data.symbol && !validateProductSymbol(data.symbol)) {
    errors.push('产品符号格式无效（3-10位大写字母）');
  }

  if (data.minAmount && !validateUsdtAmount(data.minAmount)) {
    errors.push('最小投资金额无效');
  }

  if (data.maxAmount && !validateUsdtAmount(data.maxAmount)) {
    errors.push('最大投资金额无效');
  }

  if (data.minAmount && data.maxAmount && data.minAmount >= data.maxAmount) {
    errors.push('最小投资金额必须小于最大投资金额');
  }

  if (data.aprBps && !validateAprBps(data.aprBps)) {
    errors.push('APR基点无效（0-10000）');
  }

  if (data.lockDays && !validateLockDays(data.lockDays)) {
    errors.push('锁定天数无效（1-365天）');
  }

  if (data.nftTokenId && !validateNftTokenId(data.nftTokenId)) {
    errors.push('NFT Token ID无效');
  }

  if (data.totalSupply !== undefined && data.currentSupply !== undefined) {
    if (!validateSupply(data.currentSupply, data.totalSupply)) {
      errors.push('当前供应量不能超过总供应量');
    }
  }

  return createValidationResult(errors.length === 0, errors);
}