'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Gift, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui';

export function CTASection() {
  return (
    <section className="qa-section bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <div className="qa-container">
        <div className="relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* 主标题 */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  立即开始您的
                  <span className="qa-gradient-text block md:inline"> Web3投资之旅</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  加入数万名用户的行列，享受安全稳定的数字资产增值服务，
                  新用户注册即享多重好礼。
                </p>
              </div>

              {/* 优惠活动展示 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl border shadow-lg p-8 inline-block"
              >
                <div className="flex items-center justify-center space-x-6 flex-wrap gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-green-600">$10 USDT</div>
                      <div className="text-sm text-muted-foreground">新用户注册礼</div>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-12 bg-gray-200" />

                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-orange-600">3%</div>
                      <div className="text-sm text-muted-foreground">推荐好友佣金</div>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-12 bg-gray-200" />

                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-purple-600">18%</div>
                      <div className="text-sm text-muted-foreground">最高年化收益</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 行动按钮组 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/auth/register">
                  <Button size="xl" className="group w-full sm:w-auto">
                    立即注册投资
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/products">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    先看看产品
                  </Button>
                </Link>
              </motion.div>

              {/* 安全提示 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm text-muted-foreground space-y-2"
              >
                <p>🔐 您的资金安全受到多重保障</p>
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs">
                  <span>• 智能合约开源可审计</span>
                  <span>• 多重签名钱包管理</span>
                  <span>• 专业团队24/7监控</span>
                  <span>• 资金保险承保</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
