import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Commissions (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/commissions/user/:userId/history (GET)', () => {
    it('should return user commission history', () => {
      return request(app.getHttpServer())
        .get('/commissions/user/agt-001/history')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/commissions/user/agt-001/history')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(10);
        });
    });
  });

  describe('/commissions/user/:userId/summary (GET)', () => {
    it('should return user commission summary', () => {
      return request(app.getHttpServer())
        .get('/commissions/user/agt-001/summary')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId', 'agt-001');
          expect(res.body).toHaveProperty('summary');
          expect(res.body).toHaveProperty('breakdown');
          expect(res.body.summary).toHaveProperty('totalEarned');
          expect(res.body.summary).toHaveProperty('pendingAmount');
        });
    });
  });

  describe('/commissions/admin/list (GET)', () => {
    it('should return admin commission list', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/list')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/list')
        .query({ status: 'PAID' })
        .set('Authorization', authToken)
        .expect(200);
    });

    it('should filter by commission type', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/list')
        .query({ type: 'DIRECT_SALE' })
        .set('Authorization', authToken)
        .expect(200);
    });

    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/list')
        .expect(401);
    });
  });

  describe('/commissions/admin/stats (GET)', () => {
    it('should return commission statistics', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/stats')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('overview');
          expect(res.body).toHaveProperty('breakdown');
          expect(res.body).toHaveProperty('trends');
          expect(res.body.overview).toHaveProperty('totalCommissions');
        });
    });

    it('should accept custom period', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/stats')
        .query({ period: 'Q1-2024' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.period).toBe('Q1-2024');
        });
    });
  });

  describe('/commissions/admin/calculate (POST)', () => {
    it('should calculate commissions', () => {
      const calculationData = {
        period: '2024-01',
        agentIds: ['agt-001', 'agt-002'],
        includeSubAgents: true,
        forceRecalculate: false
      };

      return request(app.getHttpServer())
        .post('/commissions/admin/calculate')
        .set('Authorization', authToken)
        .send(calculationData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('calculationId');
          expect(res.body).toHaveProperty('summary');
          expect(res.body).toHaveProperty('results');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/commissions/admin/calculate')
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });
  });

  describe('/commissions/admin/process-payments (POST)', () => {
    it('should process commission payments', () => {
      const paymentData = {
        commissionIds: ['comm-001', 'comm-002'],
        period: '2024-01',
        batchSize: 10
      };

      return request(app.getHttpServer())
        .post('/commissions/admin/process-payments')
        .set('Authorization', authToken)
        .send(paymentData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('batchId');
          expect(res.body).toHaveProperty('summary');
        });
    });
  });

  describe('/commissions/admin/breakdown (GET)', () => {
    it('should return commission breakdown', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/breakdown')
        .query({ period: '2024-01' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('period', '2024-01');
          expect(res.body).toHaveProperty('groupBy');
          expect(res.body).toHaveProperty('breakdown');
        });
    });

    it('should group by agent', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/breakdown')
        .query({ period: '2024-01', groupBy: 'agent' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.groupBy).toBe('agent');
        });
    });

    it('should group by level', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/breakdown')
        .query({ period: '2024-01', groupBy: 'level' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.groupBy).toBe('level');
        });
    });
  });

  describe('/commissions/admin/rules (GET)', () => {
    it('should return commission rules', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/rules')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('rules');
          expect(res.body).toHaveProperty('lastUpdated');
          expect(res.body.rules).toHaveProperty('levelStructure');
        });
    });
  });

  describe('/commissions/admin/rules (POST)', () => {
    it('should update commission rules', () => {
      const rulesData = {
        minCommissionThreshold: 15,
        maxCommissionRate: 12,
        payoutFrequency: 'monthly',
        holdingPeriod: 30
      };

      return request(app.getHttpServer())
        .post('/commissions/admin/rules')
        .set('Authorization', authToken)
        .send(rulesData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('updatedRules');
        });
    });
  });

  describe('/commissions/admin/validate (POST)', () => {
    it('should validate commission calculations', () => {
      const validationData = {
        period: '2024-01',
        sampleSize: 10
      };

      return request(app.getHttpServer())
        .post('/commissions/admin/validate')
        .set('Authorization', authToken)
        .send(validationData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('validation');
          expect(res.body.validation).toHaveProperty('accuracyRate');
          expect(res.body.validation).toHaveProperty('discrepancies');
        });
    });
  });

  describe('/commissions/admin/export (GET)', () => {
    it('should export commission data', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/export')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('downloadUrl');
          expect(res.body).toHaveProperty('recordCount');
        });
    });

    it('should export with filters', () => {
      return request(app.getHttpServer())
        .get('/commissions/admin/export')
        .query({ period: '2024-01', status: 'PAID', format: 'excel' })
        .set('Authorization', authToken)
        .expect(200);
    });
  });
});