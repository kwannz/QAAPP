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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_guard_1 = require("./guards/auth.guard");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto, ip, userAgent) {
        return this.authService.register(registerDto, ip, userAgent);
    }
    async login(loginDto, ip, userAgent) {
        return this.authService.login(loginDto, ip, userAgent);
    }
    async getWeb3Challenge(address) {
        return this.authService.getWeb3Challenge(address);
    }
    async web3Register(web3RegisterDto, ip, userAgent) {
        return this.authService.web3Register(web3RegisterDto, ip, userAgent);
    }
    async web3Login(web3LoginDto, ip, userAgent) {
        return this.authService.web3Login(web3LoginDto, ip, userAgent);
    }
    async changePassword(req, changePasswordDto) {
        return this.authService.changePassword(req.user.id, changePasswordDto);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }
    async refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
    async logout(req) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return this.authService.logout(req.user.id, token);
    }
    async getProfile(req) {
        return req.user;
    }
    async validateToken() {
        return { message: '令牌有效', valid: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: '邮箱密码注册' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.RegisterDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '注册成功',
        schema: {
            example: {
                user: {
                    id: 'user-123',
                    email: 'user@example.com',
                    role: 'USER',
                    kycStatus: 'PENDING',
                    referralCode: 'ABC123',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z'
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expiresIn: 604800
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '输入数据无效' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '邮箱已被注册' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '邮箱密码登录' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '登录成功',
        schema: {
            example: {
                user: {
                    id: 'user-123',
                    email: 'user@example.com',
                    role: 'USER',
                    kycStatus: 'APPROVED',
                    referralCode: 'ABC123'
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expiresIn: 604800
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '邮箱或密码错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('web3/challenge/:address'),
    (0, swagger_1.ApiOperation)({ summary: '获取Web3签名挑战' }),
    (0, swagger_1.ApiParam)({ name: 'address', description: '钱包地址', example: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取挑战成功',
        schema: {
            example: {
                challenge: '请签名此消息以验证您的身份\\n\\n时间戳: 1640995200000\\n随机数: abc123...',
                expiresAt: '2024-01-01T00:10:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '钱包地址格式无效' }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getWeb3Challenge", null);
__decorate([
    (0, common_1.Post)('web3/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Web3钱包注册' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.Web3RegisterDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '注册成功',
        schema: {
            example: {
                user: {
                    id: 'user-123',
                    role: 'USER',
                    kycStatus: 'PENDING',
                    referralCode: 'ABC123',
                    wallets: [{
                            address: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6',
                            chainId: 1,
                            isPrimary: true
                        }]
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expiresIn: 604800
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '签名验证失败或挑战过期' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '钱包地址已被注册' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.Web3RegisterDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "web3Register", null);
__decorate([
    (0, common_1.Post)('web3/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Web3钱包登录' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.Web3LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '登录成功',
        schema: {
            example: {
                user: {
                    id: 'user-123',
                    role: 'USER',
                    kycStatus: 'APPROVED',
                    referralCode: 'ABC123'
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expiresIn: 604800
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '签名验证失败或挑战过期' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '钱包地址未注册' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.Web3LoginDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "web3Login", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '修改密码' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ChangePasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '密码修改成功' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '当前密码错误或用户未认证' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '忘记密码' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ForgotPasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '重置邮件已发送' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '刷新访问令牌' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.RefreshTokenDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '令牌刷新成功',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expiresIn: 604800
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '刷新令牌无效' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '登出' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '登出成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户信息' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取用户信息成功',
        schema: {
            example: {
                id: 'user-123',
                email: 'user@example.com',
                role: 'USER',
                kycStatus: 'APPROVED',
                referralCode: 'ABC123',
                isActive: true,
                wallets: [{
                        address: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6',
                        chainId: 1,
                        isPrimary: true,
                        label: '主钱包'
                    }],
                agent: {
                    id: 'agent-001',
                    referralCode: 'AGENT001'
                },
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('validate'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '验证令牌有效性' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '令牌有效' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '令牌无效' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('认证'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map