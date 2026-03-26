import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, BookOpen, LayoutDashboard, Database, Swords, Cpu, Map, Rocket, ClipboardList, Radar, Bot, ArrowRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GuideSection {
  id: string;
  icon: React.ElementType;
  title: string;
  route: string;
  subtitle: string;
  description: string;
  features: Array<{ name: string; detail: string }>;
  charts?: Array<{ name: string; type: string; description: string }>;
  tips: string[];
  examplePrompt?: string;
}

const sections: GuideSection[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    route: "/",
    subtitle: "Visão executiva consolidada",
    description: "Painel principal que unifica dados de portfólio, competitividade e sinais de mercado. É o ponto de partida para qualquer análise.",
    features: [
      { name: "KPIs superiores", detail: "Total de máquinas, score médio do portfólio, sinais urgentes e famílias cobertas. Leitura rápida de saúde." },
      { name: "Mapa global interativo", detail: "Pontos de presença CASE e pressão competitiva. Clique numa região para ver detalhes (máquinas, concorrentes, fit)." },
      { name: "Comparativo Regional A vs B", detail: "Selecione 2 regiões nos dropdowns para gerar radar comparativo com demanda, cobertura e gaps." },
      { name: "Sinais urgentes do Scanner", detail: "Top 3 sinais de alta prioridade. Clique para navegar ao Scanner com foco no sinal." },
      { name: "Vídeo scroll-scrub", detail: "Vídeo institucional sincronizado com o scroll da página." },
    ],
    charts: [
      { name: "Mapa Leaflet", type: "Mapa interativo", description: "Marcadores coloridos por região com popup de detalhes" },
      { name: "Radar Regional", type: "Radar sobreposto", description: "Compara 2 regiões em eixos de demanda e cobertura" },
    ],
    tips: [
      "Clique numa região no mapa para abrir o dialog com máquinas cobertas e concorrentes presentes",
      "Se sinais urgentes > 0, clique para investigar no Scanner",
      "Use o comparativo A vs B para preparar apresentações executivas",
    ],
    examplePrompt: "Quais são os 3 maiores riscos competitivos do portfólio CASE hoje?",
  },
  {
    id: "portfolio",
    icon: Database,
    title: "Portfolio Directory",
    route: "/portfolio",
    subtitle: "Catálogo completo de máquinas",
    description: "Diretório com 42+ máquinas CASE, filtros multi-dimensionais (família, região, potência, peso, EV), seleção para comparação e exportação CSV.",
    features: [
      { name: "Busca livre", detail: "Pesquise por modelo, motor, família ou região. Ex.: '821G', 'FPT', 'Electric'." },
      { name: "Filtros combinados", detail: "Família, região, categoria (Heavy/Light), faixa de potência (0-400hp), faixa de peso (0-120.000lb), somente EV." },
      { name: "Seleção para comparar", detail: "Marque 2-4 máquinas com checkbox → clique 'Comparar selecionados' → vai para Benchmarking." },
      { name: "Export CSV", detail: "Gera arquivo CSV com todos os dados filtrados para uso em planilhas." },
      { name: "Score geral", detail: "Badge colorido: 🟢 ≥85 (forte), 🟡 75-84 (aceitável), 🔴 <75 (gap)." },
      { name: "Navegação rápida", detail: "Clique na seta (→) ao lado de qualquer máquina para ir ao Engineering Subsystems." },
    ],
    tips: [
      "Para ver escavadeiras acima de 200hp na América do Norte: Família 'E-Series' + Região 'North America' + Potência 200-400",
      "Selecione 2 máquinas da mesma família para comparação direta no Benchmarking",
      "Use o filtro EV para mapear a penetração de plataformas elétricas",
    ],
    examplePrompt: "Liste todas as máquinas CASE com score abaixo de 80 e sugira prioridades de melhoria.",
  },
  {
    id: "benchmarking",
    icon: Swords,
    title: "Competitor Benchmarking",
    route: "/benchmarking",
    subtitle: "CASE vs concorrência em 3 camadas",
    description: "Comparação técnica organizada em 3 abas: Comparação direta, Trajetória Competitiva e Priorização de Portfólio.",
    features: [
      { name: "Aba Comparação", detail: "Radar CASE vs concorrente em 5 eixos (Powertrain, Ergonomics, Tech, Maintenance, Price/TCO) + tabela de specs lado a lado." },
      { name: "Aba Trajetória Competitiva", detail: "Timeline com milestones passados e projeções futuras por marca (Cat, Komatsu, Volvo, Deere, JCB)." },
      { name: "Aba Priorização de Portfólio", detail: "Matriz estratégica posicionando famílias por score vs pressão competitiva (Líderes, Apostas, Vacas Leiteiras, Questionáveis)." },
      { name: "Enviar para Roadmap", detail: "Na aba Trajetória, converta projeções de concorrentes em sugestões para o Next Gen Roadmap." },
    ],
    charts: [
      { name: "Radar comparativo", type: "Radar", description: "5 eixos sobrepostos CASE (azul) vs concorrente (vermelho)" },
      { name: "Timeline de milestones", type: "Linha temporal", description: "Eventos passados e movimentos previstos dos concorrentes" },
      { name: "Scatter de priorização", type: "Scatter plot", description: "Posição estratégica de cada família CASE" },
    ],
    tips: [
      "Para apresentar ao board: Aba Comparação → Selecione CX300E → Clique Komatsu PC300 → Use radar + tabela",
      "Na Trajetória, monitore movimentos de Cat e Komatsu em machine control e eletrificação",
      "Use 'Enviar para Roadmap' quando identificar um movimento competitivo que exige resposta",
    ],
    examplePrompt: "Compare a 821G com os 3 principais concorrentes e mostre onde estamos mais vulneráveis.",
  },
  {
    id: "subsystems",
    icon: Cpu,
    title: "Engineering Subsystems",
    route: "/subsystems",
    subtitle: "Drill-down por subsistema de engenharia",
    description: "Decomposição técnica de cada máquina em 6 subsistemas (Structure, Powertrain, Hydraulics, Transmission, Implements, Cabin) com dados reais vs concorrência.",
    features: [
      { name: "Seleção de máquina", detail: "Cards horizontais com todas as máquinas. Clique para selecionar. Score exibido abaixo do nome." },
      { name: "6 abas de subsistema", detail: "Structure (EST), Powertrain (PWR), Hydraulics (HID), Transmission (TRN), Implements (IMP), Cabin (CAB)." },
      { name: "Análise + Gap", detail: "Texto de análise do estado atual + box amarelo com o principal gap identificado." },
      { name: "Radar de engenharia", detail: "SVG comparando CASE vs concorrente em todos os 6 eixos simultaneamente." },
      { name: "Cards de concorrentes", detail: "Score por concorrente com delta (▲/▼) e descrição da posição competitiva." },
      { name: "Componentes detalhados", detail: "Expande árvore de subcomponentes com specs públicos, dados internos editáveis e oportunidades." },
      { name: "Analisar com IA", detail: "Envia o componente com specs, gaps e concorrência para análise pelo NexusChat." },
    ],
    charts: [
      { name: "Barra de score", type: "Progress bar", description: "Score do subsistema (0-100) com cor por faixa" },
      { name: "Radar hexagonal", type: "Radar SVG", description: "CASE (azul) vs concorrente selecionado (vermelho) em 6 eixos" },
    ],
    tips: [
      "Para analisar gap hidráulico: Selecione CX300E → aba Hydraulics → veja gap + score → 'Analisar com IA'",
      "Cada campo de dados internos pode ser editado — ideal para validar specs reais vs públicos",
      "A barra de progresso de componentes mostra quantos campos já foram validados",
    ],
    examplePrompt: "Analise o subsistema de hidráulica da CX300E e sugira 3 ações para MY2028.",
  },
  {
    id: "regional",
    icon: Map,
    title: "Regional Intelligence",
    route: "/regional-intelligence",
    subtitle: "Demanda e competitividade por região",
    description: "Perfil de 5 macro-regiões: North America, Europe, Latin America, Middle East & Africa, Asia Pacific. Cada uma com demanda, gaps e recomendações estratégicas.",
    features: [
      { name: "Perfil da região", detail: "Tamanho de mercado, revenue anual, presença CASE, top concorrentes regionais." },
      { name: "Prioridades de demanda", detail: "Lista ordenada de features exigidas (Machine Control, Telemática, Eletrificação etc.) com peso e tendência." },
      { name: "Relevância de gaps", detail: "Cada gap CASE classificado como CRÍTICO, ALTO, MÉDIO etc. com score numérico." },
      { name: "Máquinas cobertas", detail: "Quais produtos CASE atendem a região + score de fit regional (0-100)." },
      { name: "Recomendações estratégicas", detail: "3 ações priorizadas por região, contextualizadas ao mercado local." },
    ],
    tips: [
      "LATAM valoriza robustez e SCR-only, NÃO Machine Control 3D — a estratégia deve refletir isso",
      "Europa e NA puxam eletrificação e machine control — priorize investimento de roadmap nessas regiões",
      "Fit regional abaixo de 70 indica que o produto precisa de adaptação para a região",
    ],
    examplePrompt: "O que diferencia a estratégia CASE ideal para LATAM vs Europa?",
  },
  {
    id: "roadmap",
    icon: Rocket,
    title: "Next Gen Roadmap",
    route: "/next-gen-roadmap",
    subtitle: "Evolução tecnológica do portfólio",
    description: "Centro de planejamento para o Engenheiro de Portfólio. Conecta maturidade, gaps, investimento e timeline de tecnologia em 3 fases (MY2027-MY2029).",
    features: [
      { name: "Portfolio Maturity Scorecard", detail: "5 KPIs: Readiness (% modelos ≥85), Gap Coverage (% itens em ação), EV Penetration, Competitive Parity, Field→Roadmap." },
      { name: "Subsystem Gap Heatmap", detail: "Tabela interativa famílias × 6 subsistemas com scores e badges de roadmap. Clique navega para Subsystems." },
      { name: "Board de fases (Kanban)", detail: "3 colunas: Fase 1 (MY2027), Fase 2 (MY2028), Fase 3 (MY2029). Cards coloridos por prioridade e custo." },
      { name: "Sumário de investimento", detail: "Barras por fase + total geral em $M. Mostra distribuição do investimento." },
      { name: "Impacto projetado", detail: "Gráfico de linhas mostrando score CASE vs linha do concorrente ao longo das 3 fases." },
      { name: "Technology Timeline", detail: "Gantt horizontal por subsistema. Barras coloridas por prioridade. Seção de dependências cruzadas." },
      { name: "Controle de status", detail: "Dropdown por item: Proposto → Aprovado → Em Desenvolvimento → Implementado (ou Adiado/Rejeitado)." },
    ],
    charts: [
      { name: "Barras de investimento", type: "Barras", description: "Distribuição $M por fase" },
      { name: "Impacto projetado", type: "Linha", description: "Score CASE vs concorrente ao longo das fases" },
      { name: "Gantt por subsistema", type: "Gantt horizontal", description: "Itens agrupados por subsistema, coloridos por prioridade" },
      { name: "Heatmap", type: "Tabela colorida", description: "Score médio por cruzamento família × subsistema" },
    ],
    tips: [
      "Fase 1 (MY2027) foca em quick wins: pesagem padrão, display upgrade, undercarriage premium",
      "Grade Assist nativo (road-004) é o item de maior Δ Score (+13) — prioridade crítica",
      "Use o heatmap para identificar quais famílias estão mais fracas em quais subsistemas",
    ],
    examplePrompt: "Qual o retorno competitivo do Grade Assist nativo se implementado em 2028?",
  },
  {
    id: "field",
    icon: ClipboardList,
    title: "Field Intelligence",
    route: "/field-intelligence",
    subtitle: "Dados de campo (vendas, perdas, feedback)",
    description: "Captura e análise de relatórios de campo para fechar o loop engenharia ↔ vendas. Wins, losses e feedbacks alimentam automaticamente o roadmap.",
    features: [
      { name: "Formulário de relatório", detail: "Tipo (Win/Loss/Feedback), Produto CASE, Região, Concorrente, Motivo, Feature faltante/decisiva, Valor, Comentários." },
      { name: "KPIs automáticos", detail: "Win Rate, Losses, Top Loss Reason, Top Feature Request, Most Lost To — calculados em tempo real." },
      { name: "Gráfico de motivos de perda", detail: "Pie chart (rosca) com distribuição dos motivos das losses." },
      { name: "Features mais solicitadas", detail: "Barras horizontais com top 5 features agrupadas por tema (Machine Control, CVT, People Detection etc.)." },
      { name: "Perdas por concorrente", detail: "Barras mostrando quais marcas vencem mais a CASE." },
      { name: "Feed-forward automático", detail: "Quando um tema se repete 2+ vezes, gera sugestão automática no Next Gen Roadmap." },
    ],
    charts: [
      { name: "Motivos de perda", type: "Pie chart (rosca)", description: "Distribuição proporcional dos motivos" },
      { name: "Features solicitadas", type: "Barra horizontal", description: "Top 5 features mais mencionadas" },
      { name: "Perdas por concorrente", type: "Barra horizontal", description: "Padrão de quais marcas superam a CASE" },
    ],
    tips: [
      "Registre TODAS as losses, não só as importantes — o padrão emerge da frequência",
      "O campo 'Feature que faltou' alimenta diretamente as sugestões de roadmap",
      "Use 'Analisar com IA' para gerar relatório estratégico a partir dos padrões de campo",
    ],
    examplePrompt: "Com base nas losses recentes, qual feature deveria ser prioridade #1?",
  },
  {
    id: "scanner",
    icon: Radar,
    title: "Web Scanner",
    route: "/scanner",
    subtitle: "Inteligência competitiva automatizada",
    description: "Motor analítico que compara automaticamente produtos CASE vs concorrentes e gera sinais de gap ou vantagem com prioridade (High/Medium/Low).",
    features: [
      { name: "Autocomplete inteligente", detail: "Pesquise qualquer produto CASE ou concorrente. O sistema encontra e correlaciona automaticamente." },
      { name: "Gerar análise", detail: "Clique para cruzar specs e gerar insights. Se um produto está selecionado, foca nele; senão, analisa tudo." },
      { name: "Filtros combinados", detail: "Família CASE, Região e Prioridade (High/Medium/Low)." },
      { name: "Sinais priorizados", detail: "Cards com ícone por severidade (🔴 High, 🟡 Medium, 🟢 Low), descrição, ação e fonte." },
      { name: "Converter em Task", detail: "Transforma o sinal em task de engenharia e navega para Subsystems com o contexto correto." },
      { name: "Feed do Field Intelligence", detail: "Losses repetidas do campo aparecem como sinais automáticos com badge 'NOVO'." },
    ],
    tips: [
      "Selecione um concorrente específico antes de clicar 'Gerar análise' para resultados focados",
      "Sinais 'High' devem ser tratados como prioridade — use 'Converter em Task' imediatamente",
      "O Scanner se auto-alimenta: dados do Field Intelligence geram sinais automaticamente",
    ],
    examplePrompt: "Analise os sinais High do Scanner e priorize os 3 mais urgentes para ação imediata.",
  },
];

const flows = [
  { name: "Dashboard → Ação de Roadmap", steps: ["Dashboard", "Sinal urgente", "Scanner", "Converter em Task", "Subsystems", "Analisar com IA"], color: "hsl(var(--primary))" },
  { name: "Campo → Roadmap", steps: ["Field Intelligence", "Registrar Loss", "Feature faltante", "Sugestão auto-gerada", "Next Gen Roadmap"], color: "hsl(var(--chart-success))" },
  { name: "Regional → Portfólio", steps: ["Regional Intelligence", "Gap identificado", "Portfolio (filtro)", "Benchmarking", "Subsystems"], color: "hsl(267 83% 58%)" },
  { name: "Benchmarking → Roadmap", steps: ["Benchmarking", "Trajetória Competitiva", "Enviar para Roadmap", "Next Gen Roadmap", "Analisar com IA"], color: "hsl(var(--chart-warning))" },
  { name: "Análise completa de máquina", steps: ["Portfolio", "Selecionar máquina", "Subsystems (6 sub.)", "Gap mais crítico", "Scanner (foco)", "Roadmap"], color: "hsl(var(--destructive))" },
];

const metrics = [
  { name: "Score geral", desc: "Média dos 5 eixos de avaliação", range: "0-100" },
  { name: "Score de subsistema", desc: "Avaliação ponderada do subsistema", range: "0-100" },
  { name: "Delta (Δ)", desc: "Melhoria projetada após implementação", range: "+0 a +15" },
  { name: "Fit regional", desc: "Adequação da máquina à região", range: "0-100" },
  { name: "Win Rate", desc: "% de vendas ganhas sobre total de decisões", range: "0-100%" },
  { name: "Gap Coverage", desc: "% de itens critical/high em desenvolvimento", range: "0-100%" },
  { name: "Portfolio Readiness", desc: "% de modelos com score ≥85", range: "0-100%" },
  { name: "Competitive Parity", desc: "Delta médio CASE vs melhor concorrente", range: "± pontos" },
];

export default function PlatformGuide() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>("dashboard");
  const [activeTab, setActiveTab] = useState<"modules" | "flows" | "metrics" | "assistant">("modules");

  const toggleSection = (id: string) => {
    setExpandedSection((current) => current === id ? null : id);
  };

  return (
    <div className="space-y-6 p-6 section-enter">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Guia da Plataforma</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Como funciona cada módulo, gráfico e funcionalidade do CASE Nexus.</p>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "modules", label: "📂 Módulos", count: sections.length },
          { key: "flows", label: "🔄 Fluxos Integrados", count: flows.length },
          { key: "metrics", label: "📊 Métricas", count: metrics.length },
          { key: "assistant", label: "🤖 Assistente IA", count: null },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* MÓDULOS */}
      {activeTab === "modules" && (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const isExpanded = expandedSection === section.id;
            const Icon = section.icon;
            return (
              <article key={section.id} className="rounded-3xl border border-border bg-card shadow-[0_16px_40px_hsl(var(--foreground)/0.05)] transition-shadow hover:shadow-[0_20px_50px_hsl(var(--foreground)/0.08)]">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-4 rounded-3xl px-6 py-5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{index + 1}</span>
                      <h2 className="text-base font-bold text-foreground">{section.title}</h2>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{section.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(section.route); }}
                    className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    Abrir →
                  </button>
                  {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="space-y-5 border-t border-border px-6 py-5">
                    <p className="text-sm leading-7 text-foreground/80">{section.description}</p>

                    {/* Features */}
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Funcionalidades</h3>
                      <div className="mt-3 grid gap-2 xl:grid-cols-2">
                        {section.features.map((f) => (
                          <div key={f.name} className="rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
                            <p className="text-xs font-bold text-foreground">{f.name}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{f.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Charts */}
                    {section.charts && section.charts.length > 0 && (
                      <div>
                        <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gráficos e Visualizações</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {section.charts.map((c) => (
                            <div key={c.name} className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                              <p className="text-xs font-bold text-primary">{c.name}</p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{c.type} — {c.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    <div>
                      <h3 className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        <Lightbulb className="h-3 w-3" /> Dicas de uso
                      </h3>
                      <div className="mt-3 space-y-2">
                        {section.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-xl bg-chart-warning/5 border border-chart-warning/15 px-3 py-2.5">
                            <span className="mt-0.5 text-xs">💡</span>
                            <p className="text-xs leading-5 text-foreground/80">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Prompt example */}
                    {section.examplePrompt && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Exemplo de pergunta para a IA</p>
                        <p className="mt-2 text-sm font-medium text-primary">"{section.examplePrompt}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent("nexus-ai:prompt", {
                              detail: { prompt: section.examplePrompt, open: true },
                            }));
                          }}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <Bot className="h-3 w-3" /> Perguntar ao assistente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* FLUXOS INTEGRADOS */}
      {activeTab === "flows" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Os módulos se conectam por fluxos que guiam a análise do início à ação. Cada fluxo mostra um caminho típico de uso da plataforma.</p>
          {flows.map((flow) => (
            <article key={flow.name} className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
              <h3 className="text-base font-bold text-foreground">{flow.name}</h3>
              <div className="mt-4 flex flex-wrap items-center gap-1">
                {flow.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: flow.color }}
                    >
                      {step}
                    </span>
                    {i < flow.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MÉTRICAS */}
      {activeTab === "metrics" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Glossário das métricas usadas em toda a plataforma. Todas as escalas são numéricas e as cores seguem o padrão universal.</p>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
            <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Glossário de métricas</h3>
            <div className="mt-4 space-y-3">
              {metrics.map((m) => (
                <div key={m.name} className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{m.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{m.range}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
            <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Legenda de cores</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-chart-success/10 border border-chart-success/20 p-3">
                <p className="text-sm font-bold text-chart-success">🟢 Verde</p>
                <p className="mt-1 text-xs text-muted-foreground">Score ≥85, vantagem, sucesso</p>
              </div>
              <div className="rounded-xl bg-chart-warning/10 border border-chart-warning/20 p-3">
                <p className="text-sm font-bold text-chart-warning">🟡 Amarelo</p>
                <p className="mt-1 text-xs text-muted-foreground">Score 75-84, atenção</p>
              </div>
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm font-bold text-destructive">🔴 Vermelho</p>
                <p className="mt-1 text-xs text-muted-foreground">Score {"<"}75, gap crítico</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                <p className="text-sm font-bold text-primary">🔵 Azul</p>
                <p className="mt-1 text-xs text-muted-foreground">CASE, ação principal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSISTENTE IA */}
      {activeTab === "assistant" && (
        <div className="space-y-4">
          <article className="rounded-3xl border border-border bg-card p-6 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">NexusChat — Assistente IA</h2>
                <p className="text-sm text-muted-foreground">Disponível em qualquer página via ícone 💬 no canto inferior direito</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Como funciona</h3>
                <div className="mt-3 space-y-2 text-sm leading-7 text-foreground/80">
                  <p>1. Clique no ícone de chat (💬) no canto inferior direito</p>
                  <p>2. Digite sua pergunta ou use um dos prompts sugeridos</p>
                  <p>3. A IA recebe automaticamente o <strong>contexto da página atual</strong></p>
                  <p>4. Respostas são geradas com streaming em tempo real</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contexto automático por página</h3>
                <div className="mt-3 grid gap-2 xl:grid-cols-2">
                  {[
                    { page: "Dashboard", ctx: "KPIs, regiões, sinais urgentes" },
                    { page: "Portfolio", ctx: "Lista de máquinas filtradas, scores" },
                    { page: "Benchmarking", ctx: "Máquina selecionada, concorrentes" },
                    { page: "Subsystems", ctx: "Máquina + subsistema + gaps" },
                    { page: "Regional", ctx: "Perfil da região, demanda, gaps" },
                    { page: "Roadmap", ctx: "Itens de roadmap, investimento" },
                    { page: "Field", ctx: "Relatórios de campo, métricas" },
                    { page: "Scanner", ctx: "Sinais, concorrentes, insights" },
                  ].map((item) => (
                    <div key={item.page} className="rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
                      <span className="text-xs font-bold text-foreground">{item.page}:</span>
                      <span className="ml-1 text-xs text-muted-foreground">{item.ctx}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Botão "Analisar com IA"</h3>
                <p className="mt-2 text-sm leading-7 text-foreground/80">
                  Vários componentes da plataforma têm o botão <strong>"Analisar com IA"</strong> que preenche o chat automaticamente com um prompt contextualizado — ideal para análises profundas de componentes, itens de roadmap, padrões de campo ou sinais competitivos.
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Exemplos de perguntas</h3>
                <div className="mt-3 space-y-2">
                  {[
                    "Quais são os 3 maiores riscos competitivos do portfólio CASE hoje?",
                    "Analise o gap hidráulico da CX300E e sugira 3 ações para MY2028",
                    "Compare a 821G com os 3 principais concorrentes",
                    "Com base nas losses recentes, qual feature deveria ser prioridade #1?",
                    "O que diferencia a estratégia CASE ideal para LATAM vs Europa?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent("nexus-ai:prompt", { detail: { prompt, open: true } }))}
                      className="flex w-full items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10"
                    >
                      <Bot className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-foreground">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
