import { Injectable } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { DatabaseProvider } from '../database/database.providers';
import { Token } from './interfaces/token.interface';

@Injectable()
export class TokenService {
  private readonly db: IDatabase<any>;

  constructor(databaseProvider: DatabaseProvider) {
    this.db = databaseProvider.get();
  }

  async validate(token: string): Promise<boolean> {
    const existing = await this.db.oneOrNone<Token>('select * from tokens where token = ${token}', { token });

    // we are the final source of truth - if the token doesn't exist at all, it's clearly not valid
    if (existing === null) {
      return false;
    }

    // if the token has been revoked we don't even care when that was, it's not valid
    if (existing.revokedAt !== null) {
      return false;
    }

    // otherwise, time for math
    const now = new Date();
    if (new Date(existing.expiresAt) < now) {
      return false;
    }

    // and finally, apparently we're good
    return true;
  }

  async create(token: Token) {
    // first, we simply insert the token
    await this.db.none(
      'insert into tokens ( token, type, user_id, created_at, expires_at ) values ( ${token}, ${type}, ${userId}, ${createdAt}, ${expiresAt} )',
      token);

    // take the opportunity to clean up any expired tokens for this user while we're at it
    await this.db.none('delete from tokens where user_id = ${userId} and cast( expires_at as timestamp ) <= now()', { userId: token.userId });
  }

  async revoke(token: string) {
    await this.db.none('update tokens set revoked_at = ${revokedAt} where token = ${token}', { revokedAt: new Date().toISOString(), token });
  }
}
