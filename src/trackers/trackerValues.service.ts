import { Injectable } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { DatabaseProvider } from '../database/database.providers';
import { TrackerValue } from './interfaces/trackerValue.interface';

@Injectable()
export class TrackerValuesService {
  private readonly db: IDatabase<any>;

  constructor(databaseProvider: DatabaseProvider) {
    this.db = databaseProvider.get();
  }

  async create(value: TrackerValue) {
    // tslint:disable-next-line:max-line-length
    return await this.db.none('insert into tracker_values ( id, tracker_id, tracker_user_id, value_date, value, created_at, updated_at ) values ( ${id}, ${trackerId}, ${trackerUserId}, ${valueDate}, ${value}, ${createdAt}, ${updatedAt} )', value);
  }

  async getById(id: string) {
    return await this.db.oneOrNone<TrackerValue>('select * from tracker_values where id = ${id}', { id });
  }

  async delete(id: string) {
    // @todo log this
    return await this.db.none('delete from tracker_values where id = ${id}', { id });
  }

  async update(value: TrackerValue) {
    // @todo log this
    return await this.db.none('update tracker_values set value = ${value}, updated_at = ${updatedAt} where id = ${id}',
      { name: value.value, updatedAt: new Date().toISOString(), id: value.id });
  }
}
