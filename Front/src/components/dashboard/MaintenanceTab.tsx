import { useLanguage } from '@/contexts/LanguageContext';
import { maintenances, getVehicleById } from '@/data/vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

const MaintenanceTab = () => {
  const { t } = useLanguage();

  const plannedCount = maintenances.filter(m => m.isPlanned).length;
  const unplannedCount = maintenances.filter(m => !m.isPlanned).length;
  const totalCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
  const upcomingCount = maintenances.filter(m => m.status === 'planned').length;

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      oil_change: t.maintenance.oilChange,
      tire_change: t.maintenance.tireChange,
      brake_service: t.maintenance.brakeService,
      general_inspection: t.maintenance.generalInspection,
      repair: t.maintenance.repair,
      other: t.maintenance.otherMaintenance,
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planned: t.maintenance.planned,
      in_progress: t.maintenance.inProgress,
      completed: t.maintenance.completed,
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'completed') return 'secondary';
    if (status === 'in_progress') return 'default';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.maintenance.plannedMaintenance}</p>
                <p className="text-3xl font-bold">{plannedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.maintenance.unplannedMaintenance}</p>
                <p className="text-3xl font-bold">{unplannedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.maintenance.totalCost}</p>
                <p className="text-2xl font-bold">{totalCost.toLocaleString()} MAD</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.maintenance.upcoming}</p>
                <p className="text-3xl font-bold text-info">{upcomingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-info flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.maintenance.maintenanceList}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenances.map((maintenance) => {
              const vehicle = getVehicleById(maintenance.vehicleId);
              return (
                <div key={maintenance.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getMaintenanceTypeLabel(maintenance.type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle?.matricule} • {vehicle?.brand} {vehicle?.model}
                      </p>
                      <p className="text-sm text-muted-foreground">{maintenance.description}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={getStatusVariant(maintenance.status)}>
                      {getStatusLabel(maintenance.status)}
                    </Badge>
                    <p className="font-bold">{maintenance.cost.toLocaleString()} MAD</p>
                    <p className="text-sm text-muted-foreground">{format(maintenance.plannedDate, 'dd/MM/yyyy')}</p>
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

export default MaintenanceTab;
