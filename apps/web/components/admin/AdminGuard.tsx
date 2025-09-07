'use client';

import { Shield, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuthStore } from '../../lib/auth-context';
import { Card, CardContent } from '@/components/ui';
import { logger } from '@/lib/verbose-logger';



interface AdminGuardProperties {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AdminGuard({ children, allowedRoles = ['ADMIN'] }: AdminGuardProperties) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 设置超时，防止无限等待
    const AUTH_CHECK_TIMEOUT_MS = 5000;
    const timeout = setTimeout(() => {
      if (isChecking) {
        if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
          logger.warn('AdminGuard', 'Auth check timeout, assuming not authenticated');
        }
        setIsChecking(false);
      }
    }, AUTH_CHECK_TIMEOUT_MS); // 5秒超时

    const checkAccess = async () => {
      // 等待认证状态加载完成
      if (isLoading) {
        return;
      }

      // 清除超时定时器
      clearTimeout(timeout);

      // 未登录，跳转到登录页
      if (!isAuthenticated || !user) {
        router.replace('/auth/login?redirect=/admin');
        return;
      }

      // 检查用户角色权限
      if (!allowedRoles.includes(user.role || '')) {
        router.replace('/dashboard'); // 跳转到普通用户页面
        return;
      }

      setIsChecking(false);
    };

    checkAccess();

    // 清理函数
    return () => {
      clearTimeout(timeout);
    };
  }, [isAuthenticated, user, isLoading, router, allowedRoles, isChecking]);

  // 加载中状态
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              验证管理员权限
            </h2>
            <p className="text-gray-600">
              正在验证您的访问权限，请稍候...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 权限不足提示
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              访问被拒绝
            </h2>
            <p className="text-gray-600 mb-4">
              您没有访问管理后台的权限。只有管理员才能访问此区域。
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>当前用户角色: {user?.role || '未知'}</p>
              <p>需要角色: {allowedRoles.join(', ')}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回用户中心
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// 高级权限检查hook
export function useAdminAccess(requiredRole = 'ADMIN') {
  const { user, isAuthenticated } = useAuthStore();

  const hasAccess = isAuthenticated && user?.role === requiredRole;
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';

  return {
    hasAccess,
    isAdmin,
    isAgent,
    userRole: user?.role,
    canManageUsers: isAdmin,
    canManageAgents: isAdmin,
    canViewAuditLogs: isAdmin || isAgent,
    canApproveKYC: isAdmin,
    canApproveWithdrawals: isAdmin,
  };
}
