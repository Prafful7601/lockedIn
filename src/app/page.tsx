// Dashboard home — the control room. Server component: fetches everything via
// getDashboardData() then lays it out. Interactive bits (habit checkboxes) are
// delegated to client components.

import Link from "next/link";
import { getDashboardData } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { todayKey, formatSeconds } from "@/lib/date";
import CoachBanner from "@/components/CoachBanner";
import Heatmap from "@/components/Heatmap";
import HabitChecklist from "@/components/HabitChecklist";

export const dynamic = "force-dynamic"; // always reflect the latest DB state

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="panel-raised p-4">
      <p className="label">{label}</p>
      <p className="stat mt-1">{value}</p>
      {sub && <p className="mt-0.5 font-mono text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const d = await getDashboardData();

  const apiKeyConfigured = !!process.env.GEMINI_API_KEY;
  const cached = await prisma.coachMessage.findUnique({
    where: { date_kind: { date: todayKey(), kind: "briefing" } },
  });

  const codingVsYt =
    d.weekTotals.youtube > 0
      ? (d.weekTotals.vscode / d.weekTotals.youtube).toFixed(2)
      : "∞";

  return (
    <div className="space-y-6">
      {/* Coach briefing at the very top */}
      <CoachBanner apiKeyConfigured={apiKeyConfigured} briefing={cached?.content ?? null} />

      {/* Top stat row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBlock
          label="Coding today"
          value={formatSeconds(d.todayTotals.vscode)}
          sub={`${formatSeconds(d.weekTotals.vscode)} this week`}
        />
        <StatBlock
          label="YouTube today"
          value={formatSeconds(d.todayTotals.youtube)}
          sub={`${formatSeconds(d.weekTotals.youtube)} this week`}
        />
        <StatBlock
          label="DSA streak"
          value={`${d.dsaStreak.current}d`}
          sub={`longest ${d.dsaStreak.longest}d`}
        />
        <StatBlock
          label="Code : YouTube"
          value={codingVsYt}
          sub="this week ratio"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: today's work */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's DSA task */}
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Today&apos;s DSA</h2>
              <Link href="/dsa" className="text-xs text-accent hover:underline">
                open tracker →
              </Link>
            </div>
            {d.dsaTask.exists ? (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-ink-600 px-2 py-0.5 font-mono text-xs text-accent">
                    {d.dsaTask.topicName}
                  </span>
                  <span className="font-mono text-xs uppercase text-muted">
                    {d.dsaTask.difficulty}
                  </span>
                  {d.dsaTask.done && (
                    <span className="font-mono text-xs text-accent">✓ done</span>
                  )}
                </div>
                <ul className="mt-3 space-y-1">
                  {d.dsaTask.problems.map((p) => (
                    <li key={p.title} className="text-sm text-gray-200">
                      • {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">
                          {p.title}
                        </a>
                      ) : (
                        p.title
                      )}{" "}
                      <span className="font-mono text-[10px] text-muted">({p.difficulty})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No task generated for today yet.{" "}
                <Link href="/dsa" className="text-accent hover:underline">
                  Generate one →
                </Link>
              </p>
            )}
          </section>

          {/* Today's habits / recurring tasks */}
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Today&apos;s tasks</h2>
              <Link href="/tasks" className="text-xs text-accent hover:underline">
                manage →
              </Link>
            </div>
            <div className="mt-3">
              <HabitChecklist habits={d.habits} />
            </div>
          </section>
        </div>

        {/* Right: heatmap + roadmap + health */}
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold">7-day activity</h2>
            <p className="label mt-0.5">coding intensity · dot = DSA done</p>
            <div className="mt-4">
              <Heatmap cells={d.heat} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Striver A2Z sheet</h2>
              <span className="font-mono text-xs text-muted">
                {d.roadmap.covered}/{d.roadmap.total}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${d.roadmap.total ? (d.roadmap.covered / d.roadmap.total) * 100 : 0}%` }}
              />
            </div>
            <Link href="/dsa" className="mt-2 inline-block text-xs text-accent hover:underline">
              open the sheet →
            </Link>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Health today</h2>
              <Link href="/health" className="text-xs text-accent hover:underline">
                log →
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {d.healthToday.map((g) => {
                const pct = Math.min(100, (g.value / g.target) * 100);
                return (
                  <li key={g.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{g.name}</span>
                      <span className="font-mono text-muted">
                        {g.value}/{g.target} {g.unit}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
