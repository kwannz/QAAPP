import { IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches, IsEthereumAddress } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: '邮箱地址', 
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @ApiProperty({ 
    description: '密码', 
    example: 'Password123!',
    minLength: 8
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ 
    description: '邮箱地址', 
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @ApiProperty({ 
    description: '密码（至少8位，包含大小写字母、数字和特殊字符）', 
    example: 'Password123!',
    minLength: 8
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: '密码必须包含大小写字母、数字和特殊字符' }
  )
  password!: string;

  @ApiPropertyOptional({ 
    description: '推荐码', 
    example: 'AGENT001',
    pattern: '^[A-Z0-9]{6,12}$'
  })
  @IsOptional()
  @IsString({ message: '推荐码必须是字符串' })
  @Matches(/^[A-Z0-9]{6,12}$/, { message: '推荐码格式无效' })
  referralCode?: string;
}

export class Web3LoginDto {
  @ApiProperty({ 
    description: '以太坊钱包地址', 
    example: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6' 
  })
  @IsEthereumAddress({ message: '请输入有效的以太坊地址' })
  address!: string;

  @ApiProperty({ 
    description: '签名数据', 
    example: '0x1234567890abcdef...' 
  })
  @IsString({ message: '签名必须是字符串' })
  @MinLength(1, { message: '签名不能为空' })
  signature!: string;
}

export class Web3RegisterDto {
  @ApiProperty({ 
    description: '以太坊钱包地址', 
    example: '0x742d35Cc6634C0532925a3b8D3Ac98c5bC72c7B6' 
  })
  @IsEthereumAddress({ message: '请输入有效的以太坊地址' })
  address!: string;

  @ApiProperty({ 
    description: '签名数据', 
    example: '0x1234567890abcdef...' 
  })
  @IsString({ message: '签名必须是字符串' })
  @MinLength(1, { message: '签名不能为空' })
  signature!: string;

  @ApiPropertyOptional({ 
    description: '推荐码', 
    example: 'AGENT001',
    pattern: '^[A-Z0-9]{6,12}$'
  })
  @IsOptional()
  @IsString({ message: '推荐码必须是字符串' })
  @Matches(/^[A-Z0-9]{6,12}$/, { message: '推荐码格式无效' })
  referralCode?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ 
    description: '当前密码', 
    example: 'OldPassword123!' 
  })
  @IsString({ message: '当前密码必须是字符串' })
  @MinLength(1, { message: '当前密码不能为空' })
  currentPassword!: string;

  @ApiProperty({ 
    description: '新密码（至少8位，包含大小写字母、数字和特殊字符）', 
    example: 'NewPassword123!',
    minLength: 8
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(8, { message: '新密码至少需要8个字符' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: '新密码必须包含大小写字母、数字和特殊字符' }
  )
  newPassword!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: '注册时使用的邮箱地址', 
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    description: '重置令牌', 
    example: 'abc123def456...' 
  })
  @IsString({ message: '重置令牌必须是字符串' })
  @MinLength(1, { message: '重置令牌不能为空' })
  resetToken!: string;

  @ApiProperty({ 
    description: '新密码（至少8位，包含大小写字母、数字和特殊字符）', 
    example: 'NewPassword123!',
    minLength: 8
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(8, { message: '新密码至少需要8个字符' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: '新密码必须包含大小写字母、数字和特殊字符' }
  )
  newPassword!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    description: '刷新令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  @IsString({ message: '刷新令牌必须是字符串' })
  @MinLength(1, { message: '刷新令牌不能为空' })
  refreshToken!: string;
}