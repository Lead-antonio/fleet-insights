import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Interval } from '@nestjs/schedule';
import { Customer } from '../customers/entity/customer.entity';
import { Gps } from '../gps/entity/gps.entity';
import { VehicleGateway } from '../vehicules/vehicule.gateway';
import { Vehicule } from 'src/vehicules/entity/vehicule.entity';

@Injectable()
export class LocationPollerService implements OnModuleDestroy {
  private abortControllers = new Map<number, AbortController>();

  constructor(
    @InjectRepository(Vehicule)
   private readonly vehiculeRepo: Repository<Vehicule>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Gps)
    private readonly gpsRepo: Repository<Gps>,
    private readonly gateway: VehicleGateway,
  ) {}

  @Interval(30000)
  async pollAll() {
    console.log('[POLLER] 🔄 Déclenchement pollAll...');

    const vehicules = await this.vehiculeRepo.find({
      relations: ['customer'],
    });

    console.log(`[POLLER] ${vehicules.length} véhicules trouvés`);

    await Promise.allSettled(vehicules.map((v) => this.pollVehicule(v)));
  }

  private async pollVehicule(vehicule: Vehicule) {
    if (!vehicule?.customer?.api_key) {
      console.log(`[POLLER] ⚠️ ${vehicule.matricule} — pas de api_key`);
      return;
    }

    const ctrl = new AbortController();
    this.abortControllers.set(vehicule.id, ctrl);

    try {
      const url = `https://www.m-tectracking.mg/api/api.php?api=user&key=${vehicule.customer.api_key}&cmd=OBJECT_GET_LOCATIONS,${vehicule.imei}`;
      console.log(url)
      const res = await fetch(url, { signal: ctrl.signal });
      const data = await res.json();

      const loc = data?.[vehicule.imei];
      if (!loc) {
        console.log(`[POLLER] ⚠️ ${vehicule.matricule} — pas de données GPS`);
        return;
      }

      const now = new Date();
      const acc = loc.params?.acc;
      const speed = parseFloat(loc.speed ?? '0');
      const isOnline = Date.now() - new Date(loc.dt_tracker).getTime() < 5 * 60 * 1000;
     
      // Pour la DB — boolean
      const dbStatus = isOnline;

      // Pour le WebSocket — statut précis
      const wsStatus = !isOnline
        ? 'offline'
        : acc == 0
        ? 'stopped'
        : speed > 0
        ? 'moving'
        : 'online';

      // Upsert GPS — créer si n'existe pas, mettre à jour sinon
      await this.gpsRepo.upsert(
        {
          vehicule: { id: vehicule.id },
          latitude: parseFloat(loc.lat),
          longitude: parseFloat(loc.lng),
          status: dbStatus,
          last_connection: now,
        },
        ['vehicule'],
      );

      this.gateway.emitVehicleUpdate({
        vehiculeId: vehicule.id,
        imei: vehicule.imei,
        lat: loc.lat,
        lng: loc.lng,
        speed: loc.speed,
        status: wsStatus,
        last_connection: now,
      });

      // console.log(
      //   `[GPS] ${vehicule.matricule} | ${isOnline ? '🟢 online' : '🔴 offline'} | lat: ${loc.lat}, lng: ${loc.lng} | speed: ${loc.speed ?? 0} km/h`
      // );
    } catch (err) {
      if (err.name !== 'AbortError')
        console.error(`[GPS] Erreur ${vehicule.matricule}:`, err.message);
    }
  }

  onModuleDestroy() {
    this.abortControllers.forEach((c) => c.abort());
  }
}