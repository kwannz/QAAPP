import { Test, TestingModule } from '@nestjs/testing';
import { CommissionsService } from './commissions.service';

describe('CommissionsService', () => {
  let service: CommissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionsService],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserCommissionHistory', () => {
    it('should return user commission history with pagination', async () => {
      const userId = 'agt-001';
      const pagination = { page: 1, limit: 20 };

      const result = await service.getUserCommissionHistory(userId, pagination);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('limit', 20);
    });

    it('should filter commissions for specific user', async () => {
      const userId = 'agt-001';
      const pagination = { page: 1, limit: 20 };

      const result = await service.getUserCommissionHistory(userId, pagination);

      result.data.forEach(commission => {
        expect(commission.userId).toBe(userId);
      });
    });
  });

  describe('getUserCommissionSummary', () => {
    it('should return user commission summary', async () => {
      const userId = 'agt-001';

      const result = await service.getUserCommissionSummary(userId);

      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('breakdown');
      expect(result.summary).toHaveProperty('totalEarned');
      expect(result.summary).toHaveProperty('pendingAmount');
      expect(result.summary).toHaveProperty('paidAmount');
      expect(result.breakdown).toHaveProperty('directSales');
      expect(result.breakdown).toHaveProperty('referralBonuses');
    });

    it('should calculate correct totals', async () => {
      const userId = 'agt-001';

      const result = await service.getUserCommissionSummary(userId);

      expect(typeof result.summary.totalEarned).toBe('number');
      expect(typeof result.summary.pendingAmount).toBe('number');
      expect(typeof result.summary.paidAmount).toBe('number');
      expect(result.summary.totalEarned).toBeGreaterThan(0);
    });
  });

  describe('getAdminCommissionList', () => {
    it('should return filtered commission list', async () => {
      const filters = {
        status: 'PAID',
        page: 1,
        limit: 20
      };

      const result = await service.getAdminCommissionList(filters);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      result.data.forEach(commission => {
        expect(commission.status).toBe('PAID');
      });
    });

    it('should filter by commission type', async () => {
      const filters = {
        type: 'DIRECT_SALE',
        page: 1,
        limit: 20
      };

      const result = await service.getAdminCommissionList(filters);

      result.data.forEach(commission => {
        expect(commission.commissionType).toBe('DIRECT_SALE');
      });
    });

    it('should filter by period', async () => {
      const filters = {
        period: '2024-01',
        page: 1,
        limit: 20
      };

      const result = await service.getAdminCommissionList(filters);

      result.data.forEach(commission => {
        expect(commission.period).toBe('2024-01');
      });
    });
  });

  describe('getCommissionStats', () => {
    it('should return commission statistics', async () => {
      const result = await service.getCommissionStats();

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('trends');
      expect(result.overview).toHaveProperty('totalCommissions');
      expect(result.overview).toHaveProperty('pendingCommissions');
      expect(result.overview).toHaveProperty('paidCommissions');
      expect(typeof result.overview.totalCommissions).toBe('number');
    });

    it('should accept custom period', async () => {
      const period = 'Q1-2024';
      const result = await service.getCommissionStats(period);

      expect(result.period).toBe(period);
    });
  });

  describe('calculateCommissions', () => {
    it('should calculate commissions for period', async () => {
      const calculationData = {
        period: '2024-01',
        agentIds: ['agt-001', 'agt-002'],
        includeSubAgents: true
      };

      const result = await service.calculateCommissions(calculationData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('period', calculationData.period);
      expect(result).toHaveProperty('calculationId');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('results');
      expect(result.summary).toHaveProperty('totalCalculated');
      expect(result.summary).toHaveProperty('totalAmount');
      expect(result.results).toBeInstanceOf(Array);
    });

    it('should handle calculation without specific agents', async () => {
      const calculationData = {
        period: '2024-01'
      };

      const result = await service.calculateCommissions(calculationData);

      expect(result.success).toBe(true);
      expect(result.summary.totalCalculated).toBeGreaterThan(0);
    });
  });

  describe('processCommissionPayments', () => {
    it('should process commission payments', async () => {
      const paymentData = {
        commissionIds: ['comm-001', 'comm-002']
      };

      const result = await service.processCommissionPayments(paymentData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('batchId');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('results');
      expect(result.summary).toHaveProperty('totalProcessed');
      expect(result.summary).toHaveProperty('successfulPayments');
      expect(result.summary).toHaveProperty('failedPayments');
    });
  });

  describe('getCommissionRules', () => {
    it('should return commission rules', async () => {
      const result = await service.getCommissionRules();

      expect(result).toHaveProperty('rules');
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('updatedBy');
      expect(result.rules).toHaveProperty('minCommissionThreshold');
      expect(result.rules).toHaveProperty('maxCommissionRate');
      expect(result.rules).toHaveProperty('levelStructure');
      expect(result.rules.levelStructure).toBeInstanceOf(Array);
    });
  });

  describe('updateCommissionRules', () => {
    it('should update commission rules', async () => {
      const rulesData = {
        minCommissionThreshold: 15,
        maxCommissionRate: 12
      };

      const result = await service.updateCommissionRules(rulesData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('updatedRules');
      expect(result).toHaveProperty('effectiveDate');
    });
  });

  describe('validateCommissions', () => {
    it('should validate commission calculations', async () => {
      const validationData = {
        period: '2024-01',
        sampleSize: 5
      };

      const result = await service.validateCommissions(validationData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('period', validationData.period);
      expect(result).toHaveProperty('validation');
      expect(result.validation).toHaveProperty('totalRecords');
      expect(result.validation).toHaveProperty('sampleSize');
      expect(result.validation).toHaveProperty('accuracyRate');
      expect(result.validation).toHaveProperty('discrepancies');
      expect(typeof result.validation.accuracyRate).toBe('number');
    });
  });

  describe('retryFailedPayments', () => {
    it('should retry failed payments', async () => {
      const retryData = {
        commissionIds: ['comm-002']
      };

      const result = await service.retryFailedPayments(retryData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('retryBatchId');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('results');
      expect(result.summary).toHaveProperty('totalRetried');
      expect(result.summary).toHaveProperty('successfulRetries');
    });
  });
});