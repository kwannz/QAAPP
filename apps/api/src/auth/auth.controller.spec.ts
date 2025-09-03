import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            validateToken: jest.fn(),
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      };

      const mockResponse = {
        access_token: 'mock-token',
        user: mockUser,
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const mockResponse = {
        access_token: 'mock-token',
        user: {
          id: '2',
          email: 'new@example.com',
          name: 'New User',
        },
      };

      authService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const req = { user: { id: '1' } };

      await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith('1');
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshDto = { refreshToken: 'old-token' };
      const mockResponse = { access_token: 'new-token' };

      authService.refreshToken.mockResolvedValue(mockResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('profile', () => {
    it('should return user profile', async () => {
      const req = { user: { id: '1' } };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const req = { user: { id: '1' } };
      const changePasswordDto = {
        oldPassword: 'oldpass',
        newPassword: 'newpass',
      };

      await controller.changePassword(req, changePasswordDto);

      expect(authService.changePassword).toHaveBeenCalledWith(
        '1',
        'oldpass',
        'newpass'
      );
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };
      const mockResponse = {
        message: 'Reset instructions sent',
        resetToken: 'token',
      };

      authService.forgotPassword.mockResolvedValue(mockResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetPasswordDto = {
        token: 'reset-token',
        newPassword: 'newpassword',
      };

      await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        'reset-token',
        'newpassword'
      );
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const validateDto = { token: 'valid-token' };

      authService.validateToken.mockResolvedValue(true);

      const result = await controller.validateToken(validateDto);

      expect(result).toEqual({ valid: true });
    });

    it('should return invalid for bad token', async () => {
      const validateDto = { token: 'invalid-token' };

      authService.validateToken.mockResolvedValue(false);

      const result = await controller.validateToken(validateDto);

      expect(result).toEqual({ valid: false });
    });
  });
});
