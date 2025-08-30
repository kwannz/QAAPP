'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  ShoppingBag, 
  Plus, 
  Eye, 
  Check, 
  X, 
  Clock, 
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Edit,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react'

// 类型定义
interface Product {
  id: string
  symbol: string
  name: string
  description: string
  minAmount: number
  maxAmount: number | null
  aprBps: number
  lockDays: number
  totalSupply: number | null
  currentSupply: number
  isActive: boolean
  startsAt: string
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

interface ProductStats {
  total: number
  active: number
  inactive: number
  totalInvested: number
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    minAPR: '',
    maxAPR: '',
  })
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    product: Product | null
    mode: 'create' | 'edit'
  }>({
    open: false,
    product: null,
    mode: 'create',
  })
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    aprBps: '',
    lockDays: '',
    totalSupply: '',
    isActive: true,
    startsAt: '',
    endsAt: '',
  })

  // 模拟数据
  const mockProducts: Product[] = [
    {
      id: 'prod_001',
      symbol: 'USDT-30D',
      name: 'USDT稳定收益30天',
      description: '30天锁定期，稳定收益产品，适合稳健投资者',
      minAmount: 100,
      maxAmount: 50000,
      aprBps: 800, // 8%
      lockDays: 30,
      totalSupply: 1000,
      currentSupply: 750,
      isActive: true,
      startsAt: '2024-03-01T00:00:00Z',
      endsAt: '2024-06-30T23:59:59Z',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-20T14:30:00Z',
    },
    {
      id: 'prod_002',
      symbol: 'USDT-90D',
      name: 'USDT高收益90天',
      description: '90天锁定期，高收益产品，适合长期投资者',
      minAmount: 1000,
      maxAmount: 100000,
      aprBps: 1200, // 12%
      lockDays: 90,
      totalSupply: 500,
      currentSupply: 320,
      isActive: true,
      startsAt: '2024-03-01T00:00:00Z',
      endsAt: '2024-12-31T23:59:59Z',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-15T09:20:00Z',
    },
    {
      id: 'prod_003',
      symbol: 'USDT-365D',
      name: 'USDT年度投资计划',
      description: '一年期锁定，最高收益产品',
      minAmount: 5000,
      maxAmount: null,
      aprBps: 1800, // 18%
      lockDays: 365,
      totalSupply: null,
      currentSupply: 45,
      isActive: false,
      startsAt: '2024-04-01T00:00:00Z',
      endsAt: null,
      createdAt: '2024-03-10T15:00:00Z',
      updatedAt: '2024-03-18T11:45:00Z',
    },
  ]

  const mockStats: ProductStats = {
    total: 3,
    active: 2,
    inactive: 1,
    totalInvested: 8750000,
  }

  useEffect(() => {
    loadProducts()
    loadStats()
  }, [filters])

  const loadProducts = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 500)
  }

  const loadStats = async () => {
    // 模拟API调用
    setTimeout(() => {
      setStats(mockStats)
    }, 300)
  }

  const handleCreateProduct = async () => {
    try {
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        symbol: formData.symbol,
        name: formData.name,
        description: formData.description,
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        aprBps: parseInt(formData.aprBps),
        lockDays: parseInt(formData.lockDays),
        totalSupply: formData.totalSupply ? parseInt(formData.totalSupply) : null,
        currentSupply: 0,
        isActive: formData.isActive,
        startsAt: formData.startsAt,
        endsAt: formData.endsAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setProducts([newProduct, ...products])
      setEditDialog({ open: false, product: null, mode: 'create' })
      resetForm()
      alert('产品创建成功')
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('产品创建失败')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editDialog.product) return

    try {
      const updatedProduct: Product = {
        ...editDialog.product,
        symbol: formData.symbol,
        name: formData.name,
        description: formData.description,
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        aprBps: parseInt(formData.aprBps),
        lockDays: parseInt(formData.lockDays),
        totalSupply: formData.totalSupply ? parseInt(formData.totalSupply) : null,
        isActive: formData.isActive,
        startsAt: formData.startsAt,
        endsAt: formData.endsAt || null,
        updatedAt: new Date().toISOString(),
      }

      setProducts(products.map(p => p.id === editDialog.product!.id ? updatedProduct : p))
      setEditDialog({ open: false, product: null, mode: 'create' })
      resetForm()
      alert('产品更新成功')
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('产品更新失败')
    }
  }

  const handleToggleStatus = async (productId: string, isActive: boolean) => {
    try {
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isActive, updatedAt: new Date().toISOString() } : p
      ))
      alert(`产品已${isActive ? '启用' : '禁用'}`)
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      alert('状态更新失败')
    }
  }

  const openEditDialog = (product: Product | null, mode: 'create' | 'edit') => {
    if (product && mode === 'edit') {
      setFormData({
        symbol: product.symbol,
        name: product.name,
        description: product.description,
        minAmount: product.minAmount.toString(),
        maxAmount: product.maxAmount?.toString() || '',
        aprBps: product.aprBps.toString(),
        lockDays: product.lockDays.toString(),
        totalSupply: product.totalSupply?.toString() || '',
        isActive: product.isActive,
        startsAt: product.startsAt.split('T')[0],
        endsAt: product.endsAt ? product.endsAt.split('T')[0] : '',
      })
    } else {
      resetForm()
    }
    setEditDialog({ open: true, product, mode })
  }

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      description: '',
      minAmount: '',
      maxAmount: '',
      aprBps: '',
      lockDays: '',
      totalSupply: '',
      isActive: true,
      startsAt: '',
      endsAt: '',
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatAPR = (aprBps: number) => {
    return (aprBps / 100).toFixed(2) + '%'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const filteredProducts = products.filter(product => {
    if (filters.status) {
      if (filters.status === 'active' && !product.isActive) return false
      if (filters.status === 'inactive' && product.isActive) return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.symbol.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    }
    if (filters.minAPR) {
      const minAPR = parseInt(filters.minAPR)
      if (product.aprBps < minAPR) return false
    }
    if (filters.maxAPR) {
      const maxAPR = parseInt(filters.maxAPR)
      if (product.aprBps > maxAPR) return false
    }
    return true
  })

  return (
    <AdminGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面标题 */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">产品管理</h1>
              <p className="text-muted-foreground">
                管理投资产品和收益计划
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => loadProducts()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button onClick={() => openEditDialog(null, 'create')}>
                <Plus className="h-4 w-4 mr-2" />
                新建产品
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总产品数
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    系统中的所有产品
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    活跃产品
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    正在销售的产品
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    暂停产品
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inactive}</div>
                  <p className="text-xs text-muted-foreground">
                    已暂停的产品
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总投资额
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatAmount(stats.totalInvested)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    累计投资金额
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 筛选器 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                筛选条件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="搜索产品名称、代码或描述..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>状态</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>最低年化收益</Label>
                  <Input
                    placeholder="如: 800 (8%)"
                    className="w-[150px]"
                    value={filters.minAPR}
                    onChange={(e) => setFilters({ ...filters, minAPR: e.target.value })}
                  />
                </div>
                <div>
                  <Label>最高年化收益</Label>
                  <Input
                    placeholder="如: 1200 (12%)"
                    className="w-[150px]"
                    value={filters.maxAPR}
                    onChange={(e) => setFilters({ ...filters, maxAPR: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 产品列表 */}
          <Card>
            <CardHeader>
              <CardTitle>产品列表</CardTitle>
              <CardDescription>
                共 {filteredProducts.length} 个产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge className="text-xs">{product.symbol}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColors[product.isActive ? 'active' : 'inactive']}>
                          {product.isActive ? '活跃' : '暂停'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">年化收益</div>
                        <div className="font-medium text-green-600">
                          {formatAPR(product.aprBps)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">锁定期</div>
                        <div className="font-medium">
                          {product.lockDays} 天
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">投资范围</div>
                        <div className="font-medium">
                          {formatAmount(product.minAmount)} - {
                            product.maxAmount ? formatAmount(product.maxAmount) : '无限制'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">供应情况</div>
                        <div className="font-medium">
                          {product.currentSupply} / {product.totalSupply || '∞'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">开始时间</div>
                        <div>{formatDateTime(product.startsAt)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">结束时间</div>
                        <div>{product.endsAt ? formatDateTime(product.endsAt) : '无限期'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        更新时间: {formatDateTime(product.updatedAt)}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(product, 'edit')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant={product.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleStatus(product.id, !product.isActive)}
                        >
                          {product.isActive ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              禁用
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              启用
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredProducts.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    没有找到符合条件的产品
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    加载中...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 编辑产品对话框 */}
        <Dialog 
          open={editDialog.open} 
          onOpenChange={(open) => !open && setEditDialog({ open: false, product: null, mode: 'create' })}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editDialog.mode === 'create' ? '创建新产品' : '编辑产品'}
              </DialogTitle>
              <DialogDescription>
                {editDialog.mode === 'create' ? '创建一个新的投资产品' : '修改产品信息'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">产品代码 *</Label>
                  <Input
                    id="symbol"
                    placeholder="如: USDT-30D"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="name">产品名称 *</Label>
                  <Input
                    id="name"
                    placeholder="如: USDT稳定收益30天"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">产品描述</Label>
                <Textarea
                  id="description"
                  placeholder="描述产品特点和适用人群"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAmount">最小投资额 *</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    placeholder="100"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAmount">最大投资额</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    placeholder="留空表示无限制"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aprBps">年化收益率 (基点) *</Label>
                  <Input
                    id="aprBps"
                    type="number"
                    placeholder="800 (表示8%)"
                    value={formData.aprBps}
                    onChange={(e) => setFormData({ ...formData, aprBps: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lockDays">锁定天数 *</Label>
                  <Input
                    id="lockDays"
                    type="number"
                    placeholder="30"
                    value={formData.lockDays}
                    onChange={(e) => setFormData({ ...formData, lockDays: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="totalSupply">总供应量</Label>
                <Input
                  id="totalSupply"
                  type="number"
                  placeholder="留空表示无限制"
                  value={formData.totalSupply}
                  onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt">开始时间 *</Label>
                  <Input
                    id="startsAt"
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endsAt">结束时间</Label>
                  <Input
                    id="endsAt"
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">立即启用产品</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialog({ open: false, product: null, mode: 'create' })}
              >
                取消
              </Button>
              <Button
                onClick={editDialog.mode === 'create' ? handleCreateProduct : handleUpdateProduct}
              >
                {editDialog.mode === 'create' ? '创建' : '保存'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  )
}