import { describe, it, expect } from "vitest";
import {
  normalizeRegion,
  searchProducts,
  sortInsights,
  buildSearchIndex,
  type PersistedScannerInsight,
  type ScannerCaseProduct,
} from "@/lib/web-scanner";
import type { CompetitorProduct } from "@/data/webScannerCatalog";

describe("web-scanner", () => {
  describe("normalizeRegion", () => {
    it("normaliza north_america", () => expect(normalizeRegion("north_america")).toBe("North America"));
    it("normaliza latin_america", () => expect(normalizeRegion("latin_america")).toBe("Latin America"));
    it("normaliza asia_pacific", () => expect(normalizeRegion("asia_pacific")).toBe("Asia Pacific"));
    it("normaliza apac", () => expect(normalizeRegion("apac")).toBe("Asia Pacific"));
    it("normaliza europe", () => expect(normalizeRegion("europe")).toBe("Europe"));
    it("normaliza middle_east", () => expect(normalizeRegion("middle_east")).toBe("Middle East"));
    it("normaliza africa", () => expect(normalizeRegion("africa")).toBe("Africa"));
    it("normaliza oceania", () => expect(normalizeRegion("oceania")).toBe("Oceania"));
    it("retorna Global para null", () => expect(normalizeRegion(null)).toBe("Global"));
    it("retorna Global para undefined", () => expect(normalizeRegion(undefined)).toBe("Global"));
    it("repassa região desconhecida", () => expect(normalizeRegion("South Asia")).toBe("South Asia"));
  });

  describe("sortInsights", () => {
    const makeInsight = (title: string, priority: "High" | "Medium" | "Low", date: string): PersistedScannerInsight => ({
      id: title,
      title,
      priority,
      date,
      description: "",
      action: "",
      affectedCaseProduct: "",
      competitorName: "",
      competitorBrand: "",
      family: "",
      region: "",
      source: "",
      type: "gap",
      createdAt: `${date}T12:00:00.000Z`,
    });

    it("ordena por prioridade (High > Medium > Low)", () => {
      const insights = [
        makeInsight("Low", "Low", "2026-01-01"),
        makeInsight("High", "High", "2026-01-01"),
        makeInsight("Medium", "Medium", "2026-01-01"),
      ];
      const sorted = sortInsights(insights);
      expect(sorted[0].priority).toBe("High");
      expect(sorted[1].priority).toBe("Medium");
      expect(sorted[2].priority).toBe("Low");
    });

    it("ordena por data dentro da mesma prioridade (mais recente primeiro)", () => {
      const insights = [
        makeInsight("Antigo", "High", "2025-01-01"),
        makeInsight("Novo", "High", "2026-06-01"),
      ];
      const sorted = sortInsights(insights);
      expect(sorted[0].title).toBe("Novo");
      expect(sorted[1].title).toBe("Antigo");
    });

    it("deduplica por título mantendo o mais recente", () => {
      const insights = [
        makeInsight("Dup", "High", "2025-01-01"),
        makeInsight("Dup", "High", "2026-06-01"),
      ];
      const sorted = sortInsights(insights);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].date).toBe("2026-06-01");
    });
  });

  describe("searchProducts", () => {
    const items = [
      { id: "1", kind: "case" as const, name: "CASE 580SV", brand: "CASE", type: "Backhoe Loader", family: "N Series" },
      { id: "2", kind: "competitor" as const, name: "CAT 420F2", brand: "Caterpillar", type: "Backhoe Loader", family: "N Series" },
      { id: "3", kind: "case" as const, name: "CASE CX350E", brand: "CASE", type: "Excavator", family: "E Series" },
    ];

    it("busca por nome parcial", () => {
      const result = searchProducts(items, "580");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("CASE 580SV");
    });

    it("busca por brand", () => {
      const result = searchProducts(items, "Caterpillar");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("CAT 420F2");
    });

    it("busca por tipo de equipamento", () => {
      const result = searchProducts(items, "Backhoe");
      expect(result).toHaveLength(2);
    });

    it("busca case-insensitive", () => {
      const result = searchProducts(items, "case");
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("retorna vazio para query vazia", () => {
      expect(searchProducts(items, "")).toEqual([]);
      expect(searchProducts(items, "  ")).toEqual([]);
    });

    it("limita resultados a 8", () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({ id: `id-${i}`, kind: "case" as const, name: `CASE ${i}`, brand: "CASE", type: "Loader", family: "G Series" }));
      expect(searchProducts(manyItems, "CASE").length).toBeLessThanOrEqual(8);
    });

    it("prioriza resultados com match no início do nome", () => {
      const result = searchProducts(items, "cas");
      expect(result[0].name).toMatch(/^CAS/i);
    });
  });
});
