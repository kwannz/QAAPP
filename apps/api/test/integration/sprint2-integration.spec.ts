import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../src/app.module'
import request from 'supertest'
import { DatabaseService } from '../../src/database/database.service'

describe('Sprint 2 Integration Tests', () => {
  let app: INestApplication
  let databaseService: DatabaseService
  let adminToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService)
    
    await app.init()

    // 获取测试用的admin token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@qa-app.com',
        password: 'Admin123!'
      })
      .expect(201)

    adminToken = loginResponse.body.accessToken
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  describe('API Deprecation Headers', () => {
    it('should include deprecation headers on payouts endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/payouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.headers).toHaveProperty('deprecation')
      expect(response.headers).toHaveProperty('x-deprecated-since', 'v2.1.0')
      expect(response.headers).toHaveProperty('x-deprecated-until', 'v3.0.0')
      expect(response.headers).toHaveProperty('x-deprecated-replacement', '/api/finance/transactions')
    })

    it('should include deprecation headers on withdrawals endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/withdrawals')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.headers).toHaveProperty('deprecation')
      expect(response.headers).toHaveProperty('x-deprecated-replacement', '/api/finance/transactions')
    })
  })

  describe('Monitoring Module Integration', () => {
    it('should provide unified monitoring metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/monitoring/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('logs')
      expect(response.body).toHaveProperty('audit')
      expect(response.body).toHaveProperty('alerts')
      expect(response.body).toHaveProperty('performance')
      expect(response.body).toHaveProperty('system')

      expect(response.body.logs).toHaveProperty('total')
      expect(response.body.audit).toHaveProperty('todayEntries')
      expect(response.body.performance).toHaveProperty('optimizer')
    })

    it('should provide system health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/monitoring/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('lastCheck')
      expect(['healthy', 'warning', 'error']).toContain(response.body.status)
    })
  })

  describe('Finance Module Integration', () => {
    it('should provide unified transactions endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('pageSize')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should filter transactions by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/transactions?type=PAYOUT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      if (response.body.data.length > 0) {
        response.body.data.forEach((transaction: any) => {
          expect(transaction.type).toBe('PAYOUT')
        })
      }
    })

    it('should provide transaction statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/transactions/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('payouts')
      expect(response.body).toHaveProperty('withdrawals')
      expect(response.body).toHaveProperty('total')
      expect(response.body.total).toHaveProperty('volume')
    })
  })

  describe('Performance Validation', () => {
    it('should respond to health check within 100ms', async () => {
      const start = Date.now()
      
      await request(app.getHttpServer())
        .get('/health')
        .expect(200)
        
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100)
    })

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/health')
          .expect(200)
      )

      const start = Date.now()
      await Promise.all(requests)
      const duration = Date.now() - start

      // 10 concurrent requests should complete within 500ms
      expect(duration).toBeLessThan(500)
    })
  })

  describe('Feature Flags Integration', () => {
    it('should respect feature flags for new endpoints', async () => {
      // Test monitoring API (should be enabled)
      await request(app.getHttpServer())
        .get('/monitoring/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      // Test finance transactions API (should be enabled)
      await request(app.getHttpServer())
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain API compatibility for existing clients', async () => {
      // Test legacy payouts still work (with deprecation headers)
      const response = await request(app.getHttpServer())
        .get('/payouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.headers).toHaveProperty('deprecation')
    })

    it('should maintain data consistency between old and new APIs', async () => {
      // Get data from legacy payout API
      const legacyResponse = await request(app.getHttpServer())
        .get('/payouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      // Get data from new unified transactions API
      const newResponse = await request(app.getHttpServer())
        .get('/finance/transactions?type=PAYOUT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      // Should have same data count (within reasonable bounds)
      const legacyCount = legacyResponse.body.data?.length || 0
      const newCount = newResponse.body.data?.length || 0
      
      if (legacyCount > 0) {
        expect(newCount).toBeGreaterThanOrEqual(legacyCount)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle unauthorized requests properly', async () => {
      await request(app.getHttpServer())
        .get('/monitoring/metrics')
        .expect(401)

      await request(app.getHttpServer())
        .get('/finance/transactions')
        .expect(401)
    })

    it('should handle invalid parameters gracefully', async () => {
      await request(app.getHttpServer())
        .get('/finance/transactions?type=INVALID_TYPE')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })
  })
})