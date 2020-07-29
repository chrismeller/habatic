import { Injectable, Inject } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { DatabaseProvider } from '../database/database.providers';
import { User } from './interfaces/user.interface';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  private readonly db: IDatabase<any>;

  constructor(private readonly logger: LoggerService, databaseProvider: DatabaseProvider, @Inject('DB_CONNECTION') connection: any) {
    this.db = databaseProvider.get();
    console.log(connection);
  }

  async getByEmail(email: string): Promise<User> | null {
    return await this.db.oneOrNone<User>('select * from users where email = ${email}', { email });
  }

  async getById(id: string): Promise<User> | null {
    return await this.db.oneOrNone<User>('select * from users where id = ${id}', { id });
  }

  async create(user: User) {
    // note the different parameterized query syntax, since we're using a template string for multi-line
    return await this.db.none(
      `
insert into users (
  id,
  email,
  password_hash,
  created_at,
  verification_token,
  verification_token_created_at,
  email_verified,
  email_verified_at
) values (
  $[id],
  $[email],
  $[passwordHash],
  $[createdAt],
  $[verificationToken],
  $[verificationTokenCreatedAt],
  $[emailVerified],
  $[emailVerifiedAt]
)`, user);
  }

  async markUserVerified(userId: string, verifiedAt: string) {
    this.logger.debug(`Marking user ${userId} as verified.`);

    // we mark the user's email as verified, but we also null out the verification token so it can't interfere with any password resets, etc.
    return await this.db.none(
      'update users set email_verified = true, email_verified_at = ${verifiedAt}, verification_token = null where id = ${id}',
      { verifiedAt, id: userId });
  }

  async updateVerificationToken(userId: string, verificationToken: string, createdAt: string) {
    this.logger.debug(`Updating verification token for user ${userId}`);

    return await this.db.none(
      'update users set verification_token = ${verificationToken}, verification_token_created_at = ${verificationTokenCreatedAt} where id = ${id}',
      { verificationToken, verificationTokenCreatedAt: createdAt, userId });
  }
}
