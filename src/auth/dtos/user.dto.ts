import { IsNotEmpty, IsUUID, IsEmail, IsBoolean } from 'class-validator';

export class UserDto {
  @IsUUID()
  readonly id: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsBoolean()
  readonly emailVerified: boolean;
}
