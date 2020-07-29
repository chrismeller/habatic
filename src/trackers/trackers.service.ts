import { Injectable, Inject } from '@nestjs/common';
import { Tracker } from './interfaces/tracker.interface';
import { IDatabase } from 'pg-promise';
import { DatabaseProvider } from '../database/database.providers';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TrackersService {
  private readonly db: IDatabase<any>;

  constructor(databaseProvider: DatabaseProvider) {
    this.db = databaseProvider.get();
  }

  async create(tracker: Tracker) {
    return await this.db.none('insert into trackers ( id, type, name, user_id, created_at ) values ( ${id}, ${type}, ${name}, ${userId}, ${createdAt} )', tracker);
  }

  async getForUser(userId: string) {
    return await this.db.any('select * from trackers where user_id = ${userId}', { userId });
  }

  async getById(id: string) {
    return await this.db.oneOrNone<Tracker>('select * from trackers where id = ${id}', { id });
  }

  async delete(id: string) {
    // @todo log this
    return await this.db.none('delete from trackers where id = ${id}', { id });
  }

  async update(tracker: Tracker) {
    // @todo log this
    return await this.db.none('update trackers set name = ${name}, updated_at = ${updatedAt} where id = ${id}',
      { name: tracker.name, updatedAt: new Date().toISOString(), id: tracker.id });
  }
}
