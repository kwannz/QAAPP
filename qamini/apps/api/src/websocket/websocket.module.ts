import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QAWebSocketGateway } from './websocket.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required for WebSocket authentication');
        }
        return {
          secret,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
        };
      },
    }),
  ],
  providers: [QAWebSocketGateway],
  exports: [QAWebSocketGateway],
})
export class WebSocketModule {}