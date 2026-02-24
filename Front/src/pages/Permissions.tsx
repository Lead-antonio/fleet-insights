import { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck, Pencil, Trash2, Plus, Loader2,
  LayoutGrid, KeyRound, Search,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  permissionsService,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@/services/permissions.service';
import { Permission } from '@/types/roles.types';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getModule = (name: string) => name.split('.')[0] ?? name;
const getAction = (name: string) => name.split('.')[1] ?? name;

// ─── Composant ──────────────────────────────────────────────────────────────
export default function Permissions() {

  const {t} = useLanguage();
  // ── State données ──────────────────────────────────────────────────────────
  const [permissions, setPermissions]     = useState<Permission[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [submitting, setSubmitting]       = useState(false);

  // ── State modals ───────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen]               = useState(false);
  const [editPermission, setEditPermission]       = useState<Permission | null>(null);
  const [deletePermission, setDeletePermission]   = useState<Permission | null>(null);

  // ── State formulaires ──────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState<CreatePermissionDto>({ name: '', description: '' });
  const [editForm, setEditForm]     = useState<UpdatePermissionDto>({ name: '', description: '' });

  // ── Stats dynamiques ───────────────────────────────────────────────────────
  const totalPermissions = permissions.length;
  const modules          = [...new Set(permissions.map((p) => getModule(p.name)))];
  const totalModules     = modules.length;
  const avgPerModule     = totalModules > 0 ? (totalPermissions / totalModules).toFixed(1) : '0';

  // ── Filtrage recherche ─────────────────────────────────────────────────────
  const filtered = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  // ── FETCH ALL ──────────────────────────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await permissionsService.findAll();
      setPermissions(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors du chargement des permissions', {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  // ── CREATE ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    try {
      setSubmitting(true);
      await permissionsService.create(createForm);
      await fetchPermissions();
      setCreateOpen(false);
      setCreateForm({ name: '', description: '' });
      toast.success('Permission créée avec succès', {
        style: { background: '#22c55e', color: 'white', border: '1px solid #16a34a' },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la création', {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── EDIT ───────────────────────────────────────────────────────────────────
  const openEdit = (perm: Permission) => {
    setEditPermission(perm);
    setEditForm({ name: perm.name, description: perm.description ?? '' });
  };

  const handleEdit = async () => {
    if (!editPermission || !editForm.name?.trim()) return;
    try {
      setSubmitting(true);
      await permissionsService.update(editPermission.id, editForm);
      await fetchPermissions();
      setEditPermission(null);
      toast.success('Permission mise à jour', {
        style: { background: '#22c55e', color: 'white', border: '1px solid #16a34a' },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la modification', {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletePermission) return;
    try {
      setSubmitting(true);
      await permissionsService.remove(deletePermission.id);
      await fetchPermissions();
      setDeletePermission(null);
      toast.success('Permission supprimée', {
        style: { background: '#22c55e', color: 'white', border: '1px solid #16a34a' },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la suppression', {
        style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.permissions?.title ?? 'Permissions'}</h1>
          <p className="text-muted-foreground">{t.permissions?.subtitle ?? 'Gérez les permissions du système'}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.permissions?.create ?? 'Nouvelle permission'}
        </Button>
      </div>

      {/* ── Card Statistiques ── */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">{t.permissions?.statistics ?? 'Statistiques'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total permissions</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalPermissions}
              </span>
            </div>
            <KeyRound className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/10">
              <LayoutGrid className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total modules</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalModules}
              </span>
            </div>
            <LayoutGrid className="absolute -right-3 -bottom-3 w-16 h-16 text-amber-500/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/10">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Moy. par module</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : avgPerModule}
              </span>
            </div>
            <ShieldCheck className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-500/5" />
          </div>

        </div>
      </div>

      {/* ── Card Tableau ── */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.permissions?.search ?? 'Rechercher une permission...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Chargement des permissions...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.permissions?.name ?? 'Nom'}</TableHead>
                <TableHead>{t.permissions?.module ?? 'Module'}</TableHead>
                <TableHead>{t.common?.actions ?? 'Action'}</TableHead>
                <TableHead>{t.permissions?.description ?? 'Description'}</TableHead>
                <TableHead className="text-center">{t.permissions?.actions ?? 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Aucune permission trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="font-medium font-mono text-sm">{perm.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{getModule(perm.name)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{getAction(perm.name)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {perm.description ?? '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(perm)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletePermission(perm)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Modal Créer ── */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); setCreateForm({ name: '', description: '' }); } }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {t.permissions?.createTitle ?? 'Nouvelle permission'}
            </DialogTitle>
            <DialogDescription>
              {t.permissions?.createDesc ?? 'Utilisez le format module.action (ex: user.create)'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>
                {t.permissions?.name ?? 'Nom'} <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="ex: user.create"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.permissions?.description ?? 'Description'}</Label>
              <Input
                placeholder="ex: Créer un utilisateur"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !createForm.name.trim()} className="gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Éditer ── */}
      <Dialog open={!!editPermission} onOpenChange={(open) => { if (!open) setEditPermission(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              {t.permissions?.editTitle ?? 'Modifier la permission'}
            </DialogTitle>
            <DialogDescription>ID : #{editPermission?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>
                {t.permissions?.name ?? 'Nom'} <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="ex: user.create"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.permissions?.description ?? 'Description'}</Label>
              <Input
                placeholder="ex: Créer un utilisateur"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditPermission(null)} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={submitting || !editForm.name?.trim()} className="gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog Supprimer ── */}
      <AlertDialog open={!!deletePermission} onOpenChange={(open) => { if (!open) setDeletePermission(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Supprimer la permission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-mono font-semibold text-foreground">{deletePermission?.name}</span> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive hover:bg-destructive/90 gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}