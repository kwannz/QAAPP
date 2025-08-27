'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Search,
  Filter,
  Download,
  Calculator,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  RefreshCw,
  Settings
} from 'lucide-react';

interface Commission {
  id: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  orderId: string;
  commissionType: 'DIRECT_SALE' | 'REFERRAL_BONUS' | 'PERFORMANCE_BONUS';
  amount: number;
  rate: number;
  baseAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'FAILED';
  period: string;
  createdAt: string;
  paidAt?: string;
  level: number;
}

export default function AdminCommissionsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'calculate' | 'rules' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'PAID' | 'PROCESSING' | 'FAILED'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'DIRECT_SALE' | 'REFERRAL_BONUS' | 'PERFORMANCE_BONUS'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);

  // Mock data
  const commissionStats = {
    totalCommissions: 125000,
    pendingCommissions: 18500,
    paidCommissions: 106500,
    avgCommissionRate: 2.8,
    totalAgents: 25,
    activeAgents: 18,
    monthlyGrowth: 12.5,
    successRate: 98.5
  };

  const mockCommissions: Commission[] = [
    {
      id: 'comm-001',
      agentId: 'agt-001',
      agentName: '张代理',
      agentEmail: 'zhang.agent@example.com',
      orderId: 'ord-001',
      commissionType: 'DIRECT_SALE',
      amount: 300,
      rate: 3.0,
      baseAmount: 10000,
      status: 'PAID',
      period: '2024-01',
      level: 1,
      createdAt: '2024-01-15T10:30:00Z',
      paidAt: '2024-02-01T09:00:00Z'
    },
    {
      id: 'comm-002',
      agentId: 'agt-002',
      agentName: '李代理',
      agentEmail: 'li.agent@example.com',
      orderId: 'ord-002',
      commissionType: 'REFERRAL_BONUS',
      amount: 150,
      rate: 1.5,
      baseAmount: 10000,
      status: 'PENDING',
      period: '2024-01',
      level: 2,
      createdAt: '2024-01-20T14:15:00Z'
    },
    {
      id: 'comm-003',
      agentId: 'agt-003',
      agentName: '王代理',
      agentEmail: 'wang.agent@example.com',
      orderId: 'ord-003',
      commissionType: 'PERFORMANCE_BONUS',
      amount: 500,
      rate: 5.0,
      baseAmount: 10000,
      status: 'PROCESSING',
      period: '2024-01',
      level: 1,
      createdAt: '2024-01-25T16:45:00Z'
    }
  ];

  const commissionRules = {
    minCommissionThreshold: 10,
    maxCommissionRate: 10,
    payoutFrequency: 'monthly',
    holdingPeriod: 30,
    levelStructure: [
      { level: 1, rate: 3.0, bonusThreshold: 100000 },
      { level: 2, rate: 2.5, bonusThreshold: 50000 },
      { level: 3, rate: 2.0, bonusThreshold: 25000 },
      { level: 4, rate: 1.5, bonusThreshold: 10000 },
      { level: 5, rate: 1.0, bonusThreshold: 5000 }
    ]
  };

  const filteredCommissions = mockCommissions.filter(commission => {
    const matchesSearch = commission.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.agentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    const matchesType = typeFilter === 'all' || commission.commissionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectCommission = (commissionId: string) => {
    setSelectedCommissions(prev => 
      prev.includes(commissionId) 
        ? prev.filter(id => id !== commissionId)
        : [...prev, commissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCommissions.length === filteredCommissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(filteredCommissions.map(c => c.id));
    }
  };

  const getStatusIcon = (status: Commission['status']) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Commission['status']) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommissionTypeText = (type: Commission['commissionType']) => {
    switch (type) {
      case 'DIRECT_SALE':
        return '直销佣金';
      case 'REFERRAL_BONUS':
        return '推荐奖金';
      case 'PERFORMANCE_BONUS':
        return '绩效奖金';
      default:
        return '其他';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">佣金总额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${commissionStats.totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{commissionStats.monthlyGrowth}% 较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待发佣金</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${commissionStats.pendingCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              等待处理
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃代理商</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionStats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              总共 {commissionStats.totalAgents} 个代理商
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              支付成功率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>佣金趋势</CardTitle>
            <CardDescription>近6个月佣金发放趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>图表组件待集成</p>
                <p className="text-sm">显示月度佣金趋势数据</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>佣金类型分布</CardTitle>
            <CardDescription>按类型统计佣金分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm">直销佣金</span>
                </div>
                <div className="text-sm font-medium">60%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">推荐奖金</span>
                </div>
                <div className="text-sm font-medium">30%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-sm">绩效奖金</span>
                </div>
                <div className="text-sm font-medium">10%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索代理商或佣金ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">所有状态</option>
            <option value="PENDING">待处理</option>
            <option value="PROCESSING">处理中</option>
            <option value="PAID">已支付</option>
            <option value="FAILED">失败</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">所有类型</option>
            <option value="DIRECT_SALE">直销佣金</option>
            <option value="REFERRAL_BONUS">推荐奖金</option>
            <option value="PERFORMANCE_BONUS">绩效奖金</option>
          </select>
        </div>
      </div>

      {/* 批量操作 */}
      {selectedCommissions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-800">
            已选择 {selectedCommissions.length} 个佣金
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Send className="h-4 w-4 mr-2" />
              批量支付
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出选中
            </Button>
          </div>
        </div>
      )}

      {/* 佣金列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>佣金列表</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                高级筛选
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出全部
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCommissions.length === filteredCommissions.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4">佣金ID</th>
                  <th className="text-left py-3 px-4">代理商</th>
                  <th className="text-left py-3 px-4">类型</th>
                  <th className="text-left py-3 px-4">基础金额</th>
                  <th className="text-left py-3 px-4">费率</th>
                  <th className="text-left py-3 px-4">佣金</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">等级</th>
                  <th className="text-left py-3 px-4">创建时间</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.includes(commission.id)}
                        onChange={() => handleSelectCommission(commission.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{commission.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{commission.agentName}</div>
                        <div className="text-gray-500 text-xs">{commission.agentEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {getCommissionTypeText(commission.commissionType)}
                      </span>
                    </td>
                    <td className="py-3 px-4">${commission.baseAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">{commission.rate}%</td>
                    <td className="py-3 px-4 font-semibold">${commission.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(commission.status)}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(commission.status)}`}>
                          {commission.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        L{commission.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(commission.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCalculate = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            佣金计算
          </CardTitle>
          <CardDescription>
            为指定期间的代理商计算佣金
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="period">计算期间</Label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="2024-01">2024年1月</option>
                <option value="2024-02">2024年2月</option>
                <option value="2024-03">2024年3月</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agents">代理商范围</Label>
              <select
                id="agents"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">全部代理商</option>
                <option value="active">仅活跃代理商</option>
                <option value="specific">指定代理商</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="includeSubAgents" className="rounded" />
              <Label htmlFor="includeSubAgents">包含下级代理商</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="forceRecalculate" className="rounded" />
              <Label htmlFor="forceRecalculate">强制重新计算</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              开始计算
            </Button>
            <Button variant="outline">
              预览结果
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 计算历史 */}
      <Card>
        <CardHeader>
          <CardTitle>计算历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">2024年{i}月佣金计算</div>
                  <div className="text-sm text-gray-500">
                    计算了 25 个代理商，总金额 $18,500
                  </div>
                  <div className="text-xs text-gray-400">
                    2024-0{i+1}-01 09:00 完成
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    已完成
                  </span>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            佣金规则配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minThreshold">最小佣金阈值</Label>
              <Input
                id="minThreshold"
                type="number"
                value={commissionRules.minCommissionThreshold}
                placeholder="最小支付金额"
              />
              <p className="text-xs text-gray-500">低于此金额的佣金将累积到下次支付</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRate">最大佣金费率</Label>
              <Input
                id="maxRate"
                type="number"
                value={commissionRules.maxCommissionRate}
                placeholder="最大费率百分比"
              />
              <p className="text-xs text-gray-500">代理商佣金费率的上限</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutFreq">支付频率</Label>
              <select
                id="payoutFreq"
                value={commissionRules.payoutFrequency}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
                <option value="quarterly">每季度</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="holdingPeriod">持有期间</Label>
              <Input
                id="holdingPeriod"
                type="number"
                value={commissionRules.holdingPeriod}
                placeholder="天数"
              />
              <p className="text-xs text-gray-500">佣金产生后的最小持有天数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 等级结构 */}
      <Card>
        <CardHeader>
          <CardTitle>代理商等级结构</CardTitle>
          <CardDescription>配置不同等级的佣金费率和奖金阈值</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">等级</th>
                  <th className="text-left py-3 px-4">基础费率 (%)</th>
                  <th className="text-left py-3 px-4">奖金阈值 ($)</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {commissionRules.levelStructure.map((level) => (
                  <tr key={level.level} className="border-b">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        等级 {level.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">{level.rate}%</td>
                    <td className="py-3 px-4">${level.bonusThreshold.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              添加等级
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            佣金报表
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">月度佣金报表</h3>
                <p className="text-sm text-gray-600 mb-4">生成指定月份的详细佣金报表</p>
                <Button size="sm">生成报表</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">代理商绩效报表</h3>
                <p className="text-sm text-gray-600 mb-4">分析各代理商的佣金表现</p>
                <Button size="sm">生成报表</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">趋势分析报表</h3>
                <p className="text-sm text-gray-600 mb-4">佣金发放趋势和预测</p>
                <Button size="sm">生成报表</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 报表历史 */}
      <Card>
        <CardHeader>
          <CardTitle>报表历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">2024年{i}月佣金详细报表</div>
                  <div className="text-sm text-gray-500">
                    包含 {25 + i} 个代理商的详细数据
                  </div>
                  <div className="text-xs text-gray-400">
                    生成时间: 2024-0{i}-05 10:30
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    预览
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', label: '概览', icon: TrendingUp },
    { id: 'commissions', label: '佣金管理', icon: DollarSign },
    { id: 'calculate', label: '计算佣金', icon: Calculator },
    { id: 'rules', label: '规则配置', icon: Settings },
    { id: 'reports', label: '报表中心', icon: FileText }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">佣金管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理代理商佣金计算、支付和统计分析</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            批量支付
          </Button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 标签页内容 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'commissions' && renderCommissions()}
      {activeTab === 'calculate' && renderCalculate()}
      {activeTab === 'rules' && renderRules()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
}