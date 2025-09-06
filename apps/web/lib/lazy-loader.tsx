'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, LazyExoticComponent } from 'react';
import React, { lazy } from 'react';

type ComponentLoader<T = {}> = () => Promise<{ default: ComponentType<T> }>

export function createLazyComponent<T = {}>(
  loader: ComponentLoader<T>,
  fallback?: ComponentType,
): LazyExoticComponent<ComponentType<T>> {
  const Component = lazy(loader);

  if (fallback) {
    // 可以在这里添加错误边界逻辑
  }

  return Component;
}

const DefaultLoadingComponent = () => (
  <div className="animate-pulse bg-gray-200 rounded h-32" />
);

export function createDynamicComponent<T = {}>(
  loader: ComponentLoader<T>,
  options: {
    loading?: () => React.ReactElement
    ssr?: boolean
  } = {},
) {
  return dynamic(loader, {
    loading: options.loading || DefaultLoadingComponent,
    ssr: options.ssr ?? false,
  });
}

export const LazyFallback = ({ message = '加载中...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  </div>
);

export const ComponentSkeleton = ({ height = 'h-32' }: { height?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${height}`} />
);

export const adminComponentLoader = {
  analytics: async () => import('../app/admin/analytics/page').then(module_ => ({ default: module_.default })),
  monitoring: async () => import('../app/admin/monitoring/page').then(module_ => ({ default: module_.default })),
  operations: async () => import('../app/admin/operations/page').then(module_ => ({ default: module_.default })),
  settings: async () => import('../app/admin/settings/page').then(module_ => ({ default: module_.default })),
};

export const dashboardComponentLoader = {
  investments: async () => import('../components/dashboard/InvestmentDashboard').then(module_ => ({ default: module_.InvestmentDashboard })),
  portfolio: async () => import('../components/business/PortfolioManager').then(module_ => ({ default: module_.PortfolioManager })),
  transactions: async () => import('../components/business/TransactionFlow').then(module_ => ({ default: module_.TransactionFlow })),
  positions: async () => import('../components/positions/UserPositions').then(module_ => ({ default: module_.UserPositions })),
};

export const chartComponentLoader = {
  performanceChart: async () => ({
    default: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Performance Chart Placeholder</span>
      </div>
    ),
  }),
  revenueChart: async () => ({
    default: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Revenue Chart Placeholder</span>
      </div>
    ),
  }),
};

export const LazyAdminAnalytics = createDynamicComponent(adminComponentLoader.analytics, {
  loading: () => <ComponentSkeleton height="h-96" />,
  ssr: false,
});

export const LazyAdminMonitoring = createDynamicComponent(adminComponentLoader.monitoring, {
  loading: () => <ComponentSkeleton height="h-96" />,
  ssr: false,
});

export const LazyInvestmentDashboard = createDynamicComponent(dashboardComponentLoader.investments, {
  loading: () => <ComponentSkeleton height="h-64" />,
  ssr: true,
});

export const LazyPortfolioManager = createDynamicComponent(dashboardComponentLoader.portfolio, {
  loading: () => <ComponentSkeleton height="h-48" />,
  ssr: false,
});

// Heavy page components - lazy load entire pages for admin
export const LazyAdminOperations = createDynamicComponent(
  async () => import('../app/admin/operations/page').then(module_ => ({ default: module_.default })),
  {
    loading: () => <ComponentSkeleton height="h-96" />,
    ssr: false,
  },
);

// Heavy dashboard sections - lazy load big sections
export const LazyUserNFTs = createDynamicComponent(
  async () => import('../components/dashboard/UserNFTs').then(module_ => ({ default: module_.UserNFTs })),
  {
    loading: () => <ComponentSkeleton height="h-64" />,
    ssr: false,
  },
);

// Tab content sections that can be lazy loaded
export const LazyDashboardProfile = createDynamicComponent(
  async () => import('../components/dashboard/ProfileSection').then(module_ => ({ default: module_.ProfileSection })),
  {
    loading: () => <ComponentSkeleton height="h-80" />,
    ssr: false,
  },
);

export const LazyDashboardWallets = createDynamicComponent(
  async () => import('../components/dashboard/WalletsSection').then(module_ => ({ default: module_.WalletsSection })),
  {
    loading: () => <ComponentSkeleton height="h-64" />,
    ssr: false,
  },
);

export const LazyDashboardNotifications = createDynamicComponent(
  async () => ({
    default: () => (
      <div className="w-full p-4 bg-gray-100 rounded-lg">
        <span className="text-gray-500">Notifications Section Placeholder</span>
      </div>
    ),
  }),
  {
    loading: () => <ComponentSkeleton height="h-80" />,
    ssr: false,
  },
);
