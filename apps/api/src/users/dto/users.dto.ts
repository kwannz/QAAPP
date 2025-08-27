import { IsEmail, IsString, IsOptional, IsEthereumAddress, IsEnum, IsUUID, MinLength, Matches, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserRole, KycStatus } from '@prisma/client';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @ApiPropertyOptional({ example: 'StrongPassword123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;
}

export class AddWalletDto {
  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b8D25c5B6DDD5c4f2fb' })
  @IsEthereumAddress()
  @Transform(({ value }) => value?.toLowerCase())
  address: string;

  @ApiProperty({ example: 1, description: 'Chain ID (1 for mainnet, 11155111 for Sepolia)' })
  @IsInt()
  @Min(1)
  chainId: number;

  @ApiPropertyOptional({ example: 'My Trading Wallet' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateKycStatusDto {
  @ApiProperty({ enum: KycStatus })
  @IsEnum(KycStatus)
  kycStatus: KycStatus;

  @ApiPropertyOptional({ 
    example: { reason: 'Documents verified successfully' },
    description: 'Additional KYC data and notes'
  })
  @IsOptional()
  kycData?: any;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UserQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: KycStatus })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @ApiPropertyOptional({ example: 'REFER123' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}

export class UserStatsDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  referralCode: string;

  @ApiProperty({ enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastLoginAt?: Date;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        address: { type: 'string' },
        chainId: { type: 'number' },
        isPrimary: { type: 'boolean' },
        label: { type: 'string' }
      }
    }
  })
  wallets: any[];

  @ApiProperty()
  referredBy?: {
    id: string;
    referralCode: string;
    email?: string;
  };

  @ApiProperty()
  agent?: {
    id: string;
    referralCode: string;
    email?: string;
  };
}

export class UserStatsResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  newUsersToday: number;

  @ApiProperty()
  newUsersThisWeek: number;

  @ApiProperty()
  newUsersThisMonth: number;

  @ApiProperty({
    type: 'object',
    properties: {
      USER: { type: 'number' },
      AGENT: { type: 'number' },
      ADMIN: { type: 'number' }
    }
  })
  usersByRole: Record<string, number>;

  @ApiProperty({
    type: 'object',
    properties: {
      PENDING: { type: 'number' },
      APPROVED: { type: 'number' },
      REJECTED: { type: 'number' },
      EXPIRED: { type: 'number' }
    }
  })
  usersByKycStatus: Record<string, number>;
}