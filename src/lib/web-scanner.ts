import type { CASEMachine } from "@/data/caseData";
import type { CompetitorProduct, ScannerInsightPriority, ScannerInsightRecord } from "@/data/webScannerCatalog";

export interface ScannerCaseProduct {
  id: string;
  machineId: string;
  name: string;
  brand: "CASE";
  type: string;
  family: string;
  electricVariant: boolean;
  specs: {
    power_hp?: number;
    operatingWeight_lb?: number;
    emissionsSolution?: string;
    transmission?: string;
    battery_kwh?: number;
  };
}

export interface PersistedScannerInsight extends ScannerInsightRecord {
  createdAt: string;
  convertedAt?: string;
}

export interface ScannerSearchItem {
  id: string;
  kind: "competitor" | "case";
  name: string;
  brand: string;
  type: string;
  family: string;
  machineId?: string;
}

const caseFamilyMap: Array<{ match: (machine: CASEMachine) => boolean; family: string; type: string }> = [
  { match: (machine) => machine.model === "CASE 580EV", family: "580EV Electric Backhoe Loader", type: "Electric Backhoe Loader" },
  { match: (machine) => machine.model === "CASE CL36EV", family: "G Series Compact Wheel Loaders", type: "Compact Wheel Loader" },
  { match: (machine) => machine.family.includes("Pás Carregadeiras"), family: "G Series Wheel Loaders", type: "Wheel Loader" },
  { match: (machine) => machine.family.includes("Motoniveladoras"), family: "D Series Motor Graders", type: "Motor Grader" },
  { match: (machine) => machine.family.includes("Tratores de Esteira"), family: "M Series Crawler Dozers", type: "Crawler Dozer" },
  { match: (machine) => machine.family.includes("Retroescavadeiras"), family: "N Series Backhoe Loaders", type: "Backhoe Loader" },
  { match: (machine) => machine.electrified && machine.family.includes("Escavadeiras"), family: "Electric Mini Excavators", type: "Electric Mini Excavator" },
  { match: (machine) => machine.family.includes("Escavadeiras") && (machine.powerValue ?? 0) <= 70, family: "D Series Mini Excavators", type: "Mini Excavator" },
  { match: (machine) => machine.family.includes("Escavadeiras") && (machine.powerValue ?? 0) <= 130, family: "E Series Midi Excavators", type: "Midi Excavator" },
  { match: (machine) => machine.family.includes("Escavadeiras"), family: "E Series Excavators - Full Size", type: "Excavator" },
  { match: (machine) => machine.family.includes("Carregadeiras Articuladas"), family: "Small Articulating Loaders", type: "Small Articulated Loader" },
  { match: (machine) => /^SV/i.test(machine.model.replace("CASE ", "")), family: "B Series Skid Steers", type: "Skid Steer" },
  { match: (machine) => /^(TR|TV)/i.test(machine.model.replace("CASE ", "")), family: "B Series Compact Track Loaders", type: "Compact Track Loader" },
  { match: (machine) => /^TL/i.test(machine.model.replace("CASE ", "")), family: "Mini Track Loader", type: "Mini Track Loader" },
];

const familyFallback = { family: "G Series Wheel Loaders", type: "Equipment" };

const dedupeByTitle = (insights: PersistedScannerInsight[]) => {
  const map = new Map<string, PersistedScannerInsight>();
  insights.forEach((insight) => {
    const current = map.get(insight.title);
    if (!current || new Date(insight.createdAt).getTime() > new Date(current.createdAt).getTime()) {
      map.set(insight.title, insight);
    }
  });
  return Array.from(map.values());
};

const priorityWeight: Record<ScannerInsightPriority, number> = { High: 0, Medium: 1, Low: 2 };

export const sortInsights = (insights: PersistedScannerInsight[]) =>
  [...dedupeByTitle(insights)].sort((left, right) => {
    const priorityDelta = priorityWeight[left.priority] - priorityWeight[right.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });

export const normalizeRegion = (region?: string | null) => {
  const value = (region ?? "").trim().toLowerCase();
  if (value === "north_america") return "North America";
  if (value === "latin_america") return "Latin America";
  if (value === "asia_pacific" || value === "apac") return "Asia Pacific";
  if (value === "middle_east") return "Middle East";
  if (value === "africa") return "Africa";
  if (value === "oceania") return "Oceania";
  if (value === "europe") return "Europe";
  return region || "Global";
};

export const getCaseDisplayFamily = (machine: CASEMachine) =>
  caseFamilyMap.find((entry) => entry.match(machine)) ?? familyFallback;

const inferEmissions = (machine: CASEMachine) => {
  if (machine.electrified) return "Zero Emissions";
  if (/cvt/i.test(machine.transmission)) return "SCR only (no DPF)";
  if (/powershift/i.test(machine.transmission)) return "DOC + SCR";
  return "DOC + DPF + SCR";
};

const inferBattery = (machine: CASEMachine) => {
  const match = machine.hp.match(/(\d+)/);
  if (!machine.electrified || !match) return undefined;
  return Number(match[1]);
};

export const buildCaseScannerProducts = (machines: CASEMachine[]): ScannerCaseProduct[] => {
  const products = machines.map((machine) => {
    const display = getCaseDisplayFamily(machine);
    return {
      id: machine.id,
      machineId: machine.id,
      name: machine.model,
      brand: "CASE" as const,
      type: display.type,
      family: display.family,
      electricVariant: Boolean(machine.electrified),
      specs: {
        power_hp: machine.powerValue,
        operatingWeight_lb: machine.operatingWeightValue,
        emissionsSolution: inferEmissions(machine),
        transmission: machine.transmission,
        battery_kwh: inferBattery(machine),
      },
    };
  });

  return [
    {
      id: "case-580sn-alias",
      machineId: "580sv",
      name: "CASE 580SN",
      brand: "CASE",
      type: "Backhoe Loader",
      family: "N Series Backhoe Loaders",
      electricVariant: false,
      specs: {
        power_hp: 97,
        operatingWeight_lb: 17500,
        emissionsSolution: "DOC + SCR",
        transmission: "Powershift",
      },
    },
    ...products,
  ];
};

export const buildSearchIndex = (caseProducts: ScannerCaseProduct[], competitorProducts: readonly CompetitorProduct[]): ScannerSearchItem[] => [
  ...competitorProducts.map((product) => ({ id: product.id, kind: "competitor" as const, name: product.name, brand: product.brand, type: product.type, family: product.competesWithCaseFamily })),
  ...caseProducts.map((product) => ({ id: product.id, kind: "case" as const, name: product.name, brand: product.brand, type: product.type, family: product.family, machineId: product.machineId })),
];

export const searchProducts = (items: ScannerSearchItem[], query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return items
    .filter((item) => [item.name, item.brand, item.type, item.family].some((value) => value.toLowerCase().includes(normalized)))
    .sort((left, right) => {
      const leftStarts = left.name.toLowerCase().startsWith(normalized) ? 0 : 1;
      const rightStarts = right.name.toLowerCase().startsWith(normalized) ? 0 : 1;
      if (leftStarts !== rightStarts) return leftStarts - rightStarts;
      return left.name.localeCompare(right.name);
    })
    .slice(0, 8);
};

const todayIso = () => new Date().toISOString().split("T")[0];

const buildInsightId = (prefix: string, left: string, right: string) =>
  `${prefix}-${left.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${right.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

export const generateStaticInsights = (competitor: CompetitorProduct, caseProducts: ScannerCaseProduct[]): PersistedScannerInsight[] => {
  const insights: PersistedScannerInsight[] = [];
  const familyProducts = caseProducts.filter((product) => product.family === competitor.competesWithCaseFamily);

  familyProducts.forEach((caseProduct) => {
    if (competitor.specs.power_hp && caseProduct.specs.power_hp) {
      const delta = Math.round(((competitor.specs.power_hp - caseProduct.specs.power_hp) / caseProduct.specs.power_hp) * 100);
      if (delta > 15) {
        insights.push({
          id: buildInsightId("insight-power", competitor.name, caseProduct.name),
          title: `${competitor.name} supera ${caseProduct.name} em ${delta}% de potência`,
          priority: delta > 25 ? "High" : "Medium",
          description: `${competitor.name} entrega ${competitor.specs.power_hp} hp vs. ${caseProduct.specs.power_hp} hp da ${caseProduct.name}. Gap de ${delta}% pode impactar produtividade em ciclos pesados.`,
          action: `Avaliar incremento de potência para ${Math.round(competitor.specs.power_hp * 0.95)} hp+ na próxima geração da ${caseProduct.name}.`,
          affectedCaseProduct: caseProduct.name,
          competitorName: competitor.name,
          competitorBrand: competitor.brand,
          family: caseProduct.family,
          region: normalizeRegion(competitor.regions[0] ?? "Global"),
          source: competitor.source,
          date: todayIso(),
          type: "gap",
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (competitor.specs.emissionsSolution && caseProduct.specs.emissionsSolution) {
      const caseHasNoDpf = !caseProduct.specs.emissionsSolution.toLowerCase().includes("dpf");
      const competitorHasDpf = competitor.specs.emissionsSolution.toLowerCase().includes("dpf");
      if (caseHasNoDpf && competitorHasDpf) {
        insights.push({
          id: buildInsightId("insight-emissions", competitor.name, caseProduct.name),
          title: `Vantagem CASE: ${caseProduct.name} opera sem DPF vs. ${competitor.name}`,
          priority: "Low",
          description: `${caseProduct.name} usa ${caseProduct.specs.emissionsSolution}. ${competitor.name} requer ${competitor.specs.emissionsSolution}. Vantagem potencial de TCO e menos downtime por regeneração.`,
          action: `Comunicar a vantagem ${caseProduct.specs.emissionsSolution} com mais agressividade na família ${caseProduct.family}.`,
          affectedCaseProduct: caseProduct.name,
          competitorName: competitor.name,
          competitorBrand: competitor.brand,
          family: caseProduct.family,
          region: "Global",
          source: "Comparação de specs",
          date: todayIso(),
          type: "advantage",
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (competitor.specs.transmission && caseProduct.specs.transmission) {
      const competitorHasCvt = /cvt|evt|electric drive/i.test(competitor.specs.transmission);
      const caseHasPowershift = /powershift/i.test(caseProduct.specs.transmission);
      if (competitorHasCvt && caseHasPowershift) {
        insights.push({
          id: buildInsightId("insight-trans", competitor.name, caseProduct.name),
          title: `${competitor.name} oferece ${competitor.specs.transmission} vs. ${caseProduct.specs.transmission} da ${caseProduct.name}`,
          priority: "High",
          description: `${competitor.name} usa ${competitor.specs.transmission} e reforça argumento de eficiência. A ${caseProduct.name} ainda usa ${caseProduct.specs.transmission}.`,
          action: `Priorizar estudo de CVT/EVT para ${caseProduct.name} e comunicar roadmap de transmissão avançada.`,
          affectedCaseProduct: caseProduct.name,
          competitorName: competitor.name,
          competitorBrand: competitor.brand,
          family: caseProduct.family,
          region: normalizeRegion(competitor.regions[0] ?? "North America"),
          source: "Comparação de specs",
          date: todayIso(),
          type: "gap",
          createdAt: new Date().toISOString(),
        });
      }
    }

    (competitor.keyFeatures ?? [])
      .filter((feature) => /grade|payload|autodig|imc|smartgrade|people detection|semi-auto/i.test(feature))
      .forEach((feature) => {
        insights.push({
          id: buildInsightId("insight-feature", competitor.name, `${caseProduct.name}-${feature}`),
          title: `${competitor.name} oferece ${feature} — avaliar equivalente CASE`,
          priority: /standard|padrão/i.test(feature) ? "High" : "Medium",
          description: `${competitor.brand} disponibiliza "${feature}" no ${competitor.name}. Verificar se a ${caseProduct.name} possui funcionalidade equivalente ou se depende de solução externa.`,
          action: `Mapear gap da feature "${feature}" para a família ${caseProduct.family} e incluir no plano Next Gen.`,
          affectedCaseProduct: caseProduct.name,
          competitorName: competitor.name,
          competitorBrand: competitor.brand,
          family: caseProduct.family,
          region: "Global",
          source: `${competitor.brand} product features`,
          date: todayIso(),
          type: "gap",
          createdAt: new Date().toISOString(),
        });
      });

    if (competitor.specs.operatingWeight_lb && caseProduct.specs.operatingWeight_lb) {
      const weightDelta = Math.round(((competitor.specs.operatingWeight_lb - caseProduct.specs.operatingWeight_lb) / caseProduct.specs.operatingWeight_lb) * 100);
      if (Math.abs(weightDelta) > 15) {
        insights.push({
          id: buildInsightId("insight-weight", competitor.name, caseProduct.name),
          title: `Diferença significativa de peso: ${competitor.name} (${weightDelta > 0 ? "+" : ""}${weightDelta}%) vs. ${caseProduct.name}`,
          priority: "Medium",
          description: `${competitor.name} pesa ${competitor.specs.operatingWeight_lb.toLocaleString()} lb vs. ${caseProduct.specs.operatingWeight_lb.toLocaleString()} lb da ${caseProduct.name}. Isso pode alterar percepção de robustez ou ratio potência/peso.`,
          action: `Avaliar se a diferença de peso impacta posicionamento competitivo e proposta de valor da ${caseProduct.name}.`,
          affectedCaseProduct: caseProduct.name,
          competitorName: competitor.name,
          competitorBrand: competitor.brand,
          family: caseProduct.family,
          region: "Global",
          source: "Comparação de specs",
          date: todayIso(),
          type: "info",
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (/electric/i.test(competitor.name) || competitor.specs.emissionsSolution === "Zero Emissions") {
      const familyHasElectric = familyProducts.some((product) => product.electricVariant);
      if (!familyHasElectric) {
        insights.push({
          id: buildInsightId("insight-ev", competitor.name, caseProduct.name),
          title: `${competitor.name} é elétrico — CASE não tem equivalente na família ${caseProduct.family}`,
          priority: "High",
          description: `${competitor.brand} oferece ${competitor.name} com zero emissões na categoria ${competitor.type}. A família ${caseProduct.family} da CASE não possui variante elétrica equivalente.`,
          action: `Avaliar viabilidade de variante elétrica para a família ${caseProduct.family} com foco em Europa e contas municipais.`,
          affectedCaseProduct: caseProduct.name,
          competitorName: competitor.name,
          competitorBrand: competitor.brand,
          family: caseProduct.family,
          region: "Europe",
          source: "Comparação de portfólio",
          date: todayIso(),
          type: "gap",
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  return sortInsights(insights).slice(0, 12);
};