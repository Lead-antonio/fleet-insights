import { useState, useMemo, useEffect } from "react";
import {
  Users, Building2, Key, Car, Search, Plus,
  Pencil, Trash2, Eye, X, Loader2, MoreHorizontal,
  ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: number;
  name: string;
  company: string | null;
  description: string | null;
  api_key: string | null;
  user: { id: number; email: string } | null;
  vehicules: { id: number; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const maskApiKey = (key: string) =>
  key.slice(0, 10) + "••••••••••••" + key.slice(-4);

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-sky-500/20 text-sky-600 dark:text-sky-400",
  "bg-violet-500/20 text-violet-600 dark:text-violet-400",
  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  "bg-rose-500/20 text-rose-600 dark:text-rose-400",
];

// Modal create
function CreateModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (customer: Customer) => void;
}) {
  const [form, setForm] = useState({
    name: "", company: "", description: "", api_key: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/customers", form);
      console.log("Response:", data);
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
          <h2 className="text-lg font-semibold">Nouveau client</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: "Nom *", key: "name", placeholder: "Nom complet" },
            { label: "Entreprise", key: "company", placeholder: "Nom de l'entreprise (optionnel)" },
            { label: "Clé API", key: "api_key", placeholder: "ak_live_..." },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              placeholder="Description du client..."
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
            disabled={saving || !form.name.trim()}
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
function ViewModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Détail client</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar + nom */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${AVATAR_COLORS[customer.id % AVATAR_COLORS.length]}`}>
              {initials(customer.name)}
            </div>
            <div>
              <p className="text-xl font-bold">{customer.name}</p>
              {customer.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {customer.company}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="col-span-2 rounded-lg bg-muted/30 border p-3">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium">{customer.user?.email ?? <span className="text-muted-foreground italic">Non lié</span>}</p>
            </div>

            {/* Description */}
            <div className="col-span-2 rounded-lg bg-muted/30 border p-3">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{customer.description ?? <span className="italic text-muted-foreground">Aucune</span>}</p>
            </div>

            {/* API Key */}
            <div className="col-span-2 rounded-lg bg-muted/30 border p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Key className="w-3 h-3" /> Clé API
              </p>
              <p className="text-sm font-mono">
                {customer.api_key ? maskApiKey(customer.api_key) : <span className="italic text-muted-foreground">Non définie</span>}
              </p>
            </div>

            {/* Véhicules */}
            <div className="col-span-2 rounded-lg bg-muted/30 border p-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Car className="w-3 h-3" /> Véhicules ({customer.vehicules.length})
              </p>
              {customer.vehicules.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Aucun véhicule</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {customer.vehicules.map((v) => (
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
  customer, onClose, onSave,
}: {
  customer: Customer;
  onClose: () => void;
  onSave: (updated: Customer) => void;
}) {
  const [form, setForm] = useState({
    name: customer.name,
    company: customer.company ?? "",
    description: customer.description ?? "",
    api_key: customer.api_key ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // simulé
    onSave({
      ...customer,
      name: form.name,
      company: form.company || null,
      description: form.description || null,
      api_key: form.api_key || null,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Modifier le client</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: "Nom", key: "name", placeholder: "Nom complet" },
            { label: "Entreprise", key: "company", placeholder: "Nom de l'entreprise (optionnel)" },
            { label: "Clé API", key: "api_key", placeholder: "ak_live_..." },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              placeholder="Description du client..."
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
            disabled={saving || !form.name.trim()}
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
  customer, onClose, onConfirm,
}: {
  customer: Customer;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirm();
    setDeleting(false);
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
              <h2 className="text-lg font-semibold">Supprimer le client</h2>
              <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 border p-3 mb-4">
            <p className="text-sm">
              Vous allez supprimer <span className="font-semibold">{customer.name}</span>
              {customer.company && <> — <span className="text-muted-foreground">{customer.company}</span></>}.
            </p>
            {customer.vehicules.length > 0 && (
              <p className="text-xs text-rose-500 mt-1.5">
                ⚠ {customer.vehicules.length} véhicule{customer.vehicules.length > 1 ? "s" : ""} associé{customer.vehicules.length > 1 ? "s" : ""} seront également supprimés.
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
const PAGE_SIZE = 5;

export default function Customer() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
        setLoading(true);
        try {
        const { data } = await api.get("/customers");
        setCustomers(data.response);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    };
    fetchCustomers();
    }, []);

  // ── Filtrage + pagination ──────────────────────────────────────────────────
  const filtered = useMemo(() =>
    customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.email.toLowerCase().includes(search.toLowerCase())
    ), [customers, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalVehicules = customers.reduce((acc, c) => acc + (c.vehicules?.length ?? 0), 0);
  const withApiKey = customers.filter((c) => c.api_key).length;
  const withCompany = customers.filter((c) => c.company).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async (updated: Customer) => {
    try {
        const { data } = await api.patch(`/customers/${updated.id}`, {
        name: updated.name,
        company: updated.company,
        description: updated.description,
        api_key: updated.api_key,
        });
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? data.response : c)));
        setEditCustomer(null);
    } catch (err) {
        console.error(err);
    }
  };

    const handleCreate = (newCustomer: Customer) => {
        setCustomers((prev) => [newCustomer, ...prev]);
        setCreateOpen(false);
    };

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    try {
        await api.delete(`/customers/${deleteCustomer.id}`);
        setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));
        setDeleteCustomer(null);
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Titre ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Gestion des clients et de leurs accès</p>
        </div>
        <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {/* ── Statistiques ── */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total clients</span>
              <span className="text-2xl font-bold">{customers.length}</span>
            </div>
            <Users className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-sky-500/10">
              <Car className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total véhicules</span>
              <span className="text-2xl font-bold">{totalVehicules}</span>
            </div>
            <Car className="absolute -right-3 -bottom-3 w-16 h-16 text-sky-500/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/10">
              <Key className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avec clé API</span>
              <span className="text-2xl font-bold">{withApiKey}</span>
            </div>
            <Key className="absolute -right-3 -bottom-3 w-16 h-16 text-amber-500/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/10">
              <Building2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Entreprises</span>
              <span className="text-2xl font-bold">{withCompany}</span>
            </div>
            <Building2 className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-500/5" />
          </div>

        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="rounded-lg border bg-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, entreprise, email..."
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
            { label: "Client", cols: "col-span-3" },
            { label: "Entreprise", cols: "col-span-2" },
            { label: "Email", cols: "col-span-3" },
            { label: "Véhicules", cols: "col-span-1" },
            { label: "Clé API", cols: "col-span-2" },
            { label: "", cols: "col-span-1" },
          ].map(({ label, cols }, i) => (
            <span key={i} className={`${cols} text-xs font-medium text-muted-foreground uppercase tracking-wide`}>
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Users className="w-10 h-10 opacity-30" />
            <span className="text-sm">Aucun client trouvé</span>
          </div>
        ) : (
          paginated.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-muted/20 transition-colors items-center"
            >
              {/* Avatar + Nom */}
              <div className="col-span-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[customer.id % AVATAR_COLORS.length]}`}>
                  {initials(customer.name)}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{customer.name}</p>
                  {customer.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{customer.description}</p>
                  )}
                </div>
              </div>

              {/* Entreprise */}
              <div className="col-span-2">
                {customer.company ? (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{customer.company}</span>
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">—</span>
                )}
              </div>

              {/* Email */}
              <div className="col-span-3">
                <span className="text-sm text-muted-foreground truncate block">
                  {customer.user?.email ?? <span className="italic">Non lié</span>}
                </span>
              </div>

              {/* Véhicules */}
              <div className="col-span-1">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${customer?.vehicules?.length > 0 ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground"}`}>
                  <Car className="w-3.5 h-3.5" />
                  {customer.vehicules?.length ?? 0}
                </span>
              </div>

              {/* API Key */}
              <div className="col-span-2">
                {customer.api_key ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono">
                    <Key className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">—</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-1">
                <button
                  onClick={() => setViewCustomer(customer)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Voir"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditCustomer(customer)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-sky-500 transition-colors"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteCustomer(customer)}
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
            <span className="font-medium text-foreground">{totalPages}</span> — {filtered.length} client{filtered.length > 1 ? "s" : ""}
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
      {viewCustomer && <ViewModal customer={viewCustomer} onClose={() => setViewCustomer(null)} />}
      {editCustomer && <EditModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleSave} />}
      {deleteCustomer && <DeleteModal customer={deleteCustomer} onClose={() => setDeleteCustomer(null)} onConfirm={handleDelete} />}
      {createOpen && (<CreateModal onClose={() => setCreateOpen(false)} onSave={handleCreate} />)}

    </div>
  );
}