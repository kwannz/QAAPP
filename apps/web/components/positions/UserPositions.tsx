'use client';

import {
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import apiClient from '@/lib/api-client';
import { logger } from '@/lib/verbose-logger';

// 类型定义
interface Position {
  id: string
  userId: string
  productId: string
  orderId: string
  principal: number
  startDate: string
  endDate: string
  nextPayoutAt?: string
  nftTokenId?: number
  status: 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED'
  totalPaid: number
  lastPayoutAt?: string
  maturityAmount?: number
  metadata?: {
    productSymbol: string
    productName: string
    aprBps: number
    lockDays: number
    paymentType: string
    txHash?: string
  }
  createdAt: string
  updatedAt: string
}

interface PositionSummary {
  totalActive: number
  totalPrincipal: number
  totalPaid: number
  estimatedTotal: number
}

interface UserPositionsData {
  positions: Position[]
  total: number
  summary: PositionSummary
}

interface UserPositionsProperties {
  userId?: string
  className?: string
}

export function UserPositions({ userId = 'user-test-001', className = '' }: UserPositionsProperties) {
  const [positionsData, setPositionsData] = useState<UserPositionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('active');
  const DECIMALS_TWO = 2;
  const MS_PER_SEC = 1000;
  const SEC_PER_MIN = 60;
  const MIN_PER_HOUR = 60;
  const HOURS_PER_DAY = 24;
  const DAYS_LOW_WARNING = 3;

  // 获取用户持仓数据
  const fetchPositions = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const parameters: Record<string, any> = {};
      if (status && status !== 'all') parameters.status = status.toUpperCase();
      const { data } = await apiClient.get(`/positions/user/${userId}`, { params: parameters });
      setPositionsData(data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : '获取数据时发生未知错误');
      logger.error('UserPositions', 'Failed to fetch positions', { error: error_ });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初始化和刷新
  useEffect(() => {
    fetchPositions(selectedTab);
  }, [selectedTab, fetchPositions]);

  // 持仓赎回
  const handleRedeem = async (positionId: string) => {
    try {
      const { data: result } = await apiClient.post(`/positions/${positionId}/redeem`, { userId });
      alert(`赎回成功！赎回金额: $${result.redeemAmount.toFixed(DECIMALS_TWO)}`);

      // 刷新数据
      fetchPositions(selectedTab);
    } catch (error_) {
      alert(`赎回失败: ${error_ instanceof Error ? error_.message : '未知错误'}`);
    }
  };

  // 格式化状态
  const getStatusBadge = (status: Position['status']) => {
    const statusConfig = {
      ACTIVE: { label: '活跃中', variant: 'default' as const, icon: <TrendingUp className="w-3 h-3" /> },
      REDEEMING: { label: '可赎回', variant: 'secondary' as const, icon: <Target className="w-3 h-3" /> },
      CLOSED: { label: '已关闭', variant: 'outline' as const, icon: <CheckCircle2 className="w-3 h-3" /> },
      DEFAULTED: { label: '违约', variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // 计算剩余天数
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / (MS_PER_SEC * SEC_PER_MIN * MIN_PER_HOUR * HOURS_PER_DAY)),
    );
    return diff;
  };

  // 计算收益率
  const calculateCurrentYield = (totalPaid: number, principal: number) => {
    const PERCENT_SCALE = 100;
    return principal > 0 ? (totalPaid / principal) * PERCENT_SCALE : 0;
  };

  // 渲染持仓卡片
  const renderPositionCard = (position: Position) => {
    const daysRemaining = getDaysRemaining(position.endDate);
    const currentYield = calculateCurrentYield(position.totalPaid, position.principal);
    const PERCENT_SCALE = 100;
    const expectedAPR = position.metadata?.aprBps ? position.metadata.aprBps / PERCENT_SCALE : 0;

    return (
      <Card key={position.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {(position.metadata as any)?.nftTokenId && (
                  <Award className="w-4 h-4 text-yellow-500" />
                )}
                {position.metadata?.productName || `产品 ${position.productId}`}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                订单: {position.orderId}
              </p>
            </div>
            {getStatusBadge(position.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 核心数据 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <DollarSign className="w-3 h-3" />
                本金
              </div>
              <div className="text-xl font-semibold">
                ${position.principal.toFixed(DECIMALS_TWO)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <TrendingUp className="w-3 h-3" />
                已获收益
              </div>
              <div className="text-xl font-semibold text-green-600">
                ${position.totalPaid.toFixed(DECIMALS_TWO)}
              </div>
            </div>
          </div>

          {/* 收益信息 */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">当前收益率</span>
              <span className="font-medium text-green-600">
                {currentYield.toFixed(DECIMALS_TWO)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">预期年化</span>
              <span className="font-medium">
                {expectedAPR.toFixed(DECIMALS_TWO)}%
              </span>
            </div>
            {position.maturityAmount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">到期金额</span>
                <span className="font-medium">
                  ${position.maturityAmount.toFixed(DECIMALS_TWO)}
                </span>
              </div>
            )}
          </div>

          {/* 时间信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-3 h-3" />
                投资期限
              </div>
              <span>{position.metadata?.lockDays || 0}天</span>
            </div>

            {position.status === 'ACTIVE' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-3 h-3" />
                  剩余天数
                </div>
              <span className={daysRemaining <= DAYS_LOW_WARNING ? 'text-orange-600 font-medium' : ''}>
                {daysRemaining}天
              </span>
              </div>
            )}

            {position.lastPayoutAt && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">最近收益</span>
                <span>{new Date(position.lastPayoutAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          {position.status === 'REDEEMING' && (
            <Button
              onClick={async () => handleRedeem(position.id)}
              className="w-full"
              variant="default"
            >
              立即赎回
            </Button>
          )}

          {position.metadata?.txHash && (
            <div className="text-xs text-gray-500 break-all">
              交易哈希: {position.metadata.txHash}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 渲染汇总信息
  const renderSummary = () => {
    if (!positionsData?.summary) return null;

    const { summary } = positionsData;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">活跃持仓</p>
                <p className="text-xl font-semibold">{summary.totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">总本金</p>
                <p className="text-xl font-semibold">${summary.totalPrincipal.toFixed(DECIMALS_TWO)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">累计收益</p>
                <p className="text-xl font-semibold text-green-600">${summary.totalPaid.toFixed(DECIMALS_TWO)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">预期总值</p>
                <p className="text-xl font-semibold">${summary.estimatedTotal.toFixed(DECIMALS_TWO)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">我的持仓</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => fetchPositions(selectedTab)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {renderSummary()}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">活跃中</TabsTrigger>
          <TabsTrigger value="redeeming">可赎回</TabsTrigger>
          <TabsTrigger value="closed">已关闭</TabsTrigger>
          <TabsTrigger value="all">全部</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {loading
? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>加载中...</span>
              </div>
            </div>
          )
: (positionsData?.positions.length === 0
? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">暂无持仓记录</h3>
                  <p>您还没有任何投资持仓，开始您的第一笔投资吧！</p>
                </div>
              </CardContent>
            </Card>
          )
: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionsData?.positions.map(renderPositionCard)}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
