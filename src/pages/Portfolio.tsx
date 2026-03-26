import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Download, Filter, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EquipmentImage } from "@/components/EquipmentImage";
import { Slider } from "@/components/ui/slider";
import { caseMachines, getMachineCoverageRegions, getMachineOverallScore } from "@/data/caseData";

const scoreTone = (score: number | null) => score !== null && score >= 85 ? "bg-chart-success/10 text-chart-success" : score !== null && score >= 75 ? "bg-chart-warning/10 text-chart-warning" : "bg-destructive/10 text-destructive";

export default function Portfolio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionPreset = searchParams.get("region") ?? "All";
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [familyFilter, setFamilyFilter] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>(regionPreset);
  const [evOnly, setEvOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [powerRange, setPowerRange] = useState<[number, number]>([0, 400]);
  const [weightRange, setWeightRange] = useState<[number, number]>([0, 120000]);
  const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);

  const families = ["All", ...new Set(caseMachines.map((machine) => machine.family))];
  const regions = ["All", ...new Set(caseMachines.flatMap((machine) => getMachineCoverageRegions(machine.id)))];

  const filtered = caseMachines.filter((machine) => {
    const regionsForMachine = getMachineCoverageRegions(machine.id);
    const score = getMachineOverallScore(machine.id);
    return (categoryFilter === "All" || machine.category === categoryFilter)
      && (familyFilter === "All" || machine.family === familyFilter)
      && (regionFilter === "All" || regionsForMachine.includes(regionFilter))
      && (!evOnly || machine.electrified)
      && (machine.powerValue ?? 0) >= powerRange[0]
      && (machine.powerValue ?? 0) <= powerRange[1]
      && (machine.operatingWeightValue ?? 0) >= weightRange[0]
      && (machine.operatingWeightValue ?? 0) <= weightRange[1]
      && (!search || [machine.model, machine.family, machine.engine, machine.segment ?? "", ...regionsForMachine].some((value) => value.toLowerCase().includes(search.toLowerCase())))
      && score !== undefined;
  });

  const toggleComparison = (machineId: string) => {
    setComparisonSelection((current) => {
      if (current.includes(machineId)) return current.filter((id) => id !== machineId);
      if (current.length >= 4) return [...current.slice(1), machineId];
      return [...current, machineId];
    });
  };

  const exportCsv = () => {
    const headers = ["Modelo", "Família", "Categoria", "Powertrain", "Regiões", "Lifecycle", "EV", "Score"];
    const rows = filtered.map((machine) => [
      machine.model,
      machine.family,
      machine.category,
      machine.powertrainType ?? "—",
      getMachineCoverageRegions(machine.id).join(" | "),
      machine.lifecycleStatus ?? "Active Production",
      machine.electrified ? "EV" : "No",
      String(getMachineOverallScore(machine.id) ?? ""),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).split('"').join('""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "case-nexus-portfolio.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Diretório executivo com filtros completos, score geral, status de ciclo de vida e seleção para comparação.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button>
          <Button variant="outline" onClick={() => window.print()}><Download className="h-4 w-4" />Export PDF</Button>
          <Button disabled={comparisonSelection.length < 2} onClick={() => navigate(`/benchmarking?case=${comparisonSelection.join(",")}${regionFilter !== "All" ? `&region=${encodeURIComponent(regionFilter)}` : ""}`)}>Comparar selecionados</Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" />Filtros executivos</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-4">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar modelo, motor, família ou região" className="bg-secondary border-border" />
          <select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value)} className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground"><option value="All">Todas as famílias</option>{families.slice(1).map((family) => <option key={family} value={family}>{family}</option>)}</select>
          <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground"><option value="All">Todas as regiões</option>{regions.slice(1).map((region) => <option key={region} value={region}>{region}</option>)}</select>
          <div className="flex gap-2">{["All", "Heavy", "Light"].map((category) => <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={`rounded-md px-3 py-2 text-xs font-medium ${categoryFilter === category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{category}</button>)}</div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-border bg-secondary/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Potência</p>
            <Slider min={0} max={400} step={5} value={powerRange} onValueChange={(value) => setPowerRange(value as [number, number])} className="mt-4" />
            <p className="mt-2 text-xs text-muted-foreground">{powerRange[0]} – {powerRange[1]} hp</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Peso operacional</p>
            <Slider min={0} max={120000} step={1000} value={weightRange} onValueChange={(value) => setWeightRange(value as [number, number])} className="mt-4" />
            <p className="mt-2 text-xs text-muted-foreground">{weightRange[0]} – {weightRange[1]} lb</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Powertrain</p>
            <button type="button" onClick={() => setEvOnly((current) => !current)} className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-medium ${evOnly ? "bg-chart-success/10 text-chart-success" : "bg-background text-muted-foreground"}`}>{evOnly ? "Somente EV" : "Todos os powertrains"}</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{filtered.length} modelos filtrados</Badge>
          <Badge variant="outline">{comparisonSelection.length} selecionados para comparar</Badge>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Comparar</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Modelo</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Família</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Regiões</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Lifecycle</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Electric</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Score geral</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((machine) => {
              const selected = comparisonSelection.includes(machine.id);
              const score = getMachineOverallScore(machine.id);
              return (
                <tr key={machine.id} className="border-t border-border/60 transition-colors hover:bg-secondary/20">
                  <td className="px-4 py-4"><input type="checkbox" checked={selected} onChange={() => toggleComparison(machine.id)} className="h-4 w-4" /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <EquipmentImage src={machine.image} alt={machine.imageAlt} fallbackLabel={machine.model} className="h-14 w-20 rounded-xl bg-secondary/30" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{machine.model}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{machine.engine}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{machine.family}</td>
                  <td className="px-4 py-4 text-muted-foreground">{getMachineCoverageRegions(machine.id).join(" · ")}</td>
                  <td className="px-4 py-4"><Badge variant="outline">{machine.lifecycleStatus}</Badge></td>
                  <td className="px-4 py-4">{machine.electrified ? <Badge className="bg-chart-success/10 text-chart-success hover:bg-chart-success/10"><Zap className="mr-1 h-3 w-3" />EV</Badge> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-4"><Badge className={scoreTone(score)}>{score ?? "—"}</Badge></td>
                   <td className="px-4 py-4"><button type="button" onClick={() => navigate(`/subsystems/${machine.id}?subsystem=structure`)} className="text-muted-foreground transition-colors hover:text-primary"><ChevronRight className="h-4 w-4" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}