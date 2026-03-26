# Industrial Intel Hub

Plataforma de inteligência de portfólio para equipamentos de construção. Consolida análise competitiva, benchmarking de engenharia, inteligência regional e roadmap estratégico em uma interface unificada.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Edge Functions)
- **Mapas**: Leaflet
- **Gráficos**: Recharts
- **Chat AI**: NEXUS AI via Supabase Edge Function (streaming SSE)

## Módulos

| Módulo | Rota | Descrição |
|---|---|---|
| Dashboard | `/` | Macro view global com KPIs, globo interativo e comparação regional |
| Portfolio | `/portfolio` | Diretório de produtos CASE com specs e scores |
| Benchmarking | `/benchmarking` | Análise competitiva, trajetória e priorização |
| Subsystems | `/subsystems` | Engenharia por subsistema (powertrain, hidráulica, etc.) |
| Scanner | `/scanner` | Web scanner de sinais competitivos |
| Regional Intelligence | `/regional-intelligence` | Demanda e gaps por região |
| Next Gen Roadmap | `/next-gen-roadmap` | Roadmap de evolução de produto |
| Field Intelligence | `/field-intelligence` | Relatórios de campo, win/loss |
| Settings | `/settings` | Configuração da plataforma |

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# 3. Rodar em modo desenvolvimento
npm run dev
# → http://localhost:8080
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 8080) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | ESLint |

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon (pública) do Supabase |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
