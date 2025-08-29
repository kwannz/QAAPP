import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QAWebSocketGateway } from './websocket.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [QAWebSocketGateway],
  exports: [QAWebSocketGateway],
})
export class WebSocketModule {}