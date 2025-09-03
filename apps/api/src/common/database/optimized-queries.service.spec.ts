import { Test, TestingModule } from '@nestjs/testing';
import { OptimizedQueriesService } from './optimized-queries.service';
import { DatabaseService } from '../../database/database.service';
import { PerformanceOptimizerService } from '../performance/performance-optimizer.service';

describe('OptimizedQueriesService', () => {
  let service: OptimizedQueriesService;
  let mockDatabaseService: any;
  let mockPerformanceOptimizer: any;

  beforeEach(async () => {
    mockDatabaseService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      position: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      withdrawal: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      commission: {
        aggregate: jest.fn(),
      },
    };

    mockPerformanceOptimizer = {
      optimizeQuery: jest.fn(),
      batchOptimize: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OptimizedQueriesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: PerformanceOptimizerService,
          useValue: mockPerformanceOptimizer,
        },
      ],
    }).compile();

    service = module.get<OptimizedQueriesService>(OptimizedQueriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUsers', () => {
    it('should return paginated user data with optimization', async () => {
      const query = { 
        role: 'USER' as const, 
        isActive: true, 
        page: 1, 
        limit: 10 
      };
      
      const mockUsers = [
        { id: 'user1', email: 'test@example.com', role: 'USER' },
        { id: 'user2', email: 'test2@example.com', role: 'USER' },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockPerformanceOptimizer.optimizeQuery.mockResolvedValue(mockResult);

      const result = await service.findUsers(query);

      expect(result).toEqual(mockResult);
      expect(mockPerformanceOptimizer.optimizeQuery).toHaveBeenCalledWith(
        expect.stringContaining('optimized_users:'),
        expect.any(Function),
        expect.objectContaining({ ttl: 300000 })
      );
    });
  });

  describe('findTransactions', () => {
    it('should return optimized transaction data', async () => {
      const query = { 
        userId: 'test-user',
        type: 'ORDER' as const,
        status: 'SUCCESS',
        limit: 10
      };
      
      const mockTransactions = [
        { id: 'tx1', userId: 'test-user', type: 'ORDER', status: 'SUCCESS' },
        { id: 'tx2', userId: 'test-user', type: 'ORDER', status: 'SUCCESS' },
      ];

      mockPerformanceOptimizer.optimizeQuery.mockResolvedValue(mockTransactions);

      const result = await service.findTransactions(query);

      expect(result).toEqual(mockTransactions);
      expect(mockPerformanceOptimizer.optimizeQuery).toHaveBeenCalledWith(
        expect.stringContaining('optimized_transactions:'),
        expect.any(Function),
        expect.objectContaining({ ttl: 600000 })
      );
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics with time range', async () => {
      const timeRange = { 
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        newUsersToday: 5,
        kycPendingCount: 10,
        verifiedCount: 70,
      };

      mockPerformanceOptimizer.optimizeQuery.mockResolvedValue(mockStats);

      const result = await service.getUserStatistics(timeRange);

      expect(result).toEqual(mockStats);
      expect(mockPerformanceOptimizer.optimizeQuery).toHaveBeenCalledWith(
        expect.stringContaining('user_statistics:'),
        expect.any(Function),
        expect.objectContaining({ ttl: 300000 })
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics for different time ranges', async () => {
      const timeRange = '24h' as const;

      const mockDashboard = {
        userActivity: { activeCount: 50, newToday: 5 },
        transactionVolume: { totalAmount: 100000, count: 200 },
        systemHealth: { uptime: '99.9%', errors: 2 },
      };

      mockPerformanceOptimizer.optimizeQuery.mockResolvedValue(mockDashboard);

      const result = await service.getDashboardStats(timeRange);

      expect(result).toEqual(mockDashboard);
      expect(mockPerformanceOptimizer.optimizeQuery).toHaveBeenCalledWith(
        expect.stringContaining('dashboard_stats:24h'),
        expect.any(Function),
        expect.objectContaining({ ttl: expect.any(Number) })
      );
    });
  });

  describe('getOptimizedAuditLogs', () => {
    it('should return paginated audit logs with filters', async () => {
      const filters = {
        actorId: 'user123',
        action: 'UPDATE_PROFILE',
        resourceType: 'USER',
        page: 1,
        limit: 50
      };

      const mockLogs = [
        { id: 'log1', actorId: 'user123', action: 'UPDATE_PROFILE' },
        { id: 'log2', actorId: 'user123', action: 'UPDATE_PROFILE' },
      ];

      mockPerformanceOptimizer.optimizeQuery.mockResolvedValue({
        data: mockLogs,
        pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
      });

      const result = await service.getOptimizedAuditLogs(filters);

      expect(result).toMatchObject({
        data: mockLogs,
        pagination: expect.objectContaining({
          page: 1,
          limit: 50,
          total: 2,
        }),
      });

      expect(mockPerformanceOptimizer.optimizeQuery).toHaveBeenCalledWith(
        expect.stringContaining('audit_logs:'),
        expect.any(Function),
        expect.objectContaining({ ttl: 300000 })
      );
    });
  });
});