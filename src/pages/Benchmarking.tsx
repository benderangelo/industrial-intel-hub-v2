import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { BenchmarkComparisonTab } from "@/components/benchmarking/BenchmarkComparisonTab";
import { CompetitiveTrajectoryTab } from "@/components/benchmarking/CompetitiveTrajectoryTab";
import { PortfolioPrioritizationTab } from "@/components/benchmarking/PortfolioPrioritizationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const benchmarkTabs = [
  { value: "comparison", label: "Comparação" },
  { value: "trajectory", label: "Trajetória Competitiva" },
  { value: "prioritization", label: "Priorização de Portfólio" },
] as const;

export default function Benchmarking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return benchmarkTabs.some((item) => item.value === tab) ? tab : "comparison";
  }, [searchParams]);

  const handleTabChange = (nextTab: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Competitor Benchmarking</h1>
        <p className="text-sm text-muted-foreground">Benchmark técnico, trajetória competitiva e priorização objetiva do portfólio na mesma camada analítica.</p>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl border border-border bg-card p-2">
          {benchmarkTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="comparison" className="mt-0">
          <BenchmarkComparisonTab />
        </TabsContent>
        <TabsContent value="trajectory" className="mt-0">
          <CompetitiveTrajectoryTab />
        </TabsContent>
        <TabsContent value="prioritization" className="mt-0">
          <PortfolioPrioritizationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}