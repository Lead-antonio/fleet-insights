import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { Repository } from 'typeorm/repository/Repository';
import { Vehicule } from './entity/vehicule.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Customer } from 'src/customers/entity/customer.entity';
import { VehiculeType } from 'src/vehicule-types/entity/vehicule-type.entity';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { BulkCreateVehiculeDto } from './dto/bulk-vehicule.dto';
import { BulkUpdateVehiculeDto } from './dto/bulk-update-vehicule';

@Injectable()
export class VehiculesService {
  private readonly logger = new Logger(VehiculesService.name);

  constructor(
      @InjectRepository(Vehicule)
      private readonly vehiculeRepo: Repository<Vehicule>,
      @InjectRepository(Customer)
      private readonly customerRepo: Repository<Customer>,
      @InjectRepository(VehiculeType)
      private readonly typeRepo: Repository<VehiculeType>,
      private readonly configService: ConfigService,
    ) {}


  async create(createVehiculeDto: CreateVehiculeDto): Promise<Vehicule> {
    const customer = await this.customerRepo.findOneBy({
      id: createVehiculeDto.customerId,
    });
    if (!customer) throw new BadRequestException('Client introuvable');
 
    // const type = await this.typeRepo.findOneBy({
    //   id: createVehiculeDto.typeId,
    // });
    // if (!type) throw new BadRequestException('Type de véhicule introuvable');
 
    try {
      const vehicule = this.vehiculeRepo.create({
        ...createVehiculeDto,
        customer,
        type: createVehiculeDto.typeId
                ? { id: createVehiculeDto.typeId }
                : undefined,
      });
      return await this.vehiculeRepo.save(vehicule);
    } catch (error) {
      console.error('DB ERROR:', error);
      this.handleDbError(error, 'création');
    }
  }

  async bulkCreate(dto: BulkCreateVehiculeDto): Promise<Vehicule[]> {
    const customer = await this.customerRepo.findOneBy({ id: dto.customerId });
    if (!customer) throw new BadRequestException('Client introuvable');
  
    // Résoudre les types en une seule requête (on ignore les typeId null/undefined)
    const typeIds = [...new Set(dto.vehicules.map((v) => v.typeId).filter(Boolean))] as number[];
    const types = typeIds.length ? await this.typeRepo.findByIds(typeIds) : [];
    const typeMap = new Map(types.map((t) => [t.id, t]));
  
    const entities = dto.vehicules.map((item) => {
      const type = item.typeId ? typeMap.get(item.typeId) : undefined;
      return this.vehiculeRepo.create({ ...item, customer, type });
    });
  
    try {
      // save() en array déclenche un INSERT multi-valeurs (une seule requête SQL)
      return await this.vehiculeRepo.save(entities);
    } catch (error) {
      this.handleDbError(error, 'création en masse');
    }
  }
  
  async bulkUpdate(dto: BulkUpdateVehiculeDto): Promise<Vehicule[]> {
    const customer = await this.customerRepo.findOneBy({ id: dto.customerId });
    if (!customer) throw new BadRequestException('Client introuvable');
  
    const typeIds = [...new Set(dto.vehicules.map((v) => v.typeId).filter(Boolean))] as number[];
    const types = typeIds.length ? await this.typeRepo.findByIds(typeIds) : [];
    const typeMap = new Map(types.map((t) => [t.id, t]));
  
    // Charger tous les véhicules existants en une seule requête
    const imeis = dto.vehicules.map((v) => v.imei);
    const existing = await this.vehiculeRepo.findBy(
      imeis.map((imei) => ({ imei })),
    );
    const existingMap = new Map(existing.map((v) => [v.imei, v]));
  
    const toSave: Vehicule[] = [];
  
    for (const item of dto.vehicules) {
      const vehicule = existingMap.get(item.imei);
      if (!vehicule) continue; // IMEI inconnu → on ignore silencieusement
  
      const type = item.typeId ? typeMap.get(item.typeId) : undefined;
  
      const { typeId, ...scalarFields } = item;
      Object.assign(vehicule, scalarFields);
      vehicule.customer = customer;
        if (typeId === null || typeId === undefined) {
        // typeId absent ou null → on conserve le type existant du véhicule
        // (pas de réassignation pour éviter l'erreur de type)
      } else {
        const resolvedType = typeMap.get(typeId);
        if (resolvedType) vehicule.type = resolvedType; // introuvable → on garde l'existant
      }
      toSave.push(vehicule);
    }
  
    try {
      return await this.vehiculeRepo.save(toSave);
    } catch (error) {
      this.handleDbError(error, 'mise à jour en masse');
    }
  }
 
  // ─── FindAll ──────────────────────────────────────────────────────────────
 
  async findAll(): Promise<Vehicule[]> {
    return this.vehiculeRepo.find({
      // customer & type sont eager, pas besoin de relations explicites
      order: { id: 'DESC' },
    });
  }
 
  // ─── FindOne ──────────────────────────────────────────────────────────────
 
  async findOne(id: number): Promise<Vehicule> {
    const vehicule = await this.vehiculeRepo.findOneBy({ id });
    if (!vehicule) throw new NotFoundException(`Véhicule #${id} introuvable`);
    return vehicule;
  }
 
  // ─── FindOneByImei (utilisé par le Sync GPS du frontend) ─────────────────
 
  async findOneByImei(imei: string): Promise<Vehicule | null> {
    return this.vehiculeRepo.findOneBy({ imei });
  }
 
  // ─── Update ───────────────────────────────────────────────────────────────
 
  async update(id: number, updateVehiculeDto: UpdateVehiculeDto): Promise<Vehicule> {
    const vehicule = await this.findOne(id); // lève NotFoundException si absent
 
    // Résoudre customer si fourni
    if (updateVehiculeDto.customerId !== undefined) {
      const customer = await this.customerRepo.findOneBy({
        id: updateVehiculeDto.customerId,
      });
      if (!customer) throw new BadRequestException('Client introuvable');
      vehicule.customer = customer;
    }
 
    // Résoudre type si fourni
    if (updateVehiculeDto.typeId !== undefined) {
      const type = await this.typeRepo.findOneBy({
        id: updateVehiculeDto.typeId,
      });
      if (!type) throw new BadRequestException('Type de véhicule introuvable');
      vehicule.type = type;
    }
 
    // Appliquer les champs scalaires (on exclut customerId/typeId déjà traités)
    const { customerId, typeId, ...scalarFields } = updateVehiculeDto;
    Object.assign(vehicule, scalarFields);
 
    try {
      return await this.vehiculeRepo.save(vehicule);
    } catch (error) {
      this.handleDbError(error, 'mise à jour');
    }
  }
 
  // ─── UpdateByImei (utilisé par le Sync GPS → PATCH /vehicules/imei/:imei) ─
 
  async updateByImei(imei: string, updateVehiculeDto: UpdateVehiculeDto): Promise<Vehicule> {
    const vehicule = await this.findOneByImei(imei);
    if (!vehicule) throw new NotFoundException(`Véhicule avec IMEI ${imei} introuvable`);
    return this.update(vehicule.id, updateVehiculeDto);
  }
 
  // ─── Remove ───────────────────────────────────────────────────────────────
 
  async remove(id: number): Promise<{ deleted: true; id: number }> {
    const vehicule = await this.findOne(id); // lève NotFoundException si absent
    await this.vehiculeRepo.remove(vehicule);
    return { deleted: true, id };
  }
 
  // ─── Helpers privés ───────────────────────────────────────────────────────
 
  private buildTrackingUrl(apiKey: string, command: string): string {
    const baseUrl = this.configService.get<string>('geolocalisation.url');
    const params = new URLSearchParams({ api: 'user', key: apiKey, cmd: command });
    return `${baseUrl}?${params.toString()}`;
  }
 
  /** Centralise la gestion des erreurs DB (unicité, autres) */
  private handleDbError(error: any, action: string): never {
    console.log("ERROR", error);
    this.logger.error(`Erreur lors de la ${action} du véhicule`, error);
 
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      throw new ConflictException(
        'Un véhicule avec ce matricule ou cet IMEI existe déjà',
      );
    }
 
    throw new InternalServerErrorException(
      `Erreur lors de la ${action} du véhicule`,
    );
  }
}
