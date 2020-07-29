import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import * as path from 'path';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(`${process.env.NODE_ENV || 'development'}.env`),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
