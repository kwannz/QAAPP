'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  LogOut,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Header } from '../../components/layout/Header';
import { useSafeToast } from '../../lib/use-safe-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, WalletConnectionManager } from '@/components/ui';

interface SettingsState {
  // Profile Settings
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Security Settings
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  
  // App Settings
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  currency: 'USD' | 'CNY';
  
  // Privacy Settings
  profileVisibility: 'public' | 'private';
  dataAnalytics: boolean;
}

export default function SettingsPage() {
  const toast = useSafeToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'privacy'>('profile');

  const [settings, setSettings] = useState<SettingsState>({
    // Profile
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    
    // App Settings
    theme: 'system',
    language: 'zh-CN',
    currency: 'USD',
    
    // Privacy
    profileVisibility: 'private',
    dataAnalytics: true,
  });

  const handleInputChange = (field: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const MS_PER_SEC = 1000;
  const MIN_PASSWORD_LENGTH = 8;

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, MS_PER_SEC));
      toast.success('个人资料已更新');
    } catch {
      toast.error('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error('新密码确认不匹配');
      return;
    }
    
    if (settings.newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error('新密码至少需要8位');
      return;
    }

    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, MS_PER_SEC));
      toast.success('密码修改成功');
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch {
      toast.error('密码修改失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, MS_PER_SEC));
      toast.success('设置已保存');
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    toast.success('已安全登出');
    // Handle logout logic here
  };

  const handleDeleteAccount = () => {
    toast.error('账户删除功能需要额外验证');
    // Handle account deletion logic here
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'preferences', label: '偏好设置', icon: Settings },
    { id: 'privacy', label: '隐私设置', icon: Lock },
  ];

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
              >
                <h1 className="text-3xl font-bold">账户设置</h1>
                <p className="text-muted-foreground mt-2">
                  管理您的个人资料、安全设置和应用偏好
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-0">
                      <nav className="space-y-1">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors rounded-lg ${
                                activeTab === tab.id
                                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </nav>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Content Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-3"
                >
                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          个人资料
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="名字"
                            value={settings.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="请输入名字"
                          />
                          <Input
                            label="姓氏"
                            value={settings.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="请输入姓氏"
                          />
                        </div>
                        
                        <Input
                          label="邮箱地址"
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="请输入邮箱地址"
                          leftIcon={<Mail className="h-4 w-4" />}
                        />
                        
                        <Input
                          label="手机号码"
                          type="tel"
                          value={settings.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="请输入手机号码"
                          leftIcon={<Smartphone className="h-4 w-4" />}
                        />

                        <div className="flex justify-end gap-2">
                          <Button variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            重置
                          </Button>
                          <Button onClick={handleSaveProfile} loading={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            保存更改
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            修改密码
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Input
                            label="当前密码"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={settings.currentPassword}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            placeholder="请输入当前密码"
                            leftIcon={<Lock className="h-4 w-4" />}
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            }
                          />
                          
                          <Input
                            label="新密码"
                            type={showNewPassword ? 'text' : 'password'}
                            value={settings.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            placeholder="请输入新密码"
                            helper="密码至少8位，包含大小写字母、数字和特殊字符"
                            leftIcon={<Lock className="h-4 w-4" />}
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            }
                          />
                          
                          <Input
                            label="确认新密码"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={settings.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="请再次输入新密码"
                            leftIcon={<Lock className="h-4 w-4" />}
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            }
                          />

                          <Button onClick={handleChangePassword} loading={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            更新密码
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            两步验证
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">启用两步验证</p>
                              <p className="text-sm text-muted-foreground">
                                为您的账户添加额外的安全保护层
                              </p>
                            </div>
                            <Switch
                              checked={settings.twoFactorEnabled}
                              onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          通知设置
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">邮件通知</p>
                              <p className="text-sm text-muted-foreground">
                                接收投资更新和账户信息的邮件通知
                              </p>
                            </div>
                            <Switch
                              checked={settings.emailNotifications}
                              onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">短信通知</p>
                              <p className="text-sm text-muted-foreground">
                                接收重要安全提醒的短信通知
                              </p>
                            </div>
                            <Switch
                              checked={settings.smsNotifications}
                              onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">推送通知</p>
                              <p className="text-sm text-muted-foreground">
                                接收应用内推送通知
                              </p>
                            </div>
                            <Switch
                              checked={settings.pushNotifications}
                              onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">营销邮件</p>
                              <p className="text-sm text-muted-foreground">
                                接收产品更新和特别优惠信息
                              </p>
                            </div>
                            <Switch
                              checked={settings.marketingEmails}
                              onCheckedChange={(checked) => handleInputChange('marketingEmails', checked)}
                            />
                          </div>
                        </div>

                        <Button onClick={handleSaveSettings} loading={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          保存设置
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Preferences */}
                  {activeTab === 'preferences' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          偏好设置
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">主题模式</label>
                            <Select value={settings.theme} onValueChange={(value: any) => handleInputChange('theme', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">浅色模式</SelectItem>
                                <SelectItem value="dark">深色模式</SelectItem>
                                <SelectItem value="system">跟随系统</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">语言设置</label>
                            <Select value={settings.language} onValueChange={(value: any) => handleInputChange('language', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zh-CN">简体中文</SelectItem>
                                <SelectItem value="en-US">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">货币单位</label>
                            <Select value={settings.currency} onValueChange={(value: any) => handleInputChange('currency', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">美元 (USD)</SelectItem>
                                <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button onClick={handleSaveSettings} loading={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          保存设置
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Privacy Settings */}
                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            隐私设置
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">个人资料可见性</label>
                            <Select value={settings.profileVisibility} onValueChange={(value: any) => handleInputChange('profileVisibility', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">公开</SelectItem>
                                <SelectItem value="private">私有</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">数据分析</p>
                              <p className="text-sm text-muted-foreground">
                                允许收集使用数据以改善产品体验
                              </p>
                            </div>
                            <Switch
                              checked={settings.dataAnalytics}
                              onCheckedChange={(checked) => handleInputChange('dataAnalytics', checked)}
                            />
                          </div>

                          <Button onClick={handleSaveSettings} loading={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            保存设置
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            危险操作
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Button variant="outline" onClick={handleLogout} className="w-full">
                              <LogOut className="w-4 h-4 mr-2" />
                              登出账户
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除账户
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            删除账户将永久移除所有数据，此操作不可恢复
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
