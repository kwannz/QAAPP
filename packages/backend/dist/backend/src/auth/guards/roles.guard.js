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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const database_1 = require("@qa-app/database");
const roles_decorator_1 = require("../decorators/roles.decorator");
const kyc_required_decorator_1 = require("../decorators/kyc-required.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const kycRequired = this.reflector.getAllAndOverride(kyc_required_decorator_1.KYC_REQUIRED_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles && !kycRequired) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('用户信息不存在');
        }
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.includes(user.role);
            if (!hasRole) {
                throw new common_1.ForbiddenException(`需要以下角色之一: ${requiredRoles.join(', ')}`);
            }
        }
        if (kycRequired) {
            if (user.kycStatus !== database_1.KycStatus.APPROVED) {
                throw new common_1.ForbiddenException('需要完成KYC认证才能访问此功能');
            }
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map