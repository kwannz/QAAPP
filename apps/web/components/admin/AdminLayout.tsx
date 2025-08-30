'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShoppingBag, 
  CreditCard, 
  FileText, 
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Wallet
} from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { useAuthStore } from '../../lib/auth-store'

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminNavigation = [
  {
    name: '总览',
    href: '/admin',
    icon: LayoutDashboard,
    description: '系统概览和统计'
  },
  {
    name: 'KYC审核',
    href: '/admin/kycreview',
    icon: UserCheck,
    description: '用户身份验证审核'
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: Users,
    description: '用户账户管理'
  },
  {
    name: '产品审核',
    href: '/admin/products',
    icon: ShoppingBag,
    description: '投资产品管理'
  },
  {
    name: '订单审核',
    href: '/admin/orders',
    icon: CreditCard,
    description: '交易订单审核'
  },
  {
    name: '提现审核',
    href: '/admin/withdrawals',
    icon: Wallet,
    description: '资金提现审核'
  },
  {
    name: '审计日志',
    href: '/admin/audit-logs',
    icon: FileText,
    description: '系统操作记录'
  },
  {
    name: '代理管理',
    href: '/admin/agents',
    icon: UserCog,
    description: '代理商管理'
  },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">管理后台</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex items-center px-6 py-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">QA</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">管理后台</h2>
                <p className="text-xs text-gray-500">系统管理控制台</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User info at bottom */}
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {user?.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || '管理员'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role || 'ADMIN'}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden md:flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索用户、订单、日志..."
                  className="w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || '管理员'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role || 'ADMIN'}</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {user?.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}