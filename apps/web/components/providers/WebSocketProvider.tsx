'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuthStore } from '../../lib/auth-context';
import type { WebSocketMessage } from '../../lib/websocket-client';
import { wsClient, WebSocketStatus, useNotifications } from '../../lib/websocket-client';
import { logger } from '@/lib/verbose-logger';

// WebSocket 上下文类型
interface WebSocketContextType {
  status: WebSocketStatus
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp'>) => void
  notifications: any[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearAll: () => void
}

// 创建上下文
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// WebSocket Provider 组件
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED);

  // 使用通知 Hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  } = useNotifications();

  // 监听连接状态变化
  useEffect(() => {
    const unsubscribe = wsClient.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  // WebSocket连接管理 - 准备就绪，等待生产环境启用
  useEffect(() => {
    // WebSocket功能已实现，可通过环境变量ENABLE_WEBSOCKET启用
    const enableWebSocket = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';

    if (!enableWebSocket) {
      logger.info('WebSocket', '功能已准备就绪，可通过 NEXT_PUBLIC_ENABLE_WEBSOCKET=true 启用');
    }

    // if (isAuthenticated && user) {
    //   // 延迟连接，确保认证状态稳定
    //   const timer = setTimeout(() => {
    //     if (wsClient.getStatus() === WebSocketStatus.DISCONNECTED) {
    //       console.log('Connecting to WebSocket...')
    //       wsClient.connect()
    //     }
    //   }, 1000)
    //
    //   return () => clearTimeout(timer)
    // } else {
    //   // 用户登出时断开连接
    //   if (wsClient.getStatus() !== WebSocketStatus.DISCONNECTED) {
    //     console.log('Disconnecting from WebSocket...')
    //     wsClient.disconnect()
    //   }
    // }
  }, [isAuthenticated, user]);

  // 发送消息的包装函数
  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (isAuthenticated) {
      wsClient.send(message);
    }
  };

  const contextValue: WebSocketContextType = {
    status,
    sendMessage,
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// 使用 WebSocket 的 Hook
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// 连接状态指示器组件
export function WebSocketStatusIndicator() {
  const { status } = useWebSocketContext();

  const getStatusColor = () => {
    switch (status) {
      case WebSocketStatus.CONNECTED: {
        return 'bg-green-500';
      }
      case WebSocketStatus.CONNECTING:
      case WebSocketStatus.RECONNECTING: {
        return 'bg-yellow-500 animate-pulse';
      }
      case WebSocketStatus.ERROR: {
        return 'bg-red-500';
      }
      default: {
        return 'bg-gray-400';
      }
    }
  };

  const getStatusText = () => {
    switch (status) {
      case WebSocketStatus.CONNECTED: {
        return '已连接';
      }
      case WebSocketStatus.CONNECTING: {
        return '连接中';
      }
      case WebSocketStatus.RECONNECTING: {
        return '重连中';
      }
      case WebSocketStatus.ERROR: {
        return '连接错误';
      }
      default: {
        return '未连接';
      }
    }
  };

  // 开发环境下显示连接状态，生产环境隐藏
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-white shadow-lg rounded-lg px-3 py-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-gray-600">WebSocket: {getStatusText()}</span>
    </div>
  );
}

// 实时通知组件
export function LiveNotificationToast() {
  const { notifications } = useWebSocketContext();

  // 这里可以集成到现有的 toast 系统
  // 当收到新通知时显示 toast
  useEffect(() => {
    // 处理实时通知显示逻辑
    // 可以与 react-hot-toast 集成
  }, [notifications]);

  return null; // 这个组件主要处理副作用
}
