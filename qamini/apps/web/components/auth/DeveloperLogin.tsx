'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export function DeveloperLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleDeveloperLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: 'dev@qa-app.com',
        password: 'Dev123!'
      });

      if (response.data?.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        setUser(user);
        setTokens(accessToken, refreshToken);
        
        toast.success('开发者登录成功！');
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Developer login failed:', error);
      toast.error(`开发者登录失败: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">开发模式</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full mt-4 border-blue-300 text-blue-600 hover:bg-blue-50"
        onClick={handleDeveloperLogin}
        disabled={isLoading}
        data-testid="dev-login-btn"
      >
        {isLoading ? '登录中...' : '🔧 开发者快速登录'}
      </Button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        账号: dev@qa-app.com | 密码: Dev123!
      </p>
    </div>
  );
}