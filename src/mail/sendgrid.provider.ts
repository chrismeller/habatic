import { Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail/src/mail';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SendgridProvider {
  private sendgrid: typeof SendGrid.MailService;
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get('SENDGRID_API_KEY', '', true));

    this.sendgrid = SendGrid;
  }

  async send(to: string, from: string, subject: string, text: string, html: string) {
    const message = {
      to,
      from,
      subject,
      text,
      html,
    };

    return await this.sendgrid.send(message);
  }
}
