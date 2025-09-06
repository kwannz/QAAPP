// GitHub风格：使用shadcn/ui组件库 - 临时直接导入解决工作空间链接问题
// 这保持了原始的前端代码风格，使用shadcn/ui组件

// 从packages/ui直接导入shadcn/ui组件 (临时解决方案)
export {
  Button,
  buttonVariants,
  type ButtonProperties as ButtonProps
} from '../../../../packages/ui/src/components/ui/button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
} from '../../../../packages/ui/src/components/ui/card';

export {
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants
} from '../../../../packages/ui/src/components/ui/alert';

export {
  Badge,
  type BadgeProperties as BadgeProps,
  badgeVariants
} from '../../../../packages/ui/src/components/ui/badge';

export {
  Input,
  type InputProperties as InputProps,
  inputVariants
} from '../../../../packages/ui/src/components/ui/input';

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../../../packages/ui/src/components/ui/tabs';

export { Checkbox } from '../../../../packages/ui/src/components/ui/checkbox';
export { Label } from '../../../../packages/ui/src/components/ui/label';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../packages/ui/src/components/ui/select';
export { Separator } from '../../../../packages/ui/src/components/ui/separator';
export { Switch } from '../../../../packages/ui/src/components/ui/switch';
export { Textarea } from '../../../../packages/ui/src/components/ui/textarea';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../../../../packages/ui/src/components/ui/dialog';

// 工具函数
export { cn } from '../../../../packages/ui/src/utils/cn';

// 业务组件  
export { 
  NFTCard,
  type NFTCardProperties as NFTCardProps
} from '../../../../packages/ui/src/components/business/nft-card';

export {
  WalletConnect,
  type WalletConnectProperties as WalletConnectProps
} from '../../../../packages/ui/src/components/business/WalletConnect';

export { 
  InvestmentDashboard,
  type InvestmentDashboardProperties as InvestmentDashboardProps,
  type DashboardPosition,
  type DashboardInvestmentStats
} from '../../../../packages/ui/src/components/business/InvestmentDashboard';

// 类型
export type { VariantProps } from 'class-variance-authority';

// App-specific UI组件 - 保持本地CardSystem
export { Card as MetricsCard, Card as ProductCard, Card as UnifiedCard, Card as SystemHealthCard, EnhancedProductCard } from './CardSystem';
