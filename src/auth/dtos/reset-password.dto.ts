import { IsNotEmpty, IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
