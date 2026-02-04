import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiculeTypesService } from './vehicule-types.service';
import { CreateVehiculeTypeDto } from './dto/create-vehicule-type.dto';
import { UpdateVehiculeTypeDto } from './dto/update-vehicule-type.dto';

@Controller('vehicule-types')
export class VehiculeTypesController {
  constructor(private readonly vehiculeTypesService: VehiculeTypesService) {}

  @Post()
  async create(@Body() createVehiculeTypeDto: CreateVehiculeTypeDto) {
    const vehiculeType = await this.vehiculeTypesService.create(createVehiculeTypeDto);

    return {
      status: 200,
      message: 'Type de véhicule créé avec succès',
      response: vehiculeType,
    };
  }

  @Get()
  async findAll() {
    const vehiculeTypes = await this.vehiculeTypesService.findAll();

    return {
      status: 200,
      message: 'Types de véhicules récupérés avec succès',
      response: vehiculeTypes,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vehiculeType = await this.vehiculeTypesService.findOne(+id);

    return {
      status: 200,
      message: 'Type de véhicule récupéré avec succès',
      response: vehiculeType,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehiculeTypeDto: UpdateVehiculeTypeDto) {
    const vehiculeType = await this.vehiculeTypesService.update(+id, updateVehiculeTypeDto);

    return {
      status: 200,
      message: 'Type de véhicule mis à jour avec succès',
      response: vehiculeType,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.vehiculeTypesService.remove(+id);
    
    return {
      status: 200,
      message: 'Type de véhicule supprimé avec succès',
      response: result,
    };
  }
}
