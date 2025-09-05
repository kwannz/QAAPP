'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { SafeConnectButton } from '../web3/SafeConnectButton';

import { Button, cn } from '@/components/ui';

import { useAuthStore } from '../../lib/auth-context';

const navigation = [
  { name: '首页', href: '/' },
  { name: '产品', href: '/products' },
  { name: '我的投资', href: '/dashboard', requireAuth: true },
  { name: '推荐中心', href: '/referral', requireAuth: true },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="qa-container flex h-16 items-center justify-between" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-bold text-sm">QA</span>
            </div>
            <span className="text-xl font-bold qa-gradient-text hidden sm:block">
              QA App
            </span>
          </Link>
        </div>

        {/* 移动端菜单按钮 */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">打开主菜单</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* 桌面端导航 */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => {
            // 如果需要认证但用户未登录，则不显示
            if (item.requireAuth && !isAuthenticated) {
              return null;
            }

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-semibold leading-6 transition-colors hover:text-primary',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* 右侧操作区 */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <SafeConnectButton />

              {/* 用户菜单 */}
              <div className="relative">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">欢迎,</span>
                  <span className="font-medium">
                    {user?.email || `用户${user?.referralCode}`}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 移动端菜单 */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="lg:hidden">
              <div className="fixed inset-0 z-50" />
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border"
              >
                <div className="flex items-center justify-between">
                  <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">QA</span>
                    </div>
                    <span className="text-xl font-bold qa-gradient-text">
                      QA App
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">关闭菜单</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-border">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => {
                        if (item.requireAuth && !isAuthenticated) {
                          return null;
                        }

                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="py-6 space-y-4">
                      <div className="w-full">
                        <div className="flex justify-center">
                          <SafeConnectButton />
                        </div>
                      </div>

                      {isAuthenticated
? (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            欢迎, {user?.email || `用户${user?.referralCode}`}
                          </p>
                        </div>
                      )
: (
                        <div className="space-y-2">
                          <Link href="/auth/login" className="block">
                            <Button variant="ghost" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                              登录
                            </Button>
                          </Link>
                          <Link href="/auth/register" className="block">
                            <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                              注册
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
