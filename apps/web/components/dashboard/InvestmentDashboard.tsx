'use client';

import {
  TrendingUp,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  PieChart,
  BarChart3,
  Wallet,
  Clock,
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { logger } from '@/lib/verbose-logger';

import { PayoutDashboard } from '@/components/payouts/PayoutDashboard';
import { UserPositions } from '@/components/positions/UserPositions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import apiClient from '@/lib/api-client';

// 类型定义
interface DashboardStats {
  totalInvested: number
  totalEarnings: number
  activePositions: number
  claimableAmount: number
  totalROI: number
  averageAPR: number
}

interface InvestmentDashboardProperties {
  userId?: string
  className?: string
  stats?: any
  positions?: any[]
  onClaimRewards?: () => void
  onViewPosition?: (positionId: string) => void
}

export function InvestmentDashboard({ userId = 'user-test-001', className = '' }: InvestmentDashboardProperties) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 获取仪表板统计数据 - 使用useCallback优化
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 并行获取持仓和收益数据
      const [{ data: positionsData }, { data: payoutsData }] = await Promise.all([
        apiClient.get(`/positions/user/${userId}`),
        apiClient.get(`/payouts/user/${userId}/claimable`),
      ]);

      // 计算汇总统计
      const summary = positionsData.summary || {};
      const totalInvested = summary.totalPrincipal || 0;
      const totalEarnings = summary.totalPaid || 0;
      const activePositions = summary.totalActive || 0;
      const claimableAmount = payoutsData.totalAmount || 0;
      const totalROI = totalInvested > 0 ? (totalEarnings / totalInvested) * PERCENT_SCALE : 0;

      // 计算平均APR (简化计算)
      const averageAPR = 10.5; // 临时值，实际应该从持仓数据计算

      setStats({
        totalInvested,
        totalEarnings,
        activePositions,
        claimableAmount,
        totalROI,
        averageAPR,
      });
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : '获取数据时发生未知错误');
      logger.error('InvestmentDashboard', 'Failed to fetch dashboard stats', error_);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初始化数据
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // 计算衍生数据 - 使用useMemo优化
  const computedStats = useMemo(() => {
    if (!stats) return null;
    
    return {
      totalPortfolioValue: stats.totalInvested + stats.totalEarnings,
      monthlyReturn: stats.averageAPR / MONTHS_PER_YEAR,
      investmentRatio: stats.totalInvested > 0 
        ? (stats.totalInvested / (stats.totalInvested + stats.totalEarnings)) * PERCENT_SCALE 
        : 0,
      earningsRatio: stats.totalInvested > 0 
        ? (stats.totalEarnings / (stats.totalInvested + stats.totalEarnings)) * PERCENT_SCALE 
        : 0,
      investmentDays: Math.floor(Math.random() * RANDOM_DAYS_MAX) + RANDOM_DAYS_MIN, // 临时值，实际应从API获取
    };
  }, [stats]);

  // 渲染概览统计卡片 - 使用useMemo优化重渲染
  const renderStatsCards = useMemo(() => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总投资额</p>
                <p className="text-2xl font-bold">${stats.totalInvested.toFixed(DECIMALS_TWO)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activePositions} 个活跃持仓
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">累计收益</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(DECIMALS_TWO)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  收益率 {stats.totalROI.toFixed(DECIMALS_TWO)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">可领取收益</p>
                <p className="text-2xl font-bold text-yellow-600">${stats.claimableAmount.toFixed(DECIMALS_SIX)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  待领取
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均年化</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageAPR.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  预期回报
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }, [stats]);

  // 渲染快速操作面板 - 使用useMemo和computedStats优化
  const renderQuickActions = useMemo(() => {
    if (!stats || !computedStats) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            投资概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">总投资组合价值</h4>
              <p className="text-2xl font-bold text-orange-600">
                ${computedStats.totalPortfolioValue.toFixed(DECIMALS_TWO)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+{stats.totalROI.toFixed(DECIMALS_TWO)}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">月化收益率</h4>
              <p className="text-2xl font-bold text-green-600">
                {computedStats.monthlyReturn.toFixed(DECIMALS_TWO)}%
              </p>
              <p className="text-xs text-green-600">基于年化{stats.averageAPR}%</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">投资天数</h4>
              <p className="text-2xl font-bold text-purple-600">
                {computedStats.investmentDays}天
              </p>
              <p className="text-xs text-purple-600">平均持有期</p>
            </div>
          </div>

          {stats.claimableAmount > 0 && (
            <Alert className="mt-4 border-yellow-200 bg-yellow-50">
              <Wallet className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                您有 <strong>${stats.claimableAmount.toFixed(DECIMALS_SIX)}</strong> 的收益可以领取！
                <Button
                  size="sm"
                  className="ml-2"
                  onClick={() => setActiveTab('payouts')}
                >
                  立即领取
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }, [stats, computedStats, setActiveTab]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">投资仪表板</h1>
          <p className="text-gray-600 mt-1">管理您的投资持仓和收益</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardStats}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading
? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg">加载数据中...</span>
          </div>
        </div>
      )
: (
        <>
          {renderStatsCards}
          {renderQuickActions}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                投资概览
              </TabsTrigger>
              <TabsTrigger value="positions" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                我的持仓
              </TabsTrigger>
              <TabsTrigger value="payouts" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                收益管理
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      投资分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>投资本金</span>
                          <span>${stats?.totalInvested.toFixed(DECIMALS_TWO)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${computedStats?.investmentRatio || 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>累计收益</span>
                          <span className="text-green-600">${stats?.totalEarnings.toFixed(DECIMALS_TWO)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${computedStats?.earningsRatio || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      近期活动
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 p-2 bg-orange-50 rounded">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span>新投资持仓创建成功</span>
                        <span className="text-xs text-gray-500 ml-auto">2小时前</span>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>收益已生成，可领取</span>
                        <span className="text-xs text-gray-500 ml-auto">1天前</span>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>投资产品即将到期</span>
                        <span className="text-xs text-gray-500 ml-auto">3天前</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="mt-6">
              <UserPositions userId={userId} />
            </TabsContent>

            <TabsContent value="payouts" className="mt-6">
              <PayoutDashboard userId={userId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
  const PERCENT_SCALE = 100;
  const MONTHS_PER_YEAR = 12;
  const RANDOM_DAYS_MAX = 30;
  const RANDOM_DAYS_MIN = 15;
  const DECIMALS_TWO = 2;
  const DECIMALS_SIX = 6;
