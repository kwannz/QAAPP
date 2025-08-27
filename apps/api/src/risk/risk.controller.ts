import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiskEngineService, WithdrawalRiskInput } from './risk-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('risk')
@Controller('risk')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RiskController {
  constructor(private readonly riskEngineService: RiskEngineService) {}

  @Post('assessment')
  @ApiOperation({ summary: 'Perform risk assessment for withdrawal' })
  @Roles('admin')
  async performRiskAssessment(@Body() input: WithdrawalRiskInput) {
    return this.riskEngineService.performComprehensiveRiskAssessment(input);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get risk items' })
  @Roles('admin')
  async getRiskItems(@Query('category') category?: string) {
    // Mock risk items data for the frontend
    const mockRiskItems = [
      {
        id: 'risk-001',
        title: '大额提现风险',
        description: '用户申请提现金额超过平均值5倍',
        category: 'financial',
        severity: 'high',
        status: 'active',
        affectedUsers: 12,
        potentialLoss: 250000,
        probability: 0.75,
        impact: 0.85,
        riskScore: 63.75,
        createdAt: new Date('2024-01-27T10:00:00Z'),
        updatedAt: new Date('2024-01-27T14:30:00Z'),
        assignedTo: 'admin-001',
        mitigationPlan: '加强大额提现审核流程',
        metadata: {
          withdrawalThreshold: 50000,
          averageAmount: 10000,
          detectedCount: 12
        }
      },
      {
        id: 'risk-002',
        title: 'KYC过期用户活跃度异常',
        description: '多个KYC过期用户近期交易活跃',
        category: 'compliance',
        severity: 'medium',
        status: 'monitoring',
        affectedUsers: 45,
        potentialLoss: 150000,
        probability: 0.60,
        impact: 0.55,
        riskScore: 33.0,
        createdAt: new Date('2024-01-26T15:20:00Z'),
        updatedAt: new Date('2024-01-27T12:00:00Z'),
        assignedTo: 'admin-002',
        mitigationPlan: '要求用户更新KYC认证',
        metadata: {
          expiredUsers: 45,
          averageActivity: 2.5,
          threshold: 5.0
        }
      }
    ];

    return {
      items: category ? mockRiskItems.filter(item => item.category === category) : mockRiskItems,
      total: mockRiskItems.length,
      categories: ['financial', 'compliance', 'technical', 'operational']
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get risk trends' })
  @Roles('admin')
  async getRiskTrends(@Query('period') period: string = '30d') {
    // Mock risk trends data
    const mockTrends = {
      overview: {
        totalRisks: 28,
        highRisks: 8,
        mediumRisks: 12,
        lowRisks: 8,
        trendDirection: 'decreasing',
        changePercentage: -5.2
      },
      timeline: [
        { date: '2024-01-20', high: 10, medium: 15, low: 5 },
        { date: '2024-01-21', high: 9, medium: 14, low: 6 },
        { date: '2024-01-22', high: 11, medium: 13, low: 7 },
        { date: '2024-01-23', high: 8, medium: 16, low: 8 },
        { date: '2024-01-24', high: 7, medium: 14, low: 9 },
        { date: '2024-01-25', high: 9, medium: 12, low: 7 },
        { date: '2024-01-26', high: 8, medium: 13, low: 8 },
        { date: '2024-01-27', high: 8, medium: 12, low: 8 }
      ],
      categories: {
        financial: { current: 12, trend: 'stable' },
        compliance: { current: 8, trend: 'decreasing' },
        technical: { current: 5, trend: 'increasing' },
        operational: { current: 3, trend: 'stable' }
      }
    };

    return mockTrends;
  }

  @Get('scenarios')
  @ApiOperation({ summary: 'Get risk scenarios' })
  @Roles('admin')
  async getRiskScenarios() {
    // Mock risk scenarios data
    const mockScenarios = [
      {
        id: 'scenario-001',
        name: '市场暴跌情境',
        description: '加密货币市场整体下跌30%时的风险评估',
        probability: 0.25,
        impact: 'high',
        potentialLoss: 500000,
        timeframe: '1-7天',
        triggers: ['市场波动率>50%', 'BTC跌幅>25%', '大量提现请求'],
        mitigationStrategies: [
          '暂停大额提现',
          '增加风险监控频率',
          '启动应急资金池'
        ],
        status: 'active',
        lastUpdated: new Date('2024-01-27T10:00:00Z')
      },
      {
        id: 'scenario-002',
        name: '系统性欺诈攻击',
        description: '协调性的大规模欺诈攻击情境',
        probability: 0.15,
        impact: 'critical',
        potentialLoss: 1000000,
        timeframe: '数小时',
        triggers: ['异常大量新注册', '相似IP地址集中', '批量KYC申请'],
        mitigationStrategies: [
          '暂停新用户注册',
          '加强身份验证',
          '启动人工审核'
        ],
        status: 'monitoring',
        lastUpdated: new Date('2024-01-26T16:30:00Z')
      }
    ];

    return {
      scenarios: mockScenarios,
      total: mockScenarios.length
    };
  }

  @Post('scenarios/:id/simulate')
  @ApiOperation({ summary: 'Simulate risk scenario' })
  @Roles('admin')
  async simulateRiskScenario(@Param('id') scenarioId: string) {
    // Mock scenario simulation
    return {
      scenarioId,
      simulationId: `sim-${Date.now()}`,
      results: {
        estimatedImpact: 0.75,
        affectedUsers: 1250,
        estimatedLoss: 375000,
        timeToContainment: '2-4小时',
        resourcesRequired: ['风控团队', '技术支持', '客服团队'],
        recommendations: [
          '立即启动应急预案',
          '通知相关监管机构',
          '准备用户沟通方案'
        ]
      },
      status: 'completed',
      simulatedAt: new Date()
    };
  }
}