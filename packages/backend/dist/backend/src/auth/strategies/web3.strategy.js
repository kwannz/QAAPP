"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Strategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const eth_sig_util_1 = require("eth-sig-util");
const ethereumjs_util_1 = require("ethereumjs-util");
const users_service_1 = require("../../users/users.service");
const database_1 = require("@qa-app/database");
let Web3Strategy = class Web3Strategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'web3') {
    usersService;
    constructor(usersService) {
        super();
        this.usersService = usersService;
    }
    async validate(req) {
        const { address, message, signature } = req.body;
        if (!address || !message || !signature) {
            throw new common_1.UnauthorizedException('缺少必要的认证参数');
        }
        if (!(0, database_1.validateWalletAddress)(address)) {
            throw new common_1.UnauthorizedException('钱包地址格式无效');
        }
        const isValidSignature = this.verifySignature(address, message, signature);
        if (!isValidSignature) {
            throw new common_1.UnauthorizedException('签名验证失败');
        }
        const user = await this.usersService.findByWalletAddress(address);
        if (!user) {
            throw new common_1.UnauthorizedException('该钱包地址未注册');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('用户账户已被禁用');
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            referralCode: user.referralCode,
            isActive: user.isActive,
            wallets: user.wallets?.map((wallet) => ({
                id: wallet.id,
                address: wallet.address,
                chainId: wallet.chainId,
                isPrimary: wallet.isPrimary,
                label: wallet.label,
            })),
            agent: user.agent ? {
                id: user.agent.id,
                referralCode: user.agent.referralCode,
            } : undefined,
        };
    }
    verifySignature(address, message, signature) {
        try {
            const msgBuffer = Buffer.from(message, 'utf8');
            const msgHex = (0, ethereumjs_util_1.bufferToHex)(msgBuffer);
            const recoveredAddress = (0, eth_sig_util_1.recoverPersonalSignature)({
                data: msgHex,
                sig: signature,
            });
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            console.error('Web3 signature verification error:', error);
            return false;
        }
    }
};
exports.Web3Strategy = Web3Strategy;
exports.Web3Strategy = Web3Strategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], Web3Strategy);
//# sourceMappingURL=web3.strategy.js.map