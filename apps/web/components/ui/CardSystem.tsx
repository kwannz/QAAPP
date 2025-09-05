'use client'

import * as React from "react"
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, User, Shield, Clock } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn } from "@/lib/utils"

// Base card components (preserved from ui/card.tsx)
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Enhanced card types and interfaces

interface MetricsCardChange {
  value: number
  type: 'increase' | 'decrease' | 'neutral'
  label?: string
}

interface MetricsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  change?: MetricsCardChange
  status?: 'success' | 'warning' | 'error' | 'neutral'
  description?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface ProductCardAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'destructive'
  disabled?: boolean
}

interface ProductCardProps {
  title: string
  description: string
  price?: string | number
  originalPrice?: string | number
  discount?: number
  status?: 'available' | 'sold-out' | 'coming-soon' | 'active' | 'inactive'
  tags?: string[]
  image?: string
  actions?: ProductCardAction[]
  metadata?: Record<string, any>
  className?: string
  onClick?: () => void
}

type CardVariant = 'basic' | 'metrics' | 'product'

interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  // Basic card props
  children?: ReactNode
  // Metrics card props
  metricsProps?: MetricsCardProps
  // Product card props
  productProps?: ProductCardProps
}

// Status styles for metrics
const statusStyles = {
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50', 
  error: 'border-red-200 bg-red-50',
  neutral: 'border-gray-200 bg-white'
}

// Size styles for metrics
const sizeStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

// Status badge styles for products
const productStatusStyles = {
  'available': 'bg-green-100 text-green-800',
  'sold-out': 'bg-red-100 text-red-800',
  'coming-soon': 'bg-blue-100 text-blue-800',
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-gray-100 text-gray-800'
}

// Get trend icon
const getTrendIcon = (type: string) => {
  switch (type) {
    case 'increase':
      return <TrendingUp className="w-4 h-4 text-green-600" />
    case 'decrease':
      return <TrendingDown className="w-4 h-4 text-red-600" />
    default:
      return <Minus className="w-4 h-4 text-gray-600" />
  }
}

// Metrics Card Component
function MetricsCard({
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
  const CardComponent = onClick ? motion.div : 'div'
  
  return (
    <CardComponent
      className={cn(
        "rounded-lg border shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
        statusStyles[status],
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div className={cn(sizeStyles[size])}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {change && (
            <div className="flex items-center gap-1">
              {getTrendIcon(change.type)}
              <span className={cn(
                "text-sm font-medium",
                change.type === 'increase' ? 'text-green-600' : 
                change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
              )}>
                {change.value > 0 && change.type !== 'neutral' ? '+' : ''}{change.value}%
              </span>
            </div>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
        {change?.label && (
          <p className="mt-1 text-xs text-gray-400">{change.label}</p>
        )}
      </div>
    </CardComponent>
  )
}

// Product Card Component
function ProductCard({
  title,
  description,
  price,
  originalPrice,
  discount,
  status = 'available',
  tags,
  image,
  actions,
  metadata,
  className,
  onClick
}: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg", className)}>
      {image && (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          {status && (
            <Badge 
              className={cn("absolute top-2 right-2", productStatusStyles[status])}
            >
              {status}
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {status && !image && (
            <Badge className={cn(productStatusStyles[status])}>
              {status}
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
        
        {tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {(price !== undefined || originalPrice !== undefined) && (
          <div className="flex items-center gap-2 mb-4">
            {price !== undefined && (
              <span className="text-2xl font-bold">{price}</span>
            )}
            {originalPrice !== undefined && originalPrice !== price && (
              <span className="text-lg line-through text-gray-500">{originalPrice}</span>
            )}
            {discount && (
              <Badge className="bg-red-100 text-red-800">
                -{discount}%
              </Badge>
            )}
          </div>
        )}

        {metadata && (
          <div className="space-y-2 mb-4">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {actions && actions.length > 0 && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={index === 0 ? 'flex-1' : ''}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

// Main UnifiedCard component with variant support
const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ variant = 'basic', metricsProps, productProps, children, className, ...props }, ref) => {
    
    if (variant === 'metrics' && metricsProps) {
      return <MetricsCard {...metricsProps} className={className} />
    }
    
    if (variant === 'product' && productProps) {
      return <ProductCard {...productProps} className={className} />
    }
    
    // Basic card (default)
    return (
      <Card ref={ref} className={className} {...props}>
        {children}
      </Card>
    )
  }
)
UnifiedCard.displayName = "UnifiedCard"

// Specialized card variants for common use cases
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

// Export all components for compatibility
export { 
  // Unified system
  UnifiedCard,
  // Original basic components (preserved for compatibility)
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  // Enhanced components
  MetricsCard,
  ProductCard,
  ProductCard as EnhancedProductCard, // Alias for compatibility
  // Types
  type MetricsCardProps,
  type ProductCardProps,
  type UnifiedCardProps
}