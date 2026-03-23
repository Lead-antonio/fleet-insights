import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '@/data/vehicles';
import { useVehicleSocket } from './use-vehicule-socket';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial depuis le backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/vehicules`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Erreur chargement véhicules');
        return r.json();
      })
      .then((json) => {
        const data =  json.response;
        // Mapper la réponse NestJS → Vehicle
        const mapped: Vehicle[] = data.map((v: any) => ({
          id: v.id,
          matricule: v.matricule,
          imei: v.imei,
          brand: v.brand,
          model: v.model,
          photo_url: v.photo_url,
          fuel_type: v.fuel_type,
          tank_capacity: v.tank_capacity ? parseFloat(v.tank_capacity) : undefined,
          odometer: v.odometer ? parseFloat(v.odometer) : undefined,
          type: v.type?.name ?? 'other',
          status: v.gps?.status ? 'online' : 'offline',
          last_connection: v.gps?.last_connection,
          position: {
            lat: v.gps?.latitude ?? 0,
            lng: v.gps?.longitude ?? 0,
          },
          customer: v.customer
            ? { id: v.customer.id, name: v.customer.name, company: v.customer.company }
            : undefined,
        }));
        setVehicles(mapped);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Merge live WebSocket updates
  const handleSocketUpdate = useCallback((update: {
    vehiculeId: number;
    lat: string;
    lng: string;
    speed?: string;
    status: 'online' | 'offline' | 'moving' | 'stopped';
    last_connection: string;
  }) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === update.vehiculeId
          ? {
              ...v,
              status: update.status,
              last_connection: update.last_connection,
              position: {
                lat: parseFloat(update.lat),
                lng: parseFloat(update.lng),
              },
            }
          : v
      )
    );
  }, []);

  useVehicleSocket(handleSocketUpdate);

  return { vehicles, loading, error };
}