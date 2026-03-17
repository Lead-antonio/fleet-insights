import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  IsInt,
} from "class-validator";
import { Type } from 'class-transformer';
import { FuelType } from 'src/common/enums/fuel-type.enum';

export class CreateVehiculeDto {
  @IsString()
  matricule: string;

  @IsOptional()
  imei?: string;

  @IsOptional()
  photo_url?: string;

  @IsOptional()
  brand?: string;

  @IsOptional()
  model?: string;

  @IsOptional()
  year?: number;

  @IsOptional()
  @IsEnum(FuelType)
  fuel_type?: FuelType;

  @IsOptional()
  tank_capacity?: number;

  @IsOptional()
  odometer?: number;

  @IsInt()
  customerId: number;

  @IsOptional()
  @IsInt()
  typeId?: number;
}
