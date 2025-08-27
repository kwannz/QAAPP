import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Web3Strategy } from './strategies/web3.strategy';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WalletGuard } from './guards/wallet.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
          issuer: configService.get('JWT_ISSUER', 'qa-app'),
          audience: configService.get('JWT_AUDIENCE', 'qa-app-users'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    Web3Strategy,
    AuthGuard,
    RolesGuard,
    WalletGuard,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    Web3Strategy,
    AuthGuard,
    RolesGuard,
    WalletGuard,
  ],
})
export class AuthModule {}