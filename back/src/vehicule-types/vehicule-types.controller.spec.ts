import { Test, TestingModule } from '@nestjs/testing';
import { VehiculeTypesController } from './vehicule-types.controller';
import { VehiculeTypesService } from './vehicule-types.service';

describe('VehiculeTypesController', () => {
  let controller: VehiculeTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculeTypesController],
      providers: [VehiculeTypesService],
    }).compile();

    controller = module.get<VehiculeTypesController>(VehiculeTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
