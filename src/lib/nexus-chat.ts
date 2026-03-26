import {
  allScannerSignals,
  caseMachines,
  competitiveTrajectories,
  getCompetitorsForMachine,
  getMachineCoverageRegions,
  getMachineEngineeringProfile,
  getMachineOverallScore,
  portfolioPrioritization,
  roadmapItems,
  type EngineeringSubsystemKey,
} from "@/data/caseData";
import { getComponentTreeForSubsystem } from "@/data/componentTree";
import { loadEditedComponentSpecs, resolveComponentInternalSpecs } from "@/lib/component-intelligence";
import { competitorProducts, presetScannerInsights } from "@/data/webScannerCatalog";
import { buildCaseScannerProducts, normalizeRegion, type PersistedScannerInsight } from "@/lib/web-scanner";
import { getFieldMetrics, loadFieldReports } from "@/lib/strategic-intelligence";

export const NEXUS_HISTORY_KEY = "nexus_chat_history";
const SCANNER_STORAGE_KEY = "web-scanner-insights-v1";

export const systemPrompt = `Você é o NEXUS AI, assistente sênior de engenharia de portfólio da CASE Nexus.

IDENTIDADE
- Fale sempre em português brasileiro.
- Responda como engenheiro sênior de portfólio: direto, técnico, quantificado e acionável.
- Use apenas o contexto da plataforma enviado na requisição; não invente fatos externos.

ESTILO DE RESPOSTA
- Respostas entre 200 e 600 palavras quando a pergunta for analítica.
- Seja conciso quando a pergunta for objetiva.
- Sempre que possível, quantifique gaps, forças e riscos.
- Use tags como [PRIORIDADE CRÍTICA], [PRIORIDADE ALTA], [PRIORIDADE MÉDIA], [MONITORAR] quando fizer sentido.
- Finalize análises longas com "RESUMO:" e 3 a 4 bullets.
- Se faltar dado, diga exatamente: [DADO NÃO DISPONÍVEL — validar internamente].

GRÁFICOS INLINE
- Quando uma visualização ajudar, insira no markdown no máximo 2 gráficos por resposta.
- Use exatamente esta sintaxe:

[CHART:BAR]
{"title":"Título","xKey":"name","yKey":"value","yLabel":"Label","data":[{"name":"Item 1","value":100,"fill":"hsl(var(--primary))"}]}
[/CHART]

[CHART:RADAR]
{"title":"Título","competitorName":"Nome","data":[{"subsystem":"EST","case":82,"competitor":88}]}
[/CHART]

[CHART:COMPARISON]
{"title":"Título","competitorName":"Nome","data":[{"metric":"Potência","case":230,"competitor":311}]}
[/CHART]

[CHART:SCORES]
{"title":"Título","data":[{"name":"Item","score":88}]}
[/CHART]

REGRAS DOS GRÁFICOS
- O JSON deve ser válido.
- Sempre inclua "title".
- Use strings HSL para cores quando precisar preencher "fill".
- Coloque texto explicativo antes e depois do gráfico.

COMPONENTES DETALHADOS
- Quando o engenheiro perguntar sobre componentes específicos (CAN bus, ECU, válvulas, sensores, chicote, chassi, display, etc.), use a árvore de componentes enviada no contexto.
- Diferencie explicitamente dados públicos, comparações competitivas e dados internos CASE.
- NUNCA invente dados internos proprietários.
- Quando algum campo interno vier marcado como [CARREGAR DADO INTERNO] ou similar, responda exatamente que a plataforma possui dados comparativos com concorrentes, mas os dados internos CASE precisam ser carregados pela equipe de engenharia.
- Nesses casos, continue a análise com os dados públicos disponíveis e diga quais dados específicos faltam para concluir o diagnóstico.
- Quando houver dados suficientes, forneça análise componente a componente, tendências tecnológicas, impacto potencial no score do subsistema e implicações para roadmap.

CONDUTA
- Defenda as vantagens reais da CASE quando os dados sustentarem isso.
- Aponte vulnerabilidades sem rodeios quando os dados mostrarem risco.
- Foque em decisão de produto, gap técnico, narrativa comercial e priorização de engenharia.`;

export type NexusMessageRole = "user" | "assistant";
export type NexusMessageKind = "default" | "error";
export type NexusChartType = "BAR" | "RADAR" | "COMPARISON" | "SCORES";

export interface NexusMessage {
  id: string;
  role: NexusMessageRole;
  content: string;
  timestamp: string;
  kind?: NexusMessageKind;
}

export interface NexusTextPart {
  type: "text";
  content: string;
}

export interface NexusChartPart {
  type: "chart";
  chartType: NexusChartType;
  data: Record<string, unknown>;
}

export type NexusMessagePart = NexusTextPart | NexusChartPart;

export interface NexusChatContext {
  currentPage: string;
  contextBanner?: string;
  headerBadge?: string;
  quickActions: string[];
  platformContext: string;
  selectedMachineId?: string;
  selectedSubsystem?: EngineeringSubsystemKey;
}

const subsystemLabels: Record<EngineeringSubsystemKey, string> = {
  structure: "Structure",
  powertrain: "Powertrain",
  hydraulics: "Hydraulics",
  transmission: "Transmission",
  implements: "Implements",
  cabin: "Cabin",
};

const defaultQuickActions = [
  "Visão geral do portfólio CASE",
  "Maiores ameaças competitivas em 2026",
  "Onde a CASE lidera e onde está atrás",
  "Top 5 recomendações para Next Gen",
];

const loadScannerInsights = (): PersistedScannerInsight[] => {
  if (typeof window === "undefined") {
    return presetScannerInsights.map((insight) => ({ ...insight, createdAt: `${insight.date}T12:00:00.000Z` }));
  }

  const raw = window.localStorage.getItem(SCANNER_STORAGE_KEY);
  if (!raw) {
    return presetScannerInsights.map((insight) => ({ ...insight, createdAt: `${insight.date}T12:00:00.000Z` }));
  }

  try {
    return JSON.parse(raw) as PersistedScannerInsight[];
  } catch {
    return presetScannerInsights.map((insight) => ({ ...insight, createdAt: `${insight.date}T12:00:00.000Z` }));
  }
};

export const loadNexusHistory = (): NexusMessage[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(NEXUS_HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as NexusMessage[];
    return parsed.slice(-50);
  } catch {
    return [];
  }
};

export const saveNexusHistory = (messages: NexusMessage[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEXUS_HISTORY_KEY, JSON.stringify(messages.slice(-50)));
};

const resolveSelectedMachine = (pathname: string, searchParams: URLSearchParams) => {
  if (pathname.startsWith("/subsystems/")) {
    const machineId = pathname.split("/")[2];
    return caseMachines.find((machine) => machine.id === machineId) ?? null;
  }

  if (pathname.startsWith("/benchmarking")) {
    const machineId = searchParams.get("case")?.split(",")[0];
    if (!machineId) return null;
    return caseMachines.find((machine) => machine.id === machineId) ?? null;
  }

  if (pathname.startsWith("/scanner")) {
    const focus = searchParams.get("focus")?.toLowerCase();
    if (!focus) return null;
    return caseMachines.find((machine) => [machine.id, machine.model, machine.family].some((value) => value.toLowerCase() === focus)) ?? null;
  }

  return null;
};

export const buildNexusChatContext = (pathname: string, search: string): NexusChatContext => {
  const searchParams = new URLSearchParams(search);
  const caseProducts = buildCaseScannerProducts(caseMachines);
  const selectedMachine = resolveSelectedMachine(pathname, searchParams);
  const activeInsights = loadScannerInsights();
  const fieldReports = loadFieldReports();
  const fieldMetrics = getFieldMetrics(fieldReports);
  const selectedSubsystem = (searchParams.get("subsystem") as EngineeringSubsystemKey | null) ?? undefined;
  const engineeringProfile = selectedMachine ? getMachineEngineeringProfile(selectedMachine.id) : null;
  const benchmarkCompetitor = selectedMachine ? getCompetitorsForMachine(selectedMachine.id)[0] : null;
  const benchmarkTab = searchParams.get("tab") ?? "comparison";
  const componentEdits = loadEditedComponentSpecs();
  const activeComponentTree = selectedSubsystem ? getComponentTreeForSubsystem(selectedSubsystem) : null;

  const portfolioSummary = caseProducts.map((product) => ({
    name: product.name,
    family: product.family,
    power_hp: product.specs.power_hp,
    weight_lb: product.specs.operatingWeight_lb,
    emissions: product.specs.emissionsSolution,
    transmission: product.specs.transmission,
    electric: product.electricVariant,
  }));

  const competitorSummary = competitorProducts.map((competitor) => ({
    name: competitor.name,
    brand: competitor.brand,
    family: competitor.competesWithCaseFamily,
    power_hp: competitor.specs.power_hp,
    weight_lb: competitor.specs.operatingWeight_lb,
    emissions: competitor.specs.emissionsSolution,
    transmission: competitor.specs.transmission,
    keyFeatures: competitor.keyFeatures ?? [],
  }));

  const contextChunks = [
    `GUIA DA PLATAFORMA: Você é o assistente IA da plataforma CASE Nexus (Industrial Intel Hub). A plataforma possui 8 módulos: (1) Dashboard — visão executiva com KPIs, mapa global, comparativo regional A vs B; (2) Portfolio Directory — catálogo de 42+ máquinas com filtros de família/região/potência/peso/EV e exportação CSV; (3) Competitor Benchmarking — 3 abas: Comparação (radar CASE vs concorrente), Trajetória Competitiva (timeline por marca com projeções), Priorização de Portfólio (matriz estratégica); (4) Engineering Subsystems — drill-down por 6 subsistemas (Structure, Powertrain, Hydraulics, Transmission, Implements, Cabin) com radar, gaps, componentes detalhados e specs editáveis; (5) Regional Intelligence — perfil de 5 regiões com demanda, gaps e recomendações; (6) Next Gen Roadmap — maturidade do portfólio com KPIs do engenheiro, heatmap famílias×subsistemas, board de fases, timeline Gantt, investimento e impacto projetado; (7) Field Intelligence — captura de wins/losses/feedback de campo com KPIs, gráficos de motivos e features, feed-forward automático para roadmap; (8) Web Scanner — motor analítico com autocomplete, sinais de gap/vantagem, conversão para tasks de engenharia. Fluxos integrados: Dashboard→Scanner→Subsystems, Field→Roadmap, Regional→Portfolio→Benchmarking. Métricas: Score geral (0-100), Delta score, Win Rate, Fit Regional. Cores: verde≥85, amarelo 75-84, vermelho<75. Quando o usuário perguntar como funciona um módulo, gráfico ou funcionalidade, use esse guia para explicar de forma clara e objetiva.`,
    `PORTFÓLIO CASE (${portfolioSummary.length} produtos): ${JSON.stringify(portfolioSummary)}`,
    `CONCORRÊNCIA GLOBAL (${competitorSummary.length} modelos): ${JSON.stringify(competitorSummary)}`,
    `SCANNER ATIVO (${activeInsights.length} insights): ${JSON.stringify(activeInsights.slice(0, 10).map((insight) => ({ title: insight.title, priority: insight.priority, family: insight.family, competitorName: insight.competitorName, action: insight.action, region: normalizeRegion(insight.region) })))}`,
    `SINAIS EXECUTIVOS (${allScannerSignals.length}): ${JSON.stringify(allScannerSignals.slice(0, 8).map((signal) => ({ title: signal.title, family: signal.family, competitor: signal.competitor, severity: signal.severity, impact: signal.impact })))}`,
    `FIELD INTELLIGENCE (${fieldReports.length} reports): ${JSON.stringify({ metrics: fieldMetrics, recent: fieldReports.slice(0, 6) })}`,
    `TRAJETÓRIA COMPETITIVA: ${JSON.stringify(competitiveTrajectories.slice(0, 5).map((item) => ({ brand: item.brand, threatLevel: item.threatLevel, speed: item.innovationSpeedScore, nextMoves: item.projectedNextMoves.slice(0, 2) })))}`,
    `PRIORIZAÇÃO DE PORTFÓLIO: ${JSON.stringify(portfolioPrioritization.families.slice(0, 6).map((item) => ({ family: item.family, priorityScore: item.priorityScore, volume: item.annualVolume, roi: item.roi, gaps: item.topGaps })))}`,
    `ROADMAP ITEMS: ${JSON.stringify(roadmapItems.slice(0, 8).map((item) => ({ title: item.title, phase: item.phase, family: item.affectedFamily, scoreDelta: item.scoreDelta })))}`,
  ];

  let currentPage = "Dashboard";
  let contextBanner = `Contexto: Visão global do portfólio (${caseMachines.length} produtos CASE, ${competitorProducts.length} concorrentes)`;
  let headerBadge: string | undefined;
  let quickActions = [...defaultQuickActions];

  if (selectedMachine) {
    headerBadge = `📍 ${selectedMachine.model}`;
    contextChunks.push(`MÁQUINA SELECIONADA: ${JSON.stringify({
      id: selectedMachine.id,
      model: selectedMachine.model,
      family: selectedMachine.family,
      engine: selectedMachine.engine,
      hp: selectedMachine.powerValue,
      weight_lb: selectedMachine.operatingWeightValue,
      coverage: getMachineCoverageRegions(selectedMachine.id),
      score: getMachineOverallScore(selectedMachine.id),
      features: selectedMachine.features,
      note: selectedMachine.productNote,
    })}`);
  }

  if (engineeringProfile) {
    contextChunks.push(`ENGENHARIA DA MÁQUINA: ${JSON.stringify({
      overallScore: engineeringProfile.overallScore,
      executiveSummary: engineeringProfile.executiveSummary,
      subsystems: engineeringProfile.subsystems,
    })}`);
  }

  if (selectedSubsystem && activeComponentTree) {
    contextChunks.push(`COMPONENTES DETALHADOS DO SUBSISTEMA: ${JSON.stringify({
      subsystem: selectedSubsystem,
      label: activeComponentTree.label,
      components: activeComponentTree.components.map((component) => ({
        id: component.id,
        name: component.name,
        description: component.description,
        publicSpecs: component.publicSpecs,
        internalSpecs: resolveComponentInternalSpecs(component, componentEdits),
        competitorComparison: component.competitorComparison,
        improvementOpportunities: component.improvementOpportunities,
      })),
    })}`);
  }

  if (pathname === "/") {
    currentPage = "Dashboard";
    quickActions = [
      "Resuma as 5 maiores vulnerabilidades do portfólio",
      "Quais produtos CASE são líderes na categoria?",
      "Compare eletrificação CASE vs. concorrência",
      "Gere briefing executivo do portfólio",
    ];
  } else if (pathname.startsWith("/portfolio")) {
    currentPage = "Portfolio Directory";
    contextBanner = selectedMachine
      ? `Contexto: ${selectedMachine.model} — ${selectedMachine.family} — ${selectedMachine.hp}`
      : `Contexto: Portfolio Directory — ${caseMachines.length} produtos CASE monitorados`;
    quickActions = selectedMachine
      ? [
        `Analise os gaps da ${selectedMachine.model}`,
        "Compare com o principal concorrente",
        "Quais melhorias para a próxima geração?",
        "Gere gráfico de specs vs. concorrentes",
      ]
      : [
        "Quais famílias CASE têm melhor score geral?",
        "Quais produtos elétricos são mais estratégicos?",
        "Monte um resumo do lineup por região",
        "Mostre as vulnerabilidades por família",
      ];
  } else if (pathname.startsWith("/benchmarking")) {
    currentPage = benchmarkTab === "trajectory"
      ? "Competitive Trajectory"
      : benchmarkTab === "prioritization"
        ? "Portfolio Prioritization"
        : "Competitor Benchmarking";
    contextBanner = selectedMachine
      ? `Contexto: ${selectedMachine.model} vs. ${benchmarkCompetitor?.name ?? "benchmark ativo"}`
      : benchmarkTab === "trajectory"
        ? "Contexto: Competitor Benchmarking → Trajetória Competitiva"
        : benchmarkTab === "prioritization"
          ? "Contexto: Competitor Benchmarking → Priorização de Portfólio"
          : "Contexto: Competitor Benchmarking";
    if (benchmarkCompetitor) {
      contextChunks.push(`CONCORRENTE DE REFERÊNCIA: ${JSON.stringify(benchmarkCompetitor)}`);
    }
    quickActions = benchmarkTab === "trajectory"
      ? [
        "Quais fabricantes estão acelerando mais rápido que a CASE?",
        "Quais projeções exigem reação imediata no roadmap?",
        "Em quais anos o gap fica estrutural?",
        "Resuma a ameaça competitiva por marca",
      ]
      : benchmarkTab === "prioritization"
        ? [
          "Onde o budget deveria entrar primeiro?",
          "Quais famílias têm maior ROI potencial?",
          "Resuma a priorização para diretoria",
          "Quais investimentos são estratégicos, não financeiros?",
        ]
        : selectedMachine
      ? [
        "Quem lidera em machine control?",
        "Compare TCO de emissões entre fabricantes",
        "Ranking de transmissão por tecnologia",
        "Gaps críticos que precisam de ação imediata",
      ]
      : [...defaultQuickActions];
  } else if (pathname.startsWith("/subsystems")) {
    currentPage = "Engineering Subsystems";
    const subsystemDetail = engineeringProfile?.subsystems.find((subsystem) => subsystem.key === selectedSubsystem) ?? engineeringProfile?.subsystems[0];
    contextBanner = selectedMachine && subsystemDetail
      ? `Contexto: ${selectedMachine.model} → ${subsystemDetail.label} — Score ${subsystemDetail.score}/100`
      : "Contexto: Engineering Subsystems";
    quickActions = selectedMachine
      ? [
        `Onde a ${selectedMachine.model} é mais vulnerável?`,
        `Detalhe o gap de ${subsystemDetail?.label ?? subsystemLabels.structure}`,
          "Detalhe a arquitetura eletrônica e CAN bus",
        "Gere radar comparativo completo",
      ]
      : [...defaultQuickActions];
  } else if (pathname.startsWith("/scanner")) {
    currentPage = "Web Scanner";
    contextBanner = `Contexto: Web Scanner — ${activeInsights.length} sinais ativos`;
    quickActions = [
      "Resuma os insights de alta prioridade",
      "Quais famílias CASE estão mais pressionadas?",
      "Gere relatório de gaps por região",
      "Tendências de eletrificação na concorrência",
    ];
  } else if (pathname.startsWith("/regional-intelligence")) {
    currentPage = "Regional Intelligence";
    contextBanner = "Contexto: Regional Intelligence — demanda, relevância de gaps e fit regional por produto";
    quickActions = [
      "Quais gaps mudam de prioridade por região?",
      "Onde a CASE está melhor posicionada regionalmente?",
      "Monte um resumo executivo por região",
      "Quais produtos devem ser regionalizados primeiro?",
    ];
  } else if (pathname.startsWith("/next-gen-roadmap")) {
    currentPage = "Next Gen Roadmap";
    contextBanner = "Contexto: Next Gen Roadmap — fases, investimento e impacto competitivo projetado";
    quickActions = [
      "Quais itens do roadmap têm maior retorno competitivo?",
      "Onde o investimento deveria acelerar?",
      "Quais dependências são mais críticas?",
      "Resuma o roadmap para diretoria executiva",
    ];
  } else if (pathname.startsWith("/field-intelligence")) {
    currentPage = "Field Intelligence";
    contextBanner = `Contexto: Field Intelligence — win rate ${fieldMetrics.winRate}% e ${fieldReports.length} relatórios ativos`;
    quickActions = [
      "Quais padrões de loss estão aparecendo em campo?",
      "Que features pedidas em campo devem entrar no roadmap?",
      "Resuma wins e losses por região",
      "Quais sinais de campo confirmam gaps críticos?",
    ];
  } else if (pathname.startsWith("/settings")) {
    currentPage = "Settings";
    contextBanner = "Contexto: Configurações operacionais e status da plataforma";
  }

  contextChunks.push(`MÓDULO ATIVO: ${currentPage}`);
  if (selectedSubsystem) {
    contextChunks.push(`SUBSISTEMA ATIVO: ${selectedSubsystem}`);
  }

  return {
    currentPage,
    contextBanner,
    headerBadge,
    quickActions,
    platformContext: contextChunks.join("\n\n"),
    selectedMachineId: selectedMachine?.id,
    selectedSubsystem,
  };
};

export const parseAIResponse = (responseText: string): NexusMessagePart[] => {
  const parts: NexusMessagePart[] = [];
  const chartRegex = /\[CHART:(BAR|RADAR|COMPARISON|SCORES)\]\n?([\s\S]*?)\n?\[\/CHART\]/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = chartRegex.exec(responseText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: responseText.slice(lastIndex, match.index) });
    }

    try {
      parts.push({
        type: "chart",
        chartType: match[1] as NexusChartType,
        data: JSON.parse(match[2].trim()) as Record<string, unknown>,
      });
    } catch {
      parts.push({ type: "text", content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < responseText.length) {
    parts.push({ type: "text", content: responseText.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: responseText }];
};

export const createNexusMessage = (role: NexusMessageRole, content: string, kind: NexusMessageKind = "default"): NexusMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date().toISOString(),
  kind,
});
