import { lazy } from 'react';

import { LazyWrapper, PageLoader, CardLoader } from '../components/ui/LazyComponentLoader';

// 懒加载主要页面组件
export const LazyDashboard = lazy(async () => import('../app/dashboard/page'));

// Mock implementations for missing dashboard pages
export const LazyCommissions = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">佣金管理</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">佣金页面开发中...</span>
    </div>
  </div>
);
export const LazyNotifications = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">通知中心</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">通知页面开发中...</span>
    </div>
  </div>
);
export const LazyReports = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">报表中心</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">报表页面开发中...</span>
    </div>
  </div>
);
export const LazyProfile = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">个人资料</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">个人资料页面开发中...</span>
    </div>
  </div>
);
export const LazyTransactions = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">交易记录</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">交易记录页面开发中...</span>
    </div>
  </div>
);
export const LazyActivity = lazy(async () => import('../app/dashboard/activity/page'));

// 管理页面懒加载
export const LazyAdminDashboard = lazy(async () => import('../app/admin/page'));

// Mock implementations for missing admin pages
export const LazyAdminUsers = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">用户管理</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">用户管理页面开发中...</span>
    </div>
  </div>
);
export const LazyAdminCommissions = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">佣金管理</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">佣金管理页面开发中...</span>
    </div>
  </div>
);
export const LazyAdminNotifications = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">通知管理</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">通知管理页面开发中...</span>
    </div>
  </div>
);
export const LazyAdminReports = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">报表管理</h1>
    <div className="bg-gray-100 p-8 rounded-lg text-center">
      <span className="text-gray-500">报表管理页面开发中...</span>
    </div>
  </div>
);

// 认证页面懒加载
export const LazyLogin = lazy(async () => import('../app/auth/login/page'));
export const LazyRegister = lazy(async () => import('../app/auth/register/page'));

// 带加载器的懒加载组件包装器
export const DashboardPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyDashboard />
  </LazyWrapper>
);

export const CommissionsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyCommissions />
  </LazyWrapper>
);

export const NotificationsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyNotifications />
  </LazyWrapper>
);

export const ReportsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyReports />
  </LazyWrapper>
);

export const ProfilePage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyProfile />
  </LazyWrapper>
);

export const TransactionsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyTransactions />
  </LazyWrapper>
);

export const ActivityPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyActivity />
  </LazyWrapper>
);

// 管理页面包装器
export const AdminDashboardPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminDashboard />
  </LazyWrapper>
);

export const AdminUsersPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminUsers />
  </LazyWrapper>
);

export const AdminCommissionsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminCommissions />
  </LazyWrapper>
);

export const AdminNotificationsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminNotifications />
  </LazyWrapper>
);

export const AdminReportsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminReports />
  </LazyWrapper>
);

// 认证页面包装器
export const LoginPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyLogin />
  </LazyWrapper>
);

export const RegisterPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyRegister />
  </LazyWrapper>
);

// 预加载策略
export const preloadDashboardRoutes = () => {
  // 用户登录后预加载常用页面
  import('../app/dashboard/page').catch(() => {});

  // Dashboard modules removed - pages don't exist
};

export const preloadAdminRoutes = () => {
  // 管理员登录后预加载管理页面
  import('../app/admin/page').catch(() => {});

  // Admin users module removed - page doesn't exist
};

// 路由预加载配置
export const routePreloadConfig = {
  '/dashboard': {
    preload: [
      // Removed non-existent dashboard pages
    ],
    delay: 2000, // 2秒后开始预加载
  },
  '/dashboard/commissions': {
    preload: [
      // Removed non-existent dashboard pages
    ],
    delay: 1500,
  },
  '/admin': {
    preload: [
      // Removed non-existent admin pages
    ],
    delay: 2000,
  },
} as const;
