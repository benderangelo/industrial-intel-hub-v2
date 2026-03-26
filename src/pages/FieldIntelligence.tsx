import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { caseMachines, fieldReportPresets, type FieldReport, type FieldReportPrimaryReason } from "@/data/caseData";
import { competitorProducts } from "@/data/webScannerCatalog";
import {
  buildFieldAiPrompt,
  getFeatureRequestCounts,
  getFieldMetrics,
  getLossesByCompetitor,
  getLossReasonBreakdown,
  loadFieldReports,
  saveFieldReports,
  syncFieldRoadmapSuggestions,
} from "@/lib/strategic-intelligence";
import { toast } from "@/hooks/use-toast";

const fieldSchema = z.object({
  type: z.enum(["win", "loss", "feedback"]),
  product: z.string().trim().min(1, "Selecione um produto CASE"),
  region: z.string().trim().min(1, "Selecione uma região"),
  client: z.string().trim().max(120).optional(),
  competitor: z.string().trim().max(120).optional(),
  primaryReason: z.enum(["price", "feature_technical", "availability", "support", "financing", "relationship", "other"]).optional(),
  featureMissing: z.string().trim().max(240).optional(),
  decisiveFeature: z.string().trim().max(240).optional(),
  proposalValue: z.string().trim().optional(),
  comment: z.string().trim().min(8, "Adicione um comentário mais completo").max(1200),
});

const regionOptions = [
  { value: "north_america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "latin_america", label: "Latin America" },
  { value: "asia_pacific", label: "Asia Pacific" },
  { value: "middle_east_africa", label: "Middle East & Africa" },
  { value: "oceania", label: "Oceania" },
];

const reasonOptions: Array<{ value: FieldReportPrimaryReason; label: string }> = [
  { value: "price", label: "Preço" },
  { value: "feature_technical", label: "Feature técnica" },
  { value: "availability", label: "Disponibilidade / prazo" },
  { value: "support", label: "Rede de suporte / peças" },
  { value: "financing", label: "Financiamento" },
  { value: "relationship", label: "Relacionamento com dealer" },
  { value: "other", label: "Outro" },
];

const initialForm = {
  type: "loss" as FieldReport["type"],
  product: caseMachines[0]?.model ?? "",
  region: "north_america",
  client: "",
  competitor: competitorProducts[0]?.name ?? "",
  primaryReason: "price" as FieldReportPrimaryReason,
  featureMissing: "",
  decisiveFeature: "",
  proposalValue: "",
  comment: "",
};

const cardTone = (type: FieldReport["type"]) => {
  if (type === "loss") return "border-destructive/25 bg-destructive/5";
  if (type === "win") return "border-chart-success/25 bg-chart-success/5";
  return "border-border bg-card";
};

export default function FieldIntelligence() {
  const [reports, setReports] = useState<FieldReport[]>(() => loadFieldReports());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    saveFieldReports(reports);
    syncFieldRoadmapSuggestions(reports);
  }, [reports]);

  const metrics = useMemo(() => getFieldMetrics(reports), [reports]);
  const lossReasons = useMemo(() => getLossReasonBreakdown(reports), [reports]);
  const featureRequests = useMemo(() => getFeatureRequestCounts(reports), [reports]);
  const lossesByCompetitor = useMemo(() => getLossesByCompetitor(reports), [reports]);

  const handleSubmit = () => {
    const parsed = fieldSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Validação", description: parsed.error.errors[0]?.message ?? "Preencha os campos obrigatórios." });
      return;
    }

    const value = parsed.data;
    const report: FieldReport = {
      id: `field-${crypto.randomUUID()}`,
      type: value.type,
      product: value.product,
      region: value.region,
      client: value.client || undefined,
      lostTo: value.type === "loss" ? value.competitor || undefined : undefined,
      lostToBrand: value.type === "loss" ? competitorProducts.find((competitor) => competitor.name === value.competitor)?.brand : undefined,
      wonAgainst: value.type === "win" ? value.competitor || undefined : undefined,
      wonAgainstBrand: value.type === "win" ? competitorProducts.find((competitor) => competitor.name === value.competitor)?.brand : undefined,
      primaryReason: value.type === "loss" ? value.primaryReason : undefined,
      featureMissing: value.featureMissing || undefined,
      decisiveFeature: value.type === "win" ? value.decisiveFeature || undefined : undefined,
      proposalValue: value.proposalValue ? Number(value.proposalValue) : undefined,
      comment: value.comment,
      date: new Date().toISOString().split("T")[0],
    };

    const next = [report, ...reports];
    setReports(next);
    setForm(initialForm);
    toast({ title: "Relatório salvo", description: "Field Intelligence atualizado com sucesso." });
  };

  return (
    <div className="space-y-6 p-6 section-enter">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Field Intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dados de campo que calibram a priorização de produto e fecham o loop entre engenharia e vendas.</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Novo relatório de campo</h2>
            <Button variant="ghost" size="sm" onClick={() => setReports(fieldReportPresets)}>Reset presets</Button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["win", "loss", "feedback"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${form.type === type ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  {type === "win" ? "Win" : type === "loss" ? "Loss" : "Feedback"}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <select value={form.product} onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
                {caseMachines.map((machine) => <option key={machine.id} value={machine.model}>{machine.model}</option>)}
              </select>
              <select value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
                {regionOptions.map((region) => <option key={region.value} value={region.value}>{region.label}</option>)}
              </select>
            </div>

            <Input value={form.client} onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))} placeholder="Cliente (opcional)" />

            {form.type !== "feedback" && (
              <select value={form.competitor} onChange={(event) => setForm((current) => ({ ...current, competitor: event.target.value }))} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
                {competitorProducts.map((competitor) => <option key={competitor.id} value={competitor.name}>{competitor.name}</option>)}
              </select>
            )}

            {form.type === "loss" && (
              <div className="grid gap-3 md:grid-cols-2">
                <select value={form.primaryReason} onChange={(event) => setForm((current) => ({ ...current, primaryReason: event.target.value as FieldReportPrimaryReason }))} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
                  {reasonOptions.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                </select>
                <Input value={form.featureMissing} onChange={(event) => setForm((current) => ({ ...current, featureMissing: event.target.value }))} placeholder="Feature específica que faltou" />
              </div>
            )}

            {form.type === "win" && (
              <Input value={form.decisiveFeature} onChange={(event) => setForm((current) => ({ ...current, decisiveFeature: event.target.value }))} placeholder="Feature decisiva" />
            )}

            <Input value={form.proposalValue} onChange={(event) => setForm((current) => ({ ...current, proposalValue: event.target.value }))} placeholder="Valor da proposta" type="number" />
            <Textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Comentários adicionais" className="min-h-[140px]" />

            <Button onClick={handleSubmit}>Enviar relatório</Button>
          </div>
        </article>

        <div className="space-y-5">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Win Rate</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{metrics.winRate}%</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Losses</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{metrics.losses}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top Loss Reason</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{metrics.topLossReason}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top Feature Request</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{metrics.topFeatureRequest}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Most Lost To</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{metrics.mostLostTo}</p>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Motivos de perda</h2>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={lossReasons} dataKey="value" nameKey="name" innerRadius={48} outerRadius={86} fill="hsl(var(--primary))" paddingAngle={3} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Features mais solicitadas</h2>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureRequests.slice(0, 5)} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={132} tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Perdas por concorrente</h2>
                <p className="mt-1 text-sm text-muted-foreground">Padrão competitivo real que deve alimentar benchmark e roadmap.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.dispatchEvent(new CustomEvent("nexus-ai:prompt", { detail: { prompt: buildFieldAiPrompt(reports), open: true } }))}
              >
                Analisar com IA
              </Button>
            </div>
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lossesByCompetitor} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={132} tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Relatórios recentes</h2>
        <div className="mt-4 space-y-3">
          {reports.map((report) => {
            const expanded = expandedId === report.id;
            return (
              <article key={report.id} className={`rounded-2xl border p-4 ${cardTone(report.type)}`}>
                <button type="button" onClick={() => setExpandedId(expanded ? null : report.id)} className="flex w-full items-start justify-between gap-3 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{report.type.toUpperCase()}</Badge>
                      <p className="text-sm font-semibold text-foreground">{report.product}</p>
                      <span className="text-xs text-muted-foreground">{report.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{report.comment}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{expanded ? "Ocultar" : "Expandir"}</span>
                </button>

                {expanded && (
                  <div className="mt-4 space-y-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                    {report.lostTo && <p><span className="font-semibold text-foreground">Perdemos para:</span> {report.lostTo}</p>}
                    {report.wonAgainst && <p><span className="font-semibold text-foreground">Vencemos contra:</span> {report.wonAgainst}</p>}
                    {report.featureMissing && <p><span className="font-semibold text-foreground">Feature missing:</span> {report.featureMissing}</p>}
                    {report.decisiveFeature && <p><span className="font-semibold text-foreground">Feature decisiva:</span> {report.decisiveFeature}</p>}
                    {report.proposalValue && <p><span className="font-semibold text-foreground">Valor:</span> ${report.proposalValue.toLocaleString()}</p>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
