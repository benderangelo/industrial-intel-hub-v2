import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accentClass?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, accentClass = "text-primary" }: KpiCardProps) {
  return (
    <div className="kpi-card section-enter">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className={`text-2xl font-bold data-mono ${accentClass}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className={`h-5 w-5 ${accentClass}`} />
        </div>
      </div>
      {trend && (
        <p className="text-xs text-chart-success mt-3 font-medium">{trend}</p>
      )}
    </div>
  );
}
