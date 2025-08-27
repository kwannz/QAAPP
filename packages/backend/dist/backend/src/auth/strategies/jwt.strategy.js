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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/users.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    usersService;
    constructor(configService, usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
            issuer: configService.get('JWT_ISSUER', 'qa-app'),
            audience: configService.get('JWT_AUDIENCE', 'qa-app-users'),
        });
        this.configService = configService;
        this.usersService = usersService;
    }
    async validate(payload) {
        const { sub: userId } = payload;
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('用户账户已被禁用');
        }
        if (user.role !== payload.role) {
            throw new common_1.UnauthorizedException('用户权限已变更，请重新登录');
        }
        if (user.kycStatus !== payload.kycStatus) {
            throw new common_1.UnauthorizedException('用户KYC状态已变更，请重新登录');
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
            positions: user.positions?.map((position) => ({
                id: position.id,
                productId: position.productId,
                principal: position.principal.toNumber(),
                status: position.status,
                endDate: position.endDate,
            })),
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map