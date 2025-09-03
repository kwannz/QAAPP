'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react'

interface ApiEndpoint {
  name: string
  url: string
  status: 'checking' | 'online' | 'offline' | 'error'
  responseTime?: number
}

export function ApiStatus() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: '后端健康', url: '/health', status: 'checking' },
    { name: '产品API', url: '/api/products', status: 'checking' },
    { name: '认证API', url: '/api/auth/health', status: 'checking' },
  ])

  const checkEndpoint = async (endpoint: ApiEndpoint): Promise<ApiEndpoint> => {
    const startTime = Date.now()
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}${endpoint.url}`, {
        method: 'GET',
        timeout: 5000
      } as any)
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return { ...endpoint, status: 'online', responseTime }
      } else {
        return { ...endpoint, status: 'error', responseTime }
      }
    } catch (error) {
      return { ...endpoint, status: 'offline', responseTime: Date.now() - startTime }
    }
  }

  useEffect(() => {
    const checkAllEndpoints = async () => {
      const results = await Promise.all(endpoints.map(checkEndpoint))
      setEndpoints(results)
    }

    checkAllEndpoints()
    const interval = setInterval(checkAllEndpoints, 30000) // 每30秒检查一次

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: ApiEndpoint['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'offline':
        return <XCircle className="w-3 h-3 text-red-500" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
      case 'checking':
        return <Activity className="w-3 h-3 text-orange-500 animate-pulse" />
      default:
        return <Activity className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusText = (endpoint: ApiEndpoint) => {
    switch (endpoint.status) {
      case 'online':
        return `正常 (${endpoint.responseTime}ms)`
      case 'offline':
        return '离线'
      case 'error':
        return '错误'
      case 'checking':
        return '检查中...'
      default:
        return '未知'
    }
  }

  const overallStatus = endpoints.every(e => e.status === 'online') ? 'online' : 
                      endpoints.some(e => e.status === 'online') ? 'partial' : 'offline'

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        {overallStatus === 'online' ? (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        ) : overallStatus === 'partial' ? (
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        ) : (
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        )}
        <span className="text-gray-600">系统状态: </span>
        <span className={
          overallStatus === 'online' ? 'text-green-600' : 
          overallStatus === 'partial' ? 'text-yellow-600' : 'text-red-600'
        }>
          {overallStatus === 'online' ? '正常' : overallStatus === 'partial' ? '部分可用' : '异常'}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="flex items-center gap-1">
            {getStatusIcon(endpoint.status)}
            <span className="text-gray-500">
              {endpoint.name}: {getStatusText(endpoint)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="text-gray-400 border-l pl-2">
        API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} | Web: {window?.location?.origin || 'http://localhost:3000'}
      </div>
    </div>
  )
}