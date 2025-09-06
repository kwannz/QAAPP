import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface DashboardPosition {
  id: string
  productName: string
  productType: 'silver' | 'gold' | 'diamond'
  principal: number
  currentValue: number
  apr: number
  startDate: string
  endDate: string
  nextPayoutAt?: string
  nextPayoutAmount?: number
  status: 'active' | 'redeeming' | 'closed' | 'defaulted'
}

export interface DashboardInvestmentStats {
  totalInvested: number
  currentValue: number
  totalEarnings: number
  claimableRewards: number
  activePositions: number
}

export interface InvestmentDashboardProperties {
  stats: DashboardInvestmentStats
  positions: DashboardPosition[]
  onClaimRewards?: () => void
  onViewPosition?: (positionId: string) => void
  className?: string
}

const statusStyles = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: '持有中',
    icon: '🟢',
  },
  redeeming: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: '赎回中',
    icon: '🟡',
  },
  closed: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: '已结束',
    icon: '⚫',
  },
  defaulted: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: '违约',
    icon: '🔴',
  },
};

const typeIcons = {
  silver: '🥈',
  gold: '🥇',
  diamond: '💎',
};

const InvestmentDashboard = React.forwardRef<HTMLDivElement, InvestmentDashboardProperties>(
  ({ stats, positions, onClaimRewards, onViewPosition, className, ...properties }, reference) => {
    // Magic numbers defined as constants
    const PERCENTAGE_MULTIPLIER = 100;
    const DECIMAL_PRECISION = 2;
    const MILLISECONDS_PER_SECOND = 1000;
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;
    const MILLISECONDS_PER_DAY = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
    const ANIMATION_DELAY_INCREMENT = 0.1;
    const profitLoss = stats.currentValue - stats.totalInvested;
    const profitLossPercentage = stats.totalInvested > 0
      ? ((profitLoss / stats.totalInvested) * PERCENTAGE_MULTIPLIER)
      : 0;

    return (
      <div ref={reference} className={cn('space-y-6', className)} {...properties}>
        {/* 总体统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总投资金额</CardTitle>
                <span className="text-2xl">💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalInvested.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  活跃仓位 {stats.activePositions} 个
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">当前价值</CardTitle>
                <span className="text-2xl">📈</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.currentValue.toLocaleString()}
                </div>
                <p className={cn(
                  'text-xs font-medium',
                  profitLoss >= 0 ? 'text-green-600' : 'text-red-600',
                )}>
                  {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}
                  ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(DECIMAL_PRECISION)}%)
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">累计收益</CardTitle>
                <span className="text-2xl">🎯</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +${stats.totalEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  历史总收益
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待领取收益</CardTitle>
                <span className="text-2xl">🎁</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${stats.claimableRewards.toLocaleString()}
                </div>
                {stats.claimableRewards > 0 && (
                  <button
                    onClick={onClaimRewards}
                    className="text-xs text-primary font-medium hover:underline mt-1"
                  >
                    立即领取 →
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 持仓列表 */}
        <Card>
          <CardHeader>
            <CardTitle>我的投资组合</CardTitle>
            <CardDescription>
              当前持有的所有投资仓位
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0
              ? (
                <div className="text-center py-8">
                <span className="text-6xl mb-4 block">📊</span>
                <p className="text-muted-foreground">暂无投资仓位</p>
                <p className="text-sm text-muted-foreground mt-2">
                  购买NFT产品开始您的投资之旅
                </p>
              </div>
                )
              : (
                <div className="space-y-4">
                {positions.map((position, index) => {
                  const status = statusStyles[position.status];
                  const daysRemaining = Math.ceil(
                    (new Date(position.endDate).getTime() - Date.now()) / MILLISECONDS_PER_DAY,
                  );

                  return (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * ANIMATION_DELAY_INCREMENT }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onViewPosition?.(position.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {typeIcons[position.productType]}
                          </span>
                          <div>
                            <h4 className="font-semibold">{position.productName}</h4>
                            <p className="text-sm text-muted-foreground">
                              本金 ${position.principal.toLocaleString()} • {position.apr}% APR
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              status.bg,
                              status.text,
                            )}>
                              {status.icon} {status.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium">
                            当前价值: ${position.currentValue.toLocaleString()}
                          </p>
                          {position.status === 'active' && daysRemaining > 0 && (
                            <p className="text-xs text-muted-foreground">
                              剩余 {daysRemaining} 天
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 下次分红信息 */}
                      {position.nextPayoutAt && position.nextPayoutAmount && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">
                            下次分红: {new Date(position.nextPayoutAt).toLocaleDateString()}
                            • ${position.nextPayoutAmount.toFixed(DECIMAL_PRECISION)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
);

InvestmentDashboard.displayName = 'InvestmentDashboard';

export { InvestmentDashboard };
