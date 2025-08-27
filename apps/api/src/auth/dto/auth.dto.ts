import { IsEmail, IsString, MinLength, IsOptional, IsEthereumAddress, Matches, IsHexadecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiPropertyOptional({ example: 'REFER123' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c' })
  @IsOptional()
  @IsEthereumAddress()
  walletAddress?: string;
}

export class WalletChallengeDto {
  @ApiProperty({ 
    example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c4f2fb',
    description: 'Ethereum wallet address' 
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({ 
    example: 1,
    description: 'Chain ID (1 for mainnet, 11155111 for Sepolia testnet)' 
  })
  chainId: number;
}

export class WalletVerifyDto {
  @ApiProperty({ 
    example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c4f2fb',
    description: 'Ethereum wallet address' 
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({ 
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b',
    description: 'Hex signature from wallet' 
  })
  @IsString()
  @IsHexadecimal()
  signature: string;

  @ApiProperty({ 
    example: 'Welcome to QA App!\n\nSign this message to authenticate your wallet.\n\nNonce: 1234567890\nTimestamp: 2024-08-24T10:00:00.000Z',
    description: 'Original message that was signed' 
  })
  @IsString()
  message: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Valid refresh token' 
  })
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    email?: string;
    role: string;
    walletAddress?: string;
    kycStatus: string;
  };

  @ApiProperty()
  expiresAt: string;
}