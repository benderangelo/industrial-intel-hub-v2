import { ArrowLeftRight, MapPinned, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  caseMachines,
  regionDemand,
} from "@/data/caseData";
import { EquipmentImage } from "@/components/EquipmentImage";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";

const EV_MODEL_IDS = new Set(["580ev", "tl100ev"]);
const TOTAL_MACHINE_FAMILIES = new Set(caseMachines.map((m) => m.family)).size;
const MAX_REGION_LINEUP = Math.max(...regionDemand.map((r) => r.equipmentIds.length));
const RADAR_METRICS = [
  { metric: "Demand", description: "Pressão de mercado e intensidade operacional." },
  { metric: "Trend", description: "Momentum regional baseado na variação YoY." },
  { metric: "EV", description: "Adoção relativa de equipamentos eletrificados." },
  { metric: "Diversity", description: "Amplitude de famílias e categorias em campo." },
  { metric: "Lineup", description: "Profundidade de portfólio monitorada na região." },
];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const parseTrendValue = (trend?: string) => { const m = trend?.match(/-?\d+/); return m ? Number(m[0]) : 0; };
const getTrendLabel = (trend?: string) => trend ?? "Stable";
const formatMetricValue = (value: number) => `${Math.round(value)}`;

const getDemandScore = (demand: string, equipmentCount: number) => {
  const d = demand.toLowerCase();
  let score = 38 + equipmentCount * 10;
  if (d.includes("alta demanda")) score += 16;
  if (d.includes("obras pesadas")) score += 14;
  if (d.includes("produtividade")) score += 12;
  if (d.includes("robustez") || d.includes("uptime")) score += 10;
  if (d.includes("eletrifica") || d.includes("ev")) score += 8;
  if (d.includes("controle 3d")) score += 6;
  return clamp(score);
};

interface RegionalContrastProps {
  compareLeftInit: string;
  onOpenRegion: (region: (typeof regionDemand)[number]) => void;
  machineById: Map<string, (typeof caseMachines)[number]>;
}

export function RegionalContrast({ compareLeftInit, onOpenRegion, machineById }: RegionalContrastProps) {
  const [compareLeft, setCompareLeft] = useState<string>(compareLeftInit);
  const [compareRight, setCompareRight] = useState<string>("Europe");

  const compareLeftData = regionDemand.find((r) => r.region === compareLeft) ?? regionDemand[0];
  const compareRightData = regionDemand.find((r) => r.region === compareRight) ?? regionDemand[1] ?? regionDemand[0];

  const comparisonVisual = useMemo(() => {
    const buildMetrics = (region: (typeof regionDemand)[number]) => {
      const machines = region.equipmentIds.map((id) => machineById.get(id)).filter(Boolean);
      const families = new Set(machines.map((m) => m!.family)).size;
      const cats = new Set(machines.map((m) => m!.category)).size;
      const ev = region.equipmentIds.filter((id) => EV_MODEL_IDS.has(id)).length;
      const trend = parseTrendValue(region.trend);
      return {
        demandScore: getDemandScore(region.demand, region.equipmentIds.length),
        trendScore: clamp(50 + trend * 2),
        evScore: clamp((ev / Math.max(region.equipmentIds.length, 1)) * 75 + (/eletrifica|ev/i.test(region.demand) ? 25 : 0)),
        diversityScore: clamp((families / TOTAL_MACHINE_FAMILIES) * 100 + (cats > 1 ? 12 : 0)),
        lineupScore: clamp((region.equipmentIds.length / MAX_REGION_LINEUP) * 100),
        trendValue: trend,
      };
    };

    const l = buildMetrics(compareLeftData);
    const r = buildMetrics(compareRightData);
    const radarData = [
      { metric: "Demand", left: l.demandScore, right: r.demandScore },
      { metric: "Trend", left: l.trendScore, right: r.trendScore },
      { metric: "EV", left: l.evScore, right: r.evScore },
      { metric: "Diversity", left: l.diversityScore, right: r.diversityScore },
      { metric: "Lineup", left: l.lineupScore, right: r.lineupScore },
    ];
    const chartConfig: ChartConfig = { left: { label: compareLeftData.region, color: "hsl(var(--primary))" }, right: { label: compareRightData.region, color: "hsl(var(--accent))" } };
    const build = (label: string, lv: number, rv: number, cat: string) => {
      const winner = lv === rv ? "tie" : lv > rv ? "left" : "right";
      return { label, category: cat, winner, winnerLabel: winner === "tie" ? "Empate" : winner === "left" ? compareLeftData.region : compareRightData.region, valueLabel: `${formatMetricValue(lv)} vs ${formatMetricValue(rv)}` };
    };
    const leaders = [build("Demand Lead", l.demandScore, r.demandScore, "Demanda"), build("EV Lead", l.evScore, r.evScore, "Adoção EV"), build("Portfolio Breadth", l.diversityScore, r.diversityScore, "Diversidade")];
    const gaps = [{ label: "demanda", delta: Math.abs(l.demandScore - r.demandScore), winner: l.demandScore >= r.demandScore ? compareLeftData.region : compareRightData.region }, { label: "adoção EV", delta: Math.abs(l.evScore - r.evScore), winner: l.evScore >= r.evScore ? compareLeftData.region : compareRightData.region }, { label: "diversidade", delta: Math.abs(l.diversityScore - r.diversityScore), winner: l.diversityScore >= r.diversityScore ? compareLeftData.region : compareRightData.region }].sort((a, b) => b.delta - a.delta)[0];
    const summary = gaps.delta === 0 ? `${compareLeftData.region} e ${compareRightData.region} apresentam equilíbrio operacional no recorte atual.` : `${gaps.winner} abre a maior vantagem em ${gaps.label}, enquanto ${l.trendValue >= r.trendValue ? compareLeftData.region : compareRightData.region} sustenta o melhor momentum de tendência.`;
    return { chartConfig, radarData, leaders, summary, metricLegend: RADAR_METRICS };
  }, [compareLeftData, compareRightData, machineById]);

  const renderRegionSide = (data: typeof compareLeftData, label: string, badgeClass: string) => (
    <button type="button" onClick={() => onOpenRegion(data)}
      className="rounded-xl border border-border bg-secondary/30 p-5 text-left transition-[box-shadow,transform] duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <h3 className="mt-2 text-xl font-semibold text-foreground">{data.region}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{data.demand}</p>
      <div className="mt-3 flex items-center gap-2">
        <Badge variant="outline" className={badgeClass}>{getTrendLabel(data.trend)}</Badge>
        <span className="text-[11px] text-muted-foreground">{data.equipment.length} linhas rastreadas</span>
      </div>
      <div className="mt-4 grid gap-2">
        {data.equipmentIds.map((id, i) => { const m = machineById.get(id); if (!m) return null; return (<div key={id} className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-2"><EquipmentImage src={m.image} alt={m.imageAlt} fallbackLabel={m.model} className="h-12 w-16 shrink-0 rounded-md" /><span className="text-xs font-medium text-foreground">{data.equipment[i] ?? m.model}</span></div>); })}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2">
        <span className="text-xs text-muted-foreground">Abrir detalhe regional no mapa</span>
        <MapPinned className={`h-4 w-4 ${label === "Region A" ? "text-primary" : "text-accent"}`} />
      </div>
    </button>
  );

  return (
    <div className="kpi-card section-enter" style={{ animationDelay: "160ms" }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-primary" /><h2 className="text-lg font-semibold">Regional Contrast</h2></div>
          <p className="mt-1 text-sm text-muted-foreground">Compare demanda, tendência e equipamentos entre duas regiões lado a lado.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <Select value={compareLeft} onValueChange={setCompareLeft}><SelectTrigger><SelectValue placeholder="Região A" /></SelectTrigger><SelectContent>{regionDemand.map((r) => (<SelectItem key={`left-${r.region}`} value={r.region}>{r.region}</SelectItem>))}</SelectContent></Select>
          <Select value={compareRight} onValueChange={setCompareRight}><SelectTrigger><SelectValue placeholder="Região B" /></SelectTrigger><SelectContent>{regionDemand.map((r) => (<SelectItem key={`right-${r.region}`} value={r.region}>{r.region}</SelectItem>))}</SelectContent></Select>
        </div>
      </div>

      <div key={`${compareLeft}-${compareRight}`} className="mt-5 grid gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)_minmax(0,1fr)]">
        {renderRegionSide(compareLeftData, "Region A", "border-primary/30 bg-primary/5 text-primary")}

        <div className="rounded-xl border border-border bg-background/60 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Radar Contrast</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground"><span>Escala executiva</span><span>0–100</span></div>
          <ChartContainer config={comparisonVisual.chartConfig} className="mx-auto mt-3 aspect-square max-w-[340px]">
            <RadarChart data={comparisonVisual.radarData} outerRadius="70%">
              <ChartTooltip content={<ChartTooltipContent />} />
              <PolarGrid className="stroke-border/60" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} />
              <Radar dataKey="left" stroke="var(--color-left)" fill="var(--color-left)" fillOpacity={0.22} strokeWidth={2} animationDuration={550} />
              <Radar dataKey="right" stroke="var(--color-right)" fill="var(--color-right)" fillOpacity={0.16} strokeWidth={2} animationDuration={550} />
            </RadarChart>
          </ChartContainer>

          <div className="mt-4 space-y-3 rounded-lg border border-border bg-card/70 p-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />{compareLeftData.region}</div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--accent))" }} />{compareRightData.region}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {comparisonVisual.metricLegend.map((item) => (<div key={item.metric} className="rounded-lg border border-border bg-background/70 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.metric}</p><p className="mt-1 text-xs text-foreground/90">{item.description}</p></div>))}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {comparisonVisual.leaders.map((leader) => (
              <div key={leader.label} className="rounded-lg border border-border bg-card/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{leader.label}</p><p className="mt-1 text-sm font-medium text-foreground">{leader.winnerLabel}</p><p className="mt-1 text-xs text-muted-foreground">{leader.category} · {leader.valueLabel}</p></div>
                  <Badge variant="outline" className={leader.winner === "left" ? "border-primary/30 bg-primary/5 text-primary" : leader.winner === "right" ? "border-accent/30 bg-accent/10 text-accent" : "border-border bg-muted text-muted-foreground"}>
                    <Trophy className="mr-1 h-3 w-3" />{leader.winner === "tie" ? "Balanced" : "Leader"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Executive Read</p>
            <p className="mt-2 text-sm text-foreground/90">{comparisonVisual.summary}</p>
          </div>
        </div>

        {renderRegionSide(compareRightData, "Region B", "border-accent/30 bg-accent/10 text-accent")}
      </div>
    </div>
  );
}
