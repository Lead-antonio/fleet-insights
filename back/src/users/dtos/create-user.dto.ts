import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  first_name?: string;

  @IsString()
  last_name?: string;

  @IsString()
  number?: string;
  
  @IsString()
  country?: string;

  @IsString()
  state?: string;
}
