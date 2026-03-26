import { Bot, Loader2, Send, Settings, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { NexusChartBlock } from "@/components/nexus/NexusChartBlock";
import {
  buildNexusChatContext,
  createNexusMessage,
  loadNexusHistory,
  parseAIResponse,
  saveNexusHistory,
  systemPrompt,
  type NexusMessage,
} from "@/lib/nexus-chat";
import { cn } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
const typingMessages = [
  "Analisando dados do portfólio...",
  "Cruzando specs com concorrentes...",
  "Identificando gaps de engenharia...",
  "Gerando visualizações...",
  "Preparando recomendações...",
];

const welcomeMessage = `🧠 **NEXUS AI**

Sou o motor de inteligência da plataforma CASE Nexus. Conheço cada produto do portfólio CASE, os concorrentes globais mapeados, os scores de engenharia de cada subsistema e os gaps competitivos identificados.

Posso te ajudar com:
- Análise comparativa entre qualquer produto CASE e concorrente
- Identificação de gaps técnicos e recomendações Next Gen
- Simulação de cenários de evolução de produto
- Gráficos comparativos de specs técnicas
- Briefings executivos para apresentações

Pergunte qualquer coisa sobre o portfólio.`;

const trimMessages = (messages: NexusMessage[]) => messages.slice(-50);

export function NexusChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [messages, setMessages] = useState<NexusMessage[]>(() => loadNexusHistory());
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const context = useMemo(
    () => buildNexusChatContext(location.pathname, location.search),
    [location.pathname, location.search],
  );

  useEffect(() => {
    saveNexusHistory(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, isStreaming]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  }, [draft]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = window.setInterval(() => {
      setTypingIndex((current) => (current + 1) % typingMessages.length);
    }, 2000);
    return () => window.clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string; open?: boolean }>;
      const prompt = customEvent.detail?.prompt?.trim();
      if (!prompt) return;
      if (customEvent.detail?.open) setOpen(true);
      void sendMessage(prompt);
    };

    window.addEventListener("nexus-ai:prompt", handlePrompt as EventListener);
    return () => window.removeEventListener("nexus-ai:prompt", handlePrompt as EventListener);
  }, [messages, isStreaming, draft, context]);

  useEffect(() => {
    let cancelled = false;

    const checkStatus = () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.localStorage.getItem("nexus_gemini_key");
        if (!cancelled) setStatus(apiKey ? "connected" : "disconnected");
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    };

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = async (prefilled?: string) => {
    const text = (prefilled ?? draft).trim();
    if (!text || isStreaming) return;

    const userMessage = createNexusMessage("user", text);
    const assistantMessage = createNexusMessage("assistant", "");
    const conversation = trimMessages([...messages, userMessage]);

    setDraft("");
    setMessages([...conversation, assistantMessage]);
    setIsStreaming(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.localStorage.getItem("nexus_gemini_key");

      if (!apiKey) {
        throw new Error("Chave de API do Google Gemini não configurada. Caso seja um ambiente local, insira uma VITE_GEMINI_API_KEY no arquivo .env ou informe-a na tela de Configurações da plataforma.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt + `\n\nMÓDULO ATIVO: ${context.currentPage}\n\nCONTEXTO DA PLATAFORMA:\n${context.platformContext}`,
      });

      const history = conversation.slice(0, -1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history,
      });

      const result = await chat.sendMessageStream(text);
      
      let assistantSoFar = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        assistantSoFar += chunkText;
        setMessages((current) => current.map((message) => (
          message.id === assistantMessage.id ? { ...message, content: assistantSoFar } : message
        )));
      }

      if (!assistantSoFar.trim()) {
        setMessages((current) => current.map((message) => (
          message.id === assistantMessage.id
            ? { ...message, content: "[DADO NÃO DISPONÍVEL — validar internamente]" }
            : message
        )));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao consultar o NEXUS AI.";
      setMessages((current) => current.map((entry) => (
        entry.id === assistantMessage.id
          ? {
            ...entry,
            content: message,
            kind: "error",
          }
          : entry
      )));
      toast({ title: "NEXUS AI indisponível", description: message, variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  const clearConversation = () => {
    if (!window.confirm("Limpar a conversa do NEXUS AI?")) return;
    setMessages([]);
    saveNexusHistory([]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="nexus-fab group"
        aria-label="Abrir NEXUS AI"
      >
        <span className="text-2xl text-primary-foreground">🧠</span>
        <span className={cn("nexus-fab-status", status === "connected" ? "bg-chart-success" : "bg-destructive")} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="h-screen w-full border-l border-border p-0 sm:max-w-[640px] [&>button]:hidden">
          <div className="flex h-full flex-col bg-card">
            <header className="flex h-[60px] items-center gap-3 border-b border-border px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">CN</div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-foreground">NEXUS AI</p>
                <p className="text-[11px] text-muted-foreground">Engenharia de Portfólio</p>
              </div>

              {context.headerBadge && (
                <span className="ml-auto rounded-md bg-primary/10 px-2 py-1 text-[11px] text-primary">{context.headerBadge}</span>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={clearConversation}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </header>

            {context.contextBanner && (
              <div className="border-b border-border bg-muted/50 px-4 py-2 text-[11px] text-muted-foreground">
                {context.contextBanner}
              </div>
            )}

            <ScrollArea className="flex-1 bg-card">
              <div className="space-y-4 px-4 py-5">
                {messages.length === 0 && (
                  <div className="rounded-2xl border border-border bg-muted/60 p-5 text-sm text-foreground/90 shadow-[0_12px_32px_hsl(var(--foreground)/0.04)]">
                    <div className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                      <span className="text-2xl">🧠</span>
                      <span>NEXUS AI</span>
                    </div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{welcomeMessage}</ReactMarkdown>
                  </div>
                )}

                {messages.map((message) => {
                  const parts = parseAIResponse(message.content);
                  const isUser = message.role === "user";

                  return (
                    <div key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[90%] overflow-hidden px-4 py-3 text-sm shadow-[0_10px_24px_hsl(var(--foreground)/0.05)]",
                          isUser
                            ? "rounded-[16px_16px_4px_16px] bg-primary text-primary-foreground"
                            : message.kind === "error"
                              ? "rounded-[16px_16px_16px_4px] border border-destructive/20 bg-destructive/5 text-foreground"
                              : "rounded-[16px_16px_16px_4px] bg-muted/70 text-foreground",
                        )}
                      >
                        {!isUser && (
                          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-primary">
                            <Bot className="h-3.5 w-3.5" />
                            <span>NEXUS AI</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          {parts.map((part, index) => (
                            part.type === "text" ? (
                              <div key={`${message.id}-text-${index}`} className="nexus-markdown break-words">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    table: ({ ...props }) => <table className="w-full border-collapse overflow-hidden rounded-lg border border-border text-xs" {...props} />,
                                    thead: ({ ...props }) => <thead className="bg-secondary/60" {...props} />,
                                    th: ({ ...props }) => <th className="border border-border px-2 py-2 text-left font-semibold" {...props} />,
                                    td: ({ ...props }) => <td className="border border-border px-2 py-2 align-top" {...props} />,
                                    code: ({ className, children, ...props }) => (
                                      <code className={cn("rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]", className)} {...props}>
                                        {children}
                                      </code>
                                    ),
                                  }}
                                >
                                  {part.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <NexusChartBlock key={`${message.id}-chart-${index}`} chartType={part.chartType} data={part.data} />
                            )
                          ))}
                        </div>

                        {message.kind === "error" && (
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}> 
                              <Settings className="mr-2 h-4 w-4" />Ir para Settings
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-[16px_16px_16px_4px] bg-muted/70 px-4 py-3 text-sm text-foreground shadow-[0_10px_24px_hsl(var(--foreground)/0.05)]">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-primary">
                        <Bot className="h-3.5 w-3.5" />
                        <span>NEXUS AI</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="nexus-typing-dot" />
                        <span className="nexus-typing-dot [animation-delay:120ms]" />
                        <span className="nexus-typing-dot [animation-delay:240ms]" />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{typingMessages[typingIndex]}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-border px-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {context.quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => void sendMessage(action)}
                    className="whitespace-nowrap rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border bg-card px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Pergunte sobre qualquer produto, concorrente ou estratégia..."
                  className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  disabled={!draft.trim() || isStreaming}
                  onClick={() => void sendMessage()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
