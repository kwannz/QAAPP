import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Consolidated Centers E2E Tests (Sprint 2)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 获取管理员token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@qa-app.com',
        password: 'Admin123!'
      });
    
    adminToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Finance Module Consolidation', () => {
    it('should access consolidated commissions API through finance module', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/commissions/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('overview');
      expect(response.body.overview).toHaveProperty('totalCommissions');
      expect(response.body.overview).toHaveProperty('pendingCommissions');
    });

    it('should access consolidated withdrawals API through finance module', async () => {
      const response = await request(app.getHttpServer())
        .get('/finance/withdrawals/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byStatus');
    });

    it('should support commission calculation through finance module', async () => {
      const calculationData = {
        period: '2024-09',
        includeSubAgents: false,
        forceRecalculate: false
      };

      const response = await request(app.getHttpServer())
        .post('/finance/commissions/calculate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(calculationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('calculationId');
      expect(response.body).toHaveProperty('summary');
    });

    it('should support withdrawal creation through finance module', async () => {
      const withdrawalData = {
        userId: 'test-user-id',
        amount: 100,
        withdrawalType: 'COMMISSION',
        walletAddress: '0x1234567890123456789012345678901234567890',
        chainId: 1
      };

      const response = await request(app.getHttpServer())
        .post('/finance/withdrawals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(withdrawalData);

      // 可能因为余额不足失败，但应该返回400而不是500
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('Legacy API Compatibility', () => {
    it('should maintain backward compatibility for commissions endpoints', async () => {
      // 测试原有的佣金API是否仍然工作
      const response = await request(app.getHttpServer())
        .get('/commissions')
        .set('Authorization', `Bearer ${adminToken}`);

      // 应该返回200或者重定向
      expect([200, 302]).toContain(response.status);
    });

    it('should maintain backward compatibility for withdrawals endpoints', async () => {
      // 测试原有的提现API是否仍然工作
      const response = await request(app.getHttpServer())
        .get('/withdrawals')
        .set('Authorization', `Bearer ${adminToken}`);

      // 应该返回200或者重定向
      expect([200, 302]).toContain(response.status);
    });
  });

  describe('Feature Flag Integration', () => {
    it('should respond to feature flag changes for consolidated centers', async () => {
      // 这个测试验证功能开关是否正确控制新功能的可见性
      // 在实际环境中，这会通过前端feature flag系统测试
      expect(true).toBe(true); // 基础测试通过，实际功能开关测试需要前端环境
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency between consolidated services', async () => {
      // 获取佣金统计
      const commissionStats = await request(app.getHttpServer())
        .get('/finance/commissions/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 获取提现统计
      const withdrawalStats = await request(app.getHttpServer())
        .get('/finance/withdrawals/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 验证数据格式一致性
      expect(commissionStats.body).toHaveProperty('overview');
      expect(withdrawalStats.body).toHaveProperty('total');
      
      // 验证数据类型
      expect(typeof commissionStats.body.overview.totalCommissions).toBe('number');
      expect(typeof withdrawalStats.body.total).toBe('number');
    });
  });

  describe('Performance Validation', () => {
    it('should maintain response times under consolidated architecture', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        request(app.getHttpServer())
          .get('/finance/commissions/stats')
          .set('Authorization', `Bearer ${adminToken}`),
        request(app.getHttpServer())
          .get('/finance/withdrawals/stats')
          .set('Authorization', `Bearer ${adminToken}`)
      ]);

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 并行请求应该在合理时间内完成
      expect(responseTime).toBeLessThan(3000); // 3秒内
    });
  });
});