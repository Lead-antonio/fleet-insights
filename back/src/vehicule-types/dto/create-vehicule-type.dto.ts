import { IsString, IsOptional } from "class-validator";

export class CreateVehiculeTypeDto {
    @IsString()
    label: string;

    @IsOptional()
    @IsString()
    description?: string;
}
