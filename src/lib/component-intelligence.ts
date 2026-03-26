import type { ComponentNode, ComponentSpecValue } from "@/data/componentTree";

export const COMPONENT_INTERNAL_STORAGE_KEY = "nexus_component_internal_specs_v1";

export type StoredComponentInternalSpecs = Record<string, Record<string, string>>;

export const isPendingInternalSpec = (value: string) => value.trim().startsWith("[");

export const loadEditedComponentSpecs = (): StoredComponentInternalSpecs => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(COMPONENT_INTERNAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) as StoredComponentInternalSpecs : {};
  } catch {
    return {};
  }
};

export const saveEditedComponentSpecs = (data: StoredComponentInternalSpecs) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPONENT_INTERNAL_STORAGE_KEY, JSON.stringify(data));
};

export const resolveComponentInternalSpecs = (component: ComponentNode, overrides: StoredComponentInternalSpecs = {}) => {
  const componentOverrides = overrides[component.id] ?? {};
  return Object.fromEntries(
    Object.entries(component.internalSpecs).map(([field, fallback]) => [field, componentOverrides[field] ?? fallback]),
  ) as Record<string, string>;
};

export const getComponentPendingCount = (component: ComponentNode, overrides: StoredComponentInternalSpecs = {}) => {
  const resolved = resolveComponentInternalSpecs(component, overrides);
  return Object.values(resolved).filter(isPendingInternalSpec).length;
};

export const getComponentCompletion = (component: ComponentNode, overrides: StoredComponentInternalSpecs = {}) => {
  const total = Object.keys(component.internalSpecs).length;
  const pending = getComponentPendingCount(component, overrides);
  const completed = total - pending;
  const percent = total === 0 ? 100 : Math.round((completed / total) * 100);
  return { total, pending, completed, percent };
};

const flattenValue = (label: string, value: ComponentSpecValue): Array<{ label: string; value: string }> => {
  if (typeof value === "string") return [{ label, value }];
  return Object.entries(value).map(([nestedLabel, nestedValue]) => ({ label: `${label} · ${nestedLabel}`, value: nestedValue }));
};

export const flattenComponentSpecs = (specs: Record<string, ComponentSpecValue>) => (
  Object.entries(specs).flatMap(([label, value]) => flattenValue(label.replace(/_/g, " "), value))
);

export const summarizeComponentSpecs = (component: ComponentNode, maxItems = 3) => (
  flattenComponentSpecs(component.publicSpecs)
    .slice(0, maxItems)
    .map((entry) => entry.value)
    .join(" — ")
);

export const buildComponentAnalysisPrompt = ({
  component,
  machineName,
  subsystemLabel,
  resolvedInternalSpecs,
}: {
  component: ComponentNode;
  machineName: string;
  subsystemLabel: string;
  resolvedInternalSpecs: Record<string, string>;
}) => {
  const pendingFields = Object.entries(resolvedInternalSpecs)
    .filter(([, value]) => isPendingInternalSpec(value))
    .map(([field]) => field);

  return [
    `Analise o componente ${component.name} da máquina ${machineName} no subsistema ${subsystemLabel}.`,
    `Descrição do componente: ${component.description}`,
    `Specs públicos: ${JSON.stringify(component.publicSpecs)}`,
    `Specs internos carregados: ${JSON.stringify(resolvedInternalSpecs)}`,
    `Comparação com concorrentes: ${JSON.stringify(component.competitorComparison)}`,
    `Oportunidades de melhoria: ${JSON.stringify(component.improvementOpportunities)}`,
    pendingFields.length > 0
      ? `Campos internos ainda pendentes: ${pendingFields.join(", ")}. Sinalize claramente os dados faltantes sem inventar informações proprietárias.`
      : "Todos os campos internos disponíveis neste componente já foram carregados na plataforma.",
  ].join("\n\n");
};