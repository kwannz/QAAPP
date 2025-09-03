import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { OptimizedQueriesService } from '../src/common/database/optimized-queries.service';
import { PerformanceOptimizerService } from '../src/common/performance/performance-optimizer.service';
import { DatabaseOptimizationModule } from '../src/common/database/database-optimization.module';
import { PerformanceOptimizationModule } from '../src/common/performance/performance-optimization.module';

export interface PerformanceTestContext {
  optimizedQueriesService: OptimizedQueriesService;
  performanceOptimizerService: PerformanceOptimizerService;
  moduleRef: TestingModule;
}

export async function setupPerformanceTestModule(): Promise<PerformanceTestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      DatabaseOptimizationModule,
      PerformanceOptimizationModule,
    ],
    providers: [
      {
        provide: 'DATABASE_CONNECTION',
        useValue: {
          // Mock database connection for testing
          query: jest.fn().mockResolvedValue([]),
          transaction: jest.fn().mockImplementation(async (callback) => {
            return await callback({
              query: jest.fn().mockResolvedValue([]),
            });
          }),
        },
      },
      {
        provide: 'REDIS_CLIENT',
        useValue: {
          get: jest.fn().mockResolvedValue(null),
          set: jest.fn().mockResolvedValue('OK'),
          del: jest.fn().mockResolvedValue(1),
          exists: jest.fn().mockResolvedValue(0),
          expire: jest.fn().mockResolvedValue(1),
          flushall: jest.fn().mockResolvedValue('OK'),
        },
      },
    ],
  }).compile();

  const optimizedQueriesService = moduleRef.get<OptimizedQueriesService>(OptimizedQueriesService);
  const performanceOptimizerService = moduleRef.get<PerformanceOptimizerService>(PerformanceOptimizerService);

  return {
    optimizedQueriesService,
    performanceOptimizerService,
    moduleRef,
  };
}

export function createPerformanceTestData() {
  return {
    users: [
      {
        id: 'user1',
        email: 'user1@example.com',
        role: 'USER',
        kycStatus: 'APPROVED',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date('2024-08-01'),
      },
      {
        id: 'user2',
        email: 'user2@example.com',
        role: 'ADMIN',
        kycStatus: 'APPROVED',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        lastLoginAt: new Date('2024-08-15'),
      },
    ],
    products: [
      {
        id: 'product1',
        name: 'High Yield Bond',
        type: 'BONDS',
        expectedReturn: 8.5,
        minInvestment: 1000,
        maxInvestment: 100000,
        isActive: true,
      },
      {
        id: 'product2',
        name: 'Crypto Staking',
        type: 'CRYPTO_STAKING',
        expectedReturn: 12.0,
        minInvestment: 500,
        maxInvestment: 50000,
        isActive: true,
      },
    ],
    orders: [
      {
        id: 'order1',
        userId: 'user1',
        productId: 'product1',
        amount: 5000,
        usdtAmount: 5000,
        status: 'SUCCESS',
        createdAt: new Date('2024-07-01'),
      },
      {
        id: 'order2',
        userId: 'user1',
        productId: 'product2',
        amount: 2000,
        usdtAmount: 2000,
        status: 'SUCCESS',
        createdAt: new Date('2024-07-15'),
      },
    ],
    positions: [
      {
        id: 'position1',
        userId: 'user1',
        productId: 'product1',
        amount: 5000,
        status: 'ACTIVE',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-07-01'),
        nextPayoutAt: new Date('2024-08-01'),
      },
    ],
    withdrawals: [
      {
        id: 'withdrawal1',
        userId: 'user1',
        amount: 100,
        status: 'PENDING',
        riskLevel: 'LOW',
        requestedAt: new Date('2024-07-20'),
      },
    ],
  };
}

export interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  queryExecutionTime: number;
  memoryUsage: number;
}

export class PerformanceTestMonitor {
  private metrics: PerformanceMetrics[] = [];

  startMeasurement(): () => PerformanceMetrics {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    return (): PerformanceMetrics => {
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      const metrics: PerformanceMetrics = {
        responseTime: endTime - startTime,
        cacheHitRate: 0, // Will be updated by cache monitoring
        queryExecutionTime: 0, // Will be updated by DB monitoring
        memoryUsage: endMemory - startMemory,
      };

      this.metrics.push(metrics);
      return metrics;
    };
  }

  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return { responseTime: 0, cacheHitRate: 0, queryExecutionTime: 0, memoryUsage: 0 };
    }

    return {
      responseTime: this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length,
      cacheHitRate: this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / this.metrics.length,
      queryExecutionTime: this.metrics.reduce((sum, m) => sum + m.queryExecutionTime, 0) / this.metrics.length,
      memoryUsage: this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length,
    };
  }

  reset() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceTestMonitor();

// Performance test utilities
export function expectPerformantResponse(metrics: PerformanceMetrics, thresholds: Partial<PerformanceMetrics> = {}) {
  const defaultThresholds = {
    responseTime: 2000, // 2 seconds
    memoryUsage: 50 * 1024 * 1024, // 50MB
    queryExecutionTime: 1000, // 1 second
    cacheHitRate: 0, // No minimum cache hit rate by default
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  if (finalThresholds.responseTime) {
    expect(metrics.responseTime).toBeLessThan(finalThresholds.responseTime);
  }
  
  if (finalThresholds.memoryUsage) {
    expect(metrics.memoryUsage).toBeLessThan(finalThresholds.memoryUsage);
  }
  
  if (finalThresholds.queryExecutionTime) {
    expect(metrics.queryExecutionTime).toBeLessThan(finalThresholds.queryExecutionTime);
  }
  
  if (finalThresholds.cacheHitRate) {
    expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(finalThresholds.cacheHitRate);
  }
}

// Cache testing utilities
export function createMockCacheResult<T>(data: T, hit: boolean = true) {
  return {
    data,
    hit,
    ttl: hit ? 300 : null,
    timestamp: Date.now(),
  };
}

export function simulateCacheLoad(hitRate: number = 0.8) {
  return Math.random() < hitRate;
}