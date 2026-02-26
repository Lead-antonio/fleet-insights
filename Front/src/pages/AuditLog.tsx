import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  ClipboardList, Loader2, RotateCcw, ChevronLeft, ChevronRight,
  ShieldAlert, Plus, Pencil, Trash2, Eye, Search,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions"; // adaptez le chemin
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuditLog {
  id: number;
  userId: number;
  user?: { id: number; email: string; name?: string };
  action: string;
  entity: string;
  entityId: number;
  date: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: AuditLog[];
  total: number;
}

interface Filters {
  userId: string;
  entity: string;
  action: string;
  from: string;
  to: string;
  page: number;
  limit: number;
}

// ─── Config actions ───────────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  CREATE: {
    label: "Création",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    icon: <Plus className="w-3 h-3" />,
  },
  UPDATE: {
    label: "Modification",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
    icon: <Pencil className="w-3 h-3" />,
  },
  DELETE: {
    label: "Suppression",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    icon: <Trash2 className="w-3 h-3" />,
  },
  READ: {
    label: "Lecture",
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
    icon: <Eye className="w-3 h-3" />,
  },
};

const DEFAULT_ACTION = {
  label: "Inconnu",
  className: "bg-muted text-muted-foreground border",
  icon: <ShieldAlert className="w-3 h-3" />,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    userId: "", entity: "", action: "", from: "", to: "", page: 1, limit: 15,
  });

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true });
  }, [isAdmin, navigate]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== 0)
      );
      const { data } = await api.get<PaginatedResponse>("/audit-log", { params });
      setLogs(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / filters.limit);

  const setFilter = (key: keyof Filters, value: string | number) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const resetFilters = () =>
    setFilters({ userId: "", entity: "", action: "", from: "", to: "", page: 1, limit: 15 });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const actionCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.action] = (acc[l.action] ?? 0) + 1;
    return acc;
  }, {});

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Titre ── */}
      <div>
        <h1 className="text-3xl font-bold">Journal d'audit</h1>
        <p className="text-muted-foreground">
          Historique complet des actions effectuées dans le système
        </p>
      </div>

      {/* ── Statistiques ── */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total événements</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : total}
              </span>
            </div>
            <ClipboardList className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/10">
              <Plus className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Créations</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (actionCounts.CREATE ?? 0)}
              </span>
            </div>
            <Plus className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-500/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-sky-500/10">
              <Pencil className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Modifications</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (actionCounts.UPDATE ?? 0)}
              </span>
            </div>
            <Pencil className="absolute -right-3 -bottom-3 w-16 h-16 text-sky-500/5" />
          </div>

          <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-rose-500/10">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Suppressions</span>
              <span className="text-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (actionCounts.DELETE ?? 0)}
              </span>
            </div>
            <Trash2 className="absolute -right-3 -bottom-3 w-16 h-16 text-rose-500/5" />
          </div>

        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Filtres</h2>
        <div className="flex flex-wrap gap-3 items-end">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilter("action", e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
            >
              <option value="">Toutes</option>
              <option value="CREATE">Création</option>
              <option value="UPDATE">Modification</option>
              <option value="DELETE">Suppression</option>
              <option value="READ">Lecture</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Entité</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ex: User, Vehicle..."
                value={filters.entity}
                onChange={(e) => setFilter("entity", e.target.value)}
                className="h-9 rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-44"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">User ID</label>
            <input
              type="text"
              placeholder="ID utilisateur"
              value={filters.userId}
              onChange={(e) => setFilter("userId", e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-36"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Du</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilter("from", e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Au</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter("to", e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={resetFilters}
            className="h-9 px-3 rounded-md border bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>

        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border bg-card overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/30">
          {[
            { label: "#", cols: "col-span-1" },
            { label: "Action", cols: "col-span-2" },
            { label: "Entité", cols: "col-span-2" },
            { label: "ID entité", cols: "col-span-1" },
            { label: "Utilisateur", cols: "col-span-3" },
            { label: "Date", cols: "col-span-3" },
          ].map(({ label, cols }) => (
            <span key={label} className={`${cols} text-xs font-medium text-muted-foreground uppercase tracking-wide`}>
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <ClipboardList className="w-10 h-10 opacity-30" />
            <span className="text-sm">Aucun événement trouvé</span>
          </div>
        ) : (
          logs.map((log) => {
            const cfg = ACTION_CONFIG[log.action] ?? DEFAULT_ACTION;
            return (
              <div
                key={log.id}
                className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-muted/20 transition-colors"
              >
                <span className="col-span-1 text-muted-foreground text-sm tabular-nums self-center">
                  {log.id}
                </span>

                <span className="col-span-2 self-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.className}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </span>

                <span className="col-span-2 text-sm font-medium self-center">
                  {log.entity}
                </span>

                <span className="col-span-1 text-sm text-muted-foreground tabular-nums self-center">
                  #{log.entityId}
                </span>

                <span className="col-span-3 self-center">
                  <span className="text-sm font-medium">
                    {log.user?.name ?? log.user?.email ?? `Utilisateur #${log.userId}`}
                  </span>
                  {log.user?.name && (
                    <span className="block text-xs text-muted-foreground">{log.user.email}</span>
                  )}
                </span>

                <span className="col-span-3 text-sm text-muted-foreground tabular-nums self-center">
                  {formatDate(log.date)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{filters.page}</span> sur{" "}
            <span className="font-medium text-foreground">{totalPages}</span> — {total} résultat{total > 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter("page", filters.page - 1)}
              disabled={filters.page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p =
                filters.page <= 3 ? i + 1
                : filters.page >= totalPages - 2 ? totalPages - 4 + i
                : filters.page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setFilter("page", p)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md border text-sm transition-colors ${
                    p === filters.page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setFilter("page", filters.page + 1)}
              disabled={filters.page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}