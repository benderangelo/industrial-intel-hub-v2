import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { NexusChartType } from "@/lib/nexus-chat";

type GenericChartData = Record<string, string | number>;

interface NexusChartBlockProps {
  chartType: NexusChartType;
  data: Record<string, unknown>;
}

const fallbackFill = "hsl(var(--primary))";
const competitorFill = "hsl(var(--chart-competitor))";
const successFill = "hsl(var(--chart-success))";
const warningFill = "hsl(var(--chart-warning))";
const dangerFill = "hsl(var(--destructive))";

const scoreFill = (value: number) => (value >= 85 ? successFill : value >= 75 ? warningFill : dangerFill);

export function NexusChartBlock({ chartType, data }: NexusChartBlockProps) {
  const title = typeof data.title === "string" ? data.title : "Visualização";

  return (
    <div className="my-3 rounded-xl border border-border bg-background p-3 shadow-[0_12px_30px_hsl(var(--foreground)/0.06)]">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-foreground/70">{title}</p>

      {chartType === "BAR" && (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={(data.data as GenericChartData[]) ?? []} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={(data.xKey as string) ?? "name"} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: (data.yLabel as string) ?? "Valor", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip />
            <Bar dataKey={(data.yKey as string) ?? "value"} radius={[4, 4, 0, 0]}>
              {(((data.data as GenericChartData[]) ?? [])).map((entry, index) => (
                <Cell key={`${String(entry.name ?? index)}-${index}`} fill={typeof entry.fill === "string" ? entry.fill : fallbackFill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {chartType === "RADAR" && (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={(data.data as GenericChartData[]) ?? []}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subsystem" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <Radar name="CASE" dataKey="case" stroke={fallbackFill} fill={fallbackFill} fillOpacity={0.2} strokeWidth={2} />
            <Radar name={(data.competitorName as string) ?? "Concorrente"} dataKey="competitor" stroke={competitorFill} fill={competitorFill} fillOpacity={0.1} strokeWidth={1.5} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {chartType === "COMPARISON" && (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={(data.data as GenericChartData[]) ?? []} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="case" name="CASE" fill={fallbackFill} radius={[4, 4, 0, 0]} />
            <Bar dataKey="competitor" name={(data.competitorName as string) ?? "Concorrente"} fill={competitorFill} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {chartType === "SCORES" && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={(data.data as GenericChartData[]) ?? []} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 72 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {(((data.data as GenericChartData[]) ?? [])).map((entry, index) => (
                <Cell key={`${String(entry.name ?? index)}-${index}`} fill={scoreFill(Number(entry.score ?? 0))} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
