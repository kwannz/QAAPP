'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  CreditCard,
  Clock,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
// keep alias imports grouped after relative ones


import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { FilterPanel } from '../../../components/common/FilterPanel';
import { TabContainer } from '../../../components/common/TabContainer';
import { Header } from '../../../components/layout/Header';
import { useAuthStore } from '../../../lib/auth-context';
import { logger } from '@/lib/verbose-logger';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface ActivityLog {
  id: string
  type: 'AUTH' | 'SECURITY' | 'PROFILE' | 'FINANCIAL' | 'SYSTEM'
  action: string
  status: 'SUCCESS' | 'FAILED' | 'WARNING'
  description: string
  timestamp: string
  details: {
    ip?: string
    device?: string
    location?: string
  }
}

interface Transaction {
  id: string
  type: 'INVESTMENT' | 'WITHDRAWAL' | 'COMMISSION' | 'REFUND' | 'TRANSFER' | 'REWARD'
  direction: 'IN' | 'OUT'
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  description: string
  timestamp: string
  fee?: number
  hash?: string
}

// 模拟数据
const mockActivities: ActivityLog[] = [
  {
    id: 'act-001',
    type: 'AUTH',
    action: '登录',
    status: 'SUCCESS',
    description: '用户成功登录',
    timestamp: '2024-03-15T10:30:00Z',
    details: { ip: '192.168.1.100', device: 'Chrome 浏览器', location: '上海' },
  },
  {
    id: 'act-002',
    type: 'FINANCIAL',
    action: '投资',
    status: 'SUCCESS',
    description: '购买QA黄金卡产品',
    timestamp: '2024-03-15T09:15:00Z',
    details: { ip: '192.168.1.100' },
  },
  {
    id: 'act-003',
    type: 'SECURITY',
    action: '密码修改',
    status: 'SUCCESS',
    description: '用户修改登录密码',
    timestamp: '2024-03-14T16:20:00Z',
    details: { ip: '192.168.1.100', device: 'iPhone Safari' },
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    type: 'INVESTMENT',
    direction: 'OUT',
    amount: 10_000,
    currency: 'USDT',
    status: 'COMPLETED',
    description: '购买QA黄金卡',
    timestamp: '2024-03-15T09:15:00Z',
    fee: 5,
    hash: '0x1234...abcd',
  },
  {
    id: 'tx-002',
    type: 'COMMISSION',
    direction: 'IN',
    amount: 250.5,
    currency: 'USDT',
    status: 'COMPLETED',
    description: '推荐佣金',
    timestamp: '2024-03-14T14:30:00Z',
  },
  {
    id: 'tx-003',
    type: 'WITHDRAWAL',
    direction: 'IN',
    amount: 1500,
    currency: 'USDT',
    status: 'PENDING',
    description: '收益提取',
    timestamp: '2024-03-14T11:20:00Z',
    fee: 10,
  },
];

export default function UserActivityCenter() {
  const { user: _user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, _setActivities] = useState<ActivityLog[]>(mockActivities);
  const [transactions, _setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    type: 'all',
    status: 'all',
    period: '7days',
  });

  const tabs = [
    {
      id: 'overview',
      label: '概览',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: 'activities',
      label: '账户活动',
      icon: <Shield className="h-4 w-4" />,
      badge: activities.length.toString(),
    },
    {
      id: 'transactions',
      label: '交易记录',
      icon: <CreditCard className="h-4 w-4" />,
      badge: transactions.length.toString(),
    },
  ];

  const activityFilters = [
    {
      id: 'type',
      label: '活动类型',
      type: 'select' as const,
      options: [
        { value: 'AUTH', label: '登录认证', count: 45 },
        { value: 'FINANCIAL', label: '金融操作', count: 23 },
        { value: 'SECURITY', label: '安全操作', count: 12 },
        { value: 'PROFILE', label: '账户设置', count: 8 },
      ],
    },
    {
      id: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { value: 'SUCCESS', label: '成功', count: 88 },
        { value: 'FAILED', label: '失败', count: 5 },
        { value: 'WARNING', label: '警告', count: 2 },
      ],
    },
    {
      id: 'period',
      label: '时间范围',
      type: 'select' as const,
      options: [
        { value: '7days', label: '最近7天' },
        { value: '30days', label: '最近30天' },
        { value: '90days', label: '最近3个月' },
      ],
    },
  ];

  const transactionFilters = [
    {
      id: 'type',
      label: '交易类型',
      type: 'select' as const,
      options: [
        { value: 'INVESTMENT', label: '投资', count: 15 },
        { value: 'WITHDRAWAL', label: '提现', count: 8 },
        { value: 'COMMISSION', label: '佣金', count: 12 },
        { value: 'REWARD', label: '奖励', count: 5 },
      ],
    },
    {
      id: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { value: 'COMPLETED', label: '已完成', count: 35 },
        { value: 'PENDING', label: '处理中', count: 3 },
        { value: 'FAILED', label: '失败', count: 2 },
      ],
    },
  ];

  // 动画与显示常量
  const TIMELINE_PREVIEW_COUNT = 10;
  const ANIM_DELAY_STEP = 0.1;

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'FAILED') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (status === 'WARNING') return <AlertTriangle className="h-4 w-4 text-yellow-600" />;

    switch (type) {
      case 'AUTH': { return <Shield className="h-4 w-4 text-blue-600" />;
      }
      case 'FINANCIAL': { return <CreditCard className="h-4 w-4 text-green-600" />;
      }
      case 'SECURITY': { return <Shield className="h-4 w-4 text-purple-600" />;
      }
      default: { return <Activity className="h-4 w-4 text-gray-600" />;
      }
    }
  };

  const getTransactionIcon = (type: string, direction: string) => {
    if (direction === 'IN') {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    }
      return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 活动概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">最近活动</p>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总交易</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">成功率</p>
              <p className="text-2xl font-bold">95.8%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">最后活动</p>
              <p className="text-2xl font-bold">刚刚</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* 最近活动时间线 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...activities, ...transactions.map(tx => ({
              id: tx.id,
              type: 'FINANCIAL',
              action: tx.type,
              status: tx.status === 'COMPLETED' ? 'SUCCESS' as const : 'WARNING' as const,
              description: tx.description,
              timestamp: tx.timestamp,
              details: { amount: tx.amount },
            }))].slice(0, TIMELINE_PREVIEW_COUNT).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * ANIM_DELAY_STEP }}
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(item.type, item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className={`flex-shrink-0 text-xs px-2 py-1 rounded ${
                  item.status === 'SUCCESS'
? 'bg-green-100 text-green-800'
                  : (item.status === 'FAILED'
? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800')
                }`}
                >
                  {item.status === 'SUCCESS' && '成功'}
                  {item.status === 'FAILED' && '失败'}
                  {item.status === 'WARNING' && '警告'}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivities = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>账户活动记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * ANIM_DELAY_STEP }}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      activity.status === 'SUCCESS'
? 'bg-green-100 text-green-800'
                      : (activity.status === 'FAILED'
? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800')
                    }`}
                    >
                      {activity.status === 'SUCCESS' && '成功'}
                      {activity.status === 'FAILED' && '失败'}
                      {activity.status === 'WARNING' && '警告'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString('zh-CN')}
                  </p>
                  {activity.details && (
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      {activity.details.ip && <p>IP: {activity.details.ip}</p>}
                      {activity.details.device && <p>设备: {activity.details.device}</p>}
                      {activity.details.location && <p>位置: {activity.details.location}</p>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      {/* 交易统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总收入</p>
              <p className="text-2xl font-bold text-green-600">
                +¥{transactions.filter(tx => tx.direction === 'IN').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总支出</p>
              <p className="text-2xl font-bold text-red-600">
                -¥{transactions.filter(tx => tx.direction === 'OUT').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">待处理</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transactions.filter(tx => tx.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* 交易列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>交易记录</span>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * ANIM_DELAY_STEP }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type, transaction.direction)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString('zh-CN')}
                    </p>
                    {transaction.hash && (
                      <p className="text-xs text-blue-600 font-mono">
                        {transaction.hash}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    transaction.direction === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}
                  >
                    {transaction.direction === 'IN' ? '+' : '-'}
                    ¥{transaction.amount.toLocaleString()}
                    {transaction.currency && transaction.currency !== 'CNY' && ` ${transaction.currency}`}
                  </p>
                  <div className={`text-xs px-2 py-1 rounded mt-1 ${
                    transaction.status === 'COMPLETED'
? 'bg-green-100 text-green-800'
                    : transaction.status === 'PENDING'
? 'bg-yellow-100 text-yellow-800'
                    : transaction.status === 'FAILED'
? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}
                  >
                    {transaction.status === 'COMPLETED' && '已完成'}
                    {transaction.status === 'PENDING' && '处理中'}
                    {transaction.status === 'FAILED' && '失败'}
                    {transaction.status === 'CANCELLED' && '已取消'}
                  </div>
                  {transaction.fee && (
                    <p className="text-xs text-gray-500 mt-1">
                      手续费: ¥{transaction.fee}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': {
        return renderOverview();
      }
      case 'activities': {
        return renderActivities();
      }
      case 'transactions': {
        return renderTransactions();
      }
      default: {
        return renderOverview();
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">活动中心</h1>
                <p className="text-gray-600">账户活动记录和交易历史</p>
              </div>

              <FilterPanel
                filters={activeTab === 'transactions' ? transactionFilters : activityFilters}
                values={filterValues}
                onChange={setFilterValues}
                searchPlaceholder={
                  activeTab === 'transactions' ? '搜索交易记录...' : '搜索活动记录...'
                }
                onExport={() => {
                  if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
                    logger.info('ActivityCenter', '导出数据');
                  }
                }}
              />

              <TabContainer
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              >
                {renderTabContent()}
              </TabContainer>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
