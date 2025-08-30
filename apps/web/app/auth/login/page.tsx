'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button, FormInput, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { authApi } from '../../../lib/api-client'
import { useAuthStore } from '../../../lib/auth-context'
// import { Web3LoginSection } from '../../../components/auth/Web3LoginSection'
// import { GoogleLoginButton } from '../../../components/auth/GoogleLoginButton'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password
      })
      const { user, accessToken, refreshToken } = response.data

      setUser(user)
      setTokens(accessToken, refreshToken)
      
      toast.success('登录成功！')
      
      // 跳转到仪表板或者用户之前访问的页面
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
      router.push(redirectUrl)
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败，请检查邮箱和密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
                <FormInput
                  {...register('email')}
                  type="email"
                  label="邮箱地址"
                  placeholder="请输入邮箱地址"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-4 w-4" />}
                  loading={isLoading}
                />

                <FormInput
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
        </motion.div>
      </div>
    </div>
  )
}