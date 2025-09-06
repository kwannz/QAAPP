// 基础UI组件
export { Button, type ButtonProperties as ButtonProps, buttonVariants } from './components/ui/button'
export { Input, type InputProperties as InputProps, inputVariants } from './components/ui/input'
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  cardVariants 
} from './components/ui/card'
export { Alert, AlertTitle, AlertDescription, alertVariants } from './components/ui/alert'
export { Badge, type BadgeProperties as BadgeProps, badgeVariants } from './components/ui/badge'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
export { Checkbox } from './components/ui/checkbox'
export { Label } from './components/ui/label'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
export { Separator } from './components/ui/separator'
export { Switch } from './components/ui/switch'
export { Textarea } from './components/ui/textarea'
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './components/ui/dialog'

// 业务组件
export { NFTCard, type NFTCardProperties as NFTCardProps } from './components/business/nft-card'
export { WalletConnect, type WalletConnectProperties as WalletConnectProps } from './components/business/WalletConnect'
export { 
  InvestmentDashboard, 
  type InvestmentDashboardProperties as InvestmentDashboardProps,
  type DashboardPosition,
  type DashboardInvestmentStats
} from './components/business/InvestmentDashboard'

// 工具函数
export { cn } from './utils/cn'

// 类型定义
export type { VariantProps } from 'class-variance-authority'