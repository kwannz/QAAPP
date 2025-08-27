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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const eth_sig_util_1 = require("eth-sig-util");
const ethereumjs_util_1 = require("ethereumjs-util");
const users_service_1 = require("../users/users.service");
const database_1 = require("@qa-app/database");
const database_2 = require("@qa-app/database");
const audit_service_1 = require("../audit/audit.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    auditService;
    web3Challenges = new Map();
    constructor(usersService, jwtService, configService, auditService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditService = auditService;
        setInterval(() => {
            this.cleanExpiredChallenges();
        }, 30 * 60 * 1000);
    }
    async register(registerDto, ipAddress, userAgent) {
        const { email, password, referralCode } = registerDto;
        if (!(0, database_1.validateEmail)(email)) {
            throw new common_1.BadRequestException('邮箱格式无效');
        }
        if (!(0, database_1.validatePassword)(password)) {
            throw new common_1.BadRequestException('密码必须至少8位，包含大小写字母、数字和特殊字符');
        }
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('邮箱已被注册');
        }
        let referrer = null;
        let agent = null;
        if (referralCode) {
            referrer = await this.usersService.findByReferralCode(referralCode);
            if (!referrer) {
                throw new common_1.BadRequestException('推荐码无效');
            }
            if (referrer.role === database_2.UserRole.AGENT) {
                agent = referrer;
            }
            else {
                agent = referrer.agent ? referrer.agent : null;
            }
        }
        const newReferralCode = await this.generateUniqueReferralCode();
        const passwordHash = await (0, bcryptjs_1.hash)(password, 12);
        const user = await this.usersService.create({
            email,
            passwordHash,
            role: database_2.UserRole.USER,
            referralCode: newReferralCode,
            referredBy: referrer ? { connect: { id: referrer.id } } : undefined,
            agent: agent ? { connect: { id: agent.id } } : undefined,
            kycStatus: database_2.KycStatus.PENDING,
            isActive: true,
        });
        await this.auditService.log({
            actorId: user.id,
            actorType: 'USER',
            action: 'USER_REGISTER',
            resourceType: 'USER',
            resourceId: user.id,
            ipAddress,
            userAgent,
            metadata: {
                email,
                registrationMethod: 'email',
                referrerCode: referralCode,
            },
        });
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async login(loginDto, ipAddress, userAgent) {
        const { email, password } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('账户已被禁用');
        }
        await this.usersService.updateLastLogin(user.id);
        await this.auditService.log({
            actorId: user.id,
            actorType: 'USER',
            action: 'USER_LOGIN',
            resourceType: 'USER',
            resourceId: user.id,
            ipAddress,
            userAgent,
            metadata: {
                email,
                loginMethod: 'email',
            },
        });
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async getWeb3Challenge(address) {
        if (!(0, database_1.validateWalletAddress)(address)) {
            throw new common_1.BadRequestException('钱包地址格式无效');
        }
        const challenge = this.generateChallenge();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.web3Challenges.set(address.toLowerCase(), {
            challenge,
            expiresAt,
        });
        return { challenge, expiresAt };
    }
    async web3Register(web3RegisterDto, ipAddress, userAgent) {
        const { address, signature, referralCode } = web3RegisterDto;
        const challenge = this.web3Challenges.get(address.toLowerCase());
        if (!challenge) {
            throw new common_1.BadRequestException('请先获取签名挑战');
        }
        if (new Date() > challenge.expiresAt) {
            this.web3Challenges.delete(address.toLowerCase());
            throw new common_1.BadRequestException('签名挑战已过期，请重新获取');
        }
        const isSignatureValid = this.verifyWeb3Signature(address, challenge.challenge, signature);
        if (!isSignatureValid) {
            throw new common_1.UnauthorizedException('签名验证失败');
        }
        this.web3Challenges.delete(address.toLowerCase());
        const existingWallet = await this.usersService.findByWalletAddress(address);
        if (existingWallet) {
            throw new common_1.ConflictException('该钱包地址已被注册');
        }
        let referrer = null;
        let agent = null;
        if (referralCode) {
            referrer = await this.usersService.findByReferralCode(referralCode);
            if (!referrer) {
                throw new common_1.BadRequestException('推荐码无效');
            }
            if (referrer.role === database_2.UserRole.AGENT) {
                agent = referrer;
            }
            else {
                agent = referrer.agent ? referrer.agent : null;
            }
        }
        const newReferralCode = await this.generateUniqueReferralCode();
        const user = await database_1.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    role: database_2.UserRole.USER,
                    referralCode: newReferralCode,
                    referredBy: referrer ? { connect: { id: referrer.id } } : undefined,
                    agent: agent ? { connect: { id: agent.id } } : undefined,
                    kycStatus: database_2.KycStatus.PENDING,
                    isActive: true,
                },
            });
            await tx.wallet.create({
                data: {
                    userId: newUser.id,
                    chainId: 1,
                    address: address.toLowerCase(),
                    isPrimary: true,
                    label: '主钱包',
                },
            });
            return newUser;
        });
        await this.auditService.log({
            actorId: user.id,
            actorType: 'USER',
            action: 'USER_REGISTER',
            resourceType: 'USER',
            resourceId: user.id,
            ipAddress,
            userAgent,
            metadata: {
                address,
                registrationMethod: 'web3',
                referrerCode: referralCode,
            },
        });
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async web3Login(web3LoginDto, ipAddress, userAgent) {
        const { address, signature } = web3LoginDto;
        const challenge = this.web3Challenges.get(address.toLowerCase());
        if (!challenge) {
            throw new common_1.BadRequestException('请先获取签名挑战');
        }
        if (new Date() > challenge.expiresAt) {
            this.web3Challenges.delete(address.toLowerCase());
            throw new common_1.BadRequestException('签名挑战已过期，请重新获取');
        }
        const isSignatureValid = this.verifyWeb3Signature(address, challenge.challenge, signature);
        if (!isSignatureValid) {
            throw new common_1.UnauthorizedException('签名验证失败');
        }
        this.web3Challenges.delete(address.toLowerCase());
        const user = await this.usersService.findByWalletAddress(address);
        if (!user) {
            throw new common_1.UnauthorizedException('该钱包地址未注册');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('账户已被禁用');
        }
        await this.usersService.updateLastLogin(user.id);
        await this.auditService.log({
            actorId: user.id,
            actorType: 'USER',
            action: 'USER_LOGIN',
            resourceType: 'USER',
            resourceId: user.id,
            ipAddress,
            userAgent,
            metadata: {
                address,
                loginMethod: 'web3',
            },
        });
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.usersService.findById(userId);
        if (!user || !user.passwordHash) {
            throw new common_1.BadRequestException('用户不存在或未设置密码');
        }
        const isCurrentPasswordValid = await (0, bcryptjs_1.compare)(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('当前密码错误');
        }
        if (!(0, database_1.validatePassword)(newPassword)) {
            throw new common_1.BadRequestException('新密码必须至少8位，包含大小写字母、数字和特殊字符');
        }
        const newPasswordHash = await (0, bcryptjs_1.hash)(newPassword, 12);
        await this.usersService.updatePassword(userId, newPasswordHash);
        await this.auditService.log({
            actorId: userId,
            actorType: 'USER',
            action: 'PASSWORD_CHANGE',
            resourceType: 'USER',
            resourceId: userId,
        });
        return { message: '密码修改成功' };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: '如果该邮箱已注册，您将收到密码重置邮件' };
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(`Password reset token for ${email}: ${resetToken}`);
        return { message: '如果该邮箱已注册，您将收到密码重置邮件' };
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findById(payload.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('令牌无效');
            }
            return user;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('令牌无效');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.usersService.findById(payload.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('刷新令牌无效');
            }
            const accessToken = await this.generateAccessToken(user);
            const expiresIn = this.getTokenExpiresIn();
            return { accessToken, expiresIn };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('刷新令牌无效');
        }
    }
    async logout(userId, token) {
        await this.auditService.log({
            actorId: userId,
            actorType: 'USER',
            action: 'USER_LOGOUT',
            resourceType: 'USER',
            resourceId: userId,
        });
        return { message: '登出成功' };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            expiresIn: this.getTokenExpiresIn(),
        };
    }
    async generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
        };
        return this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
        });
    }
    getTokenExpiresIn() {
        const expiresIn = this.configService.get('JWT_EXPIRES_IN', '7d');
        if (expiresIn.endsWith('d')) {
            return parseInt(expiresIn) * 24 * 60 * 60;
        }
        else if (expiresIn.endsWith('h')) {
            return parseInt(expiresIn) * 60 * 60;
        }
        else if (expiresIn.endsWith('m')) {
            return parseInt(expiresIn) * 60;
        }
        return parseInt(expiresIn);
    }
    generateChallenge() {
        const timestamp = Date.now();
        const random = (0, crypto_1.randomBytes)(16).toString('hex');
        return `请签名此消息以验证您的身份\n\n时间戳: ${timestamp}\n随机数: ${random}\n\n此操作不会产生任何费用。`;
    }
    verifyWeb3Signature(address, message, signature) {
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
    async generateUniqueReferralCode() {
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase() +
                Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const existingUser = await this.usersService.findByReferralCode(code);
            if (!existingUser) {
                isUnique = true;
            }
        }
        return code;
    }
    cleanExpiredChallenges() {
        const now = new Date();
        for (const [address, challenge] of this.web3Challenges.entries()) {
            if (now > challenge.expiresAt) {
                this.web3Challenges.delete(address);
            }
        }
    }
    sanitizeUser(user) {
        const { passwordHash, ...sanitizedUser } = user;
        return sanitizedUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map