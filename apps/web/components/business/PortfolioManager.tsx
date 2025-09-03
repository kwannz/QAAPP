'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'react-hot-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Package,
  PieChart,
  Activity,
  Info,
  ArrowRight,
  Plus,
  Eye
} from 'lucide-react'
import { ProductType, PRODUCT_CONFIG } from '@/lib/contracts/addresses'

// 类型定义 (整合自 positions 和 products)
interface Position {
  id: string
  userId: string
  productId: string
  orderId: string
  principal: number
  startDate: string
  endDate: string
  nextPayoutAt?: string
  currentValue: number
  totalEarnings: number
  status: 'active' | 'matured' | 'cancelled'
  product: Product
}

interface Product {
  id: string
  name: string
  description: string
  type: ProductType
  expectedReturn: number
  minInvestment: number
  maxInvestment: number
  duration: number
  isActive: boolean
  totalInvested: number
  availableCapacity: number
  riskLevel: 'low' | 'medium' | 'high'
  currency: 'USDT' | 'ETH'
}

interface PortfolioSummary {
  totalValue: number
  totalEarnings: number
  activePositions: number
  averageReturn: number
  monthlyIncome: number
}

interface PortfolioManagerProps {
  userId?: string
  showProductCatalog?: boolean
  showPositionDetails?: boolean
  className?: string
}

export function PortfolioManager({ 
  userId, 
  showProductCatalog = true,
  showPositionDetails = true,
  className = '' 
}: PortfolioManagerProps) {
  const [positions, setPositions] = useState<Position[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // API 服务函数
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  })

  const fetchUserPositions = async () => {
    const response = await fetch(`${API_BASE_URL}/finance/positions`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('获取持仓信息失败')
    const data = await response.json()
    return data.data || []
  }

  const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/finance/products`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('获取产品信息失败')
    const data = await response.json()
    return data.data || []
  }

  const fetchPortfolioSummary = async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/portfolio`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('获取投资组合摘要失败')
    const data = await response.json()
    return data
  }

  const createOrder = async (productId: string, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/finance/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        productId,
        usdtAmount: amount
      })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '创建订单失败')
    }
    return response.json()
  }

  const loadData = async () => {
    if (!localStorage.getItem('token')) {
      console.error('No auth token found')
      return
    }

    setIsLoading(true)
    try {
      const [positionsData, productsData, summaryData] = await Promise.all([
        fetchUserPositions().catch(() => []),
        fetchProducts().catch(() => []),
        fetchPortfolioSummary().catch(() => ({
          totalValue: 0,
          totalEarnings: 0,
          activePositions: 0,
          averageReturn: 0,
          monthlyIncome: 0
        }))
      ])
      
      setPositions(positionsData)
      setProducts(productsData)
      setSummary(summaryData)
    } catch (error: any) {
      console.error('Failed to load portfolio data:', error)
      // Set empty states to avoid errors
      setPositions([])
      setProducts([])
      setSummary({
        totalValue: 0,
        totalEarnings: 0,
        activePositions: 0,
        averageReturn: 0,
        monthlyIncome: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleProductPurchase = async (product: Product, amount: number) => {
    setIsLoading(true)
    try {
      await createOrder(product.id, amount)
      
      toast.success(`成功投资 ¥${amount.toLocaleString()} 到 ${product.name}`)
      
      // 刷新数据
      await loadData()
      
    } catch (error: any) {
      console.error('Investment failed:', error)
      toast.error(`投资失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">¥{summary.totalValue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">总资产价值</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">¥{summary.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">总收益</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{summary.activePositions}</div>
                  <div className="text-sm text-muted-foreground">活跃投资</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{summary.averageReturn}%</div>
                  <div className="text-sm text-muted-foreground">平均收益率</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <div>
                  <div className="text-2xl font-bold">¥{summary.monthlyIncome.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">月度收入</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const renderPositions = () => (
    <div className="space-y-4">
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <div className="text-muted-foreground">
              加载投资头寸中...
            </div>
          </CardContent>
        </Card>
      ) : positions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              暂无投资头寸
            </div>
          </CardContent>
        </Card>
      ) : (
        positions.map((position) => (
          <Card key={position.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">{position.product.name}</h3>
                  <p className="text-sm text-muted-foreground">{position.product.description}</p>
                  <div className="mt-2">
                    <Badge variant={
                      position.status === 'active' ? 'default' :
                      position.status === 'matured' ? 'secondary' : 'destructive'
                    }>
                      {position.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">本金:</span>
                    <span className="font-medium">¥{position.principal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">当前价值:</span>
                    <span className="font-medium">¥{position.currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">总收益:</span>
                    <span className="font-medium text-green-600">+¥{position.totalEarnings.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">开始日期:</span>
                    <span className="text-sm">{new Date(position.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">到期日期:</span>
                    <span className="text-sm">{new Date(position.endDate).toLocaleDateString()}</span>
                  </div>
                  {position.nextPayoutAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">下次分红:</span>
                      <span className="text-sm">{new Date(position.nextPayoutAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    查看详情
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{product.name}</span>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? '可投资' : '已停止'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">预期年化收益</div>
                  <div className="text-xl font-bold text-green-600">{product.expectedReturn}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">投资期限</div>
                  <div className="text-xl font-bold">{product.duration}天</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">最小投资:</span>
                  <span className="text-sm font-medium">¥{product.minInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">最大投资:</span>
                  <span className="text-sm font-medium">¥{product.maxInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">风险等级:</span>
                  <Badge variant={
                    product.riskLevel === 'low' ? 'secondary' :
                    product.riskLevel === 'medium' ? 'outline' : 'destructive'
                  }>
                    {product.riskLevel === 'low' ? '低风险' : 
                     product.riskLevel === 'medium' ? '中风险' : '高风险'}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>投资进度</span>
                  <span>{((product.totalInvested / (product.totalInvested + product.availableCapacity)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(product.totalInvested / (product.totalInvested + product.availableCapacity)) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  onClick={() => setSelectedProduct(product)}
                  disabled={!product.isActive}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  立即投资
                </Button>
                <Button variant="outline" size="icon">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedProduct && (
        <ProductInvestmentModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onInvest={handleProductPurchase}
        />
      )}
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>投资组合分布</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => {
                const userPosition = positions.find(p => p.productId === product.id)
                const percentage = userPosition ? ((userPosition.currentValue / (summary?.totalValue || 1)) * 100) : 0
                
                return (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: product.type === 'FIXED_INCOME' ? '#3b82f6' : '#10b981' }}
                      />
                      <span className="text-sm">{product.name}</span>
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>收益趋势</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              收益趋势图表 - 等待图表库集成
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // This function is now defined above in the component

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">投资组合管理</h2>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <PieChart className="w-4 h-4" />
            <span>总览</span>
          </TabsTrigger>
          
          {showPositionDetails && (
            <TabsTrigger value="positions" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>持仓</span>
            </TabsTrigger>
          )}
          
          {showProductCatalog && (
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>产品</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>
        
        {showPositionDetails && (
          <TabsContent value="positions" className="space-y-6">
            {renderPositions()}
          </TabsContent>
        )}
        
        {showProductCatalog && (
          <TabsContent value="products" className="space-y-6">
            {renderProducts()}
          </TabsContent>
        )}
        
        <TabsContent value="analytics" className="space-y-6">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Modal for product investment (简化版本)
function ProductInvestmentModal({ 
  product, 
  onClose, 
  onInvest 
}: { 
  product: Product
  onClose: () => void
  onInvest: (product: Product, amount: number) => void
}) {
  const [amount, setAmount] = useState('')

  const handleInvest = () => {
    const investAmount = parseFloat(amount)
    if (investAmount >= product.minInvestment && investAmount <= product.maxInvestment) {
      onInvest(product, investAmount)
      onClose()
    }
  }

  return (
    <Card className="fixed inset-4 z-50 bg-white shadow-xl">
      <CardHeader>
        <CardTitle>投资 {product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          placeholder="投资金额"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={product.minInvestment}
          max={product.maxInvestment}
        />
        
        <div className="flex space-x-2">
          <Button onClick={handleInvest} disabled={!amount}>
            确认投资
          </Button>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for portfolio management
export function usePortfolioManager(userId?: string) {
  const [isEnabled, setIsEnabled] = useState(true)
  
  return { isEnabled }
}