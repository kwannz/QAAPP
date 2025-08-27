'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Image as ImageIcon,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

// KYC状态枚举
enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

interface KycApplication {
  id: string
  userId: string
  userEmail: string
  fullName: string
  idNumber: string
  phoneNumber: string
  address: string
  dateOfBirth: string
  status: KycStatus
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  documents: {
    idFront: string
    idBack: string
    selfie: string
    addressProof?: string
  }
  rejectionReason?: string
  riskLevel: 'low' | 'medium' | 'high'
  verificationScore: number
}

// 模拟KYC申请数据
const mockKycApplications: KycApplication[] = [
  {
    id: 'kyc-001',
    userId: 'user-001',
    userEmail: 'zhang@example.com',
    fullName: '张小明',
    idNumber: '110101199001011234',
    phoneNumber: '+86 138****5678',
    address: '北京市朝阳区xxx路xxx号',
    dateOfBirth: '1990-01-01',
    status: KycStatus.PENDING,
    submittedAt: '2024-01-27T10:30:00Z',
    documents: {
      idFront: '/api/documents/id-front-001.jpg',
      idBack: '/api/documents/id-back-001.jpg',
      selfie: '/api/documents/selfie-001.jpg',
      addressProof: '/api/documents/address-001.pdf'
    },
    riskLevel: 'low',
    verificationScore: 85
  },
  {
    id: 'kyc-002', 
    userId: 'user-002',
    userEmail: 'li@example.com',
    fullName: '李小红',
    idNumber: '440101199201025678',
    phoneNumber: '+86 139****9876',
    address: '深圳市南山区xxx大厦xxx室',
    dateOfBirth: '1992-01-02',
    status: KycStatus.PENDING,
    submittedAt: '2024-01-27T09:15:00Z',
    documents: {
      idFront: '/api/documents/id-front-002.jpg',
      idBack: '/api/documents/id-back-002.jpg',
      selfie: '/api/documents/selfie-002.jpg'
    },
    riskLevel: 'medium',
    verificationScore: 72
  },
  {
    id: 'kyc-003',
    userId: 'user-003', 
    userEmail: 'wang@example.com',
    fullName: '王大强',
    idNumber: '310101198805153456',
    phoneNumber: '+86 135****1234',
    address: '上海市黄浦区xxx街道xxx弄xxx号',
    dateOfBirth: '1988-05-15',
    status: KycStatus.APPROVED,
    submittedAt: '2024-01-26T14:20:00Z',
    reviewedAt: '2024-01-26T16:45:00Z',
    reviewedBy: 'admin-001',
    documents: {
      idFront: '/api/documents/id-front-003.jpg',
      idBack: '/api/documents/id-back-003.jpg',
      selfie: '/api/documents/selfie-003.jpg',
      addressProof: '/api/documents/address-003.pdf'
    },
    riskLevel: 'low',
    verificationScore: 95
  },
  {
    id: 'kyc-004',
    userId: 'user-004',
    userEmail: 'zhao@example.com', 
    fullName: '赵小丽',
    idNumber: '350101199306208901',
    phoneNumber: '+86 137****4567',
    address: '福州市台江区xxx路xxx号',
    dateOfBirth: '1993-06-20',
    status: KycStatus.REJECTED,
    submittedAt: '2024-01-25T11:10:00Z',
    reviewedAt: '2024-01-25T15:30:00Z',
    reviewedBy: 'admin-002',
    documents: {
      idFront: '/api/documents/id-front-004.jpg',
      idBack: '/api/documents/id-back-004.jpg',
      selfie: '/api/documents/selfie-004.jpg'
    },
    rejectionReason: '身份证照片模糊不清，无法核实身份信息',
    riskLevel: 'high',
    verificationScore: 45
  }
]

export default function KycReviewPage() {
  const [applications, setApplications] = useState<KycApplication[]>(mockKycApplications)
  const [selectedApplication, setSelectedApplication] = useState<KycApplication | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 筛选申请
  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = app.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.idNumber.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  // 获取状态样式
  const getStatusStyle = (status: KycStatus) => {
    switch (status) {
      case KycStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case KycStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200'
      case KycStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200'
      case KycStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 获取风险等级样式
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 审核操作
  const handleApprove = async (applicationId: string) => {
    try {
      // TODO: 调用API审核通过
      console.log('Approving KYC:', applicationId)
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: KycStatus.APPROVED, reviewedAt: new Date().toISOString(), reviewedBy: 'current-admin' }
          : app
      ))
      
      alert('KYC审核通过')
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      // TODO: 调用API审核拒绝
      console.log('Rejecting KYC:', applicationId, reason)
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: KycStatus.REJECTED, 
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'current-admin',
              rejectionReason: reason
            }
          : app
      ))
      
      alert('KYC审核拒绝')
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleViewDetails = (application: KycApplication) => {
    setSelectedApplication(application)
    setShowDetailModal(true)
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
                <UserCheck className="w-8 h-8 mr-3" />
                KYC审核中心
              </h1>
              <p className="text-gray-600 mt-2">
                管理用户身份验证申请，确保合规性和安全性
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                批量导入
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出数据
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
                    <p className="text-sm text-gray-600">待审核</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {applications.filter(app => app.status === KycStatus.PENDING).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">已通过</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(app => app.status === KycStatus.APPROVED).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">已拒绝</p>
                    <p className="text-2xl font-bold text-red-600">
                      {applications.filter(app => app.status === KycStatus.REJECTED).length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">高风险</p>
                    <p className="text-2xl font-bold text-red-600">
                      {applications.filter(app => app.riskLevel === 'high').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 筛选和搜索 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索用户邮箱、姓名或身份证号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部状态</option>
                <option value={KycStatus.PENDING}>待审核</option>
                <option value={KycStatus.APPROVED}>已通过</option>
                <option value={KycStatus.REJECTED}>已拒绝</option>
                <option value={KycStatus.EXPIRED}>已过期</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </motion.div>

          {/* KYC申请列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>KYC申请列表 ({filteredApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{application.fullName}</h3>
                            <Badge className={getRiskLevelStyle(application.riskLevel)}>
                              {application.riskLevel === 'low' && '低风险'}
                              {application.riskLevel === 'medium' && '中风险'}
                              {application.riskLevel === 'high' && '高风险'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{application.userEmail}</p>
                          <p className="text-xs text-gray-500">
                            提交时间: {new Date(application.submittedAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge className={getStatusStyle(application.status)}>
                            {application.status === KycStatus.PENDING && '待审核'}
                            {application.status === KycStatus.APPROVED && '已通过'} 
                            {application.status === KycStatus.REJECTED && '已拒绝'}
                            {application.status === KycStatus.EXPIRED && '已过期'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            验证得分: {application.verificationScore}/100
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看详情
                          </Button>
                          
                          {application.status === KycStatus.PENDING && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(application.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                通过
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt('请输入拒绝原因:')
                                  if (reason) {
                                    handleReject(application.id, reason)
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                拒绝
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-12">
                      <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到申请</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterStatus !== 'all' 
                          ? '尝试调整搜索条件或筛选器'
                          : '暂无KYC申请记录'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 详情弹窗 */}
          {showDetailModal && selectedApplication && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">KYC详细信息</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDetailModal(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 w-20">姓名:</span>
                          <span className="font-medium">{selectedApplication.fullName}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 w-20">邮箱:</span>
                          <span className="font-medium">{selectedApplication.userEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 w-20">电话:</span>
                          <span className="font-medium">{selectedApplication.phoneNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 w-20">身份证:</span>
                          <span className="font-medium">{selectedApplication.idNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 w-20">生日:</span>
                          <span className="font-medium">{selectedApplication.dateOfBirth}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                          <span className="text-gray-600 w-20">地址:</span>
                          <span className="font-medium">{selectedApplication.address}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">审核信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600">状态:</span>
                          <Badge className={`ml-2 ${getStatusStyle(selectedApplication.status)}`}>
                            {selectedApplication.status === KycStatus.PENDING && '待审核'}
                            {selectedApplication.status === KycStatus.APPROVED && '已通过'}
                            {selectedApplication.status === KycStatus.REJECTED && '已拒绝'}
                            {selectedApplication.status === KycStatus.EXPIRED && '已过期'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">风险等级:</span>
                          <Badge className={`ml-2 ${getRiskLevelStyle(selectedApplication.riskLevel)}`}>
                            {selectedApplication.riskLevel === 'low' && '低风险'}
                            {selectedApplication.riskLevel === 'medium' && '中风险'}
                            {selectedApplication.riskLevel === 'high' && '高风险'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">验证得分:</span>
                          <span className="font-medium ml-2">{selectedApplication.verificationScore}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-600">提交时间:</span>
                          <span className="font-medium ml-2">
                            {new Date(selectedApplication.submittedAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {selectedApplication.reviewedAt && (
                          <div>
                            <span className="text-gray-600">审核时间:</span>
                            <span className="font-medium ml-2">
                              {new Date(selectedApplication.reviewedAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                        {selectedApplication.rejectionReason && (
                          <div>
                            <span className="text-gray-600">拒绝原因:</span>
                            <p className="text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 证件照片 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">身份证件</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">身份证正面</p>
                        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                          <span className="ml-2 text-gray-500">身份证正面照片</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">身份证反面</p>
                        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                          <span className="ml-2 text-gray-500">身份证反面照片</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">本人自拍</p>
                        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                          <span className="ml-2 text-gray-500">自拍照片</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {selectedApplication.status === KycStatus.PENDING && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowDetailModal(false)}
                      >
                        关闭
                      </Button>
                      <Button
                        onClick={() => {
                          const reason = prompt('请输入拒绝原因:')
                          if (reason) {
                            handleReject(selectedApplication.id, reason)
                            setShowDetailModal(false)
                          }
                        }}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        拒绝申请
                      </Button>
                      <Button
                        onClick={() => {
                          handleApprove(selectedApplication.id)
                          setShowDetailModal(false)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        通过审核
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}