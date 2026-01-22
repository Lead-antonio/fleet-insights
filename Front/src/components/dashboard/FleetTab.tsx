import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { vehicles, zones, Vehicle } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Bike, Truck, HelpCircle, Wifi, WifiOff, Navigation, Square } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import FleetMap from './FleetMap';
import VehicleDetails from './VehicleDetails';

const FleetTab = () => {
  const { t } = useLanguage();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const stats = {
    total: vehicles.length,
    online: vehicles.filter(v => v.status === 'online' || v.status === 'moving').length,
    offline: vehicles.filter(v => v.status === 'offline').length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    stopped: vehicles.filter(v => v.status === 'stopped').length,
  };

  const typeData = [
    { name: t.fleet.moto, value: vehicles.filter(v => v.type === 'moto').length, color: 'hsl(var(--fleet-moto))' },
    { name: t.fleet.car, value: vehicles.filter(v => v.type === 'car').length, color: 'hsl(var(--fleet-car))' },
    { name: t.fleet.truck, value: vehicles.filter(v => v.type === 'truck').length, color: 'hsl(var(--fleet-truck))' },
    { name: t.fleet.other, value: vehicles.filter(v => v.type === 'other').length, color: 'hsl(var(--fleet-other))' },
  ];

  const zoneData = zones.map(zone => ({
    name: zone.name,
    value: vehicles.filter(v => v.zone === zone.name).length,
    color: zone.color,
  }));

  const kpiCards = [
    { label: t.fleet.totalVehicles, value: stats.total, icon: Car, color: 'bg-primary' },
    { label: t.fleet.online, value: stats.online, icon: Wifi, color: 'bg-success' },
    { label: t.fleet.offline, value: stats.offline, icon: WifiOff, color: 'bg-destructive' },
    { label: t.fleet.moving, value: stats.moving, icon: Navigation, color: 'bg-info' },
    { label: t.fleet.stopped, value: stats.stopped, icon: Square, color: 'bg-warning' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Map */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t.fleet.byType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {typeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {typeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t.fleet.byZone}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={zoneData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {zoneData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {zoneData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t.fleet.location}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px]">
              <FleetMap vehicles={vehicles} onVehicleClick={setSelectedVehicle} selectedVehicle={selectedVehicle} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Details */}
      {selectedVehicle && (
        <VehicleDetails vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
    </div>
  );
};

export default FleetTab;
