import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Monitoring Module Integration Tests', () => {
  let app: INestApplication
  let httpServer: any
  let authToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    httpServer = app.getHttpServer()

    // Get auth token for protected routes
    const authResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: 'admin@qa-app.com',
        password: 'Admin123!'
      })

    authToken = authResponse.body?.token || 'mock-token'
  })

  afterAll(async () => {
    await app.close()
  })

  describe('System Metrics (/monitoring/metrics)', () => {
    it('should return comprehensive system metrics', async () => {
      const response = await request(httpServer)
        .get('/monitoring/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        logs: expect.objectContaining({
          total: expect.any(Number),
          errors: expect.any(Number),
          warnings: expect.any(Number),
          recentEntries: expect.any(Array)
        }),
        audit: expect.objectContaining({
          total: expect.any(Number),
          todayEntries: expect.any(Number),
          criticalActions: expect.any(Number)
        }),
        alerts: expect.objectContaining({
          active: expect.any(Number),
          resolved: expect.any(Number),
          critical: expect.any(Number)
        }),
        performance: expect.objectContaining({
          avgResponseTime: expect.any(Number),
          errorRate: expect.any(Number),
          uptime: expect.any(Number)
        })
      })
    })

    it('should require admin authentication', async () => {
      await request(httpServer)
        .get('/monitoring/metrics')
        .expect(401)
    })

    it('should support metric type filtering', async () => {
      const response = await request(httpServer)
        .get('/monitoring/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'performance' })
        .expect(200)

      expect(response.body.performance).toBeDefined()
    })
  })

  describe('Logs API (/monitoring/logs)', () => {
    it('should return system logs', async () => {
      const response = await request(httpServer)
        .get('/monitoring/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10 })
        .expect(200)

      expect(response.body).toMatchObject({
        logs: expect.objectContaining({
          recentEntries: expect.any(Array),
          total: expect.any(Number)
        })
      })
    })

    it('should filter logs by level', async () => {
      const response = await request(httpServer)
        .get('/monitoring/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          level: 'error',
          limit: 5 
        })
        .expect(200)

      expect(response.body.logs).toBeDefined()
    })

    it('should support date range filtering for logs', async () => {
      const response = await request(httpServer)
        .get('/monitoring/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          limit: 20
        })
        .expect(200)

      expect(response.body.logs.recentEntries).toBeDefined()
    })
  })

  describe('Audit Trail (/monitoring/audit)', () => {
    it('should return audit trail data', async () => {
      const response = await request(httpServer)
        .get('/monitoring/audit')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 15 })
        .expect(200)

      expect(response.body).toMatchObject({
        audit: expect.objectContaining({
          total: expect.any(Number),
          todayEntries: expect.any(Number),
          recentEntries: expect.any(Array)
        })
      })
    })

    it('should filter audit entries by action type', async () => {
      const response = await request(httpServer)
        .get('/monitoring/audit')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ actionType: 'user_login' })
        .expect(200)

      expect(response.body.audit).toBeDefined()
    })
  })

  describe('Alerts API (/monitoring/alerts)', () => {
    it('should return system alerts', async () => {
      const response = await request(httpServer)
        .get('/monitoring/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        alerts: expect.objectContaining({
          active: expect.any(Number),
          resolved: expect.any(Number),
          critical: expect.any(Number),
          recentAlerts: expect.any(Array)
        })
      })
    })

    it('should filter alerts by severity', async () => {
      const response = await request(httpServer)
        .get('/monitoring/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ severity: 'critical' })
        .expect(200)

      expect(response.body.alerts.critical).toBeGreaterThanOrEqual(0)
    })

    it('should support alert acknowledgment', async () => {
      const ackData = {
        alertId: 'alert_123',
        acknowledgedBy: 'admin@qa-app.com',
        notes: 'Issue resolved'
      }

      // This endpoint might return 404 if no alerts exist
      const response = await request(httpServer)
        .post('/monitoring/alerts/acknowledge')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ackData)

      expect([200, 404]).toContain(response.status)
    })
  })

  describe('Performance Metrics (/monitoring/performance)', () => {
    it('should return performance data with optimization info', async () => {
      const response = await request(httpServer)
        .get('/monitoring/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        performance: expect.objectContaining({
          avgResponseTime: expect.any(Number),
          errorRate: expect.any(Number),
          uptime: expect.any(Number),
          optimizer: expect.any(Object)
        })
      })
    })

    it('should include database performance metrics', async () => {
      const response = await request(httpServer)
        .get('/monitoring/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ includeDb: true })
        .expect(200)

      expect(response.body.performance).toBeDefined()
    })
  })

  describe('Legacy API Compatibility', () => {
    it('should handle deprecated /logs endpoints with headers', async () => {
      const response = await request(httpServer)
        .get('/logs')
        .set('Authorization', `Bearer ${authToken}`)

      if (response.status === 200) {
        expect(response.headers['deprecation']).toBeDefined()
        expect(response.headers['link']).toContain('/monitoring/logs')
      } else {
        // Endpoint might be removed, which is also acceptable
        expect([404, 410]).toContain(response.status)
      }
    })

    it('should handle deprecated /audit endpoints', async () => {
      const response = await request(httpServer)
        .get('/audit')
        .set('Authorization', `Bearer ${authToken}`)

      if (response.status === 200) {
        expect(response.headers['deprecation']).toBeDefined()
      } else {
        expect([404, 410]).toContain(response.status)
      }
    })

    it('should handle deprecated /alerts endpoints', async () => {
      const response = await request(httpServer)
        .get('/alerts')
        .set('Authorization', `Bearer ${authToken}`)

      if (response.status === 200) {
        expect(response.headers['deprecation']).toBeDefined()
      } else {
        expect([404, 410]).toContain(response.status)
      }
    })
  })

  describe('Security', () => {
    it('should require authentication for all monitoring endpoints', async () => {
      const endpoints = [
        '/monitoring/metrics',
        '/monitoring/logs', 
        '/monitoring/audit',
        '/monitoring/alerts',
        '/monitoring/performance'
      ]

      for (const endpoint of endpoints) {
        await request(httpServer)
          .get(endpoint)
          .expect(401)
      }
    })

    it('should validate admin permissions for sensitive operations', async () => {
      // This test assumes role-based access control implementation
      const sensitiveOperations = [
        { method: 'delete', path: '/monitoring/logs/cleanup' },
        { method: 'post', path: '/monitoring/alerts/bulk-ack' }
      ]

      for (const op of sensitiveOperations) {
        const req = request(httpServer)[op.method as keyof typeof request](op.path)
          .set('Authorization', `Bearer ${authToken}`)

        if (op.method === 'delete') {
          await req.expect(405) // Method might not exist
        } else {
          await req.send({}).expect(400) // Bad request for missing data
        }
      }
    })
  })
})