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
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';

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
      useFactory: (
        configService: ConfigService,
        databaseService: DatabaseService,
        jwtService: JwtService,
        usersService: UsersService,
        walletSignatureService: WalletSignatureService,
      ) => {
        const useMock = configService.get<string>('USE_MOCK_AUTH') === 'true';
        const nodeEnv = configService.get<string>('NODE_ENV');
        
        // 只在测试环境或明确指定时使用Mock
        if (useMock || nodeEnv === 'test') {
          console.log('⚠️  Using Mock Auth Service');
          return new MockAuthService(jwtService, configService);
        }
        
        console.log('✅ Using Real Auth Service');
        return new AuthService(
          databaseService,
          jwtService,
          configService,
          usersService,
          walletSignatureService,
        );
      },
      inject: [ConfigService, DatabaseService, JwtService, UsersService, WalletSignatureService],
    },
    MockAuthService, // 仍然提供MockAuthService供测试使用
    JwtStrategy,
    WalletSignatureService,
    UsersService,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}