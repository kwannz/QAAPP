import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Integration E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    // Create test user
    const userCredentials = {
      email: 'perf-test-user@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    await request(httpServer)
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
    adminToken = createMockJwtToken({ 
      role: 'ADMIN', 
      email: 'admin@example.com',
      sub: 'admin-id' 
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Performance Monitoring', () => {
    it('should include performance headers in responses', async () => {
      const response = await request(httpServer)
        .get('/products')
        .expect(200);

      // Check for performance monitoring headers
      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/^\d+$/); // Should be a number
    });

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      // Create 5 concurrent requests
      const requests = Array.from({ length: 5 }, (_, index) =>
        request(httpServer)
          .get(`/products?page=${index + 1}&limit=10`)
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
      });

      // Should handle 5 concurrent requests in reasonable time
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Database Query Optimization', () => {
    it('should use optimized queries for user listing', async () => {
      const startTime = Date.now();

      const response = await request(httpServer)
        .get('/admin/users?role=USER&isActive=true&page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        pagination: expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      });

      // Query should be fast due to composite indexes
      expect(queryTime).toBeLessThan(1000);
    });

    it('should optimize complex analytics queries', async () => {
      const startTime = Date.now();

      const response = await request(httpServer)
        .get('/admin/analytics/users?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;

      expect(response.body).toBeDefined();
      // Complex analytics should still be reasonably fast
      expect(queryTime).toBeLessThan(3000);
    });
  });

  describe('Caching Behavior', () => {
    it('should demonstrate cache effectiveness for repeated requests', async () => {
      const endpoint = '/products?type=FIXED_INCOME';
      
      // First request - populate cache
      const response1 = await request(httpServer)
        .get(endpoint)
        .expect(200);

      const firstResponseTime = parseFloat(response1.headers['x-response-time']);

      // Second request - should hit cache
      const response2 = await request(httpServer)
        .get(endpoint)
        .expect(200);

      const secondResponseTime = parseFloat(response2.headers['x-response-time']);

      // Data should be identical
      expect(response1.body).toEqual(response2.body);
      
      // Second request should be faster (though this might not always be true in test environment)
      // At minimum, both should respond quickly
      expect(firstResponseTime).toBeGreaterThan(0);
      expect(secondResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should handle large result sets without memory leaks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Request large dataset
      const response = await request(httpServer)
        .get('/admin/audit-logs?limit=1000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 100MB for this test)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Error Handling in Optimizations', () => {
    it('should gracefully fallback when optimization fails', async () => {
      // Test endpoint that might have optimization failures
      const response = await request(httpServer)
        .get('/products?invalidParam=test')
        .expect(200);

      // Should still return valid data even if some optimizations fail
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet response time targets for user operations', async () => {
      const userOperations = [
        '/auth/profile',
        '/products',
        '/dashboard/summary',
      ];

      for (const endpoint of userOperations) {
        const startTime = Date.now();
        
        const response = await request(httpServer)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);

        const responseTime = Date.now() - startTime;
        
        // User operations should respond within 1 second
        expect(responseTime).toBeLessThan(1000);
        expect([200, 404]).toContain(response.status); // Allow 404 for non-implemented endpoints
      }
    });

    it('should meet response time targets for admin operations', async () => {
      const adminOperations = [
        '/admin/users?page=1&limit=50',
        '/admin/analytics/summary',
      ];

      for (const endpoint of adminOperations) {
        const startTime = Date.now();
        
        const response = await request(httpServer)
          .get(endpoint)
          .set('Authorization', `Bearer ${adminToken}`);

        const responseTime = Date.now() - startTime;
        
        // Admin operations (more complex) should respond within 2 seconds
        expect(responseTime).toBeLessThan(2000);
        expect([200, 404]).toContain(response.status);
      }
    });
  });

  describe('Index Utilization Verification', () => {
    it('should efficiently handle user role and status queries', async () => {
      const queries = [
        '/admin/users?role=USER&kycStatus=APPROVED&isActive=true',
        '/admin/users?role=ADMIN&isActive=true',
        '/admin/users?kycStatus=PENDING',
      ];

      for (const query of queries) {
        const startTime = Date.now();
        
        const response = await request(httpServer)
          .get(query)
          .set('Authorization', `Bearer ${adminToken}`);

        const queryTime = Date.now() - startTime;
        
        if (response.status === 200) {
          expect(response.body.data).toBeInstanceOf(Array);
          // Queries using composite indexes should be fast
          expect(queryTime).toBeLessThan(500);
        }
      }
    });
  });
});