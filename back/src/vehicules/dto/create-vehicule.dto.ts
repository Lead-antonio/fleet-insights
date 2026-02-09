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

  @IsString()
  @IsOptional()
  imei: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsEnum(FuelType)
  fuel_type?: FuelType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  tank_capacity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  odometer: number;

  @IsInt()
  @Type(() => Number)
  customerId: number;

  @IsInt()
  @Type(() => Number)
  typeId: number;
}
