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
exports.AuthResponseDto = exports.RefreshTokenDto = exports.WalletVerifyDto = exports.WalletChallengeDto = exports.RegisterDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'StrongPassword123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'REFER123' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "walletAddress", void 0);
class WalletChallengeDto {
}
exports.WalletChallengeDto = WalletChallengeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c4f2fb',
        description: 'Ethereum wallet address'
    }),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], WalletChallengeDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Chain ID (1 for mainnet, 11155111 for Sepolia testnet)'
    }),
    __metadata("design:type", Number)
], WalletChallengeDto.prototype, "chainId", void 0);
class WalletVerifyDto {
}
exports.WalletVerifyDto = WalletVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c4f2fb',
        description: 'Ethereum wallet address'
    }),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], WalletVerifyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b',
        description: 'Hex signature from wallet'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsHexadecimal)(),
    __metadata("design:type", String)
], WalletVerifyDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Welcome to QA App!\n\nSign this message to authenticate your wallet.\n\nNonce: 1234567890\nTimestamp: 2024-08-24T10:00:00.000Z',
        description: 'Original message that was signed'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletVerifyDto.prototype, "message", void 0);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Valid refresh token'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=auth.dto.js.map