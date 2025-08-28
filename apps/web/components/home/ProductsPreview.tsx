'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { EnhancedProductCard, Button } from '@/components/ui'

const sampleProducts = [
  {
    type: 'silver' as const,
    name: 'QA白银卡',
    apr: 12,
    lockDays: 30,
    minAmount: 100,
    maxAmount: 10000,
    currentSupply: 1250,
    totalSupply: 10000,
    isActive: true,
  },
  {
    type: 'gold' as const,
    name: 'QA黄金卡',
    apr: 15,
    lockDays: 60,
    minAmount: 1000,
    maxAmount: 50000,
    currentSupply: 2800,
    totalSupply: 5000,
    isActive: true,
  },
  {
    type: 'diamond' as const,
    name: 'QA钻石卡',
    apr: 18,
    lockDays: 90,
    minAmount: 5000,
    maxAmount: 200000,
    currentSupply: 950,
    totalSupply: 1000,
    isActive: true,
  },
]

export function ProductsPreview() {
  return (
    <section className="qa-section bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="qa-container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              精选投资<span className="qa-gradient-text">产品</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              不同期限，不同收益，满足您多样化的投资需求
            </p>
          </motion.div>
        </div>

        {/* 产品卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {sampleProducts.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <EnhancedProductCard
                product={{
                  name: product.name,
                  apy: BigInt(product.apr * 100),
                  duration: BigInt(product.lockDays * 24 * 60 * 60),
                  minInvestment: BigInt(product.minAmount * 1000000),
                  maxInvestment: BigInt(product.maxAmount * 1000000),
                  isActive: product.isActive
                }}
                productId={0}
                onPurchaseSuccess={() => {
                  // 这里会跳转到具体的产品页面
                  window.location.href = `/products/${product.type}`
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* 产品对比表格 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <h3 className="text-xl font-semibold text-center">产品对比一览</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">产品类型</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">年化收益率</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">锁定期限</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">起投金额</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">供应状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sampleProducts.map((product) => {
                    const supplyPercentage = (product.currentSupply / product.totalSupply) * 100
                    
                    return (
                      <tr key={product.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {product.type === 'silver' && '🥈'}
                              {product.type === 'gold' && '🥇'}
                              {product.type === 'diamond' && '💎'}
                            </span>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-primary">{product.apr}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm">{product.lockDays} 天</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium">
                            ${product.minAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(supplyPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {supplyPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* 行动按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Link href="/products">
            <Button size="lg" className="group">
              查看全部产品
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-muted-foreground">
            新用户注册即可获得 <span className="font-semibold text-primary">$10 USDT</span> 体验金
          </p>
        </motion.div>
      </div>
    </section>
  )
}