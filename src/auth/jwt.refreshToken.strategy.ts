import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { TokenService } from './token.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt.refreshToken') {
  constructor(private readonly tokenService: TokenService,
              private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET', '', true),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // get the token back out of the header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // and compare it against the revokation list
    const isValid = await this.tokenService.validate(token);

    if (isValid === false) {
      return false;
    }

    // even though, in theory, the token should have been revoked when the user was deleted, let's make sure the user is still valid


    return { id: payload.sub  }
  }
}
