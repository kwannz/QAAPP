import { IsOptional, IsDateString, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class GetMetricsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsEnum(['error', 'warn', 'info', 'debug'])
  level?: 'error' | 'warn' | 'info' | 'debug'

  @IsOptional()
  @IsString()
  module?: string

  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  q?: string

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

export class CreateAlertDto {
  @IsString()
  title!: string

  @IsString()
  message!: string

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity!: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  @IsString()
  module!: string

  @IsOptional()
  metadata?: any
}

export class ResolveAlertDto {
  @IsString()
  resolution!: string
}

export class ExportDataDto {
  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsEnum(['error', 'warn', 'info', 'debug'])
  level?: 'error' | 'warn' | 'info' | 'debug'

  @IsOptional()
  @IsString()
  module?: string

  @IsEnum(['csv', 'json', 'excel'])
  format!: 'csv' | 'json' | 'excel'

  @IsOptional()
  @IsEnum(['all', 'logs'])
  resource?: 'all' | 'logs'

  @IsOptional()
  @IsString()
  q?: string
}
