// Insights — the analytics layer. Trends, peak focus hours, DSA velocity,
// what you're neglecting, and habit consistency.

import { getInsights } from "@/lib/insights";
import { formatSeconds } from "@/lib/date";

export const dynamic = "force-dynamic";

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted">—</span>;
  const up = pct >= 0;
  return (
    <span className={up ? "text-accent" : "text-viz-rose"}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

export default async function InsightsPage() {
  const i = await getInsights();
  const maxHour = Math.max(1, ...i.hourly);
  const maxWeek = Math.max(1, ...i.dsaPerWeek);
  const maxProj = Math.max(1, ...i.topProjects.map((p) => p.seconds));

  const hourLabel = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "a" : "p"}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Insights</p>
        <h1 className="mt-1 text-2xl font-semibold">Your patterns, decoded</h1>
        <p className="mt-1 text-sm text-muted">Rolling 7-day windows · times in your timezone.</p>
      </div>

      {/* trend cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-4">
          <p className="label">Coding this week</p>
          <p className="stat mt-1">{formatSeconds(i.coding.thisWeek)}</p>
          <p className="mt-0.5 font-mono text-xs">vs last <Delta pct={i.coding.deltaPct} /></p>
        </div>
        <div className="card p-4">
          <p className="label">YouTube this week</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-viz-rose">{formatSeconds(i.youtube.thisWeek)}</p>
          <p className="mt-0.5 font-mono text-xs">vs last <Delta pct={i.youtube.deltaPct} /></p>
        </div>
        <div className="card p-4">
          <p className="label">DSA this week</p>
          <p className="stat mt-1">{i.dsaThisWeek}<span className="text-sm text-muted"> solved</span></p>
          <p className="mt-0.5 font-mono text-xs text-muted">+{i.customThisWeek} custom</p>
        </div>
        <div className="card p-4">
          <p className="label">Peak focus hour</p>
          <p className="stat mt-1">{i.peakHour === null ? "—" : hourLabel(i.peakHour)}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">most coding done</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* peak hours histogram */}
        <section className="panel p-5">
          <h2 className="section-title">When you code</h2>
          <p className="label mt-0.5">coding minutes by hour (last 30 days)</p>
          <div className="mt-4 flex h-32 items-end gap-0.5">
            {i.hourly.map((s, hr) => (
              <div key={hr} className="group flex flex-1 flex-col items-center justify-end" title={`${hourLabel(hr)}: ${formatSeconds(s)}`}>
                <div
                  className={`w-full rounded-sm ${hr === i.peakHour ? "bg-accent" : "bg-accent/40"} group-hover:bg-accent`}
                  style={{ height: `${(s / maxHour) * 100}%`, minHeight: s > 0 ? 2 : 0 }}
                />
                {hr % 6 === 0 && <span className="mt-1 font-mono text-[8px] text-muted">{hourLabel(hr)}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* DSA velocity */}
        <section className="panel p-5">
          <h2 className="section-title">DSA velocity</h2>
          <p className="label mt-0.5">problems solved per week (last 4 weeks)</p>
          <div className="mt-4 flex h-32 items-end gap-3">
            {i.dsaPerWeek.map((n, idx) => (
              <div key={idx} className="flex flex-1 flex-col items-center justify-end">
                <span className="mb-1 font-mono text-xs text-accent">{n}</span>
                <div className="w-full rounded-t bg-accent-grad" style={{ height: `${(n / maxWeek) * 100}%`, minHeight: n > 0 ? 4 : 0 }} />
                <span className="mt-1 font-mono text-[9px] text-muted">{idx === 3 ? "now" : `${4 - idx}w`}</span>
              </div>
            ))}
          </div>
        </section>

        {/* top projects */}
        <section className="panel p-5">
          <h2 className="section-title">Where your coding time goes</h2>
          <p className="label mt-0.5">top projects this week</p>
          <ul className="mt-4 space-y-2">
            {i.topProjects.length === 0 ? (
              <li className="text-sm text-muted">No coding tracked yet this week.</li>
            ) : (
              i.topProjects.map((p) => (
                <li key={p.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-200">{p.name}</span>
                    <span className="font-mono text-muted">{formatSeconds(p.seconds)}</span>
                  </div>
                  <div className="track mt-1 h-1.5">
                    <div className="track-fill" style={{ width: `${(p.seconds / maxProj) * 100}%` }} />
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* habit consistency + neglected */}
        <section className="panel p-5">
          <h2 className="section-title">Habit consistency</h2>
          <p className="label mt-0.5">last 30 days</p>
          <ul className="mt-4 space-y-2">
            {i.habitConsistency.length === 0 ? (
              <li className="text-sm text-muted">No habits yet.</li>
            ) : (
              i.habitConsistency.map((hbt) => (
                <li key={hbt.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-200">{hbt.name} <span className="text-muted">🔥{hbt.streak}</span></span>
                    <span className="font-mono text-muted">{hbt.pct}%</span>
                  </div>
                  <div className="track mt-1 h-1.5">
                    <div className="track-fill" style={{ width: `${hbt.pct}%` }} />
                  </div>
                </li>
              ))
            )}
          </ul>
          {i.neglectedSteps.length > 0 && (
            <div className="mt-4 border-t border-ink-600 pt-3">
              <p className="label text-viz-amber">Not started yet</p>
              <p className="mt-1 text-xs text-muted">
                {i.neglectedSteps.map((s) => `Step ${s.step}: ${s.name}`).join(" · ")}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
