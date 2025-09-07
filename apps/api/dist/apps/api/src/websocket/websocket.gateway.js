"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const error_utils_1 = require("../common/utils/error.utils");
let QAWebSocketGateway = class QAWebSocketGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger('WebSocketGateway');
        this.connectedClients = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.query.token ||
                client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;
            client.data.userId = userId;
            client.data.email = payload.email;
            this.connectedClients.set(client.id, client);
            this.logger.log(`User ${payload.email} (${userId}) connected with socket ${client.id}`);
            client.emit('connection_success', {
                message: '连接成功',
                userId,
                timestamp: new Date().toISOString(),
            });
            await client.join(`user_${userId}`);
        }
        catch (error) {
            this.logger.error(`Authentication failed for client ${client.id}:`, (0, error_utils_1.getErrorMessage)(error));
            client.emit('auth_error', { message: '认证失败' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data?.userId;
        const email = client.data?.email;
        this.connectedClients.delete(client.id);
        if (userId && email) {
            this.logger.log(`User ${email} (${userId}) disconnected from socket ${client.id}`);
        }
        else {
            this.logger.log(`Anonymous client ${client.id} disconnected`);
        }
    }
    handlePing(client) {
        client.emit('pong', {
            timestamp: Date.now(),
        });
    }
    handleAuth(data, client) {
        return {
            event: 'auth_response',
            data: {
                authenticated: !!client.data?.userId,
                userId: client.data?.userId,
                timestamp: new Date().toISOString(),
            },
        };
    }
    handleMarkNotificationRead(data, client) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        client.emit('notification_read', {
            notificationId: data.notificationId,
            timestamp: new Date().toISOString(),
        });
        this.logger.debug(`User ${userId} marked notification ${data.notificationId} as read`);
    }
    handleClearNotifications(client) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        client.emit('notification_cleared', {
            timestamp: new Date().toISOString(),
        });
        this.logger.debug(`User ${userId} cleared all notifications`);
    }
    async sendNotificationToUser(userId, notification) {
        const room = `user_${userId}`;
        this.server.to(room).emit('notification', {
            type: 'notification',
            payload: {
                ...notification,
                id: notification.id || Date.now().toString(),
                level: notification.level || 'info',
                timestamp: new Date().toISOString(),
                isRead: false,
            },
        });
        this.logger.debug(`Sent notification to user ${userId}:`, notification.title);
    }
    async sendToastToUser(userId, toast) {
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
    async broadcastMessage(message) {
        this.server.emit('broadcast', {
            type: 'broadcast',
            payload: message,
            timestamp: new Date().toISOString(),
        });
        this.logger.debug('Broadcasted message to all clients');
    }
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
    isUserOnline(userId) {
        const clients = Array.from(this.connectedClients.values());
        return clients.some(client => client.data?.userId === userId);
    }
};
exports.QAWebSocketGateway = QAWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], QAWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], QAWebSocketGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('auth'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], QAWebSocketGateway.prototype, "handleAuth", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_notification_read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], QAWebSocketGateway.prototype, "handleMarkNotificationRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('clear_notifications'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], QAWebSocketGateway.prototype, "handleClearNotifications", null);
exports.QAWebSocketGateway = QAWebSocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], QAWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map