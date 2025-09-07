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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt_1 = require("bcrypt");
const google_auth_library_1 = require("google-auth-library");
const database_service_1 = require("../database/database.service");
const wallet_signature_service_1 = require("./services/wallet-signature.service");
const database_1 = require("@qa-app/database");
let AuthService = AuthService_1 = class AuthService {
    constructor(database, jwtService, configService, walletSignatureService) {
        this.database = database;
        this.jwtService = jwtService;
        this.configService = configService;
        this.walletSignatureService = walletSignatureService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.database.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                wallets: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('Account has no password set');
        }
        const isPasswordValid = await (0, bcrypt_1.compare)(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.database.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.createAuditLog(user.id, 'EMAIL_LOGIN', 'AUTH', null, {
            email: user.email,
            loginMethod: 'email',
        });
        this.logger.log(`User logged in via email: ${user.email}`);
        const userData = this.mapDatabaseUserToUserData(user);
        return this.generateTokenResponse(userData);
    }
    async register(registerDto) {
        const { email, password, referralCode, walletAddress } = registerDto;
        const existingUser = await this.database.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Registration failed. Please check your information.');
        }
        let referrer = null;
        if (referralCode) {
            referrer = await this.database.user.findUnique({
                where: { referralCode },
            });
            if (!referrer) {
                throw new common_1.BadRequestException('Invalid referral code');
            }
        }
        if (walletAddress) {
            const existingWallet = await this.database.wallet.findFirst({
                where: { address: walletAddress.toLowerCase() },
            });
            if (existingWallet) {
                throw new common_1.BadRequestException('Registration failed. Please check your information.');
            }
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 12);
        const userReferralCode = await this.generateUniqueReferralCode();
        const user = await this.database.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash: hashedPassword,
                role: database_1.UserRole.USER,
                referralCode: userReferralCode,
                referredById: referrer?.id,
                agentId: referrer?.agentId || referrer?.id,
                kycStatus: database_1.KycStatus.PENDING,
                isActive: true,
            },
            include: {
                wallets: true,
            },
        });
        if (walletAddress) {
            await this.database.wallet.create({
                data: {
                    userId: user.id,
                    chainId: 1,
                    address: walletAddress.toLowerCase(),
                    isPrimary: true,
                    label: 'Primary Wallet',
                },
            });
        }
        await this.createAuditLog(user.id, 'USER_REGISTER', 'USER', user.id, {
            email: user.email,
            referralCode: userReferralCode,
            referredBy: referrer?.referralCode,
            registrationMethod: walletAddress ? 'email_wallet' : 'email',
        });
        this.logger.log(`New user registered: ${user.email} (${user.referralCode})`);
        const userData = this.mapDatabaseUserToUserData(user);
        return this.generateTokenResponse(userData);
    }
    async generateWalletChallenge(challengeDto) {
        const { address, chainId } = challengeDto;
        const supportedChains = [1, 11155111];
        if (!supportedChains.includes(chainId)) {
            throw new common_1.BadRequestException('Unsupported chain ID');
        }
        const challenge = this.walletSignatureService.generateChallenge(address);
        this.logger.debug(`Generated wallet challenge for ${address} on chain ${chainId}`);
        return {
            message: challenge.message,
            expiresAt: challenge.expiresAt.toISOString(),
        };
    }
    async verifyWalletSignature(verifyDto) {
        const { address, signature, message } = verifyDto;
        const isValid = await this.walletSignatureService.verifySignature(address, signature, message);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid wallet signature');
        }
        let user = await this.database.user.findFirst({
            where: {
                wallets: {
                    some: {
                        address: address.toLowerCase(),
                    },
                },
            },
            include: {
                wallets: true,
            },
        });
        if (!user) {
            const userReferralCode = await this.generateUniqueReferralCode();
            user = await this.database.user.create({
                data: {
                    role: database_1.UserRole.USER,
                    referralCode: userReferralCode,
                    kycStatus: database_1.KycStatus.PENDING,
                    isActive: true,
                    wallets: {
                        create: {
                            chainId: 1,
                            address: address.toLowerCase(),
                            isPrimary: true,
                            label: 'Primary Wallet',
                        },
                    },
                },
                include: {
                    wallets: true,
                },
            });
            this.logger.log(`New user created via wallet: ${address} (${user.referralCode})`);
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        await this.database.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.createAuditLog(user.id, 'WALLET_LOGIN', 'AUTH', null, {
            walletAddress: address,
            loginMethod: 'wallet',
        });
        this.logger.log(`User logged in via wallet: ${address}`);
        const userData = this.mapDatabaseUserToUserData(user);
        return this.generateTokenResponse(userData);
    }
    async refreshToken(refreshDto) {
        try {
            const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
            if (!refreshSecret) {
                throw new common_1.UnauthorizedException('JWT refresh secret not configured');
            }
            const payload = this.jwtService.verify(refreshDto.refreshToken, {
                secret: refreshSecret,
            });
            const user = await this.database.user.findUnique({
                where: { id: payload.sub },
                include: { wallets: true },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const userData = this.mapDatabaseUserToUserData(user);
            return this.generateTokenResponse(userData);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.createAuditLog(userId, 'USER_LOGOUT', 'AUTH', null, {
            logoutTime: new Date().toISOString(),
        });
        this.logger.log(`User logged out: ${userId}`);
        return { message: 'Logged out successfully' };
    }
    async generateTokenResponse(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            walletAddress: user.wallets?.[0]?.address,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
        if (!refreshSecret) {
            throw new Error('JWT refresh secret not configured');
        }
        const refreshToken = this.jwtService.sign({ sub: user.id }, {
            secret: refreshSecret,
            expiresIn: '30d',
        });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                walletAddress: user.wallets?.[0]?.address,
                kycStatus: user.kycStatus,
            },
            expiresAt: expiresAt.toISOString(),
        };
    }
    async generateUniqueReferralCode() {
        let referralCode;
        let isUnique = false;
        do {
            referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await this.database.user.findUnique({
                where: { referralCode },
            });
            isUnique = !existing;
        } while (!isUnique);
        return referralCode;
    }
    async googleLogin(googleToken) {
        if (!googleToken || googleToken.length < 10) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        let googleUser;
        try {
            const client = new google_auth_library_1.OAuth2Client();
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email_verified) {
                throw new common_1.UnauthorizedException('Google token verification failed');
            }
            googleUser = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                email_verified: payload.email_verified,
            };
        }
        catch (error) {
            this.logger.error('Google token verification failed:', error);
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        let user = await this.database.user.findUnique({
            where: { email: googleUser.email.toLowerCase() },
            include: { wallets: true },
        });
        if (!user) {
            const userReferralCode = await this.generateUniqueReferralCode();
            user = await this.database.user.create({
                data: {
                    email: googleUser.email.toLowerCase(),
                    role: database_1.UserRole.USER,
                    referralCode: userReferralCode,
                    kycStatus: database_1.KycStatus.PENDING,
                    isActive: true,
                },
                include: { wallets: true },
            });
            this.logger.log(`New user created via Google: ${googleUser.email} (${user.referralCode})`);
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        await this.database.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.createAuditLog(user.id, 'GOOGLE_LOGIN', 'AUTH', null, {
            email: googleUser.email,
            loginMethod: 'google',
        });
        this.logger.log(`User logged in via Google: ${googleUser.email}`);
        const userData = this.mapDatabaseUserToUserData(user);
        return this.generateTokenResponse(userData);
    }
    async getUserById(userId) {
        const user = await this.database.user.findUnique({
            where: { id: userId },
            include: {
                wallets: true,
            },
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            referralCode: user.referralCode,
            isActive: user.isActive,
            wallets: user.wallets,
        };
    }
    async createAuditLog(actorId, action, resourceType, resourceId, metadata) {
        try {
            await this.database.auditLog.create({
                data: {
                    actorId,
                    actorType: 'USER',
                    action,
                    resourceType,
                    resourceId,
                    metadata: metadata,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }
    mapDatabaseUserToUserData(user) {
        return {
            id: user.id,
            email: user.email ?? undefined,
            role: user.role,
            kycStatus: user.kycStatus,
            referralCode: user.referralCode,
            isActive: user.isActive,
            wallets: user.wallets || [],
            agentId: user.agentId ?? undefined,
            referredById: user.referredById ?? undefined,
            lastLoginAt: user.lastLoginAt ?? undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        config_1.ConfigService,
        wallet_signature_service_1.WalletSignatureService])
], AuthService);
//# sourceMappingURL=auth.service.js.map