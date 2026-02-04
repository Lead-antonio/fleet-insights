import { IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class CreateCustomerDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  api_key?: string;
}
