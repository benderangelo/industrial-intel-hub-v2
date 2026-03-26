import { useMemo } from "react";
import {
  caseMachines,
  getMachineEngineeringProfile,
  roadmapItems,
  type EngineeringSubsystemKey,
} from "@/data/caseData";
import { loadFieldReports, getFeatureRequestCounts } from "@/lib/strategic-intelligence";

const SUBSYSTEM_KEYS: EngineeringSubsystemKey[] = ["structure", "powertrain", "hydraulics", "transmission", "implements", "cabin"];

interface MaturityMetric {
  label: string;
  value: string;
  description: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export function PortfolioMaturityCard() {
  const metrics = useMemo((): MaturityMetric[] => {
    // 1. Readiness Score — % com score ≥85
    const profiles = caseMachines.map((m) => getMachineEngineeringProfile(m.id)).filter(Boolean);
    const readyCount = profiles.filter((p) => p!.overallScore >= 85).length;
    const readinessPercent = profiles.length > 0 ? Math.round((readyCount / profiles.length) * 100) : 0;

    // 2. Gap Coverage — % itens critical/high já em dev ou aprovados
    const criticalHigh = roadmapItems.filter((i) => i.priority === "critical" || i.priority === "high");
    const covered = criticalHigh.filter((i) => i.status === "in_development" || i.status === "approved" || i.status === "completed");
    const gapCoveragePercent = criticalHigh.length > 0 ? Math.round((covered.length / criticalHigh.length) * 100) : 0;

    // 3. EV Penetration — % de plataformas eletrificadas
    const evCount = caseMachines.filter((m) => m.electrified).length;
    const evPercent = Math.round((evCount / caseMachines.length) * 100);

    // 4. Competitive Parity — média delta CASE vs melhor concorrente
    let totalDelta = 0, deltaCount = 0;
    profiles.forEach((p) => {
      p!.subsystems.forEach((sub) => {
        const bestCompetitor = sub.competitors.reduce((best, c) => c.score > best ? c.score : best, 0);
        if (bestCompetitor > 0) { totalDelta += sub.score - bestCompetitor; deltaCount++; }
      });
    });
    const avgDelta = deltaCount > 0 ? Math.round(totalDelta / deltaCount) : 0;

    // 5. Field-to-Roadmap Loop — features de campo que aparecem no roadmap
    const reports = loadFieldReports();
    const topFeatures = getFeatureRequestCounts(reports).slice(0, 5);
    const roadmapTitlesLower = roadmapItems.map((i) => i.title.toLowerCase() + " " + i.description.toLowerCase());
    const matchedFeatures = topFeatures.filter((f) =>
      roadmapTitlesLower.some((t) =>
        f.name.toLowerCase().split(/\s+/).some((word) => word.length > 3 && t.includes(word))
      )
    );
    const loopPercent = topFeatures.length > 0 ? Math.round((matchedFeatures.length / topFeatures.length) * 100) : 0;

    return [
      {
        label: "Portfolio Readiness",
        value: `${readinessPercent}%`,
        description: `${readyCount} de ${profiles.length} modelos com score ≥85`,
        tone: readinessPercent >= 60 ? "success" : readinessPercent >= 40 ? "warning" : "danger",
      },
      {
        label: "Gap Coverage",
        value: `${gapCoveragePercent}%`,
        description: `${covered.length} de ${criticalHigh.length} itens critical/high em ação`,
        tone: gapCoveragePercent >= 50 ? "success" : gapCoveragePercent >= 25 ? "warning" : "danger",
      },
      {
        label: "EV Penetration",
        value: `${evPercent}%`,
        description: `${evCount} plataformas eletrificadas no lineup`,
        tone: evPercent >= 15 ? "success" : evPercent >= 5 ? "warning" : "neutral",
      },
      {
        label: "Competitive Parity",
        value: `${avgDelta > 0 ? "+" : ""}${avgDelta}`,
        description: avgDelta >= 0 ? "CASE à frente da média concorrente" : "Concorrência à frente em subsistemas",
        tone: avgDelta >= 0 ? "success" : avgDelta >= -5 ? "warning" : "danger",
      },
      {
        label: "Field → Roadmap",
        value: `${loopPercent}%`,
        description: `${matchedFeatures.length} de ${topFeatures.length} features de campo no roadmap`,
        tone: loopPercent >= 60 ? "success" : loopPercent >= 30 ? "warning" : "danger",
      },
    ];
  }, []);

  const toneStyle = (tone: MaturityMetric["tone"]) => {
    switch (tone) {
      case "success": return { bg: "bg-chart-success/10", text: "text-chart-success", border: "border-chart-success/20" };
      case "warning": return { bg: "bg-chart-warning/10", text: "text-chart-warning", border: "border-chart-warning/20" };
      case "danger": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Portfolio Maturity Scorecard</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">Maturidade do portfólio — visão do Engenheiro</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const style = toneStyle(metric.tone);
          return (
            <div key={metric.label} className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
              <p className={`mt-2 text-2xl font-extrabold ${style.text}`}>{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
