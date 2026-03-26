import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowRight, ArrowDownRight, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  calculateRegionalFit,
  caseMachines,
  getMachineOverallScore,
  getRegionalFitExplanation,
  getRegionalRecommendation,
  regionalProfiles,
  type RegionalDemandPriority,
} from "@/data/caseData";
import { getRegionalWinRateMap, loadFieldReports } from "@/lib/strategic-intelligence";

type RegionId = keyof typeof regionalProfiles;

const regionOrder: RegionId[] = ["north_america", "europe", "latin_america", "middle_east_africa", "asia_pacific"];

const gapBarTone = (relevance: string) => {
  if (relevance.includes("CRÍTICA")) return "hsl(var(--destructive))";
  if (relevance.includes("ALTA")) return "hsl(var(--chart-warning))";
  if (relevance.includes("VANTAGEM")) return "hsl(var(--chart-success))";
  if (relevance.includes("CRESCENTE")) return "hsl(var(--accent))";
  return "hsl(var(--muted-foreground))";
};

const fitTone = (score: number) => score >= 80
  ? "bg-chart-success/10 text-chart-success"
  : score >= 60
    ? "bg-chart-warning/10 text-chart-warning"
    : "bg-destructive/10 text-destructive";

const trendIcon = (trend: RegionalDemandPriority["trend"]) => {
  if (trend === "up") return <ArrowUpRight className="h-4 w-4 text-chart-success" />;
  if (trend === "down") return <ArrowDownRight className="h-4 w-4 text-destructive" />;
  return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
};

const exportRegionalMatrix = () => {
  const headers = ["Produto", "Score Geral", "Fit NA", "Fit EU", "Fit LATAM", "Fit MEA", "Fit APAC"];
  const rows = caseMachines.map((machine) => [
    machine.model,
    String(getMachineOverallScore(machine.id) ?? "—"),
    String(calculateRegionalFit(machine, regionalProfiles.north_america)),
    String(calculateRegionalFit(machine, regionalProfiles.europe)),
    String(calculateRegionalFit(machine, regionalProfiles.latin_america)),
    String(calculateRegionalFit(machine, regionalProfiles.middle_east_africa)),
    String(calculateRegionalFit(machine, regionalProfiles.asia_pacific)),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).split('"').join('""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "regional-intelligence-matrix.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function RegionalIntelligence() {
  const [activeRegion, setActiveRegion] = useState<RegionId>("north_america");
  const [expandedPriority, setExpandedPriority] = useState<string | null>(null);

  const profile = regionalProfiles[activeRegion];
  const regionalWinRates = useMemo(() => getRegionalWinRateMap(loadFieldReports()), []);
  const fieldSignal = regionalWinRates[activeRegion];

  const sortedPriorities = useMemo(
    () => [...profile.demandPriorities].sort((a, b) => b.weight - a.weight),
    [profile.demandPriorities],
  );

  const matrixRows = useMemo(() => caseMachines.map((machine) => ({
    machine,
    overallScore: getMachineOverallScore(machine.id) ?? 0,
    fits: {
      north_america: calculateRegionalFit(machine, regionalProfiles.north_america),
      europe: calculateRegionalFit(machine, regionalProfiles.europe),
      latin_america: calculateRegionalFit(machine, regionalProfiles.latin_america),
      middle_east_africa: calculateRegionalFit(machine, regionalProfiles.middle_east_africa),
      asia_pacific: calculateRegionalFit(machine, regionalProfiles.asia_pacific),
    },
  })), []);

  return (
    <div className="space-y-6 p-6 section-enter">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Regional Intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">O que cada mercado realmente precisa — e onde nossos gaps importam.</p>
      </header>

      <section className="flex flex-wrap gap-2">
        {regionOrder.map((regionId) => {
          const region = regionalProfiles[regionId];
          const isActive = regionId === activeRegion;

          return (
            <button
              key={regionId}
              type="button"
              onClick={() => setActiveRegion(regionId)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-[transform,background-color,border-color] duration-200 active:scale-[0.98] ${
                isActive ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <span className="mr-2">{region.flag}</span>
              {region.name}
            </button>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-3xl">{profile.flag}</div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">{profile.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{profile.marketSize}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-secondary/40 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Annual Revenue</p>
              <p className="mt-2 text-lg font-bold text-foreground">{profile.annualRevenue}</p>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">CASE Presence</p>
              <p className="mt-2 text-sm font-medium text-foreground">{profile.casePresence}</p>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4 md:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Field Intelligence</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Win rate {fieldSignal?.winRate ?? 0}%</Badge>
                <span className="text-sm text-muted-foreground">{fieldSignal?.total ?? 0} decisões registradas nesta região</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Top Competitors</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.topCompetitors.map((competitor) => (
                <Badge key={competitor} variant="outline" className="bg-secondary/30 text-foreground">{competitor}</Badge>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Relevância dos gaps</h2>
          <div className="mt-5 space-y-4">
            {Object.entries(profile.gapRelevance).map(([key, gap]) => (
              <div key={key} className="space-y-2" title={gap.note}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium capitalize text-foreground">{key.split("_").join(" ")}</p>
                  <Badge variant="outline" className="border-border bg-secondary/30 text-foreground">{gap.relevance}</Badge>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${gap.score}%`, backgroundColor: gapBarTone(gap.relevance) }} />
                </div>
                <p className="text-xs text-muted-foreground">{gap.note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Prioridades de demanda</h2>
        <div className="mt-5 space-y-3">
          {sortedPriorities.map((item) => {
            const expanded = expandedPriority === item.priority;
            return (
              <button
                key={item.priority}
                type="button"
                onClick={() => setExpandedPriority(expanded ? null : item.priority)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-left transition-[transform,box-shadow] duration-200 hover:shadow-[0_12px_28px_hsl(var(--foreground)/0.05)] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{trendIcon(item.trend)}</div>
                  <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{item.priority}</p>
                  <span className="text-sm font-bold text-foreground">{item.weight}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${item.weight}%` }} />
                </div>
                {expanded && <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Matriz produto × adequação regional</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fit score ponderado por relevância regional, vantagens CASE e gaps que realmente importam.</p>
          </div>
          <Button variant="outline" onClick={exportRegionalMatrix}><Download className="h-4 w-4" />Exportar matriz</Button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Produto</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fit NA</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fit EU</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fit LATAM</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fit MEA</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fit APAC</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map(({ machine, overallScore, fits }) => (
                <tr key={machine.id} className="border-b border-border/60 hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-foreground">{machine.model}</p>
                      <p className="text-xs text-muted-foreground">{machine.family}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge className={fitTone(overallScore)}>{overallScore}</Badge></td>
                  {regionOrder.map((regionId) => (
                    <td key={`${machine.id}-${regionId}`} className="px-4 py-3" title={getRegionalFitExplanation(machine, regionalProfiles[regionId])}>
                      <Badge className={fitTone(fits[regionId])}>{fits[regionId]}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-primary">🎯 Recomendação para {profile.name}</h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
          {getRegionalRecommendation(activeRegion).map((recommendation) => (
            <div key={recommendation} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p>{recommendation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}