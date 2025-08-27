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
exports.RefreshTokenDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.ChangePasswordDto = exports.Web3RegisterDto = exports.Web3LoginDto = exports.RegisterDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '邮箱地址',
        example: 'user@example.com',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '密码',
        example: 'Password123!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '密码至少需要8个字符' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
    email;
    password;
    referralCode;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '邮箱地址',
        example: 'user@example.com',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '密码（至少8位，包含大小写字母、数字和特殊字符）',
        example: 'Password123!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '密码至少需要8个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: '密码必须包含大小写字母、数字和特殊字符' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '推荐码',
        example: 'AGENT001',
        pattern: '^[A-Z0-9]{6,12}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '推荐码必须是字符串' }),
    (0, class_validator_1.Matches)(/^[A-Z0-9]{6,12}$/, { message: '推荐码格式无效' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "referralCode", void 0);
class Web3LoginDto {
    address;
    signature;
}
exports.Web3LoginDto = Web3LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '以太坊钱包地址',
        example: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6'
    }),
    (0, class_validator_1.IsEthereumAddress)({ message: '请输入有效的以太坊地址' }),
    __metadata("design:type", String)
], Web3LoginDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '签名数据',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)({ message: '签名必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '签名不能为空' }),
    __metadata("design:type", String)
], Web3LoginDto.prototype, "signature", void 0);
class Web3RegisterDto {
    address;
    signature;
    referralCode;
}
exports.Web3RegisterDto = Web3RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '以太坊钱包地址',
        example: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6'
    }),
    (0, class_validator_1.IsEthereumAddress)({ message: '请输入有效的以太坊地址' }),
    __metadata("design:type", String)
], Web3RegisterDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '签名数据',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)({ message: '签名必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '签名不能为空' }),
    __metadata("design:type", String)
], Web3RegisterDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '推荐码',
        example: 'AGENT001',
        pattern: '^[A-Z0-9]{6,12}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '推荐码必须是字符串' }),
    (0, class_validator_1.Matches)(/^[A-Z0-9]{6,12}$/, { message: '推荐码格式无效' }),
    __metadata("design:type", String)
], Web3RegisterDto.prototype, "referralCode", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '当前密码',
        example: 'OldPassword123!'
    }),
    (0, class_validator_1.IsString)({ message: '当前密码必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '当前密码不能为空' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新密码（至少8位，包含大小写字母、数字和特殊字符）',
        example: 'NewPassword123!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: '新密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '新密码至少需要8个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: '新密码必须包含大小写字母、数字和特殊字符' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '注册时使用的邮箱地址',
        example: 'user@example.com',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    resetToken;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '重置令牌',
        example: 'abc123def456...'
    }),
    (0, class_validator_1.IsString)({ message: '重置令牌必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '重置令牌不能为空' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "resetToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新密码（至少8位，包含大小写字母、数字和特殊字符）',
        example: 'NewPassword123!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: '新密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '新密码至少需要8个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: '新密码必须包含大小写字母、数字和特殊字符' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '刷新令牌',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_validator_1.IsString)({ message: '刷新令牌必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '刷新令牌不能为空' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
//# sourceMappingURL=auth.dto.js.map