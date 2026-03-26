import { Bell, Download, Layers3, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const operationalCards = [
    {
      title: "Data sources",
      description: "Base central sincronizada entre Portfolio, Dashboard, Benchmarking, Engineering e Scanner.",
      icon: Layers3,
      badge: "Unified",
    },
    {
      title: "Export preferences",
      description: "CSV e PDF já disponíveis no diretório executivo com filtros ativos.",
      icon: Download,
      badge: "Ready",
    },
    {
      title: "Notifications",
      description: "Alertas críticos seguem priorização high/medium/low no Scanner e no Dashboard.",
      icon: Bell,
      badge: "Live",
    },
  ] as const;

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      description: "Superfícies claras para leitura e análise diurna.",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Visual industrial escuro com foco em contraste e densidade.",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Segue automaticamente a preferência do dispositivo.",
      icon: Monitor,
    },
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferências visuais e leitura operacional da plataforma.</p>
      </div>

      <Card className="section-enter border-border bg-card/90 shadow-[0_18px_60px_hsl(var(--background)/0.28)]">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Escolha entre light, dark ou system. Tema atual: <span className="font-medium text-foreground">{resolvedTheme ?? theme ?? "light"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;

            return (
              <Button
                key={option.value}
                variant="outline"
                className={`h-auto justify-start rounded-xl border-border px-4 py-4 text-left transition-[box-shadow,background-color,border-color] duration-300 active:scale-[0.98] ${
                  isActive ? "border-primary bg-primary/10 shadow-[0_12px_30px_hsl(var(--primary)/0.18)]" : "bg-background hover:bg-secondary"
                }`}
                onClick={() => setTheme(option.value)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-secondary p-2 text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{option.label}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {operationalCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="section-enter border-border bg-card/90 shadow-[0_18px_44px_hsl(var(--foreground)/0.05)]">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-secondary p-3 text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="border-border bg-secondary/40 text-foreground">{item.badge}</Badge>
                </div>
                <div>
                  <CardTitle className="text-base text-foreground">{item.title}</CardTitle>
                  <CardDescription className="mt-1 text-sm">{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <Card className="section-enter border-border bg-card/90 shadow-[0_18px_44px_hsl(var(--foreground)/0.05)]">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Operational status</CardTitle>
          <CardDescription>
            Tema atual: <span className="font-medium text-foreground">{resolvedTheme ?? theme ?? "light"}</span> · experiência analítica sincronizada entre módulos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Portfolio + Benchmarking conectados</Badge>
          <Badge className="bg-accent/10 text-accent hover:bg-accent/10">Dashboard + mapa com camadas</Badge>
          <Badge className="bg-chart-warning/10 text-chart-warning hover:bg-chart-warning/10">Engineering + Scanner ativos</Badge>
          <Button variant="outline" className="ml-auto">Mais controles em breve</Button>
        </CardContent>
      </Card>
    </div>
  );
}
