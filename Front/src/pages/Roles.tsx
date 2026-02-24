import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Shield, UserCircle, Pencil, BarChart2, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { Role } from '@/types/roles.types';
import { rolesService } from '@/services/roles.service';
import { toast } from '@/components/ui/sonner';


const groupPermissionsByModule = (permissions: Role['permissions']) => {
  return permissions.reduce((acc, perm) => {
    const [module, action] = perm.name.split('.');
    if (!acc[module]) acc[module] = [];
    acc[module].push({ action, ...perm });
    return acc;
  }, {} as Record<string, Array<{ action: string; id: number; name: string; description: string | null }>>);
};


// determine which badge variant should be used for a given role name
// you can expand the map with more roles or compute a colour dynamically
const getBadgeVariant = (name: string):
  | "default"
  | "secondary"
  | "destructive"
  | "outline" => {
  const key = name.toLowerCase();
  switch (key) {
    case "administrateur":
      return "default";
    case "utilisateur":
    case "user":
      return "secondary";
    case "root":
    case "manager":
      return "destructive";
    default:
      return "outline";
  }
};

export default function Roles() {
  const {t} = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const currentRole = roles.find((r) => r.id === selectedRole) ?? null;
  const groupedPermissions = currentRole ? groupPermissionsByModule(currentRole.permissions) : {};


  const totalRoles = roles.length;
  const totalPermissions = roles.reduce((acc, r) => acc + r.permissions.length, 0);
  const avgPermissions = totalRoles > 0 ? (totalPermissions / totalRoles).toFixed(1) : '0';

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rolesService.findAll();
      setRoles(data.response);
    } catch (err: any) {
      toast.error(t.roles?.[err.response?.data?.message] ?? 'Erreur lors du chargement des rôles', {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' },
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t.roles.title}</h1>
        <p className="text-muted-foreground">{t.roles.subtitle}</p>
      </div>

      {/* Card Statistiques */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">{t.roles.statistics ?? 'Statistiques'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Total rôles */}
          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total rôles</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalRoles}
              </span>
            </div>
            <Users className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/5" />
          </div>

          {/* Permissions moyennes */}
          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/10">
              <BarChart2 className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Permissions moyennes</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : avgPermissions}
              </span>
            </div>
            <BarChart2 className="absolute -right-3 -bottom-3 w-16 h-16 text-amber-500/5" />
          </div>

          {/* Permissions totales */}
          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/10">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Permissions totales</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalPermissions}
              </span>
            </div>
            <ShieldCheck className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-500/5" />
          </div>

        </div>
      </div>

      {/* Card Tableau */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Chargement des rôles...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.roles.roleName}</TableHead>
                <TableHead>{t.roles.totalPermissions}</TableHead>
                <TableHead>{t.roles.createdAt}</TableHead>
                <TableHead className="text-center">{t.roles.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Aucun rôle trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {role.name === 'Administrateur' ? (
                          <Shield className="w-4 h-4 text-primary" />
                        ) : (
                          <UserCircle className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium capitalize">{role.name.toLowerCase()}</span>
                            <Badge variant={getBadgeVariant(role.name)} className="text-xs">
                          {role.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Badge variant="outline">{role.permissions.length}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedRole(role.id)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal détail rôle */}
      <Dialog open={!!selectedRole} onOpenChange={(open) => !open && setSelectedRole(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentRole?.name === 'Administrateur' ? (
                <Shield className="w-5 h-5 text-primary" />
              ) : (
                <UserCircle className="w-5 h-5 text-primary" />
              )}
              {t.roles.editRole} — {currentRole?.name}
            </DialogTitle>
            <DialogDescription>
              {currentRole?.permissions.length} permission(s) assignée(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <div key={module} className="space-y-3">
                <h4 className="font-semibold text-sm capitalize">{module}</h4>
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between py-1">
                      <Label className="text-sm text-muted-foreground">
                        {perm.description ?? perm.action}
                      </Label>
                      <Switch checked={true} disabled />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

