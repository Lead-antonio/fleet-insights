import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { Repository } from 'typeorm/repository/Repository';
import { Vehicule } from './entity/vehicule.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';

@Injectable()
export class VehiculesService {
  constructor(
      @InjectRepository(Vehicule)
      private readonly vehiculeRepo: Repository<Vehicule>,
    ) {}
  
  create(createVehiculeDto: CreateVehiculeDto) {
    try {
      const vehicule = this.vehiculeRepo.create(createVehiculeDto);
      return this.vehiculeRepo.save(vehicule);
    } catch (error) {
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

  findAll() {
    return `This action returns all vehicules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vehicule`;
  }

  update(id: number, updateVehiculeDto: UpdateVehiculeDto) {
    return `This action updates a #${id} vehicule`;
  }

  remove(id: number) {
    return `This action removes a #${id} vehicule`;
  }
}
