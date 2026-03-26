import type { PersistedScannerInsight } from "@/lib/web-scanner";
import {
  caseMachines,
  fieldReportPresets,
  type EngineeringSubsystemKey,
  type FieldReport,
  type FieldReportPrimaryReason,
  type CompetitiveTrajectory,
  type CompetitiveTrajectoryProjection,
} from "@/data/caseData";

export interface RoadmapSuggestion {
  id: string;
  title: string;
  source: "trajectory" | "field";
  summary: string;
  affectedFamily: string;
  subsystem: EngineeringSubsystemKey;
  priority: "high" | "medium" | "low";
  createdAt: string;
  sourceLabel: string;
}

export const FIELD_REPORTS_STORAGE_KEY = "case-nexus-field-reports-v1";
export const ROADMAP_SUGGESTIONS_STORAGE_KEY = "case-nexus-roadmap-suggestions-v1";

const reasonLabels: Record<FieldReportPrimaryReason, string> = {
  price: "Preço",
  feature_technical: "Feature técnica",
  availability: "Disponibilidade",
  support: "Rede de suporte",
  financing: "Financiamento",
  relationship: "Relacionamento",
  other: "Outro",
};

const regionLabels: Record<string, string> = {
  north_america: "North America",
  europe: "Europe",
  latin_america: "Latin America",
  asia_pacific: "Asia Pacific",
  middle_east_africa: "Middle East & Africa",
  oceania: "Oceania",
};

const normalizeFeatureTheme = (text: string) => {
  const value = text.toLowerCase();
  if (/(grade|imc|machine control|smartgrade|payload|swing assist)/i.test(value)) {
    return {
      key: "machine-control",
      label: "Machine Control / Grade 3D",
      subsystem: "hydraulics" as EngineeringSubsystemKey,
    };
  }
  if (/(cvt|evt|electric drive|transmission|transmiss)/i.test(value)) {
    return {
      key: "advanced-transmission",
      label: "CVT / transmissão eficiente",
      subsystem: "transmission" as EngineeringSubsystemKey,
    };
  }
  if (/(people detection|radar|safety|camera|detecção)/i.test(value)) {
    return {
      key: "people-detection",
      label: "People Detection / segurança ativa",
      subsystem: "cabin" as EngineeringSubsystemKey,
    };
  }
  if (/(battery|charging|dc fast|fast charging|kwh|zero emiss)/i.test(value)) {
    return {
      key: "battery-upgrade",
      label: "Bateria / charging",
      subsystem: "powertrain" as EngineeringSubsystemKey,
    };
  }
  if (/(power|hp|potência|force|força)/i.test(value)) {
    return {
      key: "power-upgrade",
      label: "Potência / força disponível",
      subsystem: "powertrain" as EngineeringSubsystemKey,
    };
  }

  return {
    key: "feature-parity",
    label: "Feature parity",
    subsystem: "implements" as EngineeringSubsystemKey,
  };
};

const getRegionLabel = (region: string) => regionLabels[region] ?? region;

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const dedupeSuggestions = (suggestions: RoadmapSuggestion[]) => {
  const map = new Map<string, RoadmapSuggestion>();
  suggestions.forEach((suggestion) => {
    const current = map.get(suggestion.title);
    if (!current || new Date(suggestion.createdAt).getTime() > new Date(current.createdAt).getTime()) {
      map.set(suggestion.title, suggestion);
    }
  });

  return Array.from(map.values()).sort((left, right) => (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  ));
};

export const loadFieldReports = (): FieldReport[] => {
  if (typeof window === "undefined") return fieldReportPresets;

  const raw = window.localStorage.getItem(FIELD_REPORTS_STORAGE_KEY);
  if (!raw) return fieldReportPresets;

  try {
    return JSON.parse(raw) as FieldReport[];
  } catch {
    return fieldReportPresets;
  }
};

export const saveFieldReports = (reports: FieldReport[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FIELD_REPORTS_STORAGE_KEY, JSON.stringify(reports));
};

export const loadRoadmapSuggestions = (): RoadmapSuggestion[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ROADMAP_SUGGESTIONS_STORAGE_KEY);
  if (!raw) return [];

  try {
    return dedupeSuggestions(JSON.parse(raw) as RoadmapSuggestion[]);
  } catch {
    return [];
  }
};

export const saveRoadmapSuggestions = (suggestions: RoadmapSuggestion[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROADMAP_SUGGESTIONS_STORAGE_KEY, JSON.stringify(dedupeSuggestions(suggestions)));
};

export const addRoadmapSuggestion = (suggestion: RoadmapSuggestion) => {
  const current = loadRoadmapSuggestions();
  saveRoadmapSuggestions([suggestion, ...current]);
};

export const buildTrajectoryRoadmapSuggestion = (
  trajectory: CompetitiveTrajectory,
  projection: CompetitiveTrajectoryProjection,
): RoadmapSuggestion => ({
  id: createId("trajectory"),
  title: `${trajectory.brand}: responder a ${projection.prediction}`,
  source: "trajectory",
  summary: `${trajectory.brand} projeta ${projection.prediction} (${projection.year}). Converter em resposta de produto antes que o gap fique estrutural.`,
  affectedFamily: "Linha estratégica CASE",
  subsystem: projection.subsystem,
  priority: trajectory.threatLevel.includes("MÁXIMA") || projection.confidence === "Alta" ? "high" : "medium",
  createdAt: new Date().toISOString(),
  sourceLabel: `Trajetória ${trajectory.brand}`,
});

export const buildFieldRoadmapSuggestions = (reports: FieldReport[]): RoadmapSuggestion[] => {
  const grouped = new Map<string, { count: number; label: string; subsystem: EngineeringSubsystemKey; family: string }>();

  reports.forEach((report) => {
    const featureText = `${report.featureMissing ?? ""} ${report.comment ?? ""} ${report.decisiveFeature ?? ""}`.trim();
    if (!featureText) return;
    const feature = normalizeFeatureTheme(featureText);
    const family = caseMachines.find((machine) => machine.model === report.product)?.family ?? "Linha CASE";
    const current = grouped.get(feature.key);
    grouped.set(feature.key, {
      count: (current?.count ?? 0) + 1,
      label: feature.label,
      subsystem: feature.subsystem,
      family,
    });
  });

  return Array.from(grouped.entries())
    .filter(([, value]) => value.count >= 2)
    .sort((left, right) => right[1].count - left[1].count)
    .slice(0, 4)
    .map(([, value]) => ({
      id: createId("field"),
      title: `${value.label} aparece repetidamente em campo`,
      source: "field",
      summary: `${value.count} menções recentes em relatórios de campo pedem resposta de produto para ${value.family}.`,
      affectedFamily: value.family,
      subsystem: value.subsystem,
      priority: value.count >= 4 ? "high" : "medium",
      createdAt: new Date().toISOString(),
      sourceLabel: "Field Intelligence",
    }));
};

export const syncFieldRoadmapSuggestions = (reports: FieldReport[]) => {
  const existing = loadRoadmapSuggestions().filter((item) => item.source !== "field");
  saveRoadmapSuggestions([...existing, ...buildFieldRoadmapSuggestions(reports)]);
};

export const getFieldMetrics = (reports: FieldReport[]) => {
  const wins = reports.filter((report) => report.type === "win").length;
  const losses = reports.filter((report) => report.type === "loss").length;
  const totalDecisions = wins + losses;
  const winRate = totalDecisions > 0 ? Math.round((wins / totalDecisions) * 100) : 0;

  const reasonCount = new Map<FieldReportPrimaryReason, number>();
  const competitorCount = new Map<string, number>();
  const featureCount = new Map<string, number>();

  reports.forEach((report) => {
    if (report.type === "loss" && report.primaryReason) {
      reasonCount.set(report.primaryReason, (reasonCount.get(report.primaryReason) ?? 0) + 1);
      if (report.lostToBrand) {
        competitorCount.set(report.lostToBrand, (competitorCount.get(report.lostToBrand) ?? 0) + 1);
      }
    }

    const featureSource = [report.featureMissing, report.decisiveFeature, report.comment].filter(Boolean).join(" ");
    if (featureSource) {
      const feature = normalizeFeatureTheme(featureSource);
      featureCount.set(feature.label, (featureCount.get(feature.label) ?? 0) + 1);
    }
  });

  const topLossReason = Array.from(reasonCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "price";
  const topFeatureRequest = Array.from(featureCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Nenhuma tendência crítica";
  const mostLostTo = Array.from(competitorCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    winRate,
    losses,
    topLossReason: reasonLabels[topLossReason],
    topFeatureRequest,
    mostLostTo,
  };
};

export const getLossReasonBreakdown = (reports: FieldReport[]) => {
  const losses = reports.filter((report) => report.type === "loss");
  const grouped = new Map<string, number>();

  losses.forEach((report) => {
    const label = reasonLabels[report.primaryReason ?? "other"];
    grouped.set(label, (grouped.get(label) ?? 0) + 1);
  });

  return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
};

export const getFeatureRequestCounts = (reports: FieldReport[]) => {
  const grouped = new Map<string, number>();

  reports.forEach((report) => {
    const source = [report.featureMissing, report.decisiveFeature, report.comment].filter(Boolean).join(" ");
    if (!source) return;
    const feature = normalizeFeatureTheme(source);
    grouped.set(feature.label, (grouped.get(feature.label) ?? 0) + 1);
  });

  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
};

export const getLossesByCompetitor = (reports: FieldReport[]) => {
  const grouped = new Map<string, number>();

  reports
    .filter((report) => report.type === "loss")
    .forEach((report) => {
      const key = report.lostToBrand ?? report.lostTo ?? "Outro";
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
};

export const getRegionalWinRateMap = (reports: FieldReport[]) => {
  const grouped = new Map<string, { wins: number; losses: number }>();

  reports.forEach((report) => {
    const current = grouped.get(report.region) ?? { wins: 0, losses: 0 };
    if (report.type === "win") current.wins += 1;
    if (report.type === "loss") current.losses += 1;
    grouped.set(report.region, current);
  });

  return Array.from(grouped.entries()).reduce<Record<string, { label: string; winRate: number; total: number }>>((acc, [region, value]) => {
    const total = value.wins + value.losses;
    acc[region] = {
      label: getRegionLabel(region),
      winRate: total > 0 ? Math.round((value.wins / total) * 100) : 0,
      total,
    };
    return acc;
  }, {});
};

export const buildFieldScannerInsights = (reports: FieldReport[]): PersistedScannerInsight[] => {
  const grouped = new Map<string, { count: number; family: string; region: string; products: string[]; subsystem: EngineeringSubsystemKey }>();

  reports
    .filter((report) => report.type === "loss")
    .forEach((report) => {
      const source = [report.featureMissing, report.comment, report.decisiveFeature].filter(Boolean).join(" ");
      if (!source) return;

      const feature = normalizeFeatureTheme(source);
      const family = caseMachines.find((machine) => machine.model === report.product)?.family ?? "Linha CASE";
      const current = grouped.get(feature.key) ?? { count: 0, family, region: report.region, products: [], subsystem: feature.subsystem };
      current.count += 1;
      if (!current.products.includes(report.product)) current.products.push(report.product);
      grouped.set(feature.key, current);
    });

  return Array.from(grouped.entries())
    .filter(([, value]) => value.count >= 2)
    .map(([key, value]) => ({
      id: `field-${key}`,
      title: `Field data confirma gap de ${normalizeFeatureTheme(key).label} — ${value.count} losses recentes`,
      priority: value.count >= 3 ? "High" : "Medium",
      description: `${value.count} perdas recentes em campo citam o mesmo tema técnico. Os produtos impactados são ${value.products.join(", ")}.`,
      action: `Converter este padrão em ação de roadmap para ${value.family} e validar resposta de engenharia no subsistema ${value.subsystem}.`,
      affectedCaseProduct: value.products[0],
      competitorName: "Field Intelligence",
      competitorBrand: "CASE",
      family: value.family,
      region: getRegionLabel(value.region),
      source: "Dados internos da plataforma",
      date: new Date().toISOString().split("T")[0],
      type: "gap",
      createdAt: new Date().toISOString(),
    }));
};

export const buildFieldAiPrompt = (reports: FieldReport[]) => {
  const metrics = getFieldMetrics(reports);
  const topFeatures = getFeatureRequestCounts(reports).slice(0, 5);
  const topLosses = getLossesByCompetitor(reports).slice(0, 5);

  return [
    "Analise os relatórios de Field Intelligence da plataforma CASE Nexus.",
    `Win rate atual: ${metrics.winRate}%.`,
    `Top loss reason: ${metrics.topLossReason}.`,
    `Top feature request: ${metrics.topFeatureRequest}.`,
    `Features mais solicitadas: ${JSON.stringify(topFeatures)}.`,
    `Perdas por concorrente: ${JSON.stringify(topLosses)}.`,
    `Relatórios recentes: ${JSON.stringify(reports.slice(0, 8))}.`,
    "Monte padrões, riscos de produto e recomendações priorizadas para roadmap.",
  ].join(" ");
};
