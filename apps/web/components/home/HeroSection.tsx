'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, TrendingUp, Users, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui'

export function HeroSection() {
  const [currentStat, setCurrentStat] = useState(0)
  
  const stats = [
    { value: '$12.5M', label: '总投资额' },
    { value: '15.8%', label: '平均年化收益' },
    { value: '2,847', label: '活跃投资者' },
    { value: '99.9%', label: '资金安全率' },
  ]

  // 轮播统计数据
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [stats.length])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 py-24 sm:py-32">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
        
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(251,146,60,0.5) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="qa-container">
        <div className="mx-auto max-w-4xl text-center">
          {/* 主标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* 标签 */}
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              Web3固定收益投资平台
            </div>

            {/* 主标题 */}
            <h1 className="qa-heading qa-gradient-text">
              安全稳定的
              <br />
              数字资产投资体验
            </h1>

            {/* 副标题 */}
            <p className="qa-subheading mx-auto">
              基于区块链技术的透明化投资平台，提供12%-18%年化收益率的USDT固定收益产品。
              专业风控，安全可靠，让您的数字资产稳健增值。
            </p>

            {/* 行动按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/products">
                <Button size="lg" className="group w-full sm:w-auto">
                  开始投资
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/learn">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  了解更多
                </Button>
              </Link>
            </div>

            {/* 信任指标 */}
            <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>资金安全保障</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span>稳定收益回报</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>透明化治理</span>
              </div>
            </div>
          </motion.div>

          {/* 动态统计数据展示 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={`text-center transition-all duration-500 ${
                      currentStat === index ? 'scale-110 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div className="text-2xl md:text-3xl font-bold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* 进度指示器 */}
              <div className="flex justify-center mt-6 space-x-2">
                {stats.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all duration-500 ${
                      currentStat === index ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 浮动元素 */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 hidden xl:block">
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 opacity-20 blur-sm"
        />
      </div>
      
      <div className="absolute top-1/4 right-8 hidden xl:block">
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-30 blur-sm"
        />
      </div>
    </section>
  )
}