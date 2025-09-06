'use client'

import { lazy, ComponentType, LazyExoticComponent } from 'react'
import dynamic from 'next/dynamic'

type ComponentLoader<T = {}> = () => Promise<{ default: ComponentType<T> }>

export function createLazyComponent<T = {}>(
  loader: ComponentLoader<T>,
  fallback?: ComponentType
): LazyExoticComponent<ComponentType<T>> {
  const Component = lazy(loader)
  
  if (fallback) {
    // 可以在这里添加错误边界逻辑
  }
  
  return Component
}

export function createDynamicComponent<T = {}>(
  loader: ComponentLoader<T>,
  options: {
    loading?: ComponentType
    ssr?: boolean
  } = {}
) {
  return dynamic(loader, {
    loading: options.loading || (() => <div className="animate-pulse bg-gray-200 rounded h-32" />),
    ssr: options.ssr ?? false,
  })
}

export const LazyFallback = ({ message = "加载中..." }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  </div>
)

export const ComponentSkeleton = ({ height = "h-32" }: { height?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${height}`} />
)

export const adminComponentLoader = {
  analytics: () => import('../app/admin/analytics/page').then(mod => ({ default: mod.default })),
  monitoring: () => import('../app/admin/monitoring/page').then(mod => ({ default: mod.default })),
  operations: () => import('../app/admin/operations/page').then(mod => ({ default: mod.default })),
  settings: () => import('../app/admin/settings/page').then(mod => ({ default: mod.default })),
}

export const dashboardComponentLoader = {
  investments: () => import('../components/dashboard/InvestmentDashboard').then(mod => ({ default: mod.InvestmentDashboard })),
  portfolio: () => import('../components/business/PortfolioManager').then(mod => ({ default: mod.PortfolioManager })),
  transactions: () => import('../components/business/TransactionFlow').then(mod => ({ default: mod.TransactionFlow })),
  positions: () => import('../components/positions/UserPositions').then(mod => ({ default: mod.UserPositions })),
}

export const chartComponentLoader = {
  performanceChart: () => import('../components/charts/PerformanceChart').then(mod => ({ default: mod.PerformanceChart })),
  revenueChart: () => import('../components/charts/RevenueChart').then(mod => ({ default: mod.RevenueChart })),
}

export const LazyAdminAnalytics = createDynamicComponent(adminComponentLoader.analytics, { 
  loading: () => <ComponentSkeleton height="h-96" />,
  ssr: false 
})

export const LazyAdminMonitoring = createDynamicComponent(adminComponentLoader.monitoring, {
  loading: () => <ComponentSkeleton height="h-96" />,
  ssr: false
})

export const LazyInvestmentDashboard = createDynamicComponent(dashboardComponentLoader.investments, {
  loading: () => <ComponentSkeleton height="h-64" />,
  ssr: true
})

export const LazyPortfolioManager = createDynamicComponent(dashboardComponentLoader.portfolio, {
  loading: () => <ComponentSkeleton height="h-48" />,
  ssr: false
})

// Heavy page components - lazy load entire pages for admin
export const LazyAdminOperations = createDynamicComponent(
  () => import('../app/admin/operations/page').then(mod => ({ default: mod.default })), 
  { 
    loading: () => <ComponentSkeleton height="h-96" />,
    ssr: false 
  }
)

// Heavy dashboard sections - lazy load big sections
export const LazyUserNFTs = createDynamicComponent(
  () => import('../components/dashboard/UserNFTs').then(mod => ({ default: mod.UserNFTs })), 
  { 
    loading: () => <ComponentSkeleton height="h-64" />,
    ssr: false 
  }
)

// Tab content sections that can be lazy loaded
export const LazyDashboardProfile = createDynamicComponent(
  () => import('../components/dashboard/ProfileSection').then(mod => ({ default: mod.ProfileSection })), 
  { 
    loading: () => <ComponentSkeleton height="h-80" />,
    ssr: false 
  }
)

export const LazyDashboardWallets = createDynamicComponent(
  () => import('../components/dashboard/WalletsSection').then(mod => ({ default: mod.WalletsSection })), 
  { 
    loading: () => <ComponentSkeleton height="h-64" />,
    ssr: false 
  }
)

export const LazyDashboardNotifications = createDynamicComponent(
  () => import('../components/dashboard/NotificationsSection').then(mod => ({ default: mod.NotificationsSection })), 
  { 
    loading: () => <ComponentSkeleton height="h-80" />,
    ssr: false 
  }
)