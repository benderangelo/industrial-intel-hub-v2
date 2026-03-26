import { describe, it, expect } from "vitest";
import {
  createNexusMessage,
  parseAIResponse,
  loadNexusHistory,
  saveNexusHistory,
  NEXUS_HISTORY_KEY,
} from "@/lib/nexus-chat";

describe("nexus-chat", () => {
  describe("createNexusMessage", () => {
    it("cria mensagem do usuário com campos corretos", () => {
      const msg = createNexusMessage("user", "Olá mundo");
      expect(msg.role).toBe("user");
      expect(msg.content).toBe("Olá mundo");
      expect(msg.kind).toBe("default");
      expect(msg.id).toBeTruthy();
      expect(msg.timestamp).toBeTruthy();
    });

    it("cria mensagem de erro", () => {
      const msg = createNexusMessage("assistant", "Falha", "error");
      expect(msg.role).toBe("assistant");
      expect(msg.kind).toBe("error");
    });

    it("gera IDs únicos", () => {
      const a = createNexusMessage("user", "A");
      const b = createNexusMessage("user", "B");
      expect(a.id).not.toBe(b.id);
    });
  });

  describe("parseAIResponse", () => {
    it("retorna texto simples como part de texto", () => {
      const parts = parseAIResponse("Olá, como posso ajudar?");
      expect(parts).toHaveLength(1);
      expect(parts[0].type).toBe("text");
      expect(parts[0].content).toBe("Olá, como posso ajudar?");
    });

    it("extrai blocos de chart embutidos", () => {
      const response = `Aqui está o gráfico:\n[CHART:BAR]\n{"labels":["A","B"],"values":[10,20]}\n[/CHART]\nFim.`;
      const parts = parseAIResponse(response);
      expect(parts).toHaveLength(3);
      expect(parts[0].type).toBe("text");
      expect(parts[1].type).toBe("chart");
      if (parts[1].type === "chart") {
        expect(parts[1].chartType).toBe("BAR");
        expect(parts[1].data).toEqual({ labels: ["A", "B"], values: [10, 20] });
      }
      expect(parts[2].type).toBe("text");
    });

    it("lida com JSON inválido no chart mantendo como texto", () => {
      const response = `[CHART:RADAR]\ninvalid-json\n[/CHART]`;
      const parts = parseAIResponse(response);
      expect(parts).toHaveLength(1);
      expect(parts[0].type).toBe("text");
    });

    it("retorna string vazia como texto", () => {
      const parts = parseAIResponse("");
      expect(parts).toHaveLength(1);
      expect(parts[0].content).toBe("");
    });

    it("lida com múltiplos charts", () => {
      const response = `Texto 1\n[CHART:BAR]\n{"a":1}\n[/CHART]\nTexto 2\n[CHART:RADAR]\n{"b":2}\n[/CHART]\nTexto 3`;
      const parts = parseAIResponse(response);
      expect(parts).toHaveLength(5);
      expect(parts[0].type).toBe("text");
      expect(parts[1].type).toBe("chart");
      expect(parts[2].type).toBe("text");
      expect(parts[3].type).toBe("chart");
      expect(parts[4].type).toBe("text");
    });
  });

  describe("loadNexusHistory / saveNexusHistory", () => {
    beforeEach(() => {
      window.localStorage.removeItem(NEXUS_HISTORY_KEY);
    });

    it("retorna array vazio quando não há histórico", () => {
      expect(loadNexusHistory()).toEqual([]);
    });

    it("salva e carrega histórico corretamente", () => {
      const messages = [
        createNexusMessage("user", "Pergunta"),
        createNexusMessage("assistant", "Resposta"),
      ];
      saveNexusHistory(messages);
      const loaded = loadNexusHistory();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].content).toBe("Pergunta");
      expect(loaded[1].content).toBe("Resposta");
    });

    it("limita histórico a 50 mensagens", () => {
      const messages = Array.from({ length: 60 }, (_, i) => createNexusMessage("user", `Msg ${i}`));
      saveNexusHistory(messages);
      const loaded = loadNexusHistory();
      expect(loaded).toHaveLength(50);
    });

    it("lida com JSON inválido no localStorage", () => {
      window.localStorage.setItem(NEXUS_HISTORY_KEY, "não-é-json");
      expect(loadNexusHistory()).toEqual([]);
    });
  });
});
