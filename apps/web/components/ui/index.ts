// Export all UI components - using shared UI package for core components
export { 
  Button, buttonVariants, 
  Alert, AlertDescription, AlertTitle, 
  Badge, 
  Input, 
  Tabs, TabsList, TabsTrigger, TabsContent, 
  Checkbox,
  Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Separator,
  Textarea,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
  Switch
} from '@qa-app/ui'

// App-specific UI components 
export { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription, MetricsCard, ProductCard, UnifiedCard, SystemHealthCard } from './CardSystem'

// Export utility functions
export { cn } from '../../lib/utils'

// Export business components that are used in place of UI
export { EnhancedProductCard } from './CardSystem'
export { WalletSystem, WalletConnectionManager, SafeConnectButton, WalletManager, WalletConnectionManager as WalletConnect } from '../wallet/WalletSystem'
export { InvestmentDashboard } from '../dashboard/InvestmentDashboard'

// Export types
export type { ButtonProps } from './button'