import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from './auth-store'
import toast from 'react-hot-toast'

// WebSocket 连接状态
export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
  id?: string
}

// WebSocket 客户端类
class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private statusCallbacks: Array<(status: WebSocketStatus) => void> = []
  private messageCallbacks: Array<(message: WebSocketMessage) => void> = []
  private url: string

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
  }

  // 连接 WebSocket
  connect(): void {
    const { accessToken } = useAuthStore.getState()
    
    if (!accessToken) {
      console.warn('No access token available for WebSocket connection')
      return
    }

    this.setStatus(WebSocketStatus.CONNECTING)
    
    try {
      this.ws = new WebSocket(`${this.url}?token=${accessToken}`)
      
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.setStatus(WebSocketStatus.ERROR)
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
    
    this.setStatus(WebSocketStatus.DISCONNECTED)
    this.reconnectAttempts = 0
  }

  // 发送消息
  send(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: Date.now(),
      }
      this.ws.send(JSON.stringify(fullMessage))
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message)
    }
  }

  // 订阅状态变化
  onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusCallbacks.push(callback)
    
    // 返回取消订阅函数
    return () => {
      const index = this.statusCallbacks.indexOf(callback)
      if (index > -1) {
        this.statusCallbacks.splice(index, 1)
      }
    }
  }

  // 订阅消息
  onMessage(callback: (message: WebSocketMessage) => void): () => void {
    this.messageCallbacks.push(callback)
    
    // 返回取消订阅函数
    return () => {
      const index = this.messageCallbacks.indexOf(callback)
      if (index > -1) {
        this.messageCallbacks.splice(index, 1)
      }
    }
  }

  // 获取连接状态
  getStatus(): WebSocketStatus {
    if (!this.ws) return WebSocketStatus.DISCONNECTED
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return WebSocketStatus.CONNECTING
      case WebSocket.OPEN:
        return WebSocketStatus.CONNECTED
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return WebSocketStatus.DISCONNECTED
      default:
        return WebSocketStatus.ERROR
    }
  }

  // 处理连接打开
  private handleOpen(): void {
    console.log('WebSocket connection established')
    this.setStatus(WebSocketStatus.CONNECTED)
    this.reconnectAttempts = 0
    
    // 启动心跳
    this.startHeartbeat()
    
    // 发送认证消息（如果需要）
    this.send({
      type: 'auth',
      payload: { token: useAuthStore.getState().accessToken },
    })
  }

  // 处理消息
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      // 处理心跳响应
      if (message.type === 'pong') {
        return
      }
      
      // 处理通知消息
      if (message.type === 'notification') {
        this.handleNotification(message.payload)
      }
      
      // 分发消息给所有订阅者
      this.messageCallbacks.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in message callback:', error)
        }
      })
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  // 处理连接关闭
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason)
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    // 正常关闭不需要重连
    if (event.code === 1000) {
      this.setStatus(WebSocketStatus.DISCONNECTED)
      return
    }
    
    // 异常关闭尝试重连
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.setStatus(WebSocketStatus.RECONNECTING)
      setTimeout(() => {
        this.reconnectAttempts++
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, this.reconnectInterval)
    } else {
      console.error('Max reconnection attempts reached')
      this.setStatus(WebSocketStatus.ERROR)
    }
  }

  // 处理连接错误
  private handleError(event: Event): void {
    console.error('WebSocket error:', event)
    this.setStatus(WebSocketStatus.ERROR)
  }

  // 启动心跳
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          payload: { timestamp: Date.now() },
        })
      }
    }, 30000) // 每30秒发送一次心跳
  }

  // 设置状态并通知订阅者
  private setStatus(status: WebSocketStatus): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status)
      } catch (error) {
        console.error('Error in status callback:', error)
      }
    })
  }

  // 处理通知消息
  private handleNotification(payload: any): void {
    if (payload.type === 'toast') {
      // 显示 toast 通知
      switch (payload.level) {
        case 'success':
          toast.success(payload.message)
          break
        case 'error':
          toast.error(payload.message)
          break
        case 'warning':
          toast(payload.message, { icon: '⚠️' })
          break
        default:
          toast(payload.message)
      }
    }
  }
}

// 全局 WebSocket 客户端实例
export const wsClient = new WebSocketClient()

// React Hook 用于在组件中使用 WebSocket
export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>(wsClient.getStatus())
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  useEffect(() => {
    // 订阅状态变化
    const unsubscribeStatus = wsClient.onStatusChange(setStatus)
    
    // 订阅消息
    const unsubscribeMessage = wsClient.onMessage(setLastMessage)
    
    // 如果没有连接，尝试连接
    if (wsClient.getStatus() === WebSocketStatus.DISCONNECTED) {
      wsClient.connect()
    }
    
    // 清理函数
    return () => {
      unsubscribeStatus()
      unsubscribeMessage()
    }
  }, [])

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    wsClient.send(message)
  }, [])

  return {
    status,
    lastMessage,
    sendMessage,
    connect: wsClient.connect.bind(wsClient),
    disconnect: wsClient.disconnect.bind(wsClient),
  }
}

// 专用的通知 Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = wsClient.onMessage((message) => {
      if (message.type === 'notification') {
        setNotifications(prev => [message.payload, ...prev].slice(0, 50)) // 最多保留50条
        if (!message.payload.isRead) {
          setUnreadCount(prev => prev + 1)
        }
      } else if (message.type === 'notification_read') {
        setNotifications(prev => 
          prev.map(n => 
            n.id === message.payload.notificationId 
              ? { ...n, isRead: true }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else if (message.type === 'notification_cleared') {
        setNotifications([])
        setUnreadCount(0)
      }
    })

    return unsubscribe
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    wsClient.send({
      type: 'mark_notification_read',
      payload: { notificationId },
    })
  }, [])

  const clearAll = useCallback(() => {
    wsClient.send({
      type: 'clear_notifications',
      payload: {},
    })
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  }
}