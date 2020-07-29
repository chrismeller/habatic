import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { SendgridProvider } from './sendgrid.provider';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService, SendgridProvider],
  exports: [MailService],
})
export class MailModule {}
