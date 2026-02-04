import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateVehiculeTypeDto } from './dto/create-vehicule-type.dto';
import { UpdateVehiculeTypeDto } from './dto/update-vehicule-type.dto';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { VehiculeType } from './entity/vehicule-type.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class VehiculeTypesService {
  constructor(
    @InjectRepository(VehiculeType)
    private readonly typeRepo: Repository<VehiculeType>,
  ) {}

  
  async create(createVehiculeTypeDto: CreateVehiculeTypeDto) {
    try{
      const vehiculeType = this.typeRepo.create(createVehiculeTypeDto);
      return await this.typeRepo.save(vehiculeType);
    }catch(error){
      if (
        error.code === '23505' ||
        error.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Type déjà existant');
      }

      throw new InternalServerErrorException(
        'Erreur lors de la création du type de véhicule',
      );
    }
    
  }

  async findAll(): Promise<VehiculeType[]> {
    return await this.typeRepo.find();
  }

  async findOne(id: number): Promise<VehiculeType> {
    const type = await this.typeRepo.findOne({
      where: { id }
    });

    if (!type) {
      throw new NotFoundException(`Vehicle type #${id} not found`);
    }

    return type;
  }

  async update(id: number, updateVehiculeTypeDto: UpdateVehiculeTypeDto): Promise<VehiculeType> {
    const vehiculeType = await this.typeRepo.findOneBy({ id });
    if (!vehiculeType) {
      throw new NotFoundException(`Vehicle type #${id} not found`);
    }
    Object.assign(vehiculeType, updateVehiculeTypeDto);
    return await this.typeRepo.save(vehiculeType);
  }

  async remove(id: number) {
    const vehiculeType = await this.typeRepo.findOneBy({ id });
    if (!vehiculeType) {
      throw new NotFoundException(`Vehicle type #${id} not found`);
    }
    return await this.typeRepo.remove(vehiculeType);
  }
}
