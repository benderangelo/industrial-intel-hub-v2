import { useMemo, useState } from "react";
import { ScatterChart, Scatter, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { portfolioPrioritization, type PortfolioPrioritizationFamily } from "@/data/caseData";

const priorityTone = (score: number) => {
  if (score >= 90) return "hsl(var(--chart-success))";
  if (score >= 75) return "hsl(var(--chart-warning))";
  return "hsl(var(--destructive))";
};

const roiTone = (roi: string) => {
  if (roi.includes("Muito Alto") || roi.includes("Alto")) return "bg-chart-success/10 text-chart-success";
  if (roi.includes("Estratégico") || roi.includes("Médio")) return "bg-chart-warning/10 text-chart-warning";
  return "bg-secondary text-secondary-foreground";
};

const bubbleRadius = (margin: number) => Math.max(14, Math.min(42, margin / 4000000));

export function PortfolioPrioritizationTab() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editableFamilies, setEditableFamilies] = useState(portfolioPrioritization.families);

  const rankedFamilies = useMemo(() => editableFamilies
    .map((family) => ({
      ...family,
      totalMarginContribution: family.annualVolume * family.avgMarginPerUnit,
    }))
    .sort((left, right) => right.priorityScore - left.priorityScore), [editableFamilies]);

  const recommendations = rankedFamilies.slice(0, 4).map((family, index) => (
    `${index + 1}. ${family.family}: ${family.investmentNeeded} — ROI ${family.roi}`
  ));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Priorização de Portfólio</h2>
        <p className="text-sm text-muted-foreground">Gap severity × volume × margem × investimento para orientar alocação objetiva de engenharia.</p>
      </div>

      <section className="rounded-3xl border border-chart-warning/20 bg-chart-warning/10 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">[ESTIMATIVA] Dados de volume e margem são baseados em benchmarks públicos da indústria.</p>
            <p className="mt-1 text-sm text-muted-foreground">Substitua pelos dados internos da CNH para tornar a priorização financeiramente precisa.</p>
          </div>
          <Button variant="outline" onClick={() => setEditorOpen(true)}>Editar dados →</Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Bubble chart de priorização</h3>
            <p className="mt-1 text-sm text-muted-foreground">Quadrante superior direito = maior urgência de investimento.</p>
          </div>
          <Badge variant="outline" className="border-border bg-secondary/30 text-foreground">Budget {portfolioPrioritization.investmentBudget}</Badge>
        </div>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 16, bottom: 12, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="gapSeverity" name="Gap Severity" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis type="number" dataKey="annualVolume" name="Volume anual" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <ZAxis type="number" dataKey="totalMarginContribution" range={[120, 1800]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={rankedFamilies}
                shape={(props: { cx?: number; cy?: number; payload?: PortfolioPrioritizationFamily }) => {
                  const cx = props.cx ?? 0;
                  const cy = props.cy ?? 0;
                  const payload = props.payload;
                  if (!payload) return null;
                  const radius = bubbleRadius(payload.totalMarginContribution);
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={radius} fill={priorityTone(payload.priorityScore)} fillOpacity={0.16} stroke={priorityTone(payload.priorityScore)} strokeWidth={2} />
                      <text x={cx} y={cy} textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--foreground))">
                        {payload.family.split(" ")[0]}
                      </text>
                    </g>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Ranking de famílias</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Família</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Volume</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Margem/Un</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Gap</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Investimento</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">ROI</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Priority Score</th>
                </tr>
              </thead>
              <tbody>
                {rankedFamilies.map((family, index) => (
                  <tr key={family.family} className={`border-b border-border/60 ${index === 0 ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{family.family}</p>
                        <p className="text-xs text-muted-foreground">{family.gapSeverityLabel}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{family.annualVolume.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">${family.avgMarginPerUnit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">{family.gapSeverity}</td>
                    <td className="px-4 py-3 text-foreground">{family.investmentNeeded}</td>
                    <td className="px-4 py-3"><Badge className={roiTone(family.roi)}>{family.roi}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full" style={{ width: `${family.priorityScore}%`, backgroundColor: priorityTone(family.priorityScore) }} />
                        </div>
                        <span className="font-semibold text-foreground">{family.priorityScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Alocação recomendada do budget</h3>
          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-primary/15 bg-card/80 p-4 text-sm text-foreground/90">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar dados estimados</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
            {editableFamilies.map((family, index) => (
              <div key={family.family} className="grid gap-3 rounded-2xl border border-border bg-secondary/20 p-4 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
                <div>
                  <p className="font-semibold text-foreground">{family.family}</p>
                  <p className="text-xs text-muted-foreground">Priority Score {family.priorityScore}</p>
                </div>
                <Input
                  type="number"
                  value={family.annualVolume}
                  onChange={(event) => setEditableFamilies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, annualVolume: Number(event.target.value) || 0 } : item))}
                  placeholder="Volume anual"
                />
                <Input
                  type="number"
                  value={family.avgMarginPerUnit}
                  onChange={(event) => setEditableFamilies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, avgMarginPerUnit: Number(event.target.value) || 0 } : item))}
                  placeholder="Margem por unidade"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
