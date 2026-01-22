import { useLanguage } from '@/contexts/LanguageContext';
import { Vehicle } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Fuel, Gauge, MapPin, Calendar, Car } from 'lucide-react';
import { format } from 'date-fns';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const VehicleDetails = ({ vehicle, onClose }: VehicleDetailsProps) => {
  const { t } = useLanguage();

  const fuelPercentage = (vehicle.currentFuelLevel / vehicle.fuelCapacity) * 100;

  return (
    <Card className="animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{t.fleet.vehicleDetails}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{vehicle.matricule}</p>
                <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.fleet.vehicleType}</span>
                <span className="font-medium capitalize">{t.fleet[vehicle.type as keyof typeof t.fleet]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.fleet.fuelType}</span>
                <span className="font-medium">{vehicle.fuelType === 'diesel' ? t.fleet.diesel : t.fleet.gasoline}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Gauge className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicle.odometer.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t.fleet.odometer} (km)</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.fleet.totalDistance}</span>
                <span className="font-medium">{vehicle.totalDistance.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.fleet.avgConsumption}</span>
                <span className="font-medium">{vehicle.avgConsumption} L/100km</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Fuel className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicle.currentFuelLevel}L</p>
                <p className="text-sm text-muted-foreground">{t.fleet.fuelLevel}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-warning rounded-full transition-all"
                  style={{ width: `${fuelPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.fleet.tankCapacity}</span>
                <span className="font-medium">{vehicle.fuelCapacity}L</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-bold">{vehicle.zone}</p>
                <p className="text-sm text-muted-foreground">{t.fleet.location}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.fleet.gpsInstallDate}</span>
                <span className="font-medium">{format(vehicle.gpsInstallDate, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.fleet.lastOnline}</span>
                <span className="font-medium">{format(vehicle.lastOnline, 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleDetails;
