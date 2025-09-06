'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Star,
  ArrowUpRight,
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Activity,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, Alert, AlertDescription } from '@/components/ui';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Header } from '../../components/layout/Header';
import { useSafeToast } from '../../lib/use-safe-toast';

// Mock data for investments
const mockInvestments = [
  {
    id: 'inv-1',
    productName: 'QA黄金卡',
    productType: 'gold',
    principal: 10000,
    currentValue: 11250,
    pnl: 1250,
    pnlPercentage: 12.5,
    apr: 15,
    purchaseDate: '2024-01-15',
    maturityDate: '2024-03-15',
    status: 'active',
    nextPayout: '2024-02-15',
    payoutAmount: 41.67
  },
  {
    id: 'inv-2',
    productName: 'QA钻石卡',
    productType: 'diamond',
    principal: 15000,
    currentValue: 16600,
    pnl: 1600,
    pnlPercentage: 10.67,
    apr: 18,
    purchaseDate: '2024-01-01',
    maturityDate: '2024-04-01',
    status: 'active',
    nextPayout: '2024-02-01',
    payoutAmount: 74.18
  },
  {
    id: 'inv-3',
    productName: 'QA白银卡',
    productType: 'silver',
    principal: 5000,
    currentValue: 5125,
    pnl: 125,
    pnlPercentage: 2.5,
    apr: 12,
    purchaseDate: '2024-01-20',
    maturityDate: '2024-02-20',
    status: 'completed',
    nextPayout: null,
    payoutAmount: 0
  }
];

const stats = {
  totalInvested: 30000,
  currentValue: 33475,
  totalPnL: 2975,
  totalPnLPercentage: 9.92,
  activeInvestments: 2,
  completedInvestments: 1,
  pendingPayouts: 115.85
};

export default function InvestmentsPage() {
  const toast = useSafeToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'pnl'>('date');

  const filteredInvestments = mockInvestments.filter(investment => {
    const matchesSearch = investment.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || investment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'completed': return '已完成';
      case 'pending': return '待处理';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const handleViewDetails = (investmentId: string) => {
    toast.success(`查看投资详情: ${investmentId}`);
  };

  const handleClaimPayout = (investmentId: string) => {
    toast.success('收益领取成功');
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div>
                  <h1 className="text-3xl font-bold">投资管理</h1>
                  <p className="text-muted-foreground mt-2">
                    管理您的投资组合，查看收益情况和投资详情
                  </p>
                </div>
                <Link href="/products">
                  <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    新增投资
                  </Button>
                </Link>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">总投资金额</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">当前价值</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.currentValue)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">总盈亏</p>
                        <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.totalPnL >= 0 ? '+' : ''}{formatCurrency(stats.totalPnL)}
                        </p>
                        <p className={`text-xs ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnLPercentage.toFixed(2)}%
                        </p>
                      </div>
                      <PieChart className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">活跃投资</p>
                        <p className="text-2xl font-bold">{stats.activeInvestments}</p>
                        <p className="text-xs text-muted-foreground">
                          总计 {stats.activeInvestments + stats.completedInvestments} 项投资
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4 items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="搜索投资产品..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部状态</option>
                    <option value="active">活跃</option>
                    <option value="completed">已完成</option>
                    <option value="pending">待处理</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </motion.div>

              {/* Investments List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {filteredInvestments.map((investment, index) => (
                  <Card key={investment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{investment.productName}</h3>
                            <Badge className={getStatusColor(investment.status)}>
                              {getStatusText(investment.status)}
                            </Badge>
                            {investment.status === 'active' && (
                              <Badge variant="outline" className="text-green-600">
                                {investment.apr}% APR
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">投资金额</p>
                              <p className="font-medium">{formatCurrency(investment.principal)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">当前价值</p>
                              <p className="font-medium">{formatCurrency(investment.currentValue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">盈亏</p>
                              <p className={`font-medium ${investment.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {investment.pnl >= 0 ? '+' : ''}{formatCurrency(investment.pnl)}
                                <span className="ml-1 text-xs">
                                  ({investment.pnl >= 0 ? '+' : ''}{investment.pnlPercentage.toFixed(2)}%)
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">购买日期</p>
                              <p className="font-medium">{formatDate(investment.purchaseDate)}</p>
                            </div>
                          </div>

                          {investment.status === 'active' && investment.nextPayout && (
                            <Alert>
                              <Calendar className="h-4 w-4" />
                              <AlertDescription>
                                下次分红: {formatDate(investment.nextPayout)} - {formatCurrency(investment.payoutAmount)}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(investment.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </Button>
                          {investment.status === 'active' && investment.payoutAmount > 0 && (
                            <Button 
                              size="sm"
                              onClick={() => handleClaimPayout(investment.id)}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              领取收益
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {filteredInvestments.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无投资记录</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? '没有找到匹配的投资记录' : '您还没有任何投资记录'}
                    </p>
                    <Link href="/products">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        开始投资
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}