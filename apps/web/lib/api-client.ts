import axios, { AxiosError, AxiosResponse } from 'axios'
import { useAuthStore } from './auth-store'
import toast from 'react-hot-toast'
import logger from './logger'

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token和日志
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    // 记录请求日志并生成请求ID
    const requestId = logger.logApiRequest(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      config.data,
      config.headers
    )
    config.headers['X-Request-Id'] = requestId
    
    // 保存请求开始时间
    (config as any).requestStartTime = Date.now()
    (config as any).requestId = requestId
    
    return config
  },
  (error) => {
    logger.error('API', 'Request interceptor error', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误、token刷新和日志
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 计算请求耗时
    const config = response.config as any
    const duration = config.requestStartTime ? Date.now() - config.requestStartTime : undefined
    
    // 记录响应日志
    logger.logApiResponse(
      config.requestId,
      response.status,
      response.data,
      duration
    )
    
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    // 处理401错误（token过期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { refreshToken, clearAuth } = useAuthStore.getState()
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken: newAccessToken } = response.data
          useAuthStore.getState().setTokens(newAccessToken, refreshToken)
          
          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // 刷新失败，清除认证信息
          clearAuth()
          toast.error('登录已过期，请重新登录')
          window.location.href = '/auth/login'
          return Promise.reject(refreshError)
        }
      } else {
        // 没有refresh token，直接跳转登录
        clearAuth()
        window.location.href = '/auth/login'
      }
    }
    
    // 处理其他错误
    const errorMessage = (error.response?.data as any)?.message || (error as any).message || '请求失败'
    
    // 不显示某些错误的toast
    const silentErrors = [401, 403]
    if (!silentErrors.includes(error.response?.status || 0)) {
      toast.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

// API 接口定义
export const authApi = {
  // 邮箱登录
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  
  // 邮箱注册
  register: (data: { email: string; password: string; referralCode?: string }) =>
    apiClient.post('/auth/register', data),
  
  // 获取Web3挑战
  getWeb3Challenge: (address: string) =>
    apiClient.get(`/auth/web3/challenge/${address}`),
  
  // Web3登录
  web3Login: (data: { address: string; signature: string }) =>
    apiClient.post('/auth/web3/login', data),
  
  // Web3注册
  web3Register: (data: { address: string; signature: string; referralCode?: string }) =>
    apiClient.post('/auth/web3/register', data),
  
  // 刷新token
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  
  // 登出
  logout: () =>
    apiClient.post('/auth/logout'),
  
  // 获取当前用户信息
  me: () =>
    apiClient.get('/auth/me'),
  
  // 修改密码
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
}

export const userApi = {
  // 获取当前用户详细信息
  getCurrentUser: () =>
    apiClient.get('/users/me'),
  
  // 更新用户信息
  updateProfile: (data: any) =>
    apiClient.put('/users/me', data),
  
  // 获取用户统计
  getStats: () =>
    apiClient.get('/users/me/stats'),
  
  // 获取推荐用户列表
  getReferrals: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/users/me/referrals', { params }),
  
  // 添加钱包
  addWallet: (data: { chainId: number; address: string; isPrimary?: boolean; label?: string }) =>
    apiClient.post('/users/me/wallets', data),
  
  // 删除钱包
  removeWallet: (walletId: string) =>
    apiClient.delete(`/users/me/wallets/${walletId}`),
  
  // 设置主钱包
  setPrimaryWallet: (walletId: string) =>
    apiClient.put(`/users/me/wallets/${walletId}/primary`),
}

// 产品API（占位符）
export const productApi = {
  getAll: () => apiClient.get('/products'),
  getById: (id: string) => apiClient.get(`/products/${id}`),
}

// 订单API（占位符）
export const orderApi = {
  create: (data: any) => apiClient.post('/orders', data),
  getMyOrders: (params?: any) => apiClient.get('/orders/me', { params }),
}

// 仓位API（占位符）
export const positionApi = {
  getMyPositions: (params?: any) => apiClient.get('/positions/me', { params }),
  getById: (id: string) => apiClient.get(`/positions/${id}`),
}

// 分红API（占位符）  
export const payoutApi = {
  getClaimable: () => apiClient.get('/payouts/claimable'),
  claim: (ids: string[]) => apiClient.post('/payouts/claim', { payoutIds: ids }),
}

// 审计API
export const auditApi = {
  // 用户端
  getMyLogs: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/audit/me', { params }),
  
  getActivityStats: (days?: number) =>
    apiClient.get('/audit/me/activity-stats', { params: { days } }),
  
  // 管理员端
  getAdminLogs: (params?: { 
    actorId?: string;
    action?: string;
    resourceType?: string;
    category?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get('/audit/admin/logs', { params }),
  
  getLogById: (id: string) =>
    apiClient.get(`/audit/admin/logs/${id}`),
  
  getAuditStats: (params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get('/audit/admin/stats', { params }),
  
  exportAuditLogs: (params?: {
    format: 'csv' | 'pdf' | 'excel';
    startDate?: string;
    endDate?: string;
    category?: string;
    severity?: string;
  }) =>
    apiClient.get('/audit/admin/export', { 
      params,
      responseType: 'blob'
    }),
  
  markAsAbnormal: (logIds: string[]) =>
    apiClient.post('/audit/admin/mark-abnormal', { logIds }),
  
  generateSummary: (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.post('/audit/admin/generate-summary', params),
  
  // 系统审计
  getSystemEvents: (params?: {
    eventType?: string;
    severity?: string;
    status?: string;
    service?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get('/audit/system/events', { params }),
  
  getSystemMetrics: () =>
    apiClient.get('/audit/system/metrics'),
  
  // 用户审计
  getUserAuditLogs: (userId?: string, params?: {
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get(userId ? `/audit/users/${userId}` : '/audit/users', { params }),
  
  getUserBehaviorAnalysis: (userId: string) =>
    apiClient.get(`/audit/users/${userId}/behavior-analysis`),
  
  getUserRiskScore: (userId: string) =>
    apiClient.get(`/audit/users/${userId}/risk-score`),
}

// 佣金API
export const commissionApi = {
  // 用户端
  getUserHistory: (userId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/commissions/user/${userId}/history`, { params }),
  
  getUserSummary: (userId: string) =>
    apiClient.get(`/commissions/user/${userId}/summary`),
  
  // 管理员端
  getAdminList: (params?: { 
    status?: string; 
    type?: string; 
    period?: string; 
    agentId?: string; 
    page?: number; 
    limit?: number 
  }) =>
    apiClient.get('/commissions/admin/list', { params }),
  
  getStats: (period?: string) =>
    apiClient.get('/commissions/admin/stats', { params: { period } }),
  
  calculate: (data: {
    period: string;
    agentIds?: string[];
    includeSubAgents?: boolean;
    forceRecalculate?: boolean;
  }) =>
    apiClient.post('/commissions/admin/calculate', data),
  
  processPayments: (data: {
    commissionIds?: string[];
    period?: string;
    batchSize?: number;
  }) =>
    apiClient.post('/commissions/admin/process-payments', data),
  
  getBreakdown: (period: string, groupBy?: string) =>
    apiClient.get('/commissions/admin/breakdown', { params: { period, groupBy } }),
  
  getRules: () =>
    apiClient.get('/commissions/admin/rules'),
  
  updateRules: (data: {
    minCommissionThreshold: number;
    maxCommissionRate: number;
    payoutFrequency: string;
    holdingPeriod: number;
    bonusStructure?: any;
  }) =>
    apiClient.post('/commissions/admin/rules', data),
  
  generateReport: (data: {
    period: string;
    type: 'summary' | 'detailed' | 'agent-breakdown';
    format: 'pdf' | 'excel' | 'csv';
    includeSubAgents?: boolean;
  }) =>
    apiClient.post('/commissions/admin/generate-report', data),
  
  export: (params?: { period?: string; status?: string; format?: string }) =>
    apiClient.get('/commissions/admin/export', { params }),
}

// 通知API
export const notificationApi = {
  // 用户端
  getUserNotifications: (userId: string, params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get(`/notifications/user/${userId}`, { params }),
  
  markAsRead: (userId: string, notificationId: string) =>
    apiClient.put(`/notifications/user/${userId}/read/${notificationId}`),
  
  markAllAsRead: (userId: string) =>
    apiClient.put(`/notifications/user/${userId}/read-all`),
  
  getStats: (userId: string) =>
    apiClient.get(`/notifications/user/${userId}/stats`),
  
  getPreferences: (userId: string) =>
    apiClient.get(`/notifications/user/${userId}/preferences`),
  
  updatePreferences: (userId: string, preferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    types?: {
      orderUpdates?: boolean;
      commissionPayments?: boolean;
      systemAlerts?: boolean;
      promotions?: boolean;
    };
  }) =>
    apiClient.put(`/notifications/user/${userId}/preferences`, preferences),
  
  delete: (userId: string, notificationId: string) =>
    apiClient.delete(`/notifications/user/${userId}/${notificationId}`),
  
  // 管理员端
  getAdminNotifications: (params?: {
    type?: string;
    status?: string;
    recipient?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get('/notifications/admin/list', { params }),
  
  send: (data: {
    recipientId?: string;
    recipientType: 'USER' | 'AGENT' | 'ALL';
    type: string;
    title: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    channels: ('EMAIL' | 'PUSH' | 'SMS')[];
    data?: any;
    scheduledFor?: string;
  }) =>
    apiClient.post('/notifications/admin/send', data),
  
  sendBulk: (data: {
    recipientIds: string[];
    type: string;
    title: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    channels: ('EMAIL' | 'PUSH' | 'SMS')[];
    data?: any;
  }) =>
    apiClient.post('/notifications/admin/send-bulk', data),
  
  getTemplates: () =>
    apiClient.get('/notifications/admin/templates'),
  
  createTemplate: (data: {
    name: string;
    type: string;
    title: string;
    content: string;
    variables?: string[];
    channels: ('EMAIL' | 'PUSH' | 'SMS')[];
  }) =>
    apiClient.post('/notifications/admin/templates', data),
  
  updateTemplate: (templateId: string, data: {
    name?: string;
    title?: string;
    content?: string;
    variables?: string[];
    channels?: ('EMAIL' | 'PUSH' | 'SMS')[];
    isActive?: boolean;
  }) =>
    apiClient.put(`/notifications/admin/templates/${templateId}`, data),
  
  deleteTemplate: (templateId: string) =>
    apiClient.delete(`/notifications/admin/templates/${templateId}`),
  
  getAdminStats: (params?: { period?: string; type?: string }) =>
    apiClient.get('/notifications/admin/stats', { params }),
  
  scheduleCampaign: (data: {
    name: string;
    templateId: string;
    targetAudience: 'ALL' | 'USERS' | 'AGENTS' | 'CUSTOM';
    customRecipients?: string[];
    scheduledFor: string;
    channels: ('EMAIL' | 'PUSH' | 'SMS')[];
    variables?: Record<string, any>;
  }) =>
    apiClient.post('/notifications/admin/campaigns', data),
  
  getCampaigns: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/notifications/admin/campaigns', { params }),
}

// 报表API
export const reportApi = {
  // 生成报表
  generateFinancialOverview: (data: {
    period: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    includeCharts?: boolean;
    breakdown?: string[];
  }) =>
    apiClient.post('/reports/financial/overview', data),
  
  generateCommissionReport: (data: {
    period: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    agentIds?: string[];
    groupBy?: 'agent' | 'level' | 'period';
    includeSubAgents?: boolean;
  }) =>
    apiClient.post('/reports/commissions', data),
  
  generateRevenueReport: (data: {
    period: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    breakdown: 'daily' | 'weekly' | 'monthly';
    includeProjections?: boolean;
  }) =>
    apiClient.post('/reports/revenue', data),
  
  generateInvestmentAnalysis: (data: {
    period: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    riskLevels?: string[];
    includePerformance?: boolean;
  }) =>
    apiClient.post('/reports/investments/analysis', data),
  
  generateAgentPerformanceReport: (data: {
    period: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    agentIds?: string[];
    metrics?: string[];
    includeHierarchy?: boolean;
  }) =>
    apiClient.post('/reports/agents/performance', data),
  
  // 获取报表
  getTemplates: (category?: string) =>
    apiClient.get('/reports/templates', { params: { category } }),
  
  createTemplate: (data: {
    name: string;
    category: string;
    description?: string;
    dataSource: string;
    fields: string[];
    filters: any[];
    charts?: any[];
    schedule?: any;
  }) =>
    apiClient.post('/reports/templates', data),
  
  getHistory: (params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get('/reports/history', { params }),
  
  getReport: (reportId: string) =>
    apiClient.get(`/reports/${reportId}`),
  
  downloadReport: (reportId: string) =>
    apiClient.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
  
  scheduleReport: (data: {
    templateId: string;
    name: string;
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
    };
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
    parameters?: any;
  }) =>
    apiClient.post('/reports/schedule', data),
  
  getStats: (period?: string) =>
    apiClient.get('/reports/stats/overview', { params: { period } }),
  
  getDashboardKPIs: (period: string = '30d', comparison: string = 'previous_period') =>
    apiClient.get('/reports/dashboard/kpis', { params: { period, comparison } }),
  
  exportData: (data: {
    reportType: string;
    dateFrom: string;
    dateTo: string;
    format: 'csv' | 'excel' | 'json';
    filters?: any;
    fields?: string[];
  }) =>
    apiClient.post('/reports/export', data),
  
  previewReport: (data: {
    templateId?: string;
    type: string;
    parameters: any;
    sampleSize?: number;
  }) =>
    apiClient.post('/reports/preview', data),
}

// 管理员API
export const adminApi = {
  // 用户管理
  getUsers: (params?: {
    search?: string;
    role?: string;
    status?: string;
    kycStatus?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get('/users', { params }),
  
  getUserById: (id: string) =>
    apiClient.get(`/users/${id}`),
  
  updateKycStatus: (id: string, data: { status: string; reason?: string }) =>
    apiClient.put(`/users/${id}/kyc`, data),
  
  updateUserRole: (id: string, data: { role: string }) =>
    apiClient.put(`/users/${id}/role`, data),
  
  toggleUserStatus: (id: string) =>
    apiClient.post(`/users/${id}/toggle-status`),
  
  getUserStats: (params?: { period?: string }) =>
    apiClient.get('/users/admin/stats', { params }),
  
  // 系统配置
  getSystemConfig: () =>
    apiClient.get('/config'),
  
  updateSystemConfig: (data: any) =>
    apiClient.put('/config', data),
}

// 导出默认客户端
export default apiClient