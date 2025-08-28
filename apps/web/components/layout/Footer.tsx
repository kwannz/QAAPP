'use client'

import Link from 'next/link'
import { Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui'

const navigation = {
  product: [
    { name: '产品介绍', href: '/products' },
    { name: '收益计算器', href: '/calculator' },
    { name: '风险说明', href: '/risks' },
    { name: '常见问题', href: '/faq' },
  ],
  platform: [
    { name: '关于我们', href: '/about' },
    { name: '团队介绍', href: '/team' },
    { name: '发展路线', href: '/roadmap' },
    { name: '合作伙伴', href: '/partners' },
  ],
  resources: [
    { name: '帮助中心', href: '/help' },
    { name: '安全中心', href: '/security' },
    { name: '智能合约', href: '/contracts' },
    { name: 'API文档', href: '/docs' },
  ],
  legal: [
    { name: '用户协议', href: '/terms' },
    { name: '隐私政策', href: '/privacy' },
    { name: '风险提示', href: '/risk-disclosure' },
    { name: '免责声明', href: '/disclaimer' },
  ],
}

const socialLinks = [
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Telegram', href: '#', icon: MessageCircle },
  { name: 'Github', href: '#', icon: Github },
  { name: 'Email', href: 'mailto:support@qa-app.com', icon: Mail },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="qa-container">
        {/* 主要内容区域 */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* 品牌信息 */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">QA</span>
                </div>
                <span className="text-xl font-bold qa-gradient-text">
                  QA App
                </span>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
                专业的Web3固定收益投资平台，致力于为用户提供安全、透明、高效的数字资产增值服务。
              </p>

              {/* 订阅邮件 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">订阅更新</h4>
                <div className="flex space-x-2 max-w-sm">
                  <input
                    type="email"
                    placeholder="输入邮箱地址"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button size="sm">
                    订阅
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  获取最新产品动态和投资资讯
                </p>
              </div>
            </div>

            {/* 导航链接 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">产品服务</h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">平台信息</h3>
              <ul className="space-y-3">
                {navigation.platform.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">支持与资源</h3>
              <ul className="space-y-3">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                    >
                      {item.name}
                      {item.href.startsWith('http') && (
                        <ExternalLink className="ml-1 h-3 w-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-gray-200" />

        {/* 底部信息 */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* 版权信息 */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground">
                © {currentYear} QA App. All rights reserved.
              </p>
              
              <div className="flex space-x-4">
                {navigation.legal.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 社交媒体链接 */}
            <div className="flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* 风险提示 */}
        <div className="border-t border-gray-200 py-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>风险提示：</strong>
              数字资产投资存在价格波动风险，过往表现不代表未来收益。
              请您根据自身风险承受能力谨慎投资，注意保护个人资产安全。
              本平台不对投资损失承担责任。
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}