import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthenticatedRequest } from '../common/types/express.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { 
  LoginDto, 
  RegisterDto, 
  WalletChallengeDto, 
  WalletVerifyDto, 
  RefreshTokenDto,
  AuthResponseDto 
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  @Throttle({ auth: { ttl: 60000, limit: 5 } }) // 5次登录尝试/分钟
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Register new user account' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Email already registered or invalid data' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  @Throttle({ auth: { ttl: 60000, limit: 3 } }) // 3次注册尝试/分钟
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Generate wallet signature challenge' })
  @ApiResponse({ 
    status: 200, 
    description: 'Challenge generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message to be signed by wallet' },
        expiresAt: { type: 'string', format: 'date-time', description: 'Challenge expiration time' }
      }
    }
  })
  @ApiResponse({ status: 429, description: 'Too many challenge requests' })
  @Throttle({ sensitive: { ttl: 60000, limit: 10 } }) // 10次挑战请求/分钟
  @Post('wallet/challenge')
  async generateWalletChallenge(@Body() challengeDto: WalletChallengeDto) {
    return this.authService.generateWalletChallenge(challengeDto);
  }

  @ApiOperation({ summary: 'Verify wallet signature and login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet signature verified successfully',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  @ApiResponse({ status: 429, description: 'Too many verification attempts' })
  @Throttle({ auth: { ttl: 60000, limit: 5 } }) // 5次验证尝试/分钟
  @HttpCode(HttpStatus.OK)
  @Post('wallet/verify')
  async verifyWalletSignature(@Body() verifyDto: WalletVerifyDto): Promise<AuthResponseDto> {
    return this.authService.verifyWalletSignature(verifyDto);
  }

  @ApiOperation({ summary: 'Login with Google account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Google login successful',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  @ApiResponse({ status: 429, description: 'Too many Google login attempts' })
  @Throttle({ auth: { ttl: 60000, limit: 5 } }) // 5次Google登录尝试/分钟
  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleLogin(@Body() body: { token: string }): Promise<AuthResponseDto> {
    return this.authService.googleLogin(body.token);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshDto);
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.id);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
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
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @ApiOperation({ summary: 'Health check for authentication service' })
  @ApiResponse({ status: 200, description: 'Authentication service is healthy' })
  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'auth',
      timestamp: new Date().toISOString(),
      activeChallenges: await this.getActiveChallengeCount(),
    };
  }

  private async getActiveChallengeCount(): Promise<number> {
    // 这是一个简化实现，实际应该从WalletSignatureService获取
    return 0;
  }
}