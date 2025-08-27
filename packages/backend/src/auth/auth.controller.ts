import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Ip,
  Headers
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { 
  LoginDto, 
  RegisterDto, 
  Web3LoginDto, 
  Web3RegisterDto, 
  ChangePasswordDto, 
  ForgotPasswordDto,
  RefreshTokenDto
} from './dto/auth.dto';
import { 
  AuthResult, 
  Web3Challenge,
  RefreshResult 
} from './interfaces/auth.interface';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '邮箱密码注册' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 400, description: '输入数据无效' })
  @ApiResponse({ status: 409, description: '邮箱已被注册' })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthResult> {
    return this.authService.register(registerDto, ip, userAgent);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '邮箱密码登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthResult> {
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Get('web3/challenge/:address')
  @ApiOperation({ summary: '获取Web3签名挑战' })
  @ApiParam({ name: 'address', description: '钱包地址', example: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6' })
  @ApiResponse({ 
    status: 200, 
    description: '获取挑战成功',
    schema: {
      example: {
        challenge: '请签名此消息以验证您的身份\\n\\n时间戳: 1640995200000\\n随机数: abc123...',
        expiresAt: '2024-01-01T00:10:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: '钱包地址格式无效' })
  async getWeb3Challenge(@Param('address') address: string): Promise<Web3Challenge> {
    return this.authService.getWeb3Challenge(address);
  }

  @Post('web3/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Web3钱包注册' })
  @ApiBody({ type: Web3RegisterDto })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 400, description: '签名验证失败或挑战过期' })
  @ApiResponse({ status: 409, description: '钱包地址已被注册' })
  async web3Register(
    @Body() web3RegisterDto: Web3RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthResult> {
    return this.authService.web3Register(web3RegisterDto, ip, userAgent);
  }

  @Post('web3/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Web3钱包登录' })
  @ApiBody({ type: Web3LoginDto })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 400, description: '签名验证失败或挑战过期' })
  @ApiResponse({ status: 401, description: '钱包地址未注册' })
  async web3Login(
    @Body() web3LoginDto: Web3LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthResult> {
    return this.authService.web3Login(web3LoginDto, ip, userAgent);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 401, description: '当前密码错误或用户未认证' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '忘记密码' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: '重置邮件已发送' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: '令牌刷新成功',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 604800
      }
    }
  })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResult> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Request() req: any): Promise<{ message: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(req.user.id, token);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('validate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证令牌有效性' })
  @ApiResponse({ status: 200, description: '令牌有效' })
  @ApiResponse({ status: 401, description: '令牌无效' })
  async validateToken(): Promise<{ message: string; valid: boolean }> {
    return { message: '令牌有效', valid: true };
  }
}