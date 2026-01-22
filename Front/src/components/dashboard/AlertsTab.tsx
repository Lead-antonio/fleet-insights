import { useLanguage } from '@/contexts/LanguageContext';
import { alerts, getVehicleById } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Fuel, Wifi, Gauge, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const AlertsTab = () => {
  const { t } = useLanguage();

  const alertCounts = {
    fuel_anomaly: alerts.filter(a => a.type === 'fuel_anomaly').length,
    gps_disconnect: alerts.filter(a => a.type === 'gps_disconnect').length,
    overspeed: alerts.filter(a => a.type === 'overspeed').length,
    prolonged_stop: alerts.filter(a => a.type === 'prolonged_stop').length,
    geofence_exit: alerts.filter(a => a.type === 'geofence_exit').length,
  };

  const mostFrequent = Object.entries(alertCounts).sort((a, b) => b[1] - a[1])[0];
  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  const getAlertIcon = (type: string) => {
    const icons: Record<string, any> = {
      fuel_anomaly: Fuel,
      gps_disconnect: Wifi,
      overspeed: Gauge,
      prolonged_stop: Clock,
      geofence_exit: MapPin,
    };
    return icons[type] || AlertTriangle;
  };

  const getAlertLabel = (type: string) => {
    const labels: Record<string, string> = {
      fuel_anomaly: t.alerts.fuelAnomaly,
      gps_disconnect: t.alerts.gpsDisconnect,
      overspeed: t.alerts.overspeed,
      prolonged_stop: t.alerts.prolongedStop,
      geofence_exit: t.alerts.geofenceExit,
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.alerts.mostFrequent}</p>
                <p className="text-lg font-bold">{getAlertLabel(mostFrequent[0])}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.alerts.totalAlerts}</p>
                <p className="text-3xl font-bold">{alerts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.alerts.unresolvedAlerts}</p>
                <p className="text-3xl font-bold text-destructive">{unresolvedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.alerts.resolved}</p>
                <p className="text-3xl font-bold text-success">{alerts.length - unresolvedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.alerts.alertList}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const vehicle = getVehicleById(alert.vehicleId);
              const Icon = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      alert.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                      alert.severity === 'medium' ? 'bg-warning/20 text-warning' :
                      'bg-info/20 text-info'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle?.matricule} • {vehicle?.brand} {vehicle?.model}
                      </p>
                      {alert.details && (
                        <p className="text-sm text-muted-foreground mt-1">{alert.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                      {alert.resolved ? t.alerts.resolved : t.alerts.unresolved}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{format(alert.date, 'dd/MM/yyyy HH:mm')}</p>
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

export default AlertsTab;
