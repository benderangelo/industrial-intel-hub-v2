import { Layers3, MapPinned, ShieldAlert } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  caseMachinePresence,
  caseMachines,
  competitorPresence,
  competitors,
  getEngineeringSignalsForMachine,
  getMachineEngineeringProfile,
  getMachinesForRegion,
  type CASEMachine,
} from "@/data/caseData";
import type { regionDemand as RegionDemandType } from "@/data/caseData";
import { EquipmentImage } from "@/components/EquipmentImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InteractiveMap } from "@/components/ui/interactive-map";

type RegionDemandItem = (typeof RegionDemandType)[number];

type SelectedRegionalPoint =
  | { type: "case"; id: string }
  | { type: "competitor"; id: string }
  | null;

const presenceCopy = {
  dominance: {
    label: "Domínio de mercado",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
  commercial: {
    label: "Comercialização global",
    badgeClass: "border-accent/30 bg-accent/10 text-accent",
  },
} as const;

const competitorPressureCopy = {
  high: { label: "Pressão alta", badgeClass: "border-destructive/30 bg-destructive/10 text-destructive" },
  medium: { label: "Pressão média", badgeClass: "border-chart-warning/30 bg-chart-warning/10 text-chart-warning" },
  emerging: { label: "Sinal emergente", badgeClass: "border-accent/30 bg-accent/10 text-accent" },
} as const;

interface RegionDetailDialogProps {
  selectedRegion: RegionDemandItem | null;
  onClose: () => void;
}

export function RegionDetailDialog({ selectedRegion, onClose }: RegionDetailDialogProps) {
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState<SelectedRegionalPoint>(null);
  const [showCaseLayer, setShowCaseLayer] = useState(true);
  const [showCompetitorLayer, setShowCompetitorLayer] = useState(true);

  const machineById = useMemo(() => new Map(caseMachines.map((m) => [m.id, m])), []);

  const selectedRegionPresence = useMemo(() => {
    if (!selectedRegion) return [];
    return caseMachinePresence.filter((p) => p.region === selectedRegion.region);
  }, [selectedRegion]);

  const selectedRegionCompetitorPresence = useMemo(() => {
    if (!selectedRegion) return [];
    return competitorPresence.filter((p) => p.region === selectedRegion.region);
  }, [selectedRegion]);

  const selectedRegionDominance = useMemo(() => selectedRegionPresence.filter((p) => p.type === "dominance"), [selectedRegionPresence]);
  const selectedRegionCommercial = useMemo(() => selectedRegionPresence.filter((p) => p.type === "commercial"), [selectedRegionPresence]);
  const selectedRegionMachines = useMemo(() => (selectedRegion ? getMachinesForRegion(selectedRegion.region) : []), [selectedRegion]);

  const selectedRegionEngineeringSignals = useMemo(
    () => (selectedRegion ? selectedRegionMachines.flatMap((m) => getEngineeringSignalsForMachine(m.id)).slice(0, 4) : []),
    [selectedRegion, selectedRegionMachines],
  );

  const selectedRegionExecutiveStats = useMemo(() => {
    if (!selectedRegion) return null;
    const familyCount = new Set(selectedRegionMachines.map((m) => m.family)).size;
    const electrifiedCount = selectedRegionMachines.filter((m) => m.electrified).length;
    const averageScore = selectedRegionMachines.length > 0
      ? Math.round(selectedRegionMachines.reduce((sum, m) => sum + (getMachineEngineeringProfile(m.id)?.overallScore ?? 0), 0) / selectedRegionMachines.length)
      : null;
    return { familyCount, electrifiedCount, averageScore, primaryMachineId: selectedRegionMachines[0]?.id ?? null };
  }, [selectedRegion, selectedRegionMachines]);

  useEffect(() => {
    if (!selectedRegion) { setSelectedDetail(null); return; }
    const firstCase = selectedRegionPresence[0];
    const firstCompetitor = selectedRegionCompetitorPresence[0];
    setSelectedDetail((current) => {
      if (current?.type === "case" && selectedRegionPresence.some((p) => p.id === current.id)) return current;
      if (current?.type === "competitor" && selectedRegionCompetitorPresence.some((p) => p.id === current.id)) return current;
      if (firstCase) return { type: "case", id: firstCase.id };
      if (firstCompetitor) return { type: "competitor", id: firstCompetitor.id };
      return null;
    });
  }, [selectedRegion, selectedRegionPresence, selectedRegionCompetitorPresence]);

  const selectedPresencePoint = useMemo(
    () => (selectedDetail?.type === "case" ? selectedRegionPresence.find((p) => p.id === selectedDetail.id) ?? null : null),
    [selectedDetail, selectedRegionPresence],
  );
  const selectedCompetitorPoint = useMemo(
    () => (selectedDetail?.type === "competitor" ? selectedRegionCompetitorPresence.find((p) => p.id === selectedDetail.id) ?? null : null),
    [selectedDetail, selectedRegionCompetitorPresence],
  );
  const selectedPresenceMachine = useMemo(
    () => (selectedPresencePoint ? machineById.get(selectedPresencePoint.machineId) ?? null : null),
    [machineById, selectedPresencePoint],
  );
  const selectedCompetitor = useMemo(
    () => (selectedCompetitorPoint
      ? competitors.find((c) => c.name === selectedCompetitorPoint.competitor && c.caseRival === selectedCompetitorPoint.caseRival)
        ?? competitors.find((c) => c.name === selectedCompetitorPoint.competitor) ?? null
      : null),
    [selectedCompetitorPoint],
  );

  const selectedRegionSummary = useMemo(() => {
    if (!selectedRegion) return "";
    const dom = new Set(selectedRegionDominance.map((p) => p.machineId)).size;
    const com = new Set(selectedRegionCommercial.map((p) => p.machineId)).size;
    const comp = selectedRegionCompetitorPresence.length;
    if (!dom && !com && !comp) return `Nenhum ponto específico foi mapeado para ${selectedRegion.region} neste recorte.`;
    return `${dom} modelos CASE lideram frentes-chave, ${com} sustentam comercialização ativa e ${comp} hotspots monitoram pressão competitiva em ${selectedRegion.region}.`;
  }, [selectedRegion, selectedRegionCommercial, selectedRegionCompetitorPresence.length, selectedRegionDominance]);

  const detailedRegionMarkers = useMemo(() => {
    if (!selectedRegion) return [];
    return [
      { id: `${selectedRegion.region}-hub`, position: [selectedRegion.lat, selectedRegion.lng] as [number, number], title: selectedRegion.region, content: selectedRegion.demand, variant: "hub" as const },
      ...(showCaseLayer ? selectedRegionPresence.map((point) => {
        const machine = machineById.get(point.machineId);
        return { id: point.id, position: point.coordinates, title: machine?.model ?? point.machineId, subtitle: `${presenceCopy[point.type].label} · ${point.location}`, content: point.note, variant: point.type === "dominance" ? ("dominance" as const) : ("commercial" as const), isActive: selectedDetail?.type === "case" && point.id === selectedDetail.id };
      }) : []),
      ...(showCompetitorLayer ? selectedRegionCompetitorPresence.map((point) => ({ id: point.id, position: point.coordinates, title: point.competitor, subtitle: `${competitorPressureCopy[point.pressure].label} · ${point.location}`, content: point.note, variant: "pressure" as const, isActive: selectedDetail?.type === "competitor" && point.id === selectedDetail.id })) : []),
    ];
  }, [machineById, selectedDetail, selectedRegion, selectedRegionCompetitorPresence, selectedRegionPresence, showCaseLayer, showCompetitorLayer]);

  const renderPresenceCard = (point: (typeof caseMachinePresence)[number]) => {
    const machine = machineById.get(point.machineId);
    if (!machine) return null;
    const isActive = selectedDetail?.type === "case" && selectedDetail.id === point.id;
    return (
      <button key={point.id} type="button" onClick={() => setSelectedDetail({ type: "case", id: point.id })}
        className={`group w-full rounded-2xl border p-3 text-left transition-[transform,box-shadow,border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] ${isActive ? "border-primary/35 bg-background shadow-[0_14px_30px_hsl(var(--foreground)/0.08)]" : "border-border/80 bg-background/60 hover:border-border hover:bg-background/90 hover:shadow-[0_10px_24px_hsl(var(--foreground)/0.05)]"}`}>
        <div className="flex items-center gap-3">
          <EquipmentImage src={machine.image} alt={machine.imageAlt} fallbackLabel={machine.model} className="h-14 w-20 shrink-0 rounded-xl bg-muted/70" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{machine.model}</p>
                <p className="mt-1 text-xs text-muted-foreground">{point.location} · {machine.family}</p>
              </div>
              <Badge variant="outline" className={presenceCopy[point.type].badgeClass}>{point.type === "dominance" ? "Domínio" : "Global"}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full border border-border bg-secondary/30 px-2.5 py-1">{machine.hp}</span>
              <span className="rounded-full border border-border bg-secondary/30 px-2.5 py-1">{machine.weightClass}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/75">{point.note}</p>
          </div>
        </div>
      </button>
    );
  };

  const renderCompetitorCard = (point: (typeof competitorPresence)[number]) => {
    const competitor = competitors.find((c) => c.name === point.competitor && c.caseRival === point.caseRival) ?? competitors.find((c) => c.name === point.competitor);
    const isActive = selectedDetail?.type === "competitor" && selectedDetail.id === point.id;
    const pressureTone = competitorPressureCopy[point.pressure];
    return (
      <button key={point.id} type="button" onClick={() => setSelectedDetail({ type: "competitor", id: point.id })}
        className={`group w-full rounded-2xl border p-3 text-left transition-[transform,box-shadow,border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] ${isActive ? "border-destructive/35 bg-background shadow-[0_14px_30px_hsl(var(--foreground)/0.08)]" : "border-border/80 bg-background/60 hover:border-border hover:bg-background/90 hover:shadow-[0_10px_24px_hsl(var(--foreground)/0.05)]"}`}>
        <div className="flex items-center gap-3">
          <EquipmentImage src={competitor?.image} alt={competitor?.imageAlt ?? point.competitor} fallbackLabel={point.competitor} className="h-14 w-20 shrink-0 rounded-xl bg-muted/70" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{point.competitor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{point.location} · rival de {point.caseRival.toUpperCase()}</p>
              </div>
              <Badge variant="outline" className={pressureTone.badgeClass}>{pressureTone.label}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{competitor?.category ?? "Hotspot competitivo"}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/75">{point.note}</p>
          </div>
        </div>
      </button>
    );
  };

  if (!selectedRegion) return null;

  return (
    <Dialog open={!!selectedRegion} onOpenChange={(open) => { if (!open) { onClose(); setSelectedDetail(null); } }}>
      <DialogContent className="max-h-[92vh] max-w-[1480px] overflow-hidden border-border bg-card p-0">
        <DialogHeader className="border-b border-border bg-background/95 px-6 py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <DialogTitle>{selectedRegion.region} — Deployment Intelligence</DialogTitle>
              <DialogDescription>{selectedRegion.demand} · {selectedRegion.trend}</DialogDescription>
              <p className="mt-2 max-w-4xl text-sm text-foreground/80">{selectedRegionSummary}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <div className="rounded-full border border-border bg-background px-3 py-1.5"><span className="font-semibold text-primary">{new Set(selectedRegionDominance.map((p) => p.machineId)).size}</span> modelos com domínio</div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5"><span className="font-semibold text-accent">{new Set(selectedRegionCommercial.map((p) => p.machineId)).size}</span> modelos comercializados</div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5"><span className="font-semibold text-destructive">{selectedRegionCompetitorPresence.length}</span> hotspots competitivos</div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid max-h-[calc(92vh-104px)] min-h-0 xl:grid-cols-[minmax(0,1.7fr)_430px]">
          <div className="border-b border-border bg-background/40 p-5 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <div className="rounded-full border border-border bg-background px-3 py-1.5"><span className="font-semibold text-primary">{selectedRegionDominance.length}</span> pontos de domínio</div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5"><span className="font-semibold text-accent">{selectedRegionCommercial.length}</span> pontos comerciais</div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5"><span className="font-semibold text-destructive">{selectedRegionCompetitorPresence.length}</span> pontos de concorrência</div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5">Clique no card lateral para focar no mapa</div>
            </div>

            <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <section className="rounded-[24px] border border-border bg-card/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Regional executive summary</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">{selectedRegion.region} focus stack</h3>
                    <p className="mt-2 text-sm text-foreground/80">{selectedRegionSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/portfolio?region=${encodeURIComponent(selectedRegion.region)}`)}>Portfolio regional</Button>
                    {selectedRegionExecutiveStats?.primaryMachineId && (
                      <Button size="sm" onClick={() => navigate(`/benchmarking?case=${selectedRegionExecutiveStats.primaryMachineId}&region=${encodeURIComponent(selectedRegion.region)}`)}>Benchmark da região</Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Lineup</p><p className="mt-1 text-lg font-semibold text-foreground">{selectedRegionMachines.length} modelos</p></div>
                  <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Famílias</p><p className="mt-1 text-lg font-semibold text-foreground">{selectedRegionExecutiveStats?.familyCount ?? 0}</p></div>
                  <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Score médio</p><p className="mt-1 text-lg font-semibold text-foreground">{selectedRegionExecutiveStats?.averageScore ?? "—"}</p></div>
                </div>
              </section>

              <section className="rounded-[24px] border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Engineering signals</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">Prioridades derivadas</h3>
                  </div>
                  <Badge variant="outline">{selectedRegionEngineeringSignals.length}</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedRegionEngineeringSignals.length > 0 ? selectedRegionEngineeringSignals.map((signal) => (
                    <div key={signal.id} className="rounded-2xl border border-border bg-secondary/15 p-3">
                      <p className="text-sm font-medium text-foreground">{signal.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{signal.family} · impacto {signal.impact}</p>
                      <p className="mt-2 text-xs leading-relaxed text-foreground/80">{signal.recommendation}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-3 text-xs text-muted-foreground">Nenhum sinal de engenharia adicional foi mapeado para esta região.</div>
                  )}
                </div>
              </section>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground"><Layers3 className="h-3.5 w-3.5 text-primary" />Camadas do mapa</div>
              <Button variant={showCaseLayer ? "default" : "outline"} size="sm" onClick={() => setShowCaseLayer((c) => !c)}>CASE</Button>
              <Button variant={showCompetitorLayer ? "destructive" : "outline"} size="sm" onClick={() => setShowCompetitorLayer((c) => !c)}>Concorrência</Button>
            </div>

            <InteractiveMap
              center={[selectedRegion.lat, selectedRegion.lng]}
              zoom={4}
              markers={detailedRegionMarkers}
              className="h-[64vh] min-h-[560px] rounded-[28px] border-border bg-background xl:h-[calc(92vh-240px)]"
              showLegend
              activeMarkerId={selectedDetail?.id ?? null}
              onMarkerClick={(marker) => {
                if (marker.variant === "hub") return;
                setSelectedDetail(marker.variant === "pressure" ? { type: "competitor", id: marker.id } : { type: "case", id: marker.id });
              }}
            />

            {!showCaseLayer && !showCompetitorLayer && (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                Todas as camadas estão ocultas; reative CASE ou Concorrência para voltar a ver os pontos no mapa.
              </div>
            )}
          </div>

          <aside className="min-h-0 overflow-y-auto bg-secondary/10 p-5 xl:p-6">
            <div className="space-y-5 pr-1">
              {selectedPresencePoint && selectedPresenceMachine && (
                <div className="rounded-[28px] border border-border bg-background px-5 py-5 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ponto selecionado</p>
                          <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground">{selectedPresenceMachine.model}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{selectedPresencePoint.location} · {selectedPresenceMachine.family}</p>
                        </div>
                        <Badge variant="outline" className={presenceCopy[selectedPresencePoint.type].badgeClass}>{presenceCopy[selectedPresencePoint.type].label}</Badge>
                      </div>
                      <EquipmentImage src={selectedPresenceMachine.image} alt={selectedPresenceMachine.imageAlt} fallbackLabel={selectedPresenceMachine.model} className="h-44 w-full rounded-[22px] bg-muted/60" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Potência</p><p className="mt-1 text-sm font-semibold text-foreground">{selectedPresenceMachine.hp}</p></div>
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Peso</p><p className="mt-1 text-sm font-semibold text-foreground">{selectedPresenceMachine.weightClass}</p></div>
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Trend</p><p className="mt-1 text-sm font-semibold text-foreground">{selectedRegion.trend}</p></div>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/15 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Leitura do ponto</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{selectedPresencePoint.note}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedCompetitorPoint && (
                <div className="rounded-[28px] border border-border bg-background px-5 py-5 shadow-[0_18px_40px_hsl(var(--foreground)/0.06)]">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hotspot competitivo</p>
                        <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground">{selectedCompetitorPoint.competitor}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedCompetitorPoint.location}</p>
                      </div>
                      <Badge variant="outline" className={competitorPressureCopy[selectedCompetitorPoint.pressure].badgeClass}>
                        <ShieldAlert className="mr-1 h-3 w-3" />{competitorPressureCopy[selectedCompetitorPoint.pressure].label}
                      </Badge>
                    </div>
                    <EquipmentImage src={selectedCompetitor?.image} alt={selectedCompetitor?.imageAlt ?? selectedCompetitorPoint.competitor} fallbackLabel={selectedCompetitorPoint.competitor} className="h-44 w-full rounded-[22px] bg-muted/60" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Categoria</p><p className="mt-1 text-sm font-semibold text-foreground">{selectedCompetitor?.category ?? "Benchmark"}</p></div>
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">CASE rival</p><p className="mt-1 text-sm font-semibold text-foreground">{selectedCompetitorPoint.caseRival.toUpperCase()}</p></div>
                      <div className="rounded-2xl border border-border bg-secondary/20 p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Trend</p><p className="mt-1 text-sm font-semibold text-foreground">{selectedRegion.trend}</p></div>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/15 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Leitura do hotspot</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{selectedCompetitorPoint.note}</p>
                    </div>
                  </div>
                </div>
              )}

              <section className="rounded-[24px] border border-border bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Domínio de mercado</p><p className="mt-1 text-sm text-foreground/80">Clique para focar o ponto e abrir o popup no mapa.</p></div>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{selectedRegionDominance.length} pontos</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {selectedRegionDominance.length > 0 ? selectedRegionDominance.map(renderPresenceCard) : (
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">Nenhum ponto de domínio mapeado neste recorte.</div>
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-border bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Comercialização global</p><p className="mt-1 text-sm text-foreground/80">Mesma navegação: card lateral, zoom automático e popup contextual.</p></div>
                  <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">{selectedRegionCommercial.length} pontos</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {selectedRegionCommercial.length > 0 ? selectedRegionCommercial.map(renderPresenceCard) : (
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">Nenhum ponto comercial ativo foi associado a esta região.</div>
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-border bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pressão competitiva</p><p className="mt-1 text-sm text-foreground/80">Camada vermelha do mapa com hotspots onde a mensagem do concorrente está mais forte.</p></div>
                  <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">{selectedRegionCompetitorPresence.length} pontos</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {selectedRegionCompetitorPresence.length > 0 ? selectedRegionCompetitorPresence.map(renderCompetitorCard) : (
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-4 text-sm text-muted-foreground">Nenhum hotspot competitivo relevante foi registrado neste recorte.</div>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
