import * as pgPromise from 'pg-promise';
import { IDatabase } from 'pg-promise';
import { ConfigService } from '../config/config.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';

@Injectable()
export class DatabaseProvider implements OnModuleInit {
  private readonly logger = new Logger(DatabaseProvider.name);
  private static db: IDatabase<any> | undefined;

  constructor(private readonly configService: ConfigService) {}

  get() {
    if (DatabaseProvider.db === undefined) {
      const pgOptions = {
        receive: (data, result, e) => {
          camelizeColumns(data);
        },
      };

      const camelizeColumns = (data) => {
        const template = data[0];
        for (const prop in template) {
          const camel = pgPromise.utils.camelize(prop);
          if (!(camel in template)) {
            for (const d of data) {
              d[camel] = d[prop];
              delete d[prop];
            }
          }
        }
      };

      const pgp = pgPromise(pgOptions);

      DatabaseProvider.db = pgp(this.configService.get('CONNECTION_STRING'));
    }

    return DatabaseProvider.db;
  }

  async onModuleInit() {
    await this.up();
  }

  async up() {
    this.logger.debug('Running migrations...');

    const db = this.get();

    const migrationsPath = path.join(__dirname, this.configService.get('MIGRATIONS_PATH', '../migrations'));

    // load in the list of migrations we have available
    const migrationsPathFiles = await fs.promises.readdir(migrationsPath);

    const availableMigrations = migrationsPathFiles.filter((v, i) => {
      return path.extname(v) === '.sql';
    });

    // make sure the migration metadata table exists and find the most recent migration if it does
    let appliedMigrations = [];
    try {
      appliedMigrations = await db.any<string>('select migrationVersion from migrations');
    } catch (e) {
      // if the table didn't exist, create it
      if (e.code === '42P01') {
        this.logger.debug('No migrations table found, creating it...');

        await db.none('create table migrations ( migrationVersion varchar(25), migratedAt varchar(25) );');
      }
      else {
        throw e;
      }
    }

    const requiredMigrations = availableMigrations.filter((v, i) => {
      return _.findKey(appliedMigrations, { migrationversion: v }) === undefined;
    });

    this.logger.debug(`Found ${requiredMigrations.length} required migrations.`);

    for (const requiredMigration of requiredMigrations) {
      const contents = await fs.promises.readFile(path.join(migrationsPath, requiredMigration), 'utf-8');

      // run the migration
      await db.none(contents);

      // mark it as run
      await db.none('insert into migrations ( migrationVersion, migratedAt ) values ( ${migrationVersion}, ${migratedAt} )',
        { migrationVersion: requiredMigration, migratedAt: new Date().toISOString() });

      this.logger.debug(`Successfully applied migration ${requiredMigration}`);
    }
  }
}
