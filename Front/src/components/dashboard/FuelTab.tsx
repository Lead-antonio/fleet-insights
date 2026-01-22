import { useLanguage } from '@/contexts/LanguageContext';
import { fuelEvents, vehicles, getVehicleById } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, TrendingDown, Activity, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const FuelTab = () => {
  const { t } = useLanguage();

  const totalAdded = fuelEvents.filter(e => e.type === 'refill').reduce((sum, e) => sum + e.amount, 0);
  const anomalies = fuelEvents.filter(e => e.type === 'anomaly').length;
  const avgConsumption = vehicles.reduce((sum, v) => sum + v.avgConsumption, 0) / vehicles.length;

  const chartData = fuelEvents
    .filter(e => e.type === 'refill')
    .slice(0, 10)
    .map(e => ({
      date: format(e.date, 'dd/MM'),
      amount: e.amount,
      vehicle: getVehicleById(e.vehicleId)?.matricule || '',
    }));

  const kpiCards = [
    { label: t.fuel.totalAdded, value: `${totalAdded.toLocaleString()} L`, icon: Fuel, color: 'bg-primary' },
    { label: t.fuel.abnormalDrops, value: anomalies, icon: TrendingDown, color: 'bg-destructive' },
    { label: t.fuel.avgConsumption, value: `${avgConsumption.toFixed(1)} L/100km`, icon: Activity, color: 'bg-info' },
    { label: t.fuel.todayConsumption, value: '1,250 L', icon: Droplets, color: 'bg-warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.fuel.refillHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.fuel.refillHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fuelEvents.slice(0, 8).map((event) => {
              const vehicle = getVehicleById(event.vehicleId);
              return (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.type === 'refill' ? 'bg-success/20 text-success' :
                      event.type === 'anomaly' ? 'bg-destructive/20 text-destructive' :
                      'bg-warning/20 text-warning'
                    }`}>
                      <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{vehicle?.matricule}</p>
                      <p className="text-sm text-muted-foreground">{event.location || t.fuel[event.type as keyof typeof t.fuel]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${event.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                      {event.amount > 0 ? '+' : ''}{event.amount} L
                    </p>
                    <p className="text-sm text-muted-foreground">{format(event.date, 'dd/MM/yyyy')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelTab;
