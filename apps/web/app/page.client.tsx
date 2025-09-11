'use client';

import { Suspense } from 'react'

import { HeroSection } from '../components/home/HeroSection'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { ProductsPreview } from '../components/home/ProductsPreview'
import { StatsSection } from '../components/home/StatsSection'
import { CTASection } from '../components/home/CTASection'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
// (removed unused Card imports)
import { WalletConnectionManager } from '@/components/ui/WalletConnectionManager'
import { useSearchParams } from 'next/navigation'

export default function HomeClient() {
  const searchParams = useSearchParams();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* 调试：已连接覆盖 */}
        {(() => {
          const sp = searchParams;
          const override = sp?.get('e2e_wallet') === 'connected';
          if (override) {
            const chain = sp?.get('e2e_chain');
            const chainLabel = chain === 'mainnet' ? '以太坊主网' : chain === 'local' ? 'Hardhat Local' : 'Sepolia 测试网';
            return (
              <div className="qa-container mt-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">钱包连接</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="text-sm mb-2">钱包已连接 · {chainLabel}</div>
                    <WalletConnectionManager showNetworkInfo showContractStatus />
                  </div>
                </div>
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
