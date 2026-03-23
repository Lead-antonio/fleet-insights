import { Module } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { VehiculesController } from './vehicules.controller';
import { Vehicule } from './entity/vehicule.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { CustomersModule } from 'src/customers/customers.module';
import { VehiculeTypesModule } from 'src/vehicule-types/vehicule-types.module';
import { VehicleGateway } from './vehicule.gateway';
import { LocationPollerService } from 'src/gps/location-poller.service';
import { Gps } from 'src/gps/entity/gps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicule, Gps]), CustomersModule, VehiculeTypesModule],
  controllers: [VehiculesController],
  providers: [VehiculesService, VehicleGateway, LocationPollerService],
  exports: [VehiculesService, TypeOrmModule],
})
export class VehiculesModule {}
