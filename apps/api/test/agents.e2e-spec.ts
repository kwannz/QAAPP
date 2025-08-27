import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Agents (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication token
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/agents/profile (GET)', () => {
    it('should return agent profile', () => {
      return request(app.getHttpServer())
        .get('/agents/profile')
        .query({ userId: 'usr-001' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('isAgent');
        });
    });

    it('should return 400 for missing userId', () => {
      return request(app.getHttpServer())
        .get('/agents/profile')
        .expect(400);
    });
  });

  describe('/agents/apply (POST)', () => {
    it('should submit agent application', () => {
      const applicationData = {
        userId: 'usr-001',
        businessInfo: {
          name: 'Test Business',
          type: 'Individual'
        }
      };

      return request(app.getHttpServer())
        .post('/agents/apply')
        .send(applicationData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('applicationId');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/agents/apply')
        .send({})
        .expect(400);
    });
  });

  describe('/agents/admin/list (GET)', () => {
    it('should return paginated agent list for admin', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/list')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('total');
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/list')
        .query({ status: 'active' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThanOrEqual(0);
        });
    });

    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/list')
        .expect(401);
    });
  });

  describe('/agents/admin/stats (GET)', () => {
    it('should return agent statistics', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/stats')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalAgents');
          expect(res.body).toHaveProperty('activeAgents');
          expect(res.body).toHaveProperty('pendingApprovals');
          expect(typeof res.body.totalAgents).toBe('number');
        });
    });
  });

  describe('/agents/admin/hierarchy (GET)', () => {
    it('should return agent hierarchy', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/hierarchy')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('rootAgents');
          expect(res.body).toHaveProperty('stats');
          expect(Array.isArray(res.body.rootAgents)).toBe(true);
        });
    });
  });

  describe('/agents/admin/:id/approve (PATCH)', () => {
    it('should approve agent', () => {
      const approvalData = {
        level: 2,
        commissionRate: 250,
        notes: 'Approved for level 2'
      };

      return request(app.getHttpServer())
        .patch('/agents/admin/agt-001/approve')
        .set('Authorization', authToken)
        .send(approvalData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('agentId', 'agt-001');
          expect(res.body).toHaveProperty('newLevel', 2);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .patch('/agents/admin/agt-001/approve')
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });
  });

  describe('/agents/admin/:id/reject (PATCH)', () => {
    it('should reject agent', () => {
      const rejectionData = {
        reason: 'Incomplete documentation',
        notes: 'Missing KYC documents'
      };

      return request(app.getHttpServer())
        .patch('/agents/admin/agt-001/reject')
        .set('Authorization', authToken)
        .send(rejectionData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('agentId', 'agt-001');
          expect(res.body).toHaveProperty('reason', rejectionData.reason);
        });
    });
  });

  describe('/agents/admin/:id/performance (GET)', () => {
    it('should return agent performance metrics', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/agt-001/performance')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('agentId', 'agt-001');
          expect(res.body).toHaveProperty('metrics');
          expect(res.body).toHaveProperty('trends');
          expect(res.body).toHaveProperty('rankings');
        });
    });

    it('should accept custom period', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/agt-001/performance')
        .query({ period: '7d' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.period).toBe('7d');
        });
    });
  });

  describe('/agents/admin/batch-update (PUT)', () => {
    it('should perform batch update', () => {
      const batchData = {
        agentIds: ['agt-001', 'agt-002'],
        action: 'approve',
        reason: 'Batch approval process'
      };

      return request(app.getHttpServer())
        .put('/agents/admin/batch-update')
        .set('Authorization', authToken)
        .send(batchData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('processedCount', 2);
        });
    });
  });

  describe('/agents/admin/export (GET)', () => {
    it('should export agents data', () => {
      return request(app.getHttpServer())
        .get('/agents/admin/export')
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
        .get('/agents/admin/export')
        .query({ status: 'active', format: 'excel' })
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.format).toBe('excel');
        });
    });
  });
});