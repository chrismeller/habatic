import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly tokenService: TokenService,
              private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET', '', true),
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


    return { id: payload.sub  };
  }
}
