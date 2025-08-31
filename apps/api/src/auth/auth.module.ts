import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MockAuthService } from '../mock/mock-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { WalletSignatureService } from './services/wallet-signature.service';
// import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
          issuer: 'qa-app-api',
          audience: 'qa-app-client',
        },
      }),
    }),
    // UsersModule, // Temporarily disabled due to database connection issues
  ],
  controllers: [AuthController],
  providers: [
    // 根据环境变量决定使用哪个服务
    {
      provide: AuthService,
      useFactory: (configService: ConfigService, ...deps: any[]) => {
        const useMock = configService.get<string>('USE_MOCK_AUTH') === 'true';
        const nodeEnv = configService.get<string>('NODE_ENV');
        
        // 只在测试环境或明确指定时使用Mock
        if (useMock || nodeEnv === 'test') {
          console.log('⚠️  Using Mock Auth Service');
          return new MockAuthService(...deps);
        }
        
        console.log('✅ Using Real Auth Service');
        return new AuthService(...deps);
      },
      inject: [ConfigService, 'DatabaseService', JwtService],
    },
    MockAuthService, // 仍然提供MockAuthService供测试使用
    JwtStrategy,
    WalletSignatureService,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}