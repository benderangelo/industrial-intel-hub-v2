import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback, useMemo, useState } from "react";

interface GlobeConnection {
  from: [number, number];
  to: [number, number];
}

interface GlobeMarker {
  lat: number;
  lng: number;
  label?: string;
  id?: string;
  demand?: string;
  trend?: string;
  equipment?: string[];
}

interface GlobeTheme {
  dotColor: string;
  arcColor: string;
  markerColor: string;
  outlineColor: string;
  glowColor: string;
  labelColor: string;
}

interface GlobeProps {
  className?: string;
  size?: number;
  autoRotateSpeed?: number;
  connections?: GlobeConnection[];
  markers?: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
}

const DEFAULT_MARKERS: GlobeMarker[] = [
  { lat: 37.78, lng: -122.42, label: "North America" },
  { lat: 51.51, lng: -0.13, label: "Europe" },
  { lat: -15.79, lng: -47.88, label: "LATAM" },
  { lat: 1.35, lng: 103.82, label: "APAC" },
  { lat: 25.2, lng: 55.27, label: "Africa / Middle East" },
];

const DEFAULT_CONNECTIONS: GlobeConnection[] = [
  { from: [37.78, -122.42], to: [51.51, -0.13] },
  { from: [51.51, -0.13], to: [1.35, 103.82] },
  { from: [37.78, -122.42], to: [-15.79, -47.88] },
  { from: [1.35, 103.82], to: [25.2, 55.27] },
  { from: [25.2, 55.27], to: [51.51, -0.13] },
];

function hslVar(variable: string, alpha = 1) {
  if (typeof window === "undefined") return `hsla(0, 0%, 100%, ${alpha})`;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `hsla(${value.replace(/\s+/g, " ").replace(/ /g, ", ")}, ${alpha})` : `hsla(0, 0%, 100%, ${alpha})`;
}

function latLngToXYZ(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

function project(x: number, y: number, z: number, cx: number, cy: number, fov: number): [number, number, number] {
  const scale = fov / (fov + z);
  return [x * scale + cx, y * scale + cy, z];
}

export function InteractiveGlobe({
  className,
  size = 600,
  autoRotateSpeed = 0.0022,
  connections = DEFAULT_CONNECTIONS,
  markers = DEFAULT_MARKERS,
  onMarkerClick,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotYRef = useRef(0.45);
  const rotXRef = useRef(0.28);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dotsRef = useRef<[number, number, number][]>([]);
  const [theme, setTheme] = useState<GlobeTheme>({
    dotColor: "hsla(0, 0%, 100%, 0.3)",
    arcColor: "hsla(0, 0%, 100%, 0.4)",
    markerColor: "hsla(0, 0%, 100%, 1)",
    outlineColor: "hsla(0, 0%, 100%, 0.1)",
    glowColor: "hsla(0, 0%, 100%, 0.06)",
    labelColor: "hsla(0, 0%, 100%, 0.6)",
  });
  const [hoveredMarker, setHoveredMarker] = useState<{ marker: GlobeMarker; x: number; y: number } | null>(null);

  const stableMarkers = useMemo(() => markers, [markers]);
  const stableConnections = useMemo(() => connections, [connections]);

  useEffect(() => {
    const syncTheme = () => {
      setTheme({
        dotColor: hslVar("--accent", 0.7),
        arcColor: hslVar("--primary", 0.45),
        markerColor: hslVar("--primary", 1),
        outlineColor: hslVar("--border", 0.7),
        glowColor: hslVar("--accent", 0.12),
        labelColor: hslVar("--muted-foreground", 0.85),
      });
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dots: [number, number, number][] = [];
    const numDots = 1200;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numDots; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.cos(phi);
      const z = Math.sin(theta) * Math.sin(phi);
      dots.push([x, y, z]);
    }

    dotsRef.current = dots;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;
    const fov = 600;

    if (!dragRef.current.active) rotYRef.current += autoRotateSpeed;

    timeRef.current += 0.015;
    const time = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.5);
    glowGrad.addColorStop(0, theme.glowColor);
    glowGrad.addColorStop(1, hslVar("--accent", 0));
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = theme.outlineColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    const ry = rotYRef.current;
    const rx = rotXRef.current;

    for (const dot of dotsRef.current) {
      let [x, y, z] = dot;
      x *= radius;
      y *= radius;
      z *= radius;

      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);

      if (z > 0) continue;

      const [sx, sy] = project(x, y, z, cx, cy, fov);
      const depthAlpha = Math.max(0.12, 1 - (z + radius) / (2 * radius));

      ctx.beginPath();
      ctx.arc(sx, sy, 1 + depthAlpha, 0, Math.PI * 2);
      ctx.fillStyle = theme.dotColor.replace(/,\s*[\d.]+\)$/, `, ${depthAlpha.toFixed(2)})`);
      ctx.fill();
    }

    for (const conn of stableConnections) {
      const [lat1, lng1] = conn.from;
      const [lat2, lng2] = conn.to;

      let [x1, y1, z1] = latLngToXYZ(lat1, lng1, radius);
      let [x2, y2, z2] = latLngToXYZ(lat2, lng2, radius);

      [x1, y1, z1] = rotateX(x1, y1, z1, rx);
      [x1, y1, z1] = rotateY(x1, y1, z1, ry);
      [x2, y2, z2] = rotateX(x2, y2, z2, rx);
      [x2, y2, z2] = rotateY(x2, y2, z2, ry);

      if (z1 > radius * 0.3 && z2 > radius * 0.3) continue;

      const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov);
      const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const midZ = (z1 + z2) / 2;
      const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
      const arcHeight = radius * 1.23;
      const elevX = (midX / midLen) * arcHeight;
      const elevY = (midY / midLen) * arcHeight;
      const elevZ = (midZ / midLen) * arcHeight;
      const [scx, scy] = project(elevX, elevY, elevZ, cx, cy, fov);

      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.quadraticCurveTo(scx, scy, sx2, sy2);
      ctx.strokeStyle = theme.arcColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const t = (Math.sin(time * 1.2 + lat1 * 0.1) + 1) / 2;
      const tx = (1 - t) * (1 - t) * sx1 + 2 * (1 - t) * t * scx + t * t * sx2;
      const ty = (1 - t) * (1 - t) * sy1 + 2 * (1 - t) * t * scy + t * t * sy2;

      ctx.beginPath();
      ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = theme.markerColor;
      ctx.fill();
    }

    for (const marker of stableMarkers) {
      let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);

      if (z > radius * 0.12) continue;

      const [sx, sy] = project(x, y, z, cx, cy, fov);
      const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5;

      ctx.beginPath();
      ctx.arc(sx, sy, 4 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = theme.markerColor.replace(/,\s*[\d.]+\)$/, `, ${(0.18 + pulse * 0.18).toFixed(2)})`);
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = theme.markerColor;
      ctx.fill();

      if (marker.label) {
        ctx.font = "500 10px Inter, system-ui, sans-serif";
        ctx.fillStyle = theme.labelColor;
        ctx.fillText(marker.label, sx + 8, sy + 3);
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [autoRotateSpeed, stableConnections, stableMarkers, theme]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startRotY: rotYRef.current,
      startRotX: rotXRef.current,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    rotYRef.current = dragRef.current.startRotY + dx * 0.005;
    rotXRef.current = Math.max(-1, Math.min(1, dragRef.current.startRotX + dy * 0.005));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onMarkerClick || dragRef.current.active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.36;
      const fov = 600;
      const ry = rotYRef.current;
      const rx = rotXRef.current;

      let closest: GlobeMarker | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const marker of stableMarkers) {
        let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
        [x, y, z] = rotateX(x, y, z, rx);
        [x, y, z] = rotateY(x, y, z, ry);

        if (z > radius * 0.12) continue;

        const [sx, sy] = project(x, y, z, cx, cy, fov);
        const distance = Math.hypot(clickX - sx, clickY - sy);

        if (distance < 18 && distance < closestDistance) {
          closest = marker;
          closestDistance = distance;
        }
      }

      if (closest) onMarkerClick(closest);
    },
    [onMarkerClick, stableMarkers],
  );

  const onCanvasMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pointX = e.clientX - rect.left;
    const pointY = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.36;
    const fov = 600;
    const ry = rotYRef.current;
    const rx = rotXRef.current;

    let hovered: { marker: GlobeMarker; x: number; y: number } | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const marker of stableMarkers) {
      let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);

      if (z > radius * 0.12) continue;

      const [sx, sy] = project(x, y, z, cx, cy, fov);
      const distance = Math.hypot(pointX - sx, pointY - sy);

      if (distance < 20 && distance < closestDistance) {
        hovered = { marker, x: sx, y: sy };
        closestDistance = distance;
      }
    }

    setHoveredMarker(hovered);
  }, [stableMarkers]);

  const onCanvasLeave = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    onPointerUp(e);
    setHoveredMarker(null);
  }, [onPointerUp]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[calc(var(--radius)+0.5rem)] border border-border bg-secondary/40 shadow-[0_20px_60px_hsl(var(--background)/0.45)]",
        className,
      )}
      style={{ height: size, maxHeight: size }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.08),transparent_58%)]" />
      <canvas
        ref={canvasRef}
        className="relative z-10 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onCanvasLeave}
        onClick={onCanvasClick}
        onMouseMove={onCanvasMove}
      />
      {hoveredMarker && (
        <div
          className="pointer-events-none absolute z-20 w-64 rounded-xl border border-border bg-card/95 p-3 shadow-[0_18px_50px_hsl(var(--background)/0.45)] backdrop-blur-sm"
          style={{ left: hoveredMarker.x + 18, top: hoveredMarker.y - 24 }}
        >
          <p className="text-sm font-semibold text-foreground">{hoveredMarker.marker.label}</p>
          {hoveredMarker.marker.demand && <p className="mt-1 text-xs text-muted-foreground">{hoveredMarker.marker.demand}</p>}
          {hoveredMarker.marker.trend && <p className="mt-2 text-xs font-medium text-chart-success">{hoveredMarker.marker.trend}</p>}
          {!!hoveredMarker.marker.equipment?.length && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hoveredMarker.marker.equipment.map((item) => (
                <span key={item} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { InteractiveGlobe as Component };