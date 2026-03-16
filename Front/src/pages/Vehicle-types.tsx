import { useState, useMemo, useEffect } from "react";
import {
  Car, Wrench, Search, Plus,
  Pencil, Trash2, Eye, X, Loader2,
  ChevronLeft, ChevronRight, AlertTriangle, Bike,
  Truck,
  Zap,
  Tractor,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VehiculeType {
  id: number;
  label: string;
  description: string | null;
  vehicules: { id: number; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getVehicleIcon = (label) => {
  const type = label.toLowerCase();

  if (type.includes("moto")) return <Bike size={16} />;
  if (type.includes("voiture") || type.includes("plaisir") || type.includes("légère")) return <Car size={16} />;
  if (type.includes("camion")) return <Truck size={16} />;
  if (type.includes("engin")) return <Tractor size={16} />;
  if (type.includes("groupe")) return <Zap size={16} />;

  return null;
};

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-sky-500/20 text-sky-600 dark:text-sky-400",
  "bg-violet-500/20 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  "bg-rose-500/20 text-rose-600 dark:text-rose-400",
];

// ─── Modal Créer ──────────────────────────────────────────────────────────────
function CreateModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (vt: VehiculeType) => void;
}) {
  const [form, setForm] = useState({ label: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/vehicule-types", form);
      onSave(data.response);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Nouveau type de véhicule</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nom *</label>
            <input
              type="text"
              placeholder="Ex : Voiture légère, Camion, Moto…"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              placeholder="Description du type de véhicule..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.label.trim()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Voir ───────────────────────────────────────────────────────────────
function ViewModal({ vehiculeType, onClose }: { vehiculeType: VehiculeType; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Détail du type de véhicule</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar + nom */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${AVATAR_COLORS[vehiculeType.id % AVATAR_COLORS.length]}`}>
              {initials(vehiculeType.label)}
            </div>
            <p className="text-xl font-bold">{vehiculeType.label}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Description */}
            <div className="rounded-lg bg-muted/30 border p-3">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">
                {vehiculeType.description ?? <span className="italic text-muted-foreground">Aucune</span>}
              </p>
            </div>

            {/* Véhicules */}
            <div className="rounded-lg bg-muted/30 border p-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Car className="w-3 h-3" /> Véhicules ({vehiculeType?.vehicules?.length ?? 0})
              </p>
              {vehiculeType.vehicules.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Aucun véhicule</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {vehiculeType.vehicules.map((v) => (
                    <span key={v.id} className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium border">
                      {v.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Modifier ───────────────────────────────────────────────────────────
function EditModal({
  vehiculeType, onClose, onSave,
}: {
  vehiculeType: VehiculeType;
  onClose: () => void;
  onSave: (updated: VehiculeType) => void;
}) {
  const [form, setForm] = useState({
    label: vehiculeType.label,
    description: vehiculeType.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/vehicule-types/${vehiculeType.id}`, form);
      onSave(data.response);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Modifier le type de véhicule</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nom</label>
            <input
              type="text"
              placeholder="Ex : Voiture légère, Camion, Moto…"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              placeholder="Description du type de véhicule..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.label.trim()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Supprimer ──────────────────────────────────────────────────────────
function DeleteModal({
  vehiculeType, onClose, onConfirm,
}: {
  vehiculeType: VehiculeType;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Supprimer le type de véhicule</h2>
              <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 border p-3 mb-4">
            <p className="text-sm">
              Vous allez supprimer <span className="font-semibold">{vehiculeType.label}</span>.
            </p>
            {vehiculeType?.vehicules?.length > 0 && (
              <p className="text-xs text-rose-500 mt-1.5">
                ⚠ {vehiculeType?.vehicules?.length} véhicule{vehiculeType?.vehicules?.length > 1 ? "s" : ""} associé{vehiculeType?.vehicules?.length > 1 ? "s" : ""} seront également supprimés.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-md bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function VehiculeTypes() {
  const { t } = useLanguage();
  const [vehiculeTypes, setVehiculeTypes] = useState<VehiculeType[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewVehiculeType, setViewVehiculeType] = useState<VehiculeType | null>(null);
  const [editVehiculeType, setEditVehiculeType] = useState<VehiculeType | null>(null);
  const [deleteVehiculeType, setDeleteVehiculeType] = useState<VehiculeType | null>(null);

  useEffect(() => {
    const fetchVehiculeTypes = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/vehicule-types");
        setVehiculeTypes(
          (data.response ?? []).map((vt: any) => ({ ...vt, vehicules: vt.vehicules ?? [] }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehiculeTypes();
  }, []);

  // ── Filtrage + pagination ──────────────────────────────────────────────────
  const filtered = useMemo(() =>
    vehiculeTypes.filter((vt) =>
      vt.label.toLowerCase().includes(search.toLowerCase()) ||
      vt.description?.toLowerCase().includes(search.toLowerCase())
    ), [vehiculeTypes, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalVehicules = vehiculeTypes.reduce((acc, vt) => acc + (vt.vehicules?.length ?? 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = (newVehiculeType: VehiculeType) => {
    setVehiculeTypes((prev) => [newVehiculeType, ...prev]);
    setCreateOpen(false);
  };

  const handleSave = (updated: VehiculeType) => {
    setVehiculeTypes((prev) => prev.map((vt) => (vt.id === updated.id ? updated : vt)));
    setEditVehiculeType(null);
  };

  const handleDelete = async () => {
    if (!deleteVehiculeType) return;
    try {
      await api.delete(`/vehicule-types/${deleteVehiculeType.id}`);
      setVehiculeTypes((prev) => prev.filter((vt) => vt.id !== deleteVehiculeType.id));
      setDeleteVehiculeType(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Titre ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.vehiculeTypes.title}</h1>
          <p className="text-muted-foreground">{t.vehiculeTypes.manage}</p>
        </div>
        <button
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {t.vehiculeTypes.boutton.add}
        </button>
      </div>

      {/* ── Statistiques ── */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">{t.vehiculeTypes.stats.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{t.vehiculeTypes.stats.total_types}</span>
              <span className="text-2xl font-bold">{vehiculeTypes.length}</span>
            </div>
            <Wrench className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-sky-500/10">
              <Car className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{t.vehiculeTypes.stats.total_vehicule}</span>
              <span className="text-2xl font-bold">{totalVehicules}</span>
            </div>
            <Car className="absolute -right-3 -bottom-3 w-16 h-16 text-sky-500/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/10">
              <Bike className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{t.vehiculeTypes.stats.moyenne_vehicule}</span>
              <span className="text-2xl font-bold">
                {vehiculeTypes.length > 0 ? (totalVehicules / vehiculeTypes.length).toFixed(1) : "0"}
              </span>
            </div>
            <Bike className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-500/5" />
          </div>

        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="rounded-lg border bg-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.vehiculeTypes.search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border bg-card overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/30">
          {[
            { label: t.vehiculeTypes.tab.type, cols: "col-span-4" },
            { label: t.vehiculeTypes.tab.description, cols: "col-span-6" },
            { label: t.vehiculeTypes.tab.vehicule, cols: "col-span-1" },
            { label: "", cols: "col-span-1" },
          ].map(({ label, cols }, i) => (
            <span key={i} className={`${cols} text-xs font-medium text-muted-foreground uppercase tracking-wide`}>
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-8 h-8 animate-spin opacity-40" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Car className="w-10 h-10 opacity-30" />
            <span className="text-sm">Aucun type de véhicule trouvé</span>
          </div>
        ) : (
          paginated.map((vt) => (
            <div
              key={vt.id}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-muted/20 transition-colors items-center"
            >
              {/* Avatar + Nom */}
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[vt.id % AVATAR_COLORS.length]}`}>
                  {getVehicleIcon(vt.label) || initials(vt.label)}
                </div>
                <p className="text-sm font-medium leading-tight">{vt.label}</p>
              </div>

              {/* Description */}
              <div className="col-span-6">
                <span className="text-sm text-muted-foreground truncate block">
                  {vt.description ?? <span className="italic">—</span>}
                </span>
              </div>

              {/* Véhicules */}
              <div className="col-span-1">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${(vt.vehicules?.length ?? 0) > 0 ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground"}`}>
                  <Car className="w-3.5 h-3.5" />
                  {vt.vehicules?.length ?? 0}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-1">
                <button
                  onClick={() => setViewVehiculeType(vt)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Voir"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditVehiculeType(vt)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-sky-500 transition-colors"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteVehiculeType(vt)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> sur{" "}
            <span className="font-medium text-foreground">{totalPages}</span> — {filtered.length} type{filtered.length > 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 flex items-center justify-center rounded-md border text-sm transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {viewVehiculeType && <ViewModal vehiculeType={viewVehiculeType} onClose={() => setViewVehiculeType(null)} />}
      {editVehiculeType && <EditModal vehiculeType={editVehiculeType} onClose={() => setEditVehiculeType(null)} onSave={handleSave} />}
      {deleteVehiculeType && <DeleteModal vehiculeType={deleteVehiculeType} onClose={() => setDeleteVehiculeType(null)} onConfirm={handleDelete} />}
      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onSave={handleCreate} />}

    </div>
  );
}