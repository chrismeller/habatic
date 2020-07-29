import { Injectable, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { TokenService } from './token.service';
import { JwtRefreshTokenStrategy } from './jwt.refreshToken.strategy';
import { ConfigModule } from '../config/config.module';
import { JwtFactory } from './jwt.factory';
import { MailModule } from '../mail/mail.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DatabaseModule, UsersModule, PassportModule, ConfigModule, MailModule, AuditModule],
  providers: [AuthService, TokenService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy, JwtFactory],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
