'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    label?: string
  }
  status?: 'success' | 'warning' | 'error' | 'neutral'
  description?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusStyles = {
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50',
  error: 'border-red-200 bg-red-50',
  neutral: 'border-gray-200 bg-white'
}

const changeIcons = {
  increase: TrendingUp,
  decrease: TrendingDown,
  neutral: Minus
}

const changeColors = {
  increase: 'text-green-600',
  decrease: 'text-red-600',
  neutral: 'text-gray-600'
}

const sizeStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

export function MetricsCard({
  title,
  value,
  icon,
  change,
  status = 'neutral',
  description,
  onClick,
  className,
  size = 'md'
}: MetricsCardProps) {
  const ChangeIcon = change ? changeIcons[change.type] : null
  const changeColor = change ? changeColors[change.type] : ''

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // 格式化数字
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString('zh-CN')
    }
    return val
  }

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Card 
        className={cn(
          'transition-all duration-200',
          statusStyles[status],
          onClick && 'cursor-pointer hover:shadow-lg',
          className
        )}
        onClick={onClick}
      >
        <CardContent className={sizeStyles[size]}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* 标题和图标 */}
              <div className="flex items-center space-x-2 mb-2">
                {icon && (
                  <div className="p-2 rounded-lg bg-gray-100">
                    {icon}
                  </div>
                )}
                <h3 className="text-sm font-medium text-gray-600 truncate">
                  {title}
                </h3>
                {status === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                )}
              </div>

              {/* 数值 */}
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  {formatValue(value)}
                </p>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {description}
                  </p>
                )}
              </div>

              {/* 变化趋势 */}
              {change && (
                <div className={cn('flex items-center space-x-1 text-sm', changeColor)}>
                  {ChangeIcon && <ChangeIcon className="h-4 w-4" />}
                  <span className="font-medium">
                    {change.type === 'increase' && '+'}
                    {change.value}%
                  </span>
                  {change.label && (
                    <span className="text-gray-500">
                      {change.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 状态指示器 */}
            {status !== 'neutral' && (
              <div className="flex-shrink-0">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  status === 'success' && 'bg-green-400',
                  status === 'warning' && 'bg-yellow-400',
                  status === 'error' && 'bg-red-400'
                )} />
              </div>
            )}
          </div>

          {/* 时间戳 */}
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>更新于 {new Date().toLocaleTimeString('zh-CN')}</span>
            </div>
            
            {onClick && (
              <div className="text-xs text-gray-400">
                点击查看详情
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 预定义的常用指标卡片
export function UserMetricsCard({ count, change }: { count: number; change?: number }) {
  return (
    <MetricsCard
      title="总用户数"
      value={count}
      icon={<User className="h-5 w-5 text-blue-600" />}
      change={change ? { value: change, type: change > 0 ? 'increase' : 'decrease', label: '本月' } : undefined}
    />
  )
}

export function RevenueMetricsCard({ revenue, change }: { revenue: number; change?: number }) {
  return (
    <MetricsCard
      title="总收入"
      value={`¥${revenue.toLocaleString('zh-CN')}`}
      icon={<TrendingUp className="h-5 w-5 text-green-600" />}
      change={change ? { value: change, type: change > 0 ? 'increase' : 'decrease', label: '本月' } : undefined}
      status={change && change > 0 ? 'success' : 'neutral'}
    />
  )
}

export function SystemHealthCard({ health }: { health: number }) {
  const status = health >= 95 ? 'success' : health >= 90 ? 'warning' : 'error'
  
  return (
    <MetricsCard
      title="系统健康度"
      value={`${health}%`}
      icon={<Shield className="h-5 w-5 text-blue-600" />}
      status={status}
      description={health >= 95 ? '系统运行良好' : health >= 90 ? '需要关注' : '需要立即处理'}
    />
  )
}