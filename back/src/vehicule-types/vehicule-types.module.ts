import { Module } from '@nestjs/common';
import { VehiculeTypesService } from './vehicule-types.service';
import { VehiculeTypesController } from './vehicule-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { VehiculeType } from './entity/vehicule-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehiculeType])],
  controllers: [VehiculeTypesController],
  providers: [VehiculeTypesService],
  exports: [VehiculeTypesService, TypeOrmModule],
})
export class VehiculeTypesModule {}
