import { EventEmitter } from 'node:events';

import apiClient from './api-client';
import logger from './logger';

export interface WebSocketMessage {
  type: 'audit_log' | 'system_event' | 'alert' | 'notification' | 'metrics'
  event: 'create' | 'update' | 'delete' | 'alert'
  data: any
  timestamp: string
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor(url?: string) {
    super();
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
  }

  connect(token?: string): void {
    try {
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(wsUrl);

      this.ws.addEventListener('open', () => {
        logger.logWsConnect(wsUrl);
        logger.info('WebSocket', 'Connection established', {
          url: wsUrl,
          reconnectAttempts: this.reconnectAttempts,
        });
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');

        // 发送队列中的消息
        this.flushMessageQueue();

        // 开始心跳
        this.startHeartbeat();
      });

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.addEventListener('close', () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.emit('error', error);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // 发送到特定事件
    this.emit(message.type, message);

    // 发送到通用消息事件
    this.emit('message', message);

    // 特殊处理不同类型的消息
    switch (message.type) {
      case 'audit_log': {
        this.emit('audit:new', message.data);
        break;
      }
      case 'system_event': {
        this.emit('system:event', message.data);
        break;
      }
      case 'alert': {
        this.emit('alert:triggered', message.data);
        break;
      }
      case 'notification': {
        this.emit('notification:new', message.data);
        break;
      }
      case 'metrics': {
        this.emit('metrics:update', message.data);
        break;
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect:failed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    // 检查后端服务是否运行
    if (typeof window !== 'undefined') {
      // 计算根服务健康检查URL（去掉 /api 前缀）
      const baseURL = (apiClient.defaults.baseURL || '');
      const rootURL = baseURL.replace(/\/?api\/?$/, '') || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
      fetch(`${rootURL}/health`)
        .then(() => {
          setTimeout(() => {
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        })
        .catch(() => {
          console.warn('Backend service not available, skipping WebSocket reconnection');
        });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30_000); // 每30秒发送一次心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  send(data: any): void {
    const message: WebSocketMessage = {
      type: data.type || 'notification',
      event: data.event || 'create',
      data: data.data || data,
      timestamp: new Date().toISOString(),
    };

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessage(message);
    } else {
      // 如果未连接，将消息加入队列
      this.messageQueue.push(message);
      console.log('WebSocket not connected, message queued');
    }
  }

  private sendMessage(message: WebSocketMessage): void {
    try {
      this.ws?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.messageQueue.push(message);
    }
  }

  subscribe(channel: string, callback: (data: any) => void): void {
    this.on(channel, callback);

    // 发送订阅请求
    this.send({
      type: 'subscribe',
      channel,
    });
  }

  unsubscribe(channel: string, callback?: (data: any) => void): void {
    if (callback) {
      this.off(channel, callback);
    } else {
      this.removeAllListeners(channel);
    }

    // 发送取消订阅请求
    this.send({
      type: 'unsubscribe',
      channel,
    });
  }

  disconnect(): void {
    this.isConnected = false;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.removeAllListeners();
    this.messageQueue = [];
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getQueuedMessages(): WebSocketMessage[] {
    return [...this.messageQueue];
  }
}

// 创建单例实例
let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManagerInstance) {
    wsManagerInstance = new WebSocketManager();
  }
  return wsManagerInstance;
}

export default WebSocketManager;
