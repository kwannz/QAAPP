'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '../../lib/auth-context';

interface ProtectedRouteProperties {
  children: React.ReactNode
  requireKyc?: boolean
  requireWallet?: boolean
  requiredRoles?: string[]
}

export function ProtectedRoute({
  children,
  requireKyc = false,
  requireWallet = false,
  requiredRoles = [],
}: ProtectedRouteProperties) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const shouldBypassForE2E = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('e2e_auth') === 'skip';
    } catch {
      return false;
    }
  })();

  // 开发模式下直接跳过所有认证检查
  const isDevelopmentMode = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // 开发模式或E2E跳过认证时，不进行任何认证检查
    if (isDevelopmentMode || shouldBypassForE2E) {
      return;
    }

    // 如果正在加载，不做任何处理
    if (isLoading) return;

    // 如果用户未登录，跳转到登录页面
    if (!isAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${redirectUrl}`);
      return;
    }

    // 检查角色要求
    if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
        router.push('/dashboard'); // 跳转到仪表板或显示无权限页面
        return;
      }

    // 检查KYC要求
    if (requireKyc && user && user.kycStatus !== 'APPROVED') {
        router.push('/kyc'); // 跳转到KYC页面
        return;
      }

    // 检查钱包要求
    if (requireWallet && user && (!user.wallets || user.wallets.length === 0)) {
        router.push('/dashboard/wallets'); // 跳转到钱包管理页面
      }
  }, [isDevelopmentMode, shouldBypassForE2E, isAuthenticated, isLoading, user, pathname, router, requireKyc, requireWallet, requiredRoles]);

  // 开发模式下直接渲染子组件
  if (isDevelopmentMode || shouldBypassForE2E) {
    return <>{children}</>;
  }

  // 如果正在加载认证状态，显示加载页面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 如果用户未认证，不渲染内容（useEffect会处理跳转）
  if (!isAuthenticated) {
    return null;
  }

  // 如果所有检查都通过，渲染子组件
  return <>{children}</>;
}
