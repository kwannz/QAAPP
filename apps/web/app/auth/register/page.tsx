'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@qa-app/ui'
import { authApi } from '../../../lib/api-client'
import { useAuthStore } from '../../../lib/auth-store'
import { Web3LoginSection } from '../../../components/auth/Web3LoginSection'
import { GoogleLoginButton } from '../../../components/auth/GoogleLoginButton'

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少8位')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      '密码必须包含大小写字母、数字和特殊字符'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, '请同意服务条款'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setTokens } = useAuthStore()

  // 从URL获取推荐码
  const urlReferralCode = searchParams.get('ref')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referralCode: urlReferralCode || '',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const { confirmPassword, agreeTerms, ...registerData } = data
      
      const response = await authApi.register({
        email: registerData.email!,
        password: registerData.password!,
        referralCode: registerData.referralCode
      })
      const { user, accessToken, refreshToken } = response.data

      setUser(user)
      setTokens(accessToken, refreshToken)
      
      toast.success('注册成功！欢迎加入QA App')
      
      // 跳转到仪表板
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '注册失败，请稍后重试')
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
              
              <CardTitle className="text-2xl font-bold">创建账户</CardTitle>
              <p className="text-muted-foreground mt-2">
                加入QA App，开始您的Web3投资之旅
              </p>

              {/* 新用户福利提示 */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 新用户注册即获得 <strong>$10 USDT</strong> 体验金
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 邮箱注册表单 */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('email')}
                  type="email"
                  label="邮箱地址"
                  placeholder="请输入邮箱地址"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-4 w-4" />}
                  disabled={isLoading}
                />

                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="密码"
                  placeholder="请输入密码"
                  error={errors.password?.message}
                  helper="密码必须包含大小写字母、数字和特殊字符"
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
                  disabled={isLoading}
                />

                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="确认密码"
                  placeholder="请再次输入密码"
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  disabled={isLoading}
                />

                <Input
                  {...register('referralCode')}
                  type="text"
                  label="推荐码（可选）"
                  placeholder="输入推荐码享受额外奖励"
                  error={errors.referralCode?.message}
                  leftIcon={<Users className="h-4 w-4" />}
                  disabled={isLoading}
                />

                {/* 服务条款 */}
                <div className="space-y-2">
                  <label className="flex items-start space-x-2 text-sm">
                    <input
                      type="checkbox"
                      {...register('agreeTerms')}
                      className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                      disabled={isLoading}
                    />
                    <span className="text-muted-foreground">
                      我已阅读并同意{' '}
                      <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                        服务条款
                      </Link>{' '}
                      和{' '}
                      <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                        隐私政策
                      </Link>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-sm text-red-600">{errors.agreeTerms.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isLoading}
                >
                  创建账户
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

              {/* Google 注册 */}
              <GoogleLoginButton 
                onSuccess={() => {
                  toast.success('注册成功！欢迎加入QA App')
                  router.push('/dashboard')
                }}
              />

              {/* Web3 注册 */}
              <Web3LoginSection 
                isRegister={true} 
                referralCode={urlReferralCode || undefined}
              />

              {/* 登录链接 */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">已有账户？</span>{' '}
                <Link 
                  href="/auth/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  立即登录
                </Link>
              </div>

              {/* 风险提示 */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>风险提示：</strong>
                  数字资产投资存在风险，请您谨慎投资，注意保护个人信息和资产安全。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}