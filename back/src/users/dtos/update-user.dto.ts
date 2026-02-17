import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

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
