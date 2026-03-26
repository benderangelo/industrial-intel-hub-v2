import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

import { Badge } from "@/components/ui/badge";
import { EquipmentImage } from "@/components/EquipmentImage";
import {
  allScannerSignals,
  caseMachines,
  caseScores,
  getBenchmarkTemplateId,
  getCompetitorsForMachine,
  getMachineCoverageRegions,
  getMachineEngineeringProfile,
  getMachineOverallScore,
} from "@/data/caseData";

const competitorColors = ["hsl(var(--accent))", "hsl(var(--chart-warning))", "hsl(var(--chart-success))"];

export function BenchmarkComparisonTab() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("case")?.split(",").filter(Boolean) ?? [];
  const regionFilter = searchParams.get("region") ?? "all";
  const availableMachines = useMemo(() => {
    if (regionFilter === "all") return caseMachines;
    return caseMachines.filter((machine) => getMachineCoverageRegions(machine.id).includes(regionFilter));
  }, [regionFilter]);

  const [selectedGroup, setSelectedGroup] = useState(preselected[0] ?? availableMachines[0]?.id ?? "gr935");
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);

  const caseMachine = availableMachines.find((machine) => machine.id === selectedGroup) ?? caseMachines.find((machine) => machine.id === selectedGroup) ?? caseMachines[0];
  const engineeringProfile = caseMachine ? getMachineEngineeringProfile(caseMachine.id) : null;
  const benchmarkTemplateId = caseMachine ? getBenchmarkTemplateId(caseMachine.id) : "gr935";
  const mappedCompetitors = caseMachine ? getCompetitorsForMachine(caseMachine.id) : [];
  const selectedCompetitorModels = mappedCompetitors.filter((competitor) => selectedCompetitors.includes(competitor.name)).slice(0, 3);
  const effectiveCompetitors = selectedCompetitorModels.length > 0 ? selectedCompetitorModels : mappedCompetitors.slice(0, 1);
  const coverageRegions = caseMachine ? getMachineCoverageRegions(caseMachine.id) : [];
  const overallScore = caseMachine ? getMachineOverallScore(caseMachine.id) : null;
  const benchmarkScore = caseMachine ? caseScores[caseMachine.id] ?? caseScores[benchmarkTemplateId] : null;

  const radarData = engineeringProfile?.subsystems.map((subsystem) => {
    const point: Record<string, string | number> = { axis: subsystem.label, CASE: subsystem.score };
    effectiveCompetitors.forEach((competitor) => {
      const competitorSubsystem = subsystem.competitors.find((entry) => entry.name === competitor.name);
      point[competitor.name] = competitorSubsystem?.score ?? competitor.scores.tech;
    });
    return point;
  }) ?? [];

  const subsystemGaps = engineeringProfile?.subsystems
    .map((subsystem) => {
      const topCompetitor = [...subsystem.competitors].sort((a, b) => b.score - a.score)[0];
      return {
        subsystem: subsystem.label,
        delta: topCompetitor ? subsystem.score - topCompetitor.score : 0,
        rival: topCompetitor?.name ?? "—",
        recommendation: subsystem.recommendation,
      };
    })
    .sort((a, b) => a.delta - b.delta) ?? [];

  const specDeltaRows = caseMachine && mappedCompetitors.length > 0 ? [
    {
      label: "Potência",
      caseValue: caseMachine.powerValue ?? 0,
      unit: " hp",
      rivals: mappedCompetitors.slice(0, 4).map((competitor) => ({ name: competitor.name, value: competitor.scores.powertrain })),
    },
    {
      label: "Peso operacional",
      caseValue: caseMachine.operatingWeightValue ?? 0,
      unit: " lb",
      rivals: mappedCompetitors.slice(0, 4).map((competitor) => ({ name: competitor.name, value: competitor.scores.maintenance })),
    },
    {
      label: "Breakout / força relativa",
      caseValue: benchmarkScore?.tech ?? 0,
      unit: " pts",
      rivals: mappedCompetitors.slice(0, 4).map((competitor) => ({ name: competitor.name, value: competitor.scores.tech })),
    },
  ] : [];

  const caseAdvantages = useMemo(() => {
    if (!caseMachine || !engineeringProfile) return [];
    const strengths = [] as string[];
    if (caseMachine.electrified) strengths.push(`${caseMachine.model} é uma plataforma eletrificada com vantagem clara de posicionamento.`);
    if ((benchmarkScore?.maintenance ?? 0) >= 85) strengths.push("Arquitetura com discurso forte de manutenção e uptime.");
    if ((benchmarkScore?.priceTCO ?? 0) >= 76) strengths.push("Boa leitura de TCO para narrativa comercial executiva.");
    engineeringProfile.subsystems.forEach((subsystem) => {
      const isLeader = subsystem.competitors.every((competitor) => subsystem.score >= competitor.score);
      if (isLeader) strengths.push(`${subsystem.label} aparece como liderança CASE dentro do benchmark ativo.`);
    });
    return strengths.slice(0, 4);
  }, [benchmarkScore?.maintenance, benchmarkScore?.priceTCO, caseMachine, engineeringProfile]);

  const scannerHighlights = caseMachine
    ? allScannerSignals.filter((signal) => signal.machineId === caseMachine.id || signal.caseRival === benchmarkTemplateId || signal.family === caseMachine.family).slice(0, 4)
    : [];

  const toggleCompetitor = (competitorName: string) => {
    setSelectedCompetitors((current) => {
      if (current.includes(competitorName)) return current.filter((name) => name !== competitorName);
      if (current.length >= 3) return [...current.slice(1), competitorName];
      return [...current, competitorName];
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Comparação técnica</h2>
        <p className="text-sm text-muted-foreground">Radar por 6 subsistemas, deltas executivos e leitura auditável conectada à camada de engineering.</p>
        <div className="flex flex-wrap gap-2">
          {regionFilter !== "all" && <Badge variant="outline" className="border-border text-foreground">Região: {regionFilter}</Badge>}
          <Badge variant="outline" className="border-border text-muted-foreground">{mappedCompetitors.length} concorrentes mapeados</Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Score geral: {overallScore ?? "—"}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableMachines.map((machine) => (
          <button
            key={machine.id}
            type="button"
            onClick={() => {
              setSelectedGroup(machine.id);
              setSelectedCompetitors([]);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${selectedGroup === machine.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {machine.model}
          </button>
        ))}
      </div>

      {caseMachine && engineeringProfile && (
        <>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">CASE Base</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">{caseMachine.model}</h3>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{engineeringProfile.executiveSummary}</p>
                </div>
                <EquipmentImage src={caseMachine.image} alt={caseMachine.imageAlt} fallbackLabel={caseMachine.model} className="h-28 w-40 rounded-2xl bg-secondary/30" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Família</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{caseMachine.family}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Cobertura</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{coverageRegions.join(" · ") || "Global"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Score geral</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{engineeringProfile.overallScore}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Referência</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{benchmarkTemplateId.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vantagens CASE</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">Highlights automáticos</h3>
                </div>
                <Badge variant="outline" className="border-border text-muted-foreground">{caseAdvantages.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {caseAdvantages.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-foreground/90">{item}</div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Radar de subsistemas</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">CASE vs concorrentes selecionados</h3>
                </div>
                <Badge variant="outline" className="border-border text-muted-foreground">até 3 overlays</Badge>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="CASE" dataKey="CASE" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                  {effectiveCompetitors.map((competitor, index) => (
                    <Radar
                      key={competitor.name}
                      name={competitor.name}
                      dataKey={competitor.name}
                      stroke={competitorColors[index % competitorColors.length]}
                      fill={competitorColors[index % competitorColors.length]}
                      fillOpacity={0.11}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Concorrentes mapeados</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{mappedCompetitors.length} modelos de benchmark</h3>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {mappedCompetitors.map((competitor) => {
                  const active = selectedCompetitors.includes(competitor.name);
                  return (
                    <button
                      key={competitor.name}
                      type="button"
                      onClick={() => toggleCompetitor(competitor.name)}
                      className={`w-full rounded-2xl border p-4 text-left transition-[transform,box-shadow,border-color] duration-300 active:scale-[0.98] ${active ? "border-primary bg-primary/5 shadow-[0_12px_30px_hsl(var(--primary)/0.12)]" : "border-border bg-secondary/15 hover:border-border/80 hover:bg-secondary/30"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{competitor.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{competitor.category}</p>
                        </div>
                        <Badge variant={active ? "default" : "outline"}>{active ? "No radar" : "Selecionar"}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tabela de delta</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Métrica</th>
                      <th className="px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-primary">CASE</th>
                      {specDeltaRows[0]?.rivals.map((rival) => (
                        <th key={rival.name} className="px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-accent">{rival.name.split(" ")[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specDeltaRows.map((row) => (
                      <tr key={row.label} className="border-t border-border/60">
                        <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
                        <td className="px-4 py-3 text-center font-semibold text-primary">{row.caseValue}{row.unit}</td>
                        {row.rivals.map((rival) => {
                          const isCaseSuperior = row.caseValue >= rival.value;
                          return (
                            <td key={rival.name} className={`px-4 py-3 text-center font-semibold ${isCaseSuperior ? "text-chart-success" : "text-destructive"}`}>
                              {rival.value}{row.unit} {isCaseSuperior ? "↓" : "↑"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prioridades de engenharia</p>
              <div className="mt-4 space-y-3">
                {subsystemGaps.slice(0, 4).map((gap) => (
                  <div key={gap.subsystem} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{gap.subsystem}</p>
                      <Badge className={gap.delta < 0 ? "bg-destructive/10 text-destructive hover:bg-destructive/10" : "bg-chart-success/10 text-chart-success hover:bg-chart-success/10"}>{gap.delta}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Rival líder: {gap.rival}</p>
                    <p className="mt-2 text-sm text-foreground/90">{gap.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Scanner intelligence</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">Sinais conectados ao benchmark</h3>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {scannerHighlights.map((signal) => (
                <div key={signal.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{signal.title}</p>
                    <Badge className={signal.severity === "high" ? "bg-destructive/10 text-destructive hover:bg-destructive/10" : signal.severity === "medium" ? "bg-chart-warning/10 text-chart-warning hover:bg-chart-warning/10" : "bg-chart-success/10 text-chart-success hover:bg-chart-success/10"}>{signal.severity}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{signal.competitor} · {signal.region}</p>
                  <p className="mt-2 text-sm text-foreground/90">{signal.suggestion}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
