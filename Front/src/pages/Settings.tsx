import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zones } from '@/data/vehicles';

const Settings = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">{t.settings.title}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.zones}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="font-medium">{zone.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.preferences}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t.settings.language}</span>
                <span className="font-medium">Français / English</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.settings.theme}</span>
                <span className="font-medium">Light</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.settings.notifications}</span>
                <span className="font-medium">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
