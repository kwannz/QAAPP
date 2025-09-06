import { Suspense } from 'react'
import { Metadata } from 'next'

import { HeroSection } from '../components/home/HeroSection'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { ProductsPreview } from '../components/home/ProductsPreview'
import { StatsSection } from '../components/home/StatsSection'
import { CTASection } from '../components/home/CTASection'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export const metadata: Metadata = {
  title: 'QA App - Web3固定收益投资平台',
  description: '专业的Web3固定收益投资平台，提供USDT稳定币投资产品，年化收益率12-18%，安全可靠，透明可信。',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">

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