import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Radar, ExternalLink, AlertTriangle, Info, CheckCircle, PlusSquare, Trash2, Search, Sparkles } from "lucide-react";
import { caseMachines, getMachineEngineeringProfile } from "@/data/caseData";
import { competitorProducts, presetScannerInsights, priorityOptions, scannerFamilyOptions, scannerRegionOptions, type ScannerInsightPriority } from "@/data/webScannerCatalog";
import { buildCaseScannerProducts, buildSearchIndex, generateStaticInsights, getCaseDisplayFamily, normalizeRegion, searchProducts, sortInsights, type PersistedScannerInsight, type ScannerSearchItem } from "@/lib/web-scanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { buildFieldScannerInsights, loadFieldReports } from "@/lib/strategic-intelligence";

const subsystemKeywordMap = [
  { key: "powertrain", terms: ["powertrain", "motor", "engine"] },
  { key: "hydraulics", terms: ["hydraulic", "hidrául", "flow"] },
  { key: "transmission", terms: ["transmission", "drivetrain", "gear"] },
  { key: "implements", terms: ["bucket", "implement", "grade", "blade", "breakout"] },
  { key: "cabin", terms: ["cab", "cabin", "joystick", "display", "operator"] },
  { key: "structure", terms: ["structure", "chassis", "frame", "steering"] },
] as const;

const severityConfig = {
  High: { icon: AlertTriangle, color: "text-destructive", bg: "bg-primary/10", label: "High", border: "border-l-primary" },
  Medium: { icon: Info, color: "text-chart-warning", bg: "bg-background", label: "Medium", border: "border-l-chart-warning" },
  Low: { icon: CheckCircle, color: "text-chart-success", bg: "bg-background", label: "Low", border: "border-l-chart-success" },
};

const STORAGE_KEY = "web-scanner-insights-v1";
const CONVERTED_TASKS_KEY = "web-scanner-engineering-tasks-v1";
const NEW_BADGE_WINDOW_MS = 24 * 60 * 60 * 1000;

const brandColors: Record<string, string> = {
  Caterpillar: "hsl(45 100% 55%)",
  Komatsu: "hsl(210 100% 20%)",
  "Volvo CE": "hsl(221 100% 18%)",
  "John Deere": "hsl(101 40% 35%)",
  JCB: "hsl(48 100% 50%)",
  Bobcat: "hsl(356 79% 50%)",
  Kubota: "hsl(22 89% 58%)",
  DEVELON: "hsl(208 100% 36%)",
  Kobelco: "hsl(210 100% 27%)",
  Liebherr: "hsl(1 80% 48%)",
  CASE: "hsl(var(--primary))",
  Mecalac: "hsl(17 86% 56%)",
  SANY: "hsl(8 82% 48%)",
  SDLG: "hsl(43 88% 55%)",
  LiuGong: "hsl(46 95% 46%)",
  Shantui: "hsl(44 88% 48%)",
  Hidromek: "hsl(32 88% 50%)",
  Avant: "hsl(205 90% 40%)",
  "N/A": "hsl(var(--muted-foreground))",
};

const priorityOrder: ScannerInsightPriority[] = ["High", "Medium", "Low"];

const serializePresets = () => presetScannerInsights.map((insight) => ({ ...insight, createdAt: `${insight.date}T12:00:00.000Z` }));

const loadInsights = (): PersistedScannerInsight[] => {
  if (typeof window === "undefined") return serializePresets();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return serializePresets();

  try {
    const parsed = JSON.parse(stored) as PersistedScannerInsight[];
    return sortInsights(parsed);
  } catch {
    return serializePresets();
  }
};

const saveInsights = (insights: PersistedScannerInsight[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortInsights(insights)));
};

const persistEngineeringTask = (insight: PersistedScannerInsight, machineId: string, subsystem: string) => {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(CONVERTED_TASKS_KEY);
  const current = raw ? JSON.parse(raw) as Array<Record<string, string>> : [];
  const next = [{
    id: insight.id,
    machineId,
    subsystem,
    title: insight.title,
    description: insight.action,
    createdAt: new Date().toISOString(),
  }, ...current.filter((entry) => entry.id !== insight.id)];
  window.localStorage.setItem(CONVERTED_TASKS_KEY, JSON.stringify(next));
};

export default function Scanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get("focus");
  const caseProducts = useMemo(() => buildCaseScannerProducts(caseMachines), []);
  const searchIndex = useMemo(() => buildSearchIndex(caseProducts, competitorProducts), [caseProducts]);
  const [query, setQuery] = useState(focus ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(focus ?? "");
  const [selectedResult, setSelectedResult] = useState<ScannerSearchItem | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]>("All priorities");
  const [regionFilter, setRegionFilter] = useState<(typeof scannerRegionOptions)[number]>("Todas as regiões");
  const [familyFilter, setFamilyFilter] = useState<(typeof scannerFamilyOptions)[number]>("Todas as famílias");
  const [insights, setInsights] = useState<PersistedScannerInsight[]>(() => loadInsights());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    saveInsights(insights);
  }, [insights]);

  useEffect(() => {
    if (!focus) return;
    const matched = searchIndex.find((item) => item.name.toLowerCase() === focus.toLowerCase());
    if (matched) {
      setSelectedResult(matched);
      setQuery(matched.name);
      setDebouncedQuery(matched.name);
    }
  }, [focus, searchIndex]);

  useEffect(() => {
    if (selectedResult && query.trim() !== selectedResult.name) {
      setSelectedResult(null);
    }
  }, [query, selectedResult]);

  const autocompleteResults = useMemo(() => searchProducts(searchIndex, debouncedQuery), [debouncedQuery, searchIndex]);

  const matchedMachine = useMemo(() => {
    if (!selectedResult) return null;
    if (selectedResult.kind === "case") {
      return caseMachines.find((machine) => machine.id === selectedResult.machineId) ?? null;
    }

    const competitor = competitorProducts.find((item) => item.id === selectedResult.id);
    if (!competitor) return null;
    return caseMachines.find((machine) => getCaseDisplayFamily(machine).family === competitor.competesWithCaseFamily) ?? null;
  }, [selectedResult]);

  const fieldInsights = useMemo(() => buildFieldScannerInsights(loadFieldReports()), [insights.length]);
  const mergedInsights = useMemo(() => sortInsights([...fieldInsights, ...insights]), [fieldInsights, insights]);

  const filteredInsights = useMemo(() => mergedInsights.filter((insight) => {
    const matchesPriority = priorityFilter === "All priorities" || insight.priority === priorityFilter;
    const matchesRegion = regionFilter === "Todas as regiões" || insight.region === regionFilter;
    const matchesFamily = familyFilter === "Todas as famílias" || insight.family === familyFilter;
    const matchesSelected = !selectedResult || insight.competitorName === selectedResult.name || insight.affectedCaseProduct === selectedResult.name || (selectedResult.kind === "competitor" && insight.family === selectedResult.family) || (selectedResult.kind === "case" && insight.family === selectedResult.family);
    return matchesPriority && matchesRegion && matchesFamily && matchesSelected;
  }), [familyFilter, mergedInsights, priorityFilter, regionFilter, selectedResult]);

  const visibleHighCount = filteredInsights.filter((insight) => insight.priority === "High").length;
  const visibleFamilyCount = new Set(filteredInsights.map((insight) => insight.family)).size;

  const handleScan = async () => {
    setScanning(true);
    setScanCompleted(false);

    const selectedCompetitor = selectedResult?.kind === "competitor"
      ? competitorProducts.find((item) => item.id === selectedResult.id)
      : null;
    const batch = selectedCompetitor ? [selectedCompetitor] : [...competitorProducts];

    setProgress({ current: 0, total: batch.length });

    const generated: PersistedScannerInsight[] = [];

    for (let index = 0; index < batch.length; index += 1) {
      const competitor = batch[index];
      generated.push(...generateStaticInsights(competitor, caseProducts));
      setProgress({ current: index + 1, total: batch.length });
      await new Promise((resolve) => window.setTimeout(resolve, batch.length > 1 ? 20 : 80));
    }

    if (selectedResult?.kind === "case") {
      const familyCompetitors = competitorProducts.filter((product) => product.competesWithCaseFamily === selectedResult.family);
      familyCompetitors.forEach((competitor) => generated.push(...generateStaticInsights(competitor, caseProducts.filter((product) => product.machineId === selectedResult.machineId))));
    }

    setInsights((current) => sortInsights([...generated, ...current]));
    setScanning(false);
    setScanCompleted(true);
    window.setTimeout(() => setScanCompleted(false), 2000);
  };

  const resetInsights = () => {
    const defaults = serializePresets();
    setInsights(defaults);
    saveInsights(defaults);
  };

  const inferSubsystem = (text: string) => {
    const normalized = text.toLowerCase();
    return subsystemKeywordMap.find((entry) => entry.terms.some((term) => normalized.includes(term)))?.key ?? "structure";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Web Scanner</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cérebro analítico com filtros por família, prioridade, autocomplete competitivo e sinais automáticos de gap/vantagem.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Inserir modelo do concorrente ou produto CASE" className="border-border bg-secondary pl-10" />
            </div>
            {focus && !query && <p className="text-xs text-muted-foreground">Foco recebido do Dashboard/Scanner: {focus}</p>}
            {debouncedQuery.trim() && (
              <div className="absolute z-20 max-h-80 w-full overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-[0_20px_50px_hsl(var(--foreground)/0.08)]">
                {autocompleteResults.length > 0 ? autocompleteResults.map((result) => (
                  <button
                    key={`${result.kind}-${result.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedResult(result);
                      setQuery(result.name);
                      setDebouncedQuery(result.name);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary/30"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: brandColors[result.brand] ?? "hsl(var(--muted-foreground))" }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{result.type} — {result.family}</p>
                    </div>
                  </button>
                )) : (
                  <div className="rounded-xl border border-dashed border-border bg-secondary/10 px-3 py-4 text-sm text-muted-foreground">
                    Nenhum modelo encontrado na base de dados. Tente outro termo.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-4 xl:min-w-[760px]">
            <select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value as (typeof scannerFamilyOptions)[number])} className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground">
              {scannerFamilyOptions.map((family) => <option key={family} value={family}>{family}</option>)}
            </select>
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value as (typeof scannerRegionOptions)[number])} className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground">
              {scannerRegionOptions.map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityOptions)[number])} className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground">
              {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
            <Button onClick={handleScan} disabled={scanning || (!!query.trim() && !selectedResult)} className={scanCompleted ? "bg-chart-success text-chart-success-foreground hover:bg-chart-success" : ""}>
              <Radar className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? `Analisando... ${progress.current}/${progress.total}` : "Gerar análise"}
            </Button>
          </div>
        </div>
        {scanning && (
          <div className="mt-4 rounded-2xl border border-border bg-secondary/15 p-3">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Analisando {progress.total} concorrentes contra {caseProducts.length} produtos CASE...</span>
              <span>{Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{filteredInsights.length} sinais</Badge>
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">{visibleHighCount} high</Badge>
          <Badge variant="outline">{visibleFamilyCount} famílias</Badge>
          <Button variant="ghost" size="sm" onClick={resetInsights} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-4 w-4" />Limpar insights
          </Button>
        </div>
      </div>

      {matchedMachine && (
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Produto correlacionado</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{matchedMachine.model}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{getMachineEngineeringProfile(matchedMachine.id)?.executiveSummary ?? matchedMachine.productNote}</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredInsights.map((signal) => {
          const config = severityConfig[signal.priority];
          const Icon = config.icon;
          const sourceHref = signal.source.startsWith("http") ? signal.source : signal.source.includes("/") ? `https://${signal.source}` : null;
          const isNew = Date.now() - new Date(signal.createdAt).getTime() < NEW_BADGE_WINDOW_MS;
          return (
            <div key={signal.id} className={`rounded-3xl border border-border bg-card p-5 border-l-4 ${config.border}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{signal.title}</h3>
                      <Badge className={signal.priority === "High" ? "bg-destructive text-destructive-foreground hover:bg-destructive" : signal.priority === "Medium" ? "bg-chart-warning text-chart-warning-foreground hover:bg-chart-warning" : "bg-chart-success text-chart-success-foreground hover:bg-chart-success"}>{config.label}</Badge>
                      {isNew && <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">NOVO</Badge>}
                      {signal.convertedAt && <Badge variant="secondary">Convertido</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{signal.description}</p>
                    <p className="mt-2 text-xs text-foreground/80">{signal.action}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>{signal.competitorName}</span>
                      <span>•</span>
                      <span>{signal.family}</span>
                      <span>•</span>
                      <span>{normalizeRegion(signal.region)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (sourceHref) {
                        window.open(sourceHref, "_blank", "noopener,noreferrer");
                        return;
                      }
                      toast({ title: "Fonte", description: "Dados internos da plataforma" });
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />Fonte
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const machine = caseMachines.find((entry) => entry.model === signal.affectedCaseProduct) ?? caseMachines.find((entry) => entry.model === signal.affectedCaseProduct.replace("SN", "SV")) ?? matchedMachine;
                      if (!machine) return;
                      const subsystem = inferSubsystem(`${signal.title} ${signal.description} ${signal.action}`);
                      persistEngineeringTask(signal, machine.id, subsystem);
                      setInsights((current) => current.map((entry) => entry.id === signal.id ? { ...entry, convertedAt: new Date().toISOString() } : entry));
                      toast({ title: "Insight convertido em task de engenharia" });
                      navigate(`/subsystems/${machine.id}?subsystem=${subsystem}`);
                    }}
                  >
                    <PlusSquare className="h-4 w-4" />Converter em Task
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const machine = caseMachines.find((entry) => entry.model === signal.affectedCaseProduct) ?? matchedMachine;
                      if (!machine) return;
                      navigate(`/subsystems/${machine.id}?subsystem=${inferSubsystem(`${signal.title} ${signal.description} ${signal.action}`)}`);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />Ver detalhes
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}