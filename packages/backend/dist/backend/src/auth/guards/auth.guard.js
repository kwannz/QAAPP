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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../../users/users.service");
const public_decorator_1 = require("../decorators/public.decorator");
let AuthGuard = class AuthGuard {
    jwtService;
    usersService;
    reflector;
    constructor(jwtService, usersService, reflector) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('访问令牌不存在');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('用户不存在');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('用户账户已被禁用');
            }
            if (user.role !== payload.role || user.kycStatus !== payload.kycStatus) {
                throw new common_1.UnauthorizedException('用户信息已变更，请重新登录');
            }
            request['user'] = {
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
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('访问令牌无效');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map