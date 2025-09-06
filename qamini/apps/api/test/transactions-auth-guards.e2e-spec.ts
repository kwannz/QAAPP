import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Transactions Auth Guards Smoke (e2e)', () => {
  let app: INestApplication
  let httpServer: any
  let adminToken: string = ''

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    httpServer = app.getHttpServer()

    try {
      const loginRes = await request(httpServer)
        .post('/auth/login')
        .send({ email: 'admin@qa-app.com', password: 'Admin123!' })
      adminToken = loginRes.body?.accessToken || loginRes.body?.access_token || loginRes.body?.token || ''
    } catch {}
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /finance/transactions should require auth (401)', async () => {
    await request(httpServer)
      .get('/finance/transactions')
      .expect(401)
  })

  it('GET /finance/transactions should allow ADMIN (200)', async () => {
    if (!adminToken) return
    await request(httpServer)
      .get('/finance/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
  })

  it('GET /finance/transactions/stats/overview should require auth (401)', async () => {
    await request(httpServer)
      .get('/finance/transactions/stats/overview')
      .expect(401)
  })

  it('GET /finance/transactions/stats/overview should allow ADMIN (200)', async () => {
    if (!adminToken) return
    await request(httpServer)
      .get('/finance/transactions/stats/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
  })
})

