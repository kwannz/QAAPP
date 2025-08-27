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
exports.WalletGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const users_service_1 = require("../../users/users.service");
const wallet_required_decorator_1 = require("../decorators/wallet-required.decorator");
let WalletGuard = class WalletGuard {
    reflector;
    usersService;
    constructor(reflector, usersService) {
        this.reflector = reflector;
        this.usersService = usersService;
    }
    async canActivate(context) {
        const walletRequired = this.reflector.getAllAndOverride(wallet_required_decorator_1.WALLET_REQUIRED_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!walletRequired) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('用户信息不存在');
        }
        const userWithWallets = await this.usersService.findById(user.id);
        if (!userWithWallets?.wallets || userWithWallets.wallets.length === 0) {
            throw new common_1.ForbiddenException('需要绑定钱包地址才能访问此功能');
        }
        const hasPrimaryWallet = userWithWallets.wallets.some((wallet) => wallet.isPrimary);
        if (!hasPrimaryWallet) {
            throw new common_1.ForbiddenException('需要设置主钱包地址');
        }
        request.user.wallets = userWithWallets.wallets.map((wallet) => ({
            id: wallet.id,
            address: wallet.address,
            chainId: wallet.chainId,
            isPrimary: wallet.isPrimary,
            label: wallet.label,
        }));
        return true;
    }
};
exports.WalletGuard = WalletGuard;
exports.WalletGuard = WalletGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        users_service_1.UsersService])
], WalletGuard);
//# sourceMappingURL=wallet.guard.js.map