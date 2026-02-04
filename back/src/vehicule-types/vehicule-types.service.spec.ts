import { Test, TestingModule } from '@nestjs/testing';
import { VehiculeTypesService } from './vehicule-types.service';

describe('VehiculeTypesService', () => {
  let service: VehiculeTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiculeTypesService],
    }).compile();

    service = module.get<VehiculeTypesService>(VehiculeTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
