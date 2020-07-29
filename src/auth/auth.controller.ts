import { Controller, Request, Post, UseGuards, Get, Body, Res, Param, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import * as uuid from 'uuid';
import { RegisterDto } from './dtos/register.dto';
import { User } from '../users/interfaces/user.interface';
import { AuditMessage } from '../audit/auditMessage.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    // @todo populate more info about the user - like their email
    return req.user;
  }

  // @todo log the user's IP address
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Password reset token requested for ${req.body.email} by some ip address')
  @Post('resetPassword')
  async resetPassword(@Res() res, @Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.email.toLowerCase());

    return res.code(200).send({ result: 'success' });
  }

  @UseGuards(AuthGuard('jwt.refreshToken'))
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Refresh token requested for user ${req.user.id}')
  @Post('token')
  async refreshToken(@Request() req) {
    // we've already validated the token thanks to the auth guard, now we just need to generate a new one the same way we do for login
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Request() req, @Res() res, @Body() createUserDto: RegisterDto) {
    // first, create a unique ID for this user
    const userId = uuid.v4();

    // calculate the hash of the user's password using their ID as the salt
    const passwordHash = await this.authService.hashPassword(createUserDto.password, userId);

    const user: User = {
      id: userId,
      passwordHash,
      email: createUserDto.email.toLowerCase(),
      createdAt: new Date().toISOString(),
      verificationToken: uuid.v4(),
      verificationTokenCreatedAt: new Date().toISOString(),
      emailVerified: false,
      emailVerifiedAt: null,
    };

    try {
      await this.authService.register(user);

      return res.code(201).send({ result: 'success' } );
    } catch (e) {
      return res.code(400).send({ result: 'error', error: e.message } );
    }
  }

  @Get('verify/:userId/:token')
  async verify(@Request() req, @Res() res, @Param('userId') userId: string, @Param('token') token: string) {
    const result = await this.authService.verifyEmail(userId, token);

    if (result === true) {
      return res.code(200).send({ result: 'success' });
    }
    else {
      return res.code(400).send({ result: 'error', error: 'Invalid token!' });
    }
  }
}
