import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  type CASEMachine,
  caseMachines,
  type EngineeringSubsystemCompetitor,
  type EngineeringSubsystemKey,
  getMachineEngineeringProfile,
} from "@/data/caseData";
import { getComponentTreeForSubsystem, type ComponentNode } from "@/data/componentTree";
import {
  buildComponentAnalysisPrompt,
  flattenComponentSpecs,
  getComponentCompletion,
  isPendingInternalSpec,
  loadEditedComponentSpecs,
  resolveComponentInternalSpecs,
  saveEditedComponentSpecs,
  summarizeComponentSpecs,
  type StoredComponentInternalSpecs,
} from "@/lib/component-intelligence";
import { cn } from "@/lib/utils";
import { InlineScrollVideo } from "@/components/InlineScrollVideo";

const subsystemMeta: Record<EngineeringSubsystemKey, { label: string; short: string; emoji: string; color: string }> = {
  structure: { label: "Structure", short: "EST", emoji: "🔩", color: "hsl(209 66% 57%)" },
  powertrain: { label: "Powertrain", short: "PWR", emoji: "⚙️", color: "hsl(var(--primary))" },
  hydraulics: { label: "Hydraulics", short: "HID", emoji: "💧", color: "hsl(145 63% 49%)" },
  transmission: { label: "Transmission", short: "TRN", emoji: "🔗", color: "hsl(282 39% 53%)" },
  implements: { label: "Implements", short: "IMP", emoji: "🪣", color: "hsl(37 90% 51%)" },
  cabin: { label: "Cabin", short: "CAB", emoji: "🪑", color: "hsl(6 78% 57%)" },
};

const subsystemOrder = Object.keys(subsystemMeta) as EngineeringSubsystemKey[];

const familyEmoji = (family: string) => {
  const normalized = family.toLowerCase();
  if (normalized.includes("loader") || normalized.includes("carreg")) return "🏗️";
  if (normalized.includes("excav") || normalized.includes("escav")) return "⛏️";
  if (normalized.includes("grader") || normalized.includes("motonivel")) return "🛣️";
  if (normalized.includes("dozer")) return "🧱";
  if (normalized.includes("backhoe") || normalized.includes("retro")) return "🚜";
  if (normalized.includes("skid") || normalized.includes("compact")) return "🧰";
  return "⚙️";
};

const scoreColor = (score: number) => (score >= 85 ? "hsl(var(--chart-success))" : score >= 75 ? "hsl(var(--chart-warning))" : "hsl(var(--chart-danger))");

const scoreBadgeStyle = (score: number) => ({
  backgroundColor: score >= 85 ? "hsl(134 41% 88%)" : score >= 75 ? "hsl(46 100% 90%)" : "hsl(354 70% 91%)",
  color: score >= 85 ? "hsl(134 62% 21%)" : score >= 75 ? "hsl(45 94% 27%)" : "hsl(354 61% 28%)",
});

const progressStyle = (score: number) => ({
  width: `${score}%`,
  backgroundColor: scoreColor(score),
});

const competitorBarColor = (caseScore: number, competitorScore: number) => (
  competitorScore > caseScore ? "hsl(var(--chart-danger))" : competitorScore < caseScore ? "hsl(var(--chart-success))" : "hsl(var(--chart-warning))"
);

const formatFieldLabel = (value: string) => value.replace(/_/g, " ");

const getPriorityTone = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized.includes("prioridade #1") || normalized.includes("prioridade alta") || normalized.includes("absoluta")) {
    return "border-l-[hsl(var(--chart-danger))] bg-[hsl(var(--chart-danger)/0.08)] text-[hsl(var(--chart-danger))]";
  }
  if (normalized.includes("prioridade")) {
    return "border-l-[hsl(var(--chart-warning))] bg-[hsl(var(--chart-warning)/0.12)] text-[hsl(32_80%_32%)]";
  }
  return "border-l-border bg-muted/40 text-foreground";
};

const normalizeSubsystem = (value: string | null): EngineeringSubsystemKey => (
  value && subsystemOrder.includes(value as EngineeringSubsystemKey) ? value as EngineeringSubsystemKey : "structure"
);

const buildQuickSpecs = (machine: CASEMachine) => {
  const preferredLabels = ["Engine", "Potência", "Peso operacional", "Bucket", "Bucket breakout", "Tipping load", "Breakout", "Tipping"];
  const mapped = preferredLabels
    .map((label) => machine.technicalSummary.find((item) => item.label.toLowerCase() === label.toLowerCase()))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const fallback = [
    { label: "Engine", value: machine.engine },
    { label: "Power", value: machine.hp },
    { label: "Weight", value: machine.weightClass },
    ...machine.technicalSummary,
  ];

  const merged = [...mapped, ...fallback].reduce<Array<{ label: string; value: string }>>((acc, item) => {
    if (!acc.some((entry) => entry.label === item.label)) acc.push({ label: item.label, value: item.value });
    return acc;
  }, []);

  return merged.slice(0, 6);
};

const getRadarPoints = (scores: number[], radius = 100, cx = 150, cy = 140) => scores.map((score, index) => {
  const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
  const scaledRadius = (score / 100) * radius;
  return {
    x: cx + scaledRadius * Math.cos(angle),
    y: cy + scaledRadius * Math.sin(angle),
  };
});

const polygonPoints = (radius: number, cx = 150, cy = 140) => subsystemOrder.map((_, index) => {
  const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
  return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
}).join(" ");

const axisLabelPosition = (index: number, radius = 115, cx = 150, cy = 140) => {
  const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
};

export default function Subsystems() {
  const navigate = useNavigate();
  const { machineId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [componentSectionOpen, setComponentSectionOpen] = useState(false);
  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);
  const [componentEdits, setComponentEdits] = useState<StoredComponentInternalSpecs>(() => loadEditedComponentSpecs());
  const [editingField, setEditingField] = useState<{ componentId: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const selectedMachine = caseMachines.find((machine) => machine.id === machineId) ?? caseMachines[0];
  const engineeringProfile = useMemo(() => getMachineEngineeringProfile(selectedMachine.id), [selectedMachine.id]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const activeSubsystem = normalizeSubsystem(searchParams.get("subsystem"));
  const activeComponentTree = useMemo(() => getComponentTreeForSubsystem(activeSubsystem), [activeSubsystem]);

  const subsystemData = engineeringProfile?.subsystems.find((subsystem) => subsystem.key === activeSubsystem) ?? engineeringProfile?.subsystems[0] ?? null;
  const effectiveCompetitorName = selectedCompetitor ?? subsystemData?.competitors[0]?.name ?? null;

  useEffect(() => {
    if (!machineId && caseMachines[0]) {
      navigate(`/subsystems/${caseMachines[0].id}?subsystem=${activeSubsystem}`, { replace: true });
    }
  }, [activeSubsystem, machineId, navigate]);

  useEffect(() => {
    setSelectedCompetitor(subsystemData?.competitors[0]?.name ?? null);
  }, [selectedMachine.id, activeSubsystem, subsystemData?.competitors]);

  useEffect(() => {
    setExpandedComponentId(null);
    setComponentSectionOpen(false);
    setEditingField(null);
    setEditingValue("");
  }, [selectedMachine.id, activeSubsystem]);

  if (!engineeringProfile || !subsystemData) return null;

  const activeCompetitor = subsystemData.competitors.find((competitor) => competitor.name === effectiveCompetitorName) ?? subsystemData.competitors[0] ?? null;
  const caseScores = subsystemOrder.map((key) => engineeringProfile.subsystems.find((subsystem) => subsystem.key === key)?.score ?? 0);
  const competitorScores = subsystemOrder.map((key) => {
    const detail = engineeringProfile.subsystems.find((subsystem) => subsystem.key === key);
    return detail?.competitors.find((competitor) => competitor.name === activeCompetitor?.name)?.score ?? 75;
  });
  const caseRadarPoints = getRadarPoints(caseScores);
  const competitorRadarPoints = getRadarPoints(competitorScores);
  const quickSpecs = buildQuickSpecs(selectedMachine);
  const subsystemTheme = subsystemMeta[subsystemData.key];

  const startEditingField = (component: ComponentNode, field: string) => {
    const resolved = resolveComponentInternalSpecs(component, componentEdits);
    setEditingField({ componentId: component.id, field });
    setEditingValue(isPendingInternalSpec(resolved[field]) ? "" : resolved[field]);
  };

  const saveFieldValue = () => {
    if (!editingField) return;

    const next = {
      ...componentEdits,
      [editingField.componentId]: {
        ...(componentEdits[editingField.componentId] ?? {}),
        [editingField.field]: editingValue.trim() || "[CARREGAR DADO INTERNO]",
      },
    };

    setComponentEdits(next);
    saveEditedComponentSpecs(next);
    setEditingField(null);
    setEditingValue("");
  };

  const handleMachineChange = (machine: CASEMachine) => {
    navigate(`/subsystems/${machine.id}?subsystem=structure`);
  };

  const handleSubsystemChange = (subsystemKey: EngineeringSubsystemKey) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("subsystem", subsystemKey);
    setSearchParams(nextParams, { replace: true });
  };

  const renderCompetitorCard = (competitor: EngineeringSubsystemCompetitor) => {
    const isSelected = competitor.name === activeCompetitor?.name;
    const delta = competitor.score - subsystemData.score;

    return (
      <button
        key={competitor.name}
        type="button"
        onClick={() => setSelectedCompetitor(competitor.name)}
        className="w-full rounded-[12px] p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 active:scale-[0.98]"
        style={{
          background: isSelected ? "hsl(var(--chart-competitor) / 0.06)" : "hsl(var(--card))",
          border: isSelected ? "2px solid hsl(var(--chart-competitor))" : "1px solid hsl(var(--border))",
          boxShadow: isSelected ? "0 14px 32px hsl(var(--chart-competitor) / 0.12)" : "none",
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-bold" style={{ color: isSelected ? "hsl(var(--chart-competitor))" : "hsl(var(--foreground))" }}>{competitor.name}</p>
          <div className="text-right">
            <div className="flex items-end justify-end gap-1">
              <span className="text-lg font-extrabold" style={{ color: competitor.score > subsystemData.score ? "hsl(var(--chart-danger))" : "hsl(var(--chart-success))" }}>{competitor.score}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
              {delta !== 0 && (
                <span className="ml-1 text-[10px]" style={{ color: delta > 0 ? "hsl(var(--chart-danger))" : "hsl(var(--chart-success))" }}>
                  {delta > 0 ? `▲ ${delta}` : `▼ ${Math.abs(delta)}`}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="h-[6px] overflow-hidden rounded-full bg-border/90">
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${competitor.score}%`, background: competitorBarColor(subsystemData.score, competitor.score) }} />
        </div>
        <p className="mt-3 text-xs leading-[1.6] text-muted-foreground">{competitor.analysis}</p>
      </button>
    );
  };

  const renderComponentCard = (component: ComponentNode) => {
    const resolvedInternalSpecs = resolveComponentInternalSpecs(component, componentEdits);
    const summary = summarizeComponentSpecs(component);
    const completion = getComponentCompletion(component, componentEdits);
    const isExpanded = expandedComponentId === component.id;

    return (
      <article key={component.id} className="rounded-2xl border border-border bg-card shadow-[0_18px_42px_hsl(var(--foreground)/0.05)]">
        <button
          type="button"
          onClick={() => setExpandedComponentId((current) => current === component.id ? null : component.id)}
          className="w-full rounded-2xl px-5 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-xl">{component.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">{component.name}</h4>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                  {completion.completed} de {completion.total} campos preenchidos ({completion.percent}%)
                </span>
              </div>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{summary || component.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/80">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${completion.percent}%` }} />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {completion.pending === 0 ? "✅ Validado" : `${completion.pending} pendente${completion.pending > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-primary">{isExpanded ? "Recolher ↑" : "Expandir →"}</span>
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-5 border-t border-border px-5 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Descrição</p>
              <p className="mt-2 text-sm leading-7 text-foreground/80">{component.description}</p>
            </div>

            <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h5 className="text-sm font-bold text-foreground">Specs públicos</h5>
                    <span className="text-[11px] text-muted-foreground">Base comparativa disponível</span>
                  </div>
                  <div className="space-y-3">
                    {flattenComponentSpecs(component.publicSpecs).map((spec) => (
                      <div key={`${component.id}-public-${spec.label}`} className="rounded-xl border border-border/70 bg-card px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{spec.label}</p>
                        <p className="mt-1 text-sm leading-6 text-foreground/85">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h5 className="text-sm font-bold text-foreground">Dados internos</h5>
                    <span className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-semibold",
                      completion.pending === 0 ? "bg-[hsl(var(--chart-success)/0.14)] text-[hsl(var(--chart-success))]" : "bg-[hsl(var(--chart-warning)/0.18)] text-[hsl(32_80%_32%)]",
                    )}>
                      {completion.pending === 0 ? "✅ Validado" : "⚠️ Dado interno pendente"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(resolvedInternalSpecs).map(([field, value]) => {
                      const isPending = isPendingInternalSpec(value);
                      const isEditing = editingField?.componentId === component.id && editingField.field === field;

                      return (
                        <div key={`${component.id}-${field}`} className="rounded-xl border border-border/70 bg-card px-3 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{formatFieldLabel(field)}</p>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "rounded-full px-2 py-1 text-[10px] font-semibold",
                                isPending ? "bg-[hsl(var(--chart-warning)/0.18)] text-[hsl(32_80%_32%)]" : "bg-[hsl(var(--chart-success)/0.14)] text-[hsl(var(--chart-success))]",
                              )}>
                                {isPending ? "⚠️ Dado interno pendente" : "✅ Validado"}
                              </span>
                              <button type="button" className="text-xs font-semibold text-primary" onClick={() => startEditingField(component, field)}>✏️ Editar</button>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                              <input
                                autoFocus
                                value={editingValue}
                                onChange={(event) => setEditingValue(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") saveFieldValue();
                                  if (event.key === "Escape") {
                                    setEditingField(null);
                                    setEditingValue("");
                                  }
                                }}
                                className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15"
                                placeholder="Inserir valor interno real"
                              />
                              <div className="flex gap-2">
                                <button type="button" onClick={saveFieldValue} className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Salvar</button>
                                <button type="button" onClick={() => { setEditingField(null); setEditingValue(""); }} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm leading-6 text-foreground/85">{value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <h5 className="mb-3 text-sm font-bold text-foreground">Comparação com concorrentes</h5>
                  <div className="space-y-3">
                    {Object.entries(component.competitorComparison).map(([brand, note]) => (
                      <div key={`${component.id}-${brand}`} className="rounded-xl border border-border/70 bg-card px-3 py-3">
                        <p className="text-xs font-bold text-foreground">{brand}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <h5 className="mb-3 text-sm font-bold text-foreground">Oportunidades de melhoria</h5>
                  <div className="space-y-2">
                    {component.improvementOpportunities.map((opportunity) => (
                      <div key={`${component.id}-${opportunity}`} className={cn("rounded-xl border-l-4 px-3 py-3 text-sm leading-6", getPriorityTone(opportunity))}>
                        {opportunity}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = buildComponentAnalysisPrompt({
                      component,
                      machineName: selectedMachine.model,
                      subsystemLabel: subsystemTheme.label,
                      resolvedInternalSpecs,
                    });

                    window.dispatchEvent(new CustomEvent("nexus-ai:prompt", { detail: { prompt, open: true } }));
                  }}
                  className="w-full rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/12"
                >
                  Analisar com IA
                </button>
              </div>
            </section>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="space-y-5 bg-background p-6 section-enter">
      <header>
        <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.3px] text-foreground">Engineering Subsystems</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Decomposição técnica por subconjunto de engenharia — dados reais vs. concorrência global</p>
      </header>


      <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
          {caseMachines.map((machine) => {
            const isSelected = machine.id === selectedMachine.id;
            const score = getMachineEngineeringProfile(machine.id)?.overallScore ?? 0;
            return (
              <button
                key={machine.id}
                type="button"
                onClick={() => handleMachineChange(machine)}
                className="min-w-[240px] rounded-[10px] px-5 py-3 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 active:scale-[0.98]"
                style={{
                  border: isSelected ? "2px solid hsl(var(--primary))" : "2px solid hsl(var(--border))",
                  background: isSelected ? "hsl(var(--primary) / 0.08)" : "hsl(var(--card))",
                  boxShadow: isSelected ? "0 16px 32px hsl(var(--primary) / 0.12)" : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-muted text-2xl">
                    {familyEmoji(machine.family)}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>{machine.model}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{machine.family}</p>
                    <p className="mt-1 text-[10px]" style={{ color: scoreColor(score) }}>Score {score}/100</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 self-stretch rounded-[10px] border border-border bg-card px-4 py-3 xl:min-w-[180px]">
          <p className="text-[11px] text-muted-foreground">Score Geral CASE</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-2xl font-extrabold leading-none" style={{ color: scoreColor(engineeringProfile.overallScore) }}>{engineeringProfile.overallScore}</span>
            <span className="text-[11px] text-muted-foreground">/100</span>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-6 rounded-[12px] border border-border bg-card px-5 py-4">
        {quickSpecs.map((spec) => (
          <div key={`${spec.label}-${spec.value}`} className="min-w-[120px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">{spec.label}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground/80">{spec.value}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-1.5">
        {engineeringProfile.subsystems.map((subsystem) => {
          const isSelected = subsystem.key === subsystemData.key;
          const meta = subsystemMeta[subsystem.key];
          return (
            <button
              key={subsystem.key}
              type="button"
              onClick={() => handleSubsystemChange(subsystem.key)}
              className="flex items-center gap-2 rounded-[8px] px-4 py-2 text-xs font-semibold transition-[transform,border-color,background-color] duration-200 active:scale-[0.98]"
              style={{
                border: isSelected ? `2px solid ${meta.color}` : "2px solid hsl(var(--border))",
                background: isSelected ? `${meta.color.replace('hsl(', 'hsl(').replace(')', ' / 0.15)')}` : "hsl(var(--card))",
                color: isSelected ? meta.color : "hsl(var(--muted-foreground))",
              }}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
              <span className="rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold" style={scoreBadgeStyle(subsystem.score)}>{subsystem.score}</span>
            </button>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <article className="rounded-[12px] border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">{subsystemTheme.emoji}</span>
              <h2 className="text-base font-bold text-foreground">{subsystemTheme.label} — CASE {selectedMachine.model}</h2>
              <div className="ml-auto flex min-w-[168px] items-center gap-2">
                <div className="h-[10px] flex-1 overflow-hidden rounded-full bg-border/90">
                  <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={progressStyle(subsystemData.score)} />
                </div>
                <span className="min-w-7 text-right text-[13px] font-bold" style={{ color: scoreColor(subsystemData.score) }}>{subsystemData.score}</span>
              </div>
            </div>

            <p className="text-[13px] leading-[1.7] text-foreground/75">{subsystemData.analysis}</p>

            <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-[hsl(var(--chart-warning)/0.45)] bg-[hsl(var(--chart-warning)/0.12)] px-3.5 py-3">
              <span className="text-base">⚠️</span>
              <p className="text-[13px] leading-[1.5] text-[hsl(32_53%_36%)]">
                <strong className="text-[hsl(34_72%_45%)]">Gap Identificado:</strong> {subsystemData.gap}
              </p>
            </div>

            {activeComponentTree && (
              <button
                type="button"
                onClick={() => setComponentSectionOpen((current) => !current)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/12"
              >
                <span>🔍</span>
                <span>{componentSectionOpen ? "Ocultar componentes detalhados" : "Ver componentes detalhados →"}</span>
              </button>
            )}
          </article>

          <article className="rounded-[12px] border border-border bg-card p-5">
            <p className="mb-2 text-[13px] font-bold text-muted-foreground">
              RADAR DE ENGENHARIA — {selectedMachine.model} vs. {activeCompetitor?.name ?? "Concorrente"}
            </p>

            <div className="flex justify-center">
              <svg viewBox="0 0 300 290" className="w-full max-w-[320px] overflow-visible">
                {[25, 50, 75, 100].map((level) => (
                  <polygon key={level} points={polygonPoints(level)} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                ))}
                {subsystemOrder.map((key, index) => {
                  const labelPoint = axisLabelPosition(index);
                  return (
                    <g key={key}>
                      <line x1="150" y1="140" x2={labelPoint.x} y2={labelPoint.y - 12} stroke="hsl(var(--border))" strokeWidth="0.5" />
                      <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" fontSize="9" fontWeight="600" fill="hsl(var(--muted-foreground))">
                        {subsystemMeta[key].short}
                      </text>
                    </g>
                  );
                })}

                <polygon points={caseRadarPoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
                <polygon points={competitorRadarPoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="hsl(var(--chart-competitor) / 0.15)" stroke="hsl(var(--chart-competitor))" strokeWidth="1.5" />

                {caseRadarPoints.map((point, index) => <circle key={`case-${subsystemOrder[index]}`} cx={point.x} cy={point.y} r="3.5" fill="hsl(var(--primary))" />)}
                {competitorRadarPoints.map((point, index) => <circle key={`competitor-${subsystemOrder[index]}`} cx={point.x} cy={point.y} r="3" fill="hsl(var(--chart-competitor))" />)}

                <g transform="translate(76 270)">
                  <rect width="10" height="10" fill="hsl(var(--primary))" rx="2" />
                  <text x="16" y="9" fontSize="9" fill="hsl(var(--muted-foreground))">CASE</text>
                </g>
                <g transform="translate(170 270)">
                  <rect width="10" height="10" fill="hsl(var(--chart-competitor))" rx="2" />
                  <text x="16" y="9" fontSize="9" fill="hsl(var(--muted-foreground))">{activeCompetitor?.name ?? "Competitor"}</text>
                </g>
              </svg>
            </div>
          </article>

          <InlineScrollVideo src="/subsystems-engineering.mp4" height={680} scrollLength={1400} />
        </div>

        <div className="space-y-3">
          <h3 className="m-0 text-[13px] font-bold uppercase text-muted-foreground">CONCORRENTES — {subsystemTheme.label}</h3>
          {subsystemData.competitors.map(renderCompetitorCard)}

          <article className="rounded-[12px] border border-primary/25 bg-[linear-gradient(135deg,hsl(var(--primary)/0.07),hsl(var(--primary)/0.02))] p-4">
            <p className="mb-2 text-xs font-bold text-primary">🎯 RECOMENDAÇÃO NEXT GEN</p>
            <p className="text-xs leading-[1.6] text-muted-foreground">{subsystemData.recommendation}</p>
          </article>
        </div>
      </section>

      {activeComponentTree && componentSectionOpen && (
        <section className="rounded-[20px] border border-border bg-card p-5 shadow-[0_22px_52px_hsl(var(--foreground)/0.06)]">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-foreground">🔍 Componentes — {activeComponentTree.label}</h3>
              <p className="text-sm text-muted-foreground">Drill-down em subcomponentes com dados técnicos</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {activeComponentTree.components.length} componentes mapeados
            </span>
          </div>

          <div className="space-y-4">
            {activeComponentTree.components.map(renderComponentCard)}
          </div>
        </section>
      )}
    </div>
  );
}