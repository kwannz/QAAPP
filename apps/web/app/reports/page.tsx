'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Search,
  FileText,
  Activity,
  RefreshCw,
} from 'lucide-react';
// import Link from 'next/link';
import { useState } from 'react';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Header } from '../../components/layout/Header';
import { useSafeToast } from '../../lib/use-safe-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, WalletConnectionManager } from '@/components/ui';

// Mock data for reports
const mockReports = [
  {
    id: 'rpt-1',
    name: '投资组合月度报告',
    type: 'portfolio',
    period: '2024年1月',
    createdAt: '2024-02-01',
    status: 'completed',
    fileSize: '2.3MB',
    description: '详细分析1月份投资组合表现和收益情况',
  },
  {
    id: 'rpt-2',
    name: '风险评估报告',
    type: 'risk',
    period: '2024年Q1',
    createdAt: '2024-01-28',
    status: 'completed',
    fileSize: '1.8MB',
    description: '季度风险评估和投资建议报告',
  },
  {
    id: 'rpt-3',
    name: '收益分析报告',
    type: 'revenue',
    period: '2024年1月',
    createdAt: '2024-01-25',
    status: 'completed',
    fileSize: '3.1MB',
    description: '月度收益详细分析和趋势预测',
  },
  {
    id: 'rpt-4',
    name: '市场研究报告',
    type: 'market',
    period: '2024年1月',
    createdAt: '2024-02-03',
    status: 'processing',
    fileSize: null,
    description: '当前市场趋势和投资机会分析',
  },
];

const stats = {
  totalReports: 28,
  thisMonth: 4,
  avgDownloads: 156,
  lastGenerated: '2024-02-03',
};

const quickAnalytics = {
  portfolioValue: 33475,
  monthlyGrowth: 8.5,
  riskScore: 6.2,
  diversificationIndex: 74,
};

export default function ReportsPage() {
  const toast = useSafeToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'portfolio' | 'risk' | 'revenue' | 'market'>('all');
  const [_sortBy, _setSortBy] = useState<'date' | 'name' | 'type'>('date');

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'portfolio': return 'bg-blue-100 text-blue-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'market': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'portfolio': return '投资组合';
      case 'risk': return '风险评估';
      case 'revenue': return '收益分析';
      case 'market': return '市场研究';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'processing': return '生成中';
      case 'failed': return '失败';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const handleDownloadReport = (_reportId: string) => {
    toast.success('报告下载已开始');
  };

  const handleGenerateReport = () => {
    toast.success('开始生成新报告，预计5分钟完成');
  };

  const handleRefreshReports = () => {
    toast.success('报告列表已刷新');
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {/* 调试：已连接覆盖 */}
              {(() => {
                const debug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || process.env.NODE_ENV !== 'production';
                const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                const override = debug && sp?.get('e2e_wallet') === 'connected';
                if (override) {
                  return (
                    <Card>
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
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div>
                  <h1 className="text-3xl font-bold">报告中心</h1>
                  <p className="text-muted-foreground mt-2">
                    查看和下载您的投资报告，获取详细的数据分析
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" onClick={handleRefreshReports}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新
                  </Button>
                  <Button size="lg" onClick={handleGenerateReport}>
                    <FileText className="w-4 h-4 mr-2" />
                    生成报告
                  </Button>
                </div>
              </motion.div>

              {/* Quick Stats */}
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
                        <p className="text-sm text-muted-foreground">总报告数</p>
                        <p className="text-2xl font-bold">{stats.totalReports}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">本月生成</p>
                        <p className="text-2xl font-bold">{stats.thisMonth}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">平均下载量</p>
                        <p className="text-2xl font-bold">{stats.avgDownloads}</p>
                      </div>
                      <Download className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">最近生成</p>
                        <p className="text-2xl font-bold">{formatDate(stats.lastGenerated)}</p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      快速分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">投资组合价值</p>
                        <p className="text-xl font-semibold text-blue-600">
                          {formatCurrency(quickAnalytics.portfolioValue)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">月增长率</p>
                        <p className="text-xl font-semibold text-green-600">
                          +{quickAnalytics.monthlyGrowth}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">风险评分</p>
                        <p className="text-xl font-semibold text-orange-600">
                          {quickAnalytics.riskScore}/10
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">多元化指数</p>
                        <p className="text-xl font-semibold text-purple-600">
                          {quickAnalytics.diversificationIndex}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col md:flex-row gap-4 items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="搜索报告..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="报告类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="portfolio">投资组合</SelectItem>
                      <SelectItem value="risk">风险评估</SelectItem>
                      <SelectItem value="revenue">收益分析</SelectItem>
                      <SelectItem value="market">市场研究</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    高级筛选
                  </Button>
                </div>
              </motion.div>

              {/* Reports List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {filteredReports.map((report, _index) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{report.name}</h3>
                            <Badge className={getTypeColor(report.type)}>
                              {getTypeText(report.type)}
                            </Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusText(report.status)}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground text-sm">
                            {report.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">报告期间</p>
                              <p className="font-medium">{report.period}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">生成时间</p>
                              <p className="font-medium">{formatDate(report.createdAt)}</p>
                            </div>
                            {report.fileSize && (
                              <div>
                                <p className="text-muted-foreground">文件大小</p>
                                <p className="font-medium">{report.fileSize}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {report.status === 'completed' && (
                            <Button 
                              size="sm"
                              onClick={() => handleDownloadReport(report.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </Button>
                          )}
                          {report.status === 'processing' && (
                            <Button variant="outline" size="sm" disabled>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              生成中
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {filteredReports.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报告</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? '没有找到匹配的报告' : '您还没有任何报告'}
                    </p>
                    <Button onClick={handleGenerateReport}>
                      <FileText className="w-4 h-4 mr-2" />
                      生成第一份报告
                    </Button>
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
