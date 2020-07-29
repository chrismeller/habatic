import { IsString, MinLength, MaxLength, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateTrackerValueDto {
  @IsString()
  @MinLength(1)
  @MaxLength(25)
  @IsNotEmpty()
  readonly value: string;

  @IsDateString()
  readonly valueDate: string;
}
