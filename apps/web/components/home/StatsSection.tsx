'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const stats = [
  {
    id: 'totalValue',
    label: '平台总锁仓价值',
    value: 12_500_000,
    prefix: '$',
    suffix: '',
    format: 'currency',
  },
  {
    id: 'totalUsers',
    label: '累计用户数量',
    value: 28_470,
    prefix: '',
    suffix: '+',
    format: 'number',
  },
  {
    id: 'totalRewards',
    label: '累计发放收益',
    value: 1_890_000,
    prefix: '$',
    suffix: '',
    format: 'currency',
  },
  {
    id: 'avgApr',
    label: '平均年化收益率',
    value: 15.8,
    prefix: '',
    suffix: '%',
    format: 'decimal',
  },
];

// 数字动画组件
function AnimatedNumber({
  value,
  format,
  prefix = '',
  suffix = '',
}: {
  value: number
  format: string
  prefix?: string
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const MILLION = 1_000_000;
  const THOUSAND = 1000;
  const DECIMALS_ONE = 1;

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const duration = 2000; // 2秒动画
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数
      const EASE_POWER = 4;
      const easeOutQuart = 1 - Math.pow(1 - progress, EASE_POWER);
      const currentValue = startValue + (value - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, isVisible]);

  const formatValue = (value_: number) => {
    switch (format) {
      case 'currency': {
        return value_ >= MILLION
          ? `${(value_ / MILLION).toFixed(DECIMALS_ONE)  }M`
          : (value_ >= THOUSAND
            ? `${(value_ / THOUSAND).toFixed(0)  }K`
            : value_.toFixed(0));
      }
      case 'number': {
        return value_ >= THOUSAND
          ? `${(value_ / THOUSAND).toFixed(DECIMALS_ONE)  }K`
          : value_.toFixed(0);
      }
      case 'decimal': {
        return value_.toFixed(DECIMALS_ONE);
      }
      default: {
        return value_.toFixed(0);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => setIsVisible(true)}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-3xl md:text-4xl font-bold text-primary"
    >
      <motion.span
        key={Math.floor(displayValue)}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}{formatValue(displayValue)}{suffix}
      </motion.span>
    </motion.div>
  );
}

export function StatsSection() {
  const ANIM_DELAY_STEP = 0.1;
  const HOVER_Y_OFFSET = -5;
  const HOVER_SCALE = 1.02;
  return (
    <section className="qa-section bg-white">
      <div className="qa-container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              平台<span className="qa-gradient-text">数据概览</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              透明的数据展示，见证平台的快速发展和用户信任
            </p>
          </motion.div>
        </div>

        {/* 统计数据网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * ANIM_DELAY_STEP }}
              whileHover={{ 
                y: HOVER_Y_OFFSET,
                scale: HOVER_SCALE,
                transition: { duration: 0.3 },
              }}
              className="group text-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="transform transition-transform duration-300 group-hover:scale-105">
                <AnimatedNumber
                  value={stat.value}
                  format={stat.format}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <div className="mt-4 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {stat.label}
              </div>
              
              {/* 装饰性元素 */}
              <div className="mt-4 flex justify-center">
                <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 趋势图表区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">平台增长趋势</h3>
            <p className="text-muted-foreground">过去12个月的关键指标变化</p>
          </div>

          {/* 简化的趋势展示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">+285%</div>
              <div className="text-sm text-muted-foreground">用户增长率</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '85%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">+420%</div>
              <div className="text-sm text-muted-foreground">资产增长率</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '92%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">系统稳定性</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '99.9%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 信任徽章 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16 opacity-60"
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">√</span>
            </div>
            <span>智能合约审计通过</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">√</span>
            </div>
            <span>资金安全保险承保</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">√</span>
            </div>
            <span>7×24小时监控运维</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
