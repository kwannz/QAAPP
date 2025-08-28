'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Info, Shield, Wallet, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'

import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Alert, AlertDescription } from '@/components/ui'
import { Header } from '../../../components/layout/Header'
import { Footer } from '../../../components/layout/Footer'
import { ProductPurchase } from '../../../components/products/ProductPurchase'
import { PRODUCT_CONFIG, ProductType } from '../../../lib/contracts/addresses'

// 产品类型映射
const productTypeMap: Record<string, ProductType> = {
  'silver': ProductType.SILVER,
  'gold': ProductType.GOLD,
  'diamond': ProductType.DIAMOND,
  'platinum': ProductType.PLATINUM,
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showPurchase, setShowPurchase] = useState(false)
  
  const productType = productTypeMap[params.type as string]
  const productConfig = productType !== undefined ? PRODUCT_CONFIG[productType] : null
  
  // 如果产品类型不存在，重定向到产品列表页
  useEffect(() => {
    if (params.type && !productConfig) {
      router.push('/products')
    }
  }, [params.type, productConfig, router])
  
  if (!productConfig) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">产品不存在</h1>
            <p className="text-muted-foreground mb-4">您访问的产品页面不存在</p>
            <Link href="/products">
              <Button>返回产品列表</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  const features = [
    {
      icon: Shield,
      title: '智能合约保障',
      description: '基于以太坊区块链的智能合约执行，资金安全透明'
    },
    {
      icon: TrendingUp,
      title: '固定收益保证',
      description: `年化收益率 ${productConfig.apr}%，到期自动结算无需人工干预`
    },
    {
      icon: Clock,
      title: '灵活投资期限',
      description: `${productConfig.duration}天投资周期，适合不同资金规划需求`
    },
    {
      icon: Users,
      title: '专业团队管理',
      description: '由经验丰富的DeFi团队负责资产配置和风险控制'
    }
  ]
  
  const handlePurchaseSuccess = () => {
    setShowPurchase(false)
    router.push('/dashboard')
  }
  
  const handlePurchaseError = (error: string) => {
    console.error('Purchase error:', error)
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* 返回按钮 */}
        <div className="border-b bg-white">
          <div className="qa-container py-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回产品列表
              </Button>
            </Link>
          </div>
        </div>
        
        {/* 产品详情头部 */}
        <section className={`bg-gradient-to-br ${productConfig.color} py-16 text-white`}>
          <div className="qa-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{productConfig.icon}</div>
                <div>
                  <Badge className="mb-2 bg-white/20 text-white border-white/30">
                    {productConfig.apr}% APR
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {productConfig.name}
                  </h1>
                  <p className="text-xl text-white/90 mt-2">
                    {productConfig.duration}天期固定收益产品，为您提供稳定的投资回报
                  </p>
                </div>
              </div>
              
              {/* 关键指标 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-white/70 text-sm">年化收益率</p>
                  <p className="text-2xl font-bold">{productConfig.apr}%</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-white/70 text-sm">投资期限</p>
                  <p className="text-2xl font-bold">{productConfig.duration}天</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-white/70 text-sm">最小投资</p>
                  <p className="text-2xl font-bold">{productConfig.minInvestment.toLocaleString()}</p>
                  <p className="text-white/70 text-xs">USDT</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-white/70 text-sm">最大投资</p>
                  <p className="text-2xl font-bold">{productConfig.maxInvestment.toLocaleString()}</p>
                  <p className="text-white/70 text-xs">USDT</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* 产品详情内容 */}
        <section className="py-16 bg-gray-50">
          <div className="qa-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* 左侧：产品介绍 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-4">产品特色</h2>
                  <div className="grid gap-6">
                    {features.map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${productConfig.color} flex items-center justify-center text-white flex-shrink-0`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* 收益计算示例 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      收益计算示例
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">假设投资 10,000 USDT</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">投资期限</span>
                            <span>{productConfig.duration} 天</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">日收益率</span>
                            <span>{(productConfig.apr / 365).toFixed(4)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">预期总收益</span>
                            <span className="text-green-600 font-medium">
                              {(10000 * productConfig.apr / 100 * productConfig.duration / 365).toFixed(2)} USDT
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>到期总金额</span>
                            <span className="text-green-600">
                              {(10000 * (1 + productConfig.apr / 100 * productConfig.duration / 365)).toFixed(2)} USDT
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          实际收益可能因市场条件而有所不同，以上仅为理论计算
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 风险提示 */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-600">投资风险提示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• 数字资产投资存在价格波动风险</li>
                      <li>• 智能合约可能存在技术风险</li>
                      <li>• 请勿投入超过您承受能力的资金</li>
                      <li>• 建议分散投资以降低风险</li>
                      <li>• 过往收益不代表未来表现</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* 右侧：购买组件 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="lg:sticky lg:top-8"
              >
                {!showPurchase ? (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>立即投资</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">{productConfig.icon}</div>
                        <h3 className="font-semibold">{productConfig.name}</h3>
                        <Badge className={`bg-gradient-to-r ${productConfig.color} text-white`}>
                          {productConfig.apr}% APR
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">投资范围</span>
                          <span className="font-medium">
                            {productConfig.minInvestment.toLocaleString()} - {productConfig.maxInvestment.toLocaleString()} USDT
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">投资期限</span>
                          <span className="font-medium">{productConfig.duration} 天</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">预期年化收益</span>
                          <span className="font-medium text-green-600">{productConfig.apr}%</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setShowPurchase(true)}
                        className="w-full"
                        size="lg"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        开始投资
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        投资成功后将获得对应的NFT投资凭证
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPurchase(false)}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      返回产品详情
                    </Button>
                    
                    <ProductPurchase
                      productType={productType}
                      onSuccess={handlePurchaseSuccess}
                      onError={handlePurchaseError}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}