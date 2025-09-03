import { IsOptional, IsDateString, IsEnum, IsString, IsNumber, Min, Max, IsArray } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class GetTransactionsDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsEnum(['PAYOUT', 'WITHDRAWAL', 'ALL'])
  type?: 'PAYOUT' | 'WITHDRAWAL' | 'ALL'

  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number
}

export class UpdateTransactionStatusDto {
  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  @IsOptional()
  metadata?: any
}

export class ProcessTransactionDto {
  @IsEnum(['APPROVE', 'REJECT', 'PROCESS'])
  action: 'APPROVE' | 'REJECT' | 'PROCESS'

  @IsOptional()
  @IsString()
  reason?: string
}

export class ExportTransactionsDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsEnum(['PAYOUT', 'WITHDRAWAL', 'ALL'])
  type?: 'PAYOUT' | 'WITHDRAWAL' | 'ALL'

  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsEnum(['csv', 'excel', 'json'])
  format: 'csv' | 'excel' | 'json'
}

export class BulkUpdateTransactionsDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[]

  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  @IsOptional()
  metadata?: any
}