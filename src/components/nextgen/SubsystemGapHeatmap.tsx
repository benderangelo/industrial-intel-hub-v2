import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  caseMachines,
  getMachineEngineeringProfile,
  roadmapItems,
  type EngineeringSubsystemKey,
} from "@/data/caseData";

const SUBSYSTEM_KEYS: EngineeringSubsystemKey[] = ["structure", "powertrain", "hydraulics", "transmission", "implements", "cabin"];
const SUBSYSTEM_LABELS: Record<EngineeringSubsystemKey, string> = {
  structure: "EST", powertrain: "PWR", hydraulics: "HID", transmission: "TRN", implements: "IMP", cabin: "CAB",
};

const cellColor = (score: number) => {
  if (score >= 90) return { bg: "hsl(134 41% 88%)", text: "hsl(134 62% 21%)" };
  if (score >= 85) return { bg: "hsl(134 41% 92%)", text: "hsl(134 62% 28%)" };
  if (score >= 75) return { bg: "hsl(46 100% 90%)", text: "hsl(45 94% 27%)" };
  return { bg: "hsl(354 70% 91%)", text: "hsl(354 61% 28%)" };
};

export function SubsystemGapHeatmap() {
  const navigate = useNavigate();

  const families = useMemo(() => {
    const map = new Map<string, string[]>();
    caseMachines.forEach((m) => {
      const existing = map.get(m.family) ?? [];
      existing.push(m.id);
      map.set(m.family, existing);
    });
    return Array.from(map.entries()).map(([family, ids]) => ({ family, ids }));
  }, []);

  const matrix = useMemo(() => {
    return families.map(({ family, ids }) => {
      const scores: Record<EngineeringSubsystemKey, { avg: number; roadmapCount: number; bestMachineId: string }> = {} as any;
      SUBSYSTEM_KEYS.forEach((key) => {
        let total = 0, count = 0;
        let bestScore = 0, bestId = ids[0];
        ids.forEach((id) => {
          const profile = getMachineEngineeringProfile(id);
          const sub = profile?.subsystems.find((s) => s.key === key);
          if (sub) { total += sub.score; count++; if (sub.score > bestScore) { bestScore = sub.score; bestId = id; } }
        });
        const roadmapCount = roadmapItems.filter((item) =>
          item.subsystem === key && item.affectedModels.some((model) => ids.includes(model))
        ).length;
        scores[key] = { avg: count > 0 ? Math.round(total / count) : 0, roadmapCount, bestMachineId: bestId };
      });
      return { family, ids, scores };
    });
  }, [families]);

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_40px_hsl(var(--foreground)/0.05)]">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Subsystem Gap Heatmap</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">Maturidade por família × subsistema</h2>
        <p className="mt-1 text-sm text-muted-foreground">Clique na célula para navegar até o subsistema da máquina.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Família</th>
              {SUBSYSTEM_KEYS.map((key) => (
                <th key={key} className="px-3 py-2 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{SUBSYSTEM_LABELS[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ family, scores }) => (
              <tr key={family} className="border-t border-border/50">
                <td className="px-3 py-2.5 text-xs font-semibold text-foreground">{family}</td>
                {SUBSYSTEM_KEYS.map((key) => {
                  const { avg, roadmapCount, bestMachineId } = scores[key];
                  const color = cellColor(avg);
                  return (
                    <td key={key} className="px-1.5 py-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/subsystems/${bestMachineId}?subsystem=${key}`)}
                        className="flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-[transform,box-shadow] duration-200 hover:shadow-md active:scale-[0.96]"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        <span className="text-base font-extrabold leading-none">{avg}</span>
                        {roadmapCount > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">{roadmapCount} roadmap</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
