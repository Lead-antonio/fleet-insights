import { Module } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { VehiculesController } from './vehicules.controller';
import { Vehicule } from './entity/vehicule.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { CustomersModule } from 'src/customers/customers.module';
import { VehiculeTypesModule } from 'src/vehicule-types/vehicule-types.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicule]), CustomersModule, VehiculeTypesModule],
  controllers: [VehiculesController],
  providers: [VehiculesService],
  exports: [VehiculesService, TypeOrmModule],
})
export class VehiculesModule {}
