"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRole = validateUserRole;
exports.validateKycStatus = validateKycStatus;
exports.validateOrderStatus = validateOrderStatus;
exports.validateUsdtAmount = validateUsdtAmount;
exports.validatePositionStatus = validatePositionStatus;
exports.validateCommissionType = validateCommissionType;
exports.validateCommissionStatus = validateCommissionStatus;
exports.validateCommissionRate = validateCommissionRate;
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.validateWalletAddress = validateWalletAddress;
exports.validateTxHash = validateTxHash;
exports.validateReferralCode = validateReferralCode;
exports.validateChainId = validateChainId;
exports.validateDateRange = validateDateRange;
exports.validateLockDays = validateLockDays;
exports.validateAprBps = validateAprBps;
exports.validateProductSymbol = validateProductSymbol;
exports.validateNftTokenId = validateNftTokenId;
exports.validateSupply = validateSupply;
exports.validateJsonData = validateJsonData;
exports.createValidationResult = createValidationResult;
exports.combineValidationResults = combineValidationResults;
exports.validateUserData = validateUserData;
exports.validateOrderData = validateOrderData;
exports.validateProductData = validateProductData;
const client_1 = require("@prisma/client");
// 用户验证
function validateUserRole(role) {
    return Object.values(client_1.UserRole).includes(role);
}
function validateKycStatus(status) {
    return Object.values(client_1.KycStatus).includes(status);
}
// 订单验证
function validateOrderStatus(status) {
    return Object.values(client_1.OrderStatus).includes(status);
}
function validateUsdtAmount(amount) {
    return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
}
// 仓位验证
function validatePositionStatus(status) {
    return Object.values(client_1.PositionStatus).includes(status);
}
// 佣金验证
function validateCommissionType(type) {
    return Object.values(client_1.CommissionType).includes(type);
}
function validateCommissionStatus(status) {
    return Object.values(client_1.CommissionStatus).includes(status);
}
function validateCommissionRate(rateBps) {
    return rateBps >= 0 && rateBps <= 10000 && Number.isInteger(rateBps);
}
// 通用验证
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePassword(password) {
    // 密码必须至少8位，包含大小写字母、数字和特殊字符
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}
function validateWalletAddress(address) {
    // 以太坊地址验证（以0x开头的42位十六进制字符串）
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
}
function validateTxHash(txHash) {
    // 交易哈希验证（以0x开头的66位十六进制字符串）
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    return txHashRegex.test(txHash);
}
function validateReferralCode(code) {
    // 推荐码：6-12位大写字母和数字
    const referralCodeRegex = /^[A-Z0-9]{6,12}$/;
    return referralCodeRegex.test(code);
}
function validateChainId(chainId) {
    // 支持的链ID列表
    const supportedChains = [1, 137, 42161, 80001, 421613]; // Ethereum, Polygon, Arbitrum等
    return supportedChains.includes(chainId);
}
// 日期验证
function validateDateRange(startDate, endDate) {
    return startDate < endDate;
}
function validateLockDays(days) {
    return days > 0 && days <= 365 && Number.isInteger(days);
}
function validateAprBps(aprBps) {
    // APR基点：0-10000（0%-100%）
    return aprBps >= 0 && aprBps <= 10000 && Number.isInteger(aprBps);
}
// 产品验证
function validateProductSymbol(symbol) {
    // 产品符号：3-10位大写字母
    const symbolRegex = /^[A-Z]{3,10}$/;
    return symbolRegex.test(symbol);
}
function validateNftTokenId(tokenId) {
    return tokenId > 0 && tokenId <= 1000000 && Number.isInteger(tokenId);
}
function validateSupply(current, total) {
    if (total && current > total) {
        return false;
    }
    return current >= 0 && Number.isInteger(current);
}
// JSON数据验证
function validateJsonData(data) {
    try {
        JSON.stringify(data);
        return true;
    }
    catch {
        return false;
    }
}
function createValidationResult(isValid, errors = []) {
    return { isValid, errors };
}
function combineValidationResults(...results) {
    const errors = [];
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
function validateUserData(data) {
    const errors = [];
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
function validateOrderData(data) {
    const errors = [];
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
function validateProductData(data) {
    const errors = [];
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
//# sourceMappingURL=validation-helpers.js.map