import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getRoadmapAffectedMachines,
  getRoadmapImpactSeries,
  getRoadmapInvestmentSummary,
  roadmapItems,
  type RoadmapItem,
  type RoadmapPriority,
  type RoadmapStatus,
} from "@/data/caseData";
import { loadRoadmapSuggestions } from "@/lib/strategic-intelligence";
import { PortfolioMaturityCard } from "@/components/nextgen/PortfolioMaturityCard";
import { SubsystemGapHeatmap } from "@/components/nextgen/SubsystemGapHeatmap";
import { TechnologyTimeline } from "@/components/nextgen/TechnologyTimeline";

const STATUS_STORAGE_KEY = "nexus-roadmap-status-v1";

const priorityOptions = ["all", "critical", "high", "medium", "low"] as const;
const phaseOptions = ["all", "1", "2", "3"] as const;

const subsystemTone: Record<RoadmapItem["subsystem"], string> = {
  structure: "hsl(var(--accent))",
  powertrain: "hsl(var(--primary))",
  hydraulics: "hsl(var(--chart-success))",
  transmission: "hsl(267 83% 58%)",
  implements: "hsl(var(--chart-warning))",
  cabin: "hsl(var(--destructive))",
};

const costTone = (cost: RoadmapItem["estimatedCost"]) => {
  if (cost === "very_high") return "bg-destructive/10 text-destructive border-destructive/20";
  if (cost === "high") return "bg-chart-warning/10 text-chart-warning border-chart-warning/20";
  return "bg-chart-success/10 text-chart-success border-chart-success/20";
};

const statusTone: Record<RoadmapStatus, string> = {
  proposed: "bg-muted text-muted-foreground",
  approved: "bg-chart-success/10 text-chart-success",
  in_development: "bg-accent/10 text-accent",
  completed: "bg-chart-success text-white",
  deferred: "bg-chart-warning/10 text-chart-warning",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabel: Record<RoadmapStatus, string> = {
  proposed: "Proposto",
  approved: "Aprovado",
  in_development: "Em Desenvolvimento",
  completed: "Implementado",
  deferred: "Adiado",
  rejected: "Rejeitado",
};

const createChatPrompt = (item: RoadmapItem) => [
  `Analise profundamente o item de roadmap \"${item.title}\".`,
  `Família afetada: ${item.affectedFamily}.`,
  `Score atual ${item.currentScore}, score projetado ${item.projectedScoreAfter}, delta ${item.scoreDelta}.`,
  `Explique riscos, dependências, retorno competitivo e recomendação executiva.`,
].join(" ");

export default function NextGenRoadmap() {
  const [familyFilter, setFamilyFilter] = useState("all");
  const [subsystemFilter, setSubsystemFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]>("all");
  const [phaseFilter, setPhaseFilter] = useState<(typeof phaseOptions)[number]>("all");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, RoadmapStatus>>({});
  const [suggestions, setSuggestions] = useState(() => loadRoadmapSuggestions());

  useEffect(() => {
    const raw = window.localStorage.getItem(STATUS_STORAGE_KEY);
    if (!raw) return;
    try {
      setStatusMap(JSON.parse(raw) as Record<string, RoadmapStatus>);
    } catch {
      setStatusMap({});
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
  }, [statusMap]);

  useEffect(() => {
    setSuggestions(loadRoadmapSuggestions());
  }, []);

  const families = useMemo(() => ["all", ...new Set(roadmapItems.map((item) => item.affectedFamily))], []);
  const subsystems = useMemo(() => ["all", ...new Set(roadmapItems.map((item) => item.subsystem))], []);

  const filteredItems = useMemo(() => roadmapItems.filter((item) => (
    (familyFilter === "all" || item.affectedFamily === familyFilter)
    && (subsystemFilter === "all" || item.subsystem === subsystemFilter)
    && (priorityFilter === "all" || item.priority === priorityFilter)
    && (phaseFilter === "all" || String(item.phase) === phaseFilter)
  )), [familyFilter, phaseFilter, priorityFilter, subsystemFilter]);

  const itemsByPhase = useMemo(() => [1, 2, 3].map((phase) => ({
    phase,
    items: filteredItems.filter((item) => item.phase === phase),
  })), [filteredItems]);

  const investment = getRoadmapInvestmentSummary();
  const impactSeries = getRoadmapImpactSeries();

  const handleAnalyzeWithAI = (item: RoadmapItem) => {
    window.dispatchEvent(new CustomEvent("nexus-ai:prompt", {
      detail: {
        prompt: createChatPrompt(item),
        open: true,
      },
    }));
  };

  return (
    <div className="space-y-6 p-6 section-enter">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Next Gen Roadmap</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão do Engenheiro de Portfólio — maturidade, gaps competitivos e roadmap tecnológico CASE Construction.</p>
      </header>

      <PortfolioMaturityCard />

      <SubsystemGapHeatmap />

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value)} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
            {families.map((family) => <option key={family} value={family}>{family === "all" ? "Família" : family}</option>)}
          </select>
          <select value={subsystemFilter} onChange={(event) => setSubsystemFilter(event.target.value)} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
            {subsystems.map((subsystem) => <option key={subsystem} value={subsystem}>{subsystem === "all" ? "Subsistema" : subsystem}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityOptions)[number])} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
            {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority === "all" ? "Prioridade" : priority}</option>)}
          </select>
          <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value as (typeof phaseOptions)[number])} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
            {phaseOptions.map((phase) => <option key={phase} value={phase}>{phase === "all" ? "Fase" : `Fase ${phase}`}</option>)}
          </select>
        </div>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <div className="grid min-w-[960px] grid-cols-3 gap-5">
          {itemsByPhase.map(({ phase, items }) => (
            <div key={phase} className="rounded-2xl bg-secondary/20 p-4">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">MY202{phase + 6}</p>
                <h2 className="text-lg font-bold text-foreground">Fase {phase}</h2>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border px-4 py-3 shadow-[0_10px_24px_hsl(var(--foreground)/0.04)] ${costTone(item.estimatedCost)}`}
                    style={{ borderLeftColor: subsystemTone[item.subsystem], borderLeftWidth: 4 }}
                    title={item.marketImpact}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.estimatedCostRange}</p>
                      </div>
                      <Badge variant="outline" className="border-border bg-card/80 text-foreground">{item.priority}</Badge>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Sumário de investimento</h2>
          <div className="mt-5 space-y-4">
            {investment.summary.map((phase) => {
              const total = phase.total.max || 1;
              return (
                <div key={phase.phase}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Fase {phase.phase}</span>
                    <span className="text-muted-foreground">${phase.total.min}-{phase.total.max}M</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(total / investment.total.max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total roadmap</p>
            <p className="mt-2 text-xl font-bold text-foreground">${investment.total.min}-{investment.total.max}M</p>
          </div>
        </article>

        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Impacto projetado</h2>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impactSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis domain={[75, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))" }} />
                <Line type="monotone" dataKey="competitor" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {impactSeries.map((point) => (
              <div key={point.label} className="rounded-2xl bg-secondary/30 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{point.label}</p>
                <p className="mt-2 text-lg font-bold text-foreground">{point.score}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <TechnologyTimeline />

      {suggestions.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Sugestões vindas da inteligência estratégica</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ações sugeridas a partir da Trajetória Competitiva e do Field Intelligence.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {suggestions.map((suggestion) => (
              <article key={suggestion.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-border bg-secondary/40 text-foreground">{suggestion.sourceLabel}</Badge>
                  <Badge className={suggestion.priority === "high" ? "bg-destructive/10 text-destructive" : suggestion.priority === "medium" ? "bg-chart-warning/10 text-chart-warning" : "bg-chart-success/10 text-chart-success"}>{suggestion.priority}</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{suggestion.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expanded.includes(item.id);
          const affectedMachines = getRoadmapAffectedMachines(item);
          const currentStatus = statusMap[item.id] ?? item.status;

          return (
            <article key={item.id} className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
                    <Badge className={statusTone[currentStatus]}>{statusLabel[currentStatus]}</Badge>
                    <Badge variant="outline" className="border-border bg-secondary/30 text-foreground">{item.targetModelYear}</Badge>
                    <Badge variant="outline" className="border-border bg-secondary/30 text-foreground">Δ {item.scoreDelta}</Badge>
                  </div>
                  <p className="mt-2 max-w-[80ch] text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={currentStatus}
                    onChange={(event) => setStatusMap((current) => ({ ...current, [item.id]: event.target.value as RoadmapStatus }))}
                    className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground"
                  >
                    {Object.keys(statusLabel).map((status) => (
                      <option key={status} value={status}>{statusLabel[status as RoadmapStatus]}</option>
                    ))}
                  </select>
                  <Button variant="outline">Enviar para discussão</Button>
                  <Button variant="outline" onClick={() => handleAnalyzeWithAI(item)}><Bot className="h-4 w-4" />Analisar com IA</Button>
                  <Button variant="ghost" size="icon" onClick={() => setExpanded((current) => current.includes(item.id) ? current.filter((entry) => entry !== item.id) : [...current, item.id])}>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl bg-secondary/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Família</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{item.affectedFamily}</p>
                      </div>
                      <div className="rounded-2xl bg-secondary/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tempo</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{item.developmentTime}</p>
                      </div>
                      <div className="rounded-2xl bg-secondary/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Custo estimado</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{item.estimatedCostRange}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Modelos afetados</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {affectedMachines.map((machine) => <Badge key={machine.id} variant="outline" className="border-border bg-card text-foreground">{machine.model}</Badge>)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Concorrentes endereçados</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.competitorsAddressed.map((competitor) => <Badge key={competitor} variant="outline" className="border-border bg-card text-foreground">{competitor}</Badge>)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Score antes/depois</p>
                      <div className="mt-4 h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ name: "Atual", value: item.currentScore }, { name: "Projetado", value: item.projectedScoreAfter }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              <Cell fill="hsl(var(--muted-foreground))" />
                              <Cell fill="hsl(var(--primary))" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Impacto e risco</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.marketImpact}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-border bg-card text-foreground">Risco {item.riskLevel}</Badge>
                        <Badge variant="outline" className="border-border bg-card text-foreground">{item.category}</Badge>
                        <Badge variant="outline" className="border-border bg-card text-foreground">{item.subsystem}</Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.regions.map((region) => <Badge key={region} className="bg-primary/10 text-primary hover:bg-primary/10">{region.split("_").join(" ")}</Badge>)}
                      </div>
                      {item.dependencies.length > 0 && (
                        <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Dependências:</span> {item.dependencies.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}