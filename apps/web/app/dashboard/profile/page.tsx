'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
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
  Monitor
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Header } from '../../../components/layout/Header'
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { useAuthStore } from '../../../lib/auth-store'

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
  sessionTimeout: number // minutes
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

// 模拟数据
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

export default function UserProfile() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'kyc' | 'privacy' | 'devices'>('profile')
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings)
  const [kycDocuments] = useState<KYCDocument[]>(mockKYCDocuments)
  const [loginDevices] = useState<LoginDevice[]>(mockLoginDevices)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveProfile = () => {
    setProfile(editedProfile)
    setIsEditing(false)
    // TODO: API call to save profile
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新密码确认不匹配')
      return
    }
    // TODO: API call to change password
    console.log('Changing password...')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleToggle2FA = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }))
    // TODO: API call to toggle 2FA
  }

  const handleUploadDocument = (type: string) => {
    // TODO: Implement file upload
    console.log('Uploading document type:', type)
  }

  const handleRevokeDevice = (deviceId: string) => {
    // TODO: API call to revoke device session
    console.log('Revoking device:', deviceId)
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-gray-50">
            <div className="qa-container py-8">
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="lg:col-span-3 h-96 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {/* 页面标题 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
                <p className="text-gray-600 mt-2">
                  管理您的账户信息、安全设置和隐私偏好
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 侧边导航 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
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

                      {/* 导航菜单 */}
                      <nav className="space-y-2">
                        {[
                          { key: 'profile', label: '基本信息', icon: User },
                          { key: 'security', label: '安全设置', icon: Shield },
                          { key: 'kyc', label: '身份验证', icon: FileText },
                          { key: 'privacy', label: '隐私设置', icon: Eye },
                          { key: 'devices', label: '登录设备', icon: Smartphone }
                        ].map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.key}
                              onClick={() => setActiveTab(item.key as any)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === item.key
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          )
                        })}
                      </nav>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 主内容区域 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-3"
                >
                  {/* 基本信息标签页 */}
                  {activeTab === 'profile' && (
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
                        {/* 个人信息 */}
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

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">显示名称</label>
                          <Input
                            value={isEditing ? editedProfile.displayName || '' : profile.displayName || ''}
                            onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="请输入显示名称"
                          />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">出生日期</label>
                            <Input
                              type="date"
                              value={isEditing ? editedProfile.dateOfBirth || '' : profile.dateOfBirth || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">性别</label>
                            <select
                              value={isEditing ? editedProfile.gender || '' : profile.gender || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">请选择性别</option>
                              <option value="MALE">男</option>
                              <option value="FEMALE">女</option>
                              <option value="OTHER">其他</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">职业</label>
                            <Input
                              value={isEditing ? editedProfile.occupation || '' : profile.occupation || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, occupation: e.target.value }))}
                              disabled={!isEditing}
                              placeholder="请输入职业"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">公司</label>
                            <Input
                              value={isEditing ? editedProfile.company || '' : profile.company || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, company: e.target.value }))}
                              disabled={!isEditing}
                              placeholder="请输入公司名称"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">个人网站</label>
                          <Input
                            value={isEditing ? editedProfile.website || '' : profile.website || ''}
                            onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">个人简介</label>
                          <textarea
                            value={isEditing ? editedProfile.bio || '' : profile.bio || ''}
                            onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                            disabled={!isEditing}
                            rows={4}
                            placeholder="请输入个人简介..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>

                        {/* 地址信息 */}
                        <div className="pt-6 border-t">
                          <h4 className="font-semibold text-gray-900 mb-4">地址信息</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">国家</label>
                              <Input
                                value={isEditing ? editedProfile.address?.country || '' : profile.address?.country || ''}
                                onChange={(e) => isEditing && setEditedProfile(prev => ({
                                  ...prev,
                                  address: { ...prev.address!, country: e.target.value }
                                }))}
                                disabled={!isEditing}
                                placeholder="请输入国家"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">省/州</label>
                              <Input
                                value={isEditing ? editedProfile.address?.state || '' : profile.address?.state || ''}
                                onChange={(e) => isEditing && setEditedProfile(prev => ({
                                  ...prev,
                                  address: { ...prev.address!, state: e.target.value }
                                }))}
                                disabled={!isEditing}
                                placeholder="请输入省份或州"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">城市</label>
                              <Input
                                value={isEditing ? editedProfile.address?.city || '' : profile.address?.city || ''}
                                onChange={(e) => isEditing && setEditedProfile(prev => ({
                                  ...prev,
                                  address: { ...prev.address!, city: e.target.value }
                                }))}
                                disabled={!isEditing}
                                placeholder="请输入城市"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">邮政编码</label>
                              <Input
                                value={isEditing ? editedProfile.address?.postalCode || '' : profile.address?.postalCode || ''}
                                onChange={(e) => isEditing && setEditedProfile(prev => ({
                                  ...prev,
                                  address: { ...prev.address!, postalCode: e.target.value }
                                }))}
                                disabled={!isEditing}
                                placeholder="请输入邮政编码"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">详细地址</label>
                            <Input
                              value={isEditing ? editedProfile.address?.street || '' : profile.address?.street || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({
                                ...prev,
                                address: { ...prev.address!, street: e.target.value }
                              }))}
                              disabled={!isEditing}
                              placeholder="请输入详细地址"
                            />
                          </div>
                        </div>

                        {/* 推荐码信息 */}
                        <div className="pt-6 border-t">
                          <h4 className="font-semibold text-gray-900 mb-4">推荐信息</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">我的推荐码</label>
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
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">注册时间</label>
                              <Input
                                value={formatDateTime(profile.createdAt)}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 安全设置标签页 */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      {/* 密码设置 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Key className="w-5 h-5 mr-2" />
                            密码设置
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">当前密码</label>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="请输入当前密码"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">新密码</label>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="请输入新密码"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">确认新密码</label>
                            <Input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="请再次输入新密码"
                            />
                          </div>
                          <div className="flex items-center space-x-4">
                            <Button onClick={handlePasswordChange}>
                              更改密码
                            </Button>
                            <p className="text-xs text-gray-500">
                              上次修改: {formatDate(securitySettings.lastPasswordChange)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 双重认证 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            双重认证 (2FA)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Google Authenticator</h4>
                              <p className="text-sm text-gray-600">
                                使用Google Authenticator应用程序进行双重认证
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                securitySettings.twoFactorEnabled 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {securitySettings.twoFactorEnabled ? '已启用' : '未启用'}
                              </span>
                              <Button 
                                size="sm" 
                                onClick={handleToggle2FA}
                                variant={securitySettings.twoFactorEnabled ? 'outline' : 'default'}
                              >
                                {securitySettings.twoFactorEnabled ? (
                                  <>
                                    <Unlock className="w-4 h-4 mr-2" />
                                    禁用
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    启用
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 其他安全设置 */}
                      <Card>
                        <CardHeader>
                          <CardTitle>安全偏好</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">登录通知</h4>
                              <p className="text-sm text-gray-600">新设备登录时发送邮件通知</p>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                securitySettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSecuritySettings(prev => ({
                                ...prev,
                                loginNotifications: !prev.loginNotifications
                              }))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">提现确认</h4>
                              <p className="text-sm text-gray-600">提现前要求额外验证</p>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                securitySettings.withdrawalConfirmation ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSecuritySettings(prev => ({
                                ...prev,
                                withdrawalConfirmation: !prev.withdrawalConfirmation
                              }))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  securitySettings.withdrawalConfirmation ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">会话超时</h4>
                              <span className="text-sm text-gray-600">{securitySettings.sessionTimeout} 分钟</span>
                            </div>
                            <input
                              type="range"
                              min="15"
                              max="120"
                              step="15"
                              value={securitySettings.sessionTimeout}
                              onChange={(e) => setSecuritySettings(prev => ({
                                ...prev,
                                sessionTimeout: parseInt(e.target.value)
                              }))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>15分钟</span>
                              <span>120分钟</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* KYC验证标签页 */}
                  {activeTab === 'kyc' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          身份验证 (KYC)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* KYC状态概览 */}
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Check className="w-6 h-6 text-blue-600" />
                              <div>
                                <h4 className="font-medium text-blue-900">身份验证已完成</h4>
                                <p className="text-sm text-blue-700">您的账户已通过身份验证，可以使用所有功能</p>
                              </div>
                            </div>
                          </div>

                          {/* 文档列表 */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">上传的文档</h4>
                            {kycDocuments.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FileText className="w-8 h-8 text-gray-400" />
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      {getDocumentTypeName(doc.type)}
                                    </h5>
                                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span>上传于: {formatDate(doc.uploadedAt)}</span>
                                      <span>•</span>
                                      <span>{formatFileSize(doc.fileSize)}</span>
                                      {doc.reviewedAt && (
                                        <>
                                          <span>•</span>
                                          <span>审核于: {formatDate(doc.reviewedAt)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusColor(doc.status)}`}>
                                    {doc.status === 'APPROVED' ? '已通过' :
                                     doc.status === 'REJECTED' ? '已拒绝' :
                                     doc.status === 'PENDING' ? '审核中' : '已过期'}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    {doc.status === 'REJECTED' && (
                                      <Button variant="ghost" size="sm">
                                        <Upload className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 上传新文档 */}
                          <div className="border-t pt-6">
                            <h4 className="font-semibold text-gray-900 mb-4">上传新文档</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { type: 'ID_CARD', name: '身份证', desc: '身份证正反面照片' },
                                { type: 'PASSPORT', name: '护照', desc: '护照个人信息页' },
                                { type: 'DRIVER_LICENSE', name: '驾驶证', desc: '驾驶证正反面照片' },
                                { type: 'PROOF_OF_ADDRESS', name: '地址证明', desc: '水电费账单或银行对账单' }
                              ].map((docType) => {
                                const hasUploaded = kycDocuments.some(doc => doc.type === docType.type)
                                return (
                                  <div key={docType.type} className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-center">
                                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                      <h5 className="font-medium text-gray-900">{docType.name}</h5>
                                      <p className="text-xs text-gray-600 mb-3">{docType.desc}</p>
                                      <Button 
                                        size="sm" 
                                        variant={hasUploaded ? 'outline' : 'default'}
                                        onClick={() => handleUploadDocument(docType.type)}
                                      >
                                        <Upload className="w-3 h-3 mr-1" />
                                        {hasUploaded ? '重新上传' : '上传'}
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 隐私设置标签页 */}
                  {activeTab === 'privacy' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          隐私设置
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">邮件通知</h4>
                              <p className="text-sm text-gray-600">接收账户相关的邮件通知</p>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                securitySettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSecuritySettings(prev => ({
                                ...prev,
                                emailNotifications: !prev.emailNotifications
                              }))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  securitySettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">短信通知</h4>
                              <p className="text-sm text-gray-600">接收重要操作的短信验证码和通知</p>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                securitySettings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setSecuritySettings(prev => ({
                                ...prev,
                                smsNotifications: !prev.smsNotifications
                              }))}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                  securitySettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="pt-6 border-t">
                          <h4 className="font-semibold text-gray-900 mb-4">数据管理</h4>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                              <Download className="w-4 h-4 mr-2" />
                              导出我的数据
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除账户
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 登录设备标签页 */}
                  {activeTab === 'devices' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Smartphone className="w-5 h-5 mr-2" />
                          登录设备
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {loginDevices.map((device) => {
                            const DeviceIcon = getDeviceIcon(device.deviceType)
                            return (
                              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <DeviceIcon className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h5 className="font-medium text-gray-900">{device.deviceName}</h5>
                                      {device.isCurrentSession && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                          当前设备
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {device.browser} · {device.os}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span>{device.location}</span>
                                      <span>•</span>
                                      <span>{device.ip}</span>
                                      <span>•</span>
                                      <span>最后登录: {formatDateTime(device.lastLoginAt)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {!device.isCurrentSession && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleRevokeDevice(device.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      撤销
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        <div className="pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">会话管理</h4>
                              <p className="text-sm text-gray-600">管理所有登录会话的安全</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              撤销所有其他设备
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}