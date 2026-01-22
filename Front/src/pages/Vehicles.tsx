import { useLanguage } from '@/contexts/LanguageContext';
import { vehicles } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Car, Bike, Truck } from 'lucide-react';
import { useState } from 'react';

const Vehicles = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredVehicles = vehicles.filter(v =>
    v.matricule.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    if (type === 'moto') return Bike;
    if (type === 'truck') return Truck;
    return Car;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t.nav.vehicles}</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => {
          const Icon = getTypeIcon(vehicle.type);
          return (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      vehicle.status === 'online' || vehicle.status === 'moving' ? 'bg-success/20 text-success' :
                      vehicle.status === 'offline' ? 'bg-destructive/20 text-destructive' :
                      'bg-warning/20 text-warning'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">{vehicle.matricule}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                  <Badge variant={vehicle.status === 'offline' ? 'destructive' : 'secondary'} className="capitalize">
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Zone</p>
                    <p className="font-medium">{vehicle.zone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.fleet.odometer}</p>
                    <p className="font-medium">{vehicle.odometer.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.fleet.fuelLevel}</p>
                    <p className="font-medium">{vehicle.currentFuelLevel}L / {vehicle.fuelCapacity}L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.fleet.avgConsumption}</p>
                    <p className="font-medium">{vehicle.avgConsumption} L/100km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Vehicles;
