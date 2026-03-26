import { useEffect, useMemo, useRef, useState } from "react";
import L, { type LatLngExpression, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import { cn } from "@/lib/utils";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface InteractiveMapMarker {
  id: string;
  position: [number, number];
  title: string;
  subtitle?: string;
  content: string;
  variant?: "hub" | "dominance" | "commercial" | "pressure";
  isActive?: boolean;
}

interface InteractiveMapProps {
  className?: string;
  center: [number, number];
  zoom?: number;
  markers: InteractiveMapMarker[];
  lines?: Array<{
    id: string;
    positions: [number, number][];
  }>;
  radius?: number;
  showLegend?: boolean;
  activeMarkerId?: string | null;
  onMarkerClick?: (marker: InteractiveMapMarker) => void;
}

const markerTheme = {
  hub: { color: "hsl(var(--muted-foreground))", ring: "hsl(var(--muted-foreground) / 0.18)", size: 18 },
  dominance: { color: "hsl(var(--primary))", ring: "hsl(var(--primary) / 0.18)", size: 18 },
  commercial: { color: "hsl(var(--accent))", ring: "hsl(var(--accent) / 0.18)", size: 14 },
  pressure: { color: "hsl(var(--destructive))", ring: "hsl(var(--destructive) / 0.18)", size: 14 },
} as const;

const makeMarkerIcon = (
  variant: NonNullable<InteractiveMapMarker["variant"]> = "commercial",
  isActive = false,
) => {
  const theme = markerTheme[variant];
  const size = isActive ? theme.size + 4 : theme.size;
  const ringSize = isActive ? 5 : 3;

  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${theme.color};box-shadow:0 0 0 ${ringSize}px ${theme.ring};border:2px solid hsl(var(--background));transform:${isActive ? "scale(1.03)" : "scale(1)"};transition:transform 180ms ease,box-shadow 180ms ease;"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function InteractiveMap({
  className,
  center,
  zoom = 4,
  markers,
  lines = [],
  radius = 450000,
  showLegend = false,
  activeMarkerId,
  onMarkerClick,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const [mounted, setMounted] = useState(false);

  const invalidateMapSize = () => {
    const map = mapRef.current;
    if (!map) return;

    requestAnimationFrame(() => {
      map.invalidateSize(true);
    });
  };

  const bounds = useMemo(() => {
    const points: LatLngExpression[] = markers.map((marker) => marker.position as LatLngExpression);
    return points.length > 0 ? L.latLngBounds(points) : null;
  }, [markers]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    invalidateMapSize();
    const timeoutIds = [80, 180, 320, 520, 820].map((delay) => window.setTimeout(() => {
      invalidateMapSize();
    }, delay));

    const resizeObserver = new ResizeObserver(() => {
      invalidateMapSize();
    });

    resizeObserver.observe(mapContainerRef.current);

    const animationHost = mapContainerRef.current.closest("[data-state]") ?? mapContainerRef.current.parentElement;
    const handleVisualUpdate = () => invalidateMapSize();

    animationHost?.addEventListener("transitionend", handleVisualUpdate);
    animationHost?.addEventListener("animationend", handleVisualUpdate);
    window.addEventListener("resize", handleVisualUpdate);

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      resizeObserver.disconnect();
      animationHost?.removeEventListener("transitionend", handleVisualUpdate);
      animationHost?.removeEventListener("animationend", handleVisualUpdate);
      window.removeEventListener("resize", handleVisualUpdate);
      layerGroupRef.current?.clearLayers();
      layerGroupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [mounted, center, zoom]);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    const timeoutIds = [0, 150, 300].map((delay) => window.setTimeout(() => {
      invalidateMapSize();
    }, delay));

    return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  }, [mounted, className, showLegend, markers.length, lines.length]);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerRefs.current.clear();

    L.circle(center, {
      radius,
      color: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary))",
      fillOpacity: 0.08,
      weight: 1.5,
    }).addTo(layerGroup);

    lines.forEach((line) => {
      L.polyline(line.positions, {
        color: "hsl(var(--accent))",
        weight: 2,
        opacity: 0.7,
        dashArray: "8 8",
      }).addTo(layerGroup);
    });

    markers.forEach((marker) => {
      const leafletMarker = L.marker(marker.position, { icon: makeMarkerIcon(marker.variant, marker.isActive) })
        .bindPopup(
          `<div style="min-width:220px"><p style="margin:0 0 4px;font-size:14px;font-weight:600;color:hsl(var(--foreground))">${marker.title}</p>${marker.subtitle ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:hsl(var(--muted-foreground))">${marker.subtitle}</p>` : ""}<p style="margin:0;font-size:12px;line-height:1.45;color:hsl(var(--muted-foreground))">${marker.content}</p></div>`,
        )
        .addTo(layerGroup);

      leafletMarker.on("click", () => onMarkerClick?.(marker));
      markerRefs.current.set(marker.id, leafletMarker);
    });

    if (bounds && bounds.isValid() && markers.length > 1) {
      map.fitBounds(bounds, { padding: [72, 72], maxZoom: 5 });
    } else {
      map.setView(center, zoom);
    }

    invalidateMapSize();
  }, [bounds, center, lines, markers, onMarkerClick, radius, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeMarkerId) return;

    const marker = markerRefs.current.get(activeMarkerId);
    if (!marker) return;

    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 6), {
      animate: true,
      duration: 0.65,
    });
    marker.openPopup();
  }, [activeMarkerId, markers]);

  if (!mounted) {
    return <div className={cn("h-[520px] w-full animate-pulse rounded-xl border border-border bg-secondary/40", className)} />;
  }

  return (
    <div className={cn("relative h-[520px] w-full overflow-hidden rounded-xl border border-border bg-secondary/40", className)}>
      {showLegend && (
        <div className="absolute left-4 top-4 z-[500] rounded-xl border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Legenda</p>
          <div className="mt-2 space-y-1.5 text-xs text-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Domínio de mercado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span>Comercialização global</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
              <span>Hub regional</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span>Pressão competitiva</span>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}