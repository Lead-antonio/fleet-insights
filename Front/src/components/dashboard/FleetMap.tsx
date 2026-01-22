import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle } from '@/data/vehicles';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerIcon = (status: string) => {
  const colors: Record<string, string> = {
    online: '#22c55e',
    moving: '#3b82f6',
    stopped: '#f59e0b',
    offline: '#ef4444',
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="vehicle-marker ${status}" style="background: ${colors[status] || colors.offline};">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface FleetMapProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  selectedVehicle: Vehicle | null;
}

const MapController = ({ selectedVehicle }: { selectedVehicle: Vehicle | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedVehicle) {
      map.setView([selectedVehicle.position.lat, selectedVehicle.position.lng], 12);
    }
  }, [selectedVehicle, map]);
  
  return null;
};

const FleetMap = ({ vehicles, onVehicleClick, selectedVehicle }: FleetMapProps) => {
  const center: [number, number] = [32.5, -6.5]; // Center of Morocco
  
  return (
    <MapContainer center={center} zoom={6} className="h-full w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController selectedVehicle={selectedVehicle} />
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.position.lat, vehicle.position.lng]}
          icon={getMarkerIcon(vehicle.status)}
          eventHandlers={{
            click: () => onVehicleClick(vehicle),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{vehicle.matricule}</p>
              <p>{vehicle.brand} {vehicle.model}</p>
              <p className="capitalize">{vehicle.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FleetMap;
