export type VehicleType = 'moto' | 'car' | 'truck' | 'other';
export type VehicleStatus = 'online' | 'offline' | 'moving' | 'stopped';
export type FuelType = 'diesel' | 'gasoline';

export interface Vehicle {
  id: string;
  matricule: string;
  type: VehicleType;
  brand: string;
  model: string;
  fuelType: FuelType;
  fuelCapacity: number;
  currentFuelLevel: number;
  odometer: number;
  totalDistance: number;
  avgConsumption: number;
  status: VehicleStatus;
  lastOnline: Date;
  gpsInstallDate: Date;
  zone: string;
  position: {
    lat: number;
    lng: number;
  };
  driver?: string;
}

export interface FuelEvent {
  id: string;
  vehicleId: string;
  date: Date;
  type: 'refill' | 'consumption' | 'anomaly';
  amount: number;
  previousLevel: number;
  newLevel: number;
  odometer: number;
  location?: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'fuel_anomaly' | 'gps_disconnect' | 'overspeed' | 'prolonged_stop' | 'geofence_exit';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: Date;
  resolved: boolean;
  details?: string;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire_change' | 'brake_service' | 'general_inspection' | 'repair' | 'other';
  status: 'planned' | 'in_progress' | 'completed';
  plannedDate: Date;
  completedDate?: Date;
  odometer: number;
  cost: number;
  description: string;
  isPlanned: boolean;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Zones géographiques
export const zones: Zone[] = [
  { id: 'z1', name: 'Casablanca', color: '#3B82F6' },
  { id: 'z2', name: 'Rabat', color: '#8B5CF6' },
  { id: 'z3', name: 'Marrakech', color: '#F59E0B' },
  { id: 'z4', name: 'Tanger', color: '#10B981' },
  { id: 'z5', name: 'Fès', color: '#EF4444' },
  { id: 'z6', name: 'Agadir', color: '#EC4899' },
];

// Helper pour générer des dates
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const hoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

// 50+ véhicules réalistes
export const vehicles: Vehicle[] = [
  // Motos (15)
  { id: 'v1', matricule: 'A-1234-MA', type: 'moto', brand: 'Honda', model: 'CBR 600', fuelType: 'gasoline', fuelCapacity: 18, currentFuelLevel: 12, odometer: 45230, totalDistance: 45230, avgConsumption: 4.2, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(365), zone: 'Casablanca', position: { lat: 33.5731, lng: -7.5898 } },
  { id: 'v2', matricule: 'B-5678-MA', type: 'moto', brand: 'Yamaha', model: 'MT-07', fuelType: 'gasoline', fuelCapacity: 14, currentFuelLevel: 8, odometer: 32100, totalDistance: 32100, avgConsumption: 3.8, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(280), zone: 'Rabat', position: { lat: 34.0209, lng: -6.8416 } },
  { id: 'v3', matricule: 'C-9012-MA', type: 'moto', brand: 'Kawasaki', model: 'Z650', fuelType: 'gasoline', fuelCapacity: 15, currentFuelLevel: 5, odometer: 28500, totalDistance: 28500, avgConsumption: 4.0, status: 'stopped', lastOnline: hoursAgo(2), gpsInstallDate: daysAgo(200), zone: 'Marrakech', position: { lat: 31.6295, lng: -7.9811 } },
  { id: 'v4', matricule: 'D-3456-MA', type: 'moto', brand: 'Suzuki', model: 'GSX-R750', fuelType: 'gasoline', fuelCapacity: 17, currentFuelLevel: 14, odometer: 51200, totalDistance: 51200, avgConsumption: 5.1, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(450), zone: 'Tanger', position: { lat: 35.7595, lng: -5.8340 } },
  { id: 'v5', matricule: 'E-7890-MA', type: 'moto', brand: 'BMW', model: 'R1250 GS', fuelType: 'gasoline', fuelCapacity: 20, currentFuelLevel: 16, odometer: 67800, totalDistance: 67800, avgConsumption: 5.5, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(520), zone: 'Fès', position: { lat: 34.0181, lng: -5.0078 } },
  { id: 'v6', matricule: 'F-2345-MA', type: 'moto', brand: 'Honda', model: 'Africa Twin', fuelType: 'gasoline', fuelCapacity: 24, currentFuelLevel: 10, odometer: 89000, totalDistance: 89000, avgConsumption: 5.8, status: 'offline', lastOnline: hoursAgo(30), gpsInstallDate: daysAgo(600), zone: 'Agadir', position: { lat: 30.4278, lng: -9.5981 } },
  { id: 'v7', matricule: 'G-6789-MA', type: 'moto', brand: 'Triumph', model: 'Tiger 900', fuelType: 'gasoline', fuelCapacity: 20, currentFuelLevel: 18, odometer: 34500, totalDistance: 34500, avgConsumption: 4.9, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(180), zone: 'Casablanca', position: { lat: 33.5950, lng: -7.6187 } },
  { id: 'v8', matricule: 'H-0123-MA', type: 'moto', brand: 'KTM', model: '790 Adventure', fuelType: 'gasoline', fuelCapacity: 20, currentFuelLevel: 7, odometer: 42300, totalDistance: 42300, avgConsumption: 4.7, status: 'stopped', lastOnline: hoursAgo(5), gpsInstallDate: daysAgo(320), zone: 'Rabat', position: { lat: 33.9716, lng: -6.8498 } },
  { id: 'v9', matricule: 'I-4567-MA', type: 'moto', brand: 'Ducati', model: 'Monster 821', fuelType: 'gasoline', fuelCapacity: 16, currentFuelLevel: 11, odometer: 25600, totalDistance: 25600, avgConsumption: 5.3, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(150), zone: 'Marrakech', position: { lat: 31.6340, lng: -8.0080 } },
  { id: 'v10', matricule: 'J-8901-MA', type: 'moto', brand: 'Harley-Davidson', model: 'Street Glide', fuelType: 'gasoline', fuelCapacity: 22, currentFuelLevel: 20, odometer: 78900, totalDistance: 78900, avgConsumption: 6.2, status: 'offline', lastOnline: daysAgo(8), gpsInstallDate: daysAgo(700), zone: 'Tanger', position: { lat: 35.7672, lng: -5.7998 } },
  { id: 'v11', matricule: 'K-2345-MA', type: 'moto', brand: 'Honda', model: 'CB500X', fuelType: 'gasoline', fuelCapacity: 17, currentFuelLevel: 9, odometer: 38700, totalDistance: 38700, avgConsumption: 3.9, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(240), zone: 'Fès', position: { lat: 34.0331, lng: -4.9998 } },
  { id: 'v12', matricule: 'L-6789-MA', type: 'moto', brand: 'Yamaha', model: 'Ténéré 700', fuelType: 'gasoline', fuelCapacity: 16, currentFuelLevel: 13, odometer: 29800, totalDistance: 29800, avgConsumption: 4.1, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(190), zone: 'Agadir', position: { lat: 30.4202, lng: -9.5832 } },
  { id: 'v13', matricule: 'M-0123-MA', type: 'moto', brand: 'Suzuki', model: 'V-Strom 650', fuelType: 'gasoline', fuelCapacity: 20, currentFuelLevel: 6, odometer: 56400, totalDistance: 56400, avgConsumption: 4.4, status: 'stopped', lastOnline: hoursAgo(12), gpsInstallDate: daysAgo(400), zone: 'Casablanca', position: { lat: 33.5500, lng: -7.6200 } },
  { id: 'v14', matricule: 'N-4567-MA', type: 'moto', brand: 'BMW', model: 'F850 GS', fuelType: 'gasoline', fuelCapacity: 15, currentFuelLevel: 12, odometer: 41200, totalDistance: 41200, avgConsumption: 4.6, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(300), zone: 'Rabat', position: { lat: 34.0132, lng: -6.8326 } },
  { id: 'v15', matricule: 'O-8901-MA', type: 'moto', brand: 'Kawasaki', model: 'Versys 1000', fuelType: 'gasoline', fuelCapacity: 21, currentFuelLevel: 15, odometer: 62100, totalDistance: 62100, avgConsumption: 5.4, status: 'offline', lastOnline: daysAgo(35), gpsInstallDate: daysAgo(500), zone: 'Marrakech', position: { lat: 31.6500, lng: -7.9500 } },

  // Véhicules légers (25)
  { id: 'v16', matricule: 'P-1234-MA', type: 'car', brand: 'Renault', model: 'Clio', fuelType: 'diesel', fuelCapacity: 45, currentFuelLevel: 32, odometer: 89500, totalDistance: 89500, avgConsumption: 5.2, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(400), zone: 'Casablanca', position: { lat: 33.5831, lng: -7.6114 } },
  { id: 'v17', matricule: 'Q-5678-MA', type: 'car', brand: 'Peugeot', model: '308', fuelType: 'diesel', fuelCapacity: 53, currentFuelLevel: 28, odometer: 112000, totalDistance: 112000, avgConsumption: 5.8, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(600), zone: 'Rabat', position: { lat: 33.9850, lng: -6.8540 } },
  { id: 'v18', matricule: 'R-9012-MA', type: 'car', brand: 'Volkswagen', model: 'Golf', fuelType: 'diesel', fuelCapacity: 50, currentFuelLevel: 40, odometer: 76800, totalDistance: 76800, avgConsumption: 5.5, status: 'stopped', lastOnline: hoursAgo(1), gpsInstallDate: daysAgo(350), zone: 'Marrakech', position: { lat: 31.6100, lng: -8.0200 } },
  { id: 'v19', matricule: 'S-3456-MA', type: 'car', brand: 'Dacia', model: 'Duster', fuelType: 'diesel', fuelCapacity: 50, currentFuelLevel: 15, odometer: 145000, totalDistance: 145000, avgConsumption: 6.2, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(800), zone: 'Tanger', position: { lat: 35.7800, lng: -5.8100 } },
  { id: 'v20', matricule: 'T-7890-MA', type: 'car', brand: 'Toyota', model: 'Corolla', fuelType: 'gasoline', fuelCapacity: 50, currentFuelLevel: 45, odometer: 58900, totalDistance: 58900, avgConsumption: 6.8, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(250), zone: 'Fès', position: { lat: 34.0400, lng: -4.9800 } },
  { id: 'v21', matricule: 'U-2345-MA', type: 'car', brand: 'Ford', model: 'Focus', fuelType: 'diesel', fuelCapacity: 52, currentFuelLevel: 22, odometer: 98700, totalDistance: 98700, avgConsumption: 5.4, status: 'offline', lastOnline: hoursAgo(20), gpsInstallDate: daysAgo(450), zone: 'Agadir', position: { lat: 30.4100, lng: -9.6100 } },
  { id: 'v22', matricule: 'V-6789-MA', type: 'car', brand: 'Hyundai', model: 'Tucson', fuelType: 'diesel', fuelCapacity: 54, currentFuelLevel: 48, odometer: 67200, totalDistance: 67200, avgConsumption: 6.5, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(300), zone: 'Casablanca', position: { lat: 33.5600, lng: -7.5700 } },
  { id: 'v23', matricule: 'W-0123-MA', type: 'car', brand: 'Kia', model: 'Sportage', fuelType: 'diesel', fuelCapacity: 54, currentFuelLevel: 30, odometer: 83400, totalDistance: 83400, avgConsumption: 6.3, status: 'stopped', lastOnline: hoursAgo(4), gpsInstallDate: daysAgo(380), zone: 'Rabat', position: { lat: 34.0050, lng: -6.8300 } },
  { id: 'v24', matricule: 'X-4567-MA', type: 'car', brand: 'Nissan', model: 'Qashqai', fuelType: 'diesel', fuelCapacity: 55, currentFuelLevel: 35, odometer: 92100, totalDistance: 92100, avgConsumption: 6.1, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(420), zone: 'Marrakech', position: { lat: 31.6200, lng: -7.9900 } },
  { id: 'v25', matricule: 'Y-8901-MA', type: 'car', brand: 'Citroën', model: 'C3', fuelType: 'gasoline', fuelCapacity: 45, currentFuelLevel: 18, odometer: 54300, totalDistance: 54300, avgConsumption: 5.9, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(220), zone: 'Tanger', position: { lat: 35.7500, lng: -5.8500 } },
  { id: 'v26', matricule: 'Z-2345-MA', type: 'car', brand: 'Opel', model: 'Astra', fuelType: 'diesel', fuelCapacity: 48, currentFuelLevel: 42, odometer: 78600, totalDistance: 78600, avgConsumption: 5.3, status: 'offline', lastOnline: daysAgo(2), gpsInstallDate: daysAgo(360), zone: 'Fès', position: { lat: 34.0250, lng: -5.0150 } },
  { id: 'v27', matricule: 'AA-6789-MA', type: 'car', brand: 'Seat', model: 'Leon', fuelType: 'diesel', fuelCapacity: 50, currentFuelLevel: 25, odometer: 65800, totalDistance: 65800, avgConsumption: 5.1, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(280), zone: 'Agadir', position: { lat: 30.4350, lng: -9.5900 } },
  { id: 'v28', matricule: 'AB-0123-MA', type: 'car', brand: 'Skoda', model: 'Octavia', fuelType: 'diesel', fuelCapacity: 55, currentFuelLevel: 50, odometer: 134500, totalDistance: 134500, avgConsumption: 5.6, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(650), zone: 'Casablanca', position: { lat: 33.5450, lng: -7.6400 } },
  { id: 'v29', matricule: 'AC-4567-MA', type: 'car', brand: 'Fiat', model: '500', fuelType: 'gasoline', fuelCapacity: 35, currentFuelLevel: 20, odometer: 42100, totalDistance: 42100, avgConsumption: 5.0, status: 'stopped', lastOnline: hoursAgo(8), gpsInstallDate: daysAgo(180), zone: 'Rabat', position: { lat: 33.9900, lng: -6.8650 } },
  { id: 'v30', matricule: 'AD-8901-MA', type: 'car', brand: 'Mercedes', model: 'Classe A', fuelType: 'diesel', fuelCapacity: 43, currentFuelLevel: 38, odometer: 56700, totalDistance: 56700, avgConsumption: 5.7, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(260), zone: 'Marrakech', position: { lat: 31.6450, lng: -7.9650 } },
  { id: 'v31', matricule: 'AE-2345-MA', type: 'car', brand: 'Audi', model: 'A3', fuelType: 'diesel', fuelCapacity: 50, currentFuelLevel: 12, odometer: 87300, totalDistance: 87300, avgConsumption: 5.4, status: 'offline', lastOnline: daysAgo(12), gpsInstallDate: daysAgo(420), zone: 'Tanger', position: { lat: 35.7650, lng: -5.8200 } },
  { id: 'v32', matricule: 'AF-6789-MA', type: 'car', brand: 'BMW', model: 'Serie 1', fuelType: 'diesel', fuelCapacity: 52, currentFuelLevel: 45, odometer: 72400, totalDistance: 72400, avgConsumption: 5.8, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(340), zone: 'Fès', position: { lat: 34.0150, lng: -4.9950 } },
  { id: 'v33', matricule: 'AG-0123-MA', type: 'car', brand: 'Renault', model: 'Megane', fuelType: 'diesel', fuelCapacity: 50, currentFuelLevel: 28, odometer: 105600, totalDistance: 105600, avgConsumption: 5.5, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(550), zone: 'Agadir', position: { lat: 30.4180, lng: -9.6050 } },
  { id: 'v34', matricule: 'AH-4567-MA', type: 'car', brand: 'Peugeot', model: '208', fuelType: 'gasoline', fuelCapacity: 44, currentFuelLevel: 35, odometer: 48900, totalDistance: 48900, avgConsumption: 5.2, status: 'stopped', lastOnline: hoursAgo(3), gpsInstallDate: daysAgo(200), zone: 'Casablanca', position: { lat: 33.5750, lng: -7.5950 } },
  { id: 'v35', matricule: 'AI-8901-MA', type: 'car', brand: 'Volkswagen', model: 'Polo', fuelType: 'gasoline', fuelCapacity: 40, currentFuelLevel: 22, odometer: 39700, totalDistance: 39700, avgConsumption: 5.4, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(170), zone: 'Rabat', position: { lat: 34.0080, lng: -6.8480 } },
  { id: 'v36', matricule: 'AJ-2345-MA', type: 'car', brand: 'Dacia', model: 'Sandero', fuelType: 'gasoline', fuelCapacity: 50, currentFuelLevel: 40, odometer: 67800, totalDistance: 67800, avgConsumption: 6.0, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(310), zone: 'Marrakech', position: { lat: 31.6380, lng: -8.0050 } },
  { id: 'v37', matricule: 'AK-6789-MA', type: 'car', brand: 'Toyota', model: 'Yaris', fuelType: 'gasoline', fuelCapacity: 42, currentFuelLevel: 15, odometer: 52300, totalDistance: 52300, avgConsumption: 5.1, status: 'offline', lastOnline: hoursAgo(48), gpsInstallDate: daysAgo(230), zone: 'Tanger', position: { lat: 35.7550, lng: -5.8350 } },
  { id: 'v38', matricule: 'AL-0123-MA', type: 'car', brand: 'Honda', model: 'Civic', fuelType: 'gasoline', fuelCapacity: 47, currentFuelLevel: 42, odometer: 61200, totalDistance: 61200, avgConsumption: 6.2, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(290), zone: 'Fès', position: { lat: 34.0280, lng: -5.0080 } },
  { id: 'v39', matricule: 'AM-4567-MA', type: 'car', brand: 'Mazda', model: 'CX-5', fuelType: 'diesel', fuelCapacity: 56, currentFuelLevel: 48, odometer: 78500, totalDistance: 78500, avgConsumption: 6.4, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(370), zone: 'Agadir', position: { lat: 30.4250, lng: -9.5950 } },
  { id: 'v40', matricule: 'AN-8901-MA', type: 'car', brand: 'Jeep', model: 'Compass', fuelType: 'diesel', fuelCapacity: 60, currentFuelLevel: 35, odometer: 94200, totalDistance: 94200, avgConsumption: 7.1, status: 'stopped', lastOnline: hoursAgo(6), gpsInstallDate: daysAgo(440), zone: 'Casablanca', position: { lat: 33.5680, lng: -7.6050 } },

  // Camions (8)
  { id: 'v41', matricule: 'AO-1234-MA', type: 'truck', brand: 'Mercedes', model: 'Actros', fuelType: 'diesel', fuelCapacity: 400, currentFuelLevel: 280, odometer: 456000, totalDistance: 456000, avgConsumption: 28.5, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(900), zone: 'Casablanca', position: { lat: 33.5400, lng: -7.6500 } },
  { id: 'v42', matricule: 'AP-5678-MA', type: 'truck', brand: 'Volvo', model: 'FH16', fuelType: 'diesel', fuelCapacity: 450, currentFuelLevel: 320, odometer: 523000, totalDistance: 523000, avgConsumption: 30.2, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(1000), zone: 'Rabat', position: { lat: 33.9950, lng: -6.8700 } },
  { id: 'v43', matricule: 'AQ-9012-MA', type: 'truck', brand: 'Scania', model: 'R500', fuelType: 'diesel', fuelCapacity: 400, currentFuelLevel: 150, odometer: 389000, totalDistance: 389000, avgConsumption: 27.8, status: 'stopped', lastOnline: hoursAgo(10), gpsInstallDate: daysAgo(750), zone: 'Marrakech', position: { lat: 31.6050, lng: -8.0300 } },
  { id: 'v44', matricule: 'AR-3456-MA', type: 'truck', brand: 'MAN', model: 'TGX', fuelType: 'diesel', fuelCapacity: 380, currentFuelLevel: 290, odometer: 612000, totalDistance: 612000, avgConsumption: 29.5, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(1200), zone: 'Tanger', position: { lat: 35.7720, lng: -5.8050 } },
  { id: 'v45', matricule: 'AS-7890-MA', type: 'truck', brand: 'DAF', model: 'XF', fuelType: 'diesel', fuelCapacity: 425, currentFuelLevel: 380, odometer: 478000, totalDistance: 478000, avgConsumption: 28.9, status: 'offline', lastOnline: daysAgo(3), gpsInstallDate: daysAgo(850), zone: 'Fès', position: { lat: 34.0350, lng: -4.9900 } },
  { id: 'v46', matricule: 'AT-2345-MA', type: 'truck', brand: 'Iveco', model: 'Stralis', fuelType: 'diesel', fuelCapacity: 390, currentFuelLevel: 200, odometer: 345000, totalDistance: 345000, avgConsumption: 27.2, status: 'moving', lastOnline: new Date(), gpsInstallDate: daysAgo(680), zone: 'Agadir', position: { lat: 30.4050, lng: -9.6200 } },
  { id: 'v47', matricule: 'AU-6789-MA', type: 'truck', brand: 'Renault', model: 'T High', fuelType: 'diesel', fuelCapacity: 400, currentFuelLevel: 350, odometer: 298000, totalDistance: 298000, avgConsumption: 26.8, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(580), zone: 'Casablanca', position: { lat: 33.5550, lng: -7.6300 } },
  { id: 'v48', matricule: 'AV-0123-MA', type: 'truck', brand: 'Mercedes', model: 'Arocs', fuelType: 'diesel', fuelCapacity: 350, currentFuelLevel: 180, odometer: 267000, totalDistance: 267000, avgConsumption: 32.5, status: 'stopped', lastOnline: hoursAgo(15), gpsInstallDate: daysAgo(500), zone: 'Rabat', position: { lat: 34.0000, lng: -6.8550 } },

  // Autres (2)
  { id: 'v49', matricule: 'AW-4567-MA', type: 'other', brand: 'John Deere', model: '6150R', fuelType: 'diesel', fuelCapacity: 340, currentFuelLevel: 250, odometer: 12500, totalDistance: 12500, avgConsumption: 15.2, status: 'online', lastOnline: new Date(), gpsInstallDate: daysAgo(400), zone: 'Marrakech', position: { lat: 31.5900, lng: -8.0500 }, driver: 'Ahmed Bennani' },
  { id: 'v50', matricule: 'AX-8901-MA', type: 'other', brand: 'Caterpillar', model: '140M', fuelType: 'diesel', fuelCapacity: 400, currentFuelLevel: 300, odometer: 8900, totalDistance: 8900, avgConsumption: 22.0, status: 'offline', lastOnline: daysAgo(5), gpsInstallDate: daysAgo(300), zone: 'Agadir', position: { lat: 30.3900, lng: -9.6300 }, driver: 'Youssef El Amrani' },
];

// Événements carburant (6 mois d'historique)
export const fuelEvents: FuelEvent[] = [
  { id: 'fe1', vehicleId: 'v16', date: daysAgo(1), type: 'refill', amount: 35, previousLevel: 10, newLevel: 45, odometer: 89500, location: 'Station Afriquia Casablanca' },
  { id: 'fe2', vehicleId: 'v16', date: daysAgo(7), type: 'consumption', amount: -25, previousLevel: 45, newLevel: 20, odometer: 89100 },
  { id: 'fe3', vehicleId: 'v16', date: daysAgo(14), type: 'refill', amount: 40, previousLevel: 8, newLevel: 48, odometer: 88700, location: 'Station Shell Ain Sebaa' },
  { id: 'fe4', vehicleId: 'v16', date: daysAgo(21), type: 'anomaly', amount: -15, previousLevel: 35, newLevel: 20, odometer: 88300 },
  { id: 'fe5', vehicleId: 'v19', date: daysAgo(2), type: 'refill', amount: 42, previousLevel: 8, newLevel: 50, odometer: 145000, location: 'Station Total Tanger' },
  { id: 'fe6', vehicleId: 'v19', date: daysAgo(10), type: 'consumption', amount: -30, previousLevel: 50, newLevel: 20, odometer: 144500 },
  { id: 'fe7', vehicleId: 'v19', date: daysAgo(18), type: 'refill', amount: 45, previousLevel: 5, newLevel: 50, odometer: 144000, location: 'Station Afriquia Tanger' },
  { id: 'fe8', vehicleId: 'v41', date: daysAgo(3), type: 'refill', amount: 250, previousLevel: 80, newLevel: 330, odometer: 456000, location: 'Station Petrom Casablanca' },
  { id: 'fe9', vehicleId: 'v41', date: daysAgo(5), type: 'consumption', amount: -120, previousLevel: 330, newLevel: 210, odometer: 455600 },
  { id: 'fe10', vehicleId: 'v41', date: daysAgo(8), type: 'refill', amount: 300, previousLevel: 100, newLevel: 400, odometer: 455200, location: 'Station Total Berrechid' },
  { id: 'fe11', vehicleId: 'v41', date: daysAgo(12), type: 'anomaly', amount: -80, previousLevel: 280, newLevel: 200, odometer: 454800 },
  { id: 'fe12', vehicleId: 'v1', date: daysAgo(4), type: 'refill', amount: 15, previousLevel: 3, newLevel: 18, odometer: 45230, location: 'Station Shell Casablanca' },
  { id: 'fe13', vehicleId: 'v22', date: daysAgo(6), type: 'refill', amount: 45, previousLevel: 10, newLevel: 55, odometer: 67200, location: 'Station Afriquia Casablanca' },
  { id: 'fe14', vehicleId: 'v42', date: daysAgo(9), type: 'refill', amount: 350, previousLevel: 100, newLevel: 450, odometer: 523000, location: 'Station Total Rabat' },
  { id: 'fe15', vehicleId: 'v5', date: daysAgo(11), type: 'anomaly', amount: -8, previousLevel: 20, newLevel: 12, odometer: 67800 },
];

// Alertes
export const alerts: Alert[] = [
  { id: 'a1', vehicleId: 'v16', type: 'fuel_anomaly', severity: 'high', message: 'Descente anormale de carburant détectée', date: daysAgo(1), resolved: false, details: 'Perte de 15L en 30 minutes sans déplacement' },
  { id: 'a2', vehicleId: 'v10', type: 'gps_disconnect', severity: 'medium', message: 'GPS déconnecté depuis 8 jours', date: daysAgo(8), resolved: false, details: 'Dernière position: Tanger' },
  { id: 'a3', vehicleId: 'v4', type: 'overspeed', severity: 'high', message: 'Excès de vitesse: 145 km/h', date: hoursAgo(3), resolved: true, details: 'Vitesse maximale autorisée: 120 km/h' },
  { id: 'a4', vehicleId: 'v41', type: 'fuel_anomaly', severity: 'high', message: 'Descente anormale de carburant', date: daysAgo(12), resolved: true, details: 'Perte de 80L détectée' },
  { id: 'a5', vehicleId: 'v15', type: 'gps_disconnect', severity: 'high', message: 'GPS hors ligne depuis 35 jours', date: daysAgo(35), resolved: false, details: 'Vérification requise' },
  { id: 'a6', vehicleId: 'v43', type: 'prolonged_stop', severity: 'low', message: 'Arrêt prolongé détecté', date: hoursAgo(10), resolved: false, details: 'Véhicule à l\'arrêt depuis 10 heures' },
  { id: 'a7', vehicleId: 'v19', type: 'geofence_exit', severity: 'medium', message: 'Sortie de zone autorisée', date: daysAgo(2), resolved: true, details: 'Sortie de la zone Tanger' },
  { id: 'a8', vehicleId: 'v22', type: 'overspeed', severity: 'medium', message: 'Excès de vitesse: 95 km/h en zone 50', date: daysAgo(3), resolved: true },
  { id: 'a9', vehicleId: 'v31', type: 'gps_disconnect', severity: 'high', message: 'GPS déconnecté depuis 12 jours', date: daysAgo(12), resolved: false },
  { id: 'a10', vehicleId: 'v5', type: 'fuel_anomaly', severity: 'medium', message: 'Consommation anormale détectée', date: daysAgo(11), resolved: false, details: 'Consommation 40% supérieure à la moyenne' },
  { id: 'a11', vehicleId: 'v37', type: 'gps_disconnect', severity: 'medium', message: 'GPS hors ligne depuis 48 heures', date: hoursAgo(48), resolved: false },
  { id: 'a12', vehicleId: 'v44', type: 'overspeed', severity: 'high', message: 'Excès de vitesse: 110 km/h (camion)', date: daysAgo(1), resolved: false, details: 'Vitesse max camion: 90 km/h' },
  { id: 'a13', vehicleId: 'v7', type: 'prolonged_stop', severity: 'low', message: 'Arrêt non planifié', date: hoursAgo(6), resolved: true },
  { id: 'a14', vehicleId: 'v26', type: 'gps_disconnect', severity: 'medium', message: 'GPS hors ligne depuis 2 jours', date: daysAgo(2), resolved: false },
  { id: 'a15', vehicleId: 'v50', type: 'gps_disconnect', severity: 'high', message: 'GPS déconnecté depuis 5 jours', date: daysAgo(5), resolved: false },
];

// Maintenances
export const maintenances: Maintenance[] = [
  { id: 'm1', vehicleId: 'v16', type: 'oil_change', status: 'completed', plannedDate: daysAgo(30), completedDate: daysAgo(28), odometer: 88000, cost: 850, description: 'Vidange + filtre à huile', isPlanned: true },
  { id: 'm2', vehicleId: 'v41', type: 'tire_change', status: 'completed', plannedDate: daysAgo(15), completedDate: daysAgo(14), odometer: 450000, cost: 24000, description: 'Remplacement 6 pneus', isPlanned: true },
  { id: 'm3', vehicleId: 'v22', type: 'brake_service', status: 'in_progress', plannedDate: daysAgo(2), odometer: 67000, cost: 1500, description: 'Remplacement plaquettes avant', isPlanned: true },
  { id: 'm4', vehicleId: 'v19', type: 'general_inspection', status: 'planned', plannedDate: daysAgo(-7), odometer: 145000, cost: 500, description: 'Contrôle technique annuel', isPlanned: true },
  { id: 'm5', vehicleId: 'v1', type: 'repair', status: 'completed', plannedDate: daysAgo(45), completedDate: daysAgo(44), odometer: 44500, cost: 1200, description: 'Réparation chaîne de transmission', isPlanned: false },
  { id: 'm6', vehicleId: 'v42', type: 'oil_change', status: 'planned', plannedDate: daysAgo(-14), odometer: 525000, cost: 2500, description: 'Vidange complète + filtres', isPlanned: true },
  { id: 'm7', vehicleId: 'v5', type: 'repair', status: 'completed', plannedDate: daysAgo(20), completedDate: daysAgo(18), odometer: 67000, cost: 3500, description: 'Réparation boîte de vitesses', isPlanned: false },
  { id: 'm8', vehicleId: 'v44', type: 'brake_service', status: 'completed', plannedDate: daysAgo(60), completedDate: daysAgo(58), odometer: 610000, cost: 8500, description: 'Révision complète système de freinage', isPlanned: true },
  { id: 'm9', vehicleId: 'v28', type: 'tire_change', status: 'planned', plannedDate: daysAgo(-21), odometer: 136000, cost: 2800, description: 'Remplacement 4 pneus hiver', isPlanned: true },
  { id: 'm10', vehicleId: 'v33', type: 'general_inspection', status: 'in_progress', plannedDate: daysAgo(1), odometer: 105600, cost: 450, description: 'Révision des 100 000 km', isPlanned: true },
  { id: 'm11', vehicleId: 'v7', type: 'other', status: 'completed', plannedDate: daysAgo(90), completedDate: daysAgo(88), odometer: 32000, cost: 650, description: 'Remplacement batterie', isPlanned: false },
  { id: 'm12', vehicleId: 'v46', type: 'oil_change', status: 'planned', plannedDate: daysAgo(-3), odometer: 350000, cost: 2200, description: 'Vidange moteur + boîte', isPlanned: true },
];

// Helpers pour les statistiques
export const getVehicleById = (id: string) => vehicles.find(v => v.id === id);

export const getVehiclesByType = (type: VehicleType) => vehicles.filter(v => v.type === type);

export const getVehiclesByZone = (zone: string) => vehicles.filter(v => v.zone === zone);

export const getVehiclesByStatus = (status: VehicleStatus) => vehicles.filter(v => v.status === status);

export const getOnlineVehicles = () => vehicles.filter(v => v.status === 'online' || v.status === 'moving');

export const getOfflineVehicles = () => vehicles.filter(v => v.status === 'offline');

export const getAlertsForVehicle = (vehicleId: string) => alerts.filter(a => a.vehicleId === vehicleId);

export const getMaintenancesForVehicle = (vehicleId: string) => maintenances.filter(m => m.vehicleId === vehicleId);

export const getFuelEventsForVehicle = (vehicleId: string) => fuelEvents.filter(f => f.vehicleId === vehicleId);
