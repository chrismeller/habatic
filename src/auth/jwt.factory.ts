import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtFactory {
  constructor(private readonly configService: ConfigService) {}

  get(intent: string) {
    if (intent === 'access_token') {
      return new JwtService({
        secret: this.configService.get('ACCESS_TOKEN_SECRET', '', true),
        signOptions: { expiresIn: this.configService.get('ACCESS_TOKEN_LIFETIME', '60m') },
      });
    }

    if (intent === 'refresh_token') {
      return new JwtService({
        secret: this.configService.get('REFRESH_TOKEN_SECRET', '', true),
        signOptions: { expiresIn: this.configService.get('REFRESH_TOKEN_LIFETIME', '2 weeks') },
      });
    }

    throw new Error('Invalid intent!');
  }
}
