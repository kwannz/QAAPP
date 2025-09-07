'use client';

import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Camera,
  Edit,
  Save,
  X,
  Check,
  Lock,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Header } from '../../components/layout/Header';
import { useAuthStore } from '../../lib/auth-context';
import { useSafeToast } from '../../lib/use-safe-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, Alert, AlertDescription } from '@/components/ui';
import { logger } from '@/lib/verbose-logger';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  address?: {
    country: string;
    state: string;
    city: string;
    street: string;
    postalCode: string;
  };
  occupation?: string;
  company?: string;
  website?: string;
  bio?: string;
  referralCode: string;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

// Mock profile data
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
    postalCode: '100020',
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
  twoFactorEnabled: false,
};

export default function ProfilePage() {
  const toast = useSafeToast();
  const { user: _user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success('个人资料已更新');
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密码确认不匹配');
      return;
    }
    const MIN_PASSWORD_LENGTH = 8;
    if (passwordForm.newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error('新密码至少需要8位字符');
      return;
    }
    if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
      logger.info('Profile', 'Changing password');
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('密码修改成功');
  };

  const handleToggle2FA = () => {
    setProfile(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled,
    }));
    toast.success(profile.twoFactorEnabled ? '双重认证已禁用' : '双重认证已启用');
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      toast.success('推荐码已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                  <h1 className="text-3xl font-bold">个人资料</h1>
                  <p className="text-muted-foreground mt-2">
                    管理您的个人信息和账户安全设置
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      {/* Avatar and basic info */}
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

                      {/* Quick Stats */}
                      <div className="space-y-3 text-sm border-t pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">注册时间</span>
                          <span>{formatDate(profile.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">最后登录</span>
                          <span>{formatDate(profile.lastLoginAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">双重认证</span>
                          <Badge variant={profile.twoFactorEnabled ? 'default' : 'secondary'}>
                            {profile.twoFactorEnabled ? '已启用' : '未启用'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Basic Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                              onChange={(e) => isEditing && setEditedProfile(prev => ({
                                ...prev,
                                firstName: e.target.value,
                              }))}
                              disabled={!isEditing}
                              placeholder="请输入姓"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">名</label>
                            <Input
                              value={isEditing ? editedProfile.lastName || '' : profile.lastName || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({
                                ...prev,
                                lastName: e.target.value,
                              }))}
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
                                onChange={(e) => isEditing && setEditedProfile(prev => ({
                                  ...prev,
                                  phoneNumber: e.target.value,
                                }))}
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
                            <label className="text-sm font-medium text-gray-700 mb-2 block">职业</label>
                            <Input
                              value={isEditing ? editedProfile.occupation || '' : profile.occupation || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({
                                ...prev,
                                occupation: e.target.value,
                              }))}
                              disabled={!isEditing}
                              placeholder="请输入职业"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">公司</label>
                            <Input
                              value={isEditing ? editedProfile.company || '' : profile.company || ''}
                              onChange={(e) => isEditing && setEditedProfile(prev => ({
                                ...prev,
                                company: e.target.value,
                              }))}
                              disabled={!isEditing}
                              placeholder="请输入公司"
                            />
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
                            <Button size="sm" variant="outline" onClick={copyReferralCode}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Security Settings */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>安全设置</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Password Change */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">修改密码</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">当前密码</label>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    currentPassword: e.target.value,
                                  }))}
                                  placeholder="请输入当前密码"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">新密码</label>
                                <div className="relative">
                                  <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    newPassword: e.target.value,
                                  }))}
                                    placeholder="请输入新密码"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                  onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                  }))}
                                  placeholder="请再次输入新密码"
                                />
                              </div>
                            </div>
                            
                            <Button 
                              onClick={handlePasswordChange} 
                              disabled={!passwordForm.currentPassword || !passwordForm.newPassword}
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              更改密码
                            </Button>
                          </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="border-t pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">双重认证</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                为您的账户添加额外的安全保护
                              </p>
                            </div>
                            <Button
                              onClick={handleToggle2FA}
                              variant={profile.twoFactorEnabled ? 'default' : 'outline'}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              {profile.twoFactorEnabled ? '禁用' : '启用'}
                            </Button>
                          </div>
                          
                          {!profile.twoFactorEnabled && (
                            <Alert className="mt-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                建议启用双重认证以提高账户安全性
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
