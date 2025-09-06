'use client';

import { motion } from 'framer-motion';
import React, { Suspense } from 'react';

// 通用加载器组件
export function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// 页面级加载器
export function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center space-y-4"
      >
        <LoadingSpinner size="large" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">加载中...</h3>
          <p className="text-gray-600">正在为您准备页面内容</p>
        </div>
      </motion.div>
    </div>
  );
}

// 卡片级加载器
export function CardLoader() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

// 表格加载器
export function TableLoader() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="animate-pulse">
        {/* 表头 */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        </div>
        {/* 表格行 */}
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="px-6 py-4 border-b">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="h-3 bg-gray-200 rounded flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 懒加载组件包装器
interface LazyWrapperProperties {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export function LazyWrapper({
  children,
  fallback = <PageLoader />,
  errorFallback,
}: LazyWrapperProperties) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

// 错误边界组件
interface ErrorBoundaryProperties {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper Error:', error, errorInfo);
  }

  async render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24"
stroke="currentColor"
              >
                <path
strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">页面加载失败</h3>
            <p className="text-gray-600 mb-4">抱歉，页面在加载过程中发生错误</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              刷新页面
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 预加载工具函数
export const preloadComponent = async (importFunction: () => Promise<any>) => {
  const componentImport = importFunction();
  return componentImport;
};

// 组件预加载 Hook
export function usePreloadComponent(importFunction: () => Promise<any>, delay = 0) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      importFunction().catch(console.error);
    }, delay);

    return () => clearTimeout(timer);
  }, [importFunction, delay]);
}
