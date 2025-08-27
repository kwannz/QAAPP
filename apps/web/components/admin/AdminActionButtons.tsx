'use client'

import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Mail,
  AlertTriangle,
  Shield,
  Clock,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '@qa-app/ui'

interface AdminActionButtonsProps {
  type: 'kyc' | 'user' | 'order' | 'withdrawal' | 'audit'
  itemId: string
  status?: string
  onAction?: (action: string, itemId: string, data?: any) => void
  disabled?: boolean
  compact?: boolean
}

interface ActionButtonConfig {
  key: string
  label: string
  icon: React.ElementType
  variant: 'default' | 'outline' | 'destructive' | 'ghost'
  className?: string
  confirmMessage?: string
  requiresInput?: boolean
  inputPlaceholder?: string
}

const actionConfigs: Record<string, ActionButtonConfig[]> = {
  // KYC审核操作
  kyc: [
    {
      key: 'view',
      label: '查看详情',
      icon: Eye,
      variant: 'outline'
    },
    {
      key: 'approve',
      label: '通过审核',
      icon: CheckCircle,
      variant: 'default',
      className: 'bg-green-600 hover:bg-green-700',
      confirmMessage: '确认通过该用户的KYC审核吗？'
    },
    {
      key: 'reject',
      label: '拒绝审核',
      icon: XCircle,
      variant: 'destructive',
      confirmMessage: '确认拒绝该用户的KYC审核吗？',
      requiresInput: true,
      inputPlaceholder: '请输入拒绝原因...'
    },
    {
      key: 'requestMore',
      label: '要求补充',
      icon: AlertTriangle,
      variant: 'outline',
      requiresInput: true,
      inputPlaceholder: '请说明需要补充的材料...'
    }
  ],

  // 用户管理操作
  user: [
    {
      key: 'view',
      label: '查看详情',
      icon: Eye,
      variant: 'outline'
    },
    {
      key: 'edit',
      label: '编辑信息',
      icon: Edit,
      variant: 'outline'
    },
    {
      key: 'ban',
      label: '封禁用户',
      icon: Ban,
      variant: 'destructive',
      confirmMessage: '确认封禁该用户吗？用户将无法登录和进行任何操作。',
      requiresInput: true,
      inputPlaceholder: '请输入封禁原因...'
    },
    {
      key: 'unban',
      label: '解封用户',
      icon: Unlock,
      variant: 'default',
      className: 'bg-green-600 hover:bg-green-700',
      confirmMessage: '确认解封该用户吗？'
    },
    {
      key: 'resetPassword',
      label: '重置密码',
      icon: RefreshCw,
      variant: 'outline',
      confirmMessage: '确认重置该用户的密码吗？系统将发送重置邮件。'
    },
    {
      key: 'sendNotification',
      label: '发送通知',
      icon: Mail,
      variant: 'outline',
      requiresInput: true,
      inputPlaceholder: '请输入通知内容...'
    }
  ],

  // 订单管理操作
  order: [
    {
      key: 'view',
      label: '查看详情',
      icon: Eye,
      variant: 'outline'
    },
    {
      key: 'approve',
      label: '批准订单',
      icon: CheckCircle,
      variant: 'default',
      className: 'bg-green-600 hover:bg-green-700',
      confirmMessage: '确认批准该订单吗？'
    },
    {
      key: 'reject',
      label: '拒绝订单',
      icon: XCircle,
      variant: 'destructive',
      confirmMessage: '确认拒绝该订单吗？',
      requiresInput: true,
      inputPlaceholder: '请输入拒绝原因...'
    },
    {
      key: 'markSuspicious',
      label: '标记可疑',
      icon: AlertTriangle,
      variant: 'outline',
      className: 'text-orange-600 border-orange-600 hover:bg-orange-50',
      requiresInput: true,
      inputPlaceholder: '请描述可疑原因...'
    },
    {
      key: 'freeze',
      label: '冻结资金',
      icon: Shield,
      variant: 'destructive',
      confirmMessage: '确认冻结该订单相关资金吗？',
      requiresInput: true,
      inputPlaceholder: '请输入冻结原因...'
    }
  ],

  // 提现管理操作
  withdrawal: [
    {
      key: 'view',
      label: '查看详情',
      icon: Eye,
      variant: 'outline'
    },
    {
      key: 'approve',
      label: '批准提现',
      icon: CheckCircle,
      variant: 'default',
      className: 'bg-green-600 hover:bg-green-700',
      confirmMessage: '确认批准该提现申请吗？资金将被转出。'
    },
    {
      key: 'reject',
      label: '拒绝提现',
      icon: XCircle,
      variant: 'destructive',
      confirmMessage: '确认拒绝该提现申请吗？',
      requiresInput: true,
      inputPlaceholder: '请输入拒绝原因...'
    },
    {
      key: 'manualReview',
      label: '人工复核',
      icon: Clock,
      variant: 'outline',
      requiresInput: true,
      inputPlaceholder: '请输入复核说明...'
    },
    {
      key: 'adjustAmount',
      label: '调整金额',
      icon: DollarSign,
      variant: 'outline',
      requiresInput: true,
      inputPlaceholder: '请输入调整后的金额...'
    }
  ],

  // 审计日志操作
  audit: [
    {
      key: 'view',
      label: '查看详情',
      icon: Eye,
      variant: 'outline'
    },
    {
      key: 'export',
      label: '导出日志',
      icon: Download,
      variant: 'outline'
    },
    {
      key: 'analyze',
      label: '风险分析',
      icon: AlertTriangle,
      variant: 'outline'
    },
    {
      key: 'createReport',
      label: '生成报告',
      icon: FileText,
      variant: 'outline'
    }
  ]
}

export function AdminActionButtons({ 
  type, 
  itemId, 
  status, 
  onAction, 
  disabled = false,
  compact = false 
}: AdminActionButtonsProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const actions = actionConfigs[type] || []

  const handleAction = async (action: ActionButtonConfig) => {
    if (disabled || isProcessing) return

    try {
      setIsProcessing(action.key)

      let inputValue = ''
      
      // 需要用户输入的操作
      if (action.requiresInput) {
        inputValue = prompt(action.inputPlaceholder || '请输入相关信息:') || ''
        if (!inputValue.trim()) {
          return // 用户取消或未输入内容
        }
      }

      // 需要确认的操作
      if (action.confirmMessage) {
        const confirmed = confirm(action.confirmMessage)
        if (!confirmed) return
      }

      // 执行操作
      if (onAction) {
        await onAction(action.key, itemId, inputValue ? { input: inputValue } : undefined)
      }

    } catch (error) {
      console.error('Action failed:', error)
      alert('操作失败，请重试')
    } finally {
      setIsProcessing(null)
    }
  }

  // 根据状态过滤可用操作
  const getAvailableActions = () => {
    if (type === 'user' && status) {
      if (status === 'banned') {
        return actions.filter(action => ['view', 'unban', 'edit'].includes(action.key))
      } else {
        return actions.filter(action => action.key !== 'unban')
      }
    }

    if (type === 'kyc' && status) {
      if (status === 'APPROVED') {
        return actions.filter(action => action.key === 'view')
      } else if (status === 'REJECTED') {
        return actions.filter(action => ['view', 'approve'].includes(action.key))
      }
    }

    if (type === 'order' && status) {
      if (status === 'APPROVED') {
        return actions.filter(action => ['view', 'markSuspicious'].includes(action.key))
      } else if (status === 'REJECTED') {
        return actions.filter(action => ['view', 'approve'].includes(action.key))
      }
    }

    if (type === 'withdrawal' && status) {
      if (status === 'APPROVED') {
        return actions.filter(action => action.key === 'view')
      } else if (status === 'REJECTED') {
        return actions.filter(action => ['view', 'approve'].includes(action.key))
      }
    }

    return actions
  }

  const availableActions = getAvailableActions()

  if (compact) {
    // 紧凑模式，只显示最重要的几个按钮
    const primaryActions = availableActions.slice(0, 3)
    
    return (
      <div className="flex space-x-2">
        {primaryActions.map((action) => {
          const Icon = action.icon
          const isCurrentlyProcessing = isProcessing === action.key
          
          return (
            <Button
              key={action.key}
              variant={action.variant}
              size="sm"
              className={action.className}
              onClick={() => handleAction(action)}
              disabled={disabled || !!isProcessing}
            >
              {isCurrentlyProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </Button>
          )
        })}
        
        {availableActions.length > 3 && (
          <Button variant="ghost" size="sm" disabled={disabled}>
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  // 完整模式，显示所有按钮和标签
  return (
    <div className="flex flex-wrap gap-2">
      {availableActions.map((action) => {
        const Icon = action.icon
        const isCurrentlyProcessing = isProcessing === action.key
        
        return (
          <Button
            key={action.key}
            variant={action.variant}
            size="sm"
            className={action.className}
            onClick={() => handleAction(action)}
            disabled={disabled || !!isProcessing}
          >
            {isCurrentlyProcessing ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Icon className="w-4 h-4 mr-1" />
            )}
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}

// 批量操作按钮组件
interface BatchActionButtonsProps {
  type: 'kyc' | 'user' | 'order' | 'withdrawal'
  selectedIds: string[]
  onBatchAction?: (action: string, ids: string[], data?: any) => void
  disabled?: boolean
}

export function BatchActionButtons({ 
  type, 
  selectedIds, 
  onBatchAction, 
  disabled = false 
}: BatchActionButtonsProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const batchActions: Record<string, ActionButtonConfig[]> = {
    kyc: [
      {
        key: 'batchApprove',
        label: `批量通过 (${selectedIds.length})`,
        icon: CheckCircle,
        variant: 'default',
        className: 'bg-green-600 hover:bg-green-700',
        confirmMessage: `确认批量通过选中的 ${selectedIds.length} 个KYC申请吗？`
      },
      {
        key: 'batchReject',
        label: `批量拒绝 (${selectedIds.length})`,
        icon: XCircle,
        variant: 'destructive',
        confirmMessage: `确认批量拒绝选中的 ${selectedIds.length} 个KYC申请吗？`,
        requiresInput: true,
        inputPlaceholder: '请输入统一的拒绝原因...'
      }
    ],
    user: [
      {
        key: 'batchBan',
        label: `批量封禁 (${selectedIds.length})`,
        icon: Ban,
        variant: 'destructive',
        confirmMessage: `确认批量封禁选中的 ${selectedIds.length} 个用户吗？`,
        requiresInput: true,
        inputPlaceholder: '请输入统一的封禁原因...'
      },
      {
        key: 'batchNotify',
        label: `批量通知 (${selectedIds.length})`,
        icon: Mail,
        variant: 'outline',
        requiresInput: true,
        inputPlaceholder: '请输入要发送的通知内容...'
      }
    ],
    order: [
      {
        key: 'batchApprove',
        label: `批量批准 (${selectedIds.length})`,
        icon: CheckCircle,
        variant: 'default',
        className: 'bg-green-600 hover:bg-green-700',
        confirmMessage: `确认批量批准选中的 ${selectedIds.length} 个订单吗？`
      },
      {
        key: 'batchReject',
        label: `批量拒绝 (${selectedIds.length})`,
        icon: XCircle,
        variant: 'destructive',
        confirmMessage: `确认批量拒绝选中的 ${selectedIds.length} 个订单吗？`
      }
    ],
    withdrawal: [
      {
        key: 'batchApprove',
        label: `批量批准 (${selectedIds.length})`,
        icon: CheckCircle,
        variant: 'default',
        className: 'bg-green-600 hover:bg-green-700',
        confirmMessage: `确认批量批准选中的 ${selectedIds.length} 个提现申请吗？`
      },
      {
        key: 'batchReject',
        label: `批量拒绝 (${selectedIds.length})`,
        icon: XCircle,
        variant: 'destructive',
        confirmMessage: `确认批量拒绝选中的 ${selectedIds.length} 个提现申请吗？`
      }
    ]
  }

  const handleBatchAction = async (action: ActionButtonConfig) => {
    if (disabled || isProcessing || selectedIds.length === 0) return

    try {
      setIsProcessing(action.key)

      let inputValue = ''
      
      if (action.requiresInput) {
        inputValue = prompt(action.inputPlaceholder || '请输入相关信息:') || ''
        if (!inputValue.trim()) {
          return
        }
      }

      if (action.confirmMessage) {
        const confirmed = confirm(action.confirmMessage)
        if (!confirmed) return
      }

      if (onBatchAction) {
        await onBatchAction(action.key, selectedIds, inputValue ? { input: inputValue } : undefined)
      }

    } catch (error) {
      console.error('Batch action failed:', error)
      alert('批量操作失败，请重试')
    } finally {
      setIsProcessing(null)
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  const actions = batchActions[type] || []

  return (
    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">
          已选择 {selectedIds.length} 项，可进行批量操作
        </p>
      </div>
      <div className="flex space-x-2">
        {actions.map((action) => {
          const Icon = action.icon
          const isCurrentlyProcessing = isProcessing === action.key
          
          return (
            <Button
              key={action.key}
              variant={action.variant}
              size="sm"
              className={action.className}
              onClick={() => handleBatchAction(action)}
              disabled={disabled || !!isProcessing}
            >
              {isCurrentlyProcessing ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-1" />
              )}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}