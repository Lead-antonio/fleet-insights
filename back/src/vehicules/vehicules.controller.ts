import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { BulkCreateVehiculeDto } from './dto/bulk-vehicule.dto';
import { BulkUpdateVehiculeDto } from './dto/bulk-update-vehicule';

@Controller('vehicules')
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

   @Post()
  async create(@Body() createVehiculeDto: CreateVehiculeDto) {
    console.log(createVehiculeDto);
    const vehicule = await this.vehiculesService.create(createVehiculeDto);
    return { status: 200, message: 'Véhicule créé avec succès', response: vehicule };
  }

  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateVehiculeDto) {
    const vehicules = await this.vehiculesService.bulkCreate(dto);
    return {
      status: 200,
      message: `${vehicules.length} véhicule(s) créé(s) avec succès`,
      response: vehicules,
    };
  }
  
  @Patch('bulk')
  async bulkUpdate(@Body() dto: BulkUpdateVehiculeDto) {
    const vehicules = await this.vehiculesService.bulkUpdate(dto);
    return {
      status: 200,
      message: `${vehicules.length} véhicule(s) mis à jour avec succès`,
      response: vehicules,
    };
  }
 
  @Get()
  async findAll() {
    const vehicules = await this.vehiculesService.findAll();
    return { status: 200, message: 'Véhicules récupérés avec succès', response: vehicules };
  }
 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vehicule = await this.vehiculesService.findOne(+id);
    return { status: 200, message: 'Véhicule récupéré avec succès', response: vehicule };
  }
 
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehiculeDto: UpdateVehiculeDto) {
    const vehicule = await this.vehiculesService.update(+id, updateVehiculeDto);
    return { status: 200, message: 'Véhicule mis à jour avec succès', response: vehicule };
  }
 
  // Route utilisée par le Sync GPS du frontend (SyncModal → api.patch(`/vehicules/imei/${imei}`))
  // ⚠️ Doit être AVANT :id pour que NestJS ne confonde pas "imei" avec un id numérique
  @Patch('imei/:imei')
  async updateByImei(@Param('imei') imei: string, @Body() updateVehiculeDto: UpdateVehiculeDto) {
    const vehicule = await this.vehiculesService.updateByImei(imei, updateVehiculeDto);
    return { status: 200, message: 'Véhicule mis à jour avec succès', response: vehicule };
  }
 
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.vehiculesService.remove(+id);
    return { status: 200, message: 'Véhicule supprimé avec succès', response: result };
  }
}
