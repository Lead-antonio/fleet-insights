import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { Repository } from 'typeorm/repository/Repository';
import { Vehicule } from './entity/vehicule.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Customer } from 'src/customers/entity/customer.entity';
import { VehiculeType } from 'src/vehicule-types/entity/vehicule-type.entity';

@Injectable()
export class VehiculesService {
  constructor(
      @InjectRepository(Vehicule)
      private readonly vehiculeRepo: Repository<Vehicule>,
      @InjectRepository(Customer)
      private readonly customerRepo: Repository<Customer>,
      @InjectRepository(VehiculeType)
      private readonly typeRepo: Repository<VehiculeType>,
    ) {}
  
  async create(createVehiculeDto: CreateVehiculeDto) {
    try {
      const customer = await this.customerRepo.findOneBy({
        id: createVehiculeDto.customerId,
      });

      const type = await this.typeRepo.findOneBy({
        id: createVehiculeDto.typeId,
      });

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      if (!type) {
        throw new BadRequestException('Vehicule type not found');
      }

      const vehicule = this.vehiculeRepo.create({...createVehiculeDto, customer, type});
      return this.vehiculeRepo.save(vehicule);
    } catch (error) {
      if (
          error.code === '23505' ||
          error.code === 'ER_DUP_ENTRY'
        ) {
          throw new ConflictException('Un véhicule avec ce matricule ou IMEI existe déjà');
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
