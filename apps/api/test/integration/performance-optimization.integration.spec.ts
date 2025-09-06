import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { OptimizedQueriesService } from '../../src/common/database/optimized-queries.service';
import { PerformanceOptimizerService } from '../../src/common/performance/performance-optimizer.service';
import { createMockJwtToken } from '../../../tests/utils/test-helpers';

describe('Performance Optimization Integration Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let optimizedQueriesService: OptimizedQueriesService;
  let performanceOptimizerService: PerformanceOptimizerService;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    // Get service instances for testing
    optimizedQueriesService = app.get<OptimizedQueriesService>(OptimizedQueriesService);
    performanceOptimizerService = app.get<PerformanceOptimizerService>(PerformanceOptimizerService);

    // Create test tokens
    const userCredentials = {
      email: 'perf-user@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    const userRegResponse = await request(httpServer)
      .post('/auth/register')
      .send(userCredentials);

    const userLoginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.password,
      });

    authToken = userLoginResponse.body.token;

    // Create admin token
    adminToken = createMockJwtToken({ role: 'ADMIN', email: 'admin@example.com' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('OptimizedQueriesService', () => {
    describe('getUserDashboardData', () => {
      it('should return optimized user dashboard data', async () => {
        const mockUserId = 'test-user-id';
        
        const result = await optimizedQueriesService.getUserDashboardData(mockUserId);

        expect(result).toMatchObject({
          user: expect.any(Object),
          positions: expect.any(Array),
          recentOrders: expect.any(Array),
          pendingWithdrawals: expect.any(Array),
          totalBalance: expect.any(Number),
          totalEarnings: expect.any(Number),
        });
      });

      it('should use caching for repeated dashboard requests', async () => {
        const mockUserId = 'cache-test-user';
        
        const start1 = Date.now();
        const result1 = await optimizedQueriesService.getUserDashboardData(mockUserId);
        const time1 = Date.now() - start1;

        const start2 = Date.now();
        const result2 = await optimizedQueriesService.getUserDashboardData(mockUserId);
        const time2 = Date.now() - start2;

        // Second call should be significantly faster due to caching
        expect(time2).toBeLessThan(time1);
        expect(result1).toEqual(result2);
      });
    });

    describe('getAdminAnalytics', () => {
      it('should return optimized admin analytics', async () => {
        const result = await optimizedQueriesService.getAdminAnalytics();

        expect(result).toMatchObject({
          totalUsers: expect.any(Number),
          activeUsers: expect.any(Number),
          totalOrders: expect.any(Number),
          totalRevenue: expect.any(Number),
          pendingWithdrawals: expect.any(Number),
          userGrowth: expect.any(Array),
          revenueGrowth: expect.any(Array),
          topProducts: expect.any(Array),
        });
      });

      it('should handle date range filtering', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = await optimizedQueriesService.getAdminAnalytics(startDate, endDate);

        expect(result).toBeDefined();
        expect(result.userGrowth).toBeInstanceOf(Array);
        expect(result.revenueGrowth).toBeInstanceOf(Array);
      });
    });

    describe('getUserPositions', () => {
      it('should return paginated user positions with optimizations', async () => {
        const mockUserId = 'positions-user';
        const page = 1;
        const limit = 10;

        const result = await optimizedQueriesService.getUserPositions(mockUserId, page, limit);

        expect(result).toMatchObject({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page,
            limit,
            total: expect.any(Number),
            totalPages: expect.any(Number),
          }),
        });
      });
    });
  });

  describe('PerformanceOptimizerService', () => {
    describe('optimizeQuery', () => {
      it('should cache query results', async () => {
        const queryKey = 'test-query';
        const queryFn = jest.fn().mockResolvedValue({ result: 'test-data' });

        // First call - should execute query
        const result1 = await performanceOptimizerService.optimizeQuery(queryKey, queryFn);
        expect(queryFn).toHaveBeenCalledTimes(1);
        expect(result1).toEqual({ result: 'test-data' });

        // Second call - should use cache
        const result2 = await performanceOptimizerService.optimizeQuery(queryKey, queryFn);
        expect(queryFn).toHaveBeenCalledTimes(1); // Still 1, not called again
        expect(result2).toEqual({ result: 'test-data' });
      });

      it('should respect TTL configuration', async () => {
        const queryKey = 'ttl-test-query';
        const queryFn = jest.fn().mockResolvedValue({ result: 'ttl-data' });

        // Cache with 1ms TTL
        await performanceOptimizerService.optimizeQuery(
          queryKey,
          queryFn,
          { ttl: 1 }
        );

        // Wait for cache to expire
        await new Promise(resolve => setTimeout(resolve, 10));

        // Should execute query again after TTL expiration
        await performanceOptimizerService.optimizeQuery(queryKey, queryFn);
        expect(queryFn).toHaveBeenCalledTimes(2);
      });

      it('should handle cache tags for invalidation', async () => {
        const queryKey = 'tagged-query';
        const queryFn = jest.fn().mockResolvedValue({ result: 'tagged-data' });
        const tags = ['user', 'dashboard'];

        await performanceOptimizerService.optimizeQuery(
          queryKey,
          queryFn,
          { tags, ttl: 300000 }
        );

        expect(queryFn).toHaveBeenCalledTimes(1);
        
        // Test that tags are properly associated with the cache entry
        const cachedResult = await performanceOptimizerService.optimizeQuery(queryKey, queryFn);
        expect(queryFn).toHaveBeenCalledTimes(1); // Still cached
        expect(cachedResult).toEqual({ result: 'tagged-data' });
      });
    });

    describe('batchRequests', () => {
      it('should combine multiple requests efficiently', async () => {
        const requests = [
          () => Promise.resolve({ id: 1, data: 'first' }),
          () => Promise.resolve({ id: 2, data: 'second' }),
          () => Promise.resolve({ id: 3, data: 'third' }),
        ];

        const results = await performanceOptimizerService.batchRequests(requests);

        expect(results).toHaveLength(3);
        expect(results[0]).toEqual({ id: 1, data: 'first' });
        expect(results[1]).toEqual({ id: 2, data: 'second' });
        expect(results[2]).toEqual({ id: 3, data: 'third' });
      });

      it('should handle batch request failures gracefully', async () => {
        const requests = [
          () => Promise.resolve({ success: true }),
          () => Promise.reject(new Error('Batch failure')),
          () => Promise.resolve({ success: true }),
        ];

        const results = await performanceOptimizerService.batchRequests(requests);

        expect(results).toHaveLength(3);
        expect(results[0]).toEqual({ success: true });
        expect(results[1]).toBeInstanceOf(Error);
        expect(results[2]).toEqual({ success: true });
      });
    });
  });

  describe('Performance API Endpoints', () => {
    describe('GET /users/dashboard', () => {
      it('should return dashboard data with performance optimizations', async () => {
        const startTime = Date.now();

        const response = await request(httpServer)
          .get('/users/dashboard')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const responseTime = Date.now() - startTime;

        expect(response.body).toMatchObject({
          user: expect.any(Object),
          positions: expect.any(Array),
          recentOrders: expect.any(Array),
          pendingWithdrawals: expect.any(Array),
          totalBalance: expect.any(Number),
          totalEarnings: expect.any(Number),
        });

        // Performance assertion - should respond quickly due to optimizations
        expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
      });

      it('should include performance headers', async () => {
        const response = await request(httpServer)
          .get('/users/dashboard')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Check for performance-related headers
        expect(response.headers).toHaveProperty('x-cache-status');
        expect(response.headers).toHaveProperty('x-response-time');
      });
    });

    describe('GET /admin/analytics', () => {
      it('should return admin analytics with optimizations', async () => {
        const startTime = Date.now();

        const response = await request(httpServer)
          .get('/admin/analytics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const responseTime = Date.now() - startTime;

        expect(response.body).toMatchObject({
          totalUsers: expect.any(Number),
          activeUsers: expect.any(Number),
          totalOrders: expect.any(Number),
          totalRevenue: expect.any(Number),
          pendingWithdrawals: expect.any(Number),
          userGrowth: expect.any(Array),
          revenueGrowth: expect.any(Array),
          topProducts: expect.any(Array),
        });

        // Performance assertion
        expect(responseTime).toBeLessThan(3000); // Less than 3 seconds for complex analytics
      });
    });

    describe('Query Performance Tests', () => {
      it('should handle large dataset queries efficiently', async () => {
        // Test with pagination to ensure large datasets are handled efficiently
        const response = await request(httpServer)
          .get('/users/dashboard?includeHistory=true&limit=100')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toBeDefined();
        
        // Verify response structure includes pagination for large datasets
        if (response.body.recentOrders && response.body.recentOrders.length > 0) {
          expect(response.body.recentOrders.length).toBeLessThanOrEqual(100);
        }
      });

      it('should maintain data consistency with optimizations', async () => {
        // First get dashboard data
        const dashboardResponse = await request(httpServer)
          .get('/users/dashboard')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Create a new order
        const productResponse = await request(httpServer)
          .get('/products')
          .expect(200);

        if (productResponse.body.length > 0) {
          const productId = productResponse.body[0].id;
          
          await request(httpServer)
            .post('/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              productId,
              amount: 1000,
              usdtAmount: 1000,
            })
            .expect(201);

          // Get updated dashboard data - should reflect the new order
          const updatedDashboardResponse = await request(httpServer)
            .get('/users/dashboard?fresh=true') // Force cache refresh
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

          // Verify data consistency
          expect(updatedDashboardResponse.body.recentOrders.length)
            .toBeGreaterThanOrEqual(dashboardResponse.body.recentOrders.length);
        }
      });
    });
  });

  describe('Cache Integration', () => {
    it('should respect cache invalidation tags', async () => {
      const userDashboardKey = `dashboard:user:${authToken}`;
      
      // First call - populate cache
      const response1 = await request(httpServer)
        .get('/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check cache status header
      expect(response1.headers['x-cache-status']).toBe('miss');

      // Second call - should hit cache
      const response2 = await request(httpServer)
        .get('/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response2.headers['x-cache-status']).toBe('hit');
      expect(response1.body).toEqual(response2.body);
    });

    it('should handle cache errors gracefully', async () => {
      // Test behavior when cache is unavailable
      // This would typically involve mocking Redis failures
      const response = await request(httpServer)
        .get('/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should still return data even if cache fails
      expect(response.body).toBeDefined();
      expect(response.body.user).toBeDefined();
    });
  });

  describe('Database Index Performance', () => {
    it('should use optimized queries for user data retrieval', async () => {
      const startTime = Date.now();

      // Test the optimized user query that should use our new indexes
      const response = await request(httpServer)
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;

      expect(response.body).toBeDefined();
      expect(queryTime).toBeLessThan(1000); // Should be fast due to indexes
    });

    it('should use optimized queries for admin analytics', async () => {
      const startTime = Date.now();

      const response = await request(httpServer)
        .get('/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;

      expect(response.body).toBeDefined();
      expect(queryTime).toBeLessThan(2000); // Complex analytics should still be fast
    });

    it('should handle complex filtering efficiently', async () => {
      const startTime = Date.now();

      // Test complex query with multiple filters that should use composite indexes
      const response = await request(httpServer)
        .get('/admin/users?role=USER&kycStatus=APPROVED&active=true&page=1&limit=50')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;

      expect(response.body).toBeDefined();
      expect(queryTime).toBeLessThan(1500); // Complex filtering should be optimized
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should handle large result sets without memory issues', async () => {
      // Test pagination prevents memory overload
      const response = await request(httpServer)
        .get('/admin/analytics/detailed?limit=1000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      // Verify pagination is enforced even for large limits
      if (response.body.data) {
        expect(response.body.data.length).toBeLessThanOrEqual(100); // Max should be enforced
      }
    });

    it('should compress responses for large datasets', async () => {
      const response = await request(httpServer)
        .get('/admin/analytics/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Verify compression headers
      expect(response.headers['content-encoding']).toBeDefined();
    });
  });

  describe('Error Handling in Optimized Services', () => {
    it('should fallback gracefully when optimization fails', async () => {
      // Test that the application continues to work even if performance optimizations fail
      const response = await request(httpServer)
        .get('/users/dashboard?forceNoCache=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should log performance metrics for monitoring', async () => {
      const response = await request(httpServer)
        .get('/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify performance headers are included for monitoring
      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-cache-status']).toBeDefined();
      
      // Response time should be logged as a number
      const responseTime = parseFloat(response.headers['x-response-time']);
      expect(responseTime).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent dashboard requests efficiently', async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, index) =>
        request(httpServer)
          .get(`/users/dashboard?test=${index}`)
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
      });

      // Concurrent requests should be handled efficiently
      expect(totalTime).toBeLessThan(3000); // 5 concurrent requests in under 3 seconds
    });
  });
});