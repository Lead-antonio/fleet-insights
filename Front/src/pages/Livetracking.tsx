import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Radio, RefreshCw, Clock, AlertTriangle, Loader2,
  Gauge, Battery, Wifi, WifiOff, X, Car, Bike, Truck, Zap,
  Square,
  Navigation,
  ChevronDown,
  MapPin,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

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

const STATUS_CFG: Record<
  VehicleStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  idle: {
    label: "En ligne",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  moving: {
    label: "En mouvement",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    dot: "bg-sky-400",
  },
  stopped: {
    label: "Arrêté",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    dot: "bg-rose-400",
  },
  offline: {
    label: "Hors ligne",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },
};

const STATUS_COLORS: Record<VehicleStatus, string> = {
  idle: "#22c55e",     // vert
  moving: "#3b82f6",   // bleu
  stopped: "#ef4444",  // rouge
  offline: "#f59e0b", 
};

// const formatLastSeen = (dtStr: string): string => {
//   if (!dtStr || dtStr === "0000-00-00 00:00:00") return "—";
//   const diff = Date.now() - new Date(dtStr).getTime();
//   const m = Math.floor(diff / 60000);
//   if (m < 1) return "À l'instant";
//   if (m < 60) return `Il y a ${m}m`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `Il y a ${h}h`;
//   return `Il y a ${Math.floor(h / 24)}j`;
// };

const formatLastSeen = (dtStr: string, lang: "fr" | "en" = "fr"): string => {
  if (!dtStr || dtStr === "0000-00-00 00:00:00") return "—";

  const diff = Date.now() - new Date(dtStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (lang === "fr") {
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m}m`;
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${d}j`;
  } else {
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }
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


const VEHICLE_SVG: Record<VehicleIconType, string> = {
  car: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>`,

  moto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round">
    <circle cx="6" cy="16" r="3"/>
    <circle cx="18" cy="16" r="3"/>
    <path d="M9 16L11 9h3l3 4" fill="none"/>
    <path d="M11 9l2-3h2"/>
  </svg>`,

  truck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
    <rect x="2" y="8" width="13" height="7" rx="1"/>
    <path d="M15 11h4l2 2v3h-6v-5z"/>
    <circle cx="6" cy="17" r="2"/>
    <circle cx="18" cy="17" r="2"/>
  </svg>`,

  sprinter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
    <path d="M3 10l2-4h11l2 4v5H3v-5z"/>
    <rect x="14" y="10" width="5" height="5" rx="1"/>
    <circle cx="6.5" cy="17" r="2"/>
    <circle cx="17.5" cy="17" r="2"/>
  </svg>`,

  engin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white" stroke="white" stroke-width="1.5">
    <rect x="4" y="7" width="12" height="8" rx="1" fill="white"/>
    <rect x="16" y="9" width="4" height="4" rx="1"/>
    <rect x="2" y="13" width="20" height="3" rx="1"/>
    <circle cx="6" cy="17" r="2"/>
    <circle cx="18" cy="17" r="2"/>
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
    className: 'custom-marker',
    html: `<div class="vehicle-marker ${color}" style=" background:${color};">${svg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

// Hook reverse geocoding
function useReverseGeocode(lat?: string | number, lng?: string | number) {
  const [location, setLocation] = useState<{
    display: string;
    road: string;
    city: string;
    raw: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Guard : si pas de coords, reset et sortie
    if (!lat || !lng) {
      setLocation(null);
      return;
    }

    const controller = new AbortController();
    setLocationLoading(true);

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "VehicleTracker/1.0" },
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const a = data.address ?? {};
        const road = a.road ?? a.highway ?? a.path ?? a.footway ?? "Route inconnue";
        const ref = a.ref;
        const roadLabel = ref ? `${ref} — ${road}` : road;
        const city = a.city ?? a.town ?? a.village ?? a.county ?? a.state ?? "";

        setLocation({
          display: data.display_name?.split(",").slice(0, 2).join(", ") ?? "",
          road: roadLabel,
          city: `${city}${a.country ? `, ${a.country}` : ""}`,
          raw: `${parseFloat(String(lat)).toFixed(4)}, ${parseFloat(String(lng)).toFixed(4)}`,
        });
      })
      .catch(() => setLocation(null))
      .finally(() => setLocationLoading(false));

    return () => controller.abort();
  }, [lat, lng]);

  return { location, locationLoading };
}

export default function LiveTracking({ customers }: LiveTrackingProps) {
  const { t, language } = useLanguage();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [gpsData, setGpsData] = useState<GpsObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<GpsObject | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

   const { location, locationLoading  } = useReverseGeocode(
      selectedVehicle?.lat,
      selectedVehicle?.lng
    );

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
      setError(t.vehicule.live_tracking.error_api);
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

  const LivekpiCards = [
    { label: t.fleet.online, value: counts.idle, icon: Wifi, color: 'bg-success' },
    { label: t.fleet.offline, value: counts.offline, icon: WifiOff, color: 'bg-warning' },
    { label: t.fleet.moving, value: counts.moving, icon: Navigation, color: 'bg-info' },
    { label: t.fleet.stopped, value: counts.stopped, icon: Square, color: 'bg-destructive' },
  ];



  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Controls bar ── */}
      <div className="bg-background border border-border/50 rounded-xl px-5 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {t.vehicule.live_tracking.title}
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.vehicule.live_tracking.live}
          </span>
        </div>

        {/* Sélecteur client */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <select
            value={selectedCustomer?.id ?? ""}
            onChange={(e) => {
              const c = customers.find((c) => c.id === parseInt(e.target.value));
              if (c) handleSelectCustomer(c);
            }}
            className="w-full h-9 pl-3 pr-8 rounded-lg border border-border/70 bg-muted/40
                      text-sm font-medium text-foreground appearance-none cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
                      transition-colors"
          >
            <option value="">{t.vehicule.live_tracking.select_customer}</option>
            {customersWithKey.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        </div>

        {selectedCustomer && (
          <>
            <button
              onClick={() => fetchGps(selectedCustomer)}
              disabled={loading}
              className="h-9 px-3 rounded-md border bg-background hover:bg-muted text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {t.vehicule.live_tracking.refresh}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LivekpiCards.map((kpi) => (
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

          {/* Map + vehicle list
              gridTemplateRows explicite : sans ça les enfants col-span
              ne reçoivent pas la hauteur du parent dans un grid CSS */}
          <div
            className="grid grid-cols-12 gap-4"
            style={{ height: 520, gridTemplateRows: "700px" }}
          >
            {/* wrapper hauteur explicite — h-full ne suffit pas dans un grid
                dont les rows ne sont pas déclarées en CSS */}
            <div className="col-span-9" style={{height: 520 }}>
              <LeafletMap
                gpsData={gpsData}
                selectedVehicle={selectedVehicle}
                loading={loading}
                onSelectVehicle={setSelectedVehicle}
              />
            </div>

            {/* Vehicle list */}
            <div className="col-span-3 rounded-lg border bg-card flex flex-col overflow-hidden" style={{ height: 520 }}>
              <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
                <p className="text-sm font-semibold">{gpsData.length} {t.vehicule.pagination.title}</p>
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
                        {/* <span className={`text-xs flex items-center gap-0.5 ${battery < 30 ? "text-rose-500" : "text-muted-foreground"}`}>
                          <Battery className="w-3 h-3" /> {battery}%
                        </span> */}
                        <span className="text-xs text-muted-foreground">{formatLastSeen(obj.dt_server, language)}</span>
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

                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                  <InfoBox label="Vitesse">{parseFloat(selectedVehicle.speed)} km/h</InfoBox>
                  <InfoBox label="Kilométrage">
                    {parseFloat(selectedVehicle.odometer).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} km
                  </InfoBox>
                  <InfoBox label="Dernier signal">{formatLastSeen(selectedVehicle.dt_server, language)}</InfoBox>
                </div>
                
                <div className="mt-3 flex items-start gap-3 rounded-md bg-muted/50 p-3 border">
                  <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  {locationLoading ? (
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                      <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
                    </div>
                  ) : location ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">{location.display}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{location.road}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{location.city} · {location.raw}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Position non disponible</p>
                  )}
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
            <p className="text-sm font-medium text-foreground/60">{t.vehicule.live_tracking.no_result}</p>
            <p className="text-xs mt-1">{t.vehicule.live_tracking.no_result_info}</p>
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