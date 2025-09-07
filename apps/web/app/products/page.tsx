'use client';

import {
  TrendingUp,
  ShieldCheck,
  Clock,
  DollarSign,
  Calculator,
  Award,
  BarChart3,
  Lock,
  CheckCircle,
  ArrowRight,
  Info,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  WalletConnectionManager,
} from '@/components/ui';

interface Product {
  id: string;
  name: string;
  description: string;
  apy: string;
  minInvestment: string;
  duration: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'STABLE' | 'GROWTH' | 'PREMIUM';
  status: 'AVAILABLE' | 'SOLD_OUT' | 'COMING_SOON';
  features: string[];
  totalRaised: string;
  targetAmount: string;
  investorCount: number;
}

const mockProducts: Product[] = [
  {
    id: 'stable-1',
    name: 'USDT稳定理财',
    description: '基于USDT的稳定收益产品，适合稳健投资者',
    apy: '8.5%',
    minInvestment: '100 USDT',
    duration: '30天',
    riskLevel: 'LOW',
    category: 'STABLE',
    status: 'AVAILABLE',
    features: ['本金保障', '固定收益', '随时赎回', '透明安全'],
    totalRaised: '250,000 USDT',
    targetAmount: '500,000 USDT',
    investorCount: 128,
  },
  {
    id: 'growth-1', 
    name: 'ETH增长基金',
    description: '基于以太坊生态的增长型投资产品',
    apy: '12.3%',
    minInvestment: '0.1 ETH',
    duration: '90天',
    riskLevel: 'MEDIUM',
    category: 'GROWTH',
    status: 'AVAILABLE',
    features: ['ETH质押', 'DeFi收益', '复利增长', '专业管理'],
    totalRaised: '89.5 ETH',
    targetAmount: '200 ETH',
    investorCount: 64,
  },
  {
    id: 'premium-1',
    name: '高收益组合',
    description: '多元化投资组合，追求更高收益',
    apy: '18.9%',
    minInvestment: '1,000 USDT',
    duration: '180天',
    riskLevel: 'HIGH',
    category: 'PREMIUM',
    status: 'COMING_SOON',
    features: ['多链投资', '量化策略', '动态调仓', '专属服务'],
    totalRaised: '0 USDT',
    targetAmount: '1,000,000 USDT',
    investorCount: 0,
  },
];

const riskLevelConfig = {
  LOW: { label: '低风险', color: 'bg-green-100 text-green-800' },
  MEDIUM: { label: '中风险', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: '高风险', color: 'bg-red-100 text-red-800' },
};

const statusConfig = {
  AVAILABLE: { label: '可投资', color: 'bg-green-100 text-green-800' },
  SOLD_OUT: { label: '已售完', color: 'bg-gray-100 text-gray-800' },
  COMING_SOON: { label: '即将上线', color: 'bg-blue-100 text-blue-800' },
};

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', name: '全部产品', count: mockProducts.length },
    { id: 'STABLE', name: '稳健理财', count: mockProducts.filter(p => p.category === 'STABLE').length },
    { id: 'GROWTH', name: '增长基金', count: mockProducts.filter(p => p.category === 'GROWTH').length },
    { id: 'PREMIUM', name: '高收益', count: mockProducts.filter(p => p.category === 'PREMIUM').length },
  ];

  const filteredProducts = selectedCategory === 'ALL' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);

  const getPurchaseSlug = (product: Product) => {
    // 简单映射：按类别映射到购买页面的产品类型
    switch (product.category) {
      case 'STABLE':
        return 'silver';
      case 'GROWTH':
        return 'gold';
      case 'PREMIUM':
        return 'diamond';
      default:
        return 'silver';
    }
  };

  const renderProductCard = (product: Product) => {
    const riskConfig = riskLevelConfig[product.riskLevel];
    const statusConfigItem = statusConfig[product.status];
    const PERCENT = 100;
    const progress = parseFloat(product.totalRaised.replace(/[^0-9.]/g, '')) / parseFloat(product.targetAmount.replace(/[^0-9.]/g, '')) * PERCENT;

    return (
      <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={riskConfig.color}>
                {riskConfig.label}
              </Badge>
              <Badge className={statusConfigItem.color}>
                {statusConfigItem.label}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {product.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 收益率展示 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">预期年化收益率</p>
                <p className="text-2xl font-bold text-blue-900">{product.apy}</p>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">最低投资</p>
                <p className="text-sm font-medium">{product.minInvestment}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">投资期限</p>
                <p className="text-sm font-medium">{product.duration}</p>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">已募集资金</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, PERCENT)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{product.totalRaised}</span>
              <span>目标: {product.targetAmount}</span>
            </div>
          </div>

          {/* 投资人数 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600">{product.investorCount} 位投资者</span>
            </div>
            <div className="flex items-center gap-1">
              {['a','b','c','d','e'].map((pos) => (
                <Star key={`${product.id}-star-${pos}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          {/* 产品特点 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">产品特点:</p>
            <div className="flex flex-wrap gap-1">
              {product.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="pt-2">
            {product.status === 'AVAILABLE' ? (
              <Link href={`/products/purchase/${getPurchaseSlug(product)}`}>
                <Button className="w-full group">
                  立即投资
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : product.status === 'COMING_SOON' ? (
              <Button variant="outline" className="w-full" disabled>
                <Clock className="w-4 h-4 mr-1" />
                即将上线
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                <Lock className="w-4 h-4 mr-1" />
                已售完
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          {/* 调试：在开发/测试模式下，可通过 ?e2e_wallet=connected 覆盖为已连接状态 */}
          {(() => {
            const debug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || process.env.NODE_ENV !== 'production';
            const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const override = debug && sp?.get('e2e_wallet') === 'connected';
            if (override) {
              return (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>钱包连接</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WalletConnectionManager showNetworkInfo showContractStatus />
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              投资产品
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              专业精选的Web3固定收益产品，为您提供稳健的投资回报
            </p>
          </div>

          {/* 重要提示 */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>投资提醒：</strong>
              所有投资产品均存在风险，过往收益不代表未来表现。请根据自身风险承受能力合理配置资产。
              投资前请仔细阅读产品说明书和风险提示。
            </AlertDescription>
          </Alert>

          {/* 分类导航 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* 产品列表 */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(renderProductCard)}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  暂无产品
                </h3>
                <p className="text-gray-600 mb-4">
                  该分类下暂时没有可用的投资产品
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory('ALL')}
                >
                  查看全部产品
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 底部信息 */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                为什么选择QA投资平台？
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">安全保障</h4>
                  <p className="text-sm text-gray-600 text-center">
                    智能合约保护，资金链上透明，多重安全机制
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <Calculator className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">收益稳定</h4>
                  <p className="text-sm text-gray-600 text-center">
                    专业量化策略，历史收益稳定，风险控制严格
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">操作便捷</h4>
                  <p className="text-sm text-gray-600 text-center">
                    一键投资，实时查看，随时赎回，操作简单便捷
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
