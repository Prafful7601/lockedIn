// 7-day activity heatmap. Each cell's brightness reflects coding time; a small
// accent dot marks days the DSA task was completed. Pure render — no state.

import type { HeatCell } from "@/lib/data";
import { formatSeconds } from "@/lib/date";

function intensityClass(seconds: number): string {
  const mins = seconds / 60;
  if (mins <= 0) return "bg-ink-700";
  if (mins < 30) return "bg-accent/20";
  if (mins < 60) return "bg-accent/40";
  if (mins < 120) return "bg-accent/60";
  return "bg-accent/90";
}

function weekday(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
  });
}

export default function Heatmap({ cells }: { cells: HeatCell[] }) {
  return (
    <div className="flex items-end gap-2">
      {cells.map((c) => (
        <div key={c.date} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            title={`${c.date}\nCoding: ${formatSeconds(c.coding)}\nYouTube: ${formatSeconds(
              c.youtube,
            )}\nDSA: ${c.dsaDone ? "done" : "—"}`}
            className={`relative aspect-square w-full rounded ${intensityClass(
              c.coding,
            )} border border-ink-600`}
          >
            {c.dsaDone && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_5px_1px] shadow-accent" />
            )}
          </div>
          <span className="font-mono text-[10px] text-muted">{weekday(c.date)}</span>
        </div>
      ))}
    </div>
  );
}
