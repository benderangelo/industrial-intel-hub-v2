import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1),
  })).min(1),
  platformContext: z.string().min(1),
  currentPage: z.string().min(1),
});

const systemPrompt = `Você é o NEXUS AI, assistente sênior de engenharia de portfólio da CASE Nexus.

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ connected: false, error: "LOVABLE_API_KEY is not configured" }), {
      status: req.method === "GET" ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({ connected: true, provider: "lovable-ai" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = requestSchema.safeParse(await req.json());
    if (!body.success) {
      return new Response(JSON.stringify({ error: "Invalid chat payload", details: body.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, platformContext, currentPage } = body.data;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: `MÓDULO ATIVO: ${currentPage}\n\nCONTEXTO DA PLATAFORMA:\n${platformContext}` },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: `AI gateway error [${response.status}]: ${text}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
