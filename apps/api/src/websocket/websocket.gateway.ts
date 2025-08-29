import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class QAWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebSocketGateway');
  private connectedClients = new Map<string, Socket>();

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // 从查询参数或头部获取 JWT token
      const token = client.handshake.query.token as string || 
                   client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // 验证 JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // 将用户ID存储到socket实例中
      client.data.userId = userId;
      client.data.email = payload.email;

      // 将连接添加到活跃连接映射
      this.connectedClients.set(client.id, client);

      this.logger.log(`User ${payload.email} (${userId}) connected with socket ${client.id}`);
      
      // 发送连接确认消息
      client.emit('connection_success', {
        message: '连接成功',
        userId,
        timestamp: new Date().toISOString(),
      });

      // 加入用户特定的房间
      await client.join(`user_${userId}`);

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.emit('auth_error', { message: '认证失败' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    const email = client.data?.email;
    
    this.connectedClients.delete(client.id);
    
    if (userId && email) {
      this.logger.log(`User ${email} (${userId}) disconnected from socket ${client.id}`);
    } else {
      this.logger.log(`Anonymous client ${client.id} disconnected`);
    }
  }

  // 处理心跳消息
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      timestamp: Date.now(),
    });
  }

  // 处理客户端认证消息
  @SubscribeMessage('auth')
  handleAuth(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // 认证逻辑已在 handleConnection 中处理
    return {
      event: 'auth_response',
      data: {
        authenticated: !!client.data?.userId,
        userId: client.data?.userId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // 处理通知已读标记
  @SubscribeMessage('mark_notification_read')
  handleMarkNotificationRead(@MessageBody() data: { notificationId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data?.userId;
    if (!userId) return;

    // 这里可以调用通知服务来标记通知为已读
    // 然后向客户端发送确认
    client.emit('notification_read', {
      notificationId: data.notificationId,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`User ${userId} marked notification ${data.notificationId} as read`);
  }

  // 处理清除所有通知
  @SubscribeMessage('clear_notifications')
  handleClearNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.data?.userId;
    if (!userId) return;

    // 这里可以调用通知服务来清除所有通知
    client.emit('notification_cleared', {
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`User ${userId} cleared all notifications`);
  }

  // 公共方法：向特定用户发送通知
  async sendNotificationToUser(userId: string, notification: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit('notification', {
      type: 'notification',
      payload: {
        id: notification.id || Date.now().toString(),
        title: notification.title,
        message: notification.message,
        level: notification.level || 'info', // success, error, warning, info
        timestamp: new Date().toISOString(),
        isRead: false,
        ...notification,
      },
    });

    this.logger.debug(`Sent notification to user ${userId}:`, notification.title);
  }

  // 公共方法：向特定用户发送Toast通知
  async sendToastToUser(userId: string, toast: { message: string; level?: 'success' | 'error' | 'warning' | 'info' }) {
    const room = `user_${userId}`;
    this.server.to(room).emit('notification', {
      type: 'notification',
      payload: {
        type: 'toast',
        message: toast.message,
        level: toast.level || 'info',
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.debug(`Sent toast to user ${userId}: ${toast.message}`);
  }

  // 公共方法：广播消息给所有连接的客户端
  async broadcastMessage(message: any) {
    this.server.emit('broadcast', {
      type: 'broadcast',
      payload: message,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug('Broadcasted message to all clients');
  }

  // 公共方法：获取在线用户数量
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // 公共方法：获取特定用户是否在线
  isUserOnline(userId: string): boolean {
    const clients = Array.from(this.connectedClients.values());
    return clients.some(client => client.data?.userId === userId);
  }
}