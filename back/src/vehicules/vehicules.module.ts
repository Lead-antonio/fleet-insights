import { Module } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { VehiculesController } from './vehicules.controller';
import { Vehicule } from './entity/vehicule.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicule])],
  controllers: [VehiculesController],
  providers: [VehiculesService],
  exports: [VehiculesService, TypeOrmModule],
})
export class VehiculesModule {}
