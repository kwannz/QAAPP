import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

// 模拟数据类型
export interface MockUser {
  id: string;
  email?: string;
  passwordHash?: string;
  role: 'USER' | 'ADMIN' | 'AGENT';
  referralCode: string;
  referredById?: string;
  agentId?: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  kycData?: any;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  wallets?: MockWallet[];
}

export interface MockWallet {
  id: string;
  userId: string;
  chainId: number;
  address: string;
  isPrimary: boolean;
  label?: string;
  createdAt: Date;
}

export interface MockProduct {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  minAmount: number;
  maxAmount?: number;
  aprBps: number;
  apr: number; // 计算字段，基于aprBps
  lockDays: number;
  nftTokenId?: number;
  nftMetadata?: any;
  totalSupply?: number;
  currentSupply: number;
  isActive: boolean;
  startsAt: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockOrder {
  id: string;
  userId: string;
  productId: string;
  usdtAmount: number;
  platformFee: number;
  txHash?: string;
  status: OrderStatus;
  referrerId?: string;
  agentId?: string;
  failureReason?: string;
  metadata?: any;
  createdAt: Date;
  confirmedAt?: Date;
  updatedAt: Date;
}

@Injectable()
export class MockDatabaseService {
  private readonly logger = new Logger(MockDatabaseService.name);

  // 内存存储
  private users: Map<string, MockUser> = new Map();
  private wallets: Map<string, MockWallet> = new Map();
  private products: Map<string, MockProduct> = new Map();
  private orders: Map<string, MockOrder> = new Map();

  constructor() {
    this.initializeTestData();
    this.logger.log('🔄 Mock Database Service initialized with test data');
  }

  // 初始化测试数据
  private initializeTestData() {
    // 创建测试产品
    const products: MockProduct[] = [
      {
        id: 'prod-silver-001',
        symbol: 'SILVER',
        name: '银卡产品',
        description: '7天期银卡固定收益产品',
        minAmount: 100,
        maxAmount: 10000,
        aprBps: 800, // 8%
        apr: 8,
        lockDays: 7,
        nftTokenId: 1,
        totalSupply: 1000,
        currentSupply: 0,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-gold-001',
        symbol: 'GOLD',
        name: '金卡产品',
        description: '30天期金卡固定收益产品',
        minAmount: 1000,
        maxAmount: 100000,
        aprBps: 1200, // 12%
        apr: 12,
        lockDays: 30,
        nftTokenId: 2,
        totalSupply: 500,
        currentSupply: 0,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-diamond-001',
        symbol: 'DIAMOND',
        name: '钻石卡产品',
        description: '90天期钻石卡固定收益产品',
        minAmount: 10000,
        maxAmount: 1000000,
        aprBps: 1800, // 18%
        apr: 18,
        lockDays: 90,
        nftTokenId: 3,
        totalSupply: 100,
        currentSupply: 0,
        isActive: true,
        startsAt: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });

    // 创建测试用户
    const testUser: MockUser = {
      id: 'user-test-001',
      email: 'test@qaapp.com',
      role: 'USER',
      referralCode: 'TEST001',
      kycStatus: 'APPROVED',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(testUser.id, testUser);
  }

  // Mock User methods
  async findUser(id: string): Promise<MockUser | null> {
    return this.users.get(id) || null;
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData: Partial<MockUser>): Promise<MockUser> {
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const user: MockUser = {
      id,
      role: 'USER',
      referralCode: 'REF' + id.substr(-6).toUpperCase(),
      kycStatus: 'PENDING',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    };

    this.users.set(id, user);
    this.logger.log(`Created mock user: ${id}`);
    return user;
  }

  // Mock Product methods
  async findProducts(): Promise<MockProduct[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async findProduct(id: string): Promise<MockProduct | null> {
    return this.products.get(id) || null;
  }

  // Mock Order methods
  async createOrder(orderData: Partial<MockOrder>): Promise<MockOrder> {
    const id = 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const order: MockOrder = {
      id,
      userId: '',
      productId: '',
      usdtAmount: 0,
      platformFee: 0,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...orderData,
    };

    this.orders.set(id, order);
    this.logger.log(`Created mock order: ${id}`);
    return order;
  }

  async findOrder(id: string): Promise<MockOrder | null> {
    return this.orders.get(id) || null;
  }

  async updateOrder(id: string, updateData: Partial<MockOrder>): Promise<MockOrder | null> {
    const order = this.orders.get(id);
    if (!order) return null;

    const updatedOrder = { ...order, ...updateData, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async findUserOrders(userId: string): Promise<MockOrder[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  // Health check
  async healthCheck() {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      stats: {
        users: this.users.size,
        products: this.products.size,
        orders: this.orders.size,
        wallets: this.wallets.size,
      }
    };
  }
}