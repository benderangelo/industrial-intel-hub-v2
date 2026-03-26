import { Database, Swords, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KpiCard } from "@/components/KpiCard";
import {
  caseMachines,
  competitorPresence,
  competitors,
  getMachineEngineeringProfile,
  getMachinesForRegion,
  getUrgentScannerSignals,
  regionDemand,
} from "@/data/caseData";
import { InlineScrollVideo } from "@/components/InlineScrollVideo";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EquipmentImage } from "@/components/EquipmentImage";
import { Badge } from "@/components/ui/badge";
import { RegionDetailDialog } from "@/components/dashboard/RegionDetailDialog";
import { RegionalContrast } from "@/components/dashboard/RegionalContrast";

const regionCoordinates: Record<string, { lat: number; lng: number }> = {
  "North America": { lat: 37.78, lng: -122.42 },
  Europe: { lat: 51.51, lng: -0.13 },
  LATAM: { lat: -15.79, lng: -47.88 },
  APAC: { lat: 1.35, lng: 103.82 },
  "Africa/Middle East": { lat: 25.2, lng: 55.27 },
};

const TOTAL_MACHINE_FAMILIES = new Set(caseMachines.map((m) => m.family)).size;

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<(typeof regionDemand)[number] | null>(null);

  const filteredRegions = activeRegion === "all" ? regionDemand : regionDemand.filter((r) => r.region === activeRegion);
  const activeRegionData = activeRegion === "all" ? null : filteredRegions[0] ?? null;

  const machineById = useMemo(() => new Map(caseMachines.map((m) => [m.id, m])), []);

  const globeMarkers = filteredRegions.map((r) => ({ id: r.region, lat: r.lat, lng: r.lng, label: r.region, demand: r.demand, trend: r.trend, equipment: r.equipment }));

  const globeConnections = [
    ["North America", "Europe"], ["Europe", "APAC"], ["North America", "LATAM"], ["Europe", "Africa/Middle East"], ["APAC", "Africa/Middle East"],
  ].map(([from, to]) => ({
    from: [regionCoordinates[from].lat, regionCoordinates[from].lng] as [number, number],
    to: [regionCoordinates[to].lat, regionCoordinates[to].lng] as [number, number],
  })).filter((conn) => activeRegion === "all" || conn.from[0] === (activeRegionData ? regionCoordinates[activeRegionData.region].lat : -999) || conn.to[0] === (activeRegionData ? regionCoordinates[activeRegionData.region].lat : -999));

  // KPI values
  const trackedModelsValue = activeRegionData ? String(activeRegionData.equipment.length) : String(caseMachines.length);
  const trackedModelsSubtitle = activeRegionData ? `${activeRegionData.region} active lineup` : `${caseMachines.length} modelos do manual`;
  const trackedModelsTrend = activeRegionData ? activeRegionData.trend : "Base completa sincronizada";

  const competitorCountForRegion = activeRegionData ? competitorPresence.filter((p) => p.region === activeRegionData.region).length : competitors.length;
  const competitorManufacturers = new Set(competitors.map((c) => c.name.split(" ")[0])).size;
  const competitorsValue = String(competitorCountForRegion);
  const competitorsSubtitle = activeRegionData ? `Pontos de pressão em ${activeRegionData.region}` : `${competitorManufacturers} fabricantes globais`;
  const competitorsTrend = activeRegionData
    ? `${competitorPresence.filter((p) => p.region === activeRegionData.region && p.pressure === "high").length} sinais de alta pressão`
    : `Base competitiva ativa em ${competitorPresence.length} hotspots`;

  const insightsValue = activeRegionData ? String(Math.max(2, activeRegionData.equipment.length)) : "5";
  const insightsSubtitle = activeRegionData ? `Priority focus: ${activeRegionData.equipment.slice(0, 2).join(" · ")}` : "3 high priority";
  const insightsTrend = activeRegionData ? `Regional signal: ${activeRegionData.trend}` : "2 require immediate action";

  // Executive stats
  const selectedRegionMachines = useMemo(() => activeRegionData ? getMachinesForRegion(activeRegionData.region) : [], [activeRegionData]);
  const executiveStats = useMemo(() => {
    if (!activeRegionData) return null;
    const familyCount = new Set(selectedRegionMachines.map((m) => m.family)).size;
    const electrifiedCount = selectedRegionMachines.filter((m) => m.electrified).length;
    const averageScore = selectedRegionMachines.length > 0
      ? Math.round(selectedRegionMachines.reduce((sum, m) => sum + (getMachineEngineeringProfile(m.id)?.overallScore ?? 0), 0) / selectedRegionMachines.length)
      : null;
    return { familyCount, electrifiedCount, averageScore, primaryMachineId: selectedRegionMachines[0]?.id ?? null };
  }, [activeRegionData, selectedRegionMachines]);

  // Urgent signals
  const urgentSignals = useMemo(() => {
    if (!activeRegionData) return getUrgentScannerSignals(3);
    const machineIds = new Set(selectedRegionMachines.map((m) => m.id));
    const families = new Set(selectedRegionMachines.map((m) => m.family));
    return getUrgentScannerSignals(12).filter((s) => ((s.machineId && machineIds.has(s.machineId)) || families.has(s.family))).slice(0, 3);
  }, [activeRegionData, selectedRegionMachines]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Macro View — Global Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time portfolio intelligence across all regions</p>
      </div>

      {/* Regional Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Regional Filter</p>
          <p className="mt-1 text-sm text-foreground/90">Atualize globo, KPIs e cards para uma leitura regional específica.</p>
        </div>
        <div className="w-full max-w-xs">
          <Select value={activeRegion} onValueChange={setActiveRegion}>
            <SelectTrigger><SelectValue placeholder="Selecionar região" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões</SelectItem>
              {regionDemand.map((r) => (<SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div key={activeRegion} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard icon={Database} title="CASE Models Tracked" value={trackedModelsValue} subtitle={trackedModelsSubtitle} trend={trackedModelsTrend} />
          <KpiCard icon={Swords} title="Competitor Models Mapped" value={competitorsValue} subtitle={competitorsSubtitle} trend={competitorsTrend} accentClass="text-accent" />
          <KpiCard icon={Lightbulb} title="Pending Engineering Insights" value={insightsValue} subtitle={insightsSubtitle} trend={insightsTrend} accentClass="text-chart-warning" />
        </div>

        {/* Globe + Region Cards */}
        <div className="kpi-card section-enter relative overflow-hidden" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Global Deployment Map</h2>
            <span className="text-xs text-muted-foreground font-mono">LIVE TRACKING</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
            <div className="flex flex-col gap-4">
              <InteractiveGlobe
                size={420}
                markers={globeMarkers}
                connections={globeConnections}
                className="min-h-[420px]"
                onMarkerClick={(marker) => { const region = filteredRegions.find((r) => r.region === marker.id); if (region) setSelectedRegion(region); }}
              />
              <InlineScrollVideo src="/subsystems-hero.mp4" height={680} scrollLength={1400} />
            </div>
            <div className="grid gap-3 self-stretch">
              {filteredRegions.map((region, i) => (
                <div key={region.region} className="rounded-lg border border-border bg-secondary/35 p-4 section-enter" style={{ animationDelay: `${140 + i * 90}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{region.region}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{region.demand}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">{region.trend}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {region.equipmentIds.map((id, idx) => { const m = machineById.get(id); if (!m) return null; return (<div key={id} className="flex items-center gap-2 rounded-full border border-border bg-background/50 py-1 pl-1 pr-2"><EquipmentImage src={m.image} alt={m.imageAlt} fallbackLabel={m.model} className="h-7 w-9 shrink-0 rounded-full border-0" /><span className="text-[10px] text-foreground/90">{region.equipment[idx] ?? m.model}</span></div>); })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full border border-border bg-background/60 px-2.5 py-1">{competitorPresence.filter((p) => p.region === region.region).length} hotspots competitivos</span>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 px-0 text-xs text-accent hover:bg-transparent hover:text-accent" onClick={() => setSelectedRegion(region)}>Abrir mapa detalhado</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Executive Brief + Urgent Alerts */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_hsl(var(--foreground)/0.05)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Executive regional read</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">{activeRegionData ? `${activeRegionData.region} operating brief` : "Global portfolio brief"}</h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {activeRegionData
                    ? `${activeRegionData.region} combina ${activeRegionData.equipmentIds.length} modelos ativos, ${executiveStats?.familyCount ?? 0} famílias e ${executiveStats?.electrifiedCount ?? 0} plataformas eletrificadas no lineup monitorado.`
                    : `A plataforma consolida ${caseMachines.length} máquinas CASE, ${competitors.length} rivais e ${competitorPresence.length} hotspots competitivos na mesma leitura operacional.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate(`/portfolio${activeRegionData ? `?region=${encodeURIComponent(activeRegionData.region)}` : ""}`)}>Abrir Portfolio</Button>
                <Button onClick={() => navigate(`/benchmarking${executiveStats?.primaryMachineId ? `?case=${executiveStats.primaryMachineId}${activeRegionData ? `&region=${encodeURIComponent(activeRegionData.region)}` : ""}` : ""}`)}>Abrir Benchmarking</Button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/20 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Famílias monitoradas</p><p className="mt-2 text-2xl font-semibold text-foreground">{activeRegionData ? executiveStats?.familyCount ?? 0 : TOTAL_MACHINE_FAMILIES}</p></div>
              <div className="rounded-2xl border border-border bg-secondary/20 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Plataformas EV</p><p className="mt-2 text-2xl font-semibold text-foreground">{activeRegionData ? executiveStats?.electrifiedCount ?? 0 : caseMachines.filter((m) => m.electrified).length}</p></div>
              <div className="rounded-2xl border border-border bg-secondary/20 p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Score médio</p><p className="mt-2 text-2xl font-semibold text-foreground">{activeRegionData ? executiveStats?.averageScore ?? "—" : Math.round(caseMachines.reduce((sum, m) => sum + (getMachineEngineeringProfile(m.id)?.overallScore ?? 0), 0) / caseMachines.length)}</p></div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_hsl(var(--foreground)/0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Urgent scanner feed</p><h2 className="mt-2 text-lg font-semibold text-foreground">Alertas prioritários</h2></div>
              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">{urgentSignals.length} high</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {urgentSignals.length > 0 ? urgentSignals.map((signal) => (
                <button key={signal.id} type="button" onClick={() => navigate(`/scanner?focus=${encodeURIComponent(signal.machineId ?? signal.family)}`)}
                  className="w-full rounded-2xl border border-border bg-secondary/15 p-4 text-left transition-[border-color,box-shadow,transform] duration-300 hover:border-border/80 hover:shadow-[0_12px_28px_hsl(var(--foreground)/0.05)] active:scale-[0.98]">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-semibold text-foreground">{signal.title}</p><p className="mt-1 text-xs text-muted-foreground">{signal.family} · {signal.region}</p></div>
                    <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">{signal.severity}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/80">{signal.impact}</p>
                </button>
              )) : (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">Nenhum alerta crítico apareceu para o recorte atual.</div>
              )}
            </div>
          </section>
        </div>

        {/* Regional Contrast */}
        <RegionalContrast compareLeftInit={activeRegionData?.region ?? "North America"} onOpenRegion={setSelectedRegion} machineById={machineById} />
      </div>

      {/* Region Detail Dialog */}
      <RegionDetailDialog selectedRegion={selectedRegion} onClose={() => setSelectedRegion(null)} />

      {/* Regional Summary Footer */}
      <div className={`grid grid-cols-1 gap-3 ${filteredRegions.length > 1 ? "md:grid-cols-5" : "md:grid-cols-1"}`}>
        {filteredRegions.map((r, i) => (
          <div key={r.region} className="kpi-card section-enter" style={{ animationDelay: `${200 + i * 80}ms` }}>
            <p className="text-xs font-semibold text-foreground">{r.region}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{r.demand}</p>
            <p className="text-sm font-bold text-chart-success data-mono mt-2">{r.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
