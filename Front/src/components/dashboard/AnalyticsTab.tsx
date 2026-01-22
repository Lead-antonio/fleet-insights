import { useLanguage } from '@/contexts/LanguageContext';
import { vehicles, maintenances, fuelEvents, alerts } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AnalyticsTab = () => {
  const { t } = useLanguage();

  const onlineCount = vehicles.filter(v => v.status === 'online' || v.status === 'moving').length;
  const offlineCount = vehicles.filter(v => v.status === 'offline').length;
  const fuelCost = fuelEvents.filter(e => e.type === 'refill').reduce((sum, e) => sum + e.amount * 12, 0);
  const maintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
  const anomalyRate = ((alerts.filter(a => a.type === 'fuel_anomaly').length / alerts.length) * 100).toFixed(1);

  const costData = [
    { month: 'Jan', fuel: 45000, maintenance: 12000 },
    { month: 'Fév', fuel: 52000, maintenance: 8000 },
    { month: 'Mar', fuel: 48000, maintenance: 15000 },
    { month: 'Avr', fuel: 55000, maintenance: 22000 },
    { month: 'Mai', fuel: 51000, maintenance: 9000 },
    { month: 'Jun', fuel: 58000, maintenance: 18000 },
  ];

  const typeComparison = [
    { type: 'Moto', fuel: 15, maintenance: 5 },
    { type: 'Voiture', fuel: 45, maintenance: 35 },
    { type: 'Camion', fuel: 35, maintenance: 55 },
    { type: 'Autre', fuel: 5, maintenance: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.analytics.onlineVehicles}</p>
                <p className="text-3xl font-bold text-success">{onlineCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.analytics.offlineVehicles}</p>
                <p className="text-3xl font-bold text-destructive">{offlineCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.analytics.costAnalysis}</p>
                <p className="text-2xl font-bold">{(fuelCost + maintenanceCost).toLocaleString()} MAD</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.analytics.anomalyRate}</p>
                <p className="text-3xl font-bold text-warning">{anomalyRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.costEvolution}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="fuel" stroke="hsl(var(--primary))" strokeWidth={2} name={t.analytics.fuelCosts} />
                  <Line type="monotone" dataKey="maintenance" stroke="hsl(var(--warning))" strokeWidth={2} name={t.analytics.maintenanceCosts} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.byVehicleType}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuel" fill="hsl(var(--primary))" name={t.analytics.fuelCosts} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maintenance" fill="hsl(var(--warning))" name={t.analytics.maintenanceCosts} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
