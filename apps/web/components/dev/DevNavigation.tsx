'use client'

import Link from 'next/link'
import { Code, ExternalLink, Home, User, Wallet, TrendingDown, Settings, ShoppingCart, Shield, TrendingUp, Users, Zap, RefreshCw, UserCheck } from 'lucide-react'
import { ApiStatus } from './ApiStatus'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { useAuthStore } from '../../lib/auth-store'

export function DevNavigation() {
  const developmentPages = [
    { name: '首页', href: '/', icon: Home, description: '当前页面' },
    { name: '产品中心', href: '/products', icon: ShoppingCart, description: '所有产品列表' },
    { name: '银卡产品', href: '/products/silver', icon: Shield, description: '银卡产品详情' },
    { name: '金卡产品', href: '/products/gold', icon: TrendingUp, description: '金卡产品详情' },
    { name: '钻石产品', href: '/products/diamond', icon: Zap, description: '钻石产品详情' },
    { name: '用户登录', href: '/auth/login', icon: User, description: '用户登录页面' },
    { name: '用户注册', href: '/auth/register', icon: Users, description: '用户注册页面' },
    { name: '仪表板', href: '/dashboard', icon: Settings, description: '用户仪表板' },
    { name: '钱包管理', href: '/dashboard/wallets', icon: Wallet, description: '钱包管理页面' },
    { name: '收益管理', href: '/dashboard/earnings', icon: TrendingDown, description: '收益管理页面' },
    { name: '测试页面', href: '/test-enhanced', icon: Code, description: '增强测试页面' },
  ];

  const showShortcuts = () => {
    const shortcuts = `
🚀 QA App 开发快捷键:
Ctrl/Cmd + Alt + 0: 首页
Ctrl/Cmd + Alt + 1: 产品中心
Ctrl/Cmd + Alt + 2: 登录页面
Ctrl/Cmd + Alt + 3: 注册页面
Ctrl/Cmd + Alt + 4: 仪表板
Ctrl/Cmd + Alt + 5: 钱包管理
Ctrl/Cmd + Alt + 6: 收益管理
Ctrl/Cmd + Alt + 7: 测试页面
Ctrl/Cmd + Alt + H: 显示此帮助
`
    console.log(shortcuts)
    alert('快捷键帮助已在控制台中显示。请按 F12 打开开发者工具查看。')
  }

  return (
    <>
      <KeyboardShortcuts />
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-700">开发导航 - 所有页面快速访问</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>快捷键: Ctrl/Cmd + Alt + 数字</span>
              <button 
                onClick={showShortcuts}
                className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
              >
                查看快捷键
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {developmentPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all duration-200"
                >
                  <Icon className="w-4 h-4 text-orange-600 group-hover:text-orange-700" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-orange-700 truncate">
                      {page.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {page.description}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
          <div className="mt-3">
            <ApiStatus />
          </div>
        </div>
      </div>
    </>
  )
}