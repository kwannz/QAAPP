'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Users, TrendingUp, Lock, Award } from 'lucide-react';

import { Card, CardContent } from '@/components/ui';

const features = [
  {
    icon: Shield,
    title: '资金安全保障',
    description: '多重签名钱包管理，智能合约代码开源审计，资金安全透明可查',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  {
    icon: TrendingUp,
    title: '稳定收益回报',
    description: '年化收益率12%-18%，固定期限投资，到期本息自动结算',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
  },
  {
    icon: Zap,
    title: '操作简单快捷',
    description: '一键连接钱包，极简投资流程，实时查看收益和资产状况',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  {
    icon: Lock,
    title: '智能合约保障',
    description: '基于以太坊智能合约，代码开源可审计，去中心化执行',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Users,
    title: '推荐奖励机制',
    description: 'C2C推荐1%佣金，代理商3%佣金，多层级奖励体系',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
  },
  {
    icon: Award,
    title: 'NFT投资凭证',
    description: '每笔投资生成独特NFT凭证，可交易可展示，权益永久记录',
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
  },
];

export function FeaturesSection() {
  const ANIM_DELAY_STEP = 0.1;
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
              为什么选择 <span className="qa-gradient-text">QA App</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              我们致力于为用户提供最安全、最透明、最便捷的Web3投资体验
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * ANIM_DELAY_STEP }}
              >
                <Card className="h-full qa-card-hover border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {/* 图标 */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor}`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>

                      {/* 标题 */}
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>

                      {/* 描述 */}
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 底部信任指标 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">全天候客户服务</div>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">智能合约执行</div>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">安全事故记录</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
