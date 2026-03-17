import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { FuelType } from 'src/common/enums/fuel-type.enum';
 
// Payload d'un véhicule individuel — sans customerId (fourni une seule fois à la racine)
export class BulkVehiculeItemDto {
  @IsString()
  matricule: string;
 
  @IsString()
  imei: string;
 
  @IsOptional()
  @IsString()
  brand?: string;
 
  @IsOptional()
  @IsString()
  model?: string;
 
  @IsOptional()
  year?: number;
 
  @IsOptional()
  @IsEnum(FuelType)
  fuel_type?: FuelType;
 
  @IsPositive()
  tank_capacity: number;
 
  @IsOptional()
  odometer?: number;
 
  @IsOptional()
  typeId?: number | null;
}
 
// Enveloppe avec le customerId partagé + le tableau
export class BulkCreateVehiculeDto {
  @IsInt()
  customerId: number;
 
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkVehiculeItemDto)
  vehicules: BulkVehiculeItemDto[];
}

