import { IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class CreateCustomerDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  company?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  api_key?: string;
}
