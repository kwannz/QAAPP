'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp, Shield, Clock } from 'lucide-react'

import { Input, Button, EnhancedProductCard } from '@/components/ui'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { ProductPurchase } from '../../components/products/ProductPurchase'
import { PRODUCT_CONFIG, ProductType } from '../../lib/contracts/addresses'

// 基于合约配置的产品数据
const products = [
  {
    type: ProductType.SILVER,
    productType: 'silver' as const,
    ...PRODUCT_CONFIG[ProductType.SILVER],
    currentSupply: 1250,
    totalSupply: 10000,
    isActive: true,
    description: '60天期固定收益产品，适合新手投资者，低门槛高收益。',
  },
  {
    type: ProductType.GOLD,
    productType: 'gold' as const,
    ...PRODUCT_CONFIG[ProductType.GOLD],
    currentSupply: 2800,
    totalSupply: 5000,
    isActive: true,
    description: '90天期中级投资产品，平衡风险与收益的理想选择。',
  },
  {
    type: ProductType.DIAMOND,
    productType: 'diamond' as const,
    ...PRODUCT_CONFIG[ProductType.DIAMOND],
    currentSupply: 950,
    totalSupply: 1000,
    isActive: true,
    description: '180天期高级投资产品，为高净值投资者量身定制。',
  },
  {
    type: ProductType.PLATINUM,
    productType: 'platinum' as const,
    ...PRODUCT_CONFIG[ProductType.PLATINUM],
    currentSupply: 45,
    totalSupply: 100,
    isActive: true,
    description: '365天期顶级投资产品，高净值客户专享。',
  },
]

const filterOptions = [
  { key: 'all', label: '全部产品' },
  { key: 'silver', label: '白银系列' },
  { key: 'gold', label: '黄金系列' },
  { key: 'diamond', label: '钻石系列' },
  { key: 'platinum', label: '白金系列' },
]

const sortOptions = [
  { key: 'apr-desc', label: '收益率从高到低' },
  { key: 'apr-asc', label: '收益率从低到高' },
  { key: 'period-asc', label: '期限从短到长' },
  { key: 'period-desc', label: '期限从长到短' },
  { key: 'amount-asc', label: '起投金额从低到高' },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('apr-desc')
  const [filteredProducts, setFilteredProducts] = useState(products)

  // 过滤和排序逻辑
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    applyFiltersAndSort(filter, sortBy, searchTerm)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    applyFiltersAndSort(activeFilter, sort, searchTerm)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    applyFiltersAndSort(activeFilter, sortBy, search)
  }

  const applyFiltersAndSort = (filter: string, sort: string, search: string) => {
    let filtered = products

    // 应用搜索过滤
    if (search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 应用类型过滤
    if (filter !== 'all') {
      filtered = filtered.filter(product => product.productType === filter)
    }

    // 应用排序
    filtered.sort((a, b) => {
      switch (sort) {
        case 'apr-desc':
          return b.apr - a.apr
        case 'apr-asc':
          return a.apr - b.apr
        case 'period-asc':
          return a.duration - b.duration
        case 'period-desc':
          return b.duration - a.duration
        case 'amount-asc':
          return a.minInvestment - b.minInvestment
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* 页面头部 */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="qa-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                投资<span className="qa-gradient-text">产品</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                精选多种期限和收益率的USDT固定收益产品，满足不同投资需求。
                所有产品均由智能合约管理，收益透明可查。
              </p>

              {/* 关键特性 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">安全可靠</div>
                    <div className="text-sm text-muted-foreground">智能合约保障</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">固定收益</div>
                    <div className="text-sm text-muted-foreground">12%-18% APR</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">灵活期限</div>
                    <div className="text-sm text-muted-foreground">60-365天可选</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 产品筛选和搜索 */}
        <section className="py-8 bg-white border-b">
          <div className="qa-container">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* 搜索框 */}
              <div className="w-full lg:w-80">
                <FormInput
                  type="text"
                  placeholder="搜索产品..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>

              {/* 筛选和排序 */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* 产品类型筛选 */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex space-x-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleFilterChange(option.key)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          activeFilter === option.key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 hover:bg-gray-200 text-muted-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 排序选择 */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-input rounded-lg bg-background"
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* 产品列表 */}
        <section className="py-12 bg-gray-50">
          <div className="qa-container">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={`${product.name}-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <EnhancedProductCard
                      product={{
                        name: product.name,
                        apy: BigInt(product.apr * 100),
                        duration: BigInt(product.duration * 24 * 60 * 60),
                        minInvestment: BigInt(product.minInvestment * 1000000),
                        maxInvestment: BigInt(product.maxInvestment * 1000000),
                        isActive: product.isActive
                      }}
                      productId={product.type}
                      onPurchaseSuccess={() => {
                        // 跳转到具体产品页面
                        window.location.href = `/products/${product.productType}`
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">没有找到匹配的产品</h3>
                <p className="text-muted-foreground mb-6">
                  请尝试调整搜索条件或筛选选项
                </p>
                <Button onClick={() => {
                  setSearchTerm('')
                  setActiveFilter('all')
                  setSortBy('apr-desc')
                  setFilteredProducts(products)
                }}>
                  重置筛选条件
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 底部说明 */}
        <section className="py-12 bg-white">
          <div className="qa-container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-6">投资须知</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">产品特点</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 固定收益率，到期自动结算</li>
                    <li>• 基于以太坊智能合约执行</li>
                    <li>• 每笔投资生成唯一NFT凭证</li>
                    <li>• 支持USDT稳定币投资</li>
                    <li>• 24/7客户服务支持</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">风险提示</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 数字资产投资存在市场风险</li>
                    <li>• 过往收益不代表未来表现</li>
                    <li>• 请根据自身风险承受能力投资</li>
                    <li>• 注意保护个人钱包安全</li>
                    <li>• 建议分散投资降低风险</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}