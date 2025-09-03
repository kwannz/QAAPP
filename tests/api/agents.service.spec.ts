import { Test, TestingModule } from '@nestjs/testing';
import { AgentsService } from './agents.service';

describe('AgentsService', () => {
  let service: AgentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentsService],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminAgentList', () => {
    it('should return paginated agent list', async () => {
      const result = await service.getAdminAgentList({
        page: 1,
        limit: 20
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
    });

    it('should filter agents by status', async () => {
      const result = await service.getAdminAgentList({
        status: 'active',
        page: 1,
        limit: 20
      });

      expect(result.data.every(agent => agent.isActive && agent.kycStatus === 'APPROVED')).toBe(true);
    });

    it('should filter agents by level', async () => {
      const result = await service.getAdminAgentList({
        level: '1',
        page: 1,
        limit: 20
      });

      expect(result.data.every(agent => agent.level.toString() === '1')).toBe(true);
    });

    it('should search agents by email or referral code', async () => {
      const result = await service.getAdminAgentList({
        search: 'agent1',
        page: 1,
        limit: 20
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.some(agent => 
        agent.email.toLowerCase().includes('agent1') || 
        agent.referralCode.toLowerCase().includes('agent1')
      )).toBe(true);
    });
  });

  describe('getAgentStats', () => {
    it('should return agent statistics', async () => {
      const result = await service.getAgentStats();

      expect(result).toHaveProperty('totalAgents');
      expect(result).toHaveProperty('activeAgents');
      expect(result).toHaveProperty('pendingApprovals');
      expect(result).toHaveProperty('topPerformers');
      expect(result).toHaveProperty('totalCommissionPaid');
      expect(typeof result.totalAgents).toBe('number');
      expect(typeof result.activeAgents).toBe('number');
    });
  });

  describe('getAgentHierarchy', () => {
    it('should return agent hierarchy structure', async () => {
      const result = await service.getAgentHierarchy();

      expect(result).toHaveProperty('rootAgents');
      expect(result).toHaveProperty('stats');
      expect(result.rootAgents).toBeInstanceOf(Array);
      expect(result.stats).toHaveProperty('totalLevels');
      expect(result.stats).toHaveProperty('maxDepth');
    });
  });

  describe('getAgentPerformance', () => {
    it('should return agent performance metrics', async () => {
      const agentId = 'agt-001';
      const result = await service.getAgentPerformance(agentId);

      expect(result).toHaveProperty('agentId', agentId);
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('rankings');
      expect(result.metrics).toHaveProperty('newUsers');
      expect(result.metrics).toHaveProperty('totalOrders');
      expect(result.metrics).toHaveProperty('volume');
    });

    it('should accept custom period', async () => {
      const agentId = 'agt-001';
      const period = '7d';
      const result = await service.getAgentPerformance(agentId, period);

      expect(result.period).toBe(period);
    });
  });

  describe('approveAgent', () => {
    it('should approve an agent successfully', async () => {
      const agentId = 'agt-001';
      const approvalData = {
        level: 2,
        commissionRate: 250
      };

      const result = await service.approveAgent(agentId, approvalData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('agentId', agentId);
      expect(result).toHaveProperty('newLevel', approvalData.level);
      expect(result).toHaveProperty('commissionRate', approvalData.commissionRate);
    });
  });

  describe('rejectAgent', () => {
    it('should reject an agent with reason', async () => {
      const agentId = 'agt-001';
      const rejectionData = {
        reason: 'Incomplete documentation'
      };

      const result = await service.rejectAgent(agentId, rejectionData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('agentId', agentId);
      expect(result).toHaveProperty('reason', rejectionData.reason);
    });
  });

  describe('updateCommissionRate', () => {
    it('should update agent commission rate', async () => {
      const agentId = 'agt-001';
      const commissionData = {
        commissionRate: 300,
        effectiveDate: '2024-02-01T00:00:00Z'
      };

      const result = await service.updateCommissionRate(agentId, commissionData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('agentId', agentId);
      expect(result).toHaveProperty('newRate', commissionData.commissionRate);
    });
  });

  describe('calculateAgentCommission', () => {
    it('should calculate agent commission breakdown', async () => {
      const agentId = 'agt-001';
      const calculationData = {
        period: '2024-01'
      };

      const result = await service.calculateAgentCommission(agentId, calculationData);

      expect(result).toHaveProperty('agentId', agentId);
      expect(result).toHaveProperty('calculation');
      expect(result).toHaveProperty('breakdown');
      expect(result.calculation).toHaveProperty('baseCommission');
      expect(result.calculation).toHaveProperty('bonusCommission');
      expect(result.calculation).toHaveProperty('totalCommission');
      expect(result.breakdown).toBeInstanceOf(Array);
    });
  });

  describe('getAgentTeam', () => {
    it('should return agent team structure', async () => {
      const agentId = 'agt-001';
      const result = await service.getAgentTeam(agentId);

      expect(result).toHaveProperty('agentId', agentId);
      expect(result).toHaveProperty('directAgents');
      expect(result).toHaveProperty('directUsers');
      expect(result).toHaveProperty('teamStats');
      expect(result.directAgents).toBeInstanceOf(Array);
      expect(result.directUsers).toBeInstanceOf(Array);
    });
  });
});