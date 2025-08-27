import { lazy } from 'react'
import { LazyWrapper, PageLoader, CardLoader } from '../components/ui/LazyComponentLoader'

// 懒加载主要页面组件
export const LazyDashboard = lazy(() => import('../app/dashboard/page'))
export const LazyCommissions = lazy(() => import('../app/dashboard/commissions/page'))
export const LazyNotifications = lazy(() => import('../app/dashboard/notifications/page'))
export const LazyReports = lazy(() => import('../app/dashboard/reports/page'))
export const LazyProfile = lazy(() => import('../app/dashboard/profile/page'))
export const LazyTransactions = lazy(() => import('../app/dashboard/transactions/page'))
export const LazyActivity = lazy(() => import('../app/dashboard/activity/page'))

// 管理页面懒加载
export const LazyAdminDashboard = lazy(() => import('../app/admin/page'))
export const LazyAdminUsers = lazy(() => import('../app/admin/users/page'))
export const LazyAdminCommissions = lazy(() => import('../app/admin/commissions/page'))
export const LazyAdminNotifications = lazy(() => import('../app/admin/notifications/page'))
export const LazyAdminReports = lazy(() => import('../app/admin/reports/page'))

// 认证页面懒加载
export const LazyLogin = lazy(() => import('../app/auth/login/page'))
export const LazyRegister = lazy(() => import('../app/auth/register/page'))

// 带加载器的懒加载组件包装器
export const DashboardPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyDashboard />
  </LazyWrapper>
)

export const CommissionsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyCommissions />
  </LazyWrapper>
)

export const NotificationsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyNotifications />
  </LazyWrapper>
)

export const ReportsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyReports />
  </LazyWrapper>
)

export const ProfilePage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyProfile />
  </LazyWrapper>
)

export const TransactionsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyTransactions />
  </LazyWrapper>
)

export const ActivityPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyActivity />
  </LazyWrapper>
)

// 管理页面包装器
export const AdminDashboardPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminDashboard />
  </LazyWrapper>
)

export const AdminUsersPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminUsers />
  </LazyWrapper>
)

export const AdminCommissionsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminCommissions />
  </LazyWrapper>
)

export const AdminNotificationsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminNotifications />
  </LazyWrapper>
)

export const AdminReportsPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyAdminReports />
  </LazyWrapper>
)

// 认证页面包装器
export const LoginPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyLogin />
  </LazyWrapper>
)

export const RegisterPage = () => (
  <LazyWrapper fallback={<PageLoader />}>
    <LazyRegister />
  </LazyWrapper>
)

// 预加载策略
export const preloadDashboardRoutes = () => {
  // 用户登录后预加载常用页面
  import('../app/dashboard/page').catch(() => {})
  import('../app/dashboard/commissions/page').catch(() => {})
  import('../app/dashboard/notifications/page').catch(() => {})
}

export const preloadAdminRoutes = () => {
  // 管理员登录后预加载管理页面
  import('../app/admin/page').catch(() => {})
  import('../app/admin/users/page').catch(() => {})
}

// 路由预加载配置
export const routePreloadConfig = {
  '/dashboard': {
    preload: [
      () => import('../app/dashboard/commissions/page'),
      () => import('../app/dashboard/notifications/page'),
    ],
    delay: 2000, // 2秒后开始预加载
  },
  '/dashboard/commissions': {
    preload: [
      () => import('../app/dashboard/reports/page'),
      () => import('../app/dashboard/transactions/page'),
    ],
    delay: 1500,
  },
  '/admin': {
    preload: [
      () => import('../app/admin/users/page'),
      () => import('../app/admin/commissions/page'),
    ],
    delay: 2000,
  },
} as const