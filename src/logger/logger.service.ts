import { Injectable, Logger, Scope } from '@nestjs/common';
import { TransportStreamOptions } from 'winston-transport';
import * as winston from 'winston';
import { ConfigService } from '../config/config.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  private readonly winston: winston.Container;

  constructor(private readonly configService: ConfigService) {
    super();

    this.winston = new winston.Container();

    if (configService.getBoolean('logging.console.enabled') === true) {
      this.winston.add('console', {
        transports: new winston.transports.Console({
          silent: false,
          level: configService.get('logging.console.level'),
        }),
      });
    }
  }
}
