# 📘 Guia Completo — CASE Nexus · Industrial Intel Hub

> Plataforma de inteligência de portfólio para equipamentos de construção CASE Construction.
> Este guia cobre **cada menu, gráfico, funcionalidade e fluxo** da aplicação.

---

## 🗂️ Navegação Principal (Sidebar)

A sidebar lateral é o menu fixo de navegação. Cada item leva a um módulo diferente:

| # | Menu               | Rota                      | Objetivo principal                                                  |
|---|-------------------|---------------------------|---------------------------------------------------------------------|
| 1 | Dashboard          | `/`                       | Visão executiva consolidada de todo o portfólio                    |
| 2 | Portfolio Directory| `/portfolio`              | Catálogo completo de máquinas com filtros avançados                |
| 3 | Competitor Benchmarking | `/benchmarking`      | Comparação técnica CASE vs concorrência                           |
| 4 | Engineering Subsystems | `/subsystems/:machineId` | Drill-down por subsistema de engenharia                         |
| 5 | Regional Intelligence | `/regional-intelligence` | Análise de demanda e competitividade por região geográfica      |
| 6 | Next Gen Roadmap   | `/next-gen-roadmap`       | Evolução do portfólio — maturidade, gaps e roadmap tecnológico   |
| 7 | Field Intelligence | `/field-intelligence`     | Dados de campo (wins/losses/feedback) que calibram priorização    |
| 8 | Web Scanner        | `/scanner`                | Motor analítico de inteligência competitiva automatizada          |
| 9 | Settings           | `/settings`               | Configurações da plataforma                                       |

Além dos menus, existem 2 elementos globais:
- **Topbar**: Barra superior com busca global, seletor de região e toggle de tema (Light/Dark)
- **NexusChat (IA)**: Assistente inteligente flutuante disponível em qualquer página

---

## 1. 📊 Dashboard (`/`)

### O que faz
Painel executivo que unifica dados de portfólio, competitividade e sinais de mercado em uma única visualização.

### Seções e Gráficos

| Seção | Tipo | O que mostra | Como usar |
|-------|------|-------------|-----------|
| **KPIs superiores** | Cards numéricos | Total de máquinas, score médio, sinais urgentes, famílias cobertas | Leitura rápida de saúde do portfólio |
| **Mapa global interativo** | Mapa Leaflet | Pontos de presença CASE e pressão competitiva por região | Clique numa região para ver detalhes; cores indicam intensidade competitiva |
| **Comparativo Regional (A vs B)** | Radar + cards | Sobreposição de 2 regiões comparando demanda, cobertura e gaps | Selecione Região A e B nos dropdowns para gerar radar comparativo |
| **Sinais urgentes do Scanner** | Lista de alertas | Top 3 sinais de alta prioridade do Web Scanner | Clique para navegar ao Scanner com foco no sinal |
| **Vídeo de contexto** | Scroll-scrub video | Vídeo institucional sincronizado com o scroll da página | Faça scroll para animar o vídeo |

### Fluxos típicos
1. **Análise rápida de região**: Clique numa região no mapa → abre dialog com máquinas cobertas, concorrentes presentes e fit regional
2. **Identificar gaps críticos**: Leia os KPIs → se sinais urgentes > 0, clique para investigar no Scanner
3. **Comparar regiões**: Use o comparativo A vs B → gere radar para apresentação executiva

---

## 2. 📋 Portfolio Directory (`/portfolio`)

### O que faz
Catálogo completo com 42+ máquinas CASE, filtros multi-dimensionais e exportação.

### Filtros disponíveis

| Filtro | Opções | Exemplo |
|--------|--------|---------|
| **Busca livre** | Qualquer texto | "821G", "FPT", "Electric" |
| **Família** | Todas + 10 famílias | "Pás Carregadeiras (G-Series)" |
| **Região** | Todas + 6 regiões | "North America" |
| **Categoria** | All / Heavy / Light | Segmentação por porte |
| **Potência** | Slider 0-400hp | Faixa de potência desejada |
| **Peso** | Slider 0-120.000lb | Faixa de peso operacional |
| **Powertrain** | Todos / Somente EV | Filtrar plataformas elétricas |

### Funcionalidades

| Função | Como usar |
|--------|-----------|
| **Selecionar para comparar** | Checkbox na coluna → selecione 2-4 máquinas → clique "Comparar selecionados" → vai para Benchmarking |
| **Export CSV** | Clique no botão → gera arquivo CSV com todos os dados filtrados |
| **Navegar para Subsystems** | Clique na seta (→) ao lado de qualquer máquina |
| **Score geral** | Badge colorido: 🟢 ≥85 (forte), 🟡 75-84 (aceitável), 🔴 <75 (gap) |

### Exemplo de uso
> *"Quero ver todas as escavadeiras acima de 200hp disponíveis na América do Norte"*
> → Família: "Escavadeiras (E-Series)" → Região: "North America" → Potência: 200-400hp

---

## 3. ⚔️ Competitor Benchmarking (`/benchmarking`)

### O que faz
Comparação técnica CASE vs concorrência em 3 camadas analíticas, acessíveis por abas.

### Aba 1: Comparação (`?tab=comparison`)

| Elemento | O que mostra |
|----------|-------------|
| **Seletor de máquina CASE** | Dropdown com todas as máquinas do portfólio |
| **Cards de concorrentes** | Todos os rivais da máquina selecionada com scores por métrica |
| **Radar comparativo** | Gráfico radar sobrepondo CASE vs concorrente selecionado em 5 eixos: Powertrain, Ergonomics, Tech, Maintenance, Price/TCO |
| **Tabela de specs** | Dados técnicos lado a lado |

### Aba 2: Trajetória Competitiva (`?tab=trajectory`)

| Elemento | O que mostra |
|----------|-------------|
| **Timeline de concorrentes** | Eventos passados e projeções futuras por marca (Cat, Komatsu, Volvo, Deere, JCB) |
| **Milestones** | Marcos tecnológicos que cada marca já atingiu ou planeja atingir |
| **Projeções** | Previsões de movimentos competitivos com nível de confiança |
| **Botão "Enviar para Roadmap"** | Converte projeção em sugestão no Next Gen Roadmap |

### Aba 3: Priorização de Portfólio (`?tab=prioritization`)

| Elemento | O que mostra |
|----------|-------------|
| **Matriz de priorização** | Scatter plot posicionando máquinas por score vs. pressão competitiva |
| **Categorias** | Líderes, Apostas, Vacas Leiteiras, Questionáveis |
| **Recomendação executiva** | Ação sugerida por quadrante |

### Exemplo de uso
> *"Quero apresentar ao board a posição da CX300E vs Komatsu PC300"*
> → Aba Comparação → Selecione CX300E → Clique no card Komatsu PC300 → Use radar + tabela

---

## 4. 🔩 Engineering Subsystems (`/subsystems/:machineId`)

### O que faz
Decomposição técnica da máquina por 6 subsistemas de engenharia, com dados reais vs concorrência.

### Os 6 subsistemas

| Subsistema | Sigla | O que avalia |
|-----------|-------|-------------|
| **Structure** | EST | Chassi, robustez, modularidade, acesso de serviço |
| **Powertrain** | PWR | Motor, emissões, potência, eficiência |
| **Hydraulics** | HID | Circuito hidráulico, machine control, automação |
| **Transmission** | TRN | Transmissão, trem de força, durabilidade |
| **Implements** | IMP | Implementos, grade control, payload, breakout |
| **Cabin** | CAB | Cabine, ergonomia, display, safety, telemática |

### Funcionalidades por subsistema

| Elemento | O que mostra |
|----------|-------------|
| **Score do subsistema** | Barra de progresso + número (0-100) |
| **Análise textual** | Descrição do estado atual do subsistema |
| **Gap identificado** | Box amarelo com o principal ponto fraco |
| **Recomendação Next Gen** | Card roxo com ação sugerida para próxima geração |
| **Radar de engenharia** | SVG comparando CASE vs concorrente em todos os 6 eixos simultaneamente |
| **Cards de concorrentes** | Score por concorrente com delta (▲/▼) e análise |
| **Componentes detalhados** | Botão "Ver componentes detalhados" expande árvore de subcomponentes |

### Componentes detalhados (drill-down)
Cada componente tem:
- **Specs públicos**: dados comparativos disponíveis publicamente
- **Dados internos**: campos editáveis com status `✅ Validado` ou `⚠️ Dado interno pendente`
- **Comparação com concorrentes**: notas por marca
- **Oportunidades de melhoria**: cards priorizados
- **Botão "Analisar com IA"**: envia o componente para análise pelo NexusChat

### Exemplo de uso
> *"Quero saber o gap hidráulico da CX300E vs Komatsu"*
> → Selecione CX300E → Clique em "Hydraulics" → Veja gap + score + concorrentes → Clique "Analisar com IA"

---

## 5. 🌍 Regional Intelligence (`/regional-intelligence`)

### O que faz
Análise de demanda e gap por cada uma das 5 macro-regiões: North America, Europe, Latin America, Middle East & Africa, Asia Pacific.

### Conteúdo por região

| Elemento | O que mostra |
|----------|-------------|
| **Perfil da região** | Tamanho do mercado, revenue, presença CASE, top concorrentes |
| **Prioridades de demanda** | Lista ordenada de features exigidas pela região com peso e tendência |
| **Relevância de gaps** | Cada gap CASE classificado como CRÍTICO, ALTO, MÉDIO etc. com nota |
| **Máquinas cobertas** | Quais produtos CASE atendem a região + score de fit regional |
| **Recomendações estratégicas** | 3 ações priorizadas por região |

### Exemplo de uso
> *"Qual a prioridade #1 na América Latina?"*
> → Regional Intelligence → Latin America → "Robustez mecânica e durabilidade (peso 95)" + "SCR-only vantagem decisiva (score 98)"

---

## 6. 🚀 Next Gen Roadmap (`/next-gen-roadmap`)

### O que faz
Centro de evolução do portfólio para o Engenheiro de Portfólio — conecta gaps, investimento e timeline de tecnologia.

### Seções (de cima para baixo)

| Seção | Tipo | O que mostra |
|-------|------|-------------|
| **Portfolio Maturity Scorecard** | 5 KPI cards | Readiness (% modelos ≥85), Gap Coverage (% itens em ação), EV Penetration (% EV), Competitive Parity (delta CASE), Field→Roadmap (% de loop fechado) |
| **Subsystem Gap Heatmap** | Tabela interativa | Matriz famílias × 6 subsistemas com score médio + contagem de itens de roadmap. Clique navega para Subsystems |
| **Filtros** | 4 dropdowns | Família, Subsistema, Prioridade (critical/high/medium/low), Fase (1/2/3) |
| **Board de fases** | Kanban 3 colunas | Fase 1 (MY2027), Fase 2 (MY2028), Fase 3 (MY2029) — cards de cada item de roadmap |
| **Sumário de investimento** | Barras + total | Investimento estimado por fase ($M) + total geral |
| **Impacto projetado** | Gráfico de linhas | Score CASE vs linha do concorrente ao longo das 3 fases |
| **Technology Timeline** | Gantt horizontal | Barras por subsistema, agrupadas em fases, com cores por prioridade e seção de dependências |
| **Sugestões da inteligência** | Cards | Ações sugeridas vindas do Field Intelligence e Trajetória Competitiva |
| **Lista detalhada de itens** | Cards expansíveis | Cada item com status (dropdown editável), modelos afetados, gráfico antes/depois, impacto, risco, dependências |

### Controles de status do roadmap
Cada item pode ter o status alterado via dropdown:
- `Proposto` → `Aprovado` → `Em Desenvolvimento` → `Implementado`
- Ou: `Adiado` / `Rejeitado`
- O status é salvo no localStorage e persiste entre sessões

### Os 10 itens do roadmap atual

| ID | Título | Fase | Prioridade | Δ Score |
|----|--------|------|-----------|---------|
| road-001 | Pesagem integrada PADRÃO em G-Series | 1 | Critical | +10 |
| road-002 | Display upgrade 10-12" | 1 | High | +6 |
| road-003 | CVT nas carregadeiras médias | 2 | High | +9 |
| road-004 | Grade Assist nativo E-Series | 2 | Critical | +13 |
| road-005 | Potência 270+ hp na 821G Next Gen | 2 | High | +6 |
| road-006 | People Detection radar (heavy) | 2 | High | +7 |
| road-007 | Automação semi-autônoma M-Series | 3 | High | +13 |
| road-008 | Potência 250-270 hp motoniveladoras | 2 | High | +9 |
| road-009 | Bateria 90+ kWh + DC Fast 580EV | 2 | High | +3 |
| road-010 | Undercarriage premium E-Series | 1 | Medium | +6 |

### Exemplo de uso
> *"Qual o investimento total da Fase 2?"*
> → Next Gen Roadmap → Sumário de investimento → Fase 2: $49-79M

---

## 7. 📡 Field Intelligence (`/field-intelligence`)

### O que faz
Captura dados de campo (vendas, perdas, feedbacks) para fechar o loop engenharia ↔ vendas.

### Formulário de relatório de campo

| Campo | Opções |
|-------|--------|
| **Tipo** | Win / Loss / Feedback |
| **Produto CASE** | Qualquer máquina do portfólio |
| **Região** | 6 regiões globais |
| **Cliente** | Texto livre (opcional) |
| **Concorrente** | Catálogo de produtos concorrentes |
| **Motivo principal** (losses) | Preço, Feature técnica, Disponibilidade, Suporte, Financiamento, Relacionamento, Outro |
| **Feature que faltou** (losses) | Texto livre |
| **Feature decisiva** (wins) | Texto livre |
| **Valor da proposta** | Número |
| **Comentários** | Texto livre (obrigatório, 8-1200 chars) |

### KPIs calculados automaticamente

| KPI | O que mede |
|-----|-----------|
| **Win Rate** | % de wins sobre total de decisões (wins + losses) |
| **Losses** | Contagem de perdas registradas |
| **Top Loss Reason** | Motivo mais frequente nas losses |
| **Top Feature Request** | Feature mais mencionada em forma agregada |
| **Most Lost To** | Marca para quem mais se perde |

### Gráficos

| Gráfico | Tipo | O que mostra |
|---------|------|-------------|
| **Motivos de perda** | Pie chart (rosca) | Distribuição dos motivos das losses |
| **Features mais solicitadas** | Barra horizontal | Top 5 features agrupadas por tema |
| **Perdas por concorrente** | Barra horizontal | Padrão de quais marcas vencem mais a CASE |

### Feed-forward automático
- Relatórios geram **sugestões automáticas** para o Next Gen Roadmap quando um tema se repete 2+ vezes
- O botão "Analisar com IA" envia os dados para NexusChat para análise estratégica

### Exemplo de uso
> *"Perdi uma venda da 821G para Cat 966 XE por causa do Grade 3D"*
> → Tipo: Loss → Produto: 821G → Concorrente: Cat 966 XE → Motivo: Feature técnica → Feature: "Grade 3D integrado" → Comentário detalhado → Enviar

---

## 8. 🔍 Web Scanner (`/scanner`)

### O que faz
Motor análitico que compara automaticamente produtos CASE vs concorrentes e gera "sinais" de gap ou vantagem.

### Como funciona

1. **Busca** → Digite o nome de um concorrente ou produto CASE no autocomplete
2. **Filtros** → Família, Região, Prioridade
3. **Gerar análise** → Clique "Gerar análise" → O scanner cruza specs, produtos e dados para gerar insights
4. **Resultados** → Lista de sinais com prioridade (High 🔴 / Medium 🟡 / Low 🟢)

### Campos de cada sinal

| Campo | O que contém |
|-------|-------------|
| **Título** | Resumo do sinal (ex.: "CX300E: CIHS sem Grade Assist nativo de fábrica") |
| **Prioridade** | High, Medium, Low |
| **Descrição** | Contexto competitivo detalhado |
| **Ação recomendada** | O que a engenharia deveria fazer |
| **Concorrente** | Modelo do concorrente relevante |
| **Família** | Família CASE afetada |
| **Região** | Onde o sinal é mais relevante |

### Ações disponíveis por sinal

| Botão | O que faz |
|-------|-----------|
| **Fonte** | Abre link externo da fonte do dado |
| **Converter em Task** | Transforma o sinal em task de engenharia e navega para Subsystems |
| **Ver detalhes** | Navega para Engineering Subsystems do produto afetado |

### Feed automático do Field Intelligence
Sinais do Field Intelligence (quando losses citam um tema 2+ vezes) aparecem automaticamente no Scanner com badge "NOVO".

---

## 🤖 NexusChat — Assistente IA

### O que é
Assistente inteligente (IA) que opera como floating panel no canto inferior direito de qualquer página.

### Como funciona
1. Clique no ícone de chat (💬) no canto inferior direito
2. Digite sua pergunta ou use um dos prompts sugeridos
3. A IA recebe automaticamente o **contexto da página atual** (máquina selecionada, subsistema, região, dados filtrados)
4. Respostas são geradas via Supabase Edge Functions com streaming em tempo real

### Contexto automático por página
O NexusChat sabe onde você está e adapta o contexto:

| Página | Contexto enviado ao assistente |
|--------|-------------------------------|
| Dashboard | KPIs, regiões, sinais urgentes |
| Portfolio | Lista de máquinas filtradas, scores |
| Benchmarking | Máquina selecionada, concorrentes, scores |
| Subsystems | Máquina + subsistema + gaps + concorrentes |
| Regional Intelligence | Perfil da região, demanda, gaps |
| Next Gen Roadmap | Itens de roadmap, investimento, impacto |
| Field Intelligence | Relatórios de campo, métricas, features |
| Scanner | Sinais gerados, concorrentes, insights |

### Botão "Analisar com IA"
Vários componentes da plataforma têm botão "Analisar com IA" que preenche o chat com um prompt contextualizado:
- Em **Subsystems**: analisa componente com specs, gaps e concorrência
- Em **Next Gen Roadmap**: analisa item de roadmap com score delta e riscos
- Em **Field Intelligence**: analisa padrão de wins/losses
- Em **Scanner**: analisa sinal competitivo com recomendação

### Exemplos de perguntas ao assistente

| Cenário | Exemplo de prompt |
|---------|-------------------|
| Dashboard | "Quais são os 3 maiores riscos competitivos do portfólio CASE hoje?" |
| Subsistema | "Analise o gap hidráulico da CX300E e sugira 3 ações para MY2028" |
| Roadmap | "Qual o retorno competitivo do Grade Assist nativo se implementado em 2028?" |
| Field | "Com base nas losses recentes, qual feature deveria ser prioridade #1?" |
| Regional | "O que diferencia a estratégia CASE ideal para LATAM vs Europa?" |

---

## 🔄 Fluxos Integrados

### Fluxo 1: Do dashboard à ação de roadmap
```
Dashboard → Sinal urgente → Scanner → "Converter em Task" → Subsystems → NexusChat "Analisar com IA"
```

### Fluxo 2: Do campo ao roadmap
```
Field Intelligence → Registrar Loss → Feature faltante → Auto-gerada sugestão → Next Gen Roadmap
```

### Fluxo 3: Da análise regional ao portfólio
```
Regional Intelligence → Gap "Machine Control CRÍTICO em NA" → Portfolio (filtro NA) → Benchmarking → Subsystems
```

### Fluxo 4: Do benchmarking à próxima geração
```
Benchmarking → Trajetória Competitiva → "Enviar para Roadmap" → Next Gen Roadmap → "Analisar com IA"
```

### Fluxo 5: Análise completa de uma máquina
```
Portfolio → Selecionar CX300E → Subsystems (6 subsistemas) → Gap mais crítico → Scanner (foco CX300E) → Roadmap (itens afetando CX300E)
```

---

## ⚙️ Topbar — Barra Superior

| Elemento | Função |
|----------|--------|
| **Busca global** | Pesquisa rápida por máquinas, concorrentes, specs |
| **Seletor de região** | Filtro global que pode contextualizar várias páginas |
| **Toggle de tema** | Alterna entre Light Mode e Dark Mode |

---

## 📊 Glossário de Métricas

| Métrica | Significado | Range |
|---------|------------|-------|
| **Score geral** | Média dos 5 eixos de avaliação (powertrain, ergonomics, tech, maintenance, price/TCO) | 0-100 |
| **Score de subsistema** | Avaliação do subsistema com métricas ponderadas específicas | 0-100 |
| **Delta (Δ)** | Diferença projetada de score após implementação de um item de roadmap | +0 a +15 |
| **Fit regional** | Quão adequada é uma máquina CASE para uma região específica | 0-100 |
| **Win Rate** | % de vendas ganhas em relação ao total de decisões (wins + losses) | 0-100% |
| **Gap Coverage** | % de itens critical/high do roadmap que já estão em desenvolvimento | 0-100% |
| **Portfolio Readiness** | % de modelos com score ≥85 (prontos para next gen) | 0-100% |
| **Competitive Parity** | Delta médio CASE vs melhor concorrente por subsistema | Negativo = atrás, Positivo = à frente |

---

## 🎨 Legenda de Cores

| Cor | Significado |
|-----|------------|
| 🟢 Verde | Score ≥85, vantagem, sucesso, campo seguro |
| 🟡 Amarelo | Score 75-84, atenção, risco moderado |
| 🔴 Vermelho | Score <75, gap crítico, perda, risco alto |
| 🔵 Azul (primary) | CASE, ação principal, destaque |
| 🟠 Laranja | Concorrente, alerta emergente |
