import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Fuel, AlertTriangle, Wrench, BarChart3 } from 'lucide-react';
import FleetTab from '@/components/dashboard/FleetTab';
import FuelTab from '@/components/dashboard/FuelTab';
import AlertsTab from '@/components/dashboard/AlertsTab';
import MaintenanceTab from '@/components/dashboard/MaintenanceTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';

const Dashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('fleet');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.nav.dashboard}</h1>
        <p className="text-muted-foreground">Fleet Master - {t.tabs.fleet}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid gap-1 h-auto p-1 bg-muted">
          <TabsTrigger value="fleet" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabs.fleet}</span>
          </TabsTrigger>
          <TabsTrigger value="fuel" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Fuel className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabs.fuel}</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabs.alerts}</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabs.maintenance}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabs.analytics}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet"><FleetTab /></TabsContent>
        <TabsContent value="fuel"><FuelTab /></TabsContent>
        <TabsContent value="alerts"><AlertsTab /></TabsContent>
        <TabsContent value="maintenance"><MaintenanceTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
