'use client';

import { zodResolver } from '@hookform/resolvers/zod';
// Removed framer-motion import for better performance - using CSS animations instead
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSafeToast } from '../../../lib/use-safe-toast';

import { authApi } from '../../../lib/api-client';
import { useAuthStore } from '../../../lib/auth-context';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ClientOnly } from '@/components/ClientOnly';
import { DeveloperLogin } from '@/components/auth/DeveloperLogin';
import { logger } from '@/lib/verbose-logger';


// import { Web3LoginSection } from '../../../components/auth/Web3LoginSection'
// import { GoogleLoginButton } from '../../../components/auth/GoogleLoginButton'

const MIN_PASSWORD_LENGTH = 8;
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(MIN_PASSWORD_LENGTH, '密码至少8位'),
});

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const toast = useSafeToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });
      
      // Fix: The API returns response.data.data structure, not response.data directly
      const responseData = response.data?.data || response.data;
      const { user, accessToken, refreshToken } = responseData;

      setUser(user);
      setTokens(accessToken, refreshToken);

      toast.success('登录成功！');

      // 跳转到仪表板或者用户之前访问的页面
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (error: any) {
      logger.error('Auth', 'Login error', error);
      toast.error(error.response?.data?.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* 简化背景装饰 - 减少blur效果以提升性能 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-200/30" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-indigo-200/30" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* 返回按钮 - 使用CSS动画替代framer-motion */}
          <div className="mb-6 animate-in slide-in-from-left-4 fade-in duration-300">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回首页
            </Link>
          </div>

          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-150">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">QA</span>
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
                <p className="text-muted-foreground mt-2">
                  登录您的账户以继续投资之旅
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 邮箱登录表单 */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    {...register('email')}
                    type="email"
                    label="邮箱地址"
                    placeholder="请输入邮箱地址"
                    error={errors.email?.message}
                    leftIcon={<Mail className="h-4 w-4" />}
                    loading={isLoading}
                    autoComplete="email"
                  />

                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="密码"
                    placeholder="请输入密码"
                    error={errors.password?.message}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    loading={isLoading}
                    autoComplete="current-password"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      忘记密码？
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    登录
                  </Button>
                </form>

                {/* 开发者快速登录 */}
                <DeveloperLogin />

                {/* 分隔线 */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-muted-foreground">或者</span>
                  </div>
                </div>

                {/* Google 登录 - 暂时禁用 */}
                {/* <GoogleLoginButton
                  onSuccess={() => {
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
                    router.push(redirectUrl)
                  }}
                /> */}

                {/* Web3 登录 - 暂时禁用 */}
                {/* <Web3LoginSection /> */}

                {/* 注册链接 */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">还没有账户？</span>{' '}
                  <Link
                    href="/auth/register"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    立即注册
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
