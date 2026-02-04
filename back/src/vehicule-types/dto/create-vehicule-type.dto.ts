import { IsString } from "class-validator";

export class CreateVehiculeTypeDto {
    @IsString()
    label: string;
}
