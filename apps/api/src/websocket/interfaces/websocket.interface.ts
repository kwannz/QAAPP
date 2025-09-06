// WebSocket认证数据
export interface WebSocketAuthData {
  token: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

// WebSocket通知数据
export interface WebSocketNotificationData {
  id?: string;
  type: string;
  title: string;
  message: string;
  level?: 'success' | 'error' | 'warning' | 'info';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, unknown>;
  timestamp: string;
}

// WebSocket广播消息
export interface WebSocketBroadcastMessage {
  type: string;
  content: string;
  targetAudience?: 'all' | 'users' | 'admins' | 'specific';
  targetUserIds?: string[];
  priority?: 'low' | 'normal' | 'high';
  data?: Record<string, unknown>;
  expiresAt?: Date;
}