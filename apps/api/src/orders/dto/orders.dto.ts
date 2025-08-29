import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsEnum, 
  IsUUID, 
  IsArray,
  IsHexadecimal,
  Min, 
  Max, 
  IsInt,
  ValidateNested
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export enum PaymentType {
  USDT = 'USDT',
  ETH = 'ETH',
  FIAT = 'FIAT'
}

export class CreateOrderDto {
  @ApiProperty({ example: 'prod-silver-001' })
  @IsString()
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

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

export class BatchUpdateOrdersDto {
  @ApiProperty({ example: ['order-id-1', 'order-id-2'], description: 'Array of order IDs to update' })
  @IsArray()
  @IsUUID('all', { each: true })
  orderIds: string[];

  @ApiProperty({ enum: ['approve', 'reject'], example: 'approve', description: 'Action to perform' })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ example: 'Bulk approval for Q4 orders', description: 'Reason for batch action' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Additional notes for this batch operation' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderStatsResponseDto {
  @ApiProperty({ description: 'Total number of orders' })
  total: number;

  @ApiProperty({ description: 'Number of pending orders' })
  pending: number;

  @ApiProperty({ description: 'Number of successful orders' })
  success: number;

  @ApiProperty({ description: 'Number of failed orders' })
  failed: number;

  @ApiProperty({ description: 'Number of canceled orders' })
  canceled: number;

  @ApiProperty({ description: 'Total investment volume in USDT' })
  totalVolume: number;

  @ApiProperty({ description: 'Average order value in USDT' })
  averageOrderValue: number;

  @ApiProperty({ description: 'Today orders count' })
  todayOrders: number;

  @ApiProperty({ description: 'This week orders count' })
  weekOrders: number;

  @ApiProperty({ description: 'This month orders count' })
  monthOrders: number;

  @ApiProperty({ description: 'Orders by payment type' })
  paymentTypes: {
    [key in PaymentType]: {
      count: number;
      volume: number;
    };
  };

  @ApiProperty({ description: 'Top products by order count' })
  topProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
    totalVolume: number;
  }>;

  @ApiProperty({ description: 'Daily order trends (last 30 days)' })
  dailyTrends: Array<{
    date: string;
    orderCount: number;
    volume: number;
  }>;
}