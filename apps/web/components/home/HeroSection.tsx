'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui';

export function HeroSection() {
  const [currentStat, setCurrentStat] = useState(0);
  const ANIM_DELAY_STEP = 0.1;
  const EASE_HALF = 0.5;
  const OPACITY_LOW = 0.2;
  const OPACITY_MED = 0.4;
  const FLOAT_Y_SMALL = 15;
  const FLOAT_X_SMALL = 5;
  const ROTATE_HALF = 180;
  const ROTATE_FULL = 360;
  const SCALE_UP_110 = 1.1;
  const SCALE_UP_120 = 1.2;
  const DURATION6 = 6;
  const DURATION7 = 7;
  const DURATION8 = 8;

  const stats = [
    { value: '$12.5M', label: '总投资额', animation: 'fadeInUp' },
    { value: '15.8%', label: '平均年化收益', animation: 'fadeInUp' },
    { value: '2,847', label: '活跃投资者', animation: 'fadeInUp' },
    { value: '99.9%', label: '资金安全率', animation: 'fadeInUp' },
  ];

  // 轮播统计数据
  const ROTATE_INTERVAL_MS = 3000;
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((previous) => (previous + 1) % stats.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [stats.length]);

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
            backgroundSize: '50px 50px',
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
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * ANIM_DELAY_STEP }}
                    className={`text-center transition-all duration-500 ${
                      currentStat === index 
                        ? 'scale-110 text-primary transform' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold mb-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 进度指示器 */}
              <div className="flex justify-center mt-8 space-x-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={`${stat.label}-dot`}
                    className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                      currentStat === index 
                        ? 'bg-primary w-12 shadow-lg' 
                        : 'bg-gray-300 w-8 hover:bg-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setCurrentStat(index)}
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
          animate={{ 
            y: [-FLOAT_Y_SMALL, FLOAT_Y_SMALL, -FLOAT_Y_SMALL],
            rotate: [0, ROTATE_HALF, ROTATE_FULL],
            scale: [1, SCALE_UP_110, 1],
          }}
          transition={{ 
            duration: DURATION6, 
            repeat: Infinity, 
            ease: 'easeInOut',
            times: [0, EASE_HALF, 1],
          }}
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 opacity-25 blur-sm shadow-lg"
        />
      </div>

      <div className="absolute top-1/4 right-8 hidden xl:block">
        <motion.div
          animate={{ 
            y: [FLOAT_Y_SMALL, -FLOAT_Y_SMALL, FLOAT_Y_SMALL],
            x: [-FLOAT_X_SMALL, FLOAT_X_SMALL, -FLOAT_X_SMALL],
            scale: [1, SCALE_UP_120, 1],
          }}
          transition={{ 
            duration: DURATION7, 
            repeat: Infinity, 
            ease: 'easeInOut',
            times: [0, EASE_HALF, 1],
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-35 blur-sm shadow-md"
        />
      </div>

      {/* 新增装饰元素 */}
      <div className="absolute bottom-1/4 left-1/4 hidden lg:block">
        <motion.div
          animate={{ 
            rotate: [0, -ROTATE_HALF, -ROTATE_FULL],
            opacity: [OPACITY_LOW, OPACITY_MED, OPACITY_LOW],
          }}
          transition={{ 
            duration: DURATION8, 
            repeat: Infinity, 
            ease: 'linear',
          }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 opacity-20 blur-sm"
        />
      </div>
    </section>
  );
}
