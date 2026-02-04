import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@Controller('vehicules')
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Post()
  async create(@Body() createVehiculeDto: CreateVehiculeDto) {
    const vehicule = await this.vehiculesService.create(createVehiculeDto);

    return {
      status: 200,
      message: 'Véhicule créé avec succès',
      response: vehicule,
    };
  }

  @Get()
  async findAll() {
    const vehicules = await this.vehiculesService.findAll();

    return {
      status: 200,
      message: 'Véhicules récupérés avec succès',
      response: vehicules,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vehicule = await this.vehiculesService.findOne(+id);

    return {
      status: 200,
      message: 'Véhicule récupéré avec succès',
      response: vehicule,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehiculeDto: UpdateVehiculeDto) {
    const vehicule = await this.vehiculesService.update(+id, updateVehiculeDto);

    return {
      status: 200,
      message: 'Véhicule mis à jour avec succès',
      response: vehicule,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.vehiculesService.remove(+id);
    
    return {
      status: 200,
      message: 'Véhicule supprimé avec succès',
      response: result,
    };
  }
}
