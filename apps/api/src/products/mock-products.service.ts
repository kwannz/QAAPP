import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MockDatabaseService, MockProduct } from '../database/mock-database.service';
import { ProductResponseDto } from './dto/products.dto';

@Injectable()
export class MockProductsService {
  private readonly logger = new Logger(MockProductsService.name);

  constructor(private mockDatabase: MockDatabaseService) {}

  async findAll(queryDto?: any): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const products = await this.mockDatabase.findProducts();
    this.logger.log(`Found ${products.length} active products`);
    
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 20;
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    // 为每个产品添加统计信息，转换为 ProductResponseDto 格式
    const productsWithStats: ProductResponseDto[] = products.slice(start, end).map(product => ({
      id: product.id,
      symbol: product.symbol,
      name: product.name,
      description: product.description,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      apr: product.apr,
      lockDays: product.lockDays,
      nftTokenId: product.nftTokenId,
      nftMetadata: product.nftMetadata,
      totalSupply: product.totalSupply,
      currentSupply: product.currentSupply,
      availableSupply: product.totalSupply ? product.totalSupply - product.currentSupply : null,
      isActive: product.isActive,
      startsAt: product.startsAt,
      endsAt: product.endsAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      stats: {
        totalSales: product.currentSupply * product.minAmount,
        totalInvestments: product.currentSupply,
        soldCount: product.currentSupply,
        activePositions: product.currentSupply
      }
    }));
    
    return {
      products: productsWithStats,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.mockDatabase.findProduct(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return {
      id: product.id,
      symbol: product.symbol,
      name: product.name,
      description: product.description,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      apr: product.apr,
      lockDays: product.lockDays,
      nftTokenId: product.nftTokenId,
      nftMetadata: product.nftMetadata,
      totalSupply: product.totalSupply,
      currentSupply: product.currentSupply,
      availableSupply: product.totalSupply ? product.totalSupply - product.currentSupply : null,
      isActive: product.isActive,
      startsAt: product.startsAt,
      endsAt: product.endsAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      stats: {
        totalSales: product.currentSupply * product.minAmount,
        totalInvestments: product.currentSupply,
        soldCount: product.currentSupply,
        activePositions: product.currentSupply
      }
    };
  }

  async checkAvailability(productId: string, amount: number): Promise<{
    available: boolean;
    reason?: string;
    maxAmount?: number;
    remainingCapacity?: number;
  }> {
    const product = await this.mockDatabase.findProduct(productId);
    
    if (!product) {
      return { available: false, reason: 'Product not found' };
    }

    if (!product.isActive) {
      return { available: false, reason: 'Product is not active' };
    }

    if (amount < product.minAmount) {
      return { available: false, reason: `Minimum amount is ${product.minAmount}` };
    }

    if (product.maxAmount && amount > product.maxAmount) {
      return { available: false, reason: `Maximum amount is ${product.maxAmount}` };
    }

    if (product.totalSupply && product.currentSupply >= product.totalSupply) {
      return { available: false, reason: 'Product is sold out' };
    }

    const remainingCapacity = product.totalSupply ? product.totalSupply - product.currentSupply : Infinity;
    
    return { 
      available: true, 
      maxAmount: product.maxAmount,
      remainingCapacity 
    };
  }

  // Mock implementation for required methods
  async create(createProductDto: any, adminId: string): Promise<MockProduct & { stats: any }> {
    this.logger.log(`Mock create product by admin: ${adminId}`);
    
    const newProduct: MockProduct = {
      id: `prod_${Date.now()}`,
      symbol: createProductDto.symbol,
      name: createProductDto.name,
      description: createProductDto.description,
      minAmount: createProductDto.minAmount,
      maxAmount: createProductDto.maxAmount,
      apr: createProductDto.apr,
      aprBps: createProductDto.apr * 100, // Convert APR to basis points
      lockDays: createProductDto.lockDays,
      nftTokenId: createProductDto.nftTokenId,
      nftMetadata: createProductDto.nftMetadata,
      totalSupply: createProductDto.totalSupply,
      currentSupply: 0,
      isActive: createProductDto.isActive ?? true,
      startsAt: new Date(createProductDto.startsAt || new Date()),
      endsAt: createProductDto.endsAt ? new Date(createProductDto.endsAt) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return {
      ...newProduct,
      stats: {
        totalSales: 0,
        totalInvestments: 0,
        soldCount: 0,
        activePositions: 0
      }
    };
  }

  async update(id: string, updateProductDto: any, adminId: string): Promise<MockProduct & { stats: any }> {
    this.logger.log(`Mock update product ${id} by admin: ${adminId}`);
    const product = await this.findOne(id);
    
    return {
      ...product,
      ...updateProductDto,
      id,
      updatedAt: new Date(),
      stats: product.stats
    };
  }

  async remove(id: string, adminId: string): Promise<{ message: string; productId: string }> {
    this.logger.log(`Mock remove product ${id} by admin: ${adminId}`);
    const product = await this.findOne(id);
    
    return {
      message: `Product ${product.name} has been deleted successfully`,
      productId: id
    };
  }
  
  async getStatistics(id: string) {
    const product = await this.findOne(id);
    return {
      totalInvestments: product.stats.totalSales,
      totalInvestors: product.stats.soldCount,
      averageInvestment: product.stats.soldCount > 0 ? product.stats.totalSales / product.stats.soldCount : 0,
      currentYield: product.apr / 100,
      performanceHistory: [
        { date: '2024-01-01', yield: product.apr / 100 },
        { date: '2024-02-01', yield: product.apr / 100 * 1.05 },
        { date: '2024-03-01', yield: product.apr / 100 * 0.95 }
      ]
    };
  }
}