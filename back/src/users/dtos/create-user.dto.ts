import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  full_name?: string;
}
