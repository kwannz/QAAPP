import axios, { AxiosError, AxiosResponse } from 'axios'
import { useAuthStore } from './auth-store'
import toast from 'react-hot-toast'

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

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误和token刷新
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
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
  getMyLogs: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/audit/me', { params }),
  
  getActivityStats: (days?: number) =>
    apiClient.get('/audit/me/activity-stats', { params: { days } }),
}

// 导出默认客户端
export default apiClient