import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MockDatabaseService, MockProduct } from '../database/mock-database.service';

@Injectable()
export class MockProductsService {
  private readonly logger = new Logger(MockProductsService.name);

  constructor(private mockDatabase: MockDatabaseService) {}

  async findAll(): Promise<MockProduct[]> {
    const products = await this.mockDatabase.findProducts();
    this.logger.log(`Found ${products.length} active products`);
    return products;
  }

  async findOne(id: string): Promise<MockProduct> {
    const product = await this.mockDatabase.findProduct(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async checkAvailability(productId: string, amount: number): Promise<{
    available: boolean;
    reason?: string;
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

    return { available: true };
  }

  // Mock implementation for required methods
  async create(createProductDto: any, adminId: string): Promise<MockProduct> {
    this.logger.log(`Mock create product by admin: ${adminId}`);
    // This is a mock implementation
    throw new Error('Create product not implemented in mock service');
  }

  async update(id: string, updateProductDto: any, adminId: string): Promise<MockProduct> {
    this.logger.log(`Mock update product ${id} by admin: ${adminId}`);
    // This is a mock implementation
    throw new Error('Update product not implemented in mock service');
  }

  async remove(id: string, adminId: string): Promise<void> {
    this.logger.log(`Mock remove product ${id} by admin: ${adminId}`);
    // This is a mock implementation
    throw new Error('Remove product not implemented in mock service');
  }
}