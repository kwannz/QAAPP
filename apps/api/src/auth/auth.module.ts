import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
    // AuthService, // Replaced with MockAuthService for testing
    {
      provide: AuthService,
      useClass: MockAuthService,
    },
    MockAuthService, // Provide MockAuthService for JwtStrategy
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