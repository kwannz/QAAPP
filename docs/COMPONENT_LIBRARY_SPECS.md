# 🧩 组件库规范
## Web3固定收益平台专业组件库

> **基于shadcn/ui扩展**：结合金融产品特性，为Web3应用量身定制的企业级组件库

---

## 1. 🏗️ 架构设计

### 组件分层架构
```
┌─────────────────────────────────────┐
│          业务组件层                  │ ← NFTCard, PurchaseFlow, WalletConnect
├─────────────────────────────────────┤
│          复合组件层                  │ ← DataTable, Charts, Forms
├─────────────────────────────────────┤
│         shadcn/ui基础层              │ ← Button, Input, Dialog, Card
├─────────────────────────────────────┤
│        Radix UI原子层               │ ← Primitives, Hooks
└─────────────────────────────────────┘
```

### 技术栈选择
```typescript
// 核心依赖
- React 18+ (并发特性)
- TypeScript 5+ (严格模式)
- Tailwind CSS 3+ (原子化CSS)
- Radix UI (无障碍原语)
- Framer Motion (动画)
- Lucide React (图标)

// Web3 集成
- wagmi (React钩子)
- viem (以太坊交互)
- @rainbow-me/rainbowkit (钱包连接)
```

---

## 2. 💎 NFT卡片组件 (NFTCard)

### 组件接口定义
```typescript
interface NFTCardProps {
  // 基础属性
  type: 'silver' | 'gold' | 'diamond';
  title: string;
  description?: string;
  
  // 投资参数
  minAmount: number;
  maxAmount?: number;
  apr: number;
  lockDays: number;
  
  // 状态控制
  available: boolean;
  stock?: number;
  isLoading?: boolean;
  
  // 交互回调
  onPurchase: (type: string, amount: number) => void;
  onLearnMore?: () => void;
  
  // 样式定制
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}
```

### 视觉设计规范
```tsx
const NFTCard: React.FC<NFTCardProps> = ({ 
  type, 
  title, 
  minAmount, 
  apr, 
  lockDays, 
  available,
  onPurchase 
}) => {
  // 卡片主题映射
  const cardThemes = {
    silver: {
      gradient: 'from-slate-100 to-slate-200',
      accent: 'text-slate-600',
      button: 'bg-slate-500 hover:bg-slate-600',
      icon: '🥈'
    },
    gold: {
      gradient: 'from-yellow-100 to-yellow-200', 
      accent: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600',
      icon: '🥇'
    },
    diamond: {
      gradient: 'from-purple-100 to-purple-200',
      accent: 'text-purple-600', 
      button: 'bg-purple-500 hover:bg-purple-600',
      icon: '💎'
    }
  };

  const theme = cardThemes[type];

  return (
    <Card className={`
      relative overflow-hidden
      bg-gradient-to-br ${theme.gradient}
      border-2 border-white/20
      shadow-lg hover:shadow-xl
      transition-all duration-300
      ${available ? 'hover:scale-105' : 'opacity-60'}
    `}>
      {/* 卡片头部 */}
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">{theme.icon}</div>
        <CardTitle className={`text-xl font-bold ${theme.accent}`}>
          {title}
        </CardTitle>
      </CardHeader>

      {/* 核心信息 */}
      <CardContent className="space-y-4">
        <div className="bg-white/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">起投金额</span>
            <span className="font-mono font-bold">
              {minAmount.toLocaleString()} USDT
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">年化收益</span>
            <span className="font-mono font-bold text-green-600">
              {apr}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">锁定期</span>
            <span className="font-mono font-bold">
              {lockDays}天
            </span>
          </div>
        </div>

        {/* 收益预览 */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 mb-1">月收益预览</p>
          <p className="font-mono text-lg font-bold text-green-700">
            {(minAmount * apr / 100 / 12).toFixed(2)} USDT
          </p>
        </div>
      </CardContent>

      {/* 操作按钮 */}
      <CardFooter className="flex gap-2 pt-4">
        <Button 
          className={`flex-1 ${theme.button} text-white font-semibold`}
          disabled={!available}
          onClick={() => onPurchase(type, minAmount)}
        >
          {available ? '立即购买' : '暂未开放'}
        </Button>
        
        <Button variant="outline" size="sm">
          了解详情
        </Button>
      </CardFooter>

      {/* 风险提示 */}
      <div className="px-6 pb-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-xs text-orange-700">
            投资有风险，请仔细阅读风险揭示书
          </AlertDescription>
        </Alert>
      </div>

      {/* 库存标识 */}
      {!available && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            已售罄
          </Badge>
        </div>
      )}
    </Card>
  );
};
```

---

## 3. 🔗 钱包连接组件 (WalletConnect)

### 组件接口
```typescript
interface WalletConnectProps {
  // 支持的钱包类型
  supportedWallets: WalletType[];
  
  // 网络配置
  chainId?: number;
  autoSwitchChain?: boolean;
  
  // 状态回调
  onConnect: (address: string, chainId: number) => void;
  onDisconnect: () => void;
  onChainChanged: (chainId: number) => void;
  
  // UI配置
  showBalance?: boolean;
  showChainInfo?: boolean;
  compact?: boolean;
}

type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'injected';
```

### 实现代码
```tsx
const WalletConnect: React.FC<WalletConnectProps> = ({
  supportedWallets = ['metamask', 'walletconnect', 'coinbase'],
  chainId = 137, // Polygon
  showBalance = true,
  onConnect,
  onDisconnect
}) => {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connect, connectors, isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  // 钱包配置映射
  const walletConfig = {
    metamask: {
      name: 'MetaMask',
      icon: '🦊',
      color: 'orange'
    },
    walletconnect: {
      name: 'WalletConnect', 
      icon: '📱',
      color: 'blue'
    },
    coinbase: {
      name: 'Coinbase Wallet',
      icon: '🔵',
      color: 'blue'
    }
  };

  // 未连接状态 - 显示连接选项
  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>连接钱包</CardTitle>
          <CardDescription>
            选择您偏好的钱包进行连接
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {connectors.map((connector) => {
            const config = walletConfig[connector.id];
            return (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                onClick={() => connect({ connector })}
                disabled={isLoading}
              >
                <span className="text-2xl">{config?.icon}</span>
                <span className="font-semibold">{config?.name}</span>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
              </Button>
            );
          })}
        </CardContent>

        <CardFooter>
          <Alert className="w-full">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              我们不会获取您的私钥，连接过程完全安全
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    );
  }

  // 已连接状态 - 显示钱包信息
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <CardTitle className="text-lg">钱包已连接</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => disconnect()}
            className="text-red-600 hover:text-red-700"
          >
            断开连接
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 钱包地址 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">钱包地址</p>
            <p className="font-mono text-sm font-semibold">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(address || '')}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* 网络信息 */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">当前网络</p>
            <p className="font-semibold text-blue-700">
              {chain?.name || 'Unknown'}
            </p>
          </div>
          {chain?.id !== chainId && (
            <Badge variant="destructive">网络错误</Badge>
          )}
        </div>

        {/* 余额信息 */}
        {showBalance && balance && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">钱包余额</p>
            <p className="font-mono text-lg font-bold text-green-700">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </CardContent>

      {/* 网络切换提示 */}
      {chain?.id !== chainId && (
        <CardFooter>
          <Alert className="w-full border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              请切换到Polygon网络以继续使用
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
};
```

---

## 4. 📊 收益展示组件 (RevenueDisplay)

### 组件接口
```typescript
interface RevenueDisplayProps {
  // 核心数据
  totalAssets: number;
  totalRevenue: number;
  monthlyGain: number;
  claimableAmount: number;
  
  // 趋势数据
  revenueHistory?: RevenuePoint[];
  
  // 交互回调
  onClaim: () => void;
  onViewDetails: () => void;
  
  // 显示配置
  currency?: 'USDT' | 'CNY';
  showChart?: boolean;
  compact?: boolean;
}

interface RevenuePoint {
  date: string;
  amount: number;
  percentage: number;
}
```

### 实现代码
```tsx
const RevenueDisplay: React.FC<RevenueDisplayProps> = ({
  totalAssets,
  totalRevenue, 
  monthlyGain,
  claimableAmount,
  revenueHistory = [],
  onClaim,
  onViewDetails,
  currency = 'USDT',
  showChart = true
}) => {
  const revenuePercentage = totalAssets > 0 ? (totalRevenue / totalAssets * 100) : 0;
  
  return (
    <div className="space-y-6">
      {/* 总资产概览 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-2">总资产</p>
            <p className="text-4xl font-bold font-mono mb-4">
              {totalAssets.toLocaleString()} {currency}
            </p>
            
            <div className="flex justify-center items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span className="text-green-300 font-semibold">
                +{monthlyGain.toFixed(2)}% 本月收益
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 收益统计卡片组 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 累计收益 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">累计收益</p>
                <p className="text-2xl font-bold text-green-600 font-mono">
                  {totalRevenue.toLocaleString()} {currency}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  收益率 {revenuePercentage.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 待领取收益 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待领取收益</p>
                <p className="text-2xl font-bold text-orange-600 font-mono">
                  {claimableAmount.toLocaleString()} {currency}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  可随时提取
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Wallet className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 收益趋势图表 */}
      {showChart && revenueHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              收益趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮区域 */}
      <div className="flex gap-4">
        <Button 
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3"
          onClick={onClaim}
          disabled={claimableAmount <= 0}
        >
          <Wallet className="h-5 w-5 mr-2" />
          一键领取 {claimableAmount > 0 ? `${claimableAmount} ${currency}` : ''}
        </Button>
        
        <Button 
          variant="outline" 
          className="px-6"
          onClick={onViewDetails}
        >
          <FileText className="h-4 w-4 mr-2" />
          详细记录
        </Button>
      </div>
    </div>
  );
};
```

---

## 5. 🛒 购买流程组件 (PurchaseFlow)

### 多步骤流程管理
```typescript
interface PurchaseFlowProps {
  // 流程配置
  steps: PurchaseStep[];
  currentStep: number;
  
  // 产品信息
  selectedProduct: Product;
  
  // 状态管理
  isLoading?: boolean;
  error?: string;
  
  // 回调函数
  onStepChange: (step: number) => void;
  onComplete: (result: PurchaseResult) => void;
  onCancel: () => void;
}

interface PurchaseStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}
```

### 步骤指示器
```tsx
const StepIndicator: React.FC<{
  steps: PurchaseStep[];
  currentStep: number;
}> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* 步骤圆圈 */}
            <div className={`
              relative flex items-center justify-center
              w-10 h-10 rounded-full border-2 
              transition-all duration-300
              ${isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : isActive 
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }
            `}>
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
              
              {/* 活跃状态动画 */}
              {isActive && (
                <div className="absolute -inset-1 bg-blue-500 rounded-full opacity-30 animate-pulse" />
              )}
            </div>

            {/* 步骤标题 */}
            <div className="ml-3 min-w-0 flex-1">
              <p className={`text-sm font-semibold ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              {isActive && (
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              )}
            </div>

            {/* 连接线 */}
            {!isLast && (
              <div className={`flex-1 h-px mx-4 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
```

### 主流程组件
```tsx
const PurchaseFlow: React.FC<PurchaseFlowProps> = ({
  steps,
  currentStep,
  selectedProduct,
  isLoading,
  error,
  onStepChange,
  onComplete,
  onCancel
}) => {
  const [purchaseData, setPurchaseData] = useState<Partial<PurchaseData>>({});

  const handleNext = (data: any) => {
    setPurchaseData(prev => ({ ...prev, ...data }));
    
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      onComplete({ ...purchaseData, ...data });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 步骤指示器 */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* 错误提示 */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 当前步骤内容 */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]?.title}</CardTitle>
          <CardDescription>
            {steps[currentStep]?.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {CurrentStepComponent && (
            <CurrentStepComponent
              product={selectedProduct}
              data={purchaseData}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </CardContent>

        {/* 导航按钮 */}
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? '取消' : '上一步'}
          </Button>

          <div className="text-sm text-gray-500">
            第 {currentStep + 1} 步，共 {steps.length} 步
          </div>
        </CardFooter>
      </Card>

      {/* 加载遮罩 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm mx-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <div>
                <p className="font-semibold">交易处理中...</p>
                <p className="text-sm text-gray-500">请在钱包中确认交易</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
```

---

## 6. 📊 数据表格组件 (DataTable)

### 高级表格功能
```typescript
interface DataTableProps<T> {
  // 数据相关
  data: T[];
  columns: ColumnDef<T>[];
  totalCount?: number;
  
  // 分页配置
  pagination?: {
    pageIndex: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  
  // 排序配置
  sorting?: {
    field: keyof T;
    direction: 'asc' | 'desc';
    onSortChange: (field: keyof T, direction: 'asc' | 'desc') => void;
  };
  
  // 筛选配置
  filters?: Filter<T>[];
  
  // 交互功能
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedIds: string[]) => void;
  };
  
  // UI配置
  loading?: boolean;
  empty?: React.ReactNode;
  actions?: TableAction[];
}
```

### 实现示例
```tsx
const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  pagination,
  sorting,
  loading,
  empty,
  actions
}: DataTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          {empty || (
            <div className="text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">暂无数据</p>
              <p className="text-sm">当前没有可显示的记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* 表格操作栏 */}
      {actions && actions.length > 0 && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
            
            {/* 表格工具 */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      {/* 表格主体 */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={`h-3 w-3 ${
                              header.column.getIsSorted() === 'asc' 
                                ? 'text-blue-500' 
                                : 'text-gray-400'
                            }`} 
                          />
                          <ChevronDown 
                            className={`h-3 w-3 -mt-1 ${
                              header.column.getIsSorted() === 'desc' 
                                ? 'text-blue-500' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页控件 */}
      {pagination && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-700">
              显示 {pagination.pageIndex * pagination.pageSize + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} 条，
              共 {data.length} 条记录
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.pageIndex === 0}
                onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(data.length / pagination.pageSize) }, (_, i) => (
                  <Button
                    key={i}
                    variant={i === pagination.pageIndex ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => pagination.onPageChange(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.pageIndex >= Math.ceil(data.length / pagination.pageSize) - 1}
                onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
```

---

## 7. 🎨 主题定制系统

### CSS变量系统
```css
/* 主题变量定义 */
:root {
  /* 品牌色彩 */
  --color-primary-50: 240 249 255;
  --color-primary-500: 14 165 233;
  --color-primary-900: 12 74 110;
  
  /* 功能色彩 */
  --color-success: 34 197 94;
  --color-warning: 245 158 11;
  --color-error: 239 68 68;
  
  /* 中性色彩 */
  --color-neutral-50: 248 250 252;
  --color-neutral-100: 241 245 249;
  --color-neutral-900: 15 23 42;
  
  /* 字体系统 */
  --font-sans: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
  
  /* 尺寸系统 */
  --spacing-unit: 4px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* 动画参数 */
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-out;
  --transition-slow: 500ms ease-out;
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-neutral-50: 15 23 42;
  --color-neutral-100: 30 41 59;
  --color-neutral-900: 248 250 252;
}
```

### 主题切换Hook
```typescript
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = saved || system;
    
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  return { theme, toggleTheme };
};
```

---

## 8. 🧪 组件测试规范

### 单元测试示例
```typescript
// NFTCard.test.tsx
describe('NFTCard Component', () => {
  const mockProps: NFTCardProps = {
    type: 'silver',
    title: '银卡',
    minAmount: 100,
    apr: 12,
    lockDays: 365,
    available: true,
    onPurchase: jest.fn(),
  };

  it('应该正确渲染卡片信息', () => {
    render(<NFTCard {...mockProps} />);
    
    expect(screen.getByText('银卡')).toBeInTheDocument();
    expect(screen.getByText('100 USDT')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('365天')).toBeInTheDocument();
  });

  it('应该在点击购买按钮时调用回调', async () => {
    render(<NFTCard {...mockProps} />);
    
    const purchaseButton = screen.getByText('立即购买');
    await userEvent.click(purchaseButton);
    
    expect(mockProps.onPurchase).toHaveBeenCalledWith('silver', 100);
  });

  it('应该在不可用时禁用购买按钮', () => {
    render(<NFTCard {...mockProps} available={false} />);
    
    const purchaseButton = screen.getByText('暂未开放');
    expect(purchaseButton).toBeDisabled();
  });
});
```

### 可访问性测试
```typescript
// Accessibility tests
describe('NFTCard Accessibility', () => {
  it('应该具备正确的ARIA标签', () => {
    render(<NFTCard {...mockProps} />);
    
    expect(screen.getByRole('button', { name: /立即购买/ })).toBeInTheDocument();
    expect(screen.getByText('投资有风险')).toHaveAttribute('role', 'alert');
  });

  it('应该支持键盘导航', async () => {
    render(<NFTCard {...mockProps} />);
    
    const purchaseButton = screen.getByText('立即购买');
    await userEvent.tab();
    expect(purchaseButton).toHaveFocus();
  });
});
```

---

## 9. 📚 使用文档模板

### 组件文档结构
```markdown
# NFTCard 组件

## 概述
NFTCard 是用于展示投资产品的核心组件，支持三种卡片类型（银/金/钻石）。

## API 接口
| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|--------|------|
| type | 'silver' \| 'gold' \| 'diamond' | - | 卡片类型 |
| title | string | - | 卡片标题 |
| minAmount | number | - | 最小投资金额 |

## 使用示例
```tsx
<NFTCard
  type="silver"
  title="银卡"
  minAmount={100}
  apr={12}
  lockDays={365}
  available={true}
  onPurchase={(type, amount) => console.log(type, amount)}
/>
```

## 注意事项
- 确保 `onPurchase` 回调函数处理异步操作
- `available` 属性控制卡片的可购买状态
- 组件会自动计算并显示预期收益
```

---

## 🎯 **实施路线图**

### Phase 1: 基础组件 (Week 1-2)
- [x] NFTCard 组件开发与测试
- [x] WalletConnect 组件实现
- [ ] RevenueDisplay 组件开发
- [ ] 基础样式系统建立

### Phase 2: 复合组件 (Week 3-4)
- [ ] PurchaseFlow 流程组件
- [ ] DataTable 高级表格
- [ ] 表单组件集合
- [ ] 图表可视化组件

### Phase 3: 业务组件 (Week 5-6)
- [ ] 分享中心组件
- [ ] 代理后台组件
- [ ] 管理员面板组件
- [ ] 通知系统组件

### Phase 4: 优化完善 (Week 7-8)
- [ ] 性能优化
- [ ] 无障碍测试
- [ ] 组件文档完善
- [ ] Storybook集成

---

## 🎯 **组件库优势**

这套专业组件库将提供：

✨ **类型安全** - 完整的TypeScript支持，减少运行时错误  
✨ **一致性** - 统一的设计语言和交互模式  
✨ **可复用性** - 高度模块化，支持不同场景组合使用  
✨ **可访问性** - 符合WCAG标准，支持键盘导航和屏幕阅读器  
✨ **性能优化** - 懒加载、虚拟化等优化技术  
✨ **测试覆盖** - 完整的单元测试和集成测试  

基于这套组件库，开发团队可以：
- 🚀 **提升效率** - 复用组件，减少重复开发  
- 🎯 **保证质量** - 经过验证的组件，降低bug率  
- 🔧 **易于维护** - 统一的代码风格和架构模式  
- 📈 **快速扩展** - 基于现有组件快速开发新功能