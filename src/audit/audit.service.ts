import { Injectable } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { DatabaseProvider } from '../database/database.providers';
import * as uuid from 'uuid';

@Injectable()
export class AuditService {
  private readonly db: IDatabase<any>;

  constructor(databaseProvider: DatabaseProvider) {
    this.db = databaseProvider.get();
  }

  async log(userId: string, message: string, occurredAt: string) {
    const id = uuid.v4();
    // tslint:disable-next-line:max-line-length
    await this.db.none('insert into audit ( id, user_id, message, occurred_at ) values ( ${id}, ${userId}, ${message}, ${occurredAt} )', { id, userId, message, occurredAt });
  }
}
