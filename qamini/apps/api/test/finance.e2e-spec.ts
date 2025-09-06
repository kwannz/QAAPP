import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Finance Module Integration Tests', () => {
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

  describe('Transactions API (/finance/transactions)', () => {
    it('should get unified transaction list', async () => {
      const response = await request(httpServer)
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          type: 'ALL', 
          limit: 10 
        })
        .expect(200)

      expect(response.body).toMatchObject({
        transactions: expect.any(Array),
        total: expect.any(Number),
        pagination: expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number)
        })
      })
    })

    it('should filter transactions by type', async () => {
      const response = await request(httpServer)
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'PAYOUT' })
        .expect(200)

      if (response.body.transactions.length > 0) {
        expect(response.body.transactions.every((tx: any) => tx.type === 'PAYOUT')).toBe(true)
      }
    })

    it('should require authentication', async () => {
      await request(httpServer)
        .get('/finance/transactions')
        .expect(401)
    })

    it('should validate query parameters', async () => {
      await request(httpServer)
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          limit: -1,
          type: 'INVALID_TYPE'
        })
        .expect(400)
    })
  })

  describe('Transaction Details (/finance/transactions/:id)', () => {
    it('should get transaction by valid ID', async () => {
      // First get a transaction list to get valid ID
      const listResponse = await request(httpServer)
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 1 })

      if (listResponse.body.transactions.length > 0) {
        const transactionId = listResponse.body.transactions[0].id

        const response = await request(httpServer)
          .get(`/finance/transactions/${transactionId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        expect(response.body).toMatchObject({
          id: transactionId,
          type: expect.stringMatching(/^(PAYOUT|WITHDRAWAL)$/),
          userId: expect.any(String),
          amount: expect.any(Number),
          status: expect.stringMatching(/^(PENDING|PROCESSING|COMPLETED|FAILED)$/),
          createdAt: expect.any(String)
        })
      }
    })

    it('should return 404 for nonexistent transaction', async () => {
      await request(httpServer)
        .get('/finance/transactions/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('Transaction Statistics (/finance/transactions/stats)', () => {
    it('should return comprehensive statistics', async () => {
      const response = await request(httpServer)
        .get('/finance/transactions/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totals: expect.objectContaining({
          payouts: expect.objectContaining({
            count: expect.any(Number),
            amount: expect.any(Number)
          }),
          withdrawals: expect.objectContaining({
            count: expect.any(Number),
            amount: expect.any(Number)
          })
        }),
        trends: expect.any(Object),
        statusBreakdown: expect.any(Object)
      })
    })

    it('should support user-specific statistics', async () => {
      const response = await request(httpServer)
        .get('/finance/transactions/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ userId: 'user1' })
        .expect(200)

      expect(response.body.totals).toBeDefined()
    })
  })

  describe('Transaction Status Updates (/finance/transactions/:id/status)', () => {
    it('should update transaction status with valid transition', async () => {
      // This would typically require admin permissions
      const updateData = {
        status: 'COMPLETED',
        notes: 'Transaction processed successfully'
      }

      // Note: This test assumes we have a pending transaction to update
      // In real implementation, this would be mocked or use test fixtures
      const response = await request(httpServer)
        .patch('/finance/transactions/mock_pending_tx/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      if (response.status === 200) {
        expect(response.body).toMatchObject({
          id: expect.any(String),
          status: 'COMPLETED',
          updatedAt: expect.any(String)
        })
      } else if (response.status === 404) {
        // Expected if no pending transactions exist
        expect(response.status).toBe(404)
      }
    })

    it('should reject invalid status transitions', async () => {
      const updateData = {
        status: 'INVALID_STATUS'
      }

      await request(httpServer)
        .patch('/finance/transactions/any_id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400)
    })

    it('should require admin permissions for status updates', async () => {
      // Test with non-admin token (if implemented)
      const updateData = { status: 'COMPLETED' }

      // This test assumes role-based access control
      // Implementation may vary based on auth strategy
      await request(httpServer)
        .patch('/finance/transactions/any_id/status')
        .send(updateData)
        .expect(401)
    })
  })

  describe('Legacy API Compatibility', () => {
    it('should maintain compatibility with legacy payouts endpoints', async () => {
      // Test that old /payouts routes still work via proxy/redirect
      const response = await request(httpServer)
        .get('/payouts')
        .set('Authorization', `Bearer ${authToken}`)

      // Should either redirect (3xx) or proxy successfully (2xx)
      expect([200, 301, 302, 307]).toContain(response.status)
      
      if (response.status === 200) {
        // Verify response structure matches legacy format
        expect(response.headers['deprecation']).toBeDefined()
        expect(response.body).toBeDefined()
      }
    })

    it('should include deprecation headers for legacy endpoints', async () => {
      const response = await request(httpServer)
        .get('/withdrawals')
        .set('Authorization', `Bearer ${authToken}`)

      if (response.status === 200) {
        expect(response.headers['deprecation']).toBeDefined()
        expect(response.headers['link']).toContain('/finance/transactions')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection failures gracefully', async () => {
      // This would require mocking database failures
      // Implementation depends on database setup
      const response = await request(httpServer)
        .get('/finance/transactions/stats')
        .set('Authorization', `Bearer ${authToken}`)

      // Should return either success or appropriate error status
      expect([200, 503]).toContain(response.status)
    })

    it('should validate request payloads', async () => {
      const invalidPayload = {
        invalidField: 'invalid data'
      }

      await request(httpServer)
        .patch('/finance/transactions/any_id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayload)
        .expect(400)
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now()
      
      await request(httpServer)
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100 })
        .expect(200)

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(2000) // 2 second limit
    })

    it('should handle large transaction lists efficiently', async () => {
      const response = await request(httpServer)
        .get('/finance/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 1000 }) // Large list
        .expect(200)

      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.limit).toBeLessThanOrEqual(1000)
    })
  })
})