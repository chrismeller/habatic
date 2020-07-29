import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';
import { Token } from './interfaces/token.interface';
import { ConfigService } from '../config/config.service';
import { Promise } from 'bluebird';
import * as crypto from 'crypto';
import { User } from '../users/interfaces/user.interface';
import { UserDto } from './dtos/user.dto';
import { JwtFactory } from './jwt.factory';
import { MailService } from '../mail/mail.service';
import * as uuid from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtFactory: JwtFactory,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserDto> {
    const user: User = await this.usersService.getByEmail(email);

    // since the user's ID is the salt, we need to make sure there is a user first
    if (user) {
      // if they're not verified, kick it back
      // @todo how to differentiate between this and an invalid password?
      if (!user.emailVerified) {
        return false;
      }

      // then calculate the hash of the password
      const passwordHash = await this.hashPassword(pass, user.id);

      if (passwordHash === user.passwordHash) {
        return {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      }
    }

    // if there is no such user, or the password was wrong... nahhui
    return null;
  }

  async validateToken(token: string): Promise<boolean> {
    return await this.tokenService.validate(token);
  }

  async login(user: User) {
    // the only thing we include is the user's ID, everything else we'll look up later anyway
    const payload = { sub: user.id };

    const accessToken = await this.jwtFactory.get('access_token').signAsync(payload);
    await this.saveToken(accessToken, user.id, 'access_token');

    const refreshToken = await this.jwtFactory.get('refresh_token').signAsync(payload);
    await this.saveToken(refreshToken, user.id, 'refresh_token');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async saveToken(token: string, userId: string, type: string) {
    // decode it so we can get the expiration and creation time off of the payload
    const decoded = this.jwtFactory.get(type).decode(token);

    let expiresAt: string | null = null;
    if (typeof decoded === 'object') {
      if (decoded.exp !== undefined) {
        const expiresAtTimestamp = decoded.exp;
        expiresAt = new Date(expiresAtTimestamp * 1000).toISOString();
      }
    }

    let createdAt: string | null = null;
    if (typeof decoded === 'object') {
      if (decoded.iat !== undefined) {
        const issuedAtTimestamp = decoded.iat;
        createdAt = new Date(issuedAtTimestamp * 1000).toISOString();
      }
    }

    // save the access token to the database
    const dbToken: Token = {
      token,
      type,
      userId,
      createdAt,
      expiresAt,
    };

    await this.tokenService.create(dbToken);
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    const pbkdf2 = Promise.promisify(crypto.pbkdf2);

    const passwordHashBuffer = await pbkdf2(password, salt, 10000, 64, 'sha512');
    return passwordHashBuffer.toString('hex');
  }

  async resetPassword(email: string): Promise {
    const existingUser = await this.usersService.getByEmail(email);

    if (!existingUser) {
      return;
    }

    // create a new verification token for the user and set it on their account
    const verificationToken = uuid.v4();
    await this.usersService.updateVerificationToken(existingUser.id, verificationToken, new Date().toISOString());

    const verificationLink = new URL(`/auth/verify/${existingUser.id}/${verificationToken}`, this.configService.get('BASE_URL', '', true));

    await this.mailService.send(
      existingUser.email,
      this.configService.get('EMAIL_FROM', '', true),
      'Reset your Habatic Password!', `Reset your Habatic password by clicking on the following link: ${verificationLink}`,
      `Reset your Habatic password by <a href="${verificationLink}">clicking on this link!</a>`,
    );
  }

  async register(user: User) {
    const existingUser = await this.usersService.getByEmail(user.email);

    if (existingUser) {
      throw new Error('User already exists!');
    }

    // first, create the user
    await this.usersService.create(user);

    const verificationLink = new URL(`/auth/verify/${user.id}/${user.verificationToken}`, this.configService.get('BASE_URL', '', true));

    // send the email so they can validate their address
    await this.mailService.send(
      user.email,
      this.configService.get('EMAIL_FROM', '', true),
      'Welcome to Habatic!', `Please verify your Habatic account by visiting the following link: ${verificationLink}`,
      `Please verify your Habatic account by <a href="${verificationLink}">clicking on this link!</a>`,
    );
  }

  async verifyEmail(userId: string, token: string): Promise<boolean> {
    const user = await this.usersService.getById(userId);

    if (!user) {
      return false;
    }

    if (user.verificationToken === token) {
      await this.usersService.markUserVerified(user.id, new Date().toISOString());
      return true;
    }

    return false;
  }
}
