import { Injectable } from '@nestjs/common';
import { SendgridProvider } from './sendgrid.provider';

@Injectable()
export class MailService {
  constructor(private readonly mailProvider: SendgridProvider) {}

  async send(to: string, from: string, subject: string, text: string, html: string) {
    return await this.mailProvider.send(to, from, subject, text, html);
  }
}
