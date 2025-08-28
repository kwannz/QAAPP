'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Users,
  Settings,
  Eye,
  RefreshCw,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Key,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface Permission {
  id: string
  name: string
  code: string
  description: string
  category: 'user' | 'admin' | 'system' | 'financial' | 'audit'
  level: 'read' | 'write' | 'delete' | 'execute'
  createdAt: string
  isActive: boolean
}

interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: string[]
  userCount: number
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UserRole {
  id: string
  userId: string
  userEmail: string
  userName: string
  roleId: string
  roleName: string
  assignedBy: string
  assignedAt: string
  expiresAt: string | null
  isActive: boolean
}

// 模拟权限数据
const mockPermissions: Permission[] = [
  {
    id: 'perm-001',
    name: '查看用户信息',
    code: 'user:read',
    description: '允许查看用户基本信息和资料',
    category: 'user',
    level: 'read',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-002',
    name: '编辑用户信息',
    code: 'user:write',
    description: '允许修改用户基本信息',
    category: 'user',
    level: 'write',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-003',
    name: '删除用户',
    code: 'user:delete',
    description: '允许删除用户账户',
    category: 'user',
    level: 'delete',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-004',
    name: '查看管理后台',
    code: 'admin:read',
    description: '允许访问管理后台界面',
    category: 'admin',
    level: 'read',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-005',
    name: '管理系统配置',
    code: 'system:write',
    description: '允许修改系统配置参数',
    category: 'system',
    level: 'write',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-006',
    name: '查看财务数据',
    code: 'financial:read',
    description: '允许查看财务相关数据',
    category: 'financial',
    level: 'read',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-007',
    name: '处理财务交易',
    code: 'financial:execute',
    description: '允许执行财务交易操作',
    category: 'financial',
    level: 'execute',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'perm-008',
    name: '查看审计日志',
    code: 'audit:read',
    description: '允许查看系统审计日志',
    category: 'audit',
    level: 'read',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  }
]

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: '超级管理员',
    code: 'super_admin',
    description: '系统最高权限，拥有所有操作权限',
    permissions: ['perm-001', 'perm-002', 'perm-003', 'perm-004', 'perm-005', 'perm-006', 'perm-007', 'perm-008'],
    userCount: 2,
    isDefault: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-27T10:00:00Z'
  },
  {
    id: 'role-002',
    name: '管理员',
    code: 'admin',
    description: '管理员权限，可以管理用户和查看数据',
    permissions: ['perm-001', 'perm-002', 'perm-004', 'perm-006', 'perm-008'],
    userCount: 5,
    isDefault: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z'
  },
  {
    id: 'role-003',
    name: '普通用户',
    code: 'user',
    description: '普通用户权限，只能查看自己的信息',
    permissions: ['perm-001'],
    userCount: 1250,
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: 'role-004',
    name: '财务专员',
    code: 'financial_officer',
    description: '财务专员权限，负责财务相关操作',
    permissions: ['perm-001', 'perm-004', 'perm-006', 'perm-007', 'perm-008'],
    userCount: 3,
    isDefault: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  },
  {
    id: 'role-005',
    name: '审计员',
    code: 'auditor',
    description: '审计员权限，负责系统审计工作',
    permissions: ['perm-001', 'perm-004', 'perm-008'],
    userCount: 2,
    isDefault: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-24T14:20:00Z'
  }
]

// 模拟用户角色分配数据
const mockUserRoles: UserRole[] = [
  {
    id: 'ur-001',
    userId: 'user-001',
    userEmail: 'admin@qa-app.com',
    userName: '系统管理员',
    roleId: 'role-001',
    roleName: '超级管理员',
    assignedBy: 'system',
    assignedAt: '2024-01-01T00:00:00Z',
    expiresAt: null,
    isActive: true
  },
  {
    id: 'ur-002',
    userId: 'user-002',
    userEmail: 'zhang@example.com',
    userName: '张小明',
    roleId: 'role-002',
    roleName: '管理员',
    assignedBy: 'admin@qa-app.com',
    assignedAt: '2024-01-15T10:30:00Z',
    expiresAt: null,
    isActive: true
  },
  {
    id: 'ur-003',
    userId: 'user-003',
    userEmail: 'li@example.com',
    userName: '李小华',
    roleId: 'role-004',
    roleName: '财务专员',
    assignedBy: 'admin@qa-app.com',
    assignedAt: '2024-01-20T14:15:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    isActive: true
  },
  {
    id: 'ur-004',
    userId: 'user-004',
    userEmail: 'wang@example.com',
    userName: '王小强',
    roleId: 'role-005',
    roleName: '审计员',
    assignedBy: 'admin@qa-app.com',
    assignedAt: '2024-01-25T09:00:00Z',
    expiresAt: null,
    isActive: true
  },
  {
    id: 'ur-005',
    userId: 'user-005',
    userEmail: 'zhao@example.com',
    userName: '赵小丽',
    roleId: 'role-003',
    roleName: '普通用户',
    assignedBy: 'system',
    assignedAt: '2024-01-26T16:45:00Z',
    expiresAt: null,
    isActive: false
  }
]

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions)
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [userRoles, setUserRoles] = useState<UserRole[]>(mockUserRoles)
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles' | 'assignments'>('permissions')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 获取分类样式
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'user':
        return 'bg-blue-100 text-blue-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'system':
        return 'bg-orange-100 text-orange-800'
      case 'financial':
        return 'bg-green-100 text-green-800'
      case 'audit':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取权限级别样式
  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'read':
        return 'bg-green-100 text-green-800'
      case 'write':
        return 'bg-yellow-100 text-yellow-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'execute':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExportReport = () => {
    alert('导出权限报告功能开发中')
  }

  const handleCreateRole = () => {
    alert('创建角色功能开发中')
  }

  const handleCreatePermission = () => {
    alert('创建权限功能开发中')
  }

  const handleAssignRole = () => {
    alert('分配角色功能开发中')
  }

  const handlePermissionTest = () => {
    alert('权限测试工具功能开发中')
  }

  const handlePermissionMatrix = () => {
    alert('权限矩阵展示功能开发中')
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                权限管理
              </h1>
              <p className="text-gray-600 mt-2">
                角色权限配置和用户权限分配管理
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePermissionMatrix}
              >
                <Database className="w-4 h-4 mr-2" />
                权限矩阵
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePermissionTest}
              >
                <Key className="w-4 h-4 mr-2" />
                权限测试
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportReport}
              >
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </motion.div>

          {/* 统计卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">总权限数</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {permissions.length}
                    </p>
                  </div>
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">角色数量</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {roles.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">活跃用户分配</p>
                    <p className="text-2xl font-bold text-green-600">
                      {userRoles.filter(ur => ur.isActive).length}
                    </p>
                  </div>
                  <UserPlus className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">即将过期</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {userRoles.filter(ur => ur.expiresAt && new Date(ur.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 标签切换 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex space-x-1 bg-gray-100 rounded-lg p-1"
          >
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'permissions'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              权限管理
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'roles'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              角色管理
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'assignments'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              用户分配
            </button>
          </motion.div>

          {/* 操作按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {activeTab === 'permissions' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCreatePermission}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新建权限
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  权限分类管理
                </Button>
              </>
            )}
            {activeTab === 'roles' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCreateRole}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新建角色
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  角色权限配置
                </Button>
              </>
            )}
            {activeTab === 'assignments' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAssignRole}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  分配角色
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  权限变更历史
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  批量撤销权限
                </Button>
              </>
            )}
          </motion.div>

          {/* 搜索和筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={
                  activeTab === 'permissions' ? "搜索权限名称、代码..." :
                  activeTab === 'roles' ? "搜索角色名称、描述..." :
                  "搜索用户邮箱、角色..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {activeTab === 'permissions' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部分类</option>
                  <option value="user">用户</option>
                  <option value="admin">管理</option>
                  <option value="system">系统</option>
                  <option value="financial">财务</option>
                  <option value="audit">审计</option>
                </select>
              )}
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* 内容区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {activeTab === 'permissions' && (
              <Card>
                <CardHeader>
                  <CardTitle>权限列表 ({permissions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {permissions
                      .filter(perm => 
                        (searchQuery === '' || 
                         perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         perm.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
                        (filterCategory === 'all' || perm.category === filterCategory)
                      )
                      .map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyle(permission.category)}`}>
                              <Key className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {permission.name}
                                </h3>
                                <Badge className={getCategoryStyle(permission.category)}>
                                  {permission.category === 'user' && '用户'}
                                  {permission.category === 'admin' && '管理'}
                                  {permission.category === 'system' && '系统'}
                                  {permission.category === 'financial' && '财务'}
                                  {permission.category === 'audit' && '审计'}
                                </Badge>
                                <Badge className={getLevelStyle(permission.level)}>
                                  {permission.level === 'read' && '读取'}
                                  {permission.level === 'write' && '写入'}
                                  {permission.level === 'delete' && '删除'}
                                  {permission.level === 'execute' && '执行'}
                                </Badge>
                                <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                                  {permission.isActive ? '启用' : '禁用'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>代码: {permission.code}</span>
                                <span>描述: {permission.description}</span>
                              </div>

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>创建时间: {new Date(permission.createdAt).toLocaleString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(permission)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'roles' && (
              <Card>
                <CardHeader>
                  <CardTitle>角色列表 ({roles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roles
                      .filter(role => 
                        searchQuery === '' || 
                        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        role.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {role.name}
                                </h3>
                                {role.isDefault && (
                                  <Badge variant="secondary">默认角色</Badge>
                                )}
                                <Badge variant={role.isActive ? 'default' : 'secondary'}>
                                  {role.isActive ? '启用' : '禁用'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>代码: {role.code}</span>
                                <span>权限数: {role.permissions.length}</span>
                                <span>用户数: {role.userCount}</span>
                              </div>

                              <p className="text-sm text-gray-500 mb-1">{role.description}</p>

                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>更新时间: {new Date(role.updatedAt).toLocaleString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(role)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'assignments' && (
              <Card>
                <CardHeader>
                  <CardTitle>用户角色分配 ({userRoles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userRoles
                      .filter(userRole => 
                        searchQuery === '' || 
                        userRole.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        userRole.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        userRole.roleName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((userRole) => (
                        <div
                          key={userRole.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {userRole.userName}
                                </h3>
                                <Badge variant="outline">
                                  {userRole.roleName}
                                </Badge>
                                <Badge variant={userRole.isActive ? 'default' : 'secondary'}>
                                  {userRole.isActive ? '活跃' : '停用'}
                                </Badge>
                                {userRole.expiresAt && new Date(userRole.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                                  <Badge className="bg-orange-100 text-orange-800">即将过期</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                <span>邮箱: {userRole.userEmail}</span>
                                <span>分配者: {userRole.assignedBy}</span>
                              </div>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>分配时间: {new Date(userRole.assignedAt).toLocaleString('zh-CN')}</span>
                                </div>
                                {userRole.expiresAt && (
                                  <span>过期时间: {new Date(userRole.expiresAt).toLocaleString('zh-CN')}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(userRole)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* 详情弹窗 */}
          {showDetailModal && selectedItem && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {activeTab === 'permissions' ? '权限详情' : 
                       activeTab === 'roles' ? '角色详情' : '用户分配详情'}
                    </h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'permissions' && selectedItem && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-600 block">权限名称:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">权限代码:</span>
                        <span className="font-mono text-sm">{selectedItem.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">权限描述:</span>
                        <span className="font-medium">{selectedItem.description}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">权限分类:</span>
                        <Badge className={getCategoryStyle(selectedItem.category)}>
                          {selectedItem.category === 'user' && '用户'}
                          {selectedItem.category === 'admin' && '管理'}
                          {selectedItem.category === 'system' && '系统'}
                          {selectedItem.category === 'financial' && '财务'}
                          {selectedItem.category === 'audit' && '审计'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600 block">权限级别:</span>
                        <Badge className={getLevelStyle(selectedItem.level)}>
                          {selectedItem.level === 'read' && '读取'}
                          {selectedItem.level === 'write' && '写入'}
                          {selectedItem.level === 'delete' && '删除'}
                          {selectedItem.level === 'execute' && '执行'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600 block">创建时间:</span>
                        <span className="font-medium">
                          {new Date(selectedItem.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'roles' && selectedItem && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-600 block">角色名称:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">角色代码:</span>
                        <span className="font-mono text-sm">{selectedItem.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">角色描述:</span>
                        <span className="font-medium">{selectedItem.description}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">权限列表:</span>
                        <div className="mt-2 space-y-2">
                          {selectedItem.permissions.map((permId: string) => {
                            const perm = permissions.find(p => p.id === permId)
                            return perm ? (
                              <div key={permId} className="flex items-center space-x-2">
                                <Badge className={getCategoryStyle(perm.category)}>
                                  {perm.name}
                                </Badge>
                                <span className="text-sm text-gray-600">{perm.code}</span>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 block">用户数量:</span>
                        <span className="font-medium">{selectedItem.userCount}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}