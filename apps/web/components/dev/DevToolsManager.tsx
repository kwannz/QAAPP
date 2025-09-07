'use client';

import {
  Code, ExternalLink, Home, User, Wallet, TrendingDown, Settings, ShoppingCart, Shield, TrendingUp, Users, Zap,
  ChevronDown, ChevronRight, Search, Lock, Unlock, Crown, UserCog, Activity, CreditCard, AlertTriangle,
  Eye, FileText, BarChart, Bell, DollarSign, Gift, TestTube, ArrowUpDown, Building, Cog,
  PieChart, Clipboard, Target, CheckCircle, X, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { useAuthStore } from '../../lib/auth-context';

interface DevelopmentPage {
  name: string
  href: string
  icon: any
  description: string
  permission: 'PUBLIC' | 'USER' | 'AGENT' | 'ADMIN'
  category: string
}

const shortcutMappings = {
  numbers: {
    0: { path: '/', name: '首页', category: '导航', permission: 'PUBLIC' } as const,
    1: { path: '/products', name: '产品中心', category: '导航', permission: 'PUBLIC' } as const,
    2: { path: '/auth/login', name: '登录页面', category: '认证', permission: 'PUBLIC' } as const,
    3: { path: '/auth/register', name: '注册页面', category: '认证', permission: 'PUBLIC' } as const,
    4: { path: '/dashboard', name: '用户仪表板', category: '用户', permission: 'USER' } as const,
    5: { path: '/dashboard/wallets', name: '钱包管理', category: '用户', permission: 'USER' } as const,
    6: { path: '/dashboard/earnings', name: '收益管理', category: '用户', permission: 'USER' } as const,
    7: { path: '/admin', name: '管理后台', category: '管理', permission: 'ADMIN' } as const,
    8: { path: '/test-enhanced', name: '测试页面', category: '开发', permission: 'PUBLIC' } as const,
    9: { path: '/withdrawals', name: '提现页面', category: '用户', permission: 'USER' } as const,
  },
  letters: {
    a: { path: '/admin', name: '管理后台', category: '管理', permission: 'ADMIN' } as const,
    d: { path: '/dashboard', name: '用户面板', category: '用户', permission: 'USER' } as const,
    p: { path: '/products', name: '产品页面', category: '导航', permission: 'PUBLIC' } as const,
    l: { path: '/auth/login', name: '登录页面', category: '认证', permission: 'PUBLIC' } as const,
    r: { path: '/referral', name: '推荐页面', category: '用户', permission: 'USER' } as const,
    t: { path: '/test-enhanced', name: '测试页面', category: '开发', permission: 'PUBLIC' } as const,
    w: { path: '/withdrawals', name: '提现页面', category: '用户', permission: 'USER' } as const,
    u: { path: '/admin/users', name: '用户管理', category: '管理', permission: 'ADMIN' } as const,
    o: { path: '/admin/orders', name: '订单管理', category: '管理', permission: 'ADMIN' } as const,
    s: { path: '/admin/settings', name: '系统设置', category: '管理', permission: 'ADMIN' } as const,
  },
};

const developmentPages: DevelopmentPage[] = [
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
  { name: 'KYC审核', href: '/admin/kycreview', icon: CheckCircle, description: 'KYC身份审核', permission: 'ADMIN', category: '管理后台' },
  { name: '用户审计', href: '/admin/user-audit', icon: Eye, description: '用户行为审计', permission: 'ADMIN', category: '管理后台' },
  { name: '系统审计', href: '/admin/system-audit', icon: Target, description: '系统安全审计', permission: 'ADMIN', category: '管理后台' },
  { name: '风险评估', href: '/admin/risk-assessment', icon: AlertTriangle, description: '风险评估管理', permission: 'ADMIN', category: '管理后台' },
  { name: '合规管理', href: '/admin/compliance', icon: Shield, description: '合规性管理', permission: 'ADMIN', category: '管理后台' },
  { name: '性能监控', href: '/admin/performance', icon: Activity, description: '系统性能监控', permission: 'ADMIN', category: '管理后台' },
  { name: '通知管理', href: '/admin/notifications', icon: Bell, description: '通知消息管理', permission: 'ADMIN', category: '管理后台' },
  { name: '数据报告', href: '/admin/reports', icon: BarChart, description: '系统数据报告', permission: 'ADMIN', category: '管理后台' },
  { name: '业务指标', href: '/admin/business-metrics', icon: PieChart, description: '业务指标分析', permission: 'ADMIN', category: '管理后台' },
];

export function DevToolsManager() {
  const router = useRouter();
  const { user } = useAuthStore();

  // DevBar state
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Navigation state
  const [expandedSections, setExpandedSections] = useState<string[]>(['公开页面']);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const isDevelopment = process.env.NODE_ENV === 'development';

  const hasPermission = (pagePermission: string) => {
    if (pagePermission === 'PUBLIC') return true;
    if (!user) return false;

    const userRole = user.role;
    switch (pagePermission) {
      case 'USER': {
        return ['USER', 'AGENT', 'ADMIN'].includes(userRole);
      }
      case 'AGENT': {
        return ['AGENT', 'ADMIN'].includes(userRole);
      }
      case 'ADMIN': {
        return userRole === 'ADMIN';
      }
      default: {
        return false;
      }
    }
  };

  const hasShortcutPermission = useCallback((permission?: string) => {
    if (!permission) return true;
    if (!user) return false;

    switch (permission) {
      case 'ADMIN': {
        return user.role === 'ADMIN';
      }
      case 'AGENT': {
        return ['AGENT', 'ADMIN'].includes(user.role);
      }
      case 'USER': {
        return ['USER', 'AGENT', 'ADMIN'].includes(user.role);
      }
      default: {
        return true;
      }
    }
  }, [user]);

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'PUBLIC': {
        return <Unlock className="w-3 h-3 text-green-500" />;
      }
      case 'USER': {
        return <User className="w-3 h-3 text-blue-500" />;
      }
      case 'AGENT': {
        return <UserCog className="w-3 h-3 text-purple-500" />;
      }
      case 'ADMIN': {
        return <Crown className="w-3 h-3 text-red-500" />;
      }
      default: {
        return <Lock className="w-3 h-3 text-gray-500" />;
      }
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': {
        return 'bg-red-500';
      }
      case 'AGENT': {
        return 'bg-purple-500';
      }
      case 'USER': {
        return 'bg-blue-500';
      }
      default: {
        return 'bg-gray-500';
      }
    }
  };

  const toggleSection = (category: string) => {
    setExpandedSections(previous =>
      previous.includes(category)
        ? previous.filter(s => s !== category)
        : [...previous, category],
    );
  };

  const filteredPages = developmentPages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedPages = filteredPages.reduce<Record<string, DevelopmentPage[]>>((accumulator, page) => {
    if (!accumulator[page.category]) {
      accumulator[page.category] = [];
    }
    accumulator[page.category].push(page);
    return accumulator;
  }, {});

  const showHelpInConsole = useCallback(() => {
    const availableNumbers = Object.entries(shortcutMappings.numbers)
      .filter(([_, mapping]) => hasShortcutPermission(mapping.permission))
      .map(([key, mapping]) => `Ctrl/Cmd + Alt + ${key}: ${mapping.name}`)
      .join('\n');

    const availableLetters = Object.entries(shortcutMappings.letters)
      .filter(([_, mapping]) => hasShortcutPermission(mapping.permission))
      .map(([key, mapping]) => `Ctrl/Cmd + Alt + ${key.toUpperCase()}: ${mapping.name}`)
      .join('\n');

    const message = `
🚀 QA App 开发快捷键 (当前用户: ${user?.role || '游客'}):

📱 数字键导航:
${availableNumbers}

🔤 字母键导航:
${availableLetters}

⚡ 功能快捷键:
Ctrl/Cmd + Alt + H: 显示/隐藏此帮助
Ctrl/Cmd + K: 快速搜索
Ctrl/Cmd + Shift + D: 开发工具栏
ESC: 关闭弹窗/面板
`;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { logger } = require('@/lib/verbose-logger');
    logger.info('DevTools', message);
  }, [user, hasShortcutPermission]);

  // 键盘快捷键处理 (合并所有键盘事件处理)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInInput = (event.target as HTMLElement)?.tagName?.toLowerCase() === 'input' ||
                        (event.target as HTMLElement)?.tagName?.toLowerCase() === 'textarea' ||
                        (event.target as HTMLElement)?.contentEditable === 'true';

      // Ctrl+Shift+D 切换 DevBar 显示
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsVisible(!isVisible);
        return;
      }

      // ESC 键处理
      if (event.key === 'Escape') {
        if (isHelpVisible) {
          setIsHelpVisible(false);
        } else if (isVisible) {
          if (isExpanded) {
            setIsExpanded(false);
          } else {
            setIsVisible(false);
          }
        }
        return;
      }

      // 在输入框中时跳过导航快捷键
      if (isInInput && !((event.ctrlKey || event.metaKey) && event.shiftKey)) {
        return;
      }

      // Ctrl/Cmd + Alt + H 显示帮助
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'h') {
        event.preventDefault();
        if (isVisible) {
          setIsExpanded(!isExpanded);
        } else {
          setIsHelpVisible(!isHelpVisible);
          showHelpInConsole();
        }
        return;
      }

      // Ctrl/Cmd + Alt + 导航快捷键
      if ((event.ctrlKey || event.metaKey) && event.altKey) {
        // 数字键导航
        const numberKey = event.key as unknown as keyof typeof shortcutMappings.numbers;
        if (shortcutMappings.numbers[numberKey]) {
          const mapping = shortcutMappings.numbers[numberKey];
          if (hasShortcutPermission(mapping.permission)) {
            event.preventDefault();
            router.push(mapping.path);
          }
        }

        // 字母键导航
        if (shortcutMappings.letters[event.key as keyof typeof shortcutMappings.letters]) {
          const mapping = shortcutMappings.letters[event.key as keyof typeof shortcutMappings.letters];
          if (hasShortcutPermission(mapping.permission)) {
            event.preventDefault();
            router.push(mapping.path);
          }
        }
      }

      // Ctrl/Cmd + K 快速搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="搜索"]');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 在控制台显示快捷键提示（通过应用内logger）
    const msg = `🎯 QA App 开发快捷键已激活！ (用户: ${user?.role || '游客'})\n使用 Ctrl/Cmd + Alt + H 查看所有快捷键`;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { logger } = require('@/lib/verbose-logger');
    logger.info('DevTools', msg);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, user, isHelpVisible, isVisible, isExpanded, hasShortcutPermission, showHelpInConsole]);

  // 快捷键帮助模态框
  if (isHelpVisible && isDevelopment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsHelpVisible(false)}>
        <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🚀 开发快捷键</h2>
            <button
              onClick={() => setIsHelpVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">📱 数字键导航</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(shortcutMappings.numbers)
                  .filter(([_, mapping]) => hasShortcutPermission(mapping.permission))
                  .map(([key, mapping]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">Ctrl+Alt+{key}</span>
                      <span className="text-gray-800">{mapping.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">🔤 字母键导航</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(shortcutMappings.letters)
                  .filter(([_, mapping]) => hasShortcutPermission(mapping.permission))
                  .map(([key, mapping]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">Ctrl+Alt+{key.toUpperCase()}</span>
                      <span className="text-gray-800">{mapping.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium text-gray-700 mb-2">⚡ 功能快捷键</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+Alt+H</span>
                <span className="text-gray-800">显示/隐藏此帮助</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+K</span>
                <span className="text-gray-800">快速搜索</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+Shift+D</span>
                <span className="text-gray-800">开发工具栏</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ESC</span>
                <span className="text-gray-800">关闭弹窗/面板</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            当前用户权限: {user?.role || '游客'} • 按 ESC 或点击外部区域关闭
          </div>
        </div>
      </div>
    );
  }

  return (
    !isDevelopment ? null : (
    <>
      {/* 浮动触发按钮 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`
            group relative flex items-center gap-2 px-3 py-2 
            rounded-full shadow-lg transition-all duration-300
            ${isVisible
              ? 'bg-orange-600 text-white shadow-orange-200'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }
          `}
          title="开发工具栏 (Ctrl+Shift+D)"
        >
          <Code className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:block">Dev</span>

          {user && (
            <div className={`w-2 h-2 rounded-full ${getRoleColor(user.role)}`} title={`当前角色: ${user.role}`} />
          )}

          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="开发环境" />
        </button>
      </div>

      {/* 开发工具栏面板 */}
      {isVisible && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute bottom-20 right-4 pointer-events-auto">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-[70vh] overflow-hidden">
              {/* 头部控制栏 */}
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm text-gray-700">开发工具栏</span>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {user?.role || '游客'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="展开/收起导航"
                  >
                    {isExpanded
? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )
: (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="关闭工具栏"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* 快速操作按钮 */}
              <div className="p-3 border-b bg-gray-50">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="返回首页"
                  >
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">首页</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="用户面板"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">面板</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="管理后台"
                  >
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">后台</span>
                  </button>
                  <button
                    onClick={() => window.open('/api', '_blank')}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="API文档"
                  >
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">API</span>
                  </button>
                </div>
              </div>

              {/* 完整导航面板 */}
              {isExpanded && (
                <div className="max-h-96 overflow-y-auto p-4">
                  <div className="space-y-4">
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

                    {/* 搜索框 */}
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

                    {/* 页面分类 */}
                    <div className="space-y-3">
                      {Object.entries(groupedPages).map(([category, pages]) => {
                        const isSectionExpanded = expandedSections.includes(category);
                        const accessiblePagesCount = pages.filter(page => hasPermission(page.permission)).length;

                        return (
                          <div key={category} className="bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={() => toggleSection(category)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isSectionExpanded
? (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )
: (
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="font-medium text-gray-700">{category}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {accessiblePagesCount}/{pages.length}
                                </span>
                              </div>
                            </button>

                            {isSectionExpanded && (
                              <div className="px-3 pb-3">
                                <div className="grid grid-cols-1 gap-2">
                                  {pages.map((page) => {
                                    const Icon = page.icon;
                                    const hasAccess = hasPermission(page.permission);

                                    return (
                                      <Link
                                        key={page.href}
                                        href={page.href}
                                        className={`group flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${
                                          hasAccess
                                            ? 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                                            : 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
                                        }`}
                                      >
                                        <Icon className={`w-4 h-4 ${
                                          hasAccess
                                            ? 'text-orange-600 group-hover:text-orange-700'
                                            : 'text-gray-400'
                                        }`}
                                        />
                                        <div className="min-w-0 flex-1">
                                          <div className={`text-sm font-medium truncate ${
                                            hasAccess
                                              ? 'text-gray-900 group-hover:text-orange-700'
                                              : 'text-gray-500'
                                          }`}
                                          >
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
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 快捷键提示 */}
              <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Ctrl+Shift+D: 切换</span>
                  <span>ESC: 关闭</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    )
  );
}
