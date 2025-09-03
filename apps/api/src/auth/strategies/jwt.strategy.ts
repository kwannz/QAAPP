import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role: string;
  walletAddress?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
      issuer: 'qa-app-api',
      audience: 'qa-app-client',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    // 验证用户是否存在且活跃
    const user = await this.authService.getUserById(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 返回用户信息，会被注入到 request.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      wallets: user.wallets,
    };
  }
}