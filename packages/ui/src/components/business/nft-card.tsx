import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export interface NFTCardProperties {
  type: 'silver' | 'gold' | 'diamond' | 'platinum'
  name: string
  apr: number
  lockDays: number
  minAmount: number
  maxAmount?: number
  currentSupply: number
  totalSupply?: number
  isActive: boolean
  onPurchase?: () => void
  className?: string
}

const cardStyles = {
  silver: {
    gradient: 'from-slate-100 via-gray-200 to-slate-100',
    border: 'border-slate-300',
    accent: 'text-slate-700',
    button: 'bg-slate-600 hover:bg-slate-700 text-white',
    glow: 'shadow-slate-200/50',
    icon: '🥈',
  },
  gold: {
    gradient: 'from-yellow-100 via-amber-200 to-yellow-100',
    border: 'border-amber-300',
    accent: 'text-amber-800',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    glow: 'shadow-amber-200/50',
    icon: '🥇',
  },
  diamond: {
    gradient: 'from-cyan-100 via-blue-200 to-indigo-200',
    border: 'border-blue-300',
    accent: 'text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    glow: 'shadow-blue-200/50',
    icon: '💎',
  },
  platinum: {
    gradient: 'from-purple-100 via-purple-200 to-purple-100',
    border: 'border-purple-300',
    accent: 'text-purple-800',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    glow: 'shadow-purple-200/50',
    icon: '👑',
  },
};

const NFTCard = React.forwardRef<HTMLDivElement, NFTCardProperties>(
  ({
    type,
    name,
    apr,
    lockDays,
    minAmount,
    maxAmount,
    currentSupply,
    totalSupply,
    isActive,
    onPurchase,
    className,
    ...properties
  }, reference) => {
    // Constants for calculations
    const PERCENTAGE_MULTIPLIER = 100;
    const DAYS_PER_YEAR = 365;
    const DECIMAL_PRECISION = 2;
    const MAX_PERCENTAGE = 100;
    const style = cardStyles[type];
    const supplyPercentage = totalSupply ? (currentSupply / totalSupply) * PERCENTAGE_MULTIPLIER : 0;
    const isAvailable = isActive && (totalSupply ? currentSupply < totalSupply : true);

    return (
      <motion.div
        ref={reference}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className={cn('relative', className)}
        {...properties}
      >
        <Card
          className={cn(
            'relative overflow-hidden',
            `bg-gradient-to-br ${style.gradient}`,
            style.border,
            `shadow-lg ${style.glow}`,
            'hover:shadow-xl transition-shadow duration-300',
            !isAvailable && 'opacity-75 grayscale',
          )}
        >
          {/* 发光效果 */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className={cn('text-xl font-bold', style.accent)}>
                <span className="text-2xl mr-2">{style.icon}</span>
                {name}
              </CardTitle>
              {!isAvailable && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  售罄
                </span>
              )}
            </div>

            {/* APR 显示 */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">
                {apr}%
              </span>
              <span className="text-sm text-muted-foreground">年化收益率</span>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {/* 产品信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">锁定期限</p>
                <p className="font-semibold">{lockDays} 天</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">起投金额</p>
                <p className="font-semibold">${minAmount.toLocaleString()}</p>
              </div>
            </div>

            {maxAmount && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">最大投资额</p>
                <p className="font-semibold">${maxAmount.toLocaleString()}</p>
              </div>
            )}

            {/* 供应量进度 */}
            {totalSupply && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>供应量</span>
                  <span>{currentSupply} / {totalSupply}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(supplyPercentage, MAX_PERCENTAGE)}%` }}
                  />
                </div>
              </div>
            )}

            {/* 特性标签 */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                固定收益
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                NFT凭证
              </span>
              {type === 'diamond' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  高端专享
                </span>
              )}
            </div>

            {/* 购买按钮 */}
            <Button
              className={cn('w-full mt-4', style.button)}
              disabled={!isAvailable}
              onClick={onPurchase}
            >
              {isAvailable ? `立即购买 ${name}` : '暂时售罄'}
            </Button>

            {/* 收益计算示例 */}
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">收益预估（投资 ${minAmount.toLocaleString()}）</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">每日收益</span>
                <span className="font-semibold text-green-600">
                  ${((minAmount * apr / PERCENTAGE_MULTIPLIER) / DAYS_PER_YEAR).toFixed(DECIMAL_PRECISION)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">总收益</span>
                <span className="font-semibold text-green-600">
                  ${((minAmount * apr / PERCENTAGE_MULTIPLIER) * (lockDays / DAYS_PER_YEAR)).toFixed(DECIMAL_PRECISION)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);

NFTCard.displayName = 'NFTCard';

export { NFTCard };
