import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { WalletSignatureService } from './services/wallet-signature.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto, RegisterDto, WalletChallengeDto, WalletVerifyDto, RefreshTokenDto } from './dto/auth.dto';
import { UserRole, KycStatus } from '@qa-app/database';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: jest.Mocked<DatabaseService>;
  let jwtService: jest.Mocked<JwtService>;
  let walletSignatureService: jest.Mocked<WalletSignatureService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    isActive: true,
    role: UserRole.USER,
    kycStatus: KycStatus.VERIFIED,
    referralCode: 'REF123',
    createdAt: new Date(),
    lastLoginAt: null,
    referredById: null,
    agentId: null,
    wallets: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            wallet: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: WalletSignatureService,
          useValue: {
            generateChallenge: jest.fn(),
            verifySignature: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    walletSignatureService = module.get(WalletSignatureService) as jest.Mocked<WalletSignatureService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    configService.get.mockReturnValue('test-secret');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mockAccessToken');
      configService.get.mockReturnValue('test-secret');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockAccessToken',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expiresAt: expect.any(String),
      });
      expect(databaseService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      databaseService.user.findUnique.mockResolvedValue(inactiveUser);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      referralCode: 'REF456',
      walletAddress: '0x123456789abcdef',
    };

    it('should successfully register a new user with referral code', async () => {
      // Arrange
      databaseService.user.findUnique.mockResolvedValueOnce(null); // No existing user
      const referrerUser = { id: 'referrer1', referralCode: 'REF456', agentId: 'agent1' };
      databaseService.user.findUnique.mockResolvedValueOnce(referrerUser); // Referrer exists
      databaseService.wallet.findFirst.mockResolvedValue(null); // No existing wallet
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      
      const newUser = { ...mockUser, id: 'newuser1', email: registerDto.email };
      databaseService.user.create.mockResolvedValue(newUser);
      jwtService.sign.mockReturnValue('mockToken');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({
        accessToken: 'mockToken',
        refreshToken: 'mockToken',
        user: expect.objectContaining({
          id: newUser.id,
          email: newUser.email,
        }),
        expiresAt: expect.any(String),
      });
      expect(databaseService.wallet.create).toHaveBeenCalledWith({
        data: {
          userId: newUser.id,
          chainId: 1,
          address: registerDto.walletAddress.toLowerCase(),
          isPrimary: true,
          label: 'Primary Wallet',
        },
      });
    });

    it('should throw BadRequestException for existing email', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid referral code', async () => {
      databaseService.user.findUnique
        .mockResolvedValueOnce(null) // No existing user
        .mockResolvedValueOnce(null); // Invalid referrer
      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for existing wallet address', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);
      const existingWallet = { id: 'wallet1', address: registerDto.walletAddress };
      databaseService.wallet.findFirst.mockResolvedValue(existingWallet);
      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      databaseService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
      
      const mockCreatedUser = {
        id: '2',
        email: 'new@example.com',
        name: 'New User',
        isActive: true,
      };
      
      databaseService.user.create.mockResolvedValue(mockCreatedUser);
      jwtService.sign.mockReturnValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'mock-token',
        user: expect.objectContaining({
          email: 'new@example.com',
          name: 'New User',
        }),
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'User',
      };

      databaseService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('logout', () => {
    it('should clear session from cache', async () => {
      await service.logout('user-1');

      expect(cacheService.del).toHaveBeenCalledWith('session:user-1');
    });
  });

  describe('refreshToken', () => {
    it('should return new token for valid refresh token', async () => {
      const mockPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'USER',
      };

      jwtService.verify.mockReturnValue(mockPayload);
      jwtService.sign.mockReturnValue('new-mock-token');

      const result = await service.refreshToken('old-token');

      expect(result).toEqual({
        access_token: 'new-mock-token',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      jwtService.verify.mockReturnValue({
        sub: '1',
        email: 'test@example.com',
      });
      cacheService.get.mockResolvedValue({ userId: '1' });

      const result = await service.validateToken('valid-token');

      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBe(false);
    });

    it('should return false if session not found in cache', async () => {
      jwtService.verify.mockReturnValue({
        sub: '1',
        email: 'test@example.com',
      });
      cacheService.get.mockResolvedValue(null);

      const result = await service.validateToken('valid-token');

      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should update password successfully', async () => {
      const mockUser = {
        id: '1',
        password: '$2b$10$oldhashedpassword',
      };

      databaseService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$newhashedpassword');
      databaseService.user.update.mockResolvedValue({ ...mockUser, password: '$2b$10$newhashedpassword' });

      await service.changePassword('1', 'oldpassword', 'newpassword');

      expect(databaseService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: '$2b$10$newhashedpassword' },
      });
    });

    it('should throw UnauthorizedException for incorrect old password', async () => {
      const mockUser = {
        id: '1',
        password: '$2b$10$oldhashedpassword',
      };

      databaseService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('1', 'wrongpassword', 'newpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      databaseService.user.findUnique.mockResolvedValue(mockUser);
      cacheService.set.mockResolvedValue(undefined);

      const result = await service.forgotPassword('test@example.com');

      expect(result).toHaveProperty('resetToken');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return success even if user not found (security)', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      cacheService.get.mockResolvedValue({ userId: '1' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$newhashedpassword');
      databaseService.user.update.mockResolvedValue({
        id: '1',
        password: '$2b$10$newhashedpassword',
      });

      await service.resetPassword('reset-token', 'newpassword');

      expect(databaseService.user.update).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalledWith('reset:reset-token');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      cacheService.get.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'newpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('999');

      expect(result).toBeNull();
    });
  });
});
