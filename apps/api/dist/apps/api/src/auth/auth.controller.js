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
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async generateWalletChallenge(challengeDto) {
        return this.authService.generateWalletChallenge(challengeDto);
    }
    async verifyWalletSignature(verifyDto) {
        return this.authService.verifyWalletSignature(verifyDto);
    }
    async googleLogin(body) {
        return this.authService.googleLogin(body.token);
    }
    async refreshToken(refreshDto) {
        return this.authService.refreshToken(refreshDto);
    }
    async logout(req) {
        return this.authService.logout(req.user.id);
    }
    async getProfile(req) {
        return req.user;
    }
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'auth',
            timestamp: new Date().toISOString(),
            activeChallenges: await this.getActiveChallengeCount(),
        };
    }
    async getActiveChallengeCount() {
        return 0;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many login attempts' }),
    (0, throttler_1.Throttle)({ auth: { ttl: 60000, limit: 5 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Register new user account' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registered successfully',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email already registered or invalid data' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many registration attempts' }),
    (0, throttler_1.Throttle)({ auth: { ttl: 60000, limit: 3 } }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate wallet signature challenge' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Challenge generated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'Message to be signed by wallet' },
                expiresAt: { type: 'string', format: 'date-time', description: 'Challenge expiration time' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many challenge requests' }),
    (0, throttler_1.Throttle)({ sensitive: { ttl: 60000, limit: 10 } }),
    (0, common_1.Post)('wallet/challenge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.WalletChallengeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateWalletChallenge", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify wallet signature and login' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet signature verified successfully',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid signature' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many verification attempts' }),
    (0, throttler_1.Throttle)({ auth: { ttl: 60000, limit: 5 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('wallet/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.WalletVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyWalletSignature", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login with Google account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Google login successful',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid Google token' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many Google login attempts' }),
    (0, throttler_1.Throttle)({ auth: { ttl: 60000, limit: 5 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Logout current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                kycStatus: { type: 'string' },
                referralCode: { type: 'string' },
                wallets: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            address: { type: 'string' },
                            chainId: { type: 'number' },
                            isPrimary: { type: 'boolean' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Health check for authentication service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentication service is healthy' }),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "healthCheck", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map