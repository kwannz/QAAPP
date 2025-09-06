'use client';

import {
  Coins,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Wallet,
  History,
} from 'lucide-react';
import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';

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
  Checkbox,
} from '@/components/ui';

// 类型定义
interface Payout {
  id: string
  userId: string
  positionId: string
  amount: number
  periodStart: string
  periodEnd: string
  isClaimable: boolean
  claimedAt?: string
  claimTxHash?: string
  createdAt: string
  updatedAt: string
}

interface ClaimablePayoutsData {
  payouts: Payout[]
  totalAmount: number
}

interface PayoutHistoryData {
  payouts: Payout[]
  total: number
  totalClaimed: number
  totalPending: number
}

interface PayoutDashboardProperties {
  userId?: string
  className?: string
}

// 优化的收益项组件
const PayoutItem = memo(({
  payout,
  isSelected,
  onSelectionChange,
}: {
  payout: Payout,
  isSelected: boolean,
  onSelectionChange: (id: string, checked: boolean) => void
}) => (
  <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-orange-50' : 'hover:shadow-md'}`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(payout.id, checked)}
          />

          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-lg">
                ${payout.amount.toFixed(6)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              收益期间: {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              持仓ID: {payout.positionId}
            </p>
          </div>
        </div>

        <div className="text-right">
          <Badge variant="default" className="mb-1">
            可领取
          </Badge>
          <p className="text-xs text-gray-500">
            {new Date(payout.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
));

PayoutItem.displayName = 'PayoutItem';

export function PayoutDashboard({ userId = 'user-test-001', className = '' }: PayoutDashboardProperties) {
  const [claimableData, setClaimableData] = useState<ClaimablePayoutsData | null>(null);
  const [historyData, setHistoryData] = useState<PayoutHistoryData | null>(null);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('claimable');

  // 获取可领取收益
  const fetchClaimablePayouts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { apiClient } = await import('@/lib/api-client');
      const { data } = await apiClient.get(`/payouts/user/${userId}/claimable`);
      setClaimableData(data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : '获取数据时发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 获取收益历史
  const fetchPayoutHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const { apiClient } = await import('@/lib/api-client');
      const { data } = await apiClient.get(`/payouts/user/${userId}/history`);
      setHistoryData(data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : '获取数据时发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (activeTab === 'claimable') {
      fetchClaimablePayouts();
    } else {
      fetchPayoutHistory();
    }
  }, [userId, activeTab]);

  // 处理收益选择
  const handlePayoutSelection = useCallback((payoutId: string, checked: boolean) => {
    setSelectedPayouts(previous => {
      if (checked) {
        return [...previous, payoutId];
      }
        return previous.filter(id => id !== payoutId);
    });
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && claimableData) {
      setSelectedPayouts(claimableData.payouts.map(p => p.id));
    } else {
      setSelectedPayouts([]);
    }
  }, [claimableData]);

  // 领取选中的收益
  const handleClaimSelected = async () => {
    if (selectedPayouts.length === 0) {
      alert('请选择要领取的收益');
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      const { apiClient } = await import('@/lib/api-client');
      const { data: result } = await apiClient.post('/payouts/claim', { userId, payoutIds: selectedPayouts });
      alert(`领取成功！\n金额: $${result.claimedAmount.toFixed(6)}\n交易哈希: ${result.txHash}`);

      // 重置选择并刷新数据
      setSelectedPayouts([]);
      fetchClaimablePayouts();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : '领取失败');
    } finally {
      setClaiming(false);
    }
  };

  // 计算选中的收益总额
  const selectedAmount = useMemo(() => {
    if (!claimableData) return 0;
    return claimableData.payouts
      .filter(p => selectedPayouts.includes(p.id))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [claimableData, selectedPayouts]);


  // 渲染历史收益项
  const renderHistoryPayout = (payout: Payout) => {
    return (
      <Card key={payout.id}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${payout.isClaimable ? 'bg-green-500' : 'bg-gray-400'}`} />

              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-lg">
                    ${payout.amount.toFixed(6)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  收益期间: {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                </p>
                {payout.claimTxHash && (
                  <p className="text-xs text-orange-600 break-all">
                    交易: {payout.claimTxHash}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <Badge variant={payout.isClaimable ? 'default' : 'secondary'}>
                {payout.isClaimable ? '待领取' : '已领取'}
              </Badge>
              {payout.claimedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(payout.claimedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染汇总统计
  const renderSummaryStats = () => {
    const claimableTotal = claimableData?.totalAmount || 0;
    const totalClaimed = historyData?.totalClaimed || 0;
    const totalPending = historyData?.totalPending || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">可领取收益</p>
                <p className="text-xl font-semibold text-green-600">
                  ${claimableTotal.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">累计已领</p>
                <p className="text-xl font-semibold">
                  ${totalClaimed.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">总收益</p>
                <p className="text-xl font-semibold">
                  ${(totalClaimed + totalPending).toFixed(6)}
                </p>
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
        <h2 className="text-2xl font-bold">收益管理</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => activeTab === 'claimable' ? fetchClaimablePayouts() : fetchPayoutHistory()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {renderSummaryStats()}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="claimable" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            可领取收益
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            收益历史
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claimable" className="mt-4">
          {claimableData && claimableData.payouts.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedPayouts.length === claimableData.payouts.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">
                    已选择 {selectedPayouts.length} 项收益
                    {selectedPayouts.length > 0 && (
                      <span className="font-semibold ml-2">
                        (${selectedAmount.toFixed(6)})
                      </span>
                    )}
                  </span>
                </div>

                <Button
                  onClick={handleClaimSelected}
                  disabled={selectedPayouts.length === 0 || claiming}
                  className="flex items-center gap-2"
                >
                  {claiming
? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )
: (
                    <Download className="w-4 h-4" />
                  )}
                  {claiming ? '领取中...' : '领取选中'}
                </Button>
              </div>
            </div>
          )}

          {loading
? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>加载中...</span>
              </div>
            </div>
          )
: (claimableData?.payouts.length === 0
? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">暂无可领取收益</h3>
                  <p>您当前没有可领取的收益</p>
                </div>
              </CardContent>
            </Card>
          )
: (
            <div className="space-y-3">
              {claimableData?.payouts.map(payout => (
                <PayoutItem
                  key={payout.id}
                  payout={payout}
                  isSelected={selectedPayouts.includes(payout.id)}
                  onSelectionChange={handlePayoutSelection}
                />
              ))}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {loading
? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>加载中...</span>
              </div>
            </div>
          )
: (historyData?.payouts.length === 0
? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">暂无收益记录</h3>
                  <p>您还没有任何收益记录</p>
                </div>
              </CardContent>
            </Card>
          )
: (
            <div className="space-y-3">
              {historyData?.payouts.map(renderHistoryPayout)}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
