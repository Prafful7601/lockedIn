// Dashboard home — the control room. Server component: fetches everything via
// getDashboardData() then lays it out. Interactive bits are client components.

import Link from "next/link";
import { getDashboardData } from "@/lib/data";
import { getFocusNudges } from "@/lib/insights";
import { prisma } from "@/lib/prisma";
import { todayKey, formatSeconds, currentHour, formatDayLabel } from "@/lib/date";
import CoachBanner from "@/components/CoachBanner";
import AgentBar from "@/components/AgentBar";
import Heatmap from "@/components/Heatmap";
import DashboardTasks from "@/components/DashboardTasks";

export const dynamic = "force-dynamic";

function greeting(): string {
  const h = currentHour();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late grind";
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "accent",
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  tone?: "accent" | "amber" | "rose" | "cyan";
}) {
  const toneColor = {
    accent: "text-accent",
    amber: "text-viz-amber",
    rose: "text-viz-rose",
    cyan: "text-viz-cyan",
  }[tone];
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className={`text-base ${toneColor}`}>{icon}</span>
      </div>
      <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${toneColor}`}>{value}</p>
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
  const nudges = await getFocusNudges();

  const toneClass = {
    accent: "border-accent/30 text-accent",
    amber: "border-viz-amber/30 text-viz-amber",
    rose: "border-viz-rose/30 text-viz-rose",
  } as const;

  const codingVsYt =
    d.weekTotals.youtube > 0
      ? (d.weekTotals.vscode / d.weekTotals.youtube).toFixed(1) + "×"
      : "∞";

  const todayDate = formatDayLabel();

  // a motivating one-liner based on real state
  const momentum = d.dsaTask.done
    ? "DSA locked in today. Stack the next win. 🔒"
    : d.dsaStreak.current > 0
      ? `Keep your ${d.dsaStreak.current}-day streak alive — today's problem is waiting. 🔥`
      : "Fresh start. One problem puts you on the board. ⚡";

  const sheetPct = d.roadmap.total ? Math.round((d.roadmap.covered / d.roadmap.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-800/60 bg-panel-grad p-6 shadow-card">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">{todayDate}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              {greeting()}. <span className="bg-accent-grad bg-clip-text text-transparent">Let&apos;s lock in.</span>
            </h1>
            <p className="mt-2 text-sm text-gray-300">{momentum}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="stat-grad text-4xl">{d.dsaStreak.current}</p>
              <p className="label mt-0.5">day streak 🔥</p>
            </div>
            <div className="h-12 w-px bg-ink-600" />
            <div className="text-center">
              <p className="font-mono text-4xl font-semibold tabular-nums text-gray-100">{sheetPct}<span className="text-lg text-muted">%</span></p>
              <p className="label mt-0.5">A2Z sheet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart focus nudges */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {nudges.map((n, idx) => (
          <div key={idx} className={`flex items-start gap-2 rounded-lg border bg-ink-800/50 p-3 ${toneClass[n.tone]}`}>
            <span className="text-base leading-none">{n.icon}</span>
            <p className="text-xs leading-snug text-gray-200">{n.text}</p>
          </div>
        ))}
      </div>

      {/* Jarvis command bar */}
      <AgentBar />

      {/* Coach briefing */}
      <CoachBanner apiKeyConfigured={apiKeyConfigured} briefing={cached?.content ?? null} />

      {/* Top stat row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon="⌨" label="Coding today" value={formatSeconds(d.todayTotals.vscode)} sub={`${formatSeconds(d.weekTotals.vscode)} this week`} tone="accent" />
        <StatCard icon="▶" label="YouTube today" value={formatSeconds(d.todayTotals.youtube)} sub={`${formatSeconds(d.weekTotals.youtube)} this week`} tone="rose" />
        <StatCard icon="◆" label="DSA streak" value={`${d.dsaStreak.current}d`} sub={`longest ${d.dsaStreak.longest}d`} tone="amber" />
        <StatCard icon="⚖" label="Code : YouTube" value={codingVsYt} sub="this week ratio" tone="cyan" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: today's work */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's DSA task */}
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title flex items-center gap-2"><span className="text-accent">◆</span> Today&apos;s DSA</h2>
              <Link href="/dsa" className="text-xs text-accent hover:underline">
                open tracker →
              </Link>
            </div>
            {d.dsaTask.exists ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill-accent">{d.dsaTask.topicName}</span>
                  <span className="pill uppercase">{d.dsaTask.difficulty}</span>
                  {d.dsaTask.done && <span className="pill-accent">✓ done</span>}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {d.dsaTask.problems.map((p) => (
                    <li key={p.title} className="text-sm text-gray-200">
                      <span className="text-accent">▹</span>{" "}
                      {p.url ? (
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
              <div className="mt-3 rounded-lg border border-dashed border-ink-600 p-4 text-center">
                <p className="text-sm text-muted">No task generated for today yet.</p>
                <Link href="/dsa" className="btn-accent mt-3 inline-flex">
                  Generate today&apos;s task →
                </Link>
              </div>
            )}
          </section>

          {/* Today's habits / recurring tasks */}
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title flex items-center gap-2"><span className="text-accent">✓</span> Today&apos;s tasks</h2>
              <Link href="/tasks" className="text-xs text-accent hover:underline">
                manage →
              </Link>
            </div>
            <div className="mt-3">
              <DashboardTasks habits={d.habits} />
            </div>
          </section>
        </div>

        {/* Right: heatmap + roadmap + health */}
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="section-title">7-day activity</h2>
            <p className="label mt-0.5">coding intensity · dot = DSA done</p>
            <div className="mt-4">
              <Heatmap cells={d.heat} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Striver A2Z sheet</h2>
              <span className="pill">{d.roadmap.covered}/{d.roadmap.total}</span>
            </div>
            <div className="track mt-3">
              <div className="track-fill" style={{ width: `${sheetPct}%` }} />
            </div>
            <Link href="/dsa" className="mt-2 inline-block text-xs text-accent hover:underline">
              open the sheet →
            </Link>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title flex items-center gap-2"><span className="text-viz-rose">♥</span> Health today</h2>
              <Link href="/health" className="text-xs text-accent hover:underline">
                log →
              </Link>
            </div>
            <ul className="mt-3 space-y-2.5">
              {d.healthToday.map((g) => {
                const pct = Math.min(100, (g.value / g.target) * 100);
                const hit = g.value >= g.target;
                return (
                  <li key={g.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{g.name} {hit && <span className="text-accent">✓</span>}</span>
                      <span className="font-mono text-muted">
                        {g.value}/{g.target} {g.unit}
                      </span>
                    </div>
                    <div className="track mt-1 h-1.5">
                      <div className="track-fill" style={{ width: `${pct}%` }} />
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
