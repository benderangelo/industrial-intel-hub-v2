export interface TechnicalSpecItem {
  label: string;
  value: string;
}

export interface TechnicalTab {
  id: string;
  label: string;
  specs: TechnicalSpecItem[];
  highlights?: string[];
  notes?: string[];
}

interface MachineSubsystems {
  powertrain: Record<string, string>;
  hydraulics: Record<string, string>;
  structure: Record<string, string>;
  cab: Record<string, string>;
  tech: Record<string, string>;
}

export interface CASEMachine {
  id: string;
  model: string;
  category: "Heavy" | "Light";
  family: string;
  lifecycleStatus?: "Active Production" | "End of Life" | "Planned/Announced";
  segment?: string;
  powertrainType?: "Diesel" | "Electric" | "Hybrid";
  electrified?: boolean;
  benchmarkReferenceId?: string;
  executiveSummary?: string;
  scannerKeywords?: string[];
  hp: string;
  powerValue?: number;
  weightClass: string;
  operatingWeightValue?: number;
  engine: string;
  transmission: string;
  image?: string;
  imageAlt: string;
  features: string[];
  productNote: string;
  technicalSummary: TechnicalSpecItem[];
  technicalTabs: TechnicalTab[];
  subsystems: MachineSubsystems;
}

export interface MachineMarketPresencePoint {
  id: string;
  machineId: string;
  region: string;
  type: "dominance" | "commercial";
  location: string;
  coordinates: [number, number];
  note: string;
}

export interface BenchmarkScore {
  powertrain: number;
  ergonomics: number;
  tech: number;
  maintenance: number;
  priceTCO: number;
}

export type EngineeringSubsystemKey = "structure" | "powertrain" | "hydraulics" | "transmission" | "implements" | "cabin";

export interface ScoringMethodologyMetric {
  name: string;
  weight: number;
  formula: string;
}

export interface ScoringMethodologySection {
  subsystem: EngineeringSubsystemKey;
  label: string;
  metrics: ScoringMethodologyMetric[];
}

export interface EngineeringSubsystemCompetitor {
  name: string;
  score: number;
  analysis: string;
}

export interface EngineeringSubsystemDetail {
  key: EngineeringSubsystemKey;
  label: string;
  score: number;
  analysis: string;
  gap: string;
  recommendation: string;
  competitors: EngineeringSubsystemCompetitor[];
}

export interface EngineeringMachineProfile {
  machineId: string;
  machineName: string;
  overallScore: number;
  executiveSummary: string;
  subsystems: EngineeringSubsystemDetail[];
}

export interface RegionalDemandPriority {
  priority: string;
  weight: number;
  trend: "up" | "stable" | "down";
  description: string;
}

export interface RegionalGapRelevance {
  relevance: string;
  score: number;
  note: string;
}

export interface RegionalProfile {
  id: string;
  name: string;
  flag: string;
  colorToken: string;
  marketSize: string;
  annualRevenue: string;
  casePresence: string;
  topCompetitors: string[];
  demandPriorities: RegionalDemandPriority[];
  gapRelevance: Record<string, RegionalGapRelevance>;
}

export type RoadmapCategory = "Feature Parity" | "Technology Leap" | "Performance Upgrade" | "Safety/Regulatory" | "Leadership Protection" | "TCO Improvement";
export type RoadmapPriority = "critical" | "high" | "medium" | "low";
export type RoadmapCost = "low" | "medium" | "high" | "very_high";
export type RoadmapStatus = "proposed" | "approved" | "in_development" | "completed" | "deferred" | "rejected";
export type RoadmapRiskLevel = "low" | "medium" | "high";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  affectedFamily: string;
  affectedModels: string[];
  subsystem: EngineeringSubsystemKey;
  category: RoadmapCategory;
  priority: RoadmapPriority;
  estimatedCost: RoadmapCost;
  estimatedCostRange: string;
  developmentTime: string;
  targetModelYear: string;
  phase: 1 | 2 | 3;
  currentScore: number;
  projectedScoreAfter: number;
  scoreDelta: number;
  competitorsAddressed: string[];
  marketImpact: string;
  regions: string[];
  status: RoadmapStatus;
  dependencies: string[];
  riskLevel: RoadmapRiskLevel;
}

export interface ScannerSignal {
  id: string;
  machineId?: string;
  caseRival?: string;
  family: string;
  region: string;
  competitor: string;
  date: string;
  source: string;
  title: string;
  suggestion: string;
  impact: string;
  severity: "high" | "medium" | "low";
}

export interface EngineeringSignal {
  id: string;
  machineId?: string;
  caseRival?: string;
  family: string;
  title: string;
  gap: string;
  recommendation: string;
  impact: "critical" | "high" | "medium";
}

export interface CompetitorPresencePoint {
  id: string;
  region: string;
  competitor: string;
  caseRival: string;
  location: string;
  coordinates: [number, number];
  note: string;
  pressure: "high" | "medium" | "emerging";
}

interface TechnicalProfileInput {
  productNote: string;
  summary: TechnicalSpecItem[];
  overview: {
    specs: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  powertrain?: {
    extraSpecs?: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  hydraulics?: {
    extraSpecs?: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  structure?: {
    extraSpecs?: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  cab?: {
    extraSpecs?: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  tech?: {
    extraSpecs?: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  applications: {
    specs: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
  service: {
    specs: TechnicalSpecItem[];
    highlights?: string[];
    notes?: string[];
  };
}

const formatLabel = (label: string) => label.replace(/_/g, " ");

const specsFromRecord = (record: Record<string, string>): TechnicalSpecItem[] =>
  Object.entries(record).map(([label, value]) => ({ label: formatLabel(label), value }));

const createTechnicalTabs = (subsystems: MachineSubsystems, profile: TechnicalProfileInput): TechnicalTab[] => [
  {
    id: "overview",
    label: "Visão Geral",
    specs: profile.overview.specs,
    highlights: profile.overview.highlights,
    notes: profile.overview.notes,
  },
  {
    id: "powertrain",
    label: "Powertrain",
    specs: [...specsFromRecord(subsystems.powertrain), ...(profile.powertrain?.extraSpecs ?? [])],
    highlights: profile.powertrain?.highlights,
    notes: profile.powertrain?.notes,
  },
  {
    id: "hydraulics",
    label: "Hidráulica",
    specs: [...specsFromRecord(subsystems.hydraulics), ...(profile.hydraulics?.extraSpecs ?? [])],
    highlights: profile.hydraulics?.highlights,
    notes: profile.hydraulics?.notes,
  },
  {
    id: "structure",
    label: "Estrutura e Dimensões",
    specs: [...specsFromRecord(subsystems.structure), ...(profile.structure?.extraSpecs ?? [])],
    highlights: profile.structure?.highlights,
    notes: profile.structure?.notes,
  },
  {
    id: "cab",
    label: "Cabine e Ergonomia",
    specs: [...specsFromRecord(subsystems.cab), ...(profile.cab?.extraSpecs ?? [])],
    highlights: profile.cab?.highlights,
    notes: profile.cab?.notes,
  },
  {
    id: "tech",
    label: "Tecnologia e Telemática",
    specs: [...specsFromRecord(subsystems.tech), ...(profile.tech?.extraSpecs ?? [])],
    highlights: profile.tech?.highlights,
    notes: profile.tech?.notes,
  },
  {
    id: "applications",
    label: "Aplicações e Implementos",
    specs: profile.applications.specs,
    highlights: profile.applications.highlights,
    notes: profile.applications.notes,
  },
  {
    id: "service",
    label: "Serviço e Manutenção",
    specs: profile.service.specs,
    highlights: profile.service.highlights,
    notes: profile.service.notes,
  },
];

const createCaseMachine = (
  machine: Omit<CASEMachine, "productNote" | "technicalSummary" | "technicalTabs"> & { technicalProfile: TechnicalProfileInput },
): CASEMachine => {
  const { technicalProfile, ...base } = machine;

  return {
    ...base,
    productNote: technicalProfile.productNote,
    technicalSummary: technicalProfile.summary,
    technicalTabs: createTechnicalTabs(base.subsystems, technicalProfile),
  };
};

const baseCaseMachines: CASEMachine[] = [
  createCaseMachine({
    id: "gr935",
    model: "CASE GR935",
    category: "Heavy",
    family: "Motoniveladoras",
    hp: "325 HP",
    powerValue: 325,
    weightClass: "44.000 lbs",
    operatingWeightValue: 44000,
    engine: "Cummins QSL8.9",
    transmission: "CVT",
    image: "/equipment/case/gr935-upload.png",
    imageAlt: "Foto real da motoniveladora CASE GR935",
    features: ["CVT", "Steering de alta precisão", "Machine Control ready"],
    subsystems: {
      powertrain: { Motor: "Cummins QSL8.9 turbo diesel", Potência: "325 HP", Emissões: "Tier 4 Final / Stage V", Transmissão: "CVT", Tração: "6x4 ou 6x6 opcional" },
      hydraulics: { Sistema: "Load-sensing", Fluxo: "63 GPM", Pressão: "3.625 PSI", Válvulas: "Eletro-hidráulicas proporcionais", Comando: "Circle drive com resposta contínua" },
      structure: { Chassi: "Heavy-duty articulado", Peso: "44.000 lbs", Lâmina: "14 ft", Raio_de_giro: "24,5 ft", Articulação: "20° por lado" },
      cab: { Controles: "Joysticks multifunção", Visibilidade: "Câmera 360° opcional", HVAC: "Climatização automática", Assento: "Suspensão a ar", Certificação: "ROPS/FOPS" },
      tech: { Machine_Control: "2D/3D ready", Telemática: "SiteConnect", Segurança: "Diagnóstico remoto", Automação: "Assistência de articulação", Integração: "Leica / Topcon compatível" },
    },
    technicalProfile: {
      productNote: "Motoniveladora pesada voltada para terraplenagem fina, manutenção de vias e integração gradual com machine control.",
      summary: [
        { label: "Potência", value: "325 HP" },
        { label: "Peso operacional", value: "44.000 lbs" },
        { label: "Lâmina", value: "14 ft" },
        { label: "Transmissão", value: "CVT" },
      ],
      overview: {
        specs: [
          { label: "Plataforma", value: "Motoniveladora CASE de alta potência" },
          { label: "Foco de aplicação", value: "Road building, manutenção de vias, acabamento e corte fino" },
          { label: "Posicionamento", value: "Configuração premium com ênfase em precisão e produtividade" },
          { label: "Fonte principal", value: "Dados do modelo atual + recursos 2026 da linha D Series" },
        ],
        highlights: [
          "Moldboard single-radius em aço high-carbon para corte consistente.",
          "Front articulation exclusiva da classe para versatilidade de manobra.",
          "Pacote pronto para SiteSolutions e integração com Leica/Hemisphere.",
        ],
        notes: [
          "O PDF 2026 traz os recursos de arquitetura da linha D Series; esta ficha aplica esses aprendizados ao GR935 atual do portfólio.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Trocas", value: "Jerk-free shifting para suavidade com carga" },
          { label: "Controle", value: "Bump shifting manual ou automático" },
          { label: "Conversor", value: "Previne stall sob carga pesada" },
        ],
        highlights: [
          "Arquitetura focada em tração constante e resposta progressiva de deslocamento.",
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "Moldboard", value: "Single-radius high-carbon steel" },
          { label: "Controle de lâmina", value: "Preparada para automação 2D/3D" },
        ],
        highlights: [
          "Resposta contínua para acabamento, crown e perfis com menor retrabalho.",
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Implementos", value: "Ripper traseiro, scarifier na lâmina e push blade frontal" },
          { label: "Modo de operação", value: "Crab walk para manobra e limpeza lateral" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Ambiente", value: "Cabine operator-friendly com câmera e foco em visibilidade" },
          { label: "Direção", value: "Volante sempre presente para familiaridade operacional" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Conectividade remota", value: "myCASEConstruction Remote Service Tool + SiteManager" },
          { label: "Machine control", value: "Dual mast, laser receiver e robotic total station" },
        ],
        highlights: [
          "Leitura de falhas, sensores e sinais vitais da máquina com diagnóstico remoto.",
        ],
      },
      applications: {
        specs: [
          { label: "Aplicações-chave", value: "Estradas, preparação de base, manutenção municipal e acabamento de superfície" },
          { label: "Anexos prioritários", value: "Ripper, scarifier e push blade" },
          { label: "Vantagem de uso", value: "Crab walk e controle de lâmina para cortes consistentes" },
        ],
      },
      service: {
        specs: [
          { label: "Acesso de serviço", value: "Groundline serviceability com compartimentos lógicos" },
          { label: "Remoto", value: "Atualização de software e diagnóstico via SiteConnect" },
          { label: "Tempo de parada", value: "Redução de downtime por leitura remota e acesso amplo" },
        ],
        highlights: [
          "Foco em diagnóstico rápido e menor tempo de máquina parada em obras lineares.",
        ],
      },
    },
  }),
  createCaseMachine({
    id: "521g",
    model: "CASE 521G",
    category: "Heavy",
    family: "Pás Carregadeiras (G-Series)",
    hp: "106 HP",
    powerValue: 106,
    weightClass: "24.203 lbs",
    operatingWeightValue: 24203,
    engine: "FPT F4HFE413NB",
    transmission: "Powershift",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/43880f221bd64735b7f09ea301fe74a5?v=535496d5",
    imageAlt: "CASE 521G wheel loader oficial",
    features: ["Z-bar", "Payload ready", "EH controls"],
    subsystems: {
      powertrain: { Motor: "FPT F4HFE413NB", Potência: "106 HP", Emissões: "Stage V", Transmissão: "Powershift 4 velocidades", Tração: "AWD heavy-duty" },
      hydraulics: { Sistema: "Bomba de engrenagem", Fluxo: "44 GPM", Pressão: "3.335 PSI", Válvulas: "EH proporcionais", Terceira_função: "Disponível" },
      structure: { Chassi: "Loader frame reforçado", Peso: "24.203 lbs", Tombamento: "17.653 lbs", Breakout: "20.934 lbs", Linkage: "Z-bar" },
      cab: { Controles: "Joystick EH", Visibilidade: "Câmera traseira grande angular", HVAC: "Cabine pressurizada", Assento: "Suspensão mecânica", Display: "LCD multifunção" },
      tech: { Machine_Control: "Payload assist opcional", Telemática: "SiteConnect", Segurança: "Monitoramento remoto", Automação: "Auto-idle", Integração: "Gestão de frota" },
    },
    technicalProfile: {
      productNote: "Wheel loader média para pátio, agregados, locação e movimentação geral com foco em simplicidade de operação.",
      summary: [
        { label: "Potência", value: "106 HP" },
        { label: "Peso operacional", value: "24.203 lbs" },
        { label: "Tipping load", value: "17.653 lbs" },
        { label: "Bucket breakout", value: "20.934 lbs" },
      ],
      overview: {
        specs: [
          { label: "Linha", value: "G Series Wheel Loaders" },
          { label: "Mercados prioritários", value: "Land, snow, rental, R&B, building construction e waste" },
          { label: "Vocação", value: "Loader compacta/média com bom equilíbrio entre visibilidade e payload" },
          { label: "Fonte principal", value: "Tabela 2026 G Series + recursos comuns da família" },
        ],
        highlights: [
          "Payload opcional embarcado para leitura de produtividade por ciclo.",
          "Cooling cube CASE com acesso facilitado para limpeza de coolers.",
          "Câmera traseira ampla e iluminação de saída para rotina de operador.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Eixos", value: "Travamento dianteiro e configurações limit slip conforme aplicação" },
          { label: "Roading", value: "4-speed general applications" },
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "Payload", value: "Sistema opcional integrado ao fluxo operacional" },
          { label: "Resposta", value: "Auto dump para reduzir fadiga do operador" },
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Cooling modules", value: "Mid-mounted cooling cube com acesso mais limpo" },
          { label: "Aplicação", value: "Bucket GP, light material bucket, pallet forks, rock bucket e 4x1" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Espaço operacional", value: "Mais espaço interno e superfícies de ajuste" },
          { label: "Conforto", value: "Câmera wide angle + egress lighting" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Telemática", value: "SiteConnect com soluções ProCare/PlusCare" },
          { label: "Arrefecimento", value: "Ventilador auto-reversível programável" },
        ],
      },
      applications: {
        specs: [
          { label: "Implementos principais", value: "General purpose bucket, light material bucket, pallet forks, rock bucket e 4x1 bucket" },
          { label: "Ambientes de uso", value: "Agricultura, paisagismo, neve, locação, pavimentação e resíduos" },
          { label: "Leitura executiva", value: "Máquina de transição entre compacta e produção leve com boa versatilidade" },
        ],
      },
      service: {
        specs: [
          { label: "Fan reversível", value: "Standard programmable auto-reversing fan" },
          { label: "Pacote de suporte", value: "Factory warranty, planned maintenance e telematics" },
          { label: "Acesso", value: "Arquitetura pensada para limpeza e inspeção rápida dos coolers" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "821g",
    model: "CASE 821G",
    category: "Heavy",
    family: "Pás Carregadeiras (G-Series)",
    hp: "195 HP",
    powerValue: 195,
    weightClass: "36.011 lbs",
    operatingWeightValue: 36011,
    engine: "FPT F4HFE613T",
    transmission: "Powershift",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/615e7f6f72d843189649704a4e9976c6?v=4bc80c4a",
    imageAlt: "CASE 821G wheel loader oficial",
    features: ["EH controls", "Alta produtividade", "Payload & fleet ready"],
    subsystems: {
      powertrain: { Motor: "FPT F4HFE613T", Potência: "195 HP", Emissões: "DOC + SCR - Tier 4 Final", Transmissão: "Powershift", Gestão_térmica: "Cooling package de alta carga" },
      hydraulics: { Sistema: "Load-sensing com resposta rápida", Fluxo: "High flow loader circuit", Pressão: "3.335 PSI", Válvulas: "EH proporcionais", Terceira_função: "Pronta para acessórios" },
      structure: { Chassi: "Heavy-duty front frame", Peso: "36.011 lbs", Tombamento: "27.092 lbs", Breakout: "32.107 lbs", Linkage: "Z-bar reforçado" },
      cab: { Controles: "Joystick EH com resposta ajustável", Visibilidade: "Câmeras e espelhos ampliados", HVAC: "Automático", Assento: "Air suspension", Display: "Touch display operacional" },
      tech: { Machine_Control: "Payload e monitoramento de ciclos", Telemática: "SiteConnect", Segurança: "Alertas de manutenção", Automação: "Auto-idle / auto-shutdown", Integração: "Remote diagnostics" },
    },
    technicalProfile: {
      productNote: "Carregadeira de produção intermediária para pedreiras leves, pátio e aplicações industriais com foco em payload e uptime.",
      summary: [
        { label: "Potência", value: "195 HP" },
        { label: "Peso operacional", value: "36.011 lbs" },
        { label: "Tipping load", value: "27.092 lbs" },
        { label: "Bucket breakout", value: "32.107 lbs" },
      ],
      overview: {
        specs: [
          { label: "Linha", value: "G Series Wheel Loaders" },
          { label: "Posicionamento", value: "Loader média/pesada para produção contínua" },
          { label: "Mercados", value: "R&B, construção, locação pesada, neve e materiais" },
          { label: "Fonte principal", value: "Tabela 2026 821G + recursos comuns G Series" },
        ],
        highlights: [
          "Configurable buttons e auto dump para ciclos repetitivos com menor fadiga.",
          "Cooling cube CASE e ventilador reversível para ambientes severos.",
          "Payload analytics e SiteConnect sustentam leitura de produtividade por frota.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Eixos disponíveis", value: "Locking front differential + rear limited slip" },
          { label: "Transmissão adicional", value: "5-speed com lockup torque converter em aplicações de roading" },
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "Payload", value: "Opcional integrado com leitura embarcada" },
          { label: "Produtividade", value: "Alta capacidade de breakout e resposta de braço" },
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Cooling architecture", value: "Mid-mounted cooling cube com acesso para limpeza" },
          { label: "Estabilidade", value: "Arquitetura otimizada para full turn tipping load" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Operação", value: "Mais espaço, melhor ajustabilidade e câmera wide angle" },
          { label: "Conveniência", value: "Egress lighting e botões configuráveis" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Fleet support", value: "SiteConnect, PlusCare e planned maintenance" },
          { label: "Fan inteligente", value: "Auto-reversing fan programável" },
        ],
      },
      applications: {
        specs: [
          { label: "Implementos principais", value: "General purpose bucket, pallet forks, rock bucket, 4x1 e light material bucket" },
          { label: "Perfil de uso", value: "Material handling, carga de caminhões, pilhas e operação mista" },
          { label: "Leitura executiva", value: "Plataforma que equilibra robustez, produtividade e visibilidade" },
        ],
      },
      service: {
        specs: [
          { label: "Pacote base", value: "Factory warranty, planned maintenance e telematics" },
          { label: "Coolers", value: "Acesso simplificado comparado a stack coolers" },
          { label: "Downtime", value: "Redução via limpeza facilitada e monitoramento remoto" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "580ev",
    model: "CASE 580EV",
    category: "Light",
    family: "Retroescavadeiras Elétricas",
    hp: "108 HP / 400V",
    weightClass: "19.947 lbs",
    operatingWeightValue: 19947,
    engine: "Powertrain elétrico com bateria automotiva de íons de lítio",
    transmission: "Tração elétrica direta",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/f34f8f6fa1ec4d098a48cd312495448c?v=2dd56486",
    imageAlt: "CASE 580EV electric backhoe loader oficial",
    features: ["8h de autonomia", "Zero emissões", "400V"],
    subsystems: {
      powertrain: { Motorização: "Traction motor elétrico + hydraulic motor elétrico", Bateria: "Lítio automotiva / 400V", Potência_rated: "108 HP", Potência_pico: "127 HP", Autonomia: "Até 8 horas de operação de retro" },
      hydraulics: { Sistema: "Motor elétrico dedicado para bombas variável e fixa", Fluxo: "Arquitetura otimizada para loader e backhoe circuits", Pressão: "PowerLift + PowerBoost para solo severo", Válvulas: "Eletro-hidráulicas", Ruído: "Operação silenciosa" },
      structure: { Chassi: "Backhoe elétrica reforçada", Peso: "19.947 lbs (9.048 kg)", Desagregação: "14.452 lbs", Profundidade: "17 ft 11 in", Capacidade_de_elevação: "7.044 lbs" },
      cab: { Controles: "Joystick ergonômico + arquitetura N/SV conhecida", Visibilidade: "Ambiente silencioso para uso urbano", HVAC: "Conforto para turno completo", Assento: "Configuração para longas jornadas", Certificação: "ROPS/FOPS" },
      tech: { Machine_Control: "Pronta para integração digital", Telemática: "SiteConnect", Segurança: "Battery management + diagnóstico remoto", Carregamento: "SAE J1772 Level 2", Integração: "Analytics de frota EV" },
    },
    technicalProfile: {
      productNote: "Retroescavadeira elétrica para municípios, utilities e frentes urbanas que exigem silêncio, zero emissões locais e baixo custo de manutenção.",
      summary: [
        { label: "Potência nominal", value: "108 HP" },
        { label: "Potência de pico", value: "127 HP" },
        { label: "Peso operacional", value: "19.947 lbs" },
        { label: "Profundidade de escavação", value: "17 ft 11 in" },
      ],
      overview: {
        specs: [
          { label: "Target customers", value: "Municipalities, utilities, crews metropolitanos e clientes California Core" },
          { label: "Proposta de valor", value: "Quiet operation, zero emissões e acesso facilitado à infraestrutura existente" },
          { label: "Arquitetura elétrica", value: "Traction motor dedicado + motor hidráulico dedicado" },
          { label: "Fonte principal", value: "Página 34 do catálogo CASE 2026" },
        ],
        highlights: [
          "Até 8h com estabilizadores baixados e retro em operação.",
          "Até 4h para funções de deslocamento contínuo.",
          "Quase 40% de redução estimada em custo de manutenção vs. diesel.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Tensão do sistema", value: "400 Volts" },
          { label: "Arquitetura", value: "Múltiplas funções com traction e hydraulic motors separados" },
        ],
        highlights: [
          "A máquina não depende de um único motor para todas as funções, melhorando eficiência de uso energético.",
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "PowerLift", value: "Eleva breakout em solo pesado sem troca de implemento" },
          { label: "PowerBoost", value: "Aumento temporário de breakout para cargas pesadas" },
          { label: "Over Center Backhoe", value: "Melhor estabilidade de operação e retenção de material" },
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Loader features", value: "Layout de braço e chassi voltado à produtividade urbana" },
          { label: "Escopo urbano", value: "Adequada para áreas sensíveis a ruído e emissões" },
        ],
      },
      cab: {
        highlights: [
          "Conforto acústico superior ao diesel em frentes urbanas e noturnas.",
        ],
        notes: [
          "A ergonomia segue a lógica das retroescavadeiras CASE com menor estresse térmico e vibracional percebido.",
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Charging standard", value: "SAE J1772 Level 2" },
          { label: "Gestão de bateria", value: "Monitoramento digital e diagnósticos remotos" },
        ],
      },
      applications: {
        specs: [
          { label: "Cenários ideais", value: "Obras urbanas, manutenção municipal, utilidades e zonas com restrição de ruído" },
          { label: "Vantagem operacional", value: "Menor custo diário de manutenção e operação limpa" },
          { label: "Recursos de performance", value: "Extendahoe, PowerLift e PowerBoost" },
        ],
      },
      service: {
        specs: [
          { label: "Checks diários", value: "Acesso em nível do solo para hidráulico biodegradável e coolant" },
          { label: "Itens eliminados", value: "Sem fuel filter, engine oil, oil filter e paradas de regen" },
          { label: "Custo de manutenção", value: "Redução estimada de quase 40% vs diesel" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "cx300e",
    model: "CASE CX300E",
    category: "Heavy",
    family: "Escavadeiras",
    hp: "259 HP",
    powerValue: 259,
    weightClass: "73.855 lbs",
    operatingWeightValue: 73855,
    engine: "FPT NEF6",
    transmission: "N/A",
    image: "/equipment/case/cx300e-upload.png",
    imageAlt: "Foto real da escavadeira CASE CX300E",
    features: ["Full-size excavator", "EH hydraulics", "Machine Control ready"],
    subsystems: {
      powertrain: { Motor: "FPT NEF6", Potência: "259 HP", Emissões: "Tier 4 Final / Stage V", Gestão_de_modos: "SP / H / ECO", Injeção: "HPCR" },
      hydraulics: { Sistema: "Twin variable-displacement piston", Fluxo: "Alta vazão para produção pesada", Pressão: "5.000+ PSI", Válvulas: "Eletro-hidráulicas", Regeneração: "Boom / arm regeneration" },
      structure: { Chassi: "Undercarriage para 33,5 t", Peso: "73.855 lbs", Profundidade: "24 ft 10 in", Breakout: "Alta força de escavação", Giro: "Swing heavy-duty" },
      cab: { Controles: "Joysticks de 3 eixos", Visibilidade: "Rear camera + 360 opcional", HVAC: "Automático", Assento: "Air suspension premium", Display: "Widescreen touch display" },
      tech: { Machine_Control: "2D/3D ready", Telemática: "SiteConnect", Segurança: "Detecção de entorno e alertas", Integração: "Leica / Topcon / Trimble", Diagnóstico: "Remote diagnostics" },
    },
    technicalProfile: {
      productNote: "Escavadeira full-size para produção pesada, com foco em ciclo, precisão hidráulica e preparação para machine control.",
      summary: [
        { label: "Potência", value: "259 HP" },
        { label: "Peso operacional", value: "73.855 lbs" },
        { label: "Profundidade de escavação", value: "24 ft 10 in" },
        { label: "Controle", value: "OEM-fit 2D/3D ready" },
      ],
      overview: {
        specs: [
          { label: "Linha", value: "Full Size E Series Excavators" },
          { label: "Aplicação", value: "Produção geral, obras pesadas e suporte a tiltrotator" },
          { label: "Arquitetura", value: "CASE Intelligent Hydraulic System + 3 power modes" },
          { label: "Fonte principal", value: "Conteúdo de arquitetura E Series 2026 + modelo atual do portfólio" },
        ],
        highlights: [
          "CIHS reduz consumo total e maximiza performance.",
          "Boom Economy Control, Auto Economy Control, Swing Relief Control e Spool Stroke Control.",
          "Cabine mais larga, silenciosa e com comandos ergonômicos.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Power modes", value: "SP / H / ECO" },
          { label: "Eficiência", value: "Motor DPF-free com foco em economia e menor complicação operacional" },
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "CIHS", value: "Controllers dedicados para reduzir consumo e maximizar produtividade" },
          { label: "Assistência", value: "Configuração de pressão/overflow por implemento e lock por PIN" },
        ],
        highlights: [
          "Hidráulica preparada para attachment work e gestão refinada de fluxo por ferramenta.",
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Tiltrotators", value: "Compatível com rotação 360° e tilt de 45° para maior versatilidade" },
          { label: "Aplicação de implementos", value: "HD bucket, severe duty bucket, ditch cleaning bucket e hydraulic thumb" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Monitor", value: "LCD maior com dados operacionais e funções usadas" },
          { label: "Visibilidade", value: "Pacote de iluminação LED e cobertura ampliada do entorno" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Machine control", value: "Sistemas completos 2D/3D com componentes OEM-fit" },
          { label: "Telemática", value: "SiteConnect, factory warranty e planned maintenance" },
        ],
      },
      applications: {
        specs: [
          { label: "Implementos prioritários", value: "HD bucket, severe duty bucket, ditch cleaning bucket, thumb e hammer" },
          { label: "Ambientes de uso", value: "Land, snow, rental, R&B, building construction e waste" },
          { label: "Leitura executiva", value: "Produto de produção com foco em eficiência hidráulica, conforto e integração digital" },
        ],
      },
      service: {
        specs: [
          { label: "EMS", value: "Easy Maintenance System com intervalos estendidos em buchas e pontos de lubrificação" },
          { label: "Suporte", value: "PlusCare, planned maintenance e telemática" },
          { label: "Emissões", value: "Arquitetura sem regen estacionária complexa no contexto da linha" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "2050m",
    model: "CASE 2050M",
    category: "Heavy",
    family: "Tratores de Esteira (Dozers)",
    hp: "232 HP",
    powerValue: 232,
    weightClass: "47.119 lbs",
    operatingWeightValue: 47119,
    engine: "FPT F4HFE613J",
    transmission: "Hydrostatic",
    image: "/equipment/case/2050m-upload.png",
    imageAlt: "Foto real do trator de esteira CASE 2050M",
    features: ["Dozer de alta tração", "Controle de lâmina preciso", "Grade control ready"],
    subsystems: {
      powertrain: { Motor: "FPT F4HFE613J", Potência: "232 HP", Emissões: "DOC + SCR - Tier 4 Final", Transmissão: "Hydrostatic", Tração: "High torque dozing setup" },
      hydraulics: { Sistema: "Implement hydraulics de alta carga", Fluxo: "Blade response otimizada", Pressão: "3.000 PSI", Válvulas: "EH blade control", Ripper: "Configuração traseira plug and play" },
      structure: { Chassi: "Crawler frame heavy-duty", Peso: "47.119 lbs", Lâmina: "6-Way PAT, fixed e folding", Drawbar_pull: "80.979 lbs", Configurações: "Semi-U Blade e Straight Blade" },
      cab: { Controles: "Joysticks EH", Visibilidade: "Linha de visão ampliada para lâmina", HVAC: "Cabine climatizada de pressão positiva", Assento: "Suspensão a ar", Display: "Monitor de produção integrado" },
      tech: { Machine_Control: "Leica factory fit / Copilot / 2D / 3D", Telemática: "SiteConnect", Segurança: "Bluetooth, Wi-Fi e câmera opcional/fixa por faixa", Automação: "Hold slope e blade assist", Integração: "Docking station + machine control panel" },
    },
    technicalProfile: {
      productNote: "Dozer de grande porte orientado a dozing severo, precisão de lâmina e integração madura com sistemas de grade control.",
      summary: [
        { label: "Potência", value: "232 HP" },
        { label: "Peso operacional", value: "47.119 lbs" },
        { label: "Max drawbar pull", value: "80.979 lbs" },
        { label: "Blade architecture", value: "6-Way PAT / Fixed / Folding" },
      ],
      overview: {
        specs: [
          { label: "Linha", value: "M Series Crawler Dozers" },
          { label: "Proposta de valor", value: "Ability, serviceability e machine control integrados" },
          { label: "Fonte principal", value: "Páginas 11, 15 e 17 do catálogo CASE 2026" },
          { label: "Vocação", value: "Terraplenagem pesada, rough/fine grading e preparo de base" },
        ],
        highlights: [
          "Positive-pressure cab com foco em ambiente limpo e confortável.",
          "Foldable PAT blade disponível de fábrica para transporte facilitado.",
          "Guarding em componentes hidráulicos expostos no push beam/blade lift cylinders.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Emissões", value: "Tier 4 Final com arquitetura DOC + SCR" },
          { label: "Shuttling", value: "Sensibilidade ajustável por preferência do operador" },
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "Auxiliary ready valve", value: "Preparada para ripper ou winch sem válvulas adicionais" },
          { label: "Blade control", value: "Controle fino com compatibilidade Leica factory fit" },
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Transporte", value: "Folding PAT faz as esteiras virarem a parte mais larga da máquina" },
          { label: "Acessos", value: "Foldable grab handles nos cilindros de elevação da lâmina" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Conectividade cabine", value: "Bluetooth radio, portas USB e painel retroiluminado" },
          { label: "Iluminação", value: "LED exterior lights padrão em 1150M-2050M" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Copilot", value: "Factory fit para hold slope automático sem laser/mast/GPS" },
          { label: "Single mast 2D", value: "Laser receiver central com auto tilt/height" },
          { label: "Dual mast 3D / OnCab 3D", value: "GPS avançado com segurança superior dos componentes" },
        ],
      },
      applications: {
        specs: [
          { label: "Cenários ideais", value: "Dozing severo, corte de platôs, rodovias, mineração leve e rough/fine grading" },
          { label: "Implementos", value: "Ripper, winch, Semi-U blade e straight blade" },
          { label: "Leitura executiva", value: "Máquina robusta com forte combinação de tração, precisão e integração digital" },
        ],
      },
      service: {
        specs: [
          { label: "Pacote de suporte", value: "Factory warranty, planned maintenance e telematics" },
          { label: "Acesso", value: "Best-in-class serviceability com portas e painéis simplificados" },
          { label: "Downtime", value: "Redução por conectividade remota e arquitetura pronta para instalação rápida de kits" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "n-series",
    model: "CASE N-Series",
    category: "Heavy",
    family: "Tratores de Esteira (Dozers)",
    hp: "130–160 HP",
    powerValue: 160,
    weightClass: "26.800–35.000 lbs",
    operatingWeightValue: 35000,
    engine: "FPT F5H",
    transmission: "Hydrostatic",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/882675e226614e06883232703b42404e?v=f6cfdb5d",
    imageAlt: "Linha CASE de dozers usada como referência visual para a N-Series",
    features: ["EH Controls", "SCR-only emissions", "Hydrostatic drive"],
    subsystems: {
      powertrain: { Motor: "FPT F5H", Potência: "130–160 HP", Emissões: "SCR-only Tier 4 Final", Transmissão: "Hydrostatic", Regeneração: "Sem DPF / sem regen" },
      hydraulics: { Sistema: "Variable piston", Fluxo: "34 GPM", Pressão: "3.000 PSI", Válvulas: "EH 6-way PAT", Comando: "Resposta fina de lâmina" },
      structure: { Chassi: "Undercarriage selado e lubrificado", Peso: "26.800–35.000 lbs", Lâmina: "10–12 ft", Pressão_no_solo: "5,8 PSI", Estrutura: "Compact dozing frame" },
      cab: { Controles: "Dual EH joystick", Visibilidade: "Câmera traseira", HVAC: "Cabine premium", Assento: "Heated air-suspension", Display: "Touchscreen de 7\"" },
      tech: { Machine_Control: "2D/3D integrado", Telemática: "SiteConnect", Segurança: "Diagnóstico remoto", Automação: "Auto blade pitch", Integração: "SiteControl ready" },
    },
    technicalProfile: {
      productNote: "Referência compacta/média de dozer CASE para aplicações utilitárias, locação e preparação de base com foco em simplicidade operacional.",
      summary: [
        { label: "Potência", value: "130–160 HP" },
        { label: "Peso operacional", value: "26.800–35.000 lbs" },
        { label: "Blade", value: "10–12 ft" },
        { label: "Emissões", value: "SCR-only / sem DPF" },
      ],
      overview: {
        specs: [
          { label: "Posicionamento", value: "Dozer CASE de porte intermediário com foco em facilidade de serviço" },
          { label: "Leitura de mercado", value: "Adequado para clientes que valorizam simplicidade, custo de propriedade e operação repetitiva" },
          { label: "Base técnica", value: "Dados atuais do portfólio com reforço da narrativa de serviceability CASE" },
        ],
        highlights: [
          "Arquitetura sem DPF e sem regen favorece operação previsível.",
          "Joystick dual EH e câmera traseira apoiam uso por equipes mistas.",
        ],
      },
      powertrain: {
        extraSpecs: [{ label: "Tração", value: "Hydrostatic drive voltado a modulação fina de empuxo" }],
      },
      hydraulics: {
        extraSpecs: [{ label: "Blade control", value: "EH 6-way PAT com resposta fina para acabamento" }],
      },
      structure: {
        extraSpecs: [{ label: "Undercarriage", value: "Selado e lubrificado para maior previsibilidade de uso" }],
      },
      cab: {
        extraSpecs: [{ label: "Operador", value: "Cabine premium com monitor touch de 7 polegadas" }],
      },
      tech: {
        extraSpecs: [{ label: "Prontidão digital", value: "SiteControl ready e diagnósticos remotos" }],
      },
      applications: {
        specs: [
          { label: "Usos típicos", value: "Locação, manutenção de área, preparação de base e terraplenagem leve/média" },
          { label: "Valor principal", value: "Simplicidade com ergonomia acima do básico" },
        ],
      },
      service: {
        specs: [
          { label: "Serviço", value: "Narrativa CASE de acesso simples e menor complexidade de emissões" },
          { label: "Downtime", value: "Foco em intervenções rápidas e monitoramento remoto" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "dl550",
    model: "CASE Minotaur DL550",
    category: "Light",
    family: "Equipamentos Compactos",
    hp: "114 HP",
    powerValue: 114,
    weightClass: "18.600 lbs",
    operatingWeightValue: 18600,
    engine: "FPT F5B",
    transmission: "2-speed mechanical",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/7d586a8ffae44e11a72b02684fa9b401?v=d3e71278",
    imageAlt: "CASE Minotaur DL550 oficial",
    features: ["Compact Dozer Loader", "CTL undercarriage", "High breakout"],
    subsystems: {
      powertrain: { Motor: "FPT F5B", Potência: "114 HP", Emissões: "CEGR + DOC + SCR - Tier 4 Final", Transmissão: "2-speed mechanical", Cooling: "Reversing fan" },
      hydraulics: { Sistema: "High-flow gear pump", Fluxo: "38 GPM", Pressão: "3.400 PSI", Válvulas: "EH joystick", Auxiliar: "High flow padrão" },
      structure: { Chassi: "Compact dozer loader frame", Peso: "18.600 lbs c/ ripper", Lâmina: "96 in 6-way PAT", Hinge_pin: "140 in", Tipping_load: "10.995 lbs" },
      cab: { Controles: "Dual joystick ISO", Visibilidade: "Câmera traseira integrada", HVAC: "Cabine pressurizada", Assento: "Operator comfort seat", Display: "LCD 5\"" },
      tech: { Machine_Control: "SiteControl solutions", Telemática: "SiteConnect", Segurança: "Rear backup camera + CAN diagnostics", Integração: "Modo dozer + modo CTL", Automação: "Ventilador reversível automático" },
    },
    technicalProfile: {
      productNote: "Dozer loader compacto híbrido entre CTL e dozer, desenhado para doze, load e ripper em uma única plataforma.",
      summary: [
        { label: "Potência", value: "114 HP" },
        { label: "Peso com ripper", value: "18.600 lbs" },
        { label: "Lâmina", value: "96 in 6-way PAT" },
        { label: "Tipping load", value: "10.995 lbs" },
      ],
      overview: {
        specs: [
          { label: "Conceito", value: "First Compact Dozer Loader" },
          { label: "Capacidades", value: "Doze, load e ripper com track performance orientada à produtividade" },
          { label: "Fonte principal", value: "Página 23 do catálogo CASE 2026" },
          { label: "Modo duplo", value: "Dozer mode e CTL mode com regras de uso dedicadas" },
        ],
        highlights: [
          "Rear backup camera integrada para segurança e produtividade.",
          "Fewer moving parts e menor manutenção em relação a soluções mais complexas.",
          "Com SiteControl, consegue rough e fine grade em uma gama ampla de jobsites.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Motor base", value: "FPT F5B com solução Tier 4 Final" },
          { label: "Arrefecimento", value: "Reversing fan com acionamento por botão ou automático" },
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "Produtividade", value: "Alto suporte a blade e implementos do modo CTL" },
          { label: "Precisão", value: "Arquitetura pensada para rough/fine grade" },
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Undercarriage", value: "CTL-style com grousers de 1 in para tração agressiva" },
          { label: "Modo CTL", value: "Hinge pin height de 140 in e tipping load na faixa de 11.000 lbs" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Segurança", value: "Integra câmera traseira e layout voltado à visibilidade" },
          { label: "Controles", value: "ISO controls no modo CTL" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Machine control", value: "SiteControl para rough e finish grade" },
          { label: "Feedback", value: "Monitoramento da aplicação e track performance" },
        ],
      },
      applications: {
        specs: [
          { label: "Aplicações ideais", value: "Terraplenagem compacta, preparação de base, limpeza de raízes e movimentação de material" },
          { label: "Implementos", value: "Ripper, lâmina PAT e acessórios CTL adicionais" },
          { label: "Leitura executiva", value: "Plataforma singular para reduzir troca de equipamento em jobsite" },
        ],
      },
      service: {
        specs: [
          { label: "Ventilação", value: "Fan reversível reduz limpeza manual dos coolers" },
          { label: "Arquitetura", value: "Menos partes móveis e menor desgaste associado" },
          { label: "Uso correto", value: "Operar DZR mode apenas com C-frame instalado" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "tl100ev",
    model: "CASE TL100EV",
    category: "Light",
    family: "Equipamentos Compactos",
    hp: "Elétrico",
    weightClass: "3.200 lbs",
    operatingWeightValue: 3200,
    engine: "Powertrain elétrico compacto",
    transmission: "Direct drive",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/60fba84eed034aa3b704fd3abb186b9c?v=dc662862",
    imageAlt: "Mini track loader CASE TL100 usado como referência visual para o TL100EV",
    features: ["Mini Track Loader Elétrico", "Zero emissões", "Operação indoor/outdoor"],
    subsystems: {
      powertrain: { Motorização: "Brushless electric drive", Bateria: "Lithium-ion", Emissões: "Zero", Transmissão: "Direct drive", Autonomia: "Aplicações compactas urbanas" },
      hydraulics: { Sistema: "Electric-driven gear pump", Fluxo: "12 GPM", Pressão: "3.000 PSI", Válvulas: "Proporcionais", Auxiliar: "Padrão" },
      structure: { Chassi: "Compact mini track frame", Peso: "3.200 lbs", Carga_operacional: "1.000 lbs", Largura: "36 in", Pressão_no_solo: "3,8 PSI" },
      cab: { Controles: "Dual lever", Visibilidade: "Plataforma aberta 360°", HVAC: "N/A", Segurança: "Operator presence sensing", Ruído: "< 65 dBA" },
      tech: { Machine_Control: "Display de SOC em tempo real", Telemática: "SiteConnect", Segurança: "Bluetooth diagnostics", Integração: "Universal mini mount", Atualizações: "Firmware OTA" },
    },
    technicalProfile: {
      productNote: "Mini track loader elétrica de referência para tarefas urbanas, interiores e ambientes que exigem ruído reduzido e alta manobrabilidade.",
      summary: [
        { label: "Arquitetura", value: "Elétrica / direct drive" },
        { label: "Peso operacional", value: "3.200 lbs" },
        { label: "Largura", value: "36 in" },
        { label: "Carga operacional", value: "1.000 lbs" },
      ],
      overview: {
        specs: [
          { label: "Posicionamento", value: "Plataforma compacta para ambientes sensíveis a emissões e acesso restrito" },
          { label: "Base 2026", value: "Atualizações de mini track loader TL100 + adaptação ao conceito EV do portfólio" },
          { label: "Chassi", value: "Mini track com foco em estabilidade e footprint reduzido" },
        ],
        highlights: [
          "Joysticks atualizados com operação bidirecional e ISO responsivo.",
          "Menos partes móveis e menor desgaste mecânico no conjunto de drive.",
          "Ideal para operação indoor/outdoor com baixa assinatura acústica.",
        ],
      },
      powertrain: {
        extraSpecs: [
          { label: "Charging logic", value: "Referência 2026 compacta: carregamento onboard e fast charge como direção de produto" },
          { label: "Proteção", value: "Switches com maior IP rating para poeira e água" },
        ],
      },
      hydraulics: {
        extraSpecs: [
          { label: "Dual relief valve", value: "Melhora o desempenho em motores de fluxo contínuo" },
          { label: "Precisão", value: "Resposta fina para acessórios compactos" },
        ],
      },
      structure: {
        extraSpecs: [
          { label: "Opções de trilha", value: "Padrão de trilhas estreitas ou largas conforme aderência requerida" },
          { label: "Acessos", value: "Formato compacto para portas e áreas confinadas" },
        ],
      },
      cab: {
        extraSpecs: [
          { label: "Ambiente", value: "Plataforma aberta com visibilidade total do implemento" },
          { label: "Ergonomia", value: "Controle simples para equipes de operação curta" },
        ],
      },
      tech: {
        extraSpecs: [
          { label: "Display", value: "SOC em tempo real e configuração básica de máquina" },
          { label: "Diagnóstico", value: "Bluetooth diagnostics e atualização OTA" },
        ],
      },
      applications: {
        specs: [
          { label: "Implementos aderentes", value: "Stump grinder, soil conditioner, rock grapple e brush mowers" },
          { label: "Cenários ideais", value: "Paisagismo urbano, manutenção leve, facilities e frentes fechadas" },
          { label: "Leitura executiva", value: "Produto compacto para microtarefas com footprint, silêncio e agilidade" },
        ],
      },
      service: {
        specs: [
          { label: "Manutenção", value: "Menos componentes móveis e menor perda por wear" },
          { label: "Proteção elétrica", value: "Maior resistência a água/poeira em interruptores e ignição" },
          { label: "Tempo de carga", value: "Direção de produto 2026: onboard e fast charge como padrão desejável" },
        ],
      },
    },
  }),
  createCaseMachine({
    id: "sl-series",
    model: "CASE SL-Series",
    category: "Light",
    family: "Carregadeiras Articuladas Pequenas (SAL)",
    hp: "25 HP",
    powerValue: 25,
    weightClass: "3.500 lbs",
    operatingWeightValue: 3500,
    engine: "Yanmar diesel",
    transmission: "Hydrostatic",
    image: "https://cnhi-p-001-delivery.sitecorecontenthub.cloud/api/public/content/8b8440002f57461298c20dcb258af3ef?v=d4bd30d0",
    imageAlt: "Linha CASE Small Articulated Loaders oficial",
    features: ["Articulada compacta", "Baixa compactação", "Attachment versatility"],
    subsystems: {
      powertrain: { Motor: "Yanmar 3 cilindros", Potência: "25 HP", Emissões: "Tier 4 Final", Transmissão: "Hydrostatic AWD", Capacidade_de_combustível: "7 gal" },
      hydraulics: { Sistema: "Gear pump", Fluxo: "11,5 GPM", Pressão: "2.900 PSI", Válvulas: "Auxiliar padrão", Engate: "Quick coupler universal" },
      structure: { Chassi: "Articulado compacto", Peso: "3.500 lbs", Carga_operacional: "1.540 lbs", Carga_de_tombamento: "3.080 lbs", Articulação: "40° por lado" },
      cab: { Controles: "Single joystick", Visibilidade: "360° desobstruída", HVAC: "Cabine fechada opcional", Segurança: "Seat bar interlock", Configuração: "Open ROPS" },
      tech: { Machine_Control: "Display básico de operação", Telemática: "SiteConnect opcional", Segurança: "Hour meter e alertas básicos", Integração: "50+ implementos", Diagnóstico: "On-board básico" },
    },
    technicalProfile: {
      productNote: "Small articulated loader para landscaping, movimentação leve e operações onde compactação baixa e visibilidade mandam na decisão.",
      summary: [
        { label: "Potência", value: "25 HP" },
        { label: "Peso operacional", value: "3.500 lbs" },
        { label: "Carga operacional", value: "1.540 lbs" },
        { label: "Articulação", value: "40° por lado" },
      ],
      overview: {
        specs: [
          { label: "Plataforma", value: "Small articulated loader CASE" },
          { label: "Vocação", value: "Landscaping, manutenção, viveiros, facilities e movimentação leve" },
          { label: "Ponto forte", value: "Baixa compactação e visibilidade integral do implemento" },
        ],
        highlights: [
          "Formato compacto com versatilidade para dezenas de implementos.",
          "Excelente leitura visual do terreno em tarefas de precisão leve.",
        ],
      },
      powertrain: {
        extraSpecs: [{ label: "Tração", value: "Hydrostatic AWD para aderência e modulação suave" }],
      },
      hydraulics: {
        extraSpecs: [{ label: "Acoplamento", value: "Quick coupler universal para trocas rápidas" }],
      },
      structure: {
        extraSpecs: [{ label: "Pressão no solo", value: "3,8–5,8 PSI, ideal para preservar superfícies" }],
      },
      cab: {
        extraSpecs: [{ label: "Configuração", value: "Open ROPS ou cabine fechada opcional" }],
      },
      tech: {
        extraSpecs: [{ label: "Integração", value: "SiteConnect opcional e telemetria básica" }],
      },
      applications: {
        specs: [
          { label: "Usos típicos", value: "Pátios, paisagismo, manutenção e transporte leve" },
          { label: "Implementos", value: "Linha variada de acessórios compactos e agrícolas" },
        ],
      },
      service: {
        specs: [
          { label: "Serviço", value: "Manutenção direta e arquitetura simples para frotas leves" },
          { label: "Diagnóstico", value: "On-board básico com alertas essenciais" },
        ],
      },
    },
  }),
];

interface MachineVariantSeed {
  templateId: string;
  id: string;
  model: string;
  category?: CASEMachine["category"];
  family?: string;
  hp: string;
  powerValue?: number;
  weightClass: string;
  operatingWeightValue?: number;
  engine: string;
  transmission: string;
  features?: string[];
  image?: string;
  imageAlt?: string;
  productNote?: string;
}

const copyTechnicalTabs = (tabs: TechnicalTab[]): TechnicalTab[] =>
  tabs.map((tab) => ({
    ...tab,
    specs: tab.specs.map((spec) => ({ ...spec })),
    highlights: tab.highlights ? [...tab.highlights] : undefined,
    notes: tab.notes ? [...tab.notes] : undefined,
  }));

const updateSummaryFromSeed = (summary: TechnicalSpecItem[], seed: MachineVariantSeed): TechnicalSpecItem[] =>
  summary.map((item) => {
    const normalizedLabel = item.label.toLowerCase();

    if (normalizedLabel.includes("potência") || normalizedLabel.includes("potencia")) {
      return { ...item, value: seed.hp };
    }

    if (normalizedLabel.includes("peso")) {
      return { ...item, value: seed.weightClass };
    }

    return { ...item };
  });

const createMachineVariant = (seed: MachineVariantSeed): CASEMachine => {
  const template = baseCaseMachines.find((machine) => machine.id === seed.templateId);

  if (!template) {
    throw new Error(`Template ${seed.templateId} não encontrado para ${seed.id}`);
  }

  return {
    ...template,
    id: seed.id,
    model: seed.model,
    category: seed.category ?? template.category,
    family: seed.family ?? template.family,
    hp: seed.hp,
    powerValue: seed.powerValue,
    weightClass: seed.weightClass,
    operatingWeightValue: seed.operatingWeightValue,
    engine: seed.engine,
    transmission: seed.transmission,
    features: seed.features ? [...seed.features] : [...template.features],
    image: seed.image ?? template.image,
    imageAlt: seed.imageAlt ?? `Imagem de referência do equipamento ${seed.model}`,
    productNote: seed.productNote ?? template.productNote,
    technicalSummary: updateSummaryFromSeed(template.technicalSummary, seed),
    technicalTabs: copyTechnicalTabs(template.technicalTabs),
  };
};

const machineVariants: MachineVariantSeed[] = [
  {
    templateId: "521g",
    id: "621g",
    model: "CASE 621G",
    family: "Pás Carregadeiras (G-Series)",
    hp: "128 HP",
    powerValue: 128,
    weightClass: "28.159 lbs",
    operatingWeightValue: 28159,
    engine: "FPT F4HFE613W",
    transmission: "Powershift",
    features: ["Payload ready", "Cooling cube", "Auto reversing fan"],
    productNote: "Carregadeira média para pátio e construção com foco em cobertura de mercado e produtividade estável.",
  },
  {
    templateId: "821g",
    id: "721g",
    model: "CASE 721G",
    family: "Pás Carregadeiras (G-Series)",
    hp: "172 HP",
    powerValue: 172,
    weightClass: "30.993 lbs",
    operatingWeightValue: 30993,
    engine: "FPT F4HFE613W",
    transmission: "Powershift",
    features: ["EH controls", "Payload analytics", "Auto dump"],
    productNote: "Carregadeira de produção intermediária para operação contínua em agregados e construção.",
  },
  {
    templateId: "821g",
    id: "921g",
    model: "CASE 921G",
    family: "Pás Carregadeiras (G-Series)",
    hp: "230 HP",
    powerValue: 230,
    weightClass: "40.057 lbs",
    operatingWeightValue: 40057,
    engine: "FPT F4HFE613S",
    transmission: "Powershift",
    features: ["Configurable controls", "Heavy-duty frame", "Fleet ready"],
    productNote: "Carregadeira de alta capacidade para ciclos pesados de carga com foco em uptime.",
  },
  {
    templateId: "821g",
    id: "1021g",
    model: "CASE 1021G",
    family: "Pás Carregadeiras (G-Series)",
    hp: "318 HP",
    powerValue: 318,
    weightClass: "45.056 lbs",
    operatingWeightValue: 45056,
    engine: "FPT F2CFE614H",
    transmission: "Powershift",
    features: ["Rear cooling cube", "High breakout", "Production loader"],
    productNote: "Plataforma de produção pesada para grandes pátios, mineração leve e operação de alta demanda.",
  },
  {
    templateId: "821g",
    id: "1121g",
    model: "CASE 1121G",
    family: "Pás Carregadeiras (G-Series)",
    hp: "345 HP",
    powerValue: 345,
    weightClass: "49.934 lbs",
    operatingWeightValue: 49934,
    engine: "FPT F2CFE614F",
    transmission: "Powershift",
    features: ["Max payload", "Rear cooling architecture", "Fleet telemetry"],
    productNote: "Maior carregadeira da linha G para operações críticas de alta tonelagem.",
  },
  {
    templateId: "cx300e",
    id: "cx145e",
    model: "CASE CX145E SR",
    family: "Escavadeiras (E-Series)",
    hp: "102 HP",
    powerValue: 102,
    weightClass: "56.900 lbs",
    operatingWeightValue: 56900,
    engine: "FPT NEF4",
    transmission: "N/A",
    features: ["Short radius", "CIHS", "OEM-fit ready"],
    productNote: "Escavadeira SR para áreas confinadas com precisão hidráulica e ciclo rápido.",
  },
  {
    templateId: "cx300e",
    id: "cx170e",
    model: "CASE CX170E",
    family: "Escavadeiras (E-Series)",
    hp: "121 HP",
    powerValue: 121,
    weightClass: "67.000 lbs",
    operatingWeightValue: 67000,
    engine: "FPT NEF4",
    transmission: "N/A",
    features: ["CIHS", "3 power modes", "Telematics"],
    productNote: "Escavadeira E-Series de aplicação geral com equilíbrio entre potência, consumo e conforto.",
  },
  {
    templateId: "cx300e",
    id: "cx190e",
    model: "CASE CX190E",
    family: "Escavadeiras (E-Series)",
    hp: "121 HP",
    powerValue: 121,
    weightClass: "78.600 lbs",
    operatingWeightValue: 78600,
    engine: "FPT NEF4",
    transmission: "N/A",
    features: ["Heavy breakout", "CIHS", "Telematics"],
    productNote: "Escavadeira E-Series de maior capacidade para escavação de produção em ciclo contínuo.",
  },
  {
    templateId: "cx300e",
    id: "cx220e",
    model: "CASE CX220E",
    family: "Escavadeiras (E-Series)",
    hp: "162 HP",
    powerValue: 162,
    weightClass: "50.000 lbs",
    operatingWeightValue: 50000,
    engine: "FPT NEF6",
    transmission: "N/A",
    features: ["Attachment assist", "CIHS", "2D/3D ready"],
    productNote: "Escavadeira média com alta versatilidade para construção geral e obras de infraestrutura.",
  },
  {
    templateId: "cx300e",
    id: "cx380e",
    model: "CASE CX380E",
    family: "Escavadeiras (E-Series)",
    hp: "268 HP",
    powerValue: 268,
    weightClass: "83.114 lbs",
    operatingWeightValue: 83114,
    engine: "Isuzu AQ-6HK1X",
    transmission: "N/A",
    features: ["Heavy excavation", "Machine control ready", "High breakout"],
    productNote: "Escavadeira de grande porte para produção pesada e escavação contínua de alto volume.",
  },
  {
    templateId: "2050m",
    id: "650m",
    model: "CASE 650M",
    family: "Tratores de Esteira (M-Series)",
    hp: "68 HP",
    powerValue: 68,
    weightClass: "19.500 lbs",
    operatingWeightValue: 19500,
    engine: "FPT F5H",
    transmission: "Hydrostatic",
    features: ["Compact dozer", "EH blade control", "Serviceability"],
    productNote: "Dozer compacto M-Series para terraplenagem leve, manutenção e frentes utilitárias.",
  },
  {
    templateId: "2050m",
    id: "1150m",
    model: "CASE 1150M",
    family: "Tratores de Esteira (M-Series)",
    hp: "127 HP",
    powerValue: 127,
    weightClass: "31.000 lbs",
    operatingWeightValue: 31000,
    engine: "FPT F4H",
    transmission: "Hydrostatic",
    features: ["PAT blade", "Leica-ready", "Positive-pressure cab"],
    productNote: "Dozer intermediário para preparação de base e corte com ótima relação entre tração e precisão.",
  },
  {
    templateId: "2050m",
    id: "1650m",
    model: "CASE 1650M",
    family: "Tratores de Esteira (M-Series)",
    hp: "150 HP",
    powerValue: 150,
    weightClass: "39.000 lbs",
    operatingWeightValue: 39000,
    engine: "FPT F4H",
    transmission: "Hydrostatic",
    features: ["Folding PAT option", "Machine control ready", "Heavy-duty undercarriage"],
    productNote: "Dozer de alta tração para terraplenagem pesada com foco em produtividade e qualidade de acabamento.",
  },
  {
    templateId: "580ev",
    id: "580sv",
    model: "CASE 580SV",
    family: "Retroescavadeiras",
    hp: "97 HP",
    powerValue: 97,
    weightClass: "19.842 lbs",
    operatingWeightValue: 19842,
    engine: "FPT F5N diesel",
    transmission: "Powershift",
    features: ["Power lift", "Power boost", "ProControl ready"],
    productNote: "Retroescavadeira diesel de alto volume para construção geral, saneamento e utilidades com foco em força e versatilidade.",
  },
  {
    templateId: "580ev",
    id: "590sv",
    model: "CASE 590SV",
    family: "Retroescavadeiras",
    hp: "110 HP",
    powerValue: 110,
    weightClass: "20.700 lbs",
    operatingWeightValue: 20700,
    engine: "FPT F5N diesel",
    transmission: "Powershift",
    features: ["Extendahoe", "ProControl", "Heavy lift"],
    productNote: "Retroescavadeira de maior potência para infraestrutura, escavação repetitiva e operações com implementos hidráulicos.",
  },
  {
    templateId: "580ev",
    id: "695sv",
    model: "CASE 695SV",
    family: "Retroescavadeiras",
    hp: "110 HP",
    powerValue: 110,
    weightClass: "24.250 lbs",
    operatingWeightValue: 24250,
    engine: "FPT F5N diesel",
    transmission: "Powershift AWD",
    features: ["Center-pivot dig", "Ride control", "4WS"],
    productNote: "Plataforma de retroescavadeira premium para mercados que exigem maior estabilidade, direção nas quatro rodas e alta produtividade.",
  },
  {
    templateId: "cx300e",
    id: "cx260e",
    model: "CASE CX260E",
    family: "Escavadeiras (E-Series)",
    hp: "179 HP",
    powerValue: 179,
    weightClass: "59.500 lbs",
    operatingWeightValue: 59500,
    engine: "FPT NEF6",
    transmission: "N/A",
    features: ["CIHS", "Grade control ready", "Heavy-duty arm"],
    productNote: "Escavadeira média-alta para infraestrutura e produção, equilibrando ciclo rápido, robustez estrutural e integração digital.",
  },
  {
    templateId: "cx300e",
    id: "cx490e",
    model: "CASE CX490E",
    family: "Escavadeiras (E-Series)",
    hp: "362 HP",
    powerValue: 362,
    weightClass: "109.800 lbs",
    operatingWeightValue: 109800,
    engine: "Isuzu 6UZ1X",
    transmission: "N/A",
    features: ["Mass excavation", "Heavy bucket linkage", "Fleet telemetry"],
    productNote: "Escavadeira de produção pesada para grandes frentes de escavação, pedreiras e infraestrutura crítica.",
  },
  {
    templateId: "2050m",
    id: "750m",
    model: "CASE 750M",
    family: "Tratores de Esteira (M-Series)",
    hp: "92 HP",
    powerValue: 92,
    weightClass: "22.400 lbs",
    operatingWeightValue: 22400,
    engine: "FPT F5H",
    transmission: "Hydrostatic",
    features: ["PAT blade", "Compact footprint", "Serviceability"],
    productNote: "Dozer compacto para preparação de sub-base, manutenção urbana e obras lineares de menor porte.",
  },
  {
    templateId: "2050m",
    id: "850m",
    model: "CASE 850M",
    family: "Tratores de Esteira (M-Series)",
    hp: "112 HP",
    powerValue: 112,
    weightClass: "25.900 lbs",
    operatingWeightValue: 25900,
    engine: "FPT F4H",
    transmission: "Hydrostatic",
    features: ["PAT / Straight blade", "Machine control ready", "Low effort controls"],
    productNote: "Dozer de entrada para terraplenagem geral com foco em precisão de lâmina e custo operacional equilibrado.",
  },
  {
    templateId: "dl550",
    id: "tv370b",
    model: "CASE TV370B",
    family: "Equipamentos Compactos",
    hp: "74 HP",
    powerValue: 74,
    weightClass: "10.730 lbs",
    operatingWeightValue: 10730,
    engine: "FPT F5H",
    transmission: "Hydrostatic track drive",
    features: ["Vertical lift", "High-flow ready", "8-in display"],
    productNote: "Compact track loader de alta versatilidade para canteiro, paisagismo pesado e uso intensivo de implementos.",
  },
  {
    templateId: "dl550",
    id: "tv450b",
    model: "CASE TV450B",
    family: "Equipamentos Compactos",
    hp: "90 HP",
    powerValue: 90,
    weightClass: "11.600 lbs",
    operatingWeightValue: 11600,
    engine: "FPT F5H",
    transmission: "Hydrostatic track drive",
    features: ["High-flow hydraulics", "Heavy lift", "Ride control"],
    productNote: "CTL pesada para fresagem, manejo de material, demolição leve e acessórios de alto fluxo.",
  },
  {
    templateId: "dl550",
    id: "tr310b",
    model: "CASE TR310B",
    family: "Equipamentos Compactos",
    hp: "74 HP",
    powerValue: 74,
    weightClass: "8.950 lbs",
    operatingWeightValue: 8950,
    engine: "FPT F5H",
    transmission: "Hydrostatic track drive",
    features: ["Radial lift", "High torque", "Attachment-ready"],
    productNote: "Compact track loader média para obras gerais com foco em tração, força de breakout e versatilidade.",
  },
  {
    templateId: "dl550",
    id: "tr340b",
    model: "CASE TR340B",
    family: "Equipamentos Compactos",
    hp: "90 HP",
    powerValue: 90,
    weightClass: "9.950 lbs",
    operatingWeightValue: 9950,
    engine: "FPT F5H",
    transmission: "Hydrostatic track drive",
    features: ["High-flow XPS", "Heavy-duty cooling", "Track durability"],
    productNote: "CTL de produção para canteiros mais severos, locação premium e aplicações hidráulicas de alto desempenho.",
  },
  {
    templateId: "dl550",
    id: "sv280b",
    model: "CASE SV280B",
    family: "Equipamentos Compactos",
    hp: "74 HP",
    powerValue: 74,
    weightClass: "8.480 lbs",
    operatingWeightValue: 8480,
    engine: "FPT F5H",
    transmission: "Hydrostatic wheeled drive",
    features: ["Vertical lift", "8-in display", "Hydraulic versatility"],
    productNote: "Skid steer vertical-lift para material handling, obras urbanas e equipes que valorizam velocidade e footprint compacto.",
  },
  {
    templateId: "dl550",
    id: "sr175b",
    model: "CASE SR175B",
    family: "Equipamentos Compactos",
    hp: "67 HP",
    powerValue: 67,
    weightClass: "6.200 lbs",
    operatingWeightValue: 6200,
    engine: "FPT F5H",
    transmission: "Hydrostatic wheeled drive",
    features: ["Radial lift", "Narrow access", "Simple maintenance"],
    productNote: "Skid steer compacta para obras leves, manutenção de pátio e ambientes com acesso mais restrito.",
  },
  {
    templateId: "dl550",
    id: "sr210b",
    model: "CASE SR210B",
    family: "Equipamentos Compactos",
    hp: "74 HP",
    powerValue: 74,
    weightClass: "7.120 lbs",
    operatingWeightValue: 7120,
    engine: "FPT F5H",
    transmission: "Hydrostatic wheeled drive",
    features: ["Radial lift", "High attachment uptime", "Pro-level hydraulics"],
    productNote: "Skid steer média de uso geral para equipes que precisam de forte capacidade com operação simples e rápida manutenção.",
  },
  {
    templateId: "sl-series",
    id: "sl22ev",
    model: "CASE SL22EV",
    family: "Carregadeiras Articuladas Pequenas (SAL)",
    hp: "15 kWh",
    weightClass: "4.400 lbs",
    operatingWeightValue: 4400,
    engine: "Electric drive architecture",
    transmission: "Direct electric drive",
    features: ["Zero-emission", "Low-noise", "Indoor-friendly"],
    productNote: "SAL elétrica compacta para facilities, horticultura, manutenção urbana e ambientes sensíveis a ruído e emissões.",
  },
  {
    templateId: "sl-series",
    id: "sl27",
    model: "CASE SL27",
    family: "Carregadeiras Articuladas Pequenas (SAL)",
    hp: "25 HP",
    powerValue: 25,
    weightClass: "4.900 lbs",
    operatingWeightValue: 4900,
    engine: "Yanmar diesel",
    transmission: "Hydrostatic AWD",
    features: ["Compact articulation", "Low ground pressure", "Universal attachments"],
    productNote: "SAL diesel para landscaping, viveiros e pátios com prioridade para baixa compactação e visibilidade do implemento.",
  },
  {
    templateId: "sl-series",
    id: "sl35",
    model: "CASE SL35",
    family: "Carregadeiras Articuladas Pequenas (SAL)",
    hp: "37 HP",
    powerValue: 37,
    weightClass: "5.900 lbs",
    operatingWeightValue: 5900,
    engine: "Yanmar diesel",
    transmission: "Hydrostatic AWD",
    features: ["Heavy lift in compact class", "Attachment versatility", "All-season use"],
    productNote: "SAL de maior capacidade para movimentação leve, pátios e operações especializadas onde tamanho reduzido é decisivo.",
  },
  // ── D Series Motor Graders ──
  {
    templateId: "gr935",
    id: "836d",
    model: "CASE 836D",
    hp: "137 HP (VHP 156 HP)",
    powerValue: 156,
    weightClass: "26.496 lbs",
    operatingWeightValue: 26496,
    engine: "FPT F4HGE614M*V003 4.5L",
    transmission: "ZF Ergo PowerShift 8F/6R",
    image: "/src/assets/856d-motor-grader.webp",
    imageAlt: "Motoniveladora CASE 836D D Series",
    features: [
      "DOC + SCRoF (Hi-eSCR2) — sem DPF",
      "EH joystick controls",
      "Front articulation exclusiva — crab walk",
      "VHP (Variable Horsepower)",
      "Machine Control ready (2D/3D dual masts)",
      "SiteConnect 4G telemática",
      "Groundline serviceability",
      "ZF Ergo PowerShift jerk-free",
      "Full LED work light package",
      "8-in LCD touchscreen",
    ],
    productNote: "Motoniveladora compacta da D Series com motor FPT 4.5L, sistema Hi-eSCR2 sem DPF e articulação frontal exclusiva. Ideal para manutenção de vias e aplicações municipais.",
  },
  {
    templateId: "gr935",
    id: "836d-awd",
    model: "CASE 836D AWD",
    hp: "137 HP (VHP 156 HP)",
    powerValue: 156,
    weightClass: "27.156 lbs",
    operatingWeightValue: 27156,
    engine: "FPT F4HGE614M*V003 4.5L",
    transmission: "ZF Ergo PowerShift 8F/6R",
    image: "/src/assets/856d-motor-grader.webp",
    imageAlt: "Motoniveladora CASE 836D AWD D Series",
    features: [
      "DOC + SCRoF (Hi-eSCR2) — sem DPF",
      "AWD (All-Wheel Drive)",
      "EH joystick controls",
      "Front articulation exclusiva — crab walk",
      "VHP (Variable Horsepower)",
      "Machine Control ready (2D/3D dual masts)",
      "SiteConnect 4G telemática",
      "Groundline serviceability",
      "ZF Ergo PowerShift jerk-free",
      "Full LED work light package",
    ],
    productNote: "Versão AWD da 836D com tração nas 6 rodas para operação em terrenos difíceis. Mesmo motor FPT 4.5L Hi-eSCR2 sem DPF.",
  },
  {
    templateId: "gr935",
    id: "856d",
    model: "CASE 856D",
    hp: "172 HP (VHP 193 HP)",
    powerValue: 193,
    weightClass: "33.995 lbs",
    operatingWeightValue: 33995,
    engine: "FPT F4HGE614L*V003 4.5L",
    transmission: "ZF Ergo PowerShift 8F/6R",
    image: "/src/assets/856d-motor-grader.webp",
    imageAlt: "Motoniveladora CASE 856D D Series",
    features: [
      "DOC + SCRoF (Hi-eSCR2) — sem DPF",
      "EH joystick controls",
      "Front articulation exclusiva — crab walk",
      "VHP (Variable Horsepower) 193 HP",
      "Machine Control ready (2D/3D dual masts)",
      "SiteConnect 4G telemática",
      "Groundline serviceability",
      "ZF Ergo PowerShift jerk-free",
      "Moldboard single-radius high-carbon steel",
      "Full LED work light package",
      "8-in LCD touchscreen",
    ],
    productNote: "Motoniveladora principal da D Series com motor FPT 4.5L de 193 HP VHP, Hi-eSCR2 sem DPF e articulação frontal exclusiva da classe. Referência em road building e acabamento de superfície.",
  },
  {
    templateId: "gr935",
    id: "856d-awd",
    model: "CASE 856D AWD",
    hp: "172 HP (VHP 193 HP)",
    powerValue: 193,
    weightClass: "34.877 lbs",
    operatingWeightValue: 34877,
    engine: "FPT F4HGE614L*V003 4.5L",
    transmission: "ZF Ergo PowerShift 8F/6R",
    image: "/src/assets/856d-motor-grader.webp",
    imageAlt: "Motoniveladora CASE 856D AWD D Series",
    features: [
      "DOC + SCRoF (Hi-eSCR2) — sem DPF",
      "AWD (All-Wheel Drive)",
      "EH joystick controls",
      "Front articulation exclusiva — crab walk",
      "VHP (Variable Horsepower) 193 HP",
      "Machine Control ready (2D/3D dual masts)",
      "SiteConnect 4G telemática",
      "Groundline serviceability",
      "ZF Ergo PowerShift jerk-free",
      "Moldboard single-radius high-carbon steel",
      "HVO/XTL fuel compatible",
      "Full LED work light package",
    ],
    productNote: "Topo de linha da D Series com AWD, motor FPT 193 HP VHP, Hi-eSCR2 sem DPF, compatível HVO/XTL e articulação frontal exclusiva. Referenciada no Roadmap Next Gen para upgrade de potência para 250-270 HP.",
  },
];

const hiddenTemplateIds = new Set(["n-series", "sl-series"]);

const rawCaseMachines: CASEMachine[] = [
  ...baseCaseMachines.filter((machine) => !hiddenTemplateIds.has(machine.id)),
  ...machineVariants.map(createMachineVariant),
];

const deriveBenchmarkReferenceId = (machine: CASEMachine) => {
  if (machine.family.includes("Motoniveladoras")) return "gr935";
  if (machine.family.includes("Retroescavadeiras")) return "580ev";
  if (machine.family.includes("Escavadeiras")) return "cx300e";
  if (machine.family.includes("Tratores de Esteira")) return "2050m";
  if (machine.family.includes("Carregadeiras Articuladas")) return "sl27";
  if (machine.family.includes("Equipamentos Compactos")) {
    return /ev/i.test(machine.id) || machine.hp.includes("kWh") ? "tl100ev" : "dl550";
  }
  if (machine.family.includes("Pás Carregadeiras")) {
    return (machine.powerValue ?? 0) >= 180 ? "821g" : "621g";
  }

  return machine.id;
};

const deriveSegment = (machine: CASEMachine) => {
  if (machine.family.includes("Motoniveladoras")) return "Road Building";
  if (machine.family.includes("Pás Carregadeiras")) return "Material Handling";
  if (machine.family.includes("Retroescavadeiras")) return "Utility & Municipal";
  if (machine.family.includes("Escavadeiras")) return "Excavation";
  if (machine.family.includes("Tratores de Esteira")) return "Earthmoving";
  if (machine.family.includes("Carregadeiras Articuladas")) return "Landscaping";
  return "Compact Equipment";
};

export const caseMachines: CASEMachine[] = rawCaseMachines
  .map((machine) => {
    const electrified = /ev/i.test(machine.id) || machine.hp.includes("kWh") || /electric|elétric/i.test(machine.engine);

    return {
      ...machine,
      electrified,
      lifecycleStatus: "Active Production" as const,
      powertrainType: (electrified ? "Electric" : "Diesel") as CASEMachine["powertrainType"],
      segment: deriveSegment(machine),
      benchmarkReferenceId: deriveBenchmarkReferenceId(machine),
      executiveSummary: machine.productNote,
      scannerKeywords: [machine.family, machine.model, machine.engine, ...machine.features].slice(0, 6),
    };
  })
  .sort((a, b) => a.family.localeCompare(b.family, "pt-BR") || a.model.localeCompare(b.model, "pt-BR"));

export interface Competitor {
  name: string;
  category: string;
  caseRival: string;
  image?: string;
  imageAlt: string;
  scores: BenchmarkScore;
}

export const getBenchmarkTemplateId = (machineId: string) =>
  caseMachines.find((machine) => machine.id === machineId)?.benchmarkReferenceId ?? machineId;

export const competitors: Competitor[] = [
  { name: "Caterpillar 160", category: "Motoniveladoras pesadas", caseRival: "gr935", imageAlt: "Caterpillar 160 motor grader", scores: { powertrain: 88, ergonomics: 86, tech: 84, maintenance: 72, priceTCO: 66 } },
  { name: "John Deere 872P", category: "Motoniveladoras pesadas", caseRival: "gr935", imageAlt: "John Deere 872P motor grader", scores: { powertrain: 84, ergonomics: 82, tech: 79, maintenance: 76, priceTCO: 71 } },
  { name: "Komatsu GD655-7", category: "Motoniveladoras pesadas", caseRival: "gr935", imageAlt: "Komatsu GD655-7 motor grader", scores: { powertrain: 82, ergonomics: 79, tech: 76, maintenance: 78, priceTCO: 74 } },
  { name: "LiuGong 4180D", category: "Motoniveladoras pesadas", caseRival: "gr935", imageAlt: "LiuGong 4180D motor grader", scores: { powertrain: 80, ergonomics: 74, tech: 70, maintenance: 76, priceTCO: 81 } },
  { name: "SANY SMG200", category: "Motoniveladoras pesadas", caseRival: "gr935", imageAlt: "SANY SMG200 motor grader", scores: { powertrain: 81, ergonomics: 73, tech: 69, maintenance: 77, priceTCO: 82 } },
  { name: "Volvo L120H", category: "Carregadeiras médias/pesadas", caseRival: "821g", imageAlt: "Volvo L120H wheel loader", scores: { powertrain: 86, ergonomics: 83, tech: 80, maintenance: 74, priceTCO: 69 } },
  { name: "Caterpillar 950 GC", category: "Carregadeiras médias/pesadas", caseRival: "821g", imageAlt: "Caterpillar 950 GC wheel loader", scores: { powertrain: 89, ergonomics: 85, tech: 82, maintenance: 70, priceTCO: 64 } },
  { name: "Hyundai HL960A", category: "Carregadeiras médias/pesadas", caseRival: "821g", imageAlt: "Hyundai HL960A wheel loader", scores: { powertrain: 84, ergonomics: 79, tech: 77, maintenance: 75, priceTCO: 72 } },
  { name: "LiuGong 856H", category: "Carregadeiras médias/pesadas", caseRival: "821g", imageAlt: "LiuGong 856H wheel loader", scores: { powertrain: 83, ergonomics: 76, tech: 72, maintenance: 74, priceTCO: 79 } },
  { name: "Komatsu WA380-8", category: "Carregadeiras médias/pesadas", caseRival: "821g", imageAlt: "Komatsu WA380-8 wheel loader", scores: { powertrain: 85, ergonomics: 81, tech: 78, maintenance: 77, priceTCO: 70 } },
  { name: "John Deere 624 P-Tier", category: "Carregadeiras médias", caseRival: "621g", imageAlt: "John Deere 624 P-Tier wheel loader", scores: { powertrain: 84, ergonomics: 83, tech: 79, maintenance: 75, priceTCO: 72 } },
  { name: "Komatsu WA270-8", category: "Carregadeiras médias", caseRival: "621g", imageAlt: "Komatsu WA270-8 wheel loader", scores: { powertrain: 82, ergonomics: 81, tech: 78, maintenance: 77, priceTCO: 73 } },
  { name: "Volvo L90H", category: "Carregadeiras médias", caseRival: "621g", imageAlt: "Volvo L90H wheel loader", scores: { powertrain: 84, ergonomics: 82, tech: 81, maintenance: 76, priceTCO: 70 } },
  { name: "Hyundai HL940A", category: "Carregadeiras médias", caseRival: "621g", imageAlt: "Hyundai HL940A wheel loader", scores: { powertrain: 80, ergonomics: 76, tech: 74, maintenance: 75, priceTCO: 78 } },
  { name: "SDLG L958F", category: "Carregadeiras médias", caseRival: "621g", imageAlt: "SDLG L958F wheel loader", scores: { powertrain: 78, ergonomics: 72, tech: 68, maintenance: 76, priceTCO: 82 } },
  { name: "JCB 3CX Pro", category: "Retroescavadeiras", caseRival: "580ev", imageAlt: "JCB 3CX Pro backhoe loader", scores: { powertrain: 72, ergonomics: 80, tech: 75, maintenance: 82, priceTCO: 81 } },
  { name: "Caterpillar 420 XE", category: "Retroescavadeiras", caseRival: "580ev", imageAlt: "Caterpillar 420 XE backhoe loader", scores: { powertrain: 84, ergonomics: 83, tech: 79, maintenance: 70, priceTCO: 65 } },
  { name: "John Deere 310 P-Tier", category: "Retroescavadeiras", caseRival: "580ev", imageAlt: "John Deere 310 P-Tier backhoe loader", scores: { powertrain: 79, ergonomics: 78, tech: 76, maintenance: 75, priceTCO: 72 } },
  { name: "Hidromek HMK 102B", category: "Retroescavadeiras", caseRival: "580ev", imageAlt: "Hidromek HMK 102B backhoe loader", scores: { powertrain: 76, ergonomics: 77, tech: 71, maintenance: 79, priceTCO: 77 } },
  { name: "Mecalac e12", category: "Retroescavadeiras / elétricos urbanos", caseRival: "580ev", imageAlt: "Mecalac e12 electric machine", scores: { powertrain: 80, ergonomics: 82, tech: 84, maintenance: 80, priceTCO: 68 } },
  { name: "Caterpillar 336", category: "Escavadeiras pesadas", caseRival: "cx300e", imageAlt: "Caterpillar 336 excavator", scores: { powertrain: 90, ergonomics: 88, tech: 92, maintenance: 67, priceTCO: 61 } },
  { name: "Volvo EC300E", category: "Escavadeiras pesadas", caseRival: "cx300e", imageAlt: "Volvo EC300E excavator", scores: { powertrain: 86, ergonomics: 90, tech: 85, maintenance: 78, priceTCO: 72 } },
  { name: "Komatsu PC290LC", category: "Escavadeiras pesadas", caseRival: "cx300e", imageAlt: "Komatsu PC290LC excavator", scores: { powertrain: 87, ergonomics: 84, tech: 83, maintenance: 77, priceTCO: 69 } },
  { name: "Hyundai HX300A", category: "Escavadeiras pesadas", caseRival: "cx300e", imageAlt: "Hyundai HX300A excavator", scores: { powertrain: 84, ergonomics: 80, tech: 79, maintenance: 76, priceTCO: 76 } },
  { name: "SANY SY305C", category: "Escavadeiras pesadas", caseRival: "cx300e", imageAlt: "SANY SY305C excavator", scores: { powertrain: 85, ergonomics: 76, tech: 73, maintenance: 75, priceTCO: 80 } },
  { name: "Caterpillar D8", category: "Tratores de esteira", caseRival: "2050m", imageAlt: "Caterpillar D8 dozer", scores: { powertrain: 91, ergonomics: 86, tech: 90, maintenance: 69, priceTCO: 60 } },
  { name: "John Deere 850 P-Tier", category: "Tratores de esteira", caseRival: "2050m", imageAlt: "John Deere 850 P-Tier dozer", scores: { powertrain: 87, ergonomics: 84, tech: 88, maintenance: 73, priceTCO: 68 } },
  { name: "Komatsu D85EX", category: "Tratores de esteira", caseRival: "2050m", imageAlt: "Komatsu D85EX dozer", scores: { powertrain: 88, ergonomics: 80, tech: 82, maintenance: 74, priceTCO: 70 } },
  { name: "Liebherr PR 766", category: "Tratores de esteira", caseRival: "2050m", imageAlt: "Liebherr PR 766 dozer", scores: { powertrain: 89, ergonomics: 82, tech: 84, maintenance: 71, priceTCO: 66 } },
  { name: "Shantui SD32", category: "Tratores de esteira", caseRival: "2050m", imageAlt: "Shantui SD32 dozer", scores: { powertrain: 82, ergonomics: 71, tech: 65, maintenance: 78, priceTCO: 83 } },
  { name: "Bobcat T76", category: "Compact track loaders", caseRival: "dl550", imageAlt: "Bobcat T76 compact track loader", scores: { powertrain: 82, ergonomics: 82, tech: 78, maintenance: 74, priceTCO: 70 } },
  { name: "Caterpillar 289D3", category: "Compact track loaders", caseRival: "dl550", imageAlt: "Caterpillar 289D3 compact track loader", scores: { powertrain: 86, ergonomics: 84, tech: 79, maintenance: 71, priceTCO: 67 } },
  { name: "John Deere 333 P-Tier", category: "Compact track loaders", caseRival: "dl550", imageAlt: "John Deere 333 P-Tier compact track loader", scores: { powertrain: 85, ergonomics: 80, tech: 82, maintenance: 73, priceTCO: 68 } },
  { name: "Kubota SVL75-3", category: "Compact track loaders", caseRival: "dl550", imageAlt: "Kubota SVL75-3 compact track loader", scores: { powertrain: 80, ergonomics: 78, tech: 75, maintenance: 79, priceTCO: 74 } },
  { name: "Toro eDingo 500", category: "Compactos elétricos", caseRival: "tl100ev", imageAlt: "Toro eDingo 500 electric compact loader", scores: { powertrain: 78, ergonomics: 81, tech: 79, maintenance: 83, priceTCO: 65 } },
  { name: "Avant e6", category: "Compactos elétricos", caseRival: "tl100ev", imageAlt: "Avant e6 electric loader", scores: { powertrain: 76, ergonomics: 83, tech: 81, maintenance: 80, priceTCO: 66 } },
  { name: "Volvo L25 Electric", category: "Compactos elétricos", caseRival: "tl100ev", imageAlt: "Volvo L25 Electric compact loader", scores: { powertrain: 81, ergonomics: 82, tech: 84, maintenance: 78, priceTCO: 61 } },
  { name: "JCB 525-60E", category: "Compactos elétricos", caseRival: "tl100ev", imageAlt: "JCB 525-60E electric equipment", scores: { powertrain: 79, ergonomics: 80, tech: 80, maintenance: 79, priceTCO: 63 } },
  { name: "Weidemann 1390", category: "Small articulated loaders", caseRival: "sl27", imageAlt: "Weidemann 1390 small articulated loader", scores: { powertrain: 77, ergonomics: 81, tech: 73, maintenance: 80, priceTCO: 74 } },
  { name: "Avant 528", category: "Small articulated loaders", caseRival: "sl27", imageAlt: "Avant 528 small articulated loader", scores: { powertrain: 75, ergonomics: 84, tech: 76, maintenance: 79, priceTCO: 72 } },
  { name: "JCB 403E", category: "Small articulated loaders", caseRival: "sl27", imageAlt: "JCB 403E small articulated loader", scores: { powertrain: 74, ergonomics: 78, tech: 79, maintenance: 77, priceTCO: 69 } },
  { name: "GIANT G2200", category: "Small articulated loaders", caseRival: "sl27", imageAlt: "GIANT G2200 small articulated loader", scores: { powertrain: 73, ergonomics: 76, tech: 70, maintenance: 78, priceTCO: 80 } },
];

const caseScoreOverrides: Record<string, BenchmarkScore> = {
  gr935: { powertrain: 91, ergonomics: 88, tech: 86, maintenance: 85, priceTCO: 79 },
  "821g": { powertrain: 87, ergonomics: 84, tech: 81, maintenance: 83, priceTCO: 76 },
  "621g": { powertrain: 82, ergonomics: 80, tech: 78, maintenance: 81, priceTCO: 74 },
  "580ev": { powertrain: 96, ergonomics: 82, tech: 89, maintenance: 92, priceTCO: 74 },
  cx300e: { powertrain: 85, ergonomics: 84, tech: 83, maintenance: 86, priceTCO: 77 },
  "2050m": { powertrain: 86, ergonomics: 82, tech: 84, maintenance: 85, priceTCO: 75 },
  dl550: { powertrain: 83, ergonomics: 81, tech: 78, maintenance: 84, priceTCO: 76 },
  tl100ev: { powertrain: 88, ergonomics: 83, tech: 90, maintenance: 91, priceTCO: 68 },
  sl27: { powertrain: 76, ergonomics: 85, tech: 72, maintenance: 82, priceTCO: 77 },
};

const scoreClamp = (value: number) => Math.max(58, Math.min(97, Math.round(value)));

const buildDerivedCaseScore = (machine: CASEMachine): BenchmarkScore => {
  const benchmarkId = machine.benchmarkReferenceId ?? machine.id;
  const base = caseScoreOverrides[benchmarkId] ?? caseScoreOverrides.gr935;
  const powerBias = machine.powerValue ? Math.min(6, Math.max(-4, (machine.powerValue - 120) / 40)) : 0;
  const evBias = machine.electrified ? 5 : 0;
  const compactBias = machine.category === "Light" ? 2 : 0;

  return {
    powertrain: scoreClamp(base.powertrain + powerBias + evBias * 0.4),
    ergonomics: scoreClamp(base.ergonomics + compactBias + (machine.family.includes("Carregadeiras Articuladas") ? 2 : 0)),
    tech: scoreClamp(base.tech + evBias + (machine.features.some((feature) => /telem|control|payload|diagnostic/i.test(feature)) ? 2 : 0)),
    maintenance: scoreClamp(base.maintenance + (machine.electrified ? 4 : 0)),
    priceTCO: scoreClamp(base.priceTCO + (machine.category === "Light" ? 2 : 0) - (machine.powerValue && machine.powerValue > 250 ? 3 : 0)),
  };
};

export const caseScores: Record<string, BenchmarkScore> = Object.fromEntries(
  caseMachines.map((machine) => [machine.id, caseScoreOverrides[machine.id] ?? buildDerivedCaseScore(machine)]),
);

export const regionalIntelligence = [
  { id: "na", label: "North America", detail: "Mercado prioriza motoniveladoras >200 HP, dozers com automação e retroescavadeiras EV para contas públicas.", tone: "positive" as const },
  { id: "eu", label: "Europe", detail: "Eletrificação, ruído reduzido e integração 2D/3D seguem como diferenciais mais valorizados.", tone: "positive" as const },
  { id: "latam", label: "LATAM", detail: "Robustez mecânica, suporte de campo e simplicidade diesel ainda pesam mais que feature count.", tone: "warning" as const },
  { id: "apac", label: "APAC", detail: "Pressão competitiva chinesa cresce em escavadeiras e compactos com forte argumento de preço/TCO.", tone: "warning" as const },
  { id: "amea", label: "Africa / Middle East", detail: "Uptime, filtragem e heavy-duty cooling continuam críticos para vencer em frentes severas.", tone: "warning" as const },
];

export const scannerSignals: ScannerSignal[] = [
  { id: "sig-01", caseRival: "gr935", family: "Motoniveladoras", region: "North America", competitor: "Caterpillar 160", date: "2026-03-20", source: "cat.com/160", title: "Pacote de joystick steering ganha tração em bids DOT", suggestion: "Elevar steer-by-wire e narrativa de precisão do GR935 nas contas de infraestrutura.", impact: "Ergonomia e controle fino ficaram mais sensíveis em RFPs rodoviárias.", severity: "high" },
  { id: "sig-02", caseRival: "821g", family: "Pás Carregadeiras (G-Series)", region: "Europe", competitor: "Volvo L120H", date: "2026-03-19", source: "volvoce.com/l120h", title: "Payload assist passa a ser mensagem central em contas maduras", suggestion: "Levar payload analytics e proof-of-productivity para 721G, 821G e 921G.", impact: "Produtividade por ciclo virou métrica executiva em negociações de loader.", severity: "medium" },
  { id: "sig-03", caseRival: "2050m", family: "Tratores de Esteira (M-Series)", region: "North America", competitor: "John Deere 850 P-Tier", date: "2026-03-18", source: "deere.com/850p", title: "Automação de lâmina semi-autônoma avança para contas de produção", suggestion: "Priorizar kit de automação escalável entre 1150M, 1650M e 2050M.", impact: "A pressão vem sobre facilidade de setup e curva de adoção em canteiro.", severity: "high" },
  { id: "sig-04", caseRival: "580ev", family: "Retroescavadeiras", region: "Europe", competitor: "Mecalac e12", date: "2026-03-18", source: "mecalac.com/e12", title: "Projetos urbanos puxam demanda por narrativa zero-emission", suggestion: "Reposicionar 580EV como plataforma de obra urbana premium com telemetria e uptime.", impact: "A disputa deixou de ser só engenharia elétrica e passou a incluir TCO operacional urbano.", severity: "high" },
  { id: "sig-05", caseRival: "cx300e", family: "Escavadeiras (E-Series)", region: "APAC", competitor: "SANY SY305C", date: "2026-03-17", source: "sanyglobal.com/sy305c", title: "Concorrentes chineses combinam preço agressivo e pacotes de fábrica", suggestion: "Reforçar a narrativa CASE em consumo, manutenção e payload estável na E-Series.", impact: "Preço puro cresce, mas suporte e eficiência ainda podem proteger margem.", severity: "medium" },
  { id: "sig-06", caseRival: "621g", family: "Pás Carregadeiras (G-Series)", region: "LATAM", competitor: "SDLG L958F", date: "2026-03-16", source: "sdlg.com/l958f", title: "Preço de entrada pressiona loaders médias em distribuidores LATAM", suggestion: "Criar discurso de valor com pacote de cooling, payload e serviço planejado para 521G/621G.", impact: "A disputa se desloca para valor percebido e disponibilidade de peças.", severity: "medium" },
  { id: "sig-07", caseRival: "dl550", family: "Equipamentos Compactos", region: "North America", competitor: "Caterpillar 289D3", date: "2026-03-15", source: "cat.com/289d3", title: "High-flow e attachment uptime seguem liderando a conversa em CTL", suggestion: "Empacotar TV370B/TR340B com configuração hidráulica executiva por aplicação.", impact: "Clientes querem configuração pronta, não só plataforma-base.", severity: "medium" },
  { id: "sig-08", caseRival: "tl100ev", family: "Equipamentos Compactos", region: "Europe", competitor: "Volvo L25 Electric", date: "2026-03-14", source: "volvoce.com/l25-electric", title: "Compactos elétricos sobem de patamar em facilities e indoor works", suggestion: "Acelerar leitura de charging logic e runtime marketing para TL100EV.", impact: "As decisões estão migrando para autonomia utilizável por turno.", severity: "high" },
  { id: "sig-09", caseRival: "sl27", family: "Carregadeiras Articuladas Pequenas (SAL)", region: "Europe", competitor: "Avant 528", date: "2026-03-13", source: "avanttecno.com/528", title: "Articuladas compactas ganham apelo por baixa compactação e acessórios", suggestion: "Posicionar SL27/SL35 como solução premium de visibilidade + implementos.", impact: "A classe pede mensagem mais clara sobre solo, footprint e precisão do operador.", severity: "low" },
  { id: "sig-10", machineId: "cx145e", caseRival: "cx300e", family: "Escavadeiras (E-Series)", region: "Europe", competitor: "Komatsu PC290LC", date: "2026-03-12", source: "komatsu.eu/pc290lc", title: "Contas urbanas querem short-radius com grade control pronto", suggestion: "Transformar CX145E SR em hero regional para obras urbanas 3D-ready.", impact: "A oportunidade está mais em packaging do que em nova estrutura base.", severity: "medium" },
  { id: "sig-11", machineId: "sl22ev", caseRival: "sl27", family: "Carregadeiras Articuladas Pequenas (SAL)", region: "North America", competitor: "JCB 403E", date: "2026-03-11", source: "jcb.com/403e", title: "Classe SAL elétrica passa a exigir carregamento simples e operação silenciosa", suggestion: "Levar SL22EV com narrativa de indoor productivity e serviço simplificado.", impact: "Mercados premium aceitam preço maior se ruído e operação forem comprovadamente superiores.", severity: "medium" },
  { id: "sig-12", machineId: "590sv", caseRival: "580ev", family: "Retroescavadeiras", region: "LATAM", competitor: "Hidromek HMK 102B", date: "2026-03-10", source: "hidromek.com/hmk102b", title: "Retroescavadeiras diesel premium seguem fortes em infraestrutura regional", suggestion: "Fortalecer 590SV/695SV com pacote de robustez + telemetria + manutenção previsível.", impact: "O gap não é potência, mas percepção de valor total entregue em campo.", severity: "low" },
];

export const insights = scannerSignals;

export const engineeringSignals: EngineeringSignal[] = [
  { id: "eng-01", caseRival: "gr935", family: "Motoniveladoras", title: "Interface de direção e controle", gap: "Concorrentes estão simplificando a curva de aprendizagem com joystick steering mais agressivo.", recommendation: "Desenhar pacote steer-by-wire escalável e calibrável para GR935.", impact: "critical" },
  { id: "eng-02", caseRival: "821g", family: "Pás Carregadeiras (G-Series)", title: "Payload analytics em nível de frota", gap: "A leitura de produtividade ainda não é percebida como padrão em toda a linha G.", recommendation: "Expandir payload + dashboards operacionais da 621G à 1121G.", impact: "high" },
  { id: "eng-03", caseRival: "580ev", family: "Retroescavadeiras", title: "Arquitetura EV com mensagem de uptime", gap: "Eletrificação vence em discurso ambiental, mas ainda precisa provar produtividade por turno.", recommendation: "Empacotar charging logic, runtime e telemetria comparativa na 580EV.", impact: "high" },
  { id: "eng-04", caseRival: "cx300e", family: "Escavadeiras (E-Series)", title: "Grade control de fábrica", gap: "Pacotes 2D/3D ainda podem parecer opcionais demais em grandes contas.", recommendation: "Criar readiness package padrão nas E-Series médias e pesadas.", impact: "high" },
  { id: "eng-05", caseRival: "2050m", family: "Tratores de Esteira (M-Series)", title: "Automação de lâmina", gap: "O mercado passou a comparar também setup, treinamento e adoção do sistema.", recommendation: "Simplificar onboarding de machine control nos dozers M-Series.", impact: "critical" },
  { id: "eng-06", caseRival: "dl550", family: "Equipamentos Compactos", title: "Configuração por implemento", gap: "A conversa saiu de potência nominal e foi para kit pronto por aplicação.", recommendation: "Montar bundles por acessório para TV/TR/SV/SR com hidráulica e cooling adequados.", impact: "high" },
  { id: "eng-07", caseRival: "tl100ev", family: "Equipamentos Compactos", title: "Autonomia utilizável", gap: "Compactos elétricos são comparados por horas úteis e velocidade de recarga, não só emissões.", recommendation: "Comunicar melhor runtime por turno e charging workflow do TL100EV.", impact: "high" },
  { id: "eng-08", caseRival: "sl27", family: "Carregadeiras Articuladas Pequenas (SAL)", title: "Baixa compactação como vantagem executiva", gap: "A classe ainda carece de narrativa visual forte sobre footprint e visibilidade.", recommendation: "Reposicionar SL27/SL35/SL22EV com storytelling de solo preservado e controle do implemento.", impact: "medium" },
  { id: "eng-09", machineId: "cx145e", caseRival: "cx300e", family: "Escavadeiras (E-Series)", title: "Short-radius como herói urbano", gap: "A diferenciação SR não está convertida em proposta premium regional.", recommendation: "Fazer da CX145E SR a peça âncora de contas urbanas europeias.", impact: "medium" },
  { id: "eng-10", machineId: "590sv", caseRival: "580ev", family: "Retroescavadeiras", title: "Diesel premium bem defendido", gap: "A narrativa EV não pode enfraquecer a gama diesel de maior robustez.", recommendation: "Separar claramente 580EV urbana e 590SV/695SV infraestrutura severa.", impact: "medium" },
  { id: "eng-11", machineId: "1021g", caseRival: "821g", family: "Pás Carregadeiras (G-Series)", title: "Cooling e uptime em alta tonelagem", gap: "Mercados quentes exigem mensagem mais forte sobre arquitetura térmica e disponibilidade.", recommendation: "Evidenciar cooling cube, fan reversível e manutenção rápida na 1021G/1121G.", impact: "high" },
  { id: "eng-12", machineId: "tv450b", caseRival: "dl550", family: "Equipamentos Compactos", title: "High-flow premium", gap: "Clientes premium querem config pronta para mulchers, cold planers e stump grinders.", recommendation: "Empacotar TV450B com kit high-flow e narrativa de retorno por implemento.", impact: "medium" },
];

export const regionDemand = [
  { region: "North America", lat: 39, lng: -98, demand: "Alta demanda por motoniveladoras, dozers, retroescavadeiras premium e compactos de alto fluxo", equipment: ["GR935", "2050M", "580EV", "590SV", "1021G", "1121G", "TV450B", "SL22EV"], equipmentIds: ["gr935", "2050m", "580ev", "590sv", "1021g", "1121g", "tv450b", "sl22ev"], trend: "+12% YoY" },
  { region: "Europe", lat: 50, lng: 10, demand: "Mercado puxado por eletrificação, controle 3D e equipamentos compactos de baixa emissão", equipment: ["580EV", "TL100EV", "SL22EV", "CX145E SR", "CX220E", "621G", "TV370B", "CX260E"], equipmentIds: ["580ev", "tl100ev", "sl22ev", "cx145e", "cx220e", "621g", "tv370b", "cx260e"], trend: "+15% YoY" },
  { region: "LATAM", lat: -15, lng: -55, demand: "Foco em robustez mecânica, manutenção simplificada e loaders/diesel com forte rede de suporte", equipment: ["821G", "521G", "650M", "750M", "CX170E", "CX190E", "590SV", "TR310B"], equipmentIds: ["821g", "521g", "650m", "750m", "cx170e", "cx190e", "590sv", "tr310b"], trend: "+18% YoY" },
  { region: "APAC", lat: 25, lng: 105, demand: "Obras pesadas, alta produtividade de escavação e compactos preparados para implementos", equipment: ["CX300E", "CX380E", "CX490E", "1150M", "721G", "DL550", "TV450B", "TR340B"], equipmentIds: ["cx300e", "cx380e", "cx490e", "1150m", "721g", "dl550", "tv450b", "tr340b"], trend: "+22% YoY" },
  { region: "Africa/Middle East", lat: 15, lng: 30, demand: "Construção pesada com ênfase em filtragem, uptime, cooling package e payload constante", equipment: ["GR935", "1650M", "2050M", "921G", "1021G", "621G", "CX300E", "695SV"], equipmentIds: ["gr935", "1650m", "2050m", "921g", "1021g", "621g", "cx300e", "695sv"], trend: "+9% YoY" },
];

export const caseMachinePresence: MachineMarketPresencePoint[] = [
  { id: "na-gr935-dominance", machineId: "gr935", region: "North America", type: "dominance", location: "Denver, USA", coordinates: [39.7392, -104.9903], note: "Alta penetração em obras viárias, manutenção rodoviária e programas DOT." },
  { id: "na-2050m-dominance", machineId: "2050m", region: "North America", type: "dominance", location: "Dallas–Fort Worth, USA", coordinates: [32.7767, -96.797], note: "Preferência em terraplenagem pesada e preparo de site com alta demanda por lâmina inteligente." },
  { id: "na-580ev-commercial", machineId: "580ev", region: "North America", type: "commercial", location: "Chicago, USA", coordinates: [41.8781, -87.6298], note: "Comercialização puxada por contas municipais e obras urbanas de baixa emissão." },
  { id: "na-1021g-dominance", machineId: "1021g", region: "North America", type: "dominance", location: "Houston, USA", coordinates: [29.7604, -95.3698], note: "Alta utilização em carga pesada, agregados e operações contínuas de grande porte." },
  { id: "na-1121g-commercial", machineId: "1121g", region: "North America", type: "commercial", location: "Atlanta, USA", coordinates: [33.749, -84.388], note: "Presença comercial forte em pátios de alta tonelagem e movimentação intensiva de materiais." },
  { id: "na-dl550-commercial", machineId: "dl550", region: "North America", type: "commercial", location: "Phoenix, USA", coordinates: [33.4484, -112.074], note: "Boa tração em rental e utilitários para frentes multifunção no sudoeste americano." },
  { id: "na-521g-commercial", machineId: "521g", region: "North America", type: "commercial", location: "Toronto, Canada", coordinates: [43.6532, -79.3832], note: "Distribuição consolidada em pátio, agregados leves e snow removal." },
  { id: "eu-580ev-dominance", machineId: "580ev", region: "Europe", type: "dominance", location: "Amsterdam, Netherlands", coordinates: [52.3676, 4.9041], note: "Retroescavadeira elétrica bem posicionada em obras urbanas sob metas rígidas de emissões." },
  { id: "eu-tl100ev-commercial", machineId: "tl100ev", region: "Europe", type: "commercial", location: "Munich, Germany", coordinates: [48.1351, 11.582], note: "Interesse crescente em compactos EV para facilities, paisagismo e obras indoor." },
  { id: "eu-cx145e-dominance", machineId: "cx145e", region: "Europe", type: "dominance", location: "Hamburg, Germany", coordinates: [53.5511, 9.9937], note: "Short-radius bem posicionada em ambientes urbanos e road building com espaço restrito." },
  { id: "eu-cx300e-commercial", machineId: "cx300e", region: "Europe", type: "commercial", location: "Lyon, France", coordinates: [45.764, 4.8357], note: "Presença em contas de infraestrutura com pacotes de controle 3D e telemática." },
  { id: "eu-cx220e-commercial", machineId: "cx220e", region: "Europe", type: "commercial", location: "Milan, Italy", coordinates: [45.4642, 9.19], note: "Distribuição ativa para obras urbanas e infraestrutura com foco em versatilidade de ciclo." },
  { id: "eu-621g-commercial", machineId: "621g", region: "Europe", type: "commercial", location: "Warsaw, Poland", coordinates: [52.2297, 21.0122], note: "Cobertura comercial sólida em pátios, reciclagem leve e obras gerais." },
  { id: "eu-521g-commercial", machineId: "521g", region: "Europe", type: "commercial", location: "Madrid, Spain", coordinates: [40.4168, -3.7038], note: "Boa adequação a pátio, reciclagem leve e movimentação geral em distribuidores europeus." },
  { id: "latam-821g-dominance", machineId: "821g", region: "LATAM", type: "dominance", location: "São Paulo, Brazil", coordinates: [-23.5505, -46.6333], note: "Forte presença em agregados, canteiros urbanos e movimentação de materiais." },
  { id: "latam-521g-commercial", machineId: "521g", region: "LATAM", type: "commercial", location: "Monterrey, Mexico", coordinates: [25.6866, -100.3161], note: "Máquina bem posicionada em pátios, construção leve e atendimento municipal." },
  { id: "latam-2050m-dominance", machineId: "2050m", region: "LATAM", type: "dominance", location: "Santiago, Chile", coordinates: [-33.4489, -70.6693], note: "Preferência em terraplenagem severa, mineração auxiliar e abertura de frentes pesadas." },
  { id: "latam-cx170e-commercial", machineId: "cx170e", region: "LATAM", type: "commercial", location: "Quito, Ecuador", coordinates: [-0.1807, -78.4678], note: "Versatilidade valorizada em obras urbanas e suporte a infraestrutura regional." },
  { id: "latam-cx190e-commercial", machineId: "cx190e", region: "LATAM", type: "commercial", location: "Medellín, Colombia", coordinates: [6.2442, -75.5812], note: "Boa aderência em escavação de produção e infraestrutura intermediária." },
  { id: "latam-gr935-commercial", machineId: "gr935", region: "LATAM", type: "commercial", location: "Lima, Peru", coordinates: [-12.0464, -77.0428], note: "Comercialização sustentada por obras lineares e manutenção de vias em altitude." },
  { id: "latam-650m-commercial", machineId: "650m", region: "LATAM", type: "commercial", location: "Buenos Aires, Argentina", coordinates: [-34.6037, -58.3816], note: "Dozer compacto com boa aderência em infraestrutura leve e manutenção municipal." },
  { id: "latam-dl550-commercial", machineId: "dl550", region: "LATAM", type: "commercial", location: "Bogotá, Colombia", coordinates: [4.711, -74.0721], note: "Modelo procurado para utility, retrofit urbano e frentes estreitas com alta versatilidade." },
  { id: "apac-cx300e-dominance", machineId: "cx300e", region: "APAC", type: "dominance", location: "Jakarta, Indonesia", coordinates: [-6.2088, 106.8456], note: "Escavadeira pesada competitiva em produtividade contínua e grandes frentes de escavação." },
  { id: "apac-cx380e-dominance", machineId: "cx380e", region: "APAC", type: "dominance", location: "Perth, Australia", coordinates: [-31.9523, 115.8613], note: "Grande porte bem posicionada em mineração leve, infraestrutura pesada e escavação de alto volume." },
  { id: "apac-821g-commercial", machineId: "821g", region: "APAC", type: "commercial", location: "Bangkok, Thailand", coordinates: [13.7563, 100.5018], note: "Acesso comercial em mercados de construção e handling com foco em uptime." },
  { id: "apac-721g-commercial", machineId: "721g", region: "APAC", type: "commercial", location: "Kuala Lumpur, Malaysia", coordinates: [3.139, 101.6869], note: "Carregadeira intermediária valorizada por produtividade e equilíbrio entre porte e custo." },
  { id: "apac-521g-commercial", machineId: "521g", region: "APAC", type: "commercial", location: "Sydney, Australia", coordinates: [-33.8688, 151.2093], note: "Distribuição regional para pátio, municipal e aplicações de materiais leves." },
  { id: "apac-1150m-commercial", machineId: "1150m", region: "APAC", type: "commercial", location: "Manila, Philippines", coordinates: [14.5995, 120.9842], note: "Dozer intermediário demandado para saneamento, road prep e infraestrutura utilitária." },
  { id: "apac-621g-commercial", machineId: "621g", region: "APAC", type: "commercial", location: "Seoul, South Korea", coordinates: [37.5665, 126.978], note: "Carregadeira média com forte aderência em mercados compactos de obras urbanas." },
  { id: "amea-gr935-dominance", machineId: "gr935", region: "Africa/Middle East", type: "dominance", location: "Riyadh, Saudi Arabia", coordinates: [24.7136, 46.6753], note: "Motoniveladora bem posicionada em obras de corredor logístico, infraestrutura e desert grading." },
  { id: "amea-1650m-dominance", machineId: "1650m", region: "Africa/Middle East", type: "dominance", location: "Doha, Qatar", coordinates: [25.2854, 51.531], note: "Dozer de alta tração usado em preparação de base e grandes frentes de terraplenagem." },
  { id: "amea-2050m-commercial", machineId: "2050m", region: "Africa/Middle East", type: "commercial", location: "Johannesburg, South Africa", coordinates: [-26.2041, 28.0473], note: "Presença comercial em terraplenagem pesada, mineração auxiliar e grandes canteiros." },
  { id: "amea-cx300e-commercial", machineId: "cx300e", region: "Africa/Middle East", type: "commercial", location: "Dubai, UAE", coordinates: [25.2048, 55.2708], note: "Comercialização ativa em infraestrutura e contas que exigem telemática e produção estável." },
  { id: "amea-921g-commercial", machineId: "921g", region: "Africa/Middle East", type: "commercial", location: "Cairo, Egypt", coordinates: [30.0444, 31.2357], note: "Carregadeira de alta capacidade utilizada em materiais, logística pesada e grandes pátios." },
  { id: "amea-521g-commercial", machineId: "521g", region: "Africa/Middle East", type: "commercial", location: "Casablanca, Morocco", coordinates: [33.5731, -7.5898], note: "Máquina com boa cobertura em logística de materiais, portos e frentes de apoio industrial." },
  { id: "amea-580ev-commercial", machineId: "580ev", region: "Africa/Middle East", type: "commercial", location: "Tel Aviv, Israel", coordinates: [32.0853, 34.7818], note: "Entrada comercial em projetos urbanos com foco em eletrificação e baixo ruído operacional." },
];

export const competitorPresence: CompetitorPresencePoint[] = [
  { id: "cp-na-cat160", region: "North America", competitor: "Caterpillar 160", caseRival: "gr935", location: "Oklahoma City, USA", coordinates: [35.4676, -97.5164], note: "Presença forte em bids DOT e manutenção rodoviária com narrativa de automação de lâmina.", pressure: "high" },
  { id: "cp-na-cat289", region: "North America", competitor: "Caterpillar 289D3", caseRival: "dl550", location: "Nashville, USA", coordinates: [36.1627, -86.7816], note: "CTL high-flow domina a conversa em rental premium e attachment packages.", pressure: "high" },
  { id: "cp-eu-volvo-l25e", region: "Europe", competitor: "Volvo L25 Electric", caseRival: "tl100ev", location: "Stockholm, Sweden", coordinates: [59.3293, 18.0686], note: "Compacto elétrico com forte narrativa de autonomia utilizável por turno.", pressure: "high" },
  { id: "cp-eu-avant-528", region: "Europe", competitor: "Avant 528", caseRival: "sl27", location: "Helsinki, Finland", coordinates: [60.1699, 24.9384], note: "Articulada compacta segue forte em landscaping premium e horticultura.", pressure: "medium" },
  { id: "cp-eu-ec300e", region: "Europe", competitor: "Volvo EC300E", caseRival: "cx300e", location: "Rotterdam, Netherlands", coordinates: [51.9244, 4.4777], note: "Adoção impulsionada por pacotes 2D/3D e integração embarcada.", pressure: "high" },
  { id: "cp-latam-sdlg", region: "LATAM", competitor: "SDLG L958F", caseRival: "621g", location: "Campinas, Brazil", coordinates: [-22.9099, -47.0626], note: "Preço agressivo pressiona loaders médias em distribuidores regionais.", pressure: "high" },
  { id: "cp-latam-hidromek", region: "LATAM", competitor: "Hidromek HMK 102B", caseRival: "580ev", location: "Guadalajara, Mexico", coordinates: [20.6597, -103.3496], note: "Retro diesel premium cresce em infraestrutura e utilidades pesadas.", pressure: "medium" },
  { id: "cp-apac-sany", region: "APAC", competitor: "SANY SY305C", caseRival: "cx300e", location: "Shanghai, China", coordinates: [31.2304, 121.4737], note: "Combinação de preço e pacote de fábrica sobe em escavadeiras de produção.", pressure: "high" },
  { id: "cp-apac-komatsu", region: "APAC", competitor: "Komatsu D85EX", caseRival: "2050m", location: "Osaka, Japan", coordinates: [34.6937, 135.5023], note: "Dozers com forte reputação de confiabilidade seguem dominando contas tradicionais.", pressure: "medium" },
  { id: "cp-amea-cat950", region: "Africa/Middle East", competitor: "Caterpillar 950 GC", caseRival: "821g", location: "Abu Dhabi, UAE", coordinates: [24.4539, 54.3773], note: "Loader com forte narrativa de uptime em clima severo.", pressure: "high" },
  { id: "cp-amea-liebherr", region: "Africa/Middle East", competitor: "Liebherr PR 766", caseRival: "2050m", location: "Muscat, Oman", coordinates: [23.588, 58.3829], note: "Pressão em dozers pela percepção premium de robustez e filtragem.", pressure: "medium" },
  { id: "cp-amea-jcb-403e", region: "Africa/Middle East", competitor: "JCB 403E", caseRival: "sl27", location: "Amman, Jordan", coordinates: [31.9539, 35.9106], note: "Articulada compacta elétrica começa a abrir espaço em projetos urbanos premium.", pressure: "emerging" },
];

export const getMachineCoverageRegions = (machineId: string) =>
  regionDemand.filter((region) => region.equipmentIds.includes(machineId)).map((region) => region.region);

export const getCompetitorsForMachine = (machineId: string) => competitors.filter((competitor) => competitor.caseRival === getBenchmarkTemplateId(machineId));

export const getScannerSignalsForMachine = (machineId: string) => {
  const machine = caseMachines.find((entry) => entry.id === machineId);
  const benchmarkTemplateId = getBenchmarkTemplateId(machineId);

  return scannerSignals.filter((signal) => (
    signal.machineId === machineId
    || signal.caseRival === benchmarkTemplateId
    || (machine ? signal.family === machine.family : false)
  ));
};

export const getEngineeringSignalsForMachine = (machineId: string) => {
  const machine = caseMachines.find((entry) => entry.id === machineId);
  const benchmarkTemplateId = getBenchmarkTemplateId(machineId);

  return engineeringSignals.filter((signal) => (
    signal.machineId === machineId
    || signal.caseRival === benchmarkTemplateId
    || (machine ? signal.family === machine.family : false)
  ));
};

const engineeringSubsystemLabels: Record<EngineeringSubsystemKey, string> = {
  structure: "Estrutura / Chassi",
  powertrain: "Powertrain",
  hydraulics: "Hidráulica",
  transmission: "Transmissão / Trem de Força",
  implements: "Implementos",
  cabin: "Cabine / Ergonomia",
};

export const scoringMethodology: ScoringMethodologySection[] = [
  {
    subsystem: "powertrain",
    label: engineeringSubsystemLabels.powertrain,
    metrics: [
      { name: "Potência relativa", weight: 0.3, formula: "min(100, potência CASE / melhor potência da classe)" },
      { name: "Solução de emissões", weight: 0.25, formula: "SCR-only = 100; DOC/DPF reduzem score" },
      { name: "Intervalo de manutenção", weight: 0.2, formula: "intervalo / referência premium" },
      { name: "Eficiência hp/ton", weight: 0.15, formula: "hp por tonelada vs benchmark" },
      { name: "Variante elétrica disponível", weight: 0.1, formula: "EV disponível gera bônus de prontidão" },
    ],
  },
  {
    subsystem: "hydraulics",
    label: engineeringSubsystemLabels.hydraulics,
    metrics: [
      { name: "Machine control integrado", weight: 0.35, formula: "factory 3D ready > retrofit" },
      { name: "Pesagem integrada", weight: 0.25, formula: "standard = 100; optional = intermediário" },
      { name: "Automação de implementos", weight: 0.2, formula: "auto dig / swing / assist" },
      { name: "Presets de acessórios", weight: 0.1, formula: "mais presets = maior nota" },
      { name: "Circuitos auxiliares", weight: 0.1, formula: "fluxo auxiliar vs referência" },
    ],
  },
  {
    subsystem: "transmission",
    label: engineeringSubsystemLabels.transmission,
    metrics: [
      { name: "Tipo de transmissão", weight: 0.4, formula: "EVT/CVT > powershift > hidrostática" },
      { name: "Durabilidade do trem de força", weight: 0.3, formula: "arquitetura premium e undercarriage" },
      { name: "Eficiência de transmissão", weight: 0.3, formula: "perdas menores e auto-shift inteligente" },
    ],
  },
  {
    subsystem: "implements",
    label: engineeringSubsystemLabels.implements,
    metrics: [
      { name: "Grade control nativo", weight: 0.35, formula: "factory 3D > opcional > retrofit" },
      { name: "Payload de série", weight: 0.25, formula: "standard = 100; optional = intermediário" },
      { name: "Breakout relativo", weight: 0.2, formula: "força vs líder da classe" },
      { name: "Ecossistema IoT", weight: 0.2, formula: "integração digital dos implementos" },
    ],
  },
  {
    subsystem: "cabin",
    label: engineeringSubsystemLabels.cabin,
    metrics: [
      { name: "Tamanho do display", weight: 0.25, formula: "mais área útil e UI melhoram a nota" },
      { name: "People/Object Detection", weight: 0.25, formula: "radar/360° aumenta maturidade" },
      { name: "Telemática bidirecional", weight: 0.2, formula: "remote troubleshooting + updates" },
      { name: "Ergonomia e ruído", weight: 0.15, formula: "fadiga menor e mais visibilidade" },
      { name: "Application Profiles", weight: 0.15, formula: "perfis por operador/aplicação" },
    ],
  },
  {
    subsystem: "structure",
    label: engineeringSubsystemLabels.structure,
    metrics: [
      { name: "Robustez estrutural", weight: 0.35, formula: "resistência e estabilidade vs benchmark" },
      { name: "Modularidade", weight: 0.2, formula: "quick-change e módulos de serviço" },
      { name: "Acesso de serviço", weight: 0.2, formula: "groundline service e acesso amplo" },
      { name: "Peso / estabilidade", weight: 0.15, formula: "equilíbrio entre massa e estabilidade" },
      { name: "Adequação regional", weight: 0.1, formula: "cooling, filtragem e proteção para clima severo" },
    ],
  },
];

const subsystemMetricSource: Record<EngineeringSubsystemKey, keyof BenchmarkScore> = {
  structure: "maintenance",
  powertrain: "powertrain",
  hydraulics: "tech",
  transmission: "powertrain",
  implements: "tech",
  cabin: "ergonomics",
};

const engineeringTemplateProfiles: Partial<Record<string, { overallScore: number; executiveSummary: string; subsystems: Record<EngineeringSubsystemKey, { score: number; analysis: string; gap: string; recommendation: string }> }>> = {
  "821g": {
    overallScore: 83,
    executiveSummary: "A 821G é sólida em robustez e powertrain, mas precisa elevar payload, cockpit e linguagem digital para enfrentar loaders premium de forma mais clara.",
    subsystems: {
      structure: { score: 82, analysis: "Chassi robusto e estável para ciclos pesados.", gap: "Menos modular que líderes com quick-change counterweight.", recommendation: "Desenvolver contrapeso quick-change e modularidade de manutenção." },
      powertrain: { score: 88, analysis: "Motor FPT e emissões eficientes sustentam boa resposta operacional.", gap: "Potência nominal ainda fica abaixo dos líderes da classe.", recommendation: "Elevar faixa de potência e transformar isso em narrativa de produtividade." },
      hydraulics: { score: 78, analysis: "Hidráulica confiável, mas ainda dependente de opcionais para payload e assistentes.", gap: "Payload integrado e automações ainda são mais maduros na concorrência.", recommendation: "Tornar payload integrado e presets de acessórios parte do pacote base." },
      transmission: { score: 85, analysis: "Powershift inteligente atende bem ciclos de produção.", gap: "CVT/EVT seguem como vantagem dos rivais premium.", recommendation: "Escalar CVT ou arquitetura equivalente na próxima geração." },
      implements: { score: 80, analysis: "Boa compatibilidade de implementos e breakout consistente.", gap: "Payload opcional reduz percepção premium.", recommendation: "Levar payload e inteligência por implemento a feature de série." },
      cabin: { score: 83, analysis: "Cabine funcional e joystick EH entregam boa base ergonômica.", gap: "Tela e UX ainda ficam atrás dos cockpits premium.", recommendation: "Migrar para display ≥10” com UI contextual e perfis por aplicação." },
    },
  },
  cx300e: {
    overallScore: 84,
    executiveSummary: "A CX300E combina base hidráulica forte com estrutura sólida, mas o próximo salto competitivo depende de grade control nativo e maior maturidade digital de fábrica.",
    subsystems: {
      structure: { score: 84, analysis: "X-frame reforçado e base estrutural adequada a produção pesada.", gap: "Menor modularidade premium em contrapeso e serviços pesados.", recommendation: "Avaliar contrapeso removível e manutenção mais rápida em contas intensivas." },
      powertrain: { score: 86, analysis: "FPT NEF6 entrega equilíbrio entre consumo, potência e emissões.", gap: "Os líderes ainda sustentam maior reserva de potência líquida.", recommendation: "Reposicionar a faixa de potência e seu argumento de produtividade." },
      hydraulics: { score: 87, analysis: "CIHS continua como pilar técnico forte da E-Series.", gap: "Grade Assist e automação embarcada ainda não são nativos de fábrica.", recommendation: "Criar grade assist de fábrica como prioridade número 1." },
      transmission: { score: 85, analysis: "Travel e undercarriage atendem bem a classe média-pesada.", gap: "Rivais premium usam undercarriage como argumento mais forte de durabilidade.", recommendation: "Desenvolver pacote premium de undercarriage para mercados severos." },
      implements: { score: 79, analysis: "Boa compatibilidade com 2D/3D ready e OEM-fit.", gap: "Sem grade control nativo, a leitura executiva fica atrás dos líderes.", recommendation: "Levar machine control nativo e ecossistema conectado para o centro do produto." },
      cabin: { score: 85, analysis: "Monitor 10” e ergonomia consistente sustentam a operação diária.", gap: "Cockpits líderes trazem mais integração visual e assistência ao operador.", recommendation: "Adicionar overlays contextuais, visão assistida e perfis por operador." },
    },
  },
  "580ev": {
    overallScore: 91,
    executiveSummary: "A 580EV é o maior diferencial estratégico do portfólio, liderando em eletrificação e manutenção, mas ainda precisa traduzir isso em autonomia utilizável e narrativa urbana premium.",
    subsystems: {
      structure: { score: 90, analysis: "Mantém footprint competitivo e arquitetura familiar para a categoria.", gap: "Ainda há espaço para reforçar percepção de robustez em contas tradicionais.", recommendation: "Evidenciar equivalência estrutural e proteção dos componentes EV." },
      powertrain: { score: 95, analysis: "Dual electric motors posicionam a CASE como referência clara de eletrificação.", gap: "Potência percebida e autonomia por turno ainda exigem comunicação mais forte.", recommendation: "Aprimorar densidade energética e transformar runtime em mensagem central." },
      hydraulics: { score: 88, analysis: "Resposta hidráulica consistente e familiar para equipes de campo.", gap: "Presets e telemetria por implemento ainda podem evoluir.", recommendation: "Adicionar configuração hidráulica por aplicação e leitura de performance." },
      transmission: { score: 90, analysis: "Arquitetura elétrica reduz perdas e simplifica a experiência de operação.", gap: "Falta traduzir eficiência elétrica em argumento visual comparável ao diesel premium.", recommendation: "Materializar ganhos de eficiência com dashboards e provas operacionais." },
      implements: { score: 85, analysis: "Compatibilidade ampla com implementos facilita adoção.", gap: "Ainda há espaço para inteligência de acessórios conectados.", recommendation: "Conectar attachments à telemetria e criar modos dedicados por missão." },
      cabin: { score: 92, analysis: "Experiência silenciosa e de baixo ruído cria proposta premium clara.", gap: "Mercado quer unir silêncio a gestão visual de autonomia e carga.", recommendation: "Adicionar UX focada em autonomia, recarga e produtividade por janela." },
    },
  },
};

const getGenericEngineeringTemplate = (machine: CASEMachine) => {
  const score = caseScores[machine.id] ?? caseScores[getBenchmarkTemplateId(machine.id)] ?? caseScores.gr935;
  const electricBias = machine.electrified ? 4 : 0;

  return {
    overallScore: Math.round((score.powertrain + score.ergonomics + score.tech + score.maintenance + score.priceTCO) / 5),
    executiveSummary: `${machine.model} opera como plataforma ${machine.segment?.toLowerCase() ?? "principal"}, conectando cobertura regional, benchmark da família e sinais de engenharia em uma única leitura executiva.`,
    subsystems: {
      structure: { score: Math.round((score.maintenance + score.ergonomics) / 2), analysis: `Estrutura calibrada para ${machine.segment?.toLowerCase() ?? "produção"}, com foco em robustez e estabilidade.`, gap: "Ainda há espaço para modularidade estrutural e leitura premium mais forte frente aos líderes.", recommendation: `Reforçar arquitetura de serviço e robustez regional do ${machine.model}.` },
      powertrain: { score: Math.min(97, score.powertrain + electricBias), analysis: `${machine.engine} sustenta a proposta principal da máquina com foco em resposta e eficiência.`, gap: machine.electrified ? "O desafio está em autonomia utilizável e charging workflow." : "Os líderes ainda pressionam por potência percebida, reserva sob carga ou refinamento de emissões.", recommendation: machine.electrified ? `Evoluir charging workflow e comunicação de uptime do ${machine.model}.` : `Elevar a narrativa de potência líquida e eficiência do ${machine.model}.` },
      hydraulics: { score: Math.round((score.tech + score.maintenance) / 2), analysis: `Circuito hidráulico voltado a ${machine.features.slice(0, 2).join(" e ").toLowerCase()}.`, gap: "Machine control, payload integrado ou presets por aplicação ainda podem ganhar protagonismo.", recommendation: `Expandir automação e presets hidráulicos dedicados em ${machine.model}.` },
      transmission: { score: Math.round((score.powertrain + score.priceTCO) / 2), analysis: `${machine.transmission} apoia a proposta operacional com foco em confiabilidade e eficiência prática.`, gap: "Arquiteturas premium seguem sendo argumento competitivo em eficiência e refinamento.", recommendation: `Mapear evolução do trem de força com foco em eficiência real e experiência do operador.` },
      implements: { score: Math.round((score.tech + score.ergonomics) / 2), analysis: "Ecossistema de implementos sustenta versatilidade comercial e aderência de aplicação.", gap: "Ainda há espaço para transformar acessórios em proposta digitalmente conectada e mais executiva.", recommendation: `Criar pacotes por missão com telemetria, payload e presets em ${machine.model}.` },
      cabin: { score: score.ergonomics, analysis: `Cabine orientada a visibilidade, ergonomia e menor fadiga no uso diário.`, gap: "O cockpit ainda pode avançar em UX contextual, visão assistida e perfis por operador.", recommendation: `Aprimorar tela, assistências visuais e perfis de operação conectados à telemática.` },
    },
  };
};

const buildSubsystemCompetitors = (machineId: string, subsystem: EngineeringSubsystemKey): EngineeringSubsystemCompetitor[] => {
  const caseMachine = caseMachines.find((machine) => machine.id === machineId);
  if (!caseMachine) return [];

  return getCompetitorsForMachine(machineId).slice(0, 4).map((competitor) => {
    const metric = subsystemMetricSource[subsystem];
    const competitorScore = Math.max(58, Math.min(96, Math.round(competitor.scores[metric] + (subsystem === "implements" ? 3 : subsystem === "structure" ? 2 : 0))));
    const delta = competitorScore - ((caseScores[machineId] ?? caseScores[getBenchmarkTemplateId(machineId)] ?? caseScores.gr935)[metric] ?? competitorScore);

    return {
      name: competitor.name,
      score: competitorScore,
      analysis: delta >= 8
        ? `${competitor.name} abre vantagem clara neste subsistema.`
        : delta >= 3
          ? `${competitor.name} mantém pressão moderada neste subsistema.`
          : delta <= -3
            ? `${competitor.name} opera abaixo da proposta CASE neste subsistema.`
            : `${competitor.name} permanece em faixa próxima da CASE neste subsistema.`,
    };
  });
};

export const getMachineEngineeringProfile = (machineId: string): EngineeringMachineProfile | null => {
  const machine = caseMachines.find((entry) => entry.id === machineId);
  if (!machine) return null;

  const templateId = getBenchmarkTemplateId(machineId);
  const template = engineeringTemplateProfiles[templateId] ?? getGenericEngineeringTemplate(machine);

  return {
    machineId: machine.id,
    machineName: machine.model,
    overallScore: template.overallScore,
    executiveSummary: template.executiveSummary,
    subsystems: (Object.keys(engineeringSubsystemLabels) as EngineeringSubsystemKey[]).map((key) => ({
      key,
      label: engineeringSubsystemLabels[key],
      score: template.subsystems[key].score,
      analysis: template.subsystems[key].analysis,
      gap: template.subsystems[key].gap,
      recommendation: template.subsystems[key].recommendation,
      competitors: buildSubsystemCompetitors(machine.id, key),
    })),
  };
};

export const getMachineOverallScore = (machineId: string) => getMachineEngineeringProfile(machineId)?.overallScore ?? null;

export const getPendingEngineeringInsightsCount = () => caseMachines.reduce((count, machine) => {
  const profile = getMachineEngineeringProfile(machine.id);
  if (!profile) return count;
  return count + profile.subsystems.filter((subsystem) => subsystem.competitors.some((competitor) => competitor.score > subsystem.score)).length;
}, 0);

const autoGeneratedScannerSignals: ScannerSignal[] = caseMachines.flatMap((machine) => {
  const profile = getMachineEngineeringProfile(machine.id);
  const firstRegion = getMachineCoverageRegions(machine.id)[0] ?? "Global";
  const benchmarkId = getBenchmarkTemplateId(machine.id);
  const machineCompetitors = getCompetitorsForMachine(machine.id);
  if (!profile) return [];

  const generated: ScannerSignal[] = [];
  const subsystemGap = profile.subsystems.find((subsystem) => subsystem.competitors.some((competitor) => competitor.score >= subsystem.score + 10));
  if (subsystemGap) {
    const rival = subsystemGap.competitors.find((competitor) => competitor.score >= subsystemGap.score + 10);
    generated.push({
      id: `auto-gap-${machine.id}-${subsystemGap.key}`,
      machineId: machine.id,
      caseRival: benchmarkId,
      family: machine.family,
      region: firstRegion,
      competitor: rival?.name ?? machineCompetitors[0]?.name ?? "Benchmark líder",
      date: "2026-03-21",
      source: "auto-generated.case-nexus",
      title: `${subsystemGap.label} defasado vs. benchmark`,
      suggestion: subsystemGap.recommendation,
      impact: subsystemGap.gap,
      severity: "high",
    });
  }

  if (machine.electrified) {
    generated.push({
      id: `auto-adv-${machine.id}`,
      machineId: machine.id,
      caseRival: benchmarkId,
      family: machine.family,
      region: firstRegion,
      competitor: machineCompetitors[0]?.name ?? "Classe monitorada",
      date: "2026-03-21",
      source: "auto-generated.case-nexus",
      title: `Competitive Advantage: ${machine.model} lidera discurso EV`,
      suggestion: `Comunicar ${machine.model} como referência em baixa emissão, manutenção simplificada e operação silenciosa.`,
      impact: "A plataforma CASE sustenta uma vantagem de eletrificação claramente comunicável na classe.",
      severity: "low",
    });
  }

  return generated;
});

export const allScannerSignals = [...scannerSignals, ...autoGeneratedScannerSignals];

export const getUrgentScannerSignals = (limit = 3) => allScannerSignals.filter((signal) => signal.severity === "high").slice(0, limit);

export const getMachinesForRegion = (region: string) =>
  regionDemand.find((entry) => entry.region === region)?.equipmentIds
    .map((equipmentId) => caseMachines.find((machine) => machine.id === equipmentId))
    .filter((machine): machine is CASEMachine => Boolean(machine))
    ?? [];

export const regionalProfiles: Record<string, RegionalProfile> = {
  north_america: {
    id: "north_america",
    name: "América do Norte",
    flag: "🇺🇸",
    colorToken: "hsl(var(--accent))",
    marketSize: "Tier 1 — Maior mercado global",
    annualRevenue: "$42B equipamentos de construção",
    casePresence: "Forte — fábricas em Fort Wayne, Racine, Burlington",
    topCompetitors: ["Caterpillar (líder)", "John Deere (#2)", "Komatsu (#3)", "Volvo (#4)", "Bobcat (compact)"],
    demandPriorities: [
      { priority: "Machine Control 3D", weight: 95, trend: "up", description: "Licitações DOT exigem machine control como pré-requisito. Sem grade 3D, CASE perde participação em bids críticos." },
      { priority: "Telemática avançada", weight: 90, trend: "up", description: "Fleet managers exigem remote diagnostics, OTA updates e geofencing como parte do ecossistema digital." },
      { priority: "Automação de operação", weight: 85, trend: "up", description: "Escassez de operadores acelera demanda por semi-automação e assistências embarcadas." },
      { priority: "Zero emissões / Eletrificação", weight: 80, trend: "up", description: "CARB e contratos públicos já valorizam plataformas zero-emission em obras urbanas." },
      { priority: "Transmissão eficiente (CVT/EVT)", weight: 75, trend: "up", description: "Diesel caro encurta payback e transforma CVT/EVT em requisito competitivo." },
      { priority: "Produtividade verificável (Payload)", weight: 70, trend: "stable", description: "Proof-of-productivity por tonelada/hora virou KPI executivo em operadores enterprise." },
      { priority: "Segurança do operador", weight: 65, trend: "up", description: "People Detection, câmera 360° e E-Fence ganham peso com seguradoras e OSHA." },
      { priority: "TCO de emissões", weight: 60, trend: "stable", description: "SCR-only reduz custos de aftertreatment e downtime, com leitura financeira clara." },
    ],
    gapRelevance: {
      machine_control: { relevance: "CRÍTICA", score: 95, note: "Sem Grade 3D factory-fit, CASE perde bids DOT automaticamente." },
      power_gap: { relevance: "ALTA", score: 80, note: "Gap de 20-35% em potência ainda é percebido em quarry e infraestrutura pesada." },
      cvt_transmission: { relevance: "ALTA", score: 75, note: "CVT virou table stakes em loaders médios e grandes." },
      payload_standard: { relevance: "ALTA", score: 70, note: "Pesagem integrada é exigida em contratos performance-based." },
      scr_only_advantage: { relevance: "FORTE VANTAGEM", score: 85, note: "SCR-only entrega economia anual tangível e precisa ser comunicado melhor." },
      electrification: { relevance: "CRESCENTE", score: 80, note: "580EV e minis EV posicionam a CASE para contratos urbanos premium." },
      display_size: { relevance: "MÉDIA", score: 50, note: "Display maior ajuda, mas não decide a compra sozinho." },
    },
  },
  europe: {
    id: "europe",
    name: "Europa",
    flag: "🇪🇺",
    colorToken: "hsl(267 83% 58%)",
    marketSize: "Tier 1 — Segundo maior mercado",
    annualRevenue: "$38B equipamentos de construção",
    casePresence: "Forte — fábricas na Itália e parcerias compactas via CNH",
    topCompetitors: ["Volvo CE (líder regional)", "Liebherr (#2)", "Caterpillar (#3)", "Komatsu (#4)", "JCB (#5)"],
    demandPriorities: [
      { priority: "Emissões Stage V+ / Zero emission", weight: 95, trend: "up", description: "Eletrificação e zero emission são requisito regulatório, não opcional." },
      { priority: "Tiltrotator e versatilidade", weight: 90, trend: "up", description: "Escandinávia e DACH tratam tiltrotator ready como requisito comercial." },
      { priority: "Machine Control 3D", weight: 85, trend: "up", description: "BIM e integração Leica/Trimble elevam a exigência de precisão de fábrica." },
      { priority: "Compacidade e ruído", weight: 85, trend: "stable", description: "Máquinas silenciosas e compactas ganham preferência em obras urbanas." },
      { priority: "Combustíveis renováveis (HVO/XTL)", weight: 80, trend: "up", description: "Compatibilidade HVO/XTL agrega pontos em compras públicas e rental." },
      { priority: "Segurança avançada", weight: 75, trend: "up", description: "People Detection e radar ganham peso com a diretiva europeia de máquinas." },
      { priority: "Telemática e conectividade", weight: 70, trend: "up", description: "Locadoras exigem diagnósticos remotos e transparência de uptime." },
      { priority: "TCO comprovado", weight: 65, trend: "stable", description: "Rental pesado exige custo previsível e leitura clara de manutenção." },
    ],
    gapRelevance: {
      machine_control: { relevance: "ALTA", score: 85, note: "Importante, embora aftermarket ainda seja aceito em parte do mercado." },
      power_gap: { relevance: "MÉDIA", score: 55, note: "Eficiência pesa mais que potência bruta em boa parte da Europa." },
      cvt_transmission: { relevance: "ALTA", score: 80, note: "Diesel caro aumenta a pressão por CVT/EVT." },
      tiltrotator_ready: { relevance: "CRÍTICA", score: 95, note: "Tiltrotator ready é diferencial direto nas E-Series e precisa ser amplificado." },
      electrification: { relevance: "CRÍTICA", score: 95, note: "Regulação e obra urbana empurram a demanda para elétricos rapidamente." },
      noise_reduction: { relevance: "ALTA", score: 75, note: "Baixo ruído deve entrar como spec e argumento comercial." },
      hvo_compatibility: { relevance: "ALTA", score: 80, note: "Compatibilidade HVO/XTL é diferencial real e pouco comunicado." },
      scr_only_advantage: { relevance: "FORTE VANTAGEM", score: 80, note: "Rental europeu traduz rapidamente SCR-only em TCO." },
    },
  },
  latin_america: {
    id: "latin_america",
    name: "América Latina",
    flag: "🇧🇷",
    colorToken: "hsl(142 71% 45%)",
    marketSize: "Tier 2 — Mercado em crescimento",
    annualRevenue: "$12B equipamentos de construção",
    casePresence: "Forte — fábrica em Piracicaba e rede regional consolidada",
    topCompetitors: ["Caterpillar (líder)", "Komatsu (#2)", "Volvo (#3)", "John Deere (#4)", "SANY/XCMG (crescendo rápido)"],
    demandPriorities: [
      { priority: "Robustez mecânica e durabilidade", weight: 95, trend: "stable", description: "Condições severas favorecem máquinas simples, robustas e confiáveis por 10.000h+." },
      { priority: "Facilidade de manutenção local", weight: 95, trend: "stable", description: "Peças e motores conhecidos localmente pesam mais que feature count." },
      { priority: "Preço competitivo", weight: 90, trend: "up", description: "A pressão chinesa muda a conversa para valor total e suporte." },
      { priority: "Disponibilidade de peças", weight: 90, trend: "stable", description: "Peça indisponível destrói fidelidade e percepção de marca." },
      { priority: "Simplicidade de emissões", weight: 85, trend: "stable", description: "SCR-only é diferencial estrutural em áreas remotas com infraestrutura limitada." },
      { priority: "Financiamento acessível", weight: 85, trend: "up", description: "CNH Capital e linhas subsidiadas alteram resultado comercial real." },
      { priority: "Potência adequada", weight: 60, trend: "stable", description: "Mercado evita pagar premium por potência extra sem retorno operacional claro." },
      { priority: "Machine Control", weight: 30, trend: "stable", description: "A demanda segue muito baixa fora de obras especiais." },
    ],
    gapRelevance: {
      machine_control: { relevance: "BAIXA", score: 20, note: "Grade 3D é irrelevante para a maior parte do mercado LATAM." },
      power_gap: { relevance: "BAIXA", score: 30, note: "O mercado aceita potência suficiente sem pagar premium por sobra de HP." },
      cvt_transmission: { relevance: "BAIXA", score: 25, note: "PowerShift continua bem aceito e mais simples de suportar no campo." },
      scr_only_advantage: { relevance: "VANTAGEM DECISIVA", score: 98, note: "É o maior diferencial da CASE em LATAM e deve liderar a mensagem." },
      price_vs_chinese: { relevance: "CRÍTICA", score: 95, note: "CASE precisa vencer em TCO e suporte, não em preço puro." },
      parts_availability: { relevance: "CRÍTICA", score: 90, note: "Rede de peças é tão estratégica quanto o produto." },
      financing: { relevance: "ALTA", score: 85, note: "Financiamento competitivo fecha muitas vendas mais do que o spec sheet." },
    },
  },
  middle_east_africa: {
    id: "middle_east_africa",
    name: "Oriente Médio & África",
    flag: "🌍",
    colorToken: "hsl(24 95% 53%)",
    marketSize: "Tier 2 — Projetos de megainfraestrutura",
    annualRevenue: "$15B equipamentos de construção",
    casePresence: "Moderada — dealers nos principais hubs do Golfo e África do Sul",
    topCompetitors: ["Caterpillar (dominante)", "Komatsu (#2)", "Volvo (#3)", "JCB (forte em África)", "SANY/XCMG (crescendo)"],
    demandPriorities: [
      { priority: "Durabilidade em calor extremo", weight: 95, trend: "stable", description: "Cooling, proteção UV e vedação fazem diferença direta em contratos do Golfo." },
      { priority: "Filtração de poeira superior", weight: 90, trend: "stable", description: "Poeira fina e areia afetam motor, cabine e uptime; filtragem é tema central." },
      { priority: "Suporte técnico e peças rápidas", weight: 90, trend: "up", description: "Megaprojetos exigem resposta de peças em 48h e uptime altíssimo." },
      { priority: "Capacidade de frota grande", weight: 85, trend: "up", description: "Fleet management e manutenção programada pesam em vendas de grandes lotes." },
      { priority: "Robustez mecânica", weight: 85, trend: "stable", description: "Simplicidade operacional ainda é vista como mitigação de risco." },
      { priority: "Preço competitivo", weight: 80, trend: "up", description: "Pressão chinesa cresce em África e parte do Oriente Médio." },
      { priority: "Machine Control", weight: 60, trend: "up", description: "Megaprojetos começam a exigir mais precisão e OEM-fit escalável." },
    ],
    gapRelevance: {
      machine_control: { relevance: "CRESCENTE", score: 60, note: "Ainda não é universal, mas já aparece em projetos estratégicos." },
      cooling_advantage: { relevance: "FORTE VANTAGEM", score: 90, note: "Mid-Mount Cooling é diferencial técnico real em calor extremo." },
      scr_only_advantage: { relevance: "VANTAGEM", score: 75, note: "Calor e DEF de qualidade variável favorecem soluções mais simples." },
      fleet_management: { relevance: "ALTA", score: 80, note: "Gestão de frotas grandes é ponto em que Cat e Komatsu ainda lideram." },
    },
  },
  asia_pacific: {
    id: "asia_pacific",
    name: "Ásia-Pacífico",
    flag: "🌏",
    colorToken: "hsl(var(--destructive))",
    marketSize: "Tier 1 — Maior volume global",
    annualRevenue: "$65B equipamentos de construção (China = $40B)",
    casePresence: "Limitada — foco em Oceania e mercados premium selecionados",
    topCompetitors: ["Caterpillar (Oceania)", "Komatsu (dominante em Japão/ASEAN)", "SANY (#1 global em volume)", "XCMG (#2)", "Kubota (compactos)"],
    demandPriorities: [
      { priority: "Compacidade para espaços urbanos", weight: 90, trend: "up", description: "Mini e midi dominam cidades densas; zero tail swing é vital." },
      { priority: "Eficiência de combustível", weight: 90, trend: "up", description: "g/kWh é KPI central em vários mercados asiáticos premium." },
      { priority: "Preço", weight: 95, trend: "stable", description: "Pressão chinesa comprime espaço para marcas ocidentais sem oferta de valor clara." },
      { priority: "Durabilidade em condições tropicais", weight: 80, trend: "stable", description: "Umidade, lama e clima tropical exigem vedação e anticorrosão consistentes." },
      { priority: "Eletrificação", weight: 75, trend: "up", description: "Japão, Coreia e Oceania puxam a demanda premium por elétricos." },
      { priority: "Tecnologia integrada", weight: 70, trend: "up", description: "Mercados premium exigem tecnologia competitiva frente a Komatsu e Kobelco." },
    ],
    gapRelevance: {
      compact_range: { relevance: "CRÍTICA", score: 90, note: "CASE precisa amplitude maior de mini/midi para competir com profundidade." },
      price_positioning: { relevance: "CRÍTICA", score: 95, note: "Sem faixa de valor clara, a marca fica espremida entre premium e low-cost." },
      electrification: { relevance: "ALTA em premium", score: 70, note: "Elétricos ajudam em Japão, Coreia e Austrália, não em toda a APAC." },
      fuel_efficiency: { relevance: "ALTA", score: 80, note: "E-Series tem argumento forte de economia e precisa comunicá-lo melhor." },
    },
  },
};

export const roadmapItems: RoadmapItem[] = [
  {
    id: "road-001",
    title: "Pesagem integrada PADRÃO em G-Series",
    description: "Tornar Integrated Payload sistema padrão em toda a linha G Series Wheel Loaders.",
    affectedFamily: "Pás Carregadeiras (G-Series)",
    affectedModels: ["521g", "621g", "721g", "821g", "921g", "1021g", "1121g"],
    subsystem: "implements",
    category: "Feature Parity",
    priority: "critical",
    estimatedCost: "medium",
    estimatedCostRange: "$2-5M",
    developmentTime: "12-18 meses",
    targetModelYear: "MY2027",
    phase: 1,
    currentScore: 80,
    projectedScoreAfter: 90,
    scoreDelta: 10,
    competitorsAddressed: ["Volvo L-Series (pesagem de série)", "Cat Next Gen (Payload padrão)"],
    marketImpact: "Alto — fecha gap em contratos performance-based e reforça proof-of-productivity.",
    regions: ["north_america", "europe", "asia_pacific"],
    status: "proposed",
    dependencies: [],
    riskLevel: "low",
  },
  {
    id: "road-002",
    title: "Display upgrade para 10-12 polegadas",
    description: "Substituir displays atuais por touchscreens maiores e prontos para overlays de Grade/Payload.",
    affectedFamily: "Pás Carregadeiras (G-Series)",
    affectedModels: ["821g", "921g", "1021g", "1121g", "cx300e", "cx380e"],
    subsystem: "cabin",
    category: "Feature Parity",
    priority: "high",
    estimatedCost: "medium",
    estimatedCostRange: "$3-6M",
    developmentTime: "18-24 meses",
    targetModelYear: "MY2027",
    phase: 1,
    currentScore: 83,
    projectedScoreAfter: 89,
    scoreDelta: 6,
    competitorsAddressed: ["Volvo Co-Pilot 12in", "Cat 10in touchscreen"],
    marketImpact: "Médio — melhora leitura de modernidade e prepara Fase 2 de automação.",
    regions: ["north_america", "europe"],
    status: "proposed",
    dependencies: [],
    riskLevel: "low",
  },
  {
    id: "road-003",
    title: "CVT nas carregadeiras médias (821G/921G)",
    description: "Expandir transmissão CVT para os modelos 821G e 921G.",
    affectedFamily: "Pás Carregadeiras (G-Series)",
    affectedModels: ["821g", "921g"],
    subsystem: "transmission",
    category: "Technology Leap",
    priority: "high",
    estimatedCost: "high",
    estimatedCostRange: "$8-15M",
    developmentTime: "24-36 meses",
    targetModelYear: "MY2028",
    phase: 2,
    currentScore: 85,
    projectedScoreAfter: 94,
    scoreDelta: 9,
    competitorsAddressed: ["Cat XE (CVT Electric Drive)", "John Deere X-Tier (EVT)"],
    marketImpact: "Alto — fecha gap de eficiência e payback em loaders médios.",
    regions: ["north_america", "europe", "asia_pacific"],
    status: "proposed",
    dependencies: ["road-002"],
    riskLevel: "medium",
  },
  {
    id: "road-004",
    title: "Grade Assist nativo para E-Series Escavadeiras",
    description: "Desenvolver Grade Assist 2D/3D integrado de fábrica no CIHS existente.",
    affectedFamily: "Escavadeiras (E-Series)",
    affectedModels: ["cx145e", "cx220e", "cx260e", "cx300e", "cx380e"],
    subsystem: "hydraulics",
    category: "Technology Leap",
    priority: "critical",
    estimatedCost: "very_high",
    estimatedCostRange: "$15-25M",
    developmentTime: "24-36 meses",
    targetModelYear: "MY2028",
    phase: 2,
    currentScore: 79,
    projectedScoreAfter: 92,
    scoreDelta: 13,
    competitorsAddressed: ["Cat 336 (Grade+Payload+Swing)", "Komatsu PC360 (iMC 2.0)"],
    marketImpact: "Muito Alto — fecha o gap #1 do portfólio de escavadeiras em NA/EU.",
    regions: ["north_america", "europe", "asia_pacific"],
    status: "proposed",
    dependencies: ["road-002"],
    riskLevel: "medium",
  },
  {
    id: "road-005",
    title: "Potência 270+ hp na 821G Next Gen",
    description: "Elevar a faixa de potência da 821G mantendo SCR-only como diferencial.",
    affectedFamily: "Pás Carregadeiras (G-Series)",
    affectedModels: ["821g"],
    subsystem: "powertrain",
    category: "Performance Upgrade",
    priority: "high",
    estimatedCost: "high",
    estimatedCostRange: "$5-10M",
    developmentTime: "24-30 meses",
    targetModelYear: "MY2028",
    phase: 2,
    currentScore: 88,
    projectedScoreAfter: 94,
    scoreDelta: 6,
    competitorsAddressed: ["Cat 966 XE", "Volvo L180H", "John Deere 744"],
    marketImpact: "Alto — reduz gap percebido em aplicações pesadas e premium NA.",
    regions: ["north_america", "europe", "middle_east_africa"],
    status: "proposed",
    dependencies: [],
    riskLevel: "low",
  },
  {
    id: "road-006",
    title: "People Detection por radar (linha Heavy)",
    description: "Implementar radar 360° de detecção de pessoas/objetos na linha heavy como opção de fábrica.",
    affectedFamily: "Linha Heavy CASE",
    affectedModels: ["821g", "921g", "1021g", "1121g", "cx300e", "cx380e", "2050m"],
    subsystem: "cabin",
    category: "Safety/Regulatory",
    priority: "high",
    estimatedCost: "medium",
    estimatedCostRange: "$4-8M",
    developmentTime: "18-24 meses",
    targetModelYear: "MY2028",
    phase: 2,
    currentScore: 83,
    projectedScoreAfter: 90,
    scoreDelta: 7,
    competitorsAddressed: ["Cat Detect", "Volvo radar collision"],
    marketImpact: "Alto — antecipa exigências regulatórias e fortalece segurança percebida.",
    regions: ["europe", "north_america", "asia_pacific"],
    status: "proposed",
    dependencies: [],
    riskLevel: "low",
  },
  {
    id: "road-007",
    title: "Automação semi-autônoma para M-Series Dozers",
    description: "Desenvolver sistema de controle semi-autônomo de lâmina factory-fit para dozers M-Series.",
    affectedFamily: "Tratores de Esteira (M-Series)",
    affectedModels: ["1150m", "1650m", "2050m"],
    subsystem: "implements",
    category: "Technology Leap",
    priority: "high",
    estimatedCost: "very_high",
    estimatedCostRange: "$10-20M",
    developmentTime: "30-42 meses",
    targetModelYear: "MY2029",
    phase: 3,
    currentScore: 78,
    projectedScoreAfter: 91,
    scoreDelta: 13,
    competitorsAddressed: ["Komatsu D65PXi", "Cat D6 XE", "John Deere 850 P-Tier"],
    marketImpact: "Muito Alto — automação de lâmina define competitividade em dozers premium.",
    regions: ["north_america", "europe", "asia_pacific"],
    status: "proposed",
    dependencies: ["road-004"],
    riskLevel: "high",
  },
  {
    id: "road-008",
    title: "Potência 250-270 hp na 856D Next Gen",
    description: "Incrementar potência e manter articulação frontal, VHP e Hi-eSCR2 como diferenciais.",
    affectedFamily: "Motoniveladoras",
    affectedModels: ["gr935"],
    subsystem: "powertrain",
    category: "Performance Upgrade",
    priority: "high",
    estimatedCost: "medium",
    estimatedCostRange: "$5-8M",
    developmentTime: "18-24 meses",
    targetModelYear: "MY2028",
    phase: 2,
    currentScore: 82,
    projectedScoreAfter: 91,
    scoreDelta: 9,
    competitorsAddressed: ["Cat 140 AWD", "John Deere 672GP"],
    marketImpact: "Alto — reforça leitura de capacidade em road building pesado.",
    regions: ["north_america", "latin_america", "middle_east_africa"],
    status: "proposed",
    dependencies: [],
    riskLevel: "low",
  },
  {
    id: "road-009",
    title: "Bateria 90+ kWh + DC Fast Charging na 580EV",
    description: "Expandir bateria da 580EV e adicionar recarga rápida DC para proteger a liderança em retro elétrica.",
    affectedFamily: "580EV Electric Backhoe Loader",
    affectedModels: ["580ev"],
    subsystem: "powertrain",
    category: "Leadership Protection",
    priority: "high",
    estimatedCost: "high",
    estimatedCostRange: "$8-12M",
    developmentTime: "18-24 meses",
    targetModelYear: "MY2028",
    phase: 2,
    currentScore: 95,
    projectedScoreAfter: 98,
    scoreDelta: 3,
    competitorsAddressed: ["Futuros concorrentes elétricos", "Protótipos JCB/Cat/Deere"],
    marketImpact: "Estratégico — amplia a barreira de entrada antes da concorrência reagir.",
    regions: ["north_america", "europe"],
    status: "proposed",
    dependencies: [],
    riskLevel: "medium",
  },
  {
    id: "road-010",
    title: "Undercarriage premium de série para E-Series",
    description: "Desenvolver ou licenciar undercarriage premium equivalente aos líderes da categoria.",
    affectedFamily: "Escavadeiras (E-Series)",
    affectedModels: ["cx145e", "cx220e", "cx260e", "cx300e", "cx380e"],
    subsystem: "transmission",
    category: "TCO Improvement",
    priority: "medium",
    estimatedCost: "medium",
    estimatedCostRange: "$3-6M",
    developmentTime: "12-18 meses",
    targetModelYear: "MY2027",
    phase: 1,
    currentScore: 85,
    projectedScoreAfter: 91,
    scoreDelta: 6,
    competitorsAddressed: ["Komatsu PLUS", "Cat DuraLink", "Kobelco MaxLife"],
    marketImpact: "Médio-Alto — reduz TCO em mineração e aplicações intensivas.",
    regions: ["north_america", "latin_america", "middle_east_africa", "asia_pacific"],
    status: "proposed",
    dependencies: [],
    riskLevel: "low",
  },
];

const getMachineById = (machineId: string) => caseMachines.find((machine) => machine.id === machineId) ?? null;

export const calculateRegionalFit = (caseProduct: CASEMachine, regionProfile: RegionalProfile) => {
  let score = 75;
  const emissions = caseProduct.subsystems.powertrain.Emissões ?? caseProduct.engine;
  const transmission = caseProduct.transmission ?? caseProduct.subsystems.powertrain.Transmissão ?? "";
  const features = caseProduct.features ?? [];
  const lowerFeatures = features.map((feature) => feature.toLowerCase());

  if (!/dpf/i.test(emissions) && (regionProfile.gapRelevance.scr_only_advantage?.score ?? 0) > 70) score += 10;
  if (caseProduct.electrified && (regionProfile.gapRelevance.electrification?.score ?? 0) > 80) score += 15;
  if (regionProfile.gapRelevance.machine_control?.relevance === "CRÍTICA" && !lowerFeatures.some((feature) => feature.includes("grade") || feature.includes("machine control") || feature.includes("3d"))) score -= 20;
  if ((regionProfile.gapRelevance.price_vs_chinese?.score ?? 0) > 85) score -= 10;
  if (regionProfile.gapRelevance.cvt_transmission?.relevance === "ALTA" && /powershift/i.test(transmission)) score -= 8;
  if (lowerFeatures.some((feature) => feature.includes("mid-mount cooling")) && (regionProfile.gapRelevance.cooling_advantage?.score ?? 0) > 70) score += 8;
  if (lowerFeatures.some((feature) => feature.includes("tiltrotator")) && (regionProfile.gapRelevance.tiltrotator_ready?.score ?? 0) > 80) score += 10;
  if (lowerFeatures.some((feature) => feature.includes("payload")) && (regionProfile.gapRelevance.payload_standard?.score ?? 0) > 65) score += 6;
  if (caseProduct.family.includes("Motoniveladoras") && regionProfile.id === "north_america") score += 4;
  if (caseProduct.electrified && regionProfile.id === "latin_america") score -= 14;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getRegionalFitExplanation = (caseProduct: CASEMachine, regionProfile: RegionalProfile) => {
  const notes: string[] = [];
  const emissions = caseProduct.subsystems.powertrain.Emissões ?? caseProduct.engine;
  if (!/dpf/i.test(emissions) && regionProfile.gapRelevance.scr_only_advantage) notes.push("SCR-only valorizado na região");
  if (caseProduct.electrified && regionProfile.gapRelevance.electrification) notes.push("eletrificação alinhada à demanda local");
  if (/powershift/i.test(caseProduct.transmission) && regionProfile.gapRelevance.cvt_transmission?.relevance === "ALTA") notes.push("PowerShift penalizado frente à demanda por CVT/EVT");
  if ((caseProduct.features ?? []).some((feature) => /machine control|grade|3d/i.test(feature))) notes.push("machine control parcialmente coberto");
  if ((caseProduct.features ?? []).some((feature) => /mid-mount cooling/i.test(feature))) notes.push("vantagem de cooling reconhecida");
  if (!notes.length) notes.push("fit derivado do baseline regional e da arquitetura atual do produto");
  return notes.join(" • ");
};

export const getRegionalRecommendation = (regionId: string) => {
  const profile = regionalProfiles[regionId];
  if (!profile) return [];

  if (regionId === "latin_america") {
    return [
      "Preservar PowerShift e simplicidade diesel como pilares de produto, sem superinvestir em Grade 3D.",
      "Transformar SCR-only, rede de peças e financiamento em narrativa comercial dominante.",
      "Criar ofertas de valor vs. chineses focadas em TCO e disponibilidade, não só em spec sheet.",
    ];
  }

  if (regionId === "europe") {
    return [
      "Acelerar eletrificação e machine control factory-fit para proteger competitividade regulatória.",
      "Comunicar tiltrotator ready, HVO/XTL e baixo ruído como diferenciais centrais.",
      "Preparar safety stack com People Detection antes do próximo ciclo regulatório.",
    ];
  }

  if (regionId === "north_america") {
    return [
      "Grade 3D, payload de série e automação precisam virar prioridade imediata em heavy line.",
      "Usar SCR-only como vantagem econômica comprovável em fleet accounts.",
      "Fechar gap de potência percebida nas loaders médias e motoniveladoras para bids premium.",
    ];
  }

  if (regionId === "middle_east_africa") {
    return [
      "Transformar cooling, filtragem e uptime em linguagem de produto e proposta de valor.",
      "Fortalecer gestão de frotas e suporte rápido para grandes projetos e lotes de máquinas.",
      "Levar machine control em oferta seletiva para megaprojetos, sem complicar a base da região.",
    ];
  }

  return [
    "Reforçar gama compacta e eficiência de combustível para defender espaço premium na região.",
    "Definir posicionamento entre premium tech e value-offer para não ficar comprimido pelos chineses.",
    "Usar E-Series e elétricos compactos como ponta de entrada em mercados premium da APAC.",
  ];
};

export const getRoadmapItemById = (itemId: string) => roadmapItems.find((item) => item.id === itemId) ?? null;

export const getRoadmapItemsByPhase = (phase: 1 | 2 | 3) => roadmapItems.filter((item) => item.phase === phase);

export const parseCostRangeToMillions = (range: string) => {
  const values = range.replace(/\$/g, "").replace(/M/g, "").split("-").map((value) => Number.parseFloat(value.trim()));
  return {
    min: values[0] ?? 0,
    max: values[1] ?? values[0] ?? 0,
  };
};

export const getRoadmapInvestmentSummary = () => {
  const phases: Array<1 | 2 | 3> = [1, 2, 3];
  const summary = phases.map((phase) => {
    const items = getRoadmapItemsByPhase(phase);
    const total = items.reduce((acc, item) => {
      const range = parseCostRangeToMillions(item.estimatedCostRange);
      return { min: acc.min + range.min, max: acc.max + range.max };
    }, { min: 0, max: 0 });

    return { phase, items, total };
  });

  const total = summary.reduce((acc, phase) => ({ min: acc.min + phase.total.min, max: acc.max + phase.total.max }), { min: 0, max: 0 });
  return { summary, total };
};

export const getRoadmapImpactSeries = () => {
  const averageCurrentScore = Math.round(roadmapItems.reduce((acc, item) => acc + item.currentScore, 0) / roadmapItems.length);
  const phase1Delta = getRoadmapItemsByPhase(1).reduce((acc, item) => acc + item.scoreDelta, 0);
  const phase2Delta = getRoadmapItemsByPhase(2).reduce((acc, item) => acc + item.scoreDelta, 0);
  const phase3Delta = getRoadmapItemsByPhase(3).reduce((acc, item) => acc + item.scoreDelta, 0);

  return [
    { label: "Atual", score: averageCurrentScore, competitor: 90 },
    { label: "Após Fase 1", score: Math.min(100, averageCurrentScore + Math.round(phase1Delta / 6)), competitor: 90 },
    { label: "Após Fase 2", score: Math.min(100, averageCurrentScore + Math.round((phase1Delta + phase2Delta) / 6)), competitor: 90 },
    { label: "Após Fase 3", score: Math.min(100, averageCurrentScore + Math.round((phase1Delta + phase2Delta + phase3Delta) / 6)), competitor: 90 },
  ];
};

export const getRoadmapAffectedMachines = (item: RoadmapItem) => item.affectedModels.map(getMachineById).filter((machine): machine is CASEMachine => Boolean(machine));

export interface CompetitiveTrajectoryMilestone {
  year: number;
  event: string;
  subsystem: EngineeringSubsystemKey;
  impact: "high" | "medium" | "low";
}

export interface CompetitiveTrajectoryProjection {
  year: string;
  prediction: string;
  confidence: "Alta" | "Média" | "Baixa";
  subsystem: EngineeringSubsystemKey;
}

export interface CompetitiveTrajectory {
  brand: string;
  color: string;
  overallDirection: string;
  innovationSpeed: string;
  innovationSpeedScore: number;
  yearlyMilestones: CompetitiveTrajectoryMilestone[];
  projectedNextMoves: CompetitiveTrajectoryProjection[];
  threatLevel: string;
  caseGapTrend: string;
}

export interface PortfolioPrioritizationFamily {
  family: string;
  annualVolume: number;
  volumeRank: number;
  avgMarginPerUnit: number;
  totalMarginContribution: number;
  gapSeverity: number;
  gapSeverityLabel: string;
  topGaps: string[];
  investmentNeeded: string;
  projectedShareGain: string;
  roi: string;
  priorityScore: number;
  regions: string[];
}

export interface PortfolioPrioritizationData {
  investmentBudget: string;
  families: PortfolioPrioritizationFamily[];
}

export type FieldReportType = "win" | "loss" | "feedback";
export type FieldReportPrimaryReason = "price" | "feature_technical" | "availability" | "support" | "financing" | "relationship" | "other";

export interface FieldReport {
  id: string;
  type: FieldReportType;
  product: string;
  region: string;
  client?: string;
  lostTo?: string;
  lostToBrand?: string;
  wonAgainst?: string;
  wonAgainstBrand?: string;
  primaryReason?: FieldReportPrimaryReason;
  featureMissing?: string | null;
  decisiveFeature?: string;
  proposalValue?: number;
  comment: string;
  date: string;
}

export const competitiveTrajectories: CompetitiveTrajectory[] = [
  {
    brand: "Caterpillar",
    color: "hsl(45 100% 55%)",
    overallDirection: "Automação + Digital",
    innovationSpeed: "Agressiva",
    innovationSpeedScore: 95,
    yearlyMilestones: [
      { year: 2018, event: "Grade Assist lançado em escavadeiras Next Gen", subsystem: "hydraulics", impact: "high" },
      { year: 2019, event: "Payload integrado como PADRÃO em loaders Next Gen", subsystem: "implements", impact: "high" },
      { year: 2020, event: "Cat Detect (People Detection) lançado", subsystem: "cabin", impact: "high" },
      { year: 2021, event: "Autodig padronizado em loaders", subsystem: "implements", impact: "high" },
      { year: 2022, event: "Cat MineStar Edge para automação de mina", subsystem: "hydraulics", impact: "medium" },
      { year: 2023, event: "CVT Electric Drive expandido para 966/972", subsystem: "transmission", impact: "high" },
      { year: 2024, event: "Swing Assist padronizado em escavadeiras", subsystem: "hydraulics", impact: "high" },
      { year: 2025, event: "Remote control factory-fit anunciado para dozers", subsystem: "cabin", impact: "high" },
      { year: 2026, event: "Advansys IoT bucket tips em produção", subsystem: "implements", impact: "medium" },
    ],
    projectedNextMoves: [
      { year: "2027", prediction: "Automação de ciclo completo em loaders", confidence: "Alta", subsystem: "hydraulics" },
      { year: "2028", prediction: "Escavadeira totalmente elétrica classe 20-30 ton", confidence: "Média", subsystem: "powertrain" },
      { year: "2029", prediction: "Fleet-level AI optimization", confidence: "Média", subsystem: "cabin" },
    ],
    threatLevel: "MÁXIMA",
    caseGapTrend: "AUMENTANDO — Cat inova 1.5-2 features/ano vs. CASE 0.5-1 feature/ano.",
  },
  {
    brand: "Komatsu",
    color: "hsl(210 100% 20%)",
    overallDirection: "Automação semi-autônoma + Eficiência",
    innovationSpeed: "Agressiva em automação",
    innovationSpeedScore: 90,
    yearlyMilestones: [
      { year: 2016, event: "iMC 1.0 lançado", subsystem: "hydraulics", impact: "high" },
      { year: 2018, event: "Proactive Dozing Control em dozers", subsystem: "implements", impact: "high" },
      { year: 2020, event: "iMC 2.0 com cylinder stroke sensing", subsystem: "hydraulics", impact: "high" },
      { year: 2021, event: "Undercarriage PLUS padronizado", subsystem: "transmission", impact: "medium" },
      { year: 2022, event: "Smart Construction Dashboard", subsystem: "cabin", impact: "medium" },
      { year: 2023, event: "Tilt Steering Control em dozers", subsystem: "implements", impact: "high" },
      { year: 2024, event: "Power Max boost em escavadeiras", subsystem: "powertrain", impact: "medium" },
      { year: 2025, event: "Autonomous haulage system expanded", subsystem: "cabin", impact: "high" },
    ],
    projectedNextMoves: [
      { year: "2027", prediction: "iMC 3.0 com AI-assisted digging", confidence: "Alta", subsystem: "hydraulics" },
      { year: "2028", prediction: "Escavadeira híbrida com swing energy recovery", confidence: "Alta", subsystem: "powertrain" },
      { year: "2029", prediction: "Remote operation center para construção", confidence: "Média", subsystem: "cabin" },
    ],
    threatLevel: "ALTA",
    caseGapTrend: "AUMENTANDO — iMC mantém a Komatsu 6+ anos à frente em automação embarcada.",
  },
  {
    brand: "Volvo CE",
    color: "hsl(221 100% 18%)",
    overallDirection: "Eletrificação + Ergonomia + Sustentabilidade",
    innovationSpeed: "Agressiva em eletrificação",
    innovationSpeedScore: 85,
    yearlyMilestones: [
      { year: 2019, event: "ECR25 Electric lançada", subsystem: "powertrain", impact: "high" },
      { year: 2020, event: "Co-Pilot 12in display padronizado", subsystem: "cabin", impact: "high" },
      { year: 2020, event: "Pesagem de série em toda linha H loaders", subsystem: "implements", impact: "high" },
      { year: 2021, event: "L25 Electric compact wheel loader", subsystem: "powertrain", impact: "high" },
      { year: 2022, event: "ActiveCare Direct telemática premium", subsystem: "cabin", impact: "medium" },
      { year: 2023, event: "Boom Suspension System padronizado", subsystem: "hydraulics", impact: "medium" },
      { year: 2024, event: "OptiShift 2ª gen em loaders", subsystem: "transmission", impact: "medium" },
      { year: 2025, event: "EC230 Electric e EC300 Hybrid anunciados", subsystem: "powertrain", impact: "high" },
    ],
    projectedNextMoves: [
      { year: "2027", prediction: "Loader médio 100% elétrico na classe L120", confidence: "Alta", subsystem: "powertrain" },
      { year: "2028", prediction: "Escavadeira 30t híbrida de produção", confidence: "Alta", subsystem: "powertrain" },
      { year: "2029", prediction: "Battery-as-a-Service para construction EV", confidence: "Média", subsystem: "powertrain" },
    ],
    threatLevel: "ALTA",
    caseGapTrend: "AUMENTANDO — CASE lidera em amplitude EV, mas Volvo acelera nas classes mais pesadas.",
  },
  {
    brand: "John Deere",
    color: "hsl(101 40% 35%)",
    overallDirection: "Transmissão avançada + Automação de solo",
    innovationSpeed: "Moderada-Alta",
    innovationSpeedScore: 80,
    yearlyMilestones: [
      { year: 2018, event: "SmartGrade 3D sem mastros em dozers", subsystem: "implements", impact: "high" },
      { year: 2019, event: "EVT em loaders", subsystem: "transmission", impact: "high" },
      { year: 2020, event: "EZ Grade padronizado em dozers", subsystem: "implements", impact: "medium" },
      { year: 2021, event: "P-Tier com performance upgrades", subsystem: "powertrain", impact: "medium" },
      { year: 2022, event: "Pile Slip Assist em loaders", subsystem: "implements", impact: "medium" },
      { year: 2023, event: "333G com SmartGrade 3D + DozerMode", subsystem: "implements", impact: "high" },
      { year: 2024, event: "Advanced Obstacle Detection", subsystem: "cabin", impact: "medium" },
      { year: 2025, event: "Automation Suite expandida para graders", subsystem: "implements", impact: "high" },
    ],
    projectedNextMoves: [
      { year: "2027", prediction: "EVT expandida para escavadeiras híbridas", confidence: "Média", subsystem: "powertrain" },
      { year: "2028", prediction: "Autonomous grading para aplicações municipais", confidence: "Média", subsystem: "cabin" },
      { year: "2028", prediction: "SmartGrade sem mastros em escavadeiras", confidence: "Alta", subsystem: "implements" },
    ],
    threatLevel: "ALTA",
    caseGapTrend: "AUMENTANDO — Deere segue forte em transmissão e automação de solo.",
  },
  {
    brand: "SANY / Chinesas",
    color: "hsl(var(--destructive))",
    overallDirection: "Volume + Preço + Eletrificação rápida",
    innovationSpeed: "Extremamente rápida em volume e EV",
    innovationSpeedScore: 75,
    yearlyMilestones: [
      { year: 2020, event: "SANY ultrapassa Cat em volume de escavadeiras", subsystem: "structure", impact: "high" },
      { year: 2021, event: "SY215E Electric lançada", subsystem: "powertrain", impact: "high" },
      { year: 2022, event: "XCMG XE215E Electric com frotas entregues", subsystem: "powertrain", impact: "high" },
      { year: 2023, event: "Rede cresce em LATAM e Sudeste Asiático", subsystem: "structure", impact: "high" },
      { year: 2024, event: "Preço 40-50% abaixo dos OEMs ocidentais", subsystem: "structure", impact: "high" },
      { year: 2025, event: "Elétricos Stage V em produção para Europa", subsystem: "powertrain", impact: "medium" },
    ],
    projectedNextMoves: [
      { year: "2027", prediction: "Entrada agressiva em NA com preços disruptivos", confidence: "Alta", subsystem: "structure" },
      { year: "2028", prediction: "Machine control integrado de fábrica", confidence: "Média", subsystem: "hydraulics" },
      { year: "2029", prediction: "Escavadeiras elétricas 30-50t em mercados regulados", confidence: "Alta", subsystem: "powertrain" },
    ],
    threatLevel: "CRESCENTE RÁPIDO",
    caseGapTrend: "AUMENTANDO — a ameaça principal é preço + volume, com qualidade tecnológica se aproximando rapidamente.",
  },
];

export const portfolioPrioritization: PortfolioPrioritizationData = {
  investmentBudget: "$50-100M (ciclo de produto 2027-2029)",
  families: [
    {
      family: "G Series Wheel Loaders",
      annualVolume: 4500,
      volumeRank: 1,
      avgMarginPerUnit: 28000,
      totalMarginContribution: 126000000,
      gapSeverity: 72,
      gapSeverityLabel: "Moderado-Alto",
      topGaps: ["CVT em modelos médios", "Pesagem padrão", "Potência 821G"],
      investmentNeeded: "$18-36M",
      projectedShareGain: "+3-5%",
      roi: "Alto",
      priorityScore: 92,
      regions: ["north_america", "europe", "latin_america"],
    },
    {
      family: "E Series Excavators - Full Size",
      annualVolume: 2800,
      volumeRank: 2,
      avgMarginPerUnit: 35000,
      totalMarginContribution: 98000000,
      gapSeverity: 85,
      gapSeverityLabel: "Alto — Machine Control é gap crítico",
      topGaps: ["Grade Assist factory-fit", "Pesagem padrão", "Undercarriage premium"],
      investmentNeeded: "$18-31M",
      projectedShareGain: "+5-8%",
      roi: "Muito Alto",
      priorityScore: 95,
      regions: ["north_america", "europe", "asia_pacific"],
    },
    {
      family: "M Series Crawler Dozers",
      annualVolume: 1800,
      volumeRank: 3,
      avgMarginPerUnit: 22000,
      totalMarginContribution: 39600000,
      gapSeverity: 78,
      gapSeverityLabel: "Alto — Automação de lâmina",
      topGaps: ["Automação semi-autônoma factory-fit", "Grade 3D integrado"],
      investmentNeeded: "$10-20M",
      projectedShareGain: "+3-5%",
      roi: "Médio-Alto",
      priorityScore: 78,
      regions: ["north_america", "europe"],
    },
    {
      family: "N Series / SV Backhoe Loaders",
      annualVolume: 6000,
      volumeRank: 1,
      avgMarginPerUnit: 12000,
      totalMarginContribution: 72000000,
      gapSeverity: 45,
      gapSeverityLabel: "Baixo-Moderado — SCR-only e PowerDrive são vantagens",
      topGaps: ["Velocidade de deslocamento"],
      investmentNeeded: "$3-6M",
      projectedShareGain: "+1-2%",
      roi: "Alto (baixo investimento)",
      priorityScore: 70,
      regions: ["north_america", "latin_america", "middle_east_africa"],
    },
    {
      family: "D Series Motor Graders",
      annualVolume: 800,
      volumeRank: 5,
      avgMarginPerUnit: 30000,
      totalMarginContribution: 24000000,
      gapSeverity: 75,
      gapSeverityLabel: "Alto — Potência e Grade Control",
      topGaps: ["Potência 250-270hp", "Grade 3D factory-fit", "Joystick steering"],
      investmentNeeded: "$10-16M",
      projectedShareGain: "+3-5%",
      roi: "Médio",
      priorityScore: 68,
      regions: ["north_america", "latin_america", "middle_east_africa"],
    },
    {
      family: "580EV Electric Backhoe",
      annualVolume: 200,
      volumeRank: 8,
      avgMarginPerUnit: 45000,
      totalMarginContribution: 9000000,
      gapSeverity: 10,
      gapSeverityLabel: "Mínimo — líder absoluto",
      topGaps: ["Bateria 90+ kWh", "DC Fast Charging"],
      investmentNeeded: "$8-12M",
      projectedShareGain: "N/A — proteger liderança",
      roi: "Estratégico",
      priorityScore: 75,
      regions: ["north_america", "europe"],
    },
    {
      family: "B Series Skid Steers + CTLs",
      annualVolume: 5500,
      volumeRank: 1,
      avgMarginPerUnit: 8000,
      totalMarginContribution: 44000000,
      gapSeverity: 55,
      gapSeverityLabel: "Moderado — Auto Ride Control e EH são vantagens",
      topGaps: ["SmartGrade em CTLs", "Auto-leveling avançado"],
      investmentNeeded: "$5-10M",
      projectedShareGain: "+2-3%",
      roi: "Alto (alto volume)",
      priorityScore: 82,
      regions: ["north_america", "europe", "latin_america"],
    },
  ],
};

export const fieldReportPresets: FieldReport[] = [
  {
    id: "fr-001",
    type: "loss",
    product: "CASE 821G",
    region: "north_america",
    lostTo: "Cat 966 XE",
    lostToBrand: "Caterpillar",
    primaryReason: "feature_technical",
    featureMissing: "Payload integrado de série e CVT",
    comment: "Cliente enterprise padronizou Cat pela pesagem integrada + CVT. Payload opcional da CASE não era suficiente.",
    proposalValue: 285000,
    date: "2026-02-15",
  },
  {
    id: "fr-002",
    type: "win",
    product: "CASE 580EV",
    region: "north_america",
    wonAgainst: "Cat 430 diesel",
    wonAgainstBrand: "Caterpillar",
    decisiveFeature: "Zero emissões em contrato municipal urbano — 580EV era a única opção.",
    comment: "Cliente nunca teria considerado CASE se não fosse a 580EV. Abriu porta para o restante da frota.",
    proposalValue: 195000,
    date: "2026-01-22",
  },
  {
    id: "fr-003",
    type: "loss",
    product: "CASE CX300E",
    region: "north_america",
    lostTo: "Komatsu PC360LC-11",
    lostToBrand: "Komatsu",
    primaryReason: "feature_technical",
    featureMissing: "iMC 2.0 — machine control semi-automático de fábrica",
    comment: "Licitação DOT exigia machine control integrado de fábrica. OEM-Fit Leica não foi aceito.",
    proposalValue: 1200000,
    date: "2026-02-28",
  },
  {
    id: "fr-004",
    type: "loss",
    product: "CASE 521G",
    region: "latin_america",
    lostTo: "SANY SY956H",
    lostToBrand: "SANY",
    primaryReason: "price",
    comment: "SANY ofereceu preço 45% inferior com financiamento chinês. Faltou narrativa de TCO forte o suficiente.",
    proposalValue: 520000,
    date: "2026-03-01",
  },
  {
    id: "fr-005",
    type: "win",
    product: "CASE 2050M",
    region: "north_america",
    wonAgainst: "Komatsu D65PXi-18",
    wonAgainstBrand: "Komatsu",
    decisiveFeature: "Drawbar pull líder + cabine pressurizada positiva + SALT track.",
    comment: "Cabine pressurizada positiva deveria ser bullet principal do material de vendas.",
    proposalValue: 380000,
    date: "2026-02-10",
  },
  {
    id: "fr-006",
    type: "loss",
    product: "CASE GR935",
    region: "north_america",
    lostTo: "Cat 140 AWD",
    lostToBrand: "Caterpillar",
    primaryReason: "feature_technical",
    featureMissing: "Potência insuficiente vs. 270 hp da Cat para corte pesado",
    comment: "Operador disse que a máquina não tem força para corte em material compactado. Articulação frontal agradou, mas potência matou o deal.",
    proposalValue: 340000,
    date: "2026-01-30",
  },
  {
    id: "fr-007",
    type: "feedback",
    product: "CASE TV620B",
    region: "north_america",
    featureMissing: "SmartGrade / Grade Control factory-fit para CTL",
    comment: "Cliente ama o TV620B, mas quer SmartGrade igual o Deere 333G e pagaria adicional por isso.",
    date: "2026-03-05",
  },
  {
    id: "fr-008",
    type: "win",
    product: "CASE 590SN",
    region: "latin_america",
    wonAgainst: "JCB 3CX",
    wonAgainstBrand: "JCB",
    decisiveFeature: "PowerDrive H + proximidade da rede CASE em região remota.",
    comment: "Disponibilidade de dealer fez mais diferença que a máquina em si. Rede CNH em LATAM é vantagem real.",
    proposalValue: 145000,
    date: "2026-02-20",
  },
];
