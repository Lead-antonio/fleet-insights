import { useState, useMemo, useEffect } from "react";
import {
  Car, Search, Plus, Pencil, Trash2, Eye, X, Loader2,
  ChevronLeft, ChevronRight, AlertTriangle, Bike, Truck,
  Gauge, Fuel, Building2, Tag, RefreshCw, Radio,
  Wifi, WifiOff, Download, Info,
  CheckSquare, Square as SquareIcon,
  Zap,
  Navigation,
  ChevronDown,
} from "lucide-react";
import api from "@/lib/api";
import { fetchGpsObjects, type GpsObject } from "../pages/Livetracking"; // re-use GPS fetch
import LiveTracking from "../pages/Livetracking";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
type FuelType = "GASOIL" | "ESSENCE" | "ELECTRIQUE" | "HYBRIDE" | "GPL";

interface Customer {
  id: number;
  name: string;
  api_key: string | null;
}

interface VehiculeType {
  id: number;
  label: string;
}

interface Vehicule {
  id: number;
  matricule: string;
  imei: string;
  photo_url: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuel_type: FuelType;
  tank_capacity: number;
  odometer: number;
  customer: Customer;
  type: VehiculeType;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FUEL_LABELS: Record<FuelType, string> = {
  GASOIL: "Gasoil", ESSENCE: "Essence", ELECTRIQUE: "Électrique", HYBRIDE: "Hybride", GPL: "GPL",
};
const FUEL_COLORS: Record<FuelType, string> = {
  GASOIL:    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ESSENCE:   "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  ELECTRIQUE:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  HYBRIDE:   "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  GPL:       "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};
const AVATAR_COLORS = [
  "bg-primary/20 text-primary", "bg-sky-500/20 text-sky-600 dark:text-sky-400",
  "bg-violet-500/20 text-violet-600 dark:text-violet-400", "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/20 text-amber-600 dark:text-amber-400", "bg-rose-500/20 text-rose-600 dark:text-rose-400",
];

const getTypeIcon = (typeName: string): React.ElementType => {
  const l = typeName?.toLowerCase() ?? "";
  if (l.includes("moto")) return Bike;
  if (l.includes("camion")) return Truck;
  return Car;
};

const getGpsVehicleIcon = (model: string, name: string): React.ElementType => {
  const s = (model + " " + name).toLowerCase();
  if (s.includes("moto") || s.includes("yamaha") || s.includes("tvs") || s.includes("kymco") ||
      s.includes("hero") || s.includes("boxer") || s.includes("dakar") || s.includes("kenbo")) return Bike;
  if (s.includes("camion") || s.includes("sprinter") || s.includes("eicher") || s.includes("foton") ||
      s.includes("fourgon") || s.includes("mudan") || s.includes("super carry")) return Truck;
  if (s.includes("groupe") || s.includes("aksa") || s.includes("caterpillar") || s.includes("olympian")) return Zap;
  return Car;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function InfoBox({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-muted/30 border p-3 ${className}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}

// ─── Sync GPS Modal ───────────────────────────────────────────────────────────
function SyncModal({
  onClose, onSynced, customers, vehiculeTypes, existingImeis,
}: {
  onClose: () => void;
  onSynced: (newVehicules: Vehicule[]) => void;
  customers: Customer[];
  vehiculeTypes: VehiculeType[];
  existingImeis: Set<string>;
}) {
  const [step, setStep] = useState<"pick" | "preview" | "conflict" | "syncing" | "done">("pick");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsObjects, setGpsObjects] = useState<GpsObject[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [conflicts, setConflicts] = useState<GpsObject[]>([]);
  const [conflictChoices, setConflictChoices] = useState<Record<string, "skip" | "update">>({});
  const [defaultTypeId, setDefaultTypeId] = useState<string>("");
  const [defaultFuelType, setDefaultFuelType] = useState<FuelType>("GASOIL");
  const [defaultTankCapacity, setDefaultTankCapacity] = useState<string>("60");
  const [syncResults, setSyncResults] = useState({ created: 0, updated: 0, skipped: 0 });

  const fetchGps = async (customer: Customer) => {
    if (!customer.api_key) { setGpsError("Ce client n'a pas de clé API GPS configurée."); return; }
    setLoadingGps(true);
    setGpsError(null);
    try {
      const objects = await fetchGpsObjects(customer.api_key);
      setGpsObjects(objects);
      setSelected(new Set(objects.filter((o) => !existingImeis.has(o.imei)).map((o) => o.imei)));
      setStep("preview");
    } catch {
      setGpsError("Impossible de contacter l'API GPS. Vérifiez la clé API.");
    } finally {
      setLoadingGps(false);
    }
  };

  const toggleSelect = (imei: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(imei) ? n.delete(imei) : n.add(imei); return n; });

  const newCount = gpsObjects.filter((o) => !existingImeis.has(o.imei)).length;
  const existingCount = gpsObjects.filter((o) => existingImeis.has(o.imei)).length;

  const toggleAll = () => {
    const newOnes = gpsObjects.filter((o) => !existingImeis.has(o.imei)).map((o) => o.imei);
    setSelected(selected.size === newOnes.length ? new Set() : new Set(newOnes));
  };

  const handleProceed = () => {
    const conflicting = gpsObjects.filter((o) => selected.has(o.imei) && existingImeis.has(o.imei));
    if (conflicting.length > 0) {
      setConflicts(conflicting);
      const choices: Record<string, "skip" | "update"> = {};
      conflicting.forEach((o) => { choices[o.imei] = "skip"; });
      setConflictChoices(choices);
      setStep("conflict");
    } else {
      handleSync();
    }
  };

  // const handleSync = async () => {
  //   setStep("syncing");
  //   let created = 0, updated = 0, skipped = 0;
  //   const newVehicules: Vehicule[] = [];
  //   const toProcess = gpsObjects.filter((o) => selected.has(o.imei));

  //   for (const obj of toProcess) {
  //     const isExisting = existingImeis.has(obj.imei);
  //     const choice = conflictChoices[obj.imei] ?? "skip";
  //     if (isExisting && choice === "skip") { skipped++; continue; }

  //     const modelParts = obj.model?.split(" ") ?? [];
  //     const parsedTypeId = parseInt(defaultTypeId);
  //     const payload = {
  //       matricule: obj.plate_number || obj.name,
  //       imei: obj.imei,
  //       brand: modelParts[0] ?? null,
  //       model: modelParts.slice(1).join(" ") || null,
  //       odometer: parseFloat(obj.odometer) || 0,
  //       tank_capacity: parseFloat(
  //         obj.custom_fields?.find((cf) =>
  //           cf.name.toLowerCase().includes("réservoir") || cf.name.toLowerCase().includes("reservoir")
  //         )?.value?.replace(/[^\d.]/g, "") ?? defaultTankCapacity
  //       ) || parseFloat(defaultTankCapacity),
  //       fuel_type: defaultFuelType,
  //       customerId: selectedCustomer!.id,
  //       ...( !isNaN(parsedTypeId) && { typeId: parsedTypeId } )
  //     };
      
      
  //     try {
  //       if (isExisting && choice === "update") {
  //         const { data } = await api.patch(`/vehicules/imei/${obj.imei}`, payload);
  //         newVehicules.push(data.response); updated++;
  //       } else {
  //         const { data } = await api.post("/vehicules", payload);
  //         newVehicules.push(data.response); created++;
  //       }
  //     } catch { skipped++; }
  //   }

  //   setSyncResults({ created, updated, skipped });
  //   setStep("done");
  //   if (newVehicules.length > 0) onSynced(newVehicules);
  // };

  // ─── Frontend : SyncModal handleSync ─────────────────────────────────────────

  const handleSync = async () => {
    setStep("syncing");
    const newVehicules: Vehicule[] = [];
    let created = 0, updated = 0, skipped = 0;

    const toProcess = gpsObjects.filter((o) => selected.has(o.imei));

    // ── Séparer create / update / skip ──
    const toCreate: GpsObject[] = [];
    const toUpdate: GpsObject[] = [];

    for (const obj of toProcess) {
      const isExisting = existingImeis.has(obj.imei);
      const choice = conflictChoices[obj.imei] ?? "skip";

      if (isExisting && choice === "skip") { skipped++; continue; }
      if (isExisting && choice === "update") { toUpdate.push(obj); continue; }
      toCreate.push(obj);
    }

    const inferFuelType = (obj: GpsObject): FuelType => {
      const s = (obj.model + " " + obj.name).toLowerCase();
      const isMoto =
        s.includes("moto") || s.includes("yamaha") || s.includes("tvs")  ||
        s.includes("kymco") || s.includes("hero")  || s.includes("boxer") ||
        s.includes("dakar") || s.includes("kenbo");
      if (isMoto) return "ESSENCE";
      return defaultFuelType; // sinon valeur par défaut choisie par l'utilisateur
    };

    // ── Helper : GpsObject → payload sans customerId (envoyé une seule fois) ──
    const toPayload = (obj: GpsObject) => {
      const modelParts = obj.model?.split(" ") ?? [];
      return {
        matricule: obj.plate_number || obj.name,
        imei: obj.imei,
        brand: modelParts[0] ?? null,
        model: modelParts.slice(1).join(" ") || null,
        odometer: parseFloat(obj.odometer) || 0,
        tank_capacity:
          parseFloat(
            obj.custom_fields
              ?.find((cf) =>
                cf.name.toLowerCase().includes("réservoir") ||
                cf.name.toLowerCase().includes("reservoir"),
              )
              ?.value?.replace(/[^\d.]/g, "") ?? defaultTankCapacity,
          ) || parseFloat(defaultTankCapacity),
        fuel_type: inferFuelType(obj),
        typeId: defaultTypeId ? parseInt(defaultTypeId) : null,
      };
    };

    // ── Bulk CREATE — un seul POST au lieu de N requêtes ──
    if (toCreate.length > 0) {
      try {
        const { data } = await api.post("/vehicules/bulk", {
          customerId: selectedCustomer!.id,
          vehicules: toCreate.map(toPayload),
        });
        const results: Vehicule[] = data.response ?? [];
        newVehicules.push(...results);
        created = results.length;
      } catch {
        skipped += toCreate.length;
      }
    }

    // ── Bulk UPDATE — un seul PATCH au lieu de N requêtes ──
    if (toUpdate.length > 0) {
      try {
        const { data } = await api.patch("/vehicules/bulk", {
          customerId: selectedCustomer!.id,
          vehicules: toUpdate.map(toPayload),
        });
        const results: Vehicule[] = data.response ?? [];
        newVehicules.push(...results);
        updated = results.length;
      } catch {
        skipped += toUpdate.length;
      }
    }

    setSyncResults({ created, updated, skipped });
    setStep("done");
    if (newVehicules.length > 0) onSynced(newVehicules);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl mx-4 animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Synchronisation GPS</h2>
              <p className="text-xs text-muted-foreground">Importer des véhicules depuis la plateforme de géolocalisation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1 — Pick customer */}
          {step === "pick" && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Sélectionnez un client pour récupérer ses véhicules GPS via sa clé API.</p>
              <div className="space-y-2">
                {customers.map((c) => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); fetchGps(c); }} disabled={loadingGps}
                    className="w-full flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {c.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    {c.api_key
                      ? <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Wifi className="w-3 h-3" /> Clé API active</span>
                      : <span className="text-xs text-rose-500 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Pas de clé API</span>}
                  </button>
                ))}
              </div>
              {loadingGps && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Récupération des véhicules GPS...</span>
                </div>
              )}
              {gpsError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span className="text-sm">{gpsError}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Preview */}
          {step === "preview" && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3 text-center"><p className="text-2xl font-bold">{gpsObjects.length}</p><p className="text-xs text-muted-foreground">Total GPS</p></div>
                <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/20 p-3 text-center"><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{newCount}</p><p className="text-xs text-muted-foreground">Nouveaux</p></div>
                <div className="rounded-lg border bg-amber-500/10 border-amber-500/20 p-3 text-center"><p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{existingCount}</p><p className="text-xs text-muted-foreground">Déjà en base</p></div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-muted-foreground" />Valeurs par défaut pour les nouveaux véhicules</p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Type *">
                    <select value={defaultTypeId} onChange={(e) => setDefaultTypeId(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
                      <option value="">-- Sélectionner --</option>
                      {vehiculeTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Carburant">
                    <select value={defaultFuelType} onChange={(e) => setDefaultFuelType(e.target.value as FuelType)} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
                      {Object.entries(FUEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Réservoir (L)">
                    <input type="number" value={defaultTankCapacity} onChange={(e) => setDefaultTankCapacity(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" />
                  </Field>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30">
                  <button onClick={toggleAll} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {selected.size === newCount && newCount > 0
                      ? <CheckSquare className="w-4 h-4 text-primary" />
                      : <SquareIcon className="w-4 h-4" />}
                    Tout sélectionner ({newCount} nouveaux)
                  </button>
                  <span className="ml-auto text-xs text-muted-foreground">{selected.size} sélectionné(s)</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y">
                  {gpsObjects.map((obj) => {
                    const isExisting = existingImeis.has(obj.imei);
                    const isChecked = selected.has(obj.imei);
                    const GpsIcon = getGpsVehicleIcon(obj.model, obj.name);
                    return (
                      <div key={obj.imei} onClick={() => !isExisting && toggleSelect(obj.imei)}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isExisting ? "opacity-50 cursor-not-allowed bg-amber-500/5" : "cursor-pointer hover:bg-muted/20"} ${isChecked ? "bg-primary/5" : ""}`}>
                        {isExisting
                          ? <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          : <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${isChecked ? "bg-primary border-primary" : "border-border"}`}>{isChecked && <span className="text-primary-foreground text-xs">✓</span>}</div>}
                        <GpsIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{obj.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{obj.model} · {obj.plate_number}</p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{obj.imei}</span>
                        {isExisting && <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded flex-shrink-0">En base</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Conflicts */}
          {step === "conflict" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{conflicts.length} véhicule(s) avec conflit IMEI</p>
                  <p className="text-xs text-muted-foreground">Ces véhicules existent déjà en base. Choisissez l'action pour chacun.</p>
                </div>
              </div>
              <div className="space-y-2">
                {conflicts.map((obj) => (
                  <div key={obj.imei} className="rounded-lg border p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{obj.name}</p>
                      <p className="text-xs text-muted-foreground">{obj.model} · IMEI: {obj.imei}</p>
                    </div>
                    <div className="flex gap-2">
                      {(["skip", "update"] as const).map((choice) => (
                        <button key={choice} onClick={() => setConflictChoices((p) => ({ ...p, [obj.imei]: choice }))}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            conflictChoices[obj.imei] === choice
                              ? choice === "skip" ? "bg-muted border-foreground/20 text-foreground" : "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"}`}>
                          {choice === "skip" ? "Ignorer" : "Mettre à jour"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Syncing */}
          {step === "syncing" && (
            <div className="p-12 flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Synchronisation en cours...</p>
            </div>
          )}

          {/* Step 5 — Done */}
          {step === "done" && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Download className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-lg font-semibold">Synchronisation terminée !</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/20 p-3 text-center"><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{syncResults.created}</p><p className="text-xs text-muted-foreground">Créés</p></div>
                <div className="rounded-lg border bg-sky-500/10 border-sky-500/20 p-3 text-center"><p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{syncResults.updated}</p><p className="text-xs text-muted-foreground">Mis à jour</p></div>
                <div className="rounded-lg border bg-muted/30 p-3 text-center"><p className="text-2xl font-bold text-muted-foreground">{syncResults.skipped}</p><p className="text-xs text-muted-foreground">Ignorés</p></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
            {step === "done" ? "Fermer" : "Annuler"}
          </button>
          {step === "preview" && (
            <button onClick={handleProceed} disabled={selected.size === 0}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />Importer {selected.size} véhicule(s)
            </button>
          )}
          {step === "conflict" && (
            <button onClick={handleSync}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" />Confirmer la synchronisation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CRUD Modals ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onSave, customers, vehiculeTypes }: {
  onClose: () => void; onSave: (v: Vehicule) => void;
  customers: Customer[]; vehiculeTypes: VehiculeType[];
}) {
  const [form, setForm] = useState({
    matricule: "", imei: "", brand: "", model: "",
    year: "", fuel_type: "GASOIL" as FuelType,
    tank_capacity: "", odometer: "", customerId: "", typeId: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/vehicules", {
        matricule: form.matricule, imei: form.imei,
        brand: form.brand || undefined, model: form.model || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        fuel_type: form.fuel_type,
        tank_capacity: parseFloat(form.tank_capacity),
        odometer: parseFloat(form.odometer),
        customerId: parseInt(form.customerId),
        typeId: parseInt(form.typeId),
      });
      onSave(data.response); onClose();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const isValid = form.matricule.trim() && form.imei.trim() && form.tank_capacity && form.odometer && form.customerId && form.typeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">Nouveau véhicule</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <Field label="Matricule *"><input type="text" placeholder="Ex : AA-123-BB" value={form.matricule} onChange={set("matricule")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="IMEI *"><input type="text" placeholder="Ex : 352094085843876" value={form.imei} onChange={set("imei")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Marque"><input type="text" placeholder="Ex : Renault" value={form.brand} onChange={set("brand")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Modèle"><input type="text" placeholder="Ex : Kangoo" value={form.model} onChange={set("model")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Année"><input type="number" placeholder="Ex : 2021" value={form.year} onChange={set("year")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Carburant">
            <select value={form.fuel_type} onChange={set("fuel_type")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
              {Object.entries(FUEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Capacité réservoir (L) *"><input type="number" step="0.01" placeholder="Ex : 60" value={form.tank_capacity} onChange={set("tank_capacity")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Kilométrage (km) *"><input type="number" step="0.01" placeholder="Ex : 45000" value={form.odometer} onChange={set("odometer")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Client *">
            <select value={form.customerId} onChange={set("customerId")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
              <option value="">-- Sélectionner --</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Type *">
            <select value={form.typeId} onChange={set("typeId")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
              <option value="">-- Sélectionner --</option>
              {vehiculeTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving || !isValid}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Créer
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ vehicule, onClose }: { vehicule: Vehicule; onClose: () => void }) {
  const Icon = getTypeIcon(vehicule.type?.label ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Détail du véhicule</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${AVATAR_COLORS[vehicule.id % AVATAR_COLORS.length]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold">{vehicule.matricule}</p>
              {(vehicule.brand || vehicule.model) && <p className="text-sm text-muted-foreground">{vehicule.brand} {vehicule.model}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="IMEI"><span className="font-mono text-xs">{vehicule.imei}</span></InfoBox>
            <InfoBox label="Année">{vehicule.year ?? <span className="italic text-muted-foreground">—</span>}</InfoBox>
            <InfoBox label="Type">{vehicule.type?.label ?? <span className="italic text-muted-foreground">—</span>}</InfoBox>
            <InfoBox label="Carburant">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${FUEL_COLORS[vehicule.fuel_type]}`}>{FUEL_LABELS[vehicule.fuel_type]}</span>
            </InfoBox>
            <InfoBox label="Capacité réservoir">{vehicule.tank_capacity} L</InfoBox>
            <InfoBox label="Kilométrage">{Number(vehicule.odometer).toLocaleString()} km</InfoBox>
            <InfoBox label="Client" className="col-span-2">{vehicule.customer?.name ?? <span className="italic text-muted-foreground">—</span>}</InfoBox>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ vehicule, onClose, onSave, customers, vehiculeTypes }: {
  vehicule: Vehicule; onClose: () => void; onSave: (u: Vehicule) => void;
  customers: Customer[]; vehiculeTypes: VehiculeType[];
}) {
  const [form, setForm] = useState({
    matricule: vehicule.matricule, imei: vehicule.imei,
    brand: vehicule.brand ?? "", model: vehicule.model ?? "",
    year: vehicule.year?.toString() ?? "", fuel_type: vehicule.fuel_type,
    tank_capacity: vehicule.tank_capacity?.toString() ?? "",
    odometer: vehicule.odometer?.toString() ?? "",
    customerId: vehicule.customer?.id?.toString() ?? "",
    typeId: vehicule.type?.id?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/vehicules/${vehicule.id}`, {
        matricule: form.matricule, imei: form.imei,
        brand: form.brand || undefined, model: form.model || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        fuel_type: form.fuel_type,
        tank_capacity: parseFloat(form.tank_capacity),
        odometer: parseFloat(form.odometer),
        customerId: parseInt(form.customerId),
        typeId: parseInt(form.typeId),
      });
      onSave(data.response); onClose();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const isValid = form.matricule.trim() && form.imei.trim() && form.tank_capacity && form.odometer && form.customerId && form.typeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">Modifier le véhicule</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <Field label="Matricule"><input type="text" value={form.matricule} onChange={set("matricule")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="IMEI"><input type="text" value={form.imei} onChange={set("imei")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Marque"><input type="text" value={form.brand} onChange={set("brand")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Modèle"><input type="text" value={form.model} onChange={set("model")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Année"><input type="number" value={form.year} onChange={set("year")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Carburant">
            <select value={form.fuel_type} onChange={set("fuel_type")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
              {Object.entries(FUEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Capacité réservoir (L)"><input type="number" step="0.01" value={form.tank_capacity} onChange={set("tank_capacity")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Kilométrage (km)"><input type="number" step="0.01" value={form.odometer} onChange={set("odometer")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full" /></Field>
          <Field label="Client">
            <select value={form.customerId} onChange={set("customerId")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
              <option value="">-- Sélectionner --</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={form.typeId} onChange={set("typeId")} className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full">
              <option value="">-- Sélectionner --</option>
              {vehiculeTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving || !isValid}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ vehicule, onClose, onConfirm }: { vehicule: Vehicule; onClose: () => void; onConfirm: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => { setDeleting(true); try { await onConfirm(); } finally { setDeleting(false); } };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Supprimer le véhicule</h2>
              <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 border p-3 mb-4">
            <p className="text-sm">Vous allez supprimer le véhicule <span className="font-semibold">{vehicule.matricule}</span>
              {(vehicule.brand || vehicule.model) && <> — <span className="text-muted-foreground">{vehicule.brand} {vehicule.model}</span></>}.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">Annuler</button>
          <button onClick={handleConfirm} disabled={deleting}
            className="px-4 py-2 rounded-md bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2 transition-colors">
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function Vehicles() {
  const { t } = useLanguage();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehiculeTypes, setVehiculeTypes] = useState<VehiculeType[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<"list" | "live">("list");

  const [createOpen, setCreateOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [viewVehicule, setViewVehicule] = useState<Vehicule | null>(null);
  const [editVehicule, setEditVehicule] = useState<Vehicule | null>(null);
  const [deleteVehicule, setDeleteVehicule] = useState<Vehicule | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [fuelFilter, setFuelFilter] = useState<string>("")

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [vRes, cRes, tRes] = await Promise.all([
          api.get("/vehicules"),
          api.get("/customers"),
          api.get("/vehicule-types"),
        ]);
        setVehicules(Array.isArray(vRes.data.response) ? vRes.data.response : []);
        setCustomers(Array.isArray(cRes.data.response) ? cRes.data.response : []);
        setVehiculeTypes(Array.isArray(tRes.data.response) ? tRes.data.response : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() =>
    vehicules.filter((v) => {
      const matchSearch = 
      v.matricule.toLowerCase().includes(search.toLowerCase()) ||
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase()) ||
      v.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.type?.label?.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === "" || v.type?.id === parseInt(typeFilter);
      const matchFuel = fuelFilter === "" || v.fuel_type === fuelFilter;

      return matchSearch && matchType && matchFuel;
    }), [vehicules, search, typeFilter, fuelFilter]);
      

  

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const uniqueClients = new Set(vehicules.map((v) => v.customer?.id)).size;
  const essenceCount = vehicules.filter((v) => v.fuel_type === "ESSENCE").length;
  const gasoilCount = vehicules.filter((v) => v.fuel_type === "GASOIL").length;
  const electriqueCount = vehicules.filter((v) => v.fuel_type === "ELECTRIQUE").length;

  const existingImeis = useMemo(() => new Set(vehicules.map((v) => v.imei)), [vehicules]);

  const handleCreate = (newV: Vehicule) => { setVehicules((p) => [newV, ...p]); setCreateOpen(false); };
  const handleSave = (u: Vehicule) => { setVehicules((p) => p.map((v) => v.id === u.id ? u : v)); setEditVehicule(null); };
  const handleDelete = async () => {
    if (!deleteVehicule) return;
    try {
      await api.delete(`/vehicules/${deleteVehicule.id}`);
      setVehicules((p) => p.filter((v) => v.id !== deleteVehicule.id));
      setDeleteVehicule(null);
    } catch (err) { console.error(err); }
  };
  const handleSynced = (newVehicules: Vehicule[]) => {
    setVehicules((p) => {
      const map = new Map(p.map((v) => [v.id, v]));
      newVehicules.forEach((v) => map.set(v.id, v));
      return Array.from(map.values());
    });
  };

  const kpiCards = [
    { label: t.fleet.totalVehicles, value: vehicules.length, icon: Car, color: 'bg-primary' },
    { label: t.vehicule.stats.total_essence, value: essenceCount, icon: Fuel, color: 'bg-success' },
    { label: t.vehicule.stats.total_gasoil, value: gasoilCount, icon: Fuel, color: 'bg-amber-600' },
    { label: t.vehicule.stats.total_electrique, value: electriqueCount, icon: Gauge, color: 'bg-info' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t.vehicule.title}</h1>
          <p className="text-muted-foreground">{t.vehicule.manage}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-1 gap-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Car className="w-3.5 h-3.5" /> {t.vehicule.boutton.liste}
            </button>
            <button
              onClick={() => setView("live")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "live" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {t.vehicule.boutton.live_tracking}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
          {/* Actions visibles uniquement en vue liste */}
          {view === "list" && (
            <>
              <button onClick={() => setSyncOpen(true)}
                className="h-9 px-4 rounded-md border bg-background hover:bg-muted text-sm font-medium flex items-center gap-2 transition-colors">
                <RefreshCw className="w-4 h-4" />{t.vehicule.boutton.sync_vehicule}
              </button>
              <button onClick={() => setCreateOpen(true)}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />{t.vehicule.boutton.add}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Vue Live Tracking */}
      {view === "live" && <LiveTracking customers={customers} />}

      {/* Vue Liste */}
      {view === "list" && <>

      {/* Stats */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">{t.vehicule.stats.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-3xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">

          {/* Recherche */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.vehicule.search}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Séparateur */}
          <div className="hidden sm:block h-5 w-px bg-border" />

          {/* Type de véhicule */}
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <Select
              value={typeFilter}
              onValueChange={(val) => { setTypeFilter(val === "all" ? "" : val); setPage(1); }}
            >
              <SelectTrigger className="h-9 w-[180px] pl-9 text-sm">
                <SelectValue placeholder={t.vehicule.select_type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.vehicule.select_type}</SelectItem>
                {vehiculeTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type de carburant */}
          <div className="relative">
            <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <Select
              value={fuelFilter}
              onValueChange={(val) => { setFuelFilter(val === "all" ? "" : val); setPage(1); }}
            >
              <SelectTrigger className="h-9 w-[200px] pl-9 text-sm">
                <SelectValue placeholder={t.vehicule.select_fuel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.vehicule.select_fuel}</SelectItem>
                <SelectItem value="ESSENCE">Essence</SelectItem>
                <SelectItem value="GASOIL">Diesel</SelectItem>
                <SelectItem value="ELECTRIQUE">Électrique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Badge reset — visible seulement si un filtre est actif */}
          {(typeFilter || fuelFilter || search) && (
            <button
              onClick={() => { setSearch(""); setTypeFilter(""); setFuelFilter(""); setPage(1); }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-dashed
                        border-border text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground
                        transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}

        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/30">
          {[
            { label: t.vehicule.tab.vehicule, cols: "col-span-3" }, { label: t.vehicule.tab.type, cols: "col-span-2" },
            { label: t.vehicule.tab.client, cols: "col-span-2" },   { label: t.vehicule.tab.carburant, cols: "col-span-2" },
            { label: t.vehicule.tab.kilométrage, cols: "col-span-2" }, { label: "", cols: "col-span-1" },
          ].map(({ label, cols }, i) => (
            <span key={i} className={`${cols} text-xs font-medium text-muted-foreground uppercase tracking-wide`}>{label}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-8 h-8 animate-spin opacity-40" /><span className="text-sm">Chargement...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Car className="w-10 h-10 opacity-30" /><span className="text-sm">Aucun véhicule trouvé</span>
          </div>
        ) : (
          paginated.map((v) => {
            const Icon = getTypeIcon(v.type?.label ?? "");
            return (
              <div key={v.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-muted/20 transition-colors items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${AVATAR_COLORS[v.id % AVATAR_COLORS.length]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{v.matricule}</p>
                    {(v.brand || v.model) && (
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{v.brand} {v.model}{v.year ? ` (${v.year})` : ""}</p>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  {v.type
                    ? <span className="inline-flex items-center gap-1.5 text-sm"><Tag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /><span className="truncate">{v.type.label}</span></span>
                    : <span className="text-sm text-muted-foreground italic">—</span>}
                </div>
                <div className="col-span-2">
                  {v.customer
                    ? <span className="inline-flex items-center gap-1.5 text-sm"><Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /><span className="truncate">{v.customer.name}</span></span>
                    : <span className="text-sm text-muted-foreground italic">—</span>}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${FUEL_COLORS[v.fuel_type] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {FUEL_LABELS[v.fuel_type] ?? v.fuel_type}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Gauge className="w-3.5 h-3.5 flex-shrink-0" />{Number(v.odometer).toLocaleString()} km
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button onClick={() => setViewVehicule(v)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Voir"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => setEditVehicule(v)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-sky-500 transition-colors" title="Modifier"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteVehicule(v)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t.vehicule.pagination.page} <span className="font-medium text-foreground">{page}</span> {t.vehicule.pagination.of} <span className="font-medium text-foreground">{totalPages}</span> — {filtered.length} {t.vehicule.pagination.title}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 flex items-center justify-center rounded-md border text-sm transition-colors ${p === page ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted text-muted-foreground"}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      </> /* fin vue liste */}

      {/* Modals — disponibles dans les deux vues */}
      {viewVehicule   && <ViewModal   vehicule={viewVehicule}   onClose={() => setViewVehicule(null)} />}
      {editVehicule   && <EditModal   vehicule={editVehicule}   onClose={() => setEditVehicule(null)}   onSave={handleSave}   customers={customers} vehiculeTypes={vehiculeTypes} />}
      {deleteVehicule && <DeleteModal vehicule={deleteVehicule} onClose={() => setDeleteVehicule(null)} onConfirm={handleDelete} />}
      {createOpen     && <CreateModal onClose={() => setCreateOpen(false)} onSave={handleCreate} customers={customers} vehiculeTypes={vehiculeTypes} />}
      {syncOpen       && <SyncModal   onClose={() => setSyncOpen(false)}   onSynced={handleSynced} customers={customers} vehiculeTypes={vehiculeTypes} existingImeis={existingImeis} />}
    </div>
  );
}