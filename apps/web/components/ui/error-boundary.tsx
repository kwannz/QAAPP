'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // 调用外部错误处理器
    this.props.onError?.(error, errorInfo)

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">页面加载出错</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                  <summary className="cursor-pointer font-medium">技术详情</summary>
                  <pre className="mt-2 text-sm overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新页面
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// 网络错误专用的错误边界
interface NetworkErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
}

export const NetworkErrorBoundary: React.FC<NetworkErrorBoundaryProps> = ({ 
  children, 
  onRetry 
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">网络连接问题</h3>
          <p className="text-muted-foreground mb-4">
            无法连接到服务器，请检查网络连接或稍后重试
          </p>
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                重试
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </div>
        </div>
      }
      onError={(error) => {
        // 记录网络错误
        console.error('Network error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// 超时错误组件
export const TimeoutError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="p-6 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">加载超时</h3>
    <p className="text-muted-foreground mb-4">
      页面加载时间过长，请检查网络连接或稍后重试
    </p>
    <div className="flex gap-3 justify-center">
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          重试
        </Button>
      )}
      <Button
        variant="outline"
        onClick={() => window.location.href = '/'}
        className="flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        返回首页
      </Button>
    </div>
  </div>
)