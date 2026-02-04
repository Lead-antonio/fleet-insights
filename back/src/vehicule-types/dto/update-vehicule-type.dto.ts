import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculeTypeDto } from './create-vehicule-type.dto';

export class UpdateVehiculeTypeDto extends PartialType(CreateVehiculeTypeDto) {}
