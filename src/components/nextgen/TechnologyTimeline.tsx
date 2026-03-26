import { useMemo, useState } from "react";
import { roadmapItems, type EngineeringSubsystemKey, type RoadmapItem, type RoadmapPriority } from "@/data/caseData";
import { Badge } from "@/components/ui/badge";

const SUBSYSTEM_LABELS: Record<EngineeringSubsystemKey, string> = {
  structure: "Estrutura", powertrain: "Powertrain", hydraulics: "Hidráulica",
  transmission: "Transmissão", implements: "Implementos", cabin: "Cabine",
};

const SUBSYSTEM_COLORS: Record<EngineeringSubsystemKey, string> = {
  structure: "hsl(209 66% 57%)", powertrain: "hsl(var(--primary))", hydraulics: "hsl(145 63% 49%)",
  transmission: "hsl(267 83% 58%)", implements: "hsl(37 90% 51%)", cabin: "hsl(6 78% 57%)",
};

const PRIORITY_COLORS: Record<RoadmapPriority, string> = {
  critical: "hsl(var(--destructive))", high: "hsl(var(--chart-warning))", medium: "hsl(var(--primary))", low: "hsl(var(--muted-foreground))",
};

const PHASE_LABELS = ["MY2027", "MY2028", "MY2029"];
const PHASE_WIDTHS = [1, 1, 1]; // equal width phases

interface TimelineBarProps {
  item: RoadmapItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

function TimelineBar({ item, isHovered, onHover }: TimelineBarProps) {
  const phaseStart = (item.phase - 1) / 3;
  const phaseWidth = 1 / 3;
  const color = PRIORITY_COLORS[item.priority];

  return (
    <div
      className="relative h-9 w-full"
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="absolute top-1 h-7 rounded-lg transition-[opacity,transform,box-shadow] duration-200"
        style={{
          left: `${phaseStart * 100}%`,
          width: `${phaseWidth * 100 - 1}%`,
          backgroundColor: color,
          opacity: isHovered ? 1 : 0.75,
          transform: isHovered ? "scaleY(1.15)" : "scaleY(1)",
          boxShadow: isHovered ? `0 6px 20px ${color.replace("hsl(", "hsla(").replace(")", " / 0.35)")}` : "none",
          borderLeft: `3px solid ${SUBSYSTEM_COLORS[item.subsystem]}`,
        }}
      >
        <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white truncate">
          {item.title.length > 35 ? item.title.slice(0, 35) + "…" : item.title}
        </span>
      </div>

      {isHovered && (
        <div className="absolute -bottom-24 left-1/2 z-50 w-72 -translate-x-1/2 rounded-xl border border-border bg-card p-3 shadow-xl">
          <p className="text-xs font-bold text-foreground">{item.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">Δ {item.scoreDelta}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.estimatedCostRange}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.affectedFamily}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.priority}</Badge>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{item.developmentTime}</p>
        </div>
      )}
    </div>
  );
}

export function TechnologyTimeline() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const groupedBySubsystem = useMemo(() => {
    const map = new Map<EngineeringSubsystemKey, RoadmapItem[]>();
    roadmapItems.forEach((item) => {
      const list = map.get(item.subsystem) ?? [];
      list.push(item);
      map.set(item.subsystem, list);
    });
    return Array.from(map.entries())
      .map(([subsystem, items]) => ({ subsystem, items: items.sort((a, b) => a.phase - b.phase) }))
      .sort((a, b) => b.items.length - a.items.length);
  }, []);

  // Build dependency lines
  const dependencies = useMemo(() => {
    return roadmapItems
      .filter((item) => item.dependencies.length > 0)
      .flatMap((item) => item.dependencies.map((depId) => ({ from: depId, to: item.id })));
  }, []);

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Technology Readiness Timeline</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">Evolução temporal por subsistema</h2>
        <p className="mt-1 text-sm text-muted-foreground">Barras agrupadas por subsistema e coloridas por prioridade. Hover para detalhes.</p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {(["critical", "high", "medium", "low"] as RoadmapPriority[]).map((p) => (
          <div key={p} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: PRIORITY_COLORS[p] }} />
            {p === "critical" ? "Crítico" : p === "high" ? "Alto" : p === "medium" ? "Médio" : "Baixo"}
          </div>
        ))}
        <span className="text-[10px] text-muted-foreground">│</span>
        {Object.entries(SUBSYSTEM_COLORS).slice(0, 4).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="h-3 w-1 rounded-full" style={{ backgroundColor: color }} />
            {SUBSYSTEM_LABELS[key as EngineeringSubsystemKey]}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Phase headers */}
          <div className="mb-2 flex border-b border-border pb-2">
            <div className="w-28 shrink-0" />
            {PHASE_LABELS.map((label, i) => (
              <div key={label} className="flex-1 text-center">
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold text-foreground">{label} — Fase {i + 1}</span>
              </div>
            ))}
          </div>

          {/* Subsystem rows */}
          {groupedBySubsystem.map(({ subsystem, items }) => (
            <div key={subsystem} className="mb-1">
              <div className="flex items-start">
                <div className="flex w-28 shrink-0 items-center gap-2 py-2">
                  <span className="h-4 w-1 rounded-full" style={{ backgroundColor: SUBSYSTEM_COLORS[subsystem] }} />
                  <span className="text-[11px] font-bold text-foreground">{SUBSYSTEM_LABELS[subsystem]}</span>
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">{items.length}</span>
                </div>
                <div className="flex-1">
                  {items.map((item) => (
                    <TimelineBar key={item.id} item={item} isHovered={hoveredId === item.id} onHover={setHoveredId} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Dependency indicators */}
          {dependencies.length > 0 && (
            <div className="mt-3 rounded-xl bg-secondary/30 px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Dependências cruzadas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dependencies.map(({ from, to }) => {
                  const fromItem = roadmapItems.find((i) => i.id === from);
                  const toItem = roadmapItems.find((i) => i.id === to);
                  if (!fromItem || !toItem) return null;
                  return (
                    <div
                      key={`${from}-${to}`}
                      className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted"
                      onMouseEnter={() => setHoveredId(to)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <span className="font-semibold text-foreground">{fromItem.title.slice(0, 25)}…</span>
                      <span className="text-primary">→</span>
                      <span className="font-semibold text-foreground">{toItem.title.slice(0, 25)}…</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
