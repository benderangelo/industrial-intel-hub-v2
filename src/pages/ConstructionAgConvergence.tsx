import { useState, useMemo } from "react";
import { 
  Tractor, Zap, Cpu, Layers, 
  ArrowRight, BrainCircuit, LineChart, Leaf,
  Settings, Factory, PackageOpen, RefreshCcw, TrendingDown,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// Metadata mapping for icons and core metrics
const MACHINE_METADATA: any = {
  "pa_carregadeira": { icon: <Factory className="h-6 w-6" />, defaultSavings: 18 },
  "escavadeira": { icon: <Tractor className="h-6 w-6" />, defaultSavings: 25 },
  "minicarregadeira": { icon: <Tractor className="h-6 w-6" />, defaultSavings: 30 },
  "retroescavadeira": { icon: <Factory className="h-6 w-6" />, defaultSavings: 35 },
  "motoniveladora": { icon: <Tractor className="h-6 w-6" />, defaultSavings: 10 },
  "telehandler": { icon: <Layers className="h-6 w-6" />, defaultSavings: 28 }
};

const SEGMENT_METADATA: any = {
  "sucroenergetico": { ghg: 92, maint: 48 },
  "graos": { ghg: 45, maint: 25 },
  "fertilizantes": { ghg: 30, maint: 65 },
  "florestal": { ghg: 85, maint: 88 },
  "aves": { ghg: 70, maint: 40 },
  "pecuaria": { ghg: 55, maint: 35 },
  "leite": { ghg: 50, maint: 30 },
  "cafe": { ghg: 40, maint: 45 },
  "curvas_nivel": { ghg: 65, maint: 55 },
  "algodao": { ghg: 60, maint: 20 }
};

export default function ConstructionAgConvergence() {
  const { t } = useTranslation();
  
  const [machine, setMachine] = useState("pa_carregadeira");
  const [segment, setSegment] = useState("sucroenergetico");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Available Machines and Segments based on the i18n structure
  const MACHINES = [
    "pa_carregadeira", "escavadeira", "minicarregadeira", 
    "retroescavadeira", "motoniveladora", "telehandler"
  ];

  const SEGMENTS = [
    "sucroenergetico", "graos", "fertilizantes", "florestal", 
    "aves", "pecuaria", "leite", "cafe", "curvas_nivel", "algodao"
  ];

  // Helper to check if a specific combination has simulation data
  const hasData = useMemo(() => {
    // We check i18next's resource bundle directly or just assume existence based on the keys we added
    return !!t(`convergence.simData.${machine}.${segment}.implement`, { defaultValue: "" });
  }, [machine, segment, t]);

  // Adjust segment if it's not a common one (though we added all combinations in our JSON)
  // For this UI, we allow all for now, as we provided a complete matrix in simData

  // Dynamically calculate benefits based on selections
  const benefitsData = useMemo(() => {
    // Base values from metadata
    const baseSavings = MACHINE_METADATA[machine]?.defaultSavings || 15;
    const baseGhg = SEGMENT_METADATA[segment]?.ghg || 0;
    const baseMaint = SEGMENT_METADATA[segment]?.maint || 0;

    // Cross-impact logic (dynamic variation)
    const machineFactor = machine === 'pa_carregadeira' ? 1.2 : machine === 'escavadeira' ? 1.1 : 1.0;
    const segmentFactor = segment === 'sucroenergetico' ? 1.3 : segment === 'pecuaria' ? 0.9 : 1.1;

    return [
      { subject: t('convergence.ghg'), value: Math.min(100, baseGhg * segmentFactor), fullMark: 100, key: 'ghg' },
      { subject: t('convergence.opexTco'), value: Math.min(100, baseSavings * machineFactor * 2.5), fullMark: 100, key: 'opexTco' },
      { subject: t('convergence.failuresMaint'), value: Math.min(100, baseMaint * machineFactor), fullMark: 100, key: 'failuresMaint' },
      { subject: t('convergence.feasibility'), value: segment === 'sucroenergetico' ? 95 : 75, fullMark: 100, key: 'feasibility' },
      { subject: t('scanner.status.signals'), value: machine === 'minicarregadeira' ? 90 : 80, fullMark: 100, key: 'signals' }
    ];
  }, [machine, segment, t]);

  // Dynamically calculate TCO projection based on savings
  const tcoData = useMemo(() => {
    const savings = benefitsData.find(b => b.key === 'opexTco')?.value || 20;
    const months = [
      t('common.months.jan'), t('common.months.mar'), t('common.months.jun'), 
      t('common.months.sep'), t('common.months.dec')
    ];
    
    return months.map((m, i) => ({
      month: m,
      trad: 100 + i * 250,
      hybrid: 100 + i * (250 * (1 - (savings / 100)))
    }));
  }, [benefitsData, t]);

  const innovationData = [
    { subject: t('convergence.innovation.trends.automation'), A: 85, fullMark: 100 },
    { subject: t('convergence.innovation.trends.electrification'), A: machine === 'minicarregadeira' ? 95 : 65, fullMark: 100 },
    { subject: t('convergence.innovation.trends.telematics'), A: 95, fullMark: 100 },
    { subject: t('convergence.innovation.trends.alt_fuel'), A: segment === 'sucroenergetico' ? 98 : 70, fullMark: 100 },
  ];

  const nextGenEquip = [
    { model: "CX15EV", family: "Mini Excavator", tech: "Zero Emission / Lithium-Ion" },
    { model: "750M Next Gen", family: "Dozer", tech: "3D Machine Control / Dual Path" },
    { model: "821G Stage V", family: "Wheel Loader", tech: "Integrated Payload / Eco-Mode" },
    { model: "SV280B", family: "Skid Steer", tech: "High Flow Hydraulics / Smart Control" },
  ];

  const handleRadarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const key = data.activePayload[0].payload.key;
      if (key) setSelectedMetric(key);
    }
  };

  // Logic for Feasibility
  const getFeasibility = () => {
    if (segment === 'curvas_nivel' || segment === 'florestal') return t('convergence.feasibilityLevels.High');
    if (segment === 'sucroenergetico' || segment === 'algodao') return t('convergence.feasibilityLevels.Very High');
    return t('convergence.feasibilityLevels.Medium');
  };

  return (
    <div className="flex-1 space-y-6 p-6 pb-20 fade-in text-foreground">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Layers className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("convergence.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-2xl">
            {t("convergence.desc")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card className="bg-card/50 backdrop-blur border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {t("convergence.ghgReduction")} <Leaf className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">22%</div></CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {t("convergence.plugPlay")} <PackageOpen className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">14 {t('scanner.status.signals')}</div></CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {t("convergence.maintReduction")} <Cpu className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600 dark:text-amber-400">15.5%</div></CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* SETUP PANEL */}
        <div className="xl:col-span-4 space-y-6">
          <Card>
            <CardHeader className="bg-muted/50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> {t("convergence.setupOp")}
              </CardTitle>
              <CardDescription>{t("convergence.setupDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("convergence.baseMachine")}</label>
                <Select value={machine} onValueChange={setMachine}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MACHINES.map(m => (
                      <SelectItem key={m} value={m}>{t(`convergence.machines.${m}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("convergence.segment")}</label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENTS.map(s => (
                      <SelectItem key={s} value={s}>{t(`convergence.segments.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2 text-primary">
                <BrainCircuit className="h-5 w-5" /> {t("convergence.insightsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <span className="text-muted-foreground">{t("convergence.feasibility")}</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {getFeasibility()}
                </Badge>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <span className="text-muted-foreground">{t("convergence.hydraulicReq")}</span>
                <span className="font-mono text-xs">{t(`convergence.simData.${machine}.${segment}.hydraulic`, { defaultValue: t('common.unavailable') })}</span>
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground block mb-2">{t("convergence.aiRecommendation")}</span>
                <p className="text-foreground italic border-l-2 border-primary pl-3 text-xs leading-relaxed">
                  "{t(`convergence.simData.${machine}.${segment}.insight`, { defaultValue: t('common.moreSoon') })}"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VISUALIZER AND CHARTS */}
        <div className="xl:col-span-8 space-y-6">
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="w-32 h-32 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" /> {t("convergence.nexusMatchmaker")}
              </CardTitle>
              <CardDescription>{t("convergence.valPressureFlow")}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                    {MACHINE_METADATA[machine]?.icon || <Factory />}
                  </div>
                  <div className="max-w-[120px]">
                    <p className="text-xs font-bold">{t(`convergence.machines.${machine}`)}</p>
                    <p className="text-[10px] text-muted-foreground">{t("convergence.baseAsset")}</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <ArrowRightLeft className="h-8 w-8 text-primary/40 animate-pulse" />
                </div>

                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <PackageOpen className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="max-w-[150px]">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {t(`convergence.simData.${machine}.${segment}.implement`, { defaultValue: 'Generic Implement' })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t("convergence.approvedImplement")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2 text-center md:text-left">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                  <LineChart className="h-4 w-4 text-primary" /> {t("convergence.tcoProjection")}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] pt-4 cursor-pointer" onClick={() => setSelectedMetric('opexTco')}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tcoData}>
                    <defs>
                      <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHybrid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="trad" stroke="#ef4444" fillOpacity={1} fill="url(#colorTrad)" name={t('convergence.tradSetup')} />
                    <Area type="monotone" dataKey="hybrid" stroke="#eab308" fillOpacity={1} fill="url(#colorHybrid)" name={t('convergence.hybridSetup')} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2 text-center md:text-left">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                  <TrendingDown className="h-4 w-4 text-emerald-500" /> {t("convergence.benefitsMetrics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={benefitsData} onClick={handleRadarClick}>
                    <PolarGrid stroke="var(--primary)" strokeOpacity={0.1} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={t("convergence.benefitsMetrics")}
                      dataKey="value"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.4}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>

              {/* OVERLAY EXPLICATIVO */}
              {selectedMetric && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 p-6 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-300">
                  <div className="mb-4 p-3 bg-primary/10 rounded-full">
                    {selectedMetric === 'ghg' && <Leaf className="h-8 w-8 text-emerald-500" />}
                    {selectedMetric === 'opexTco' && <LineChart className="h-8 w-8 text-blue-500" />}
                    {selectedMetric === 'failuresMaint' && <Cpu className="h-8 w-8 text-amber-500" />}
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    {t(`convergence.technicalDetails.${selectedMetric}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {t(`convergence.technicalDetails.${selectedMetric}.content`)}
                  </p>
                  <button 
                    onClick={() => setSelectedMetric(null)}
                    className="mt-6 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    {t('common.ready')}
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* INOVAÇÃO E TENDÊNCIAS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pb-12">
            <Card className="md:col-span-12 border-primary/20 bg-primary/5">
              <HeaderIconSection 
                title={t("convergence.innovation.title")} 
                subtitle={t("convergence.innovation.subtitle")}
                icon={<Cpu className="h-6 w-6 text-primary" />}
              />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="h-[300px] w-full">
                    <p className="text-xs font-bold text-center mb-4 uppercase tracking-tighter text-muted-foreground">{t("convergence.innovation.readinessTitle")}</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={innovationData}>
                        <PolarGrid stroke="var(--primary)" strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="TRL"
                          dataKey="A"
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">{t("convergence.innovation.equipmentTitle")}</p>
                    <div className="grid gap-3">
                      {nextGenEquip.map((eq, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:border-primary/50 transition-colors group">
                          <div>
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{eq.model}</p>
                            <p className="text-[10px] text-muted-foreground italic">{eq.family}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/10">
                            {eq.tech}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderIconSection({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 border-b flex items-center gap-4">
      <div className="p-2 bg-background rounded-lg border">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
