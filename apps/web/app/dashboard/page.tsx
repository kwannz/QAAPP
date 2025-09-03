'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  Gift, 
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Bell,
  Globe,
  CreditCard,
  FileText,
  Camera,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Settings,
  MapPin,
  Calendar,
  Briefcase,
  Link as LinkIcon,
  Smartphone,
  Laptop,
  Monitor,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Plus,
  BellRing,
  Search,
  Archive,
  Star,
  Clock,
  Activity,
  MessageSquare,
  Info,
  Volume2,
  VolumeX
} from 'lucide-react'
import Link from 'next/link'
import { formatUnits } from 'viem'
import { toast } from 'react-hot-toast'

import { Button, InvestmentDashboard, WalletConnect, Card, CardContent, CardHeader, CardTitle, Input, Badge, Alert, AlertDescription } from '@/components/ui'
import { Header } from '../../components/layout/Header'
import { useAuthStore } from '../../lib/auth-context'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { UserNFTs } from '../../components/dashboard/UserNFTs'
import { TabContainer } from '../../components/common/TabContainer'
import { useFeatureFlag } from '../../lib/feature-flags'
import { useSafeAccount, useSafeConnect, useSafeDisconnect, useSafeBalance, useSafeEnsName } from '../../lib/hooks/use-safe-wagmi'
import { useUSDT } from '../../lib/hooks/use-contracts'
import { getContractAddresses } from '../../lib/contracts/addresses'
import { notificationApi } from '../../lib/api-client'

// 用户资料类型定义
interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  phoneNumber?: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  nationality?: string
  address?: {
    country: string
    state: string
    city: string
    street: string
    postalCode: string
  }
  occupation?: string
  company?: string
  website?: string
  bio?: string
  referralCode: string
  createdAt: string
  lastLoginAt: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
}

interface KYCDocument {
  id: string
  type: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE' | 'PROOF_OF_ADDRESS'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  uploadedAt: string
  reviewedAt?: string
  expiresAt?: string
  fileName: string
  fileSize: number
  reviewNotes?: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  loginNotifications: boolean
  withdrawalConfirmation: boolean
  ipWhitelist: string[]
  lastPasswordChange: string
  sessionTimeout: number
}

interface LoginDevice {
  id: string
  deviceName: string
  deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET'
  browser: string
  os: string
  ip: string
  location: string
  lastLoginAt: string
  isCurrentSession: boolean
}

interface UserNotification {
  id: string
  type: 'SYSTEM' | 'TRANSACTION' | 'MARKETING' | 'SECURITY' | 'PROMOTION'
  category: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  isRead: boolean
  isStarred: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP'
  createdAt: string
  readAt?: string
  expiresAt?: string
  metadata?: {
    amount?: number
    productName?: string
    orderId?: string
  }
}

interface NotificationSettings {
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  transactionAlerts: boolean
  securityAlerts: boolean
  promotionNotices: boolean
}

// 模拟数据
const mockStats = {
  totalInvested: 25000,
  currentValue: 27850,
  totalEarnings: 2850,
  claimableRewards: 125.50,
  activePositions: 3,
}

const mockPositions = [
  {
    id: 'pos-1',
    productName: 'QA黄金卡',
    productType: 'gold' as const,
    principal: 10000,
    currentValue: 11250,
    apr: 15,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    nextPayoutAt: '2024-02-15T10:00:00Z',
    nextPayoutAmount: 41.67,
    status: 'active' as const,
  },
  {
    id: 'pos-2',
    productName: 'QA钻石卡',
    productType: 'diamond' as const,
    principal: 15000,
    currentValue: 16600,
    apr: 18,
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    nextPayoutAt: '2024-02-01T10:00:00Z',
    nextPayoutAmount: 74.18,
    status: 'active' as const,
  },
]

const mockProfile: UserProfile = {
  id: 'user-001',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  phoneNumber: '+86 138 0013 8000',
  avatar: '/avatars/user-001.jpg',
  dateOfBirth: '1990-05-15',
  gender: 'MALE',
  nationality: 'CN',
  address: {
    country: '中国',
    state: '北京市',
    city: '北京市',
    street: '朝阳区建国门外大街1号',
    postalCode: '100020'
  },
  occupation: '软件工程师',
  company: 'TechCorp Inc.',
  website: 'https://johndoe.dev',
  bio: '热爱技术和投资的软件工程师，专注于区块链和金融科技领域。',
  referralCode: 'QA2024JOHN',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-02-01T10:30:00Z',
  emailVerified: true,
  phoneVerified: true,
  twoFactorEnabled: false
}

const mockKYCDocuments: KYCDocument[] = [
  {
    id: 'kyc-1',
    type: 'ID_CARD',
    status: 'APPROVED',
    uploadedAt: '2024-01-02T10:00:00Z',
    reviewedAt: '2024-01-03T14:30:00Z',
    expiresAt: '2034-05-15T23:59:59Z',
    fileName: 'id-card-front.jpg',
    fileSize: 2.3
  },
  {
    id: 'kyc-2',
    type: 'PROOF_OF_ADDRESS',
    status: 'APPROVED',
    uploadedAt: '2024-01-02T10:15:00Z',
    reviewedAt: '2024-01-03T14:35:00Z',
    fileName: 'utility-bill.pdf',
    fileSize: 1.8
  },
  {
    id: 'kyc-3',
    type: 'PASSPORT',
    status: 'PENDING',
    uploadedAt: '2024-02-01T09:00:00Z',
    fileName: 'passport.jpg',
    fileSize: 3.1
  }
]

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  emailNotifications: true,
  smsNotifications: false,
  loginNotifications: true,
  withdrawalConfirmation: true,
  ipWhitelist: [],
  lastPasswordChange: '2024-01-15T00:00:00Z',
  sessionTimeout: 30
}

const mockLoginDevices: LoginDevice[] = [
  {
    id: 'device-1',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'MOBILE',
    browser: 'Safari',
    os: 'iOS 17.2',
    ip: '192.168.1.100',
    location: '北京, 中国',
    lastLoginAt: '2024-02-01T10:30:00Z',
    isCurrentSession: true
  },
  {
    id: 'device-2',
    deviceName: 'MacBook Pro',
    deviceType: 'DESKTOP',
    browser: 'Chrome',
    os: 'macOS 14.2',
    ip: '192.168.1.101',
    location: '北京, 中国',
    lastLoginAt: '2024-01-31T18:45:00Z',
    isCurrentSession: false
  },
  {
    id: 'device-3',
    deviceName: 'Windows PC',
    deviceType: 'DESKTOP',
    browser: 'Edge',
    os: 'Windows 11',
    ip: '203.0.113.45',
    location: '上海, 中国',
    lastLoginAt: '2024-01-28T14:20:00Z',
    isCurrentSession: false
  }
]

const mockNotifications: UserNotification[] = [
  {
    id: 'notif-1',
    type: 'TRANSACTION',
    category: 'SUCCESS',
    title: '投资收益到账',
    message: '您的QA黄金卡产品产生了41.67 USDT的收益，已自动添加到您的账户余额中。',
    actionUrl: '/dashboard/earnings',
    actionText: '查看详情',
    isRead: false,
    isStarred: true,
    priority: 'HIGH',
    channel: 'PUSH',
    createdAt: '2024-02-01T10:30:00Z',
    metadata: {
      amount: 41.67,
      productName: 'QA黄金卡'
    }
  },
  {
    id: 'notif-2',
    type: 'SYSTEM',
    category: 'INFO',
    title: '系统维护通知',
    message: '平台将于今晚22:00-24:00进行系统升级维护，期间部分功能可能受到影响，请提前做好准备。',
    isRead: false,
    isStarred: false,
    priority: 'MEDIUM',
    channel: 'EMAIL',
    createdAt: '2024-02-01T08:15:00Z',
    expiresAt: '2024-02-02T00:00:00Z'
  },
  {
    id: 'notif-3',
    type: 'SECURITY',
    category: 'WARNING',
    title: '异常登录提醒',
    message: '检测到您的账户在新设备上登录（IP: 192.168.1.100），如非本人操作，请立即修改密码。',
    actionUrl: '/dashboard?tab=profile',
    actionText: '安全设置',
    isRead: true,
    isStarred: false,
    priority: 'CRITICAL',
    channel: 'SMS',
    createdAt: '2024-01-31T16:45:00Z',
    readAt: '2024-01-31T17:00:00Z'
  }
]

const mockNotificationSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  marketingEmails: true,
  transactionAlerts: true,
  securityAlerts: true,
  promotionNotices: false
}

const quickActions = [
  {
    title: '购买新产品',
    description: '浏览并购买投资产品',
    icon: PlusCircle,
    href: '/products',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: '推荐好友',
    description: '分享推荐码获取佣金',
    icon: Gift,
    href: '/referral',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const unifiedDashboard = useFeatureFlag('unifiedDashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'wallets' | 'notifications'>('overview')

  // State for all integrated features
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings)
  const [kycDocuments] = useState<KYCDocument[]>(mockKYCDocuments)
  const [loginDevices] = useState<LoginDevice[]>(mockLoginDevices)
  const [notifications, setNotifications] = useState<UserNotification[]>(mockNotifications)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings)
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Wallet state
  const [isCopied, setIsCopied] = useState(false)
  const { address, isConnected, chainId, chain } = useSafeAccount()
  const { connect, connectors, isPending: isConnecting } = useSafeConnect()
  const { disconnect } = useSafeDisconnect()
  const usdt = useUSDT()
  const { data: ethBalance, refetch: refetchEthBalance } = useSafeBalance({ address })
  const { data: ensName } = useSafeEnsName({ address })
  
  // Notification state
  const [selectedNotificationType, setSelectedNotificationType] = useState<'all' | 'SYSTEM' | 'TRANSACTION' | 'MARKETING' | 'SECURITY' | 'PROMOTION'>('all')
  const [notificationSearchTerm, setNotificationSearchTerm] = useState('')
  const [selectedNotificationItems, setSelectedNotificationItems] = useState<string[]>([])

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleClaimRewards = () => {
    console.log('Claiming rewards...')
    toast.success('收益领取成功!')
  }

  const handleViewPosition = (positionId: string) => {
    console.log('Viewing position:', positionId)
  }

  // Profile handlers
  const handleSaveProfile = () => {
    setProfile(editedProfile)
    setIsEditing(false)
    toast.success('个人资料已更新')
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密码确认不匹配')
      return
    }
    console.log('Changing password...')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    toast.success('密码修改成功')
  }

  const handleToggle2FA = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }))
    toast.success(securitySettings.twoFactorEnabled ? '双重认证已禁用' : '双重认证已启用')
  }

  const handleUploadDocument = (type: string) => {
    console.log('Uploading document type:', type)
    toast.success('文档上传成功')
  }

  const handleRevokeDevice = (deviceId: string) => {
    console.log('Revoking device:', deviceId)
    toast.success('设备会话已撤销')
  }

  // Wallet handlers
  const copyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setIsCopied(true)
      toast.success('地址已复制到剪贴板')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }
  
  const refreshBalances = () => {
    refetchEthBalance()
    usdt.refetchBalance()
    toast.success('余额已刷新')
  }
  
  // Notification handlers
  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, isRead: true, readAt: new Date().toISOString() }
          : notif
      )
    )
    toast.success('已标记为已读')
  }

  const handleToggleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, isStarred: !notif.isStarred }
          : notif
      )
    )
  }

  const handleDeleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    setSelectedNotificationItems(prev => prev.filter(itemId => itemId !== id))
    toast.success('通知已删除')
  }

  // Utility functions
  const getExplorerUrl = () => {
    if (!address || !chainId) return '#'
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
      11155111: 'https://sepolia.etherscan.io',
    }
    
    return `${explorers[chainId] || 'https://etherscan.io'}/address/${address}`
  }
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      case 'PENDING': return 'text-orange-600 bg-orange-100'
      case 'EXPIRED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'ID_CARD': return '身份证'
      case 'PASSPORT': return '护照'
      case 'DRIVER_LICENSE': return '驾驶证'
      case 'PROOF_OF_ADDRESS': return '地址证明'
      default: return '文档'
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'MOBILE': return Smartphone
      case 'TABLET': return Smartphone
      case 'DESKTOP': return Monitor
      default: return Laptop
    }
  }

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return '刚刚'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`
    } else if (diffInHours < 48) {
      return '1天前'
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return CheckCircle
      case 'SYSTEM': return Settings
      case 'SECURITY': return AlertTriangle
      case 'MARKETING': return Star
      case 'PROMOTION': return Star
      default: return Bell
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL': return Mail
      case 'SMS': return Smartphone
      case 'PUSH': return Bell
      default: return Globe
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SUCCESS': return 'text-green-600 bg-green-100'
      case 'WARNING': return 'text-orange-600 bg-orange-100'
      case 'ERROR': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-4 border-red-500'
      case 'HIGH': return 'border-l-4 border-orange-500'
      case 'MEDIUM': return 'border-l-4 border-yellow-500'
      default: return 'border-l-4 border-gray-300'
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = selectedNotificationType === 'all' || notification.type === selectedNotificationType
    const matchesSearch = notification.title.toLowerCase().includes(notificationSearchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(notificationSearchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length
  const contracts = getContractAddresses(chainId || 1)

  // Tab configuration
  const tabs = [
    { 
      id: 'overview', 
      label: '投资概览', 
      icon: <TrendingUp className="w-4 h-4" />, 
      badge: null 
    },
    { 
      id: 'profile', 
      label: '个人资料', 
      icon: <User className="w-4 h-4" />, 
      badge: null 
    },
    { 
      id: 'wallets', 
      label: '钱包管理', 
      icon: <Wallet className="w-4 h-4" />, 
      badge: isConnected ? 'connected' : null 
    },
    { 
      id: 'notifications', 
      label: '通知中心', 
      icon: <Bell className="w-4 h-4" />, 
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : null 
    }
  ]

  const renderOverview = () => (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold">
            欢迎回来, {user?.email ? user.email.split('@')[0] : `用户${user?.referralCode}`}
          </h1>
          <p className="text-muted-foreground mt-2">
            管理您的投资组合，查看收益情况，探索新的投资机会。
          </p>
        </div>
        
        <Link href="/products">
          <Button size="lg" className="group">
            <PlusCircle className="w-4 h-4 mr-2" />
            投资新产品
          </Button>
        </Link>
      </motion.div>

      {/* 钱包连接状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <WalletConnect
          isConnected={isConnected}
          onConnect={() => {}}
          onDisconnect={() => {}}
        />
      </motion.div>

      {/* 快捷操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Card className="qa-card-hover cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* 用户NFT资产 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <UserNFTs />
      </motion.div>

      {/* 投资仪表板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <InvestmentDashboard
          stats={mockStats}
          positions={mockPositions}
          onClaimRewards={handleClaimRewards}
          onViewPosition={handleViewPosition}
        />
      </motion.div>

      {/* 最近活动 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近活动</CardTitle>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: 'investment',
                  title: '购买了 QA黄金卡',
                  amount: '$10,000 USDT',
                  time: '2小时前',
                  status: 'success',
                },
                {
                  type: 'payout',
                  title: '收到分红收益',
                  amount: '+$41.67 USDT',
                  time: '1天前',
                  status: 'success',
                },
                {
                  type: 'referral',
                  title: '推荐好友获得佣金',
                  amount: '+$30.00 USDT',
                  time: '3天前',
                  status: 'success',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'investment' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'payout' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'investment' ? '💰' :
                       activity.type === 'payout' ? '📈' : '🎁'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className={`font-medium text-sm ${
                    activity.amount.startsWith('+') ? 'text-green-600' : 'text-foreground'
                  }`}>
                    {activity.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 qa-container py-8">
            <div className="space-y-8">
              {/* 加载骨架屏 */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-96" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
              
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const renderProfile = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 侧边导航 */}
      <Card>
        <CardContent className="p-6">
          {/* 用户头像和基本信息 */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900">{profile.displayName}</h3>
            <p className="text-sm text-gray-600">{profile.email}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              {profile.emailVerified && (
                <span className="flex items-center text-xs text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  邮箱已验证
                </span>
              )}
              {profile.phoneVerified && (
                <span className="flex items-center text-xs text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  手机已验证
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要资料内容 */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>基本信息</CardTitle>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">姓</label>
                <Input
                  value={isEditing ? editedProfile.firstName || '' : profile.firstName || ''}
                  onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="请输入姓"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">名</label>
                <Input
                  value={isEditing ? editedProfile.lastName || '' : profile.lastName || ''}
                  onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="请输入名"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">邮箱地址</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={profile.email}
                    disabled
                    className="flex-1"
                  />
                  {profile.emailVerified ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Button size="sm">验证</Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">手机号码</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={isEditing ? editedProfile.phoneNumber || '' : profile.phoneNumber || ''}
                    onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="请输入手机号码"
                    className="flex-1"
                  />
                  {profile.phoneVerified ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Button size="sm">验证</Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">推荐码</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={profile.referralCode}
                  disabled
                  className="flex-1"
                />
                <Button size="sm" variant="outline">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderWallets = () => (
    <div className="space-y-6">
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              连接钱包
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              请选择一个钱包连接到QA投资平台，开始您的DeFi投资之旅
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={isConnecting}
                  variant="outline"
                  className="h-16 justify-start gap-3"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {connector.id === 'injected' ? '浏览器钱包' : '官方钱包'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                连接钱包后，您可以投资我们的固定收益产品并获得NFT投资凭证
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 钱包信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  已连接钱包
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={refreshBalances}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => disconnect()}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">当前网络</p>
                  <p className="font-medium">{chain?.name || '未知网络'}</p>
                </div>
                <Badge variant={chain?.id === 1 ? "default" : "secondary"}>
                  Chain ID: {chainId}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">钱包地址</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{formatAddress(address!)}</p>
                      {ensName && (
                        <Badge variant="outline">{ensName}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      {isCopied ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 资产余额 */}
          <Card>
            <CardHeader>
              <CardTitle>资产余额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">ETH</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">以太坊</p>
                      <p className="font-semibold">
                        {ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0.0000'} ETH
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">USDT</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">泰达币</p>
                      <p className="font-semibold">
                        {usdt.formatBalance()} USDT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">全部通知</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未读通知</p>
                <p className="text-2xl font-bold text-orange-600">{unreadNotificationCount}</p>
              </div>
              <BellRing className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">星标通知</p>
                <p className="text-2xl font-bold text-yellow-600">{notifications.filter(n => n.isStarred).length}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日新增</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => {
                    const today = new Date().toDateString()
                    return new Date(n.createdAt).toDateString() === today
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索通知..."
              value={notificationSearchTerm}
              onChange={(e) => setNotificationSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <select
            value={selectedNotificationType}
            onChange={(e) => setSelectedNotificationType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有类型</option>
            <option value="TRANSACTION">交易</option>
            <option value="SYSTEM">系统</option>
            <option value="SECURITY">安全</option>
            <option value="MARKETING">营销</option>
            <option value="PROMOTION">推广</option>
          </select>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="space-y-3">
        {filteredNotifications.slice(0, 10).map((notification) => {
          const TypeIcon = getNotificationTypeIcon(notification.type)
          const ChannelIcon = getChannelIcon(notification.channel)
          const isExpired = notification.expiresAt && new Date(notification.expiresAt) < new Date()
          
          return (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              } ${getPriorityColor(notification.priority)} ${isExpired ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <TypeIcon className="w-4 h-4 text-gray-600" />
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                            {notification.category === 'SUCCESS' ? '成功' :
                             notification.category === 'WARNING' ? '警告' :
                             notification.category === 'ERROR' ? '错误' : '信息'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <ChannelIcon className="w-3 h-3" />
                              <span>{notification.channel}</span>
                            </div>
                            <span>{formatNotificationDate(notification.createdAt)}</span>
                          </div>
                          
                          {notification.actionUrl && !isExpired && (
                            <Button size="sm" variant="outline">
                              {notification.actionText || '查看'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStar(notification.id)}
                          className={notification.isStarred ? 'text-yellow-600' : 'text-gray-400'}
                        >
                          <Star className={`w-4 h-4 ${notification.isStarred ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
              <p className="text-gray-600">
                {notificationSearchTerm ? '没有找到匹配的通知' : '您目前没有任何通知'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'profile':
        return renderProfile()
      case 'wallets':
        return renderWallets()
      case 'notifications':
        return renderNotifications()
      default:
        return renderOverview()
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {unifiedDashboard ? (
                <>
                  {/* 统一仪表板标题 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div>
                        <h1 className="text-3xl font-bold">
                          用户中心
                        </h1>
                        <p className="text-muted-foreground mt-2">
                          管理您的投资组合、个人资料、钱包和通知设置
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 标签页导航 */}
                  <TabContainer 
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />

                  {/* 标签页内容 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </>
              ) : (
                renderOverview()
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}