import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebSocketAuthData, WebSocketNotificationData, WebSocketBroadcastMessage } from './interfaces/websocket.interface';
export declare class QAWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private logger;
    private connectedClients;
    constructor(jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket): void;
    handleAuth(data: WebSocketAuthData, client: Socket): {
        event: string;
        data: {
            authenticated: boolean;
            userId: any;
            timestamp: string;
        };
    };
    handleMarkNotificationRead(data: {
        notificationId: string;
    }, client: Socket): void;
    handleClearNotifications(client: Socket): void;
    sendNotificationToUser(userId: string, notification: WebSocketNotificationData): Promise<void>;
    sendToastToUser(userId: string, toast: {
        message: string;
        level?: 'success' | 'error' | 'warning' | 'info';
    }): Promise<void>;
    broadcastMessage(message: WebSocketBroadcastMessage): Promise<void>;
    getConnectedClientsCount(): number;
    isUserOnline(userId: string): boolean;
}
