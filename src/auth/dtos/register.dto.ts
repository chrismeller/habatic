import { IsString, MinLength, MaxLength, IsNotEmpty, IsUUID, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;
}
