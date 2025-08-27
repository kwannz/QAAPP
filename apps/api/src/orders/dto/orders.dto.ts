import { IsString, IsNumber, IsOptional, IsEnum, Min, IsUUID, IsHexadecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1000, description: 'Investment amount in USDT' })
  @IsNumber()
  @Min(1)
  usdtAmount: number;

  @ApiPropertyOptional({ example: 'REFER123', description: 'Referrer code for commission' })
  @IsOptional()
  @IsString()
  referrerCode?: string;
}

export class ConfirmOrderDto {
  @ApiProperty({ 
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    description: 'Transaction hash from blockchain' 
  })
  @IsString()
  @IsHexadecimal()
  txHash: string;

  @ApiPropertyOptional({ 
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    description: 'Optional signature for additional verification'
  })
  @IsOptional()
  @IsString()
  @IsHexadecimal()
  signature?: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  failureReason?: string;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'product-uuid' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  usdtAmount: number;

  @ApiProperty()
  platformFee: number;

  @ApiProperty()
  txHash?: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  referrerId?: string;

  @ApiProperty()
  agentId?: string;

  @ApiProperty()
  failureReason?: string;

  @ApiProperty()
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  confirmedAt?: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  product?: {
    id: string;
    symbol: string;
    name: string;
    description?: string;
    nftMetadata?: any;
  };

  @ApiProperty()
  user?: {
    id: string;
    email?: string;
    referralCode: string;
  };

  @ApiProperty()
  referrer?: {
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

  @ApiProperty()
  positions?: any[];
}