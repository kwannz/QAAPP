'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Code, ExternalLink, Home, User, Wallet, TrendingDown, Settings, ShoppingCart, Shield, TrendingUp, Users, Zap,
  ChevronDown, ChevronRight, Search, Lock, Unlock, Crown, UserCog, Activity, CreditCard, AlertTriangle,
  Eye, FileText, BarChart, Bell, DollarSign, Gift, TestTube, ArrowUpDown, Building, Cog,
  PieChart, Clipboard, Target, CheckCircle
} from 'lucide-react'
import { ApiStatus } from './ApiStatus'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { useAuthStore } from '../../lib/auth-store'

interface DevPage {
  name: string
  href: string
  icon: any
  description: string
  permission: 'PUBLIC' | 'USER' | 'AGENT' | 'ADMIN'
  category: string
}

export function DevNavigation() {
  const { user } = useAuthStore()
  const [expandedSections, setExpandedSections] = useState<string[]>(['公开页面'])
  const [searchTerm, setSearchTerm] = useState('')

  const developmentPages: DevPage[] = [
    // 公开页面
    { name: '首页', href: '/', icon: Home, description: '应用首页', permission: 'PUBLIC', category: '公开页面' },
    { name: '产品中心', href: '/products', icon: ShoppingCart, description: '所有产品列表', permission: 'PUBLIC', category: '公开页面' },
    { name: '银卡产品', href: '/products/silver', icon: Shield, description: '银卡产品详情', permission: 'PUBLIC', category: '公开页面' },
    { name: '金卡产品', href: '/products/gold', icon: TrendingUp, description: '金卡产品详情', permission: 'PUBLIC', category: '公开页面' },
    { name: '钻石产品', href: '/products/diamond', icon: Zap, description: '钻石产品详情', permission: 'PUBLIC', category: '公开页面' },
    { name: '用户登录', href: '/auth/login', icon: User, description: '用户登录页面', permission: 'PUBLIC', category: '公开页面' },
    { name: '用户注册', href: '/auth/register', icon: Users, description: '用户注册页面', permission: 'PUBLIC', category: '公开页面' },
    
    // 用户仪表板
    { name: '仪表板', href: '/dashboard', icon: Settings, description: '用户仪表板首页', permission: 'USER', category: '用户仪表板' },
    { name: '个人资料', href: '/dashboard/profile', icon: User, description: '用户个人资料', permission: 'USER', category: '用户仪表板' },
    { name: '钱包管理', href: '/dashboard/wallets', icon: Wallet, description: '钱包管理页面', permission: 'USER', category: '用户仪表板' },
    { name: '收益管理', href: '/dashboard/earnings', icon: TrendingDown, description: '收益管理页面', permission: 'USER', category: '用户仪表板' },
    { name: '佣金记录', href: '/dashboard/commissions', icon: DollarSign, description: '佣金记录查看', permission: 'USER', category: '用户仪表板' },
    { name: '交易记录', href: '/dashboard/transactions', icon: CreditCard, description: '交易历史记录', permission: 'USER', category: '用户仪表板' },
    { name: '活动记录', href: '/dashboard/activity', icon: Activity, description: '用户活动记录', permission: 'USER', category: '用户仪表板' },
    { name: '通知中心', href: '/dashboard/notifications', icon: Bell, description: '通知消息中心', permission: 'USER', category: '用户仪表板' },
    { name: '数据报告', href: '/dashboard/reports', icon: BarChart, description: '个人数据报告', permission: 'USER', category: '用户仪表板' },
    
    // 特殊页面
    { name: '推荐页面', href: '/referral', icon: Gift, description: '推荐奖励页面', permission: 'USER', category: '特殊页面' },
    { name: '提现申请', href: '/withdrawals', icon: ArrowUpDown, description: '提现申请页面', permission: 'USER', category: '特殊页面' },
    { name: '测试页面', href: '/test-enhanced', icon: TestTube, description: '增强测试页面', permission: 'PUBLIC', category: '特殊页面' },
    
    // 管理后台
    { name: '管理后台', href: '/admin', icon: Crown, description: '管理后台首页', permission: 'ADMIN', category: '管理后台' },
    { name: '用户管理', href: '/admin/users', icon: Users, description: '用户管理页面', permission: 'ADMIN', category: '管理后台' },
    { name: '订单管理', href: '/admin/orders', icon: ShoppingCart, description: '订单管理页面', permission: 'ADMIN', category: '管理后台' },
    { name: '产品管理', href: '/admin/products', icon: Building, description: '产品管理页面', permission: 'ADMIN', category: '管理后台' },
    { name: '代理管理', href: '/admin/agents', icon: UserCog, description: '代理商管理', permission: 'ADMIN', category: '管理后台' },
    { name: '佣金管理', href: '/admin/commissions', icon: DollarSign, description: '佣金管理页面', permission: 'ADMIN', category: '管理后台' },
    { name: '提现审核', href: '/admin/withdrawals', icon: ArrowUpDown, description: '提现审核页面', permission: 'ADMIN', category: '管理后台' },
    { name: '系统设置', href: '/admin/settings', icon: Cog, description: '系统设置页面', permission: 'ADMIN', category: '管理后台' },
    { name: '系统管理', href: '/admin/system', icon: Settings, description: '系统管理页面', permission: 'ADMIN', category: '管理后台' },
    { name: '权限管理', href: '/admin/permissions', icon: Shield, description: '权限管理页面', permission: 'ADMIN', category: '管理后台' },
    { name: '审计日志', href: '/admin/audit-logs', icon: FileText, description: '系统审计日志', permission: 'ADMIN', category: '管理后台' },
    { name: '系统日志', href: '/admin/logs', icon: Clipboard, description: '系统运行日志', permission: 'ADMIN', category: '管理后台' },
    { name: 'KYC审核', href: '/admin/kyc-review', icon: CheckCircle, description: 'KYC身份审核', permission: 'ADMIN', category: '管理后台' },
    { name: '用户审计', href: '/admin/user-audit', icon: Eye, description: '用户行为审计', permission: 'ADMIN', category: '管理后台' },
    { name: '系统审计', href: '/admin/system-audit', icon: Target, description: '系统安全审计', permission: 'ADMIN', category: '管理后台' },
    { name: '风险评估', href: '/admin/risk-assessment', icon: AlertTriangle, description: '风险评估管理', permission: 'ADMIN', category: '管理后台' },
    { name: '合规管理', href: '/admin/compliance', icon: Shield, description: '合规性管理', permission: 'ADMIN', category: '管理后台' },
    { name: '性能监控', href: '/admin/performance', icon: Activity, description: '系统性能监控', permission: 'ADMIN', category: '管理后台' },
    { name: '通知管理', href: '/admin/notifications', icon: Bell, description: '通知消息管理', permission: 'ADMIN', category: '管理后台' },
    { name: '数据报告', href: '/admin/reports', icon: BarChart, description: '系统数据报告', permission: 'ADMIN', category: '管理后台' },
    { name: '业务指标', href: '/admin/business-metrics', icon: PieChart, description: '业务指标分析', permission: 'ADMIN', category: '管理后台' },
  ]

  // 权限检查函数
  const hasPermission = (pagePermission: string) => {
    if (pagePermission === 'PUBLIC') return true
    if (!user) return false
    
    const userRole = user.role
    switch (pagePermission) {
      case 'USER':
        return ['USER', 'AGENT', 'ADMIN'].includes(userRole)
      case 'AGENT':
        return ['AGENT', 'ADMIN'].includes(userRole)
      case 'ADMIN':
        return userRole === 'ADMIN'
      default:
        return false
    }
  }

  // 权限图标获取
  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'PUBLIC':
        return <Unlock className="w-3 h-3 text-green-500" title="公开访问" />
      case 'USER':
        return <User className="w-3 h-3 text-blue-500" title="需要登录" />
      case 'AGENT':
        return <UserCog className="w-3 h-3 text-purple-500" title="代理权限" />
      case 'ADMIN':
        return <Crown className="w-3 h-3 text-red-500" title="管理员权限" />
      default:
        return <Lock className="w-3 h-3 text-gray-500" />
    }
  }

  // 切换分类展开/折叠
  const toggleSection = (category: string) => {
    setExpandedSections(prev => 
      prev.includes(category) 
        ? prev.filter(s => s !== category)
        : [...prev, category]
    )
  }

  // 过滤和分组页面
  const filteredPages = developmentPages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedPages = filteredPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = []
    }
    acc[page.category].push(page)
    return acc
  }, {} as Record<string, DevPage[]>)

  const showShortcuts = () => {
    const shortcuts = `
🚀 QA App 开发快捷键:
Ctrl/Cmd + Alt + 0: 首页
Ctrl/Cmd + Alt + H: 显示/隐藏开发导航
Ctrl/Cmd + Alt + S: 搜索页面
Ctrl/Cmd + Alt + A: 管理后台
Ctrl/Cmd + Alt + D: 用户仪表板
Ctrl/Cmd + Alt + P: 产品页面
Ctrl/Cmd + Alt + L: 登录页面
`
    console.log(shortcuts)
    alert('快捷键帮助已在控制台中显示。请按 F12 打开开发者工具查看。')
  }

  return (
    <>
      <KeyboardShortcuts />
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-sm font-semibold text-gray-700">开发导航 - 所有页面快速访问</h3>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                  <span>当前用户: {user?.role || '游客'}</span>
                  <span>•</span>
                  <span>共 {developmentPages.length} 个页面</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={showShortcuts}
                className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
              >
                快捷键
              </button>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索页面..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 页面分类 */}
          <div className="space-y-4">
            {Object.entries(groupedPages).map(([category, pages]) => {
              const isExpanded = expandedSections.includes(category)
              const accessiblePagesCount = pages.filter(page => hasPermission(page.permission)).length
              
              return (
                <div key={category} className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection(category)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-medium text-gray-700">{category}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {accessiblePagesCount}/{pages.length}
                      </span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-3 pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {pages.map((page) => {
                          const Icon = page.icon
                          const hasAccess = hasPermission(page.permission)
                          
                          return (
                            <Link
                              key={page.href}
                              href={page.href}
                              className={`group flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                                hasAccess
                                  ? 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                                  : 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${
                                hasAccess 
                                  ? 'text-orange-600 group-hover:text-orange-700' 
                                  : 'text-gray-400'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <div className={`text-sm font-medium truncate ${
                                  hasAccess 
                                    ? 'text-gray-900 group-hover:text-orange-700' 
                                    : 'text-gray-500'
                                }`}>
                                  {page.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {page.description}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {getPermissionIcon(page.permission)}
                                {hasAccess && (
                                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-4">
            <ApiStatus />
          </div>
        </div>
      </div>
    </>
  )
}