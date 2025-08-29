import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

import { Providers } from './providers';
import { cn } from '@/components/ui';
import { DevBar } from '@/components/dev/DevBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  title: 'QA App - Web3固定收益平台',
  description: '安全可靠的Web3投资平台，提供稳定的固定收益产品',
  keywords: ['Web3', 'DeFi', '固定收益', '投资', 'USDT', 'NFT'],
  authors: [{ name: 'QA Team' }],
  creator: 'QA Team',
  publisher: 'QA App',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'QA App',
    title: 'QA App - Web3固定收益平台',
    description: '安全可靠的Web3投资平台，提供稳定的固定收益产品',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QA App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QA App - Web3固定收益平台',
    description: '安全可靠的Web3投资平台，提供稳定的固定收益产品',
    images: ['/twitter-image.png'],
    creator: '@qaapp',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookies = (await headers()).get('cookie');

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 预连接到外部域名 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="//api.qa-app.com" />
        <link rel="dns-prefetch" href="//cdn.qa-app.com" />
        
        {/* 安全相关 */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* PWA相关 */}
        <meta name="application-name" content="QA App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QA App" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body 
        className={cn(
          inter.className,
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-primary/20 selection:text-primary-foreground'
        )}
        suppressHydrationWarning
      >
        <Providers cookies={cookies}>
          {/* 主要内容区域 */}
          <div id="root" className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
          </div>

          {/* 全局组件 */}
          <div id="toast-root" />

          {/* Portal容器 */}
          <div id="modal-root" />
          <div id="tooltip-root" />
          <div id="popover-root" />
          
          {/* 开发环境调试工具 */}
          {process.env.NODE_ENV === 'development' && (
            <>
              {/* 响应式断点指示器 */}
              <div className="fixed bottom-4 left-4 z-40">
                <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-75">
                  <div className="sm:hidden">XS</div>
                  <div className="hidden sm:block md:hidden">SM</div>
                  <div className="hidden md:block lg:hidden">MD</div>
                  <div className="hidden lg:block xl:hidden">LG</div>
                  <div className="hidden xl:block 2xl:hidden">XL</div>
                  <div className="hidden 2xl:block">2XL</div>
                </div>
              </div>
              
              {/* 全局开发工具栏 */}
              <DevBar />
            </>
          )}
        </Providers>

        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'QA App',
              description: '安全可靠的Web3投资平台，提供稳定的固定收益产品',
              url: process.env.NEXT_PUBLIC_APP_URL,
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              author: {
                '@type': 'Organization',
                name: 'QA Team',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}