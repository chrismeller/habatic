import { IsString, MinLength, MaxLength, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTrackerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsNotEmpty()
  readonly name: string;
}
