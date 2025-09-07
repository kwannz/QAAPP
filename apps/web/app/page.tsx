'use client';

import { Suspense } from 'react'

import { HeroSection } from '../components/home/HeroSection'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { ProductsPreview } from '../components/home/ProductsPreview'
import { StatsSection } from '../components/home/StatsSection'
import { CTASection } from '../components/home/CTASection'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle, WalletConnectionManager } from '@/components/ui'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* 调试：已连接覆盖 */}
        {(() => {
          const debug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || process.env.NODE_ENV !== 'production';
          const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const override = debug && sp?.get('e2e_wallet') === 'connected';
          if (override) {
            return (
              <div className="qa-container mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>钱包连接</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WalletConnectionManager showNetworkInfo showContractStatus />
                  </CardContent>
                </Card>
              </div>
            )
          }
          return null;
        })()}
        {/* 英雄区域 */}
        <Suspense fallback={<div className="h-screen animate-pulse bg-gradient-to-br from-blue-50 to-indigo-100" />}>
          <HeroSection />
        </Suspense>

        {/* 特性介绍 */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
          <FeaturesSection />
        </Suspense>

        {/* 产品预览 */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-white" />}>
          <ProductsPreview />
        </Suspense>

        {/* 平台数据 */}
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-50" />}>
          <StatsSection />
        </Suspense>

        {/* 行动号召 */}
        <Suspense fallback={<div className="h-64 animate-pulse bg-primary/5" />}>
          <CTASection />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
