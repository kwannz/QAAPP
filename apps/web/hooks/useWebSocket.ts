import { useEffect, useState, useCallback, useRef } from 'react'
import { getWebSocketManager, WebSocketMessage } from '../lib/websocket-manager'
import { useAuthStore } from '../lib/auth-context'

interface UseWebSocketOptions {
  autoConnect?: boolean
  channels?: string[]
  onMessage?: (message: WebSocketMessage) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: any) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    channels = [],
    onMessage,
    onConnected,
    onDisconnected,
    onError,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsManager = useRef(getWebSocketManager())
  const { accessToken } = useAuthStore()

  // 连接WebSocket
  const connect = useCallback(() => {
    if (!wsManager.current.getConnectionStatus()) {
      wsManager.current.connect(accessToken || undefined)
    }
  }, [accessToken])

  // 断开WebSocket
  const disconnect = useCallback(() => {
    wsManager.current.disconnect()
  }, [])

  // 发送消息
  const sendMessage = useCallback((data: any) => {
    wsManager.current.send(data)
  }, [])

  // 订阅频道
  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    wsManager.current.subscribe(channel, callback)
  }, [])

  // 取消订阅
  const unsubscribe = useCallback((channel: string, callback?: (data: any) => void) => {
    wsManager.current.unsubscribe(channel, callback)
  }, [])

  useEffect(() => {
    const ws = wsManager.current

    // 连接状态监听
    const handleConnected = () => {
      setIsConnected(true)
      onConnected?.()
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      onDisconnected?.()
    }

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message)
      onMessage?.(message)
    }

    const handleError = (error: any) => {
      onError?.(error)
    }

    // 注册事件监听
    ws.on('connected', handleConnected)
    ws.on('disconnected', handleDisconnected)
    ws.on('message', handleMessage)
    ws.on('error', handleError)

    // 自动连接
    if (autoConnect && accessToken) {
      connect()
    }

    // 订阅频道
    channels.forEach(channel => {
      ws.subscribe(channel, (data) => {
        console.log(`Received data on channel ${channel}:`, data)
      })
    })

    // 清理函数
    return () => {
      ws.off('connected', handleConnected)
      ws.off('disconnected', handleDisconnected)
      ws.off('message', handleMessage)
      ws.off('error', handleError)
      
      channels.forEach(channel => {
        ws.unsubscribe(channel)
      })
    }
  }, [autoConnect, accessToken, channels, connect, onConnected, onDisconnected, onMessage, onError])

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
  }
}

// 专门用于审计日志的WebSocket Hook
export function useAuditWebSocket(onNewLog?: (log: any) => void) {
  const [logs, setLogs] = useState<any[]>([])
  
  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    channels: ['audit_logs'],
    onMessage: (message) => {
      if (message.type === 'audit_log' && message.event === 'create') {
        const newLog = message.data
        setLogs(prev => [newLog, ...prev])
        onNewLog?.(newLog)
      }
    },
  })

  useEffect(() => {
    // 订阅审计日志频道
    const handleAuditLog = (data: any) => {
      setLogs(prev => [data, ...prev])
      onNewLog?.(data)
    }

    subscribe('audit:new', handleAuditLog)

    return () => {
      unsubscribe('audit:new', handleAuditLog)
    }
  }, [subscribe, unsubscribe, onNewLog])

  return {
    isConnected,
    realtimeLogs: logs,
    clearLogs: () => setLogs([]),
  }
}

// 专门用于系统监控的WebSocket Hook
export function useSystemMonitorWebSocket() {
  const [metrics, setMetrics] = useState<any>({})
  const [events, setEvents] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  const { isConnected } = useWebSocket({
    channels: ['system_monitor'],
    onMessage: (message) => {
      switch (message.type) {
        case 'metrics':
          setMetrics(message.data)
          break
        case 'system_event':
          setEvents(prev => [message.data, ...prev].slice(0, 100))
          break
        case 'alert':
          setAlerts(prev => [message.data, ...prev].slice(0, 50))
          break
      }
    },
  })

  return {
    isConnected,
    metrics,
    events,
    alerts,
  }
}

// 专门用于告警的WebSocket Hook
export function useAlertWebSocket(onAlert?: (alert: any) => void) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { isConnected } = useWebSocket({
    channels: ['alerts'],
    onMessage: (message) => {
      if (message.type === 'alert') {
        const alert = message.data
        setAlerts(prev => [alert, ...prev])
        setUnreadCount(prev => prev + 1)
        onAlert?.(alert)
        
        // 显示浏览器通知
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('系统告警', {
            body: alert.message,
            icon: '/favicon.ico',
          })
        }
      }
    },
  })

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })))
    setUnreadCount(0)
  }, [])

  return {
    isConnected,
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}