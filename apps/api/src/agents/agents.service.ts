import { Injectable } from '@nestjs/common';

@Injectable()
export class AgentsService {
  // Mock data for demonstration
  private mockAgents = [
    {
      id: 'agt-001',
      email: 'agent1@example.com',
      referralCode: 'AGT001',
      role: 'AGENT',
      isActive: true,
      kycStatus: 'APPROVED',
      agentId: null,
      level: 1,
      commissionRate: 300, // 3%
      totalUsers: 45,
      totalOrders: 128,
      totalVolume: 1250000,
      totalCommission: 37500,
      monthlyCommission: 5200,
      createdAt: '2024-01-01T00:00:00Z',
      performance: {
        newUsersThisMonth: 8,
        ordersThisMonth: 23,
        volumeThisMonth: 180000
      }
    },
    {
      id: 'agt-002',
      email: 'agent2@example.com',
      referralCode: 'AGT002',
      role: 'AGENT',
      isActive: true,
      kycStatus: 'APPROVED',
      agentId: 'agt-001',
      level: 2,
      commissionRate: 250, // 2.5%
      totalUsers: 23,
      totalOrders: 67,
      totalVolume: 680000,
      totalCommission: 17000,
      monthlyCommission: 2800,
      createdAt: '2024-01-15T00:00:00Z'
    }
  ];

  async getAdminAgentList(filters: any) {
    let filtered = [...this.mockAgents];
    
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(agent => agent.isActive && agent.kycStatus === 'APPROVED');
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(agent => !agent.isActive);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(agent => agent.kycStatus === 'PENDING');
      }
    }

    if (filters.level) {
      filtered = filtered.filter(agent => agent.level.toString() === filters.level);
    }

    if (filters.search) {
      filtered = filtered.filter(agent => 
        agent.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        agent.referralCode.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    const total = filtered.length;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    
    return {
      data: filtered.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAgentStats() {
    return {
      totalAgents: 25,
      activeAgents: 18,
      pendingApprovals: 3,
      topPerformers: 5,
      totalCommissionPaid: 125000,
      monthlyCommission: 18500,
      totalUsersUnderAgents: 342,
      avgCommissionRate: 2.8
    };
  }

  async getAgentHierarchy(rootAgentId?: string) {
    // Mock hierarchy data
    return {
      rootAgents: [
        {
          id: 'agt-001',
          email: 'agent1@example.com',
          referralCode: 'AGT001',
          level: 1,
          totalUsers: 45,
          totalVolume: 1250000,
          children: [
            {
              id: 'agt-002',
              email: 'agent2@example.com',
              referralCode: 'AGT002',
              level: 2,
              totalUsers: 23,
              totalVolume: 680000,
              children: []
            }
          ]
        }
      ],
      stats: {
        totalLevels: 3,
        maxDepth: 5,
        averageBranchSize: 3.2
      }
    };
  }

  async getAgentPerformance(agentId: string, period?: string) {
    return {
      agentId,
      period: period || '30d',
      metrics: {
        newUsers: 8,
        totalOrders: 23,
        volume: 180000,
        commission: 5200,
        conversionRate: 12.5,
        averageOrderSize: 7826
      },
      trends: {
        usersGrowth: '+15%',
        volumeGrowth: '+8%',
        commissionGrowth: '+12%'
      },
      rankings: {
        volumeRank: 3,
        usersRank: 5,
        conversionRank: 2
      }
    };
  }

  async approveAgent(agentId: string, approvalData: any) {
    // Update agent status to approved
    return {
      success: true,
      message: 'Agent approved successfully',
      agentId,
      newLevel: approvalData.level,
      commissionRate: approvalData.commissionRate
    };
  }

  async rejectAgent(agentId: string, rejectionData: any) {
    return {
      success: true,
      message: 'Agent rejected',
      agentId,
      reason: rejectionData.reason
    };
  }

  async updateCommissionRate(agentId: string, commissionData: any) {
    return {
      success: true,
      message: 'Commission rate updated successfully',
      agentId,
      oldRate: 250,
      newRate: commissionData.commissionRate,
      effectiveDate: commissionData.effectiveDate || new Date().toISOString()
    };
  }

  async updateAgentLevel(agentId: string, levelData: any) {
    return {
      success: true,
      message: 'Agent level updated successfully',
      agentId,
      oldLevel: 2,
      newLevel: levelData.newLevel
    };
  }

  async toggleAgentStatus(agentId: string, statusData: any) {
    return {
      success: true,
      message: `Agent ${statusData.action === 'ban' ? 'banned' : 'unbanned'} successfully`,
      agentId,
      newStatus: statusData.action === 'ban' ? 'inactive' : 'active'
    };
  }

  async batchUpdateAgents(batchData: any) {
    return {
      success: true,
      message: `Batch ${batchData.action} completed`,
      processedCount: batchData.agentIds.length,
      results: batchData.agentIds.map(id => ({
        agentId: id,
        status: 'success',
        action: batchData.action
      }))
    };
  }

  async getAgentTeam(agentId: string) {
    return {
      agentId,
      directAgents: [
        {
          id: 'agt-002',
          email: 'agent2@example.com',
          referralCode: 'AGT002',
          level: 2,
          status: 'active',
          totalUsers: 23,
          monthlyCommission: 2800
        }
      ],
      directUsers: [
        {
          id: 'usr-001',
          email: 'user1@example.com',
          referralCode: 'QA001',
          totalOrders: 5,
          totalVolume: 50000,
          joinedAt: '2024-01-10T00:00:00Z'
        }
      ],
      teamStats: {
        totalAgents: 3,
        totalUsers: 45,
        totalVolume: 1250000,
        teamCommission: 37500
      }
    };
  }

  async calculateAgentCommission(agentId: string, calculationData: any) {
    return {
      agentId,
      period: calculationData.period,
      calculation: {
        baseCommission: 5200,
        bonusCommission: 800,
        totalCommission: 6000,
        commissionRate: 3.0,
        volume: 200000
      },
      breakdown: [
        {
          source: 'direct_users',
          volume: 120000,
          commission: 3600,
          rate: 3.0
        },
        {
          source: 'sub_agents',
          volume: 80000,
          commission: 1600,
          rate: 2.0
        }
      ]
    };
  }

  async exportAgents(exportData: any) {
    return {
      success: true,
      message: 'Export completed successfully',
      format: exportData.format,
      recordCount: this.mockAgents.length,
      downloadUrl: '/api/downloads/agents-export.csv',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  }

  async getAgentAuditTrail(agentId: string) {
    return {
      agentId,
      events: [
        {
          id: 'audit-001',
          timestamp: '2024-01-20T10:30:00Z',
          action: 'commission_updated',
          adminId: 'admin-001',
          details: {
            oldRate: 250,
            newRate: 300,
            reason: 'Performance bonus'
          }
        },
        {
          id: 'audit-002',
          timestamp: '2024-01-15T09:15:00Z',
          action: 'agent_approved',
          adminId: 'admin-001',
          details: {
            level: 1,
            initialCommissionRate: 250
          }
        }
      ]
    };
  }

  async getAgentPayouts(agentId: string, pagination: any) {
    return {
      agentId,
      payouts: [
        {
          id: 'payout-001',
          period: '2024-01',
          amount: 5200,
          status: 'paid',
          paidAt: '2024-02-01T00:00:00Z',
          transactionId: 'txn-001'
        },
        {
          id: 'payout-002',
          period: '2024-02',
          amount: 5800,
          status: 'pending',
          scheduledAt: '2024-03-01T00:00:00Z'
        }
      ],
      pagination: {
        total: 12,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(12 / pagination.limit)
      }
    };
  }

  async getAgentProfile(userId: string) {
    return {
      userId,
      isAgent: true,
      agentData: this.mockAgents[0],
      teamInfo: {
        directAgents: 3,
        totalUsers: 45,
        monthlyCommission: 5200
      }
    };
  }

  async submitAgentApplication(applicationData: any) {
    return {
      success: true,
      message: 'Agent application submitted successfully',
      applicationId: 'app-' + Date.now(),
      status: 'pending',
      estimatedReviewTime: '3-5 business days'
    };
  }
}