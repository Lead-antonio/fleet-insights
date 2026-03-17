import { useState, useEffect, useRef, useCallback } from "react";
import {
  Radio, RefreshCw, Clock, AlertTriangle, Loader2,
  Gauge, Battery, Wifi, WifiOff, X, Car, Bike, Truck, Zap,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/lib/api";

// Fix Leaflet default marker icons (broken with Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: number;
  name: string;
  api_key: string | null;
}

interface GpsParams {
  acc?: string; alarm?: string; batl?: string; bats?: string;
  gpslev?: string; gsmlev?: string; odo?: string; track?: string;
  pump?: string; defense?: string; accv?: string;
}

export interface GpsObject {
  name: string; imei: string; model: string; plate_number: string;
  group_name: string | null; lat: string; lng: string; speed: string;
  angle: string; loc_valid: string; dt_server: string; dt_tracker: string;
  dt_last_stop: string; dt_last_move: string; odometer: string;
  engine_hours: string; params: GpsParams | null;
  active: string; expire: string; expire_dt: string;
  device: string; sim_number: string; vin: string;
  custom_fields: { name: string; value: string }[];
}

type VehicleStatus = "moving" | "idle" | "stopped" | "offline";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fetchGpsObjects = async (apiKey: string): Promise<GpsObject[]> => {
  const { data } = await api.get(`/gps/objects?key=${apiKey}`);
  return Array.isArray(data.response) ? data.response : [];
};

const getGpsStatus = (obj: GpsObject): VehicleStatus => {
  const acc = obj.params?.acc;
  const speed = parseFloat(obj.speed ?? "0");
  if (acc === "1") return speed > 0 ? "moving" : "idle";
  return "stopped";
};

const STATUS_CFG: Record<VehicleStatus, { label: string; color: string; bg: string; dot: string }> = {
  moving:  { label: "En mouvement", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  idle:    { label: "En ligne",     color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10 border-amber-500/20",   dot: "bg-amber-400" },
  stopped: { label: "Arrêté",       color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/10 border-sky-500/20",       dot: "bg-sky-400" },
  offline: { label: "Hors ligne",   color: "text-rose-500",                          bg: "bg-rose-500/10 border-rose-500/20",     dot: "bg-rose-400" },
};

const STATUS_COLORS: Record<VehicleStatus, string> = {
  moving: "#22c55e", idle: "#f59e0b", stopped: "#3b82f6", offline: "#ef4444",
};

const formatLastSeen = (dtStr: string): string => {
  if (!dtStr || dtStr === "0000-00-00 00:00:00") return "—";
  const diff = Date.now() - new Date(dtStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
};

function InfoBox({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-muted/30 border p-3 ${className}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}


// ─── SVG icons par type de véhicule (inline dans divIcon Leaflet) ─────────────
type VehicleIconType = "car" | "moto" | "truck" | "sprinter" | "engin";

const getVehicleIconType = (model: string, name: string): VehicleIconType => {
  const s = (model + " " + name).toLowerCase();
  if (s.includes("moto") || s.includes("yamaha") || s.includes("tvs")   ||
      s.includes("kymco") || s.includes("hero")  || s.includes("boxer") ||
      s.includes("dakar") || s.includes("kenbo")) return "moto";
  if (s.includes("sprinter")) return "sprinter";
  if (s.includes("camion") || s.includes("eicher") || s.includes("foton") ||
      s.includes("mudan") || s.includes("super carry")) return "truck";
  if (s.includes("groupe") || s.includes("aksa") || s.includes("caterpillar") ||
      s.includes("olympian") || s.includes("engin")) return "engin";
  return "car";
};

// SVGs dessinés à 20×20, centrés dans le marker
const VEHICLE_SVG: Record<VehicleIconType, string> = {
  // Voiture — vue de dessus
  car: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="COLOR">
    <path d="M14.5 7.5 13 4H7L5.5 7.5H3l-.5 1v5l1 .5v1h2v-1h9v1h2v-1l1-.5v-5l-.5-1h-2.5z
             M7.5 5.5h5l1 2h-7l1-2z
             M5.5 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0z
             M12.5 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>
  </svg>`,

  // Moto — vue de côté simplifiée
  moto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="COLOR">
    <circle cx="4.5" cy="13" r="2.5" stroke="COLOR" stroke-width="1.2" fill="none"/>
    <circle cx="15.5" cy="13" r="2.5" stroke="COLOR" stroke-width="1.2" fill="none"/>
    <path d="M4.5 13 7 8h4l2 2h2.5M11 8l1.5-2.5H15" stroke="COLOR" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="10" cy="9" r="1" fill="COLOR"/>
  </svg>`,

  // Camion — vue de côté
  truck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="COLOR">
    <rect x="1" y="7" width="11" height="7" rx="1"/>
    <path d="M12 9h4l2 2v3h-6V9z"/>
    <circle cx="4" cy="15.5" r="1.5" fill="white" stroke="COLOR" stroke-width="1"/>
    <circle cx="9" cy="15.5" r="1.5" fill="white" stroke="COLOR" stroke-width="1"/>
    <circle cx="15.5" cy="15.5" r="1.5" fill="white" stroke="COLOR" stroke-width="1"/>
  </svg>`,

  // Sprinter / fourgon
  sprinter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="COLOR">
    <rect x="1" y="6" width="14" height="8" rx="1.5"/>
    <path d="M15 9h2.5l1.5 2v3h-4V9z"/>
    <rect x="2" y="7.5" width="5" height="3" rx="0.5" fill="white" opacity="0.6"/>
    <circle cx="4"  cy="15" r="1.5" fill="white" stroke="COLOR" stroke-width="1"/>
    <circle cx="13" cy="15" r="1.5" fill="white" stroke="COLOR" stroke-width="1"/>
    <circle cx="17" cy="15" r="1.5" fill="white" stroke="COLOR" stroke-width="1"/>
  </svg>`,

  // Engin / groupe électrogène
  engin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="COLOR">
    <rect x="2" y="6" width="16" height="9" rx="1.5"/>
    <rect x="4" y="8" width="4" height="5" rx="0.5" fill="white" opacity="0.5"/>
    <path d="M10 8.5h5M10 10.5h5M10 12.5h3" stroke="white" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
    <path d="M9 4.5 7 6h6l-2-1.5H9z"/>
    <rect x="7" y="15" width="6" height="1.5" rx="0.5"/>
  </svg>`,
};

// Mapping VehicleIconType → composant Lucide (utilisé dans la liste latérale et le panneau détail)
const VEHICLE_LUCIDE_ICON: Record<VehicleIconType, React.ElementType> = {
  car:      Car,
  moto:     Bike,
  truck:    Truck,
  sprinter: Truck,
  engin:    Zap,
};

const getGpsVehicleIcon = (model: string, name: string): React.ElementType =>
  VEHICLE_LUCIDE_ICON[getVehicleIconType(model, name)];

const buildVehicleIcon = (obj: GpsObject, color: string, isMoving: boolean): L.DivIcon => {
  const type = getVehicleIconType(obj.model, obj.name);
  const svg = VEHICLE_SVG[type].split("COLOR").join(color);

  return L.divIcon({
    html: `<div style="
        width:40px;height:40px;border-radius:50%;
        background:${color}22;
        border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 ${isMoving ? "6px" : "0px"} ${color}33;
        transition:box-shadow 0.3s;
      ">${svg}</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// ─── Map Component (isolated to avoid re-init issues) ─────────────────────────
function LeafletMap({
  gpsData,
  selectedVehicle,
  loading,
  onSelectVehicle,
}: {
  gpsData: GpsObject[];
  selectedVehicle: GpsObject | null;
  loading: boolean;
  onSelectVehicle: (obj: GpsObject) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use a ref to track the map instance — never stored in state to avoid re-renders
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const initializedRef = useRef(false);

  // ── Init map ONCE ──
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;

    const map = L.map(container, {
      center: [-18.8792, 47.5079],
      zoom: 12,
      preferCanvas: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ prefix: "© OpenStreetMap" }).addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver: appelle invalidateSize() dès que le container
    // reçoit ses vraies dimensions (résout la carte invisible dans flex/grid).
    // Bien plus fiable qu'un setTimeout arbitraire.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          map.invalidateSize({ animate: false });
        }
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      initializedRef.current = false;
    };
  }, []); // empty deps — run once

  // ── Update markers when data changes ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove stale markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (gpsData.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    gpsData.forEach((obj) => {
      const lat = parseFloat(obj.lat);
      const lng = parseFloat(obj.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const status = getGpsStatus(obj);
      const color = STATUS_COLORS[status];
      const isMoving = status === "moving";

      const icon = buildVehicleIcon(obj, color, isMoving);

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:180px;font-family:sans-serif;padding:4px 0;">
          <p style="font-weight:700;margin:0 0 2px;font-size:14px;">${obj.name}</p>
          <p style="font-size:12px;color:#888;margin:0 0 8px;">${obj.model} · ${obj.plate_number}</p>
          <div style="display:grid;gap:3px;font-size:12px;">
            <div>🚀 <b>${parseFloat(obj.speed)} km/h</b></div>
            <div>📍 ${parseFloat(obj.odometer).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} km</div>
          </div>
        </div>
      `);
      marker.on("click", () => onSelectVehicle(obj));
      markersRef.current[obj.imei] = marker;
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [gpsData, onSelectVehicle]);

  // ── Pan to selected vehicle ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicle) return;
    const lat = parseFloat(selectedVehicle.lat);
    const lng = parseFloat(selectedVehicle.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 15, { animate: true });
      markersRef.current[selectedVehicle.imei]?.openPopup();
    }
  }, [selectedVehicle]);

  return (
    <div className="relative w-full h-full rounded-lg border bg-card overflow-hidden">
      {/* style height explicite requis par Leaflet — h-full seul ne suffit pas
          quand le parent est un container flex/grid sans hauteur résolue au mount */}
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 0 }} />
      {loading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

// ─── Main LiveTracking Page ───────────────────────────────────────────────────
interface LiveTrackingProps {
  customers: Customer[];
}

export default function LiveTracking({ customers }: LiveTrackingProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [gpsData, setGpsData] = useState<GpsObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<GpsObject | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const customersWithKey = customers.filter((c) => c.api_key);

  const fetchGps = useCallback(async (customer: Customer) => {
    if (!customer.api_key) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGpsObjects(customer.api_key);
      setGpsData(data);
      setLastRefresh(new Date());
    } catch {
      setError("Impossible de contacter l'API GPS. Vérifiez la clé API.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setSelectedVehicle(null);
    setGpsData([]);
    fetchGps(c);
  };

  // Auto-refresh
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh && selectedCustomer) {
      intervalRef.current = setInterval(() => fetchGps(selectedCustomer), 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, selectedCustomer, fetchGps]);

  const counts = {
    moving: gpsData.filter((o) => getGpsStatus(o) === "moving").length,
    idle: gpsData.filter((o) => getGpsStatus(o) === "idle").length,
    stopped: gpsData.filter((o) => getGpsStatus(o) === "stopped").length,
    offline: gpsData.filter((o) => getGpsStatus(o) === "offline").length,
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Live Tracking
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          </h1>
          <p className="text-muted-foreground">Suivi en temps réel de la flotte</p>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="rounded-lg border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Radio className="w-4 h-4 text-primary flex-shrink-0" />
          <select
            value={selectedCustomer?.id ?? ""}
            onChange={(e) => {
              const c = customers.find((c) => c.id === parseInt(e.target.value));
              if (c) handleSelectCustomer(c);
            }}
            className="h-9 flex-1 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">-- Sélectionner un client --</option>
            {customersWithKey.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedCustomer && (
          <>
            <button
              onClick={() => fetchGps(selectedCustomer)}
              disabled={loading}
              className="h-9 px-3 rounded-md border bg-background hover:bg-muted text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
            <button
              onClick={() => setAutoRefresh((p) => !p)}
              className={`h-9 px-3 rounded-md border text-sm flex items-center gap-2 transition-colors ${
                autoRefresh
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-background hover:bg-muted"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`} />
              Auto 30s
            </button>
            {lastRefresh && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </>
        )}

        {/* Clients sans clé API */}
        {customers.filter((c) => !c.api_key).length > 0 && !selectedCustomer && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
            <WifiOff className="w-3 h-3" />
            {customers.filter((c) => !c.api_key).length} client(s) sans clé API
          </span>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ── Content (only when data available) ── */}
      {gpsData.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {(["moving", "idle", "stopped", "offline"] as VehicleStatus[]).map((s) => (
              <div key={s} className={`rounded-lg border ${STATUS_CFG[s].bg} p-3 flex items-center gap-3`}>
                <div>
                  <p className={`text-2xl font-bold ${STATUS_CFG[s].color}`}>{counts[s]}</p>
                  <p className="text-xs text-muted-foreground">{STATUS_CFG[s].label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map + vehicle list
              gridTemplateRows explicite : sans ça les enfants col-span
              ne reçoivent pas la hauteur du parent dans un grid CSS */}
          <div
            className="grid grid-cols-12 gap-4"
            style={{ height: 520, gridTemplateRows: "520px" }}
          >
            {/* wrapper hauteur explicite — h-full ne suffit pas dans un grid
                dont les rows ne sont pas déclarées en CSS */}
            <div className="col-span-8" style={{ height: 520 }}>
              <LeafletMap
                gpsData={gpsData}
                selectedVehicle={selectedVehicle}
                loading={loading}
                onSelectVehicle={setSelectedVehicle}
              />
            </div>

            {/* Vehicle list */}
            <div className="col-span-4 rounded-lg border bg-card flex flex-col overflow-hidden" style={{ height: 520 }}>
              <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
                <p className="text-sm font-semibold">{gpsData.length} véhicule(s)</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y">
                {gpsData.map((obj) => {
                  const status = getGpsStatus(obj);
                  const cfg = STATUS_CFG[status];
                  const GpsIcon = getGpsVehicleIcon(obj.model, obj.name);
                  const speed = parseFloat(obj.speed ?? "0");
                  const battery = Math.min(100, parseInt(obj.params?.batl ?? "0") * (100 / 6));
                  const isSelected = selectedVehicle?.imei === obj.imei;

                  return (
                    <div
                      key={obj.imei}
                      onClick={() => setSelectedVehicle(isSelected ? null : obj)}
                      className={`px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/20 ${
                        isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${cfg.bg} border`}>
                          <GpsIcon className={`w-3 h-3 ${cfg.color}`} />
                        </div>
                        <p className="text-xs font-semibold truncate flex-1">{obj.name}</p>
                        <span className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "moving" ? "animate-pulse" : ""}`} />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate pl-8 mb-1">{obj.model}</p>
                      <div className="flex items-center gap-3 pl-8">
                        <span className="text-xs flex items-center gap-0.5 text-muted-foreground">
                          <Gauge className="w-3 h-3" /> {speed}km/h
                        </span>
                        <span className={`text-xs flex items-center gap-0.5 ${battery < 30 ? "text-rose-500" : "text-muted-foreground"}`}>
                          <Battery className="w-3 h-3" /> {battery}%
                        </span>
                        <span className="text-xs text-muted-foreground">{formatLastSeen(obj.dt_server)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected vehicle detail */}
          {selectedVehicle && (() => {
            const GpsIcon = getGpsVehicleIcon(selectedVehicle.model, selectedVehicle.name);
            const status = getGpsStatus(selectedVehicle);
            const cfg = STATUS_CFG[status];
            return (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg} border`}>
                      <GpsIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedVehicle.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedVehicle.model} · {selectedVehicle.plate_number}
                      </p>
                    </div>
                    <span className={`ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <button onClick={() => setSelectedVehicle(null)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <InfoBox label="Vitesse">{parseFloat(selectedVehicle.speed)} km/h</InfoBox>
                  <InfoBox label="Kilométrage">
                    {parseFloat(selectedVehicle.odometer).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} km
                  </InfoBox>
                  <InfoBox label="Batterie">
                    {Math.min(100, parseInt(selectedVehicle.params?.batl ?? "0") * (100 / 6))}%
                  </InfoBox>
                  <InfoBox label="GPS">{selectedVehicle.params?.gpslev ?? "—"}/15</InfoBox>
                  <InfoBox label="GSM">{selectedVehicle.params?.gsmlev ?? "—"}/4</InfoBox>
                  <InfoBox label="Dernier signal">{formatLastSeen(selectedVehicle.dt_server)}</InfoBox>
                </div>

                {selectedVehicle.custom_fields?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedVehicle.custom_fields.map((cf, i) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-muted border text-xs">
                        <span className="text-muted-foreground">{cf.name}:</span> {cf.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}

      {/* ── Empty state ── */}
      {!selectedCustomer && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
          <div className="relative">
            <Radio className="w-16 h-16 opacity-10" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400/30 border border-emerald-400 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/60">Aucun client sélectionné</p>
            <p className="text-xs mt-1">Sélectionnez un client pour afficher son suivi en temps réel</p>
          </div>
        </div>
      )}

      {selectedCustomer && !loading && gpsData.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Wifi className="w-10 h-10 opacity-20" />
          <p className="text-sm">Aucun véhicule GPS trouvé pour ce client</p>
        </div>
      )}
    </div>
  );
}