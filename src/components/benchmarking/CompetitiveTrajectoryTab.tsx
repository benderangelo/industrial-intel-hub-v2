import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { competitiveTrajectories } from "@/data/caseData";
import { addRoadmapSuggestion, buildTrajectoryRoadmapSuggestion } from "@/lib/strategic-intelligence";

const years = Array.from({ length: 13 }, (_, index) => 2018 + index);
const todayYear = 2026;

const threatTone = (value: string) => {
  if (value.includes("MÁXIMA")) return "bg-destructive/10 text-destructive border-destructive/20";
  if (value.includes("ALTA")) return "bg-chart-warning/10 text-chart-warning border-chart-warning/20";
  if (value.includes("CRESCENTE")) return "bg-chart-warning/10 text-chart-warning border-chart-warning/20";
  return "bg-accent/10 text-accent border-accent/20";
};

const gapTone = (value: string) => {
  if (value.includes("AUMENTANDO")) return "text-destructive";
  if (value.includes("DIMINUINDO")) return "text-chart-success";
  return "text-chart-warning";
};

export function CompetitiveTrajectoryTab() {
  const navigate = useNavigate();

  const innovationSpeed = useMemo(() => ([
    ...competitiveTrajectories.map((trajectory) => ({ name: trajectory.brand, score: trajectory.innovationSpeedScore, fill: trajectory.color })),
    { name: "CASE", score: 65, fill: "hsl(var(--primary))" },
  ].sort((left, right) => right.score - left.score)), []);

  const projectedActions = useMemo(() => competitiveTrajectories
    .flatMap((trajectory) => trajectory.projectedNextMoves
      .filter((move) => move.confidence === "Alta")
      .map((move) => ({ trajectory, move })))
    .sort((left, right) => left.move.year.localeCompare(right.move.year)), []);

  const todayPosition = ((todayYear - years[0]) / (years[years.length - 1] - years[0])) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Trajetória Competitiva</h2>
        <p className="text-sm text-muted-foreground">Velocidade e direção de inovação por fabricante — e onde o gap da CASE está ficando estrutural.</p>
      </div>

      <section className="overflow-x-auto rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <div className="min-w-[980px] space-y-5">
          <div className="ml-[180px] grid grid-cols-13 gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {years.map((year) => <span key={year}>{year}</span>)}
          </div>

          <div className="relative space-y-4">
            <div className="pointer-events-none absolute bottom-0 top-0 rounded-2xl bg-secondary/25" style={{ left: `calc(180px + ${todayPosition}% * (100% - 180px) / 100)`, width: `calc((100% - 180px) * ${(100 - todayPosition) / 100})` }} />
            <div className="pointer-events-none absolute bottom-0 top-0 border-l border-dashed border-primary/60" style={{ left: `calc(180px + ${todayPosition}% * (100% - 180px) / 100)` }} />

            {competitiveTrajectories.map((trajectory) => (
              <div key={trajectory.brand} className="grid grid-cols-[160px_minmax(0,1fr)] gap-5">
                <div className="rounded-2xl border border-border bg-secondary/25 p-4">
                  <p className="text-sm font-semibold text-foreground">{trajectory.brand}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{trajectory.overallDirection}</p>
                  <Badge variant="outline" className={`mt-3 ${threatTone(trajectory.threatLevel)}`}>{trajectory.threatLevel}</Badge>
                </div>

                <div className="relative h-[84px] rounded-2xl border border-border bg-background/80 px-3 py-2">
                  <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-border" />
                  {trajectory.yearlyMilestones.map((milestone) => {
                    const position = ((milestone.year - years[0]) / (years[years.length - 1] - years[0])) * 100;
                    return (
                      <button
                        key={`${trajectory.brand}-${milestone.year}-${milestone.event}`}
                        type="button"
                        title={`${milestone.year} • ${milestone.event} • impacto ${milestone.impact}`}
                        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-[0_0_0_2px_hsl(var(--card))]"
                        style={{ left: `${position}%`, backgroundColor: trajectory.color }}
                      />
                    );
                  })}
                  {trajectory.projectedNextMoves.map((move, index) => {
                    const yearValue = Number.parseInt(move.year, 10) || 2027 + index;
                    const position = ((yearValue - years[0]) / (years[years.length - 1] - years[0])) * 100;
                    return (
                      <button
                        key={`${trajectory.brand}-${move.year}-${move.prediction}`}
                        type="button"
                        title={`${move.year} • ${move.prediction} • confiança ${move.confidence}`}
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed bg-card"
                        style={{ left: `${position}%`, borderColor: trajectory.color }}
                      >
                        <span className="sr-only">{move.prediction}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {competitiveTrajectories.map((trajectory) => (
            <article key={trajectory.brand} className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{trajectory.brand}</h3>
                  <p className="text-sm text-muted-foreground">{trajectory.overallDirection}</p>
                </div>
                <Badge variant="outline" className={threatTone(trajectory.threatLevel)}>{trajectory.threatLevel}</Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Velocidade de inovação</span>
                    <span className="font-semibold text-foreground">{trajectory.innovationSpeedScore}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${trajectory.innovationSpeedScore}%`, backgroundColor: trajectory.color }} />
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  <span className={`font-semibold ${gapTone(trajectory.caseGapTrend)}`}>{trajectory.caseGapTrend.split("—")[0].trim()}</span>
                  <span> — {trajectory.caseGapTrend.split("—").slice(1).join("—").trim()}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Velocidade de inovação comparada</h3>
          <div className="mt-4 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={innovationSpeed} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} width={96} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {innovationSpeed.map((item) => <Cell key={item.name} fill={item.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Projeções que exigem ação</h3>
            <p className="mt-1 text-sm text-muted-foreground">Movimentos com alta confiança que devem alimentar o roadmap antes de virarem gap permanente.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {projectedActions.map(({ trajectory, move }) => (
            <article key={`${trajectory.brand}-${move.year}-${move.prediction}`} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{move.year}</p>
                  <p className="text-xs text-muted-foreground">{trajectory.brand}</p>
                </div>
                <Badge variant="outline" className="border-border bg-secondary/40 text-foreground">Confiança {move.confidence}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/85">{move.prediction}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  addRoadmapSuggestion(buildTrajectoryRoadmapSuggestion(trajectory, move));
                  navigate("/next-gen-roadmap");
                }}
              >
                Gerar ação no Roadmap →
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
