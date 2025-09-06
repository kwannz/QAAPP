'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import React from 'react';

import { Button } from '../ui';

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProperties {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 可选：发送错误到监控服务
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // 这里可以集成错误监控服务，如 Sentry
      // Sentry.captureException(error, { contexts: { react: { errorInfo } } })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  async render() {
    if (this.state.hasError) {
      // 使用自定义错误组件或默认错误界面
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // 默认错误界面
      return <DefaultErrorUI error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// 默认错误UI组件
function DefaultErrorUI({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          页面出现了错误
        </h1>

        <p className="text-gray-600 mb-6">
          抱歉，页面遇到了一些技术问题。我们已经记录了这个问题。
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              错误详情（开发环境）
            </summary>
            <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetError} className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            回到首页
          </Button>
        </div>
      </div>
    </div>
  );
}

// 用于函数组件的 Hook
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);

    // 可选：自动上报错误
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // 发送到错误监控服务
    }
  };
}

export default ErrorBoundary;
