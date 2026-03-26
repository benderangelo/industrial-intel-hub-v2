import type { EngineeringSubsystemKey } from "@/data/caseData";

export type ComponentSpecValue = string | Record<string, string>;

export interface ComponentNode {
  id: string;
  icon: string;
  name: string;
  description: string;
  publicSpecs: Record<string, ComponentSpecValue>;
  internalSpecs: Record<string, string>;
  competitorComparison: Record<string, string>;
  improvementOpportunities: string[];
}

export interface ComponentSubsystemTree {
  label: string;
  components: ComponentNode[];
}

export const componentTree: Partial<Record<EngineeringSubsystemKey, ComponentSubsystemTree>> = {
  structure: {
    label: "Estrutura / Chassi",
    components: [
      {
        id: "str-frame",
        icon: "🧱",
        name: "Frame principal / Chassi",
        description: "Estrutura soldada de aço que suporta todos os componentes. Define geometria, peso e rigidez da máquina.",
        publicSpecs: {
          material: "Aço estrutural de alta resistência",
          welding: "Soldagem robotizada contínua (padrão indústria)",
          weight_contribution: "25-35% do peso operacional total",
        },
        internalSpecs: {
          steel_grade: "[CARREGAR DADO INTERNO: especificação do aço — ex: ASTM A572 Gr.50]",
          plate_thickness_mm: "[CARREGAR: espessura por zona — ex: underframe 20mm, towers 25mm]",
          weld_standard: "[CARREGAR: padrão de solda — ex: AWS D14.3]",
          fea_validated: "[CARREGAR: sim/não e data da última análise FEA]",
          fatigue_life_cycles: "[CARREGAR: ciclos de fadiga projetados]",
        },
        competitorComparison: {
          Cat: "Frame Cat utiliza aço T-1 com stress-relief em pontos críticos. FEA publicada para 20.000h de vida útil. Chassis Next Gen redesenhado em 2019 para acomodar Grade/Payload.",
          Komatsu: "Frame com proteção integral de undercarriage. Espessura maior em pontos de impacto. Certificação Komatsu para 25.000h.",
          Volvo: "Frame otimizado para serviceability — cabine inclinável 30°/70° requer pontos de articulação específicos no chassi.",
          "John Deere": "Frame com Quad-Cool compartments separados — cada trocador tem espaço isolado no chassi.",
        },
        improvementOpportunities: [
          "Avaliar aço de ultra-alta resistência (UHSS) para reduzir peso mantendo rigidez — economia de 200-400 kg permitiria contrapeso mais modular",
          "Pontos de montagem pré-preparados para sensores de Grade Control — evita furação aftermarket que compromete integridade estrutural",
          "Proteção inferior de motor/hidráulica como item padrão (Volvo já oferece)",
        ],
      },
      {
        id: "str-counterweight",
        icon: "⚖️",
        name: "Contrapeso",
        description: "Massa posicionada para equilibrar a máquina durante operação com carga. Crítico para estabilidade e capacidade de elevação.",
        publicSpecs: {
          material: "Ferro fundido ou aço soldado preenchido com concreto/chumbo",
          adjustability: "CASE: bolt-on configuration. Cat 966: quick-change hydraulic system",
          weight_range: "Varia por modelo — 821G: ~3.500-5.000 kg de contrapeso",
        },
        internalSpecs: {
          exact_weight_kg: "[CARREGAR]",
          mounting_method: "[CARREGAR: bolt-on / pin / quick-release]",
          configurations_available: "[CARREGAR: padrão, heavy, material handler]",
        },
        competitorComparison: {
          Cat: "Quick-change counterweight system — troca em campo sem guindaste. Múltiplas configurações por modelo. Benchmark em modularidade.",
          DEVELON: "Contrapeso hidraulicamente removível em escavadeiras — cilindro integrado para remoção sem guindaste.",
        },
        improvementOpportunities: [
          "Sistema quick-change similar ao Cat — reduz tempo de reconfiguração de 4h (guindaste) para 20min",
          "Contrapeso modular segmentado — adicionar/remover seções de 500kg para ajuste fino",
        ],
      },
      {
        id: "str-undercarriage",
        icon: "🛞",
        name: "Trem de rolamento / Undercarriage",
        description: "Sistema de esteiras, roletes, sapatas, tensionador e drive final. Representa 30-50% do custo de manutenção em máquinas de esteira.",
        publicSpecs: {
          case_type: "M-Series: SALT (Sealed And Lubricated Track). E-Series: convencional com vedação.",
          competitors_premium: "Komatsu PLUS: +40% vida útil. Cat DuraLink: +20% vida útil. Kobelco MaxLife.",
          case_advantage: "SALT na M-Series é competitivo — vedação permanente similar a Cat. E-Series usa convencional.",
        },
        internalSpecs: {
          roller_type: "[CARREGAR: sealed/greased/lifetime-lubed]",
          track_link_pitch_mm: "[CARREGAR]",
          shoe_width_options_mm: "[CARREGAR]",
          idler_type: "[CARREGAR]",
          projected_life_hours: "[CARREGAR: vida projetada em horas]",
        },
        competitorComparison: {
          Komatsu: "Undercarriage PLUS como PADRÃO: roletes sealed-for-life, elos com dureza superficial 58-62 HRC, vida +40%. Benchmark absoluto.",
          Cat: "DuraLink HDXL: links com perfil otimizado, pins e bushings com tratamento criogênico, +20% vida. Opção, não padrão.",
          Kobelco: "MaxLife: tratamento térmico proprietário. Competitivo com DuraLink.",
        },
        improvementOpportunities: [
          "[PRIORIDADE ALTA] Desenvolver ou licenciar undercarriage premium para E-Series — diferença de 20-40% de vida é diretamente TCO",
          "Expandir SALT da M-Series para E-Series escavadeiras",
          "Oferecer undercarriage reforçado para demolição como opção de fábrica",
        ],
      },
    ],
  },
  powertrain: {
    label: "Powertrain (Motor)",
    components: [
      {
        id: "pwr-engine",
        icon: "⚙️",
        name: "Motor diesel / Bloco de motor",
        description: "Unidade de potência primária. CASE utiliza motores FPT Industrial (grupo CNH) e Isuzu (parceria).",
        publicSpecs: {
          case_suppliers: "FPT Industrial (maioria do portfólio) + Isuzu (D-Series excavators) + Cummins (wheeled excavators) + Kubota (mini/compact)",
          displacement_range: "0.9L (mini) a 12.9L (CX750D)",
          fuel_injection: "Common rail direct injection (todos os modelos Tier 4+)",
          turbo: "Turbo wastegate (modelos menores) / VGT (modelos maiores)",
        },
        internalSpecs: {
          bore_stroke_mm: "[CARREGAR por modelo]",
          compression_ratio: "[CARREGAR]",
          injection_pressure_bar: "[CARREGAR]",
          turbo_model: "[CARREGAR — ex: BorgWarner S200]",
          engine_management_ecu: "[CARREGAR — ex: FPT electronic governor + Bosch EDC17]",
        },
        competitorComparison: {
          Cat: "Motor C7.1/C9.3/C13 ACERT proprietários. Integração vertical total motor-máquina. Auto Engine Speed patenteado.",
          Komatsu: "Motor 100% proprietário. SAA6D série. SmartLoader Logic integrado ao firmware do motor.",
          Volvo: "Motor D-series proprietário. Integração profunda com transmissão OptiShift.",
          "John Deere": "Motor PowerTech PSS proprietário. Integrado com EVT (componente elétrico conversa direto com ECU do motor).",
        },
        improvementOpportunities: [
          "Explorar turbo VGT em modelos médios (821G) para mais torque em RPM baixa sem aumento de consumo",
          "Avaliar motor de 2 estágios de turbo para fechar gap de potência mantendo cilindrada",
          "Co-desenvolver com FPT calibração específica para HVO/XTL (hoje é 'compatível' — deveria ser 'otimizado para')",
        ],
      },
      {
        id: "pwr-aftertreatment",
        icon: "🧪",
        name: "Sistema de pós-tratamento de emissões",
        description: "Componentes que tratam gases de escape para atender regulamentações. A CASE diferencia-se por SCR-only (sem DPF) na maioria do portfólio.",
        publicSpecs: {
          case_strategy: "SCR-only (sem DPF) na maioria do portfólio — VANTAGEM COMPETITIVA PRINCIPAL. Zero regeneração, menor manutenção, menor consumo de DEF.",
          case_solutions_by_family: {
            "G-Series Loaders": "DOC + SCRoF (sem DPF)",
            "E-Series Excavators": "DOC + SCRoF ou CEGR + DOC + SCR (sem DPF)",
            "M-Series Dozers": "DOC + SCR (menores) ou CEGR + DOC (650M — zero DEF)",
            "D-Series Graders": "DOC + SCRoF — Hi-eSCR2 (HVO/XTL compatível)",
            "N-Series Backhoes": "CEGR + SCR (sem DPF, sem EGR nos maiores)",
            "580EV": "Zero emissões (elétrico)",
          },
          competitor_comparison: "Cat: DOC+DPF+SCR (todos). Komatsu: KDPF+SCR. Volvo: DOC+DPF+SCR. JD: DOC+DPF+SCR (exceto backhoes). Kobelco: SCR-only em variantes selecionadas.",
          tco_advantage: "Estimativa de saving $4.000-6.000/ano por máquina vs. sistemas com DPF (eliminação de: filtro DPF, regeneração, downtime de regen, DEF extra)",
        },
        internalSpecs: {
          scr_catalyst_supplier: "[CARREGAR — ex: Johnson Matthey / BASF]",
          doc_catalyst_supplier: "[CARREGAR]",
          def_consumption_rate: "[CARREGAR — L/h por modelo]",
          scr_conversion_efficiency: "[CARREGAR — % de conversão NOx]",
          system_weight_kg: "[CARREGAR]",
        },
        competitorComparison: {
          Cat: "DPF+DOC+SCR. Regeneração automática na maioria. Tempo perdido para regen: ~1-2% do ciclo operacional. Custo de DPF replacement: $3.000-8.000 a cada 5.000-10.000h.",
          Komatsu: "KDPF proprietário + SCR. Regeneração automática com KDPF que requer menos manutenção que DPF convencional. Mas ainda é DPF.",
          Volvo: "DPF+DOC+SCR. Regeneração automática. Volvo oferece contrato de manutenção que inclui DPF — dilui custo para o cliente mas não elimina.",
          Kobelco: "SCR-only em variantes selecionadas (SK350 etc.) — filosofia similar à CASE. Potencial aliado narrativo.",
        },
        improvementOpportunities: [
          "PROTEGER esta vantagem — não ceder à tentação de adicionar DPF para ganhar mais potência. SCR-only é O diferencial de TCO.",
          "Comunicar melhor: criar calculadora de TCO no material de vendas que quantifica o saving anual",
          "Expandir Hi-eSCR2 (HVO/XTL compatible) para mais famílias além de graders",
          "Avaliar DOC catalítico de nova geração para reduzir tamanho/peso do sistema mantendo eficiência",
        ],
      },
      {
        id: "pwr-cooling",
        icon: "❄️",
        name: "Sistema de arrefecimento",
        description: "Radiadores, intercoolers, oil coolers, ventilador e circuito de coolant.",
        publicSpecs: {
          case_exclusive: "Mid-Mount Cooling nos G-Series Wheel Loaders — radiador posicionado atrás da cabine em vez de na frente. Reduz ingestão de detritos, protege radiador de impactos frontais, melhora visibilidade.",
          competitor_benchmark: "Cat: Side-by-side cooling com auto-reversing fan. JD: Quad-Cool (4 coolers independentes isolados). Komatsu: Auto-reversing fan com intervalos programáveis.",
        },
        internalSpecs: {
          radiator_capacity_l: "[CARREGAR]",
          fan_type: "[CARREGAR — fixed/variable/hydraulic/electric]",
          fan_diameter_mm: "[CARREGAR]",
          auto_reversing: "[CARREGAR — sim/não, intervalos]",
          ambient_rating_celsius: "[CARREGAR — temperatura máxima de operação]",
        },
        competitorComparison: {
          Cat: "Side-by-side cooling convencional com auto-reversing fan. Eficiente mas sem proteção frontal de impacto.",
          "John Deere": "Quad-Cool — cada trocador de calor é separado e isolado. Sem contaminação cruzada. Benchmark em serviceability de cooling.",
          Komatsu: "Auto-reversing fan com intervalos programáveis pelo operador. Layout convencional frontal.",
        },
        improvementOpportunities: [
          "Mid-Mount Cooling é vantagem real — expandir comunicação como diferencial em mercados quentes (MEA, LATAM interior)",
          "Avaliar fan com acionamento elétrico (e-fan) para consumo variável baseado em temperatura real",
          "Considerar Quad-Cool concept (JD) para próxima geração — cada cooler independente facilita manutenção",
        ],
      },
    ],
  },
  hydraulics: {
    label: "Hidráulica",
    components: [
      {
        id: "hyd-mainpump",
        icon: "🫧",
        name: "Bomba(s) hidráulica(s) principal(is)",
        description: "Bomba(s) de deslocamento variável que alimentam os circuitos de trabalho. Define vazão, pressão e responsividade da máquina.",
        publicSpecs: {
          case_excavators: "CIHS (CASE Intelligent Hydraulics System) com 4 subsistemas: Boom Economy, Swing Priority, Spool Stroke Control, Auto Idle.",
          case_loaders: "Centro aberto convencional com 2 modos de potência (Max / Smart Max).",
          pump_type: "Pistões axiais de deslocamento variável (padrão indústria)",
        },
        internalSpecs: {
          pump_manufacturer: "[CARREGAR — ex: Rexroth A10VO / Kawasaki K3V / Eaton]",
          displacement_cc_rev: "[CARREGAR por modelo]",
          max_pressure_bar: "[CARREGAR]",
          max_flow_lpm: "[CARREGAR]",
          control_type: "[CARREGAR — electronic/load-sensing/pressure-compensated]",
        },
        competitorComparison: {
          Cat: "Electrohydraulic Implement System — controle eletrônico direto das bombas com resposta 0.3s mais rápida que convencional. Load-sensing em loaders Next Gen.",
          Komatsu: "CLSS (Closed-center Load Sensing) — vazão proporcional ao esforço real. 8% mais eficiente que centro aberto.",
          Volvo: "Sistema eletro-hidráulico positivo com flow sharing entre circuitos.",
          Kobelco: "Bomba-to-arm regeneration exclusiva — recicla óleo do abaixamento do boom para estender o arm.",
        },
        improvementOpportunities: [
          "[PRIORIDADE ALTA] Migrar loaders G-Series de centro aberto para load-sensing — economia de 8-12% em consumo hidráulico",
          "Integrar sensores de pressão em tempo real para detecção preditiva de desgaste de bomba (telemática)",
          "Avaliar bomba digital (switched inertance) para próxima geração — Caterpillar investe em bomba digital desde 2020",
        ],
      },
      {
        id: "hyd-valves",
        icon: "🧭",
        name: "Bloco de válvulas / Distributeur",
        description: "Válvulas de controle direcional que distribuem fluxo hidráulico para os atuadores (cilindros, motores).",
        publicSpecs: {
          case_excavators: "Válvulas proporcionais com controle de Spool Stroke (SSC). Até 10 presets de acessórios.",
          case_loaders: "Válvulas de controle padrão com return-to-dig e return-to-carry programáveis.",
        },
        internalSpecs: {
          valve_manufacturer: "[CARREGAR — ex: Husco / Danfoss / Parker / Bosch Rexroth]",
          valve_type: "[CARREGAR — open center / closed center / load sensing]",
          sections: "[CARREGAR — número de seções de válvula]",
          aux_circuits: "[CARREGAR — número e vazão de circuitos auxiliares]",
          pilot_pressure_bar: "[CARREGAR]",
        },
        competitorComparison: {
          Cat: "Bloco de válvulas integrado ao Electrohydraulic system. Controle individual de cada spool por ECU. Permite Grade Assist e Swing Assist nativos.",
          Komatsu: "Bloco CLSS com controle individual de spool integrado ao iMC. Sensores de posição em cada spool para feedback preciso.",
        },
        improvementOpportunities: [
          "Bloco de válvulas com controle individual eletrônico de cada spool é pré-requisito para Grade Assist nativo",
          "Avaliar fornecedores de blocos integrados (Bosch Rexroth SX12/SX14) para próxima geração de escavadeiras",
        ],
      },
      {
        id: "hyd-machinecontrol",
        icon: "📐",
        name: "Machine Control / Grade System",
        description: "Sistema de controle de posição e profundidade que guia automaticamente os implementos. O gap #1 do portfólio CASE.",
        publicSpecs: {
          case_current: "OEM-Fit: Leica/Topcon instalado em dealer. Brackets e harness preparados de fábrica. NÃO é factory-fit integrado.",
          cat_benchmark: "Cat Grade with 3D: padrão de fábrica. Sensores em cilindros, GPS no boom, software no display principal. Grade Assist controla automaticamente profundidade e ângulo.",
          komatsu_benchmark: "iMC 2.0: padrão de fábrica. Cylinder stroke sensing elimina mastros GNSS em muitas operações. Controle semi-automático.",
          jd_benchmark: "SmartGrade 3D: padrão de fábrica em dozers e graders. Sem mastros. Automation Suite progressiva.",
        },
        internalSpecs: {
          current_integration_level: "[CARREGAR: OEM-Fit / Factory-Fit / None]",
          supported_partners: "[CARREGAR: Leica, Topcon, Trimble]",
          harness_pre_installed: "[CARREGAR: sim/não por modelo]",
          display_integration: "[CARREGAR: overlay no display principal ou display separado do parceiro]",
          cylinder_sensors: "[CARREGAR: sim/não — pré-requisito para Grade Assist nativo]",
        },
        competitorComparison: {
          Cat: "Grade with 3D padrão desde 2018-2019. Sensores de posição integrados em cilindros. Display 10in com overlay de grade, payload e swing. Benchmark absoluto.",
          Komatsu: "iMC 2.0 padrão desde 2020. Cylinder stroke sensing em cilindros proprietários. Semi-automático com integração BIM.",
          "John Deere": "SmartGrade 3D sem mastros. GNSS integrado na lâmina ou bucket. Líder em graders.",
          Volvo: "Dig Assist como opção. Steelwrist Auto Connect para tiltrotators. Sem semi-automático.",
        },
        improvementOpportunities: [
          "[PRIORIDADE #1 ABSOLUTA DO PORTFÓLIO] Desenvolver Grade Assist factory-fit para escavadeiras E-Series",
          "Fase 1: sensores de posição em cilindros de boom, stick e bucket",
          "Fase 2: software de Grade 2D integrado ao display 10in",
          "Fase 3: GPS/GNSS de fábrica com Grade 3D e controle semi-automático",
          "Parceria profunda com Leica ou desenvolvimento proprietário CNH",
          "Custo estimado: $15-25M. Retorno: acesso a bids DOT + paridade com Cat/Komatsu",
        ],
      },
    ],
  },
  transmission: {
    label: "Transmissão",
    components: [
      {
        id: "trn-gearbox",
        icon: "🔗",
        name: "Caixa de transmissão / Gearbox",
        description: "Conjunto responsável por transferir torque do motor para o trem de força com escalonamento de velocidade, eficiência e robustez adequados ao ciclo da máquina.",
        publicSpecs: {
          case_current: "PowerShift em grande parte dos loaders médios e graders; CVT disponível nos loaders 1021G/1121G; PowerDrive H-Type nas retroescavadeiras N-Series.",
          market_benchmark: "Cat XE com Electric Drive / CVT, John Deere com EVT, Volvo com OptiShift e lock-up estratégico.",
          strategic_note: "Transmissão virou um dos gaps mais visíveis em loaders médios e grandes por impacto direto em consumo, produtividade e percepção de modernidade.",
        },
        internalSpecs: {
          transmission_supplier: "[CARREGAR — ex: ZF / Dana / Carraro / Tremec]",
          transmission_type_detail: "[CARREGAR — PowerShift / CVT / EVT / H-Type / lock-up]",
          number_of_gears: "[CARREGAR — marchas F/R e relações]",
          torque_capacity_nm: "[CARREGAR]",
          control_strategy: "[CARREGAR — logic de shifts, kickdown, lock-up, creep]",
        },
        competitorComparison: {
          Cat: "Cat 966/972 XE usa Electric Drive / CVT com ganho perceptível de eficiência e suavidade. Benchmark em loaders grandes para fuel burn e responsividade.",
          "John Deere": "EVT exclusiva combina componente elétrico com transmissão variável. Diferencial forte em eficiência sob carga variável e percepção de tecnologia premium.",
          Volvo: "OptiShift com lock-up e Reverse By Braking reduz consumo e fadiga do operador. Muito bem aceito em aplicações de carregamento repetitivo.",
          Komatsu: "WA-series prioriza robustez e lógica de shifts previsível. Menos disruptiva que Cat/JD, porém consistente em uptime.",
        },
        improvementOpportunities: [
          "[PRIORIDADE ALTA] Expandir CVT/eCVT para 821G e 921G — fecha gap claro vs. Cat XE e Deere EVT",
          "Refinar estratégia de shifts com modos orientados por aplicação (load-and-carry, quarry, truck loading)",
          "Preparar arquitetura da transmissão para integração com payload, telemática e modos semi-autônomos"
        ],
      },
      {
        id: "trn-axles",
        icon: "🛞",
        name: "Eixos / Diferenciais / Final drives",
        description: "Conjunto que distribui torque para as rodas ou esteiras, suportando cargas elevadas, ciclos de choque e diferentes condições de tração.",
        publicSpecs: {
          case_focus: "Configurações heavy-duty com bloqueio de diferencial e relações adaptadas por aplicação.",
          use_case: "Crítico para loaders, graders e máquinas de grande massa operacional em ambientes severos.",
          competitive_signal: "Robustez de axle/final drive pesa fortemente em TCO percebido mesmo quando não aparece na ficha comercial.",
        },
        internalSpecs: {
          axle_supplier: "[CARREGAR — ex: ZF / Dana / Kessler]",
          differential_type: "[CARREGAR — open / limited-slip / locking]",
          final_drive_ratio: "[CARREGAR]",
          service_interval_hours: "[CARREGAR]",
          max_static_load_kg: "[CARREGAR]",
        },
        competitorComparison: {
          Cat: "Conjunto final dimensionado para ciclos agressivos de quarry com forte integração à lógica de tração e torque converter lock-up.",
          Volvo: "Axles bem casados ao OptiShift; equilíbrio forte entre eficiência e suavidade em aplicações de carga e transporte.",
          Komatsu: "Reputação de durabilidade elevada em drivetrain completo, com foco em mineração e grandes operações.",
          DEVELON: "Busca custo competitivo com robustez aceitável, mas ainda abaixo dos benchmarks premium em percepção de vida útil.",
        },
        improvementOpportunities: [
          "Criar pacote axle/final drive premium para aplicações severas com comunicação clara de vida útil",
          "Adicionar monitoramento térmico e vibração para manutenção preditiva dos eixos",
          "Oferecer relações finais otimizadas por região/aplicação em vez de calibração única global"
        ],
      },
      {
        id: "trn-controls",
        icon: "🎚️",
        name: "Controle eletrônico da transmissão",
        description: "Módulo eletrônico e lógica de software que definem trocas de marcha, proteção de drivetrain, modos de operação e integração com motor e hidráulica.",
        publicSpecs: {
          current_state: "Integração funcional entre motor, transmissão e modos de operação, porém ainda atrás dos líderes em adaptação automática ao ciclo e personalização por operador.",
          operator_impact: "Calibração de shifts e lock-up afeta diretamente conforto, consumo, tração e tempo de ciclo.",
          roadmap_link: "Este componente é habilitador para CVT, automação assistida e eficiência energética da próxima geração.",
        },
        internalSpecs: {
          tcu_model: "[CARREGAR — modelo/fornecedor da TCU]",
          communication_protocols: "[CARREGAR — CAN / Ethernet / integração ECU motor]",
          drive_modes_available: "[CARREGAR — Economy / Standard / Performance / Custom]",
          shift_time_ms: "[CARREGAR]",
          diagnostic_depth: "[CARREGAR — parâmetros e falhas monitoradas]",
        },
        competitorComparison: {
          Cat: "Software da XE integra drivetrain e controles para eficiência máxima em ciclos repetitivos. Experiência percebida como muito refinada.",
          "John Deere": "EVT depende fortemente da orquestração eletrônica entre motor, componente elétrico e transmissão — software é parte do diferencial.",
          Volvo: "OptiShift entrega valor porque a calibração eletrônica é consistente e previsível para o operador, reduzindo fadiga.",
          Komatsu: "Lógica conservadora e robusta, menos sofisticada que os líderes em transmissão variável, porém sólida em confiabilidade.",
        },
        improvementOpportunities: [
          "Desenvolver modos inteligentes orientados por carga e terreno com adaptação automática de shift points",
          "Adicionar perfis por operador e telemetria específica de eficiência de transmissão",
          "Preparar TCU para integração com assistentes autônomos e manutenção preditiva em tempo real"
        ],
      },
    ],
  },
  implements: {
    label: "Implementos",
    components: [
      {
        id: "imp-bucket-kinematics",
        icon: "🪣",
        name: "Bucket / Linkage / Cinemática",
        description: "Conjunto físico de caçamba, braços e alavancas que define breakout force, retenção de material, visibilidade e eficiência do ciclo.",
        publicSpecs: {
          case_strength: "CASE historicamente entrega boa breakout force e geometria competitiva em loaders e backhoes.",
          competitive_context: "Cat e Volvo combinam cinemática forte com payload e automação embarcada, elevando o valor percebido do implemento completo.",
          design_tradeoff: "Geometria impacta simultaneamente visibilidade, retenção de material, estabilidade e tempo de ciclo.",
        },
        internalSpecs: {
          linkage_geometry: "[CARREGAR — Z-bar / XR / parallel lift / geometria proprietária]",
          breakout_force_kn: "[CARREGAR]",
          rollback_angle_deg: "[CARREGAR]",
          dump_clearance_mm: "[CARREGAR]",
          bucket_options: "[CARREGAR — capacidades e aplicações disponíveis]",
        },
        competitorComparison: {
          Cat: "Integra bucket performance com Autodig e Payload, transformando a caçamba em plataforma de produtividade, não só estrutura mecânica.",
          Volvo: "Cinemática refinada com foco em retenção, visibilidade e acoplamento com pesagem embarcada. Forte percepção premium.",
          "John Deere": "Pile Slip Assist e automação parcial elevam o valor do linkage além da força pura.",
          Komatsu: "Foco em robustez e previsibilidade de ciclo; menos marketing, boa percepção em aplicações pesadas.",
        },
        improvementOpportunities: [
          "Integrar cinemática com recursos de assistentes automáticos (autodig, carry angle assist, anti-spill)",
          "Revisar geometria para equilibrar visibilidade frontal e retenção sem sacrificar breakout",
          "Criar narrativa técnica mais forte conectando linkage a produtividade mensurável"
        ],
      },
      {
        id: "imp-payload",
        icon: "⚖️",
        name: "Payload / Pesagem integrada",
        description: "Sistema que mede ou estima a carga movimentada em tempo real, fundamental para proof-of-productivity, controle de sobrecarga e gestão de frota.",
        publicSpecs: {
          case_current: "Disponível em parte do portfólio, frequentemente como opcional. Não é percebido como padrão consistente na linha.",
          market_benchmark: "Volvo já oferece pesagem de série em boa parte da linha H; Cat Payload é padrão em loaders Next Gen relevantes.",
          commercial_value: "Impacta diretamente bids performance-based e frotas enterprise que exigem produtividade auditável.",
        },
        internalSpecs: {
          sensor_strategy: "[CARREGAR — pressão / pinos instrumentados / strain gauges / IMU]",
          accuracy_percent: "[CARREGAR — precisão declarada por faixa de carga]",
          calibration_process: "[CARREGAR — auto/manual/frequência]",
          display_integration: "[CARREGAR — tela principal / módulo dedicado]",
          telematics_export: "[CARREGAR — integração com SiteConnect / APIs]",
        },
        competitorComparison: {
          Volvo: "Pesagem integrada muito bem posicionada comercialmente. Valor claro para produtividade e gestão de frota.",
          Cat: "Payload padrão com interface madura e integração mais profunda a sistemas de produtividade e operação.",
          Komatsu: "Menos dominante em messaging que Cat/Volvo, mas evolui dentro do ecossistema Smart Construction.",
          "John Deere": "Aborda payload dentro do pacote mais amplo de produtividade e assistência operacional.",
        },
        improvementOpportunities: [
          "[PRIORIDADE ALTA] Tornar payload padrão nas famílias críticas de loaders",
          "Integrar payload ao SiteConnect com dashboards executivos e rastreamento por operador",
          "Elevar acurácia e simplicidade de calibração para reduzir fricção na adoção"
        ],
      },
      {
        id: "imp-coupler-aux",
        icon: "🔩",
        name: "Acoplamento rápido / Circuitos auxiliares",
        description: "Interface mecânica e hidráulica/elétrica para troca rápida de implementos, ampliando versatilidade e reduzindo tempo improdutivo.",
        publicSpecs: {
          case_positioning: "Quick couplers e linhas auxiliares variam por família, com melhor maturidade em escavadeiras e compactos do que em algumas linhas heavy.",
          market_trend: "Versatilidade e troca rápida viraram argumento central em mercados com escassez de operadores e alta pressão por uptime.",
          adjacent_need: "Tiltrotator, acoplamento automático e presets por implemento estão se tornando padrão em mercados premium.",
        },
        internalSpecs: {
          coupler_type: "[CARREGAR — manual / hydraulic / fully automatic]",
          aux_flow_lpm: "[CARREGAR]",
          aux_pressure_bar: "[CARREGAR]",
          electrical_pass_through: "[CARREGAR — sim/não para implementos inteligentes]",
          attachment_presets: "[CARREGAR — número de presets e parâmetros salvos]",
        },
        competitorComparison: {
          Volvo: "Forte em integração com tiltrotator e sistemas de acoplamento avançado via ecossistema europeu.",
          Cat: "Boa integração com múltiplos implementos e experiência de operador madura, principalmente em compactos e escavadeiras Next Gen.",
          Komatsu: "Avança em integração com Smart Construction e acessórios de alta produtividade, embora menos ampla que Volvo na narrativa de versatilidade.",
          JCB: "Em backhoes e compactos, faz bom uso comercial da versatilidade e velocidade de troca de função/implemento.",
        },
        improvementOpportunities: [
          "Elevar quick coupler hidráulico a padrão em linhas estratégicas de escavadeiras e loaders",
          "Preparar passagem elétrica e presets inteligentes para implementos conectados",
          "Amarrar acoplamento rápido à proposta de valor regional, especialmente Europa e aplicações urbanas"
        ],
      },
    ],
  },
  cabin: {
    label: "Cabine / Ergonomia",
    components: [
      {
        id: "cab-display",
        icon: "🖥️",
        name: "Display / HMI (Human Machine Interface)",
        description: "Monitor principal de interação operador-máquina. Define capacidade de visualização, controle e integração de sistemas.",
        publicSpecs: {
          case_current: "LCD 8in (loaders, backhoes) ou 10in (E-Series excavators). SiteConnect integrado.",
          resolution: "[DADO NÃO PUBLICADO]",
          touch: "Sim em modelos recentes",
          customization: "5 botões configuráveis, até 10 presets de acessórios",
        },
        internalSpecs: {
          display_manufacturer: "[CARREGAR — ex: Innolux / BOE / Bosch]",
          resolution_pixels: "[CARREGAR]",
          brightness_nits: "[CARREGAR — importante para visibilidade em sol direto]",
          processor: "[CARREGAR — capacidade gráfica para overlay de Grade]",
          connectivity: "[CARREGAR — CAN, Ethernet, Wi-Fi, BT, 4G/5G]",
          os: "[CARREGAR — embedded Linux / QNX / Android Automotive]",
        },
        competitorComparison: {
          Cat: "10in touchscreen capacitivo de alta resolução. Processador capaz de overlay em tempo real de Grade + Payload + Swing Assist simultaneamente.",
          Volvo: "Co-Pilot 12in HD — maior da indústria. Interface premium com touch + botões físicos. Processador com capacidade de machine learning local.",
          Komatsu: "12.1in monitor dedicado ao iMC — mostra grade, profundidade, ângulo e posição 3D em tempo real.",
          "John Deere": "Display integrado com SmartGrade overlay nativo. JDLink com remote display para dealer.",
        },
        improvementOpportunities: [
          "Upgrade para 10in mínimo em toda a linha (12in aspiracional para loaders premium)",
          "Processador com capacidade de Grade overlay — pré-requisito para Grade Assist",
          "Conectividade 4G/5G nativa para OTA updates e remote diagnostics profundo",
          "Sistema operacional que suporte app marketplace de implementos",
        ],
      },
      {
        id: "cab-telematics",
        icon: "📡",
        name: "Módulo telemático / SiteConnect",
        description: "Sistema de comunicação máquina-nuvem-dealer. Telemática é commodity em 2026 — o diferencial está na profundidade de dados e ações possíveis remotamente.",
        publicSpecs: {
          case_system: "SiteConnect (máquina→nuvem) + SiteManager (nuvem→dealer). Bidirecional. 7 anos de cobertura com myCASEConstruction.",
          capabilities: "Localização GPS, horas de operação, alertas de manutenção, geofencing e relatórios de utilização.",
        },
        internalSpecs: {
          module_manufacturer: "[CARREGAR — ex: CalAmp / Orbcomm / Continental]",
          connectivity: "[CARREGAR — 3G/4G/5G/satellite]",
          data_frequency: "[CARREGAR — intervalo de envio de dados em minutos]",
          can_parameters_monitored: "[CARREGAR — número de parâmetros CAN monitorados]",
          remote_capabilities: "[CARREGAR — listar: geofencing, curfew, remote disable, code reading, parameter reset, OTA]",
        },
        competitorComparison: {
          Cat: "Product Link — benchmark. Remote Flash, Remote Troubleshoot e Performance Monitoring.",
          Komatsu: "KOMTRAX — pioneiro em telemática. Monitora 700+ parâmetros CAN e integra com Smart Construction Dashboard.",
          Volvo: "ActiveCare Direct — Volvo monitora 24/7 e aciona o dealer proativamente quando detecta anomalia.",
          "John Deere": "JDLink — Remote Display Access e Expert Alerts. Integração forte com ecossistema digital.",
        },
        improvementOpportunities: [
          "SiteConnect 2.0 com Remote Troubleshoot e reset remoto de parâmetros",
          "OTA updates de firmware para evitar visita ao dealer",
          "Monitoramento preditivo usando dados CAN e machine learning na nuvem",
          "API aberta para integração com sistemas de fleet management de terceiros",
        ],
      },
      {
        id: "cab-safety",
        icon: "🛡️",
        name: "Sistemas de segurança ativa",
        description: "Câmeras, radar, LiDAR e sistemas de detecção de pessoas e obstáculos.",
        publicSpecs: {
          case_current: "CASE Max View — câmeras traseira e lateral com cobertura de 270°. LED lighting package. ROPS/FOPS de série.",
          gap: "Sem People Detection por radar. Sem câmera 360° verdadeira. Sem E-Fence.",
        },
        internalSpecs: {
          camera_manufacturer: "[CARREGAR]",
          camera_resolution: "[CARREGAR]",
          radar_available: "[CARREGAR: não atualmente]",
          rops_fops_standard: "[CARREGAR: certificação específica]",
        },
        competitorComparison: {
          Cat: "Cat Detect: radar 360° com People Detection. Alerta visual + sonoro + freio automático em evolução. Benchmark em segurança.",
          Volvo: "Radar de colisão traseiro padrão em EU 2025+. Volvo aposta forte em segurança.",
          Komatsu: "KomVision 360° com bird's-eye view. Drone integration anunciada para survey automático de canteiro.",
        },
        improvementOpportunities: [
          "[PRIORIDADE ALTA — REGULATÓRIA] Implementar People Detection por radar antes da regulamentação europeia obrigar",
          "Expandir Max View de 270° para 360° verdadeiro com stitching em tempo real",
          "E-Fence virtual para limitar área de operação",
          "Parceria com fornecedor de radar automotivo para acelerar maturidade do sistema",
        ],
      },
      {
        id: "cab-controls",
        icon: "🕹️",
        name: "Controles do operador (joysticks, pedais, steering)",
        description: "Interface física de controle da máquina pelo operador.",
        publicSpecs: {
          case_loaders: "Controles EH com feedback proporcional. Joystick ISO e SAE pattern. Comfort Steer exclusivo em backhoes.",
          case_excavators: "Joysticks EH com ajuste de sensibilidade por circuito. EZ-EH menu system. Mechanical H and foot pedals.",
          case_graders: "Controles EH de lâmina. Steering wheel padrão.",
        },
        internalSpecs: {
          joystick_manufacturer: "[CARREGAR — ex: Rexroth / Danfoss / Parker]",
          haptic_feedback: "[CARREGAR: sim/não]",
          patterns_available: "[CARREGAR: ISO, SAE, custom]",
          electric_over_hydraulic: "[CARREGAR: sim/não por modelo]",
        },
        competitorComparison: {
          Cat: "Joystick steering padrão em graders. Joysticks com haptic feedback em escavadeiras Next Gen. Perfis por operador.",
          "John Deere": "EH joysticks com Performance mode e fingertip control integration para grade guidance.",
          JCB: "Single lever servo controls em backhoes. Padrão próprio com operadores muito fiéis.",
        },
        improvementOpportunities: [
          "Joystick steering como opção em motoniveladoras D-Series",
          "Haptic feedback nos joysticks quando se aproxima do grade target ou limite de carga",
          "Application Profiles por operador via RFID ou PIN",
          "Avaliar fly-by-wire completo para próxima geração",
        ],
      },
      {
        id: "cab-canbus",
        icon: "🔌",
        name: "Rede CAN bus / Arquitetura eletrônica",
        description: "Barramento de comunicação entre ECUs, sensores, display e atuadores. A espinha dorsal digital da máquina.",
        publicSpecs: {
          standard: "SAE J1939 CAN 2.0B (padrão da indústria de equipamentos)",
          typical_architecture: "2-3 barramentos CAN separados: powertrain CAN, implement/chassis CAN, infotainment/telematics CAN",
          diagnostics: "DTC via J1939. Service tool proprietário para acesso avançado.",
        },
        internalSpecs: {
          number_of_ecus: "[CARREGAR — típico: 8-15 ECUs por máquina moderna]",
          can_bus_count: "[CARREGAR — número de barramentos independentes]",
          gateway_ecu: "[CARREGAR — existe gateway central? modelo?]",
          cybersecurity: "[CARREGAR — proteção contra acesso não autorizado ao CAN]",
          ethernet_backbone: "[CARREGAR — sim/não — pré-requisito para camera 360° e Grade 3D]",
        },
        competitorComparison: {
          Cat: "Arquitetura eletrônica Next Gen com Ethernet backbone para câmeras e Grade 3D. Gateway central com firewall. OTA via Ethernet + 4G.",
          Komatsu: "Arquitetura dedicada para iMC com barramento separado de alta velocidade para sensores de cilindro e GNSS.",
          "John Deere": "CAN + Ethernet architecture, altamente modular e integrada ao ecossistema digital.",
        },
        improvementOpportunities: [
          "Migrar para arquitetura Ethernet backbone — pré-requisito para câmera 360°, Grade 3D e OTA updates",
          "Gateway central com cybersecurity alinhado à ISO 21434",
          "Padronizar interface de diagnóstico para facilitar manutenção em campo",
          "Preparar arquitetura para V2X em canteiro conectado",
        ],
      },
    ],
  },
};

export const getComponentTreeForSubsystem = (subsystem: EngineeringSubsystemKey) => componentTree[subsystem] ?? null;
