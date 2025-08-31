import { Module, DynamicModule, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QAWebSocketGateway } from './websocket.gateway';

@Module({})
export class WebSocketModule {
  private static readonly logger = new Logger(WebSocketModule.name);

  static forRoot(): DynamicModule {
    const isWebSocketEnabled = process.env.WEBSOCKET_ENABLED === 'true';
    
    if (!isWebSocketEnabled) {
      this.logger.log('WebSocket is disabled by configuration');
      return {
        module: WebSocketModule,
        providers: [],
        exports: [],
      };
    }

    this.logger.log('WebSocket is enabled');
    return {
      module: WebSocketModule,
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
        }),
      ],
      providers: [QAWebSocketGateway],
      exports: [QAWebSocketGateway],
    };
  }
}