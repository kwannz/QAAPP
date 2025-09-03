import { Test, TestingModule } from '@nestjs/testing';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

describe('AgentsController', () => {
  let controller: AgentsController;
  let service: AgentsService;

  const mockAgentsService = {
    getAgentProfile: jest.fn(),
    submitAgentApplication: jest.fn(),
    getAdminAgentList: jest.fn(),
    getAgentStats: jest.fn(),
    getAgentHierarchy: jest.fn(),
    getAgentPerformance: jest.fn(),
    approveAgent: jest.fn(),
    rejectAgent: jest.fn(),
    updateCommissionRate: jest.fn(),
    updateAgentLevel: jest.fn(),
    toggleAgentStatus: jest.fn(),
    batchUpdateAgents: jest.fn(),
    getAgentTeam: jest.fn(),
    calculateAgentCommission: jest.fn(),
    exportAgents: jest.fn(),
    getAgentAuditTrail: jest.fn(),
    getAgentPayouts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        {
          provide: 'AgentsService',
          useValue: mockAgentsService,
        },
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
    service = module.get<AgentsService>('AgentsService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAgentProfile', () => {
    it('should return agent profile', async () => {
      const userId = 'usr-001';
      const mockProfile = {
        userId,
        isAgent: true,
        agentData: { id: 'agt-001', email: 'agent@example.com' }
      };

      mockAgentsService.getAgentProfile.mockResolvedValue(mockProfile);

      const result = await controller.getAgentProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(service.getAgentProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('applyToBeAgent', () => {
    it('should submit agent application', async () => {
      const applicationData = {
        userId: 'usr-001',
        businessInfo: { name: 'Test Business' }
      };
      const mockResponse = {
        success: true,
        applicationId: 'app-001'
      };

      mockAgentsService.submitAgentApplication.mockResolvedValue(mockResponse);

      const result = await controller.applyToBeAgent(applicationData);

      expect(result).toEqual(mockResponse);
      expect(service.submitAgentApplication).toHaveBeenCalledWith(applicationData);
    });
  });

  describe('getAdminAgentList', () => {
    it('should return paginated agent list', async () => {
      const mockAgentList = {
        data: [{ id: 'agt-001', email: 'agent@example.com' }],
        pagination: { total: 1, page: 1, limit: 20 }
      };

      mockAgentsService.getAdminAgentList.mockResolvedValue(mockAgentList);

      const result = await controller.getAdminAgentList('active', '1', 'high', 'test', 1, 20);

      expect(result).toEqual(mockAgentList);
      expect(service.getAdminAgentList).toHaveBeenCalledWith({
        status: 'active',
        level: '1',
        performance: 'high',
        search: 'test',
        page: 1,
        limit: 20
      });
    });
  });

  describe('getAgentStats', () => {
    it('should return agent statistics', async () => {
      const mockStats = {
        totalAgents: 25,
        activeAgents: 18,
        pendingApprovals: 3
      };

      mockAgentsService.getAgentStats.mockResolvedValue(mockStats);

      const result = await controller.getAgentStats();

      expect(result).toEqual(mockStats);
      expect(service.getAgentStats).toHaveBeenCalled();
    });
  });

  describe('approveAgent', () => {
    it('should approve agent successfully', async () => {
      const agentId = 'agt-001';
      const approvalData = {
        level: 2,
        commissionRate: 250
      };
      const mockResponse = {
        success: true,
        agentId,
        newLevel: 2
      };

      mockAgentsService.approveAgent.mockResolvedValue(mockResponse);

      const result = await controller.approveAgent(agentId, approvalData);

      expect(result).toEqual(mockResponse);
      expect(service.approveAgent).toHaveBeenCalledWith(agentId, approvalData);
    });
  });

  describe('rejectAgent', () => {
    it('should reject agent with reason', async () => {
      const agentId = 'agt-001';
      const rejectionData = {
        reason: 'Incomplete documentation'
      };
      const mockResponse = {
        success: true,
        agentId,
        reason: rejectionData.reason
      };

      mockAgentsService.rejectAgent.mockResolvedValue(mockResponse);

      const result = await controller.rejectAgent(agentId, rejectionData);

      expect(result).toEqual(mockResponse);
      expect(service.rejectAgent).toHaveBeenCalledWith(agentId, rejectionData);
    });
  });

  describe('updateCommissionRate', () => {
    it('should update agent commission rate', async () => {
      const agentId = 'agt-001';
      const commissionData = {
        commissionRate: 300,
        effectiveDate: '2024-02-01T00:00:00Z'
      };
      const mockResponse = {
        success: true,
        agentId,
        newRate: 300
      };

      mockAgentsService.updateCommissionRate.mockResolvedValue(mockResponse);

      const result = await controller.updateCommissionRate(agentId, commissionData);

      expect(result).toEqual(mockResponse);
      expect(service.updateCommissionRate).toHaveBeenCalledWith(agentId, commissionData);
    });
  });

  describe('batchUpdateAgents', () => {
    it('should perform batch update on agents', async () => {
      const batchData = {
        agentIds: ['agt-001', 'agt-002'],
        action: 'approve' as const,
        reason: 'Batch approval'
      };
      const mockResponse = {
        success: true,
        processedCount: 2
      };

      mockAgentsService.batchUpdateAgents.mockResolvedValue(mockResponse);

      const result = await controller.batchUpdateAgents(batchData);

      expect(result).toEqual(mockResponse);
      expect(service.batchUpdateAgents).toHaveBeenCalledWith(batchData);
    });
  });

  describe('getAgentTeam', () => {
    it('should return agent team structure', async () => {
      const agentId = 'agt-001';
      const mockTeam = {
        agentId,
        directAgents: [],
        directUsers: [],
        teamStats: { totalAgents: 3 }
      };

      mockAgentsService.getAgentTeam.mockResolvedValue(mockTeam);

      const result = await controller.getAgentTeam(agentId);

      expect(result).toEqual(mockTeam);
      expect(service.getAgentTeam).toHaveBeenCalledWith(agentId);
    });
  });

  describe('exportAgents', () => {
    it('should export agents data', async () => {
      const mockExport = {
        success: true,
        downloadUrl: '/api/downloads/agents-export.csv',
        recordCount: 25
      };

      mockAgentsService.exportAgents.mockResolvedValue(mockExport);

      const result = await controller.exportAgents('active', '1', 'csv');

      expect(result).toEqual(mockExport);
      expect(service.exportAgents).toHaveBeenCalledWith({
        status: 'active',
        level: '1',
        format: 'csv'
      });
    });
  });
});