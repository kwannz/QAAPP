'use client';

import { User, Check, Camera, Edit, Save, X, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { useSafeToast } from '@/lib/use-safe-toast';


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

export function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);
  const toast = useSafeToast();

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success('个人资料已更新');
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
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
                {isEditing
? (
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
                )
: (
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
                  onChange={(e) => isEditing && setEditedProfile(previous => ({
                    ...previous,
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
                  onChange={(e) => isEditing && setEditedProfile(previous => ({
                    ...previous,
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
                  {profile.emailVerified
? (
                    <Check className="w-5 h-5 text-green-600" />
                  )
: (
                    <Button size="sm">验证</Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">手机号码</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={isEditing ? editedProfile.phoneNumber || '' : profile.phoneNumber || ''}
                    onChange={(e) => isEditing && setEditedProfile(previous => ({
                      ...previous,
                      phoneNumber: e.target.value,
                    }))}
                    disabled={!isEditing}
                    placeholder="请输入手机号码"
                    className="flex-1"
                  />
                  {profile.phoneVerified
? (
                    <Check className="w-5 h-5 text-green-600" />
                  )
: (
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
  );
}
