import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max, IsInt, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'QASILVER' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'QA白银卡' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '30天期固定收益产品，年化收益率12%' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 100, description: 'Minimum investment amount in USDT' })
  @IsNumber()
  @Min(1)
  minAmount: number;

  @ApiPropertyOptional({ example: 10000, description: 'Maximum investment amount in USDT' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAmount?: number;

  @ApiProperty({ example: 12, description: 'Annual percentage rate (APR) as percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  apr: number;

  @ApiProperty({ example: 30, description: 'Lock period in days' })
  @IsInt()
  @Min(1)
  lockDays: number;

  @ApiPropertyOptional({ example: 1, description: 'NFT Token ID for this product' })
  @IsOptional()
  @IsInt()
  @Min(0)
  nftTokenId?: number;

  @ApiPropertyOptional({ 
    example: {
      name: 'QA白银卡',
      image: 'https://assets.qa-app.com/nft/silver.png',
      attributes: [
        { trait_type: 'Type', value: 'Silver' },
        { trait_type: 'Lock Period', value: '30 days' },
        { trait_type: 'APR', value: '12%' }
      ]
    },
    description: 'NFT metadata object'
  })
  @IsOptional()
  @IsObject()
  nftMetadata?: any;

  @ApiPropertyOptional({ example: 10000, description: 'Total supply limit' })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalSupply?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-08-24T00:00:00Z', description: 'Sale start time' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z', description: 'Sale end time' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
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

  @ApiPropertyOptional({ example: 'QASILVER' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Include inactive products' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeInactive?: boolean = false;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  minAmount: number;

  @ApiProperty()
  maxAmount?: number;

  @ApiProperty()
  apr: number;

  @ApiProperty()
  lockDays: number;

  @ApiProperty()
  nftTokenId?: number;

  @ApiProperty()
  nftMetadata?: any;

  @ApiProperty()
  totalSupply?: number;

  @ApiProperty()
  currentSupply: number;

  @ApiProperty()
  availableSupply?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  stats: {
    totalSales: number;
    totalInvestments: number;
    soldCount: number;
    activePositions: number;
  };
}

export class ProductAvailabilityDto {
  @ApiProperty({ example: 'product-id' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 1000, description: 'Investment amount to check' })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class ProductAvailabilityResponseDto {
  @ApiProperty()
  available: boolean;

  @ApiProperty()
  reason?: string;
}